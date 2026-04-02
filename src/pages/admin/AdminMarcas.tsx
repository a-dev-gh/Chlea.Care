import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { adminFetch, adminInsert, adminUpdate, adminDelete } from '../../utils/adminApi';
import { SEED_BRANDS } from '../../data/seedData';
import { supabase } from '../../utils/supabase';
import type { Brand, BrandCategory } from '../../types/database';

// Seed fallback
function seedToBrands(): Brand[] {
  return SEED_BRANDS.map((b, i) => ({
    id: String(i + 1),
    name: b.name,
    slug: b.slug,
    tagline: b.tagline,
    logo_url: b.logo,
    is_premier: i < 6,
    category: 'hair' as BrandCategory,
    created_at: new Date().toISOString(),
  }));
}

const BRAND_CATEGORIES: { value: BrandCategory; label: string }[] = [
  { value: 'hair', label: 'Cabello' },
  { value: 'skincare', label: 'Skincare' },
  { value: 'accessories', label: 'Accesorios' },
  { value: 'mens', label: 'Hombres' },
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  border: '1.5px solid var(--border2)', borderRadius: 'var(--r-sm)',
  fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--text)', outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: 'var(--text-muted)', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: 1,
};

interface EditBrand {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  logo_url: string;
  is_premier: boolean;
  category: BrandCategory;
}

export function AdminMarcas() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditBrand | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadBrands = useCallback(async () => {
    setLoading(true);
    const data = await adminFetch<Brand>('brands', { orderBy: 'name' });
    setBrands(data.length > 0 ? data : seedToBrands());
    setLoading(false);
  }, []);

  useEffect(() => { loadBrands(); }, [loadBrands]);

  function openNew() {
    setEditing({ name: '', slug: '', tagline: '', logo_url: '', is_premier: false, category: 'hair' });
    setIsNew(true);
  }

  function openEdit(brand: Brand) {
    setEditing({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      tagline: brand.tagline,
      logo_url: brand.logo_url,
      is_premier: brand.is_premier,
      category: brand.category,
    });
    setIsNew(false);
  }

  async function handleSave() {
    if (!editing || !editing.name.trim()) return;
    setSaving(true);

    const slug = editing.slug || editing.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const payload = { ...editing, slug };

    if (supabase) {
      if (isNew) {
        const { id, ...rest } = payload;
        await adminInsert<Brand>('brands', rest as any);
      } else {
        const { id, ...rest } = payload;
        await adminUpdate<Brand>('brands', editing.id!, rest as any);
      }
      await loadBrands();
    } else {
      // Local fallback
      if (isNew) {
        const newBrand = { ...payload, id: String(Date.now()), created_at: new Date().toISOString() } as Brand;
        setBrands(prev => [...prev, newBrand]);
      } else {
        setBrands(prev => prev.map(b => b.id === editing.id ? { ...b, ...payload } as Brand : b));
      }
    }

    setSaving(false);
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (supabase) {
      const ok = await adminDelete('brands', id);
      if (ok) await loadBrands();
    } else {
      setBrands(prev => prev.filter(b => b.id !== id));
    }
    setConfirmDelete(null);
  }

  const premierCount = brands.filter(b => b.is_premier).length;

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando marcas...</div>;
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--text)' }}>Marcas</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            {brands.length} marca{brands.length !== 1 ? 's' : ''} · {premierCount} premier (max 6 en footer)
          </p>
        </div>
        <button onClick={openNew} style={{
          background: 'var(--hot)', color: '#fff',
          border: 'none', borderRadius: 'var(--r-pill)',
          padding: '10px 22px', fontSize: 14, fontWeight: 600,
          fontFamily: 'var(--font-body)', cursor: 'pointer',
        }}>
          + Nueva Marca
        </button>
      </div>

      {/* Brands table */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--cream)' }}>
              {['Marca', 'Slug', 'Categoria', 'Premier', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'left' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {brands.map((b, i) => (
              <tr key={b.id} style={{
                borderBottom: i < brands.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(235,25,130,0.03)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {b.logo_url ? (
                      <img src={b.logo_url} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'contain', background: '#fff' }} />
                    ) : (
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: 'linear-gradient(135deg,var(--pink),#ffd6e7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600,
                        color: 'var(--hot)', fontStyle: 'italic',
                      }}>
                        {b.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{b.name}</span>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.tagline}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  /marcas/{b.slug}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-soft)', textTransform: 'capitalize' }}>
                  {BRAND_CATEGORIES.find(c => c.value === b.category)?.label ?? b.category}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px',
                    borderRadius: 'var(--r-pill)',
                    fontSize: 11, fontWeight: 600,
                    background: b.is_premier ? 'rgba(235,25,130,0.1)' : 'var(--cream)',
                    color: b.is_premier ? 'var(--hot)' : 'var(--text-muted)',
                  }}>
                    {b.is_premier ? 'Premier' : 'Standard'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(b)} style={{
                      padding: '5px 12px', borderRadius: 'var(--r-sm)',
                      border: '1px solid var(--border2)', background: 'none',
                      fontSize: 12, fontWeight: 600, color: 'var(--text-soft)',
                      cursor: 'pointer', fontFamily: 'var(--font-body)',
                    }}>
                      Editar
                    </button>
                    <button onClick={() => setConfirmDelete(b.id)} style={{
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

      {/* Delete Confirmation */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth={400}>
        <div style={{ padding: 28, textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, marginBottom: 12 }}>
            Eliminar marca
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
            Esta accion eliminara la marca permanentemente.
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

      {/* Edit/Create Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} maxWidth={500}>
        {editing && (
          <div style={{ padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, marginBottom: 24 }}>
              {isNew ? 'Nueva Marca' : 'Editar Marca'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Nombre</label>
                <input
                  type="text" value={editing.name}
                  onChange={e => setEditing({ ...editing, name: e.target.value })}
                  placeholder="Ej: Alfaparf Milano"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Tagline</label>
                <input
                  type="text" value={editing.tagline}
                  onChange={e => setEditing({ ...editing, tagline: e.target.value })}
                  placeholder="Descripcion corta de la marca"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>URL del Logo</label>
                <input
                  type="text" value={editing.logo_url}
                  onChange={e => setEditing({ ...editing, logo_url: e.target.value })}
                  placeholder="https://... o /brand logos/..."
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Categoria</label>
                <select
                  value={editing.category}
                  onChange={e => setEditing({ ...editing, category: e.target.value as BrandCategory })}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {BRAND_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: 'var(--text-soft)' }}>
                <input
                  type="checkbox"
                  checked={editing.is_premier || false}
                  onChange={e => setEditing({ ...editing, is_premier: e.target.checked })}
                  style={{ accentColor: 'var(--hot)', width: 16, height: 16 }}
                />
                Marca Premier (aparece en el footer, maximo 6)
              </label>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <Button onClick={handleSave} disabled={saving} fullWidth>
                  {saving ? 'Guardando...' : isNew ? 'Crear Marca' : 'Guardar cambios'}
                </Button>
                <Button onClick={() => setEditing(null)} variant="outline" fullWidth>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
