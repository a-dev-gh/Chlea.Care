import { useState, useEffect, useCallback, useMemo } from 'react';
import { showToast } from '../../components/ui/Toast';
import { formatPrice } from '../../utils/formatPrice';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { adminFetch, adminInsert, adminUpdate, adminDelete } from '../../utils/adminApi';
import { SEED_BRANDS } from '../../data/seedData';
import { supabase } from '../../utils/supabase';
import type { Product, Brand, LabelGroup, BadgeEntry } from '../../types/database';

function seedToBrands(): Brand[] {
  return SEED_BRANDS.map((b, i) => ({
    id: String(i + 1),
    name: b.name,
    slug: b.slug,
    tagline: b.tagline,
    logo_url: b.logo,
    is_premier: i < 6,
    category: 'hair' as Brand['category'],
    created_at: new Date().toISOString(),
  }));
}

const CATEGORIES = [
  { value: 'cabello', label: 'Cabello' },
  { value: 'skincare', label: 'Skincare' },
  { value: 'accesorios', label: 'Accesorios' },
  { value: 'hombres', label: 'Hombres' },
];

// Badge options are now loaded from the DB (badges table)

const EMPTY_PRODUCT: Partial<Product> = {
  name: '',
  price: 0,
  category: 'cabello',
  badge: '',
  is_hot: false,
  sale_percent: 0,
  description: '',
  brand_slug: null,
  image_url: '',
  image_urls: [],
  is_visible: true,
  is_in_stock: true,
  is_by_request: false,
  labels: {},
};

// Shared input style
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  border: '1.5px solid var(--border2)', borderRadius: 'var(--r-sm)',
  fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--text)',
  outline: 'none', background: 'var(--white)',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: 'var(--text-muted)', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: 1,
};

// Small thumbnail for image previews
function ImageThumb({ url, size = 64 }: { url: string; size?: number }) {
  if (!url) return null;
  return (
    <img
      src={url}
      alt=""
      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      style={{
        width: size, height: size,
        borderRadius: 8, objectFit: 'cover',
        border: '1.5px solid var(--border)',
        display: 'block', flexShrink: 0,
        marginTop: 8,
      }}
    />
  );
}

const ITEMS_PER_PAGE = 20;

export function AdminProductos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [labelGroups, setLabelGroups] = useState<LabelGroup[]>([]);
  const [badges, setBadges] = useState<BadgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Search / filter / pagination state
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [page, setPage] = useState(1);

  // Fetch products, brands, and label groups
  const loadData = useCallback(async () => {
    setLoading(true);
    const [prods, brnds, groups, bdgs] = await Promise.all([
      adminFetch<Product>('products', { orderBy: 'created_at', ascending: false }),
      adminFetch<Brand>('brands', { orderBy: 'name' }),
      adminFetch<LabelGroup>('label_groups', { orderBy: 'sort_order' }),
      adminFetch<BadgeEntry>('badges', { orderBy: 'sort_order' }),
    ]);
    setProducts(prods);
    setBrands(brnds.length > 0 ? brnds : seedToBrands());
    setLabelGroups(groups);
    setBadges(bdgs);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Filtered list derived from search + category
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.brand_slug ?? '').toLowerCase().includes(q);
      const matchCat = !filterCat || p.category === filterCat;
      return matchSearch && matchCat;
    });
  }, [products, search, filterCat]);

  // Current page slice
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Reset to page 1 whenever search or filter changes
  useEffect(() => { setPage(1); }, [search, filterCat]);

  // Open create modal
  function openNew() {
    setEditing({ ...EMPTY_PRODUCT, image_urls: [] });
    setIsNew(true);
    setErrors({});
  }

  // Open edit modal
  function openEdit(product: Product) {
    setEditing({ ...product, image_urls: product.image_urls ?? [] });
    setIsNew(false);
    setErrors({});
  }

  // Save (create or update) — image_urls is now included in the payload
  async function handleSave() {
    if (!editing) return;

    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!editing.name?.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!editing.price || editing.price < 1) newErrors.price = 'El precio debe ser mayor a 0';
    if ((editing.sale_percent ?? 0) < 0 || (editing.sale_percent ?? 0) > 100) newErrors.sale_percent = 'El descuento debe ser entre 0 y 100';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});

    setSaving(true);

    if (supabase) {
      if (isNew) {
        const { id, created_at, ...dbData } = editing as any;
        const { error } = await adminInsert<Product>('products', dbData);
        if (error) { showToast('Error al guardar: ' + error, 'error'); } else { await loadData(); showToast('Producto creado', 'success'); }
      } else {
        const { id, created_at, ...dbData } = editing as any;
        const { error } = await adminUpdate<Product>('products', editing.id as string, dbData);
        if (error) { showToast('Error al guardar: ' + error, 'error'); } else { await loadData(); showToast('Producto actualizado', 'success'); }
      }
    } else {
      // Local-only fallback: update state directly
      if (isNew) {
        const newProd = { ...editing, id: String(Date.now()), created_at: new Date().toISOString() } as Product;
        setProducts(prev => [newProd, ...prev]);
        showToast('Producto creado', 'success');
      } else {
        setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, ...editing } as Product : p));
        showToast('Producto actualizado', 'success');
      }
    }

    setSaving(false);
    setEditing(null);
  }

  // Delete
  async function handleDelete(id: string) {
    if (supabase) {
      const { ok, error } = await adminDelete('products', id);
      if (error) { showToast('Error al eliminar: ' + error, 'error'); }
      if (ok) { await loadData(); showToast('Producto eliminado', 'success'); }
    } else {
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Producto eliminado', 'success');
    }
    setConfirmDelete(null);
  }

  // Toggle visibility inline
  async function toggleVisible(product: Product) {
    const updated = { ...product, is_visible: !product.is_visible };
    if (supabase) {
      const { error } = await adminUpdate<Product>('products', product.id, { is_visible: updated.is_visible } as any);
      if (error) { showToast('Error: ' + error, 'error'); } else { showToast(updated.is_visible ? 'Producto visible' : 'Producto oculto', 'info'); }
      await loadData();
    } else {
      setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
      showToast(updated.is_visible ? 'Producto visible' : 'Producto oculto', 'info');
    }
  }

  // Gallery image helpers
  function addGallerySlot() {
    if (!editing) return;
    const urls = editing.image_urls ?? [];
    if (urls.length >= 6) return;
    setEditing({ ...editing, image_urls: [...urls, ''] });
  }

  function updateGalleryImage(index: number, value: string) {
    if (!editing) return;
    const urls = [...(editing.image_urls ?? [])];
    urls[index] = value;
    setEditing({ ...editing, image_urls: urls });
  }

  function removeGalleryImage(index: number) {
    if (!editing) return;
    const urls = (editing.image_urls ?? []).filter((_, i) => i !== index);
    setEditing({ ...editing, image_urls: urls });
  }

  // Promote a gallery image to the main image_url (swap)
  function promoteGalleryImage(index: number) {
    if (!editing) return;
    const urls = [...(editing.image_urls ?? [])];
    const promoted = urls[index];
    const currentMain = editing.image_url ?? '';
    // Put current main into that gallery slot (swap), or just remove it
    urls[index] = currentMain;
    setEditing({ ...editing, image_url: promoted, image_urls: urls });
  }

  // Label checkbox helpers
  function isLabelChecked(groupName: string, value: string): boolean {
    const current = editing?.labels ?? {};
    return (current[groupName] ?? []).includes(value);
  }

  function toggleLabel(groupName: string, value: string) {
    if (!editing) return;
    const current: Record<string, string[]> = { ...(editing.labels ?? {}) };
    const groupValues = [...(current[groupName] ?? [])];
    const idx = groupValues.indexOf(value);
    if (idx === -1) {
      groupValues.push(value);
    } else {
      groupValues.splice(idx, 1);
    }
    // Exclude group entirely if no values selected
    if (groupValues.length === 0) {
      delete current[groupName];
    } else {
      current[groupName] = groupValues;
    }
    setEditing({ ...editing, labels: current });
  }

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
        Cargando productos...
      </div>
    );
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--text)' }}>Productos</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{products.length} productos</p>
        </div>
        <button onClick={openNew} style={{
          background: 'var(--hot)', color: '#fff',
          border: 'none', borderRadius: 'var(--r-pill)',
          padding: '10px 22px', fontSize: 14, fontWeight: 600,
          fontFamily: 'var(--font-body)', cursor: 'pointer',
        }}>
          + Nuevo Producto
        </button>
      </div>

      {/* Search + filter controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o marca..."
          style={{
            flex: 1, minWidth: 200, padding: '9px 14px',
            border: '1.5px solid var(--border2)', borderRadius: 'var(--r-sm)',
            fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--text)',
            outline: 'none', background: 'var(--white)',
          }}
        />
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          style={{
            padding: '9px 14px', border: '1.5px solid var(--border2)',
            borderRadius: 'var(--r-sm)', fontSize: 14,
            fontFamily: 'var(--font-body)', color: 'var(--text)',
            outline: 'none', background: 'var(--white)', cursor: 'pointer',
          }}
        >
          <option value="">Todas las categorias</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Products table */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--cream)' }}>
              {['Producto', 'Categoría', 'Precio', 'Badge', 'Oferta', 'Visible', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'left' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((p, i) => (
              <tr key={p.id} style={{
                borderBottom: i < paginated.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(235,25,130,0.03)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {p.image_url ? (
                      <img src={p.image_url} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{
                        width: 40, height: 40, borderRadius: 8,
                        background: 'linear-gradient(135deg,#ffd6e7,#ffb3cb)',
                        flexShrink: 0,
                      }} />
                    )}
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{p.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.brand_slug || '—'}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-soft)', textTransform: 'capitalize' }}>
                  {p.category}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: 'var(--hot)' }}>
                  {formatPrice(p.price)}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {p.badge && <Badge text={p.badge} />}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: p.sale_percent > 0 ? 'var(--hot)' : 'var(--text-muted)' }}>
                  {p.sale_percent > 0 ? `${p.sale_percent}%` : '—'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div
                    onClick={() => toggleVisible(p)}
                    style={{
                      width: 36, height: 20, borderRadius: 10,
                      background: p.is_visible ? 'var(--hot)' : 'var(--border2)',
                      position: 'relative', cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 2,
                      left: p.is_visible ? 18 : 2,
                      width: 16, height: 16, borderRadius: '50%',
                      background: '#fff', transition: 'left 0.2s',
                    }} />
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(p)} style={{
                      padding: '5px 12px', borderRadius: 'var(--r-sm)',
                      border: '1px solid var(--border2)', background: 'none',
                      fontSize: 12, fontWeight: 600, color: 'var(--text-soft)',
                      cursor: 'pointer', fontFamily: 'var(--font-body)',
                    }}>
                      Editar
                    </button>
                    <button onClick={() => setConfirmDelete(p.id)} style={{
                      padding: '5px 12px', borderRadius: 'var(--r-sm)',
                      border: '1px solid rgba(239,68,68,0.3)', background: 'none',
                      fontSize: 12, fontWeight: 600, color: '#ef4444',
                      cursor: 'pointer', fontFamily: 'var(--font-body)',
                    }}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 20 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '7px 16px', borderRadius: 'var(--r-sm)',
              border: '1.5px solid var(--border2)', background: 'var(--white)',
              fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
              color: page === 1 ? 'var(--text-muted)' : 'var(--text)',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Anterior
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: '7px 16px', borderRadius: 'var(--r-sm)',
              border: '1.5px solid var(--border2)', background: 'var(--white)',
              fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
              color: page === totalPages ? 'var(--text-muted)' : 'var(--text)',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth={400}>
        <div style={{ padding: 28, textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, marginBottom: 12 }}>
            Eliminar producto
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
            Esta acción no se puede deshacer. El producto será eliminado permanentemente.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button onClick={() => confirmDelete && handleDelete(confirmDelete)} style={{ background: '#ef4444' }} fullWidth>
              Eliminar
            </Button>
            <Button onClick={() => setConfirmDelete(null)} variant="outline" fullWidth>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create / Edit Modal — 880px wide, 2-column grid */}
      <Modal open={!!editing} onClose={() => setEditing(null)} maxWidth={880}>
        {editing && (
          <div style={{ padding: 28 }}>
            {/* Responsive grid CSS */}
            <style>{`@media (max-width: 680px) { .product-form-grid { grid-template-columns: 1fr !important; } }`}</style>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, marginBottom: 24 }}>
              {isNew ? 'Nuevo Producto' : 'Editar Producto'}
            </h3>

            <div
              className="product-form-grid"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}
            >
              {/* ── LEFT COLUMN: name, price/sale, category/brand, badge, description ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Name */}
                <div>
                  <label style={labelStyle}>Nombre</label>
                  <input
                    value={editing.name || ''}
                    onChange={e => setEditing({ ...editing, name: e.target.value })}
                    placeholder="Ej: OI All In One Milk"
                    style={{ ...inputStyle, borderColor: errors.name ? '#d32f2f' : undefined }}
                  />
                  {errors.name && <p style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
                </div>

                {/* Price + Sale */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Precio (RD$)</label>
                    <input
                      type="number" min={1}
                      value={editing.price || 0}
                      onChange={e => setEditing({ ...editing, price: Number(e.target.value) })}
                      style={{ ...inputStyle, borderColor: errors.price ? '#d32f2f' : undefined }}
                    />
                    {errors.price && <p style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{errors.price}</p>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Descuento (%)</label>
                    <input
                      type="number" min={0} max={100}
                      value={editing.sale_percent || 0}
                      onChange={e => setEditing({ ...editing, sale_percent: Number(e.target.value) })}
                      style={{ ...inputStyle, borderColor: errors.sale_percent ? '#d32f2f' : undefined }}
                    />
                    {errors.sale_percent && <p style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{errors.sale_percent}</p>}
                  </div>
                </div>

                {/* Category + Brand */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Categoría</label>
                    <select
                      value={editing.category || 'cabello'}
                      onChange={e => setEditing({ ...editing, category: e.target.value as Product['category'] })}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Marca</label>
                    <select
                      value={editing.brand_slug || ''}
                      onChange={e => setEditing({ ...editing, brand_slug: e.target.value || null })}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="">Sin marca</option>
                      {brands.map(b => (
                        <option key={b.slug} value={b.slug}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Badge — friendly dropdown */}
                <div>
                  <label style={labelStyle}>Badge</label>
                  <select
                    value={editing.badge || ''}
                    onChange={e => setEditing({ ...editing, badge: e.target.value })}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">Sin badge</option>
                    {badges.map(b => (
                      <option key={b.id} value={b.name}>{b.emoji} {b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={labelStyle}>Descripción</label>
                  <textarea
                    value={editing.description || ''}
                    onChange={e => setEditing({ ...editing, description: e.target.value })}
                    rows={6}
                    placeholder="Descripción del producto..."
                    style={{ ...inputStyle, resize: 'vertical', flex: 1 }}
                  />
                </div>

              </div>

              {/* ── RIGHT COLUMN: images, toggles, labels ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Main image URL + thumbnail */}
                <div>
                  <label style={labelStyle}>Imagen principal (URL)</label>
                  <input
                    value={editing.image_url || ''}
                    onChange={e => setEditing({ ...editing, image_url: e.target.value })}
                    placeholder="https://..."
                    style={inputStyle}
                  />
                  {editing.image_url && (
                    <ImageThumb url={editing.image_url} size={64} />
                  )}
                </div>

                {/* Gallery images + thumbnails + star-promote button */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Galeria de imagenes (max 6)</label>
                    {(editing.image_urls?.length ?? 0) < 6 && (
                      <button onClick={addGallerySlot} style={{
                        padding: '3px 10px', borderRadius: 'var(--r-pill)',
                        border: '1px solid var(--hot)', background: 'rgba(235,25,130,0.06)',
                        color: 'var(--hot)', fontSize: 11, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                      }}>
                        + Imagen
                      </button>
                    )}
                  </div>
                  {(editing.image_urls ?? []).map((url, idx) => (
                    <div key={idx} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          value={url}
                          onChange={e => updateGalleryImage(idx, e.target.value)}
                          placeholder={`URL imagen ${idx + 1}`}
                          style={{ ...inputStyle, flex: 1 }}
                        />
                        {/* Star button: promotes this gallery image to the main slot */}
                        <button
                          onClick={() => promoteGalleryImage(idx)}
                          title="Usar como imagen principal"
                          style={{
                            background: 'none',
                            border: '1px solid var(--border2)',
                            borderRadius: 'var(--r-sm)',
                            color: url && url === editing.image_url ? 'var(--hot)' : 'var(--text-muted)',
                            padding: '0 10px', cursor: 'pointer', fontSize: 17,
                            lineHeight: '36px', height: 38,
                          }}
                        >
                          {url && url === editing.image_url ? '★' : '☆'}
                        </button>
                        {/* Remove button */}
                        <button onClick={() => removeGalleryImage(idx)} style={{
                          background: 'none', border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: 'var(--r-sm)', color: '#ef4444',
                          padding: '0 10px', cursor: 'pointer', fontSize: 16,
                          lineHeight: '36px', height: 38,
                        }}>
                          ×
                        </button>
                      </div>
                      {/* Gallery thumbnail */}
                      {url && <ImageThumb url={url} size={48} />}
                    </div>
                  ))}
                </div>

                {/* Toggles row — hot, visible, in_stock, by_request */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-soft)' }}>
                    <input
                      type="checkbox"
                      checked={editing.is_hot || false}
                      onChange={e => setEditing({ ...editing, is_hot: e.target.checked })}
                      style={{ accentColor: 'var(--hot)', width: 16, height: 16 }}
                    />
                    Trending / Hot
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-soft)' }}>
                    <input
                      type="checkbox"
                      checked={editing.is_visible ?? true}
                      onChange={e => setEditing({ ...editing, is_visible: e.target.checked })}
                      style={{ accentColor: 'var(--hot)', width: 16, height: 16 }}
                    />
                    Visible en tienda
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-soft)' }}>
                    <input
                      type="checkbox"
                      checked={editing.is_in_stock ?? true}
                      onChange={e => setEditing({ ...editing, is_in_stock: e.target.checked })}
                      style={{ accentColor: 'var(--hot)', width: 16, height: 16 }}
                    />
                    En stock
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-soft)' }}>
                    <input
                      type="checkbox"
                      checked={editing.is_by_request ?? false}
                      onChange={e => setEditing({ ...editing, is_by_request: e.target.checked })}
                      style={{ accentColor: 'var(--hot)', width: 16, height: 16 }}
                    />
                    Por Pedido
                  </label>
                </div>

                {/* Visual label picker — checkbox-based, replaces JSON textarea */}
                <div>
                  <label style={labelStyle}>Etiquetas para filtros</label>
                  {labelGroups.length === 0 ? (
                    <p style={{
                      fontSize: 13, color: 'var(--text-muted)',
                      background: 'var(--cream)', borderRadius: 'var(--r-sm)',
                      padding: '12px 14px', lineHeight: 1.5,
                    }}>
                      No hay etiquetas creadas. Ve a <strong>Etiquetas</strong> para crear grupos.
                    </p>
                  ) : (
                    <>
                      {/* Show group count when there are many groups */}
                      {labelGroups.length > 3 && (
                        <p style={{
                          fontSize: 12, color: 'var(--text-muted)', marginBottom: 6,
                          fontStyle: 'italic',
                        }}>
                          {labelGroups.length} grupos de etiquetas
                        </p>
                      )}
                      <div style={{
                        border: '1.5px solid var(--border2)', borderRadius: 'var(--r-sm)',
                        background: 'var(--white)',
                      }}>
                        {/* Scroll container — limits height when there are many label groups */}
                        <div style={{ maxHeight: 280, overflowY: 'auto', borderRadius: 'var(--r-sm)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                          {labelGroups.map(group => (
                            <div key={group.id}>
                              {/* Group name header */}
                              <p style={{
                                fontSize: 12, fontWeight: 700, color: 'var(--deep)',
                                textTransform: 'uppercase', letterSpacing: 0.8,
                                marginBottom: 8,
                              }}>
                                {group.name}
                              </p>
                              {/* Checkbox grid for group values */}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
                                {group.values.map(val => (
                                  <label
                                    key={val}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: 6,
                                      cursor: 'pointer', fontSize: 13, color: 'var(--text-soft)',
                                      userSelect: 'none',
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isLabelChecked(group.name, val)}
                                      onChange={() => toggleLabel(group.name, val)}
                                      style={{ accentColor: 'var(--hot)', width: 15, height: 15 }}
                                    />
                                    {val}
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>

            {/* Actions — full width below the grid */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <Button onClick={handleSave} disabled={saving} fullWidth>
                {saving ? 'Guardando...' : isNew ? 'Crear Producto' : 'Guardar cambios'}
              </Button>
              <Button onClick={() => setEditing(null)} variant="outline" fullWidth>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
