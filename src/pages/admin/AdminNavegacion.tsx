import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/Button';
import { adminFetch, adminDeleteWhere, adminBulkInsert, adminUpsertSettings } from '../../utils/adminApi';
import { SEED_NAV_DROPDOWNS } from '../../data/seedData';
import { supabase } from '../../utils/supabase';
import { fetchSettings } from '../../utils/db';
import type { NavDropdown } from '../../types/database';

const MAX_ITEMS = 5;

// Badge options for the promo slot badge picker
const BADGE_OPTIONS = ['Vegano', 'Sin Crueldad', 'Nuevo', 'Bestseller', 'Top Rated', 'Viral'];

// Filter type options for the promo nav slot
type PromoFilterType = 'ofertas' | 'badge' | 'custom';

const CATEGORY_NAMES: Record<string, string> = {
  cabello: 'Cabello',
  skincare: 'Skincare',
  accesorios: 'Accesorios',
  marcas: 'Marcas',
  ofertas: 'Ofertas',
};

// Convert seed data to NavDropdown shape
function seedToGrouped(): Record<string, NavDropdown[]> {
  const result: Record<string, NavDropdown[]> = {};
  for (const [slug, items] of Object.entries(SEED_NAV_DROPDOWNS)) {
    result[slug] = items.map((item, i) => ({
      id: `${slug}-${i}`,
      category_slug: slug,
      label: item.label,
      href: item.href,
      sort_order: i,
    }));
  }
  return result;
}

export function AdminNavegacion() {
  const [dropdowns, setDropdowns] = useState<Record<string, NavDropdown[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // Promo nav slot state
  const [promoName, setPromoName]           = useState('');
  const [promoEmoji, setPromoEmoji]         = useState('');
  const [promoFilterType, setPromoFilterType] = useState<PromoFilterType>('ofertas');
  const [promoBadge, setPromoBadge]         = useState(BADGE_OPTIONS[0]);
  const [promoCustomUrl, setPromoCustomUrl] = useState('');
  const [promoSaving, setPromoSaving]       = useState(false);
  const [promoFeedback, setPromoFeedback]   = useState('');

  // Compute the resulting href from current promo fields
  function computePromoHref(): string {
    if (promoFilterType === 'ofertas') return '/catalogo?oferta=true';
    if (promoFilterType === 'badge')   return `/catalogo?badge=${encodeURIComponent(promoBadge)}`;
    return promoCustomUrl || '/catalogo';
  }

  const loadDropdowns = useCallback(async () => {
    setLoading(true);

    // Load nav dropdowns
    const data = await adminFetch<NavDropdown>('nav_dropdowns', { orderBy: 'sort_order' });
    if (data.length > 0) {
      const grouped: Record<string, NavDropdown[]> = {};
      for (const row of data) {
        if (!grouped[row.category_slug]) grouped[row.category_slug] = [];
        grouped[row.category_slug].push(row);
      }
      setDropdowns(grouped);
    } else {
      setDropdowns(seedToGrouped());
    }

    // Load existing promo nav settings
    const settings = await fetchSettings();
    if (settings.promo_nav_name)  setPromoName(settings.promo_nav_name);
    if (settings.promo_nav_emoji) setPromoEmoji(settings.promo_nav_emoji);
    if (settings.promo_nav_href) {
      const href = settings.promo_nav_href;
      if (href.includes('oferta=true'))          setPromoFilterType('ofertas');
      else if (href.includes('badge='))          {
        setPromoFilterType('badge');
        const m = href.match(/badge=([^&]+)/);
        if (m) setPromoBadge(decodeURIComponent(m[1]));
      } else {
        setPromoFilterType('custom');
        setPromoCustomUrl(href);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => { loadDropdowns(); }, [loadDropdowns]);

  function updateItem(cat: string, index: number, field: 'label' | 'href', value: string) {
    setDropdowns(prev => {
      const next = { ...prev };
      next[cat] = [...next[cat]];
      next[cat][index] = { ...next[cat][index], [field]: value };
      return next;
    });
  }

  function removeItem(cat: string, index: number) {
    setDropdowns(prev => {
      const next = { ...prev };
      next[cat] = next[cat].filter((_, i) => i !== index);
      return next;
    });
  }

  function addItem(cat: string) {
    if ((dropdowns[cat]?.length || 0) >= MAX_ITEMS) return;
    setDropdowns(prev => {
      const next = { ...prev };
      if (!next[cat]) next[cat] = [];
      next[cat] = [...next[cat], {
        id: `new-${Date.now()}`,
        category_slug: cat,
        label: '',
        href: '/catalogo',
        sort_order: next[cat].length,
      }];
      return next;
    });
  }

  function moveItem(cat: string, index: number, dir: -1 | 1) {
    const items = dropdowns[cat];
    if (!items) return;
    const newIdx = index + dir;
    if (newIdx < 0 || newIdx >= items.length) return;
    setDropdowns(prev => {
      const next = { ...prev };
      const arr = [...next[cat]];
      [arr[index], arr[newIdx]] = [arr[newIdx], arr[index]];
      next[cat] = arr;
      return next;
    });
  }

  async function handlePromoSave() {
    setPromoSaving(true);
    setPromoFeedback('');
    const ok = await adminUpsertSettings({
      promo_nav_name:  promoName.trim(),
      promo_nav_href:  computePromoHref(),
      promo_nav_emoji: promoEmoji.trim(),
    });
    setPromoFeedback(ok ? 'Link promocional guardado' : 'Error al guardar');
    setPromoSaving(false);
    setTimeout(() => setPromoFeedback(''), 3000);
  }

  async function handleSave() {
    setSaving(true);
    setFeedback('');

    if (supabase) {
      // For each category: delete existing, then insert new rows with sort_order
      let success = true;
      for (const [cat, items] of Object.entries(dropdowns)) {
        // Delete all existing for this category
        const { error: delError } = await adminDeleteWhere('nav_dropdowns', 'category_slug', cat);
        if (delError) { success = false; break; }

        // Insert new rows with correct sort_order
        if (items.length > 0) {
          const rows = items.map((item, i) => ({
            category_slug: cat,
            label: item.label,
            href: item.href,
            sort_order: i,
          }));
          const { data: inserted, error: insError } = await adminBulkInsert('nav_dropdowns', rows);
          if (insError || (inserted.length === 0 && rows.length > 0)) success = false;
        }
      }

      if (success) {
        setFeedback('Navegacion guardada');
        await loadDropdowns();
      } else {
        setFeedback('Error al guardar algunos cambios');
      }
    } else {
      setFeedback('Navegacion guardada (modo local)');
    }

    setSaving(false);
    setTimeout(() => setFeedback(''), 3000);
  }

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando navegacion...</div>;
  }

  return (
    <div style={{ padding: 32, maxWidth: 800 }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400,
        color: 'var(--text)', marginBottom: 8,
      }}>
        Navegacion
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
        Configura los submenus que aparecen en la barra de categorias (la barra marron).
        Maximo {MAX_ITEMS} elementos por categoria.
      </p>

      {/* ── Promo nav slot ────────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(235,25,130,0.04)',
        border: '1.5px solid rgba(235,25,130,0.2)',
        borderRadius: 'var(--r-md)',
        padding: 24,
        marginBottom: 36,
      }}>
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
          color: 'var(--hot)', textTransform: 'uppercase', marginBottom: 16,
        }}>
          Link Promocional
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 20, lineHeight: 1.5 }}>
          Aparece como el 4to enlace en el menu movil y como un boton rosa en el menu de escritorio.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          {/* Nombre */}
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Nombre
            </label>
            <input
              value={promoName}
              onChange={e => setPromoName(e.target.value)}
              placeholder="Ej: Ofertas"
              maxLength={24}
              style={{
                width: '100%', padding: '9px 12px', fontSize: 13,
                border: '1.5px solid var(--border2)', borderRadius: 'var(--r-sm)',
                fontFamily: 'var(--font-body)', color: 'var(--text)',
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--hot)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border2)')}
            />
          </div>

          {/* Emoji */}
          <div style={{ width: 80 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Emoji
            </label>
            <input
              value={promoEmoji}
              onChange={e => setPromoEmoji(e.target.value.slice(0, 2))}
              placeholder="🔥"
              style={{
                width: '100%', padding: '9px 12px', fontSize: 18, textAlign: 'center',
                border: '1.5px solid var(--border2)', borderRadius: 'var(--r-sm)',
                fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--hot)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border2)')}
            />
          </div>

          {/* Filter type */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Tipo de filtro
            </label>
            <select
              value={promoFilterType}
              onChange={e => setPromoFilterType(e.target.value as PromoFilterType)}
              style={{
                width: '100%', padding: '9px 12px', fontSize: 13,
                border: '1.5px solid var(--border2)', borderRadius: 'var(--r-sm)',
                fontFamily: 'var(--font-body)', color: 'var(--text)',
                background: 'var(--white)', outline: 'none', cursor: 'pointer',
                boxSizing: 'border-box',
              }}
            >
              <option value="ofertas">Productos en oferta</option>
              <option value="badge">Badge especifico</option>
              <option value="custom">Link personalizado</option>
            </select>
          </div>
        </div>

        {/* Secondary input — badge picker or custom URL */}
        {promoFilterType === 'badge' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Badge
            </label>
            <select
              value={promoBadge}
              onChange={e => setPromoBadge(e.target.value)}
              style={{
                padding: '9px 12px', fontSize: 13,
                border: '1.5px solid var(--border2)', borderRadius: 'var(--r-sm)',
                fontFamily: 'var(--font-body)', color: 'var(--text)',
                background: 'var(--white)', outline: 'none', cursor: 'pointer',
              }}
            >
              {BADGE_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        )}

        {promoFilterType === 'custom' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              URL personalizada
            </label>
            <input
              value={promoCustomUrl}
              onChange={e => setPromoCustomUrl(e.target.value)}
              placeholder="/catalogo?..."
              style={{
                width: '100%', padding: '9px 12px', fontSize: 13,
                border: '1.5px solid var(--border2)', borderRadius: 'var(--r-sm)',
                fontFamily: 'var(--font-body)', color: 'var(--text-soft)',
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--hot)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border2)')}
            />
          </div>
        )}

        {/* Live preview */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 16px',
          background: 'rgba(235,25,130,0.06)',
          borderRadius: 'var(--r-sm)',
          marginBottom: 16,
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Vista previa:</span>
          {/* Pill preview */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--hot)', color: '#fff',
            borderRadius: 'var(--r-pill)', padding: '6px 16px',
            fontSize: 13, fontWeight: 600,
            fontFamily: 'var(--font-body)',
          }}>
            {promoEmoji} {promoName || 'Nombre'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>→</span>
          <code style={{ fontSize: 12, color: 'var(--hot)', background: 'rgba(235,25,130,0.08)', padding: '3px 8px', borderRadius: 4 }}>
            {computePromoHref()}
          </code>
        </div>

        {/* Save promo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button onClick={handlePromoSave} disabled={promoSaving}>
            {promoSaving ? 'Guardando...' : 'Guardar link promocional'}
          </Button>
          {promoFeedback && (
            <span style={{
              fontSize: 14, fontWeight: 600,
              color: promoFeedback.includes('Error') ? '#ef4444' : '#25D366',
            }}>
              {promoFeedback.includes('Error') ? '! ' : '> '}{promoFeedback}
            </span>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {Object.keys(CATEGORY_NAMES).map(key => (
          <button
            key={key}
            onClick={() => setEditingCategory(editingCategory === key ? null : key)}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--r-pill)',
              border: editingCategory === key ? '2px solid var(--hot)' : '1.5px solid var(--border2)',
              background: editingCategory === key ? 'rgba(235,25,130,0.06)' : 'var(--white)',
              color: editingCategory === key ? 'var(--hot)' : 'var(--text-soft)',
              fontSize: 13, fontWeight: 600,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {CATEGORY_NAMES[key]}
            <span style={{ marginLeft: 6, opacity: 0.6 }}>({dropdowns[key]?.length || 0})</span>
          </button>
        ))}
      </div>

      {/* Editing panel */}
      {editingCategory && (
        <div style={{
          background: 'var(--cream)',
          borderRadius: 'var(--r-md)',
          padding: 24,
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
              Submenu de {CATEGORY_NAMES[editingCategory]}
            </h3>
            {(dropdowns[editingCategory]?.length || 0) < MAX_ITEMS && (
              <button
                onClick={() => addItem(editingCategory)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 'var(--r-pill)',
                  border: '1.5px solid var(--hot)',
                  background: 'rgba(235,25,130,0.06)',
                  color: 'var(--hot)',
                  fontSize: 12, fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                + Anadir enlace
              </button>
            )}
          </div>

          {(!dropdowns[editingCategory] || dropdowns[editingCategory].length === 0) && (
            <p style={{ fontSize: 14, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No hay enlaces configurados. Anade uno.
            </p>
          )}

          {dropdowns[editingCategory]?.map((item, i) => (
            <div key={`${editingCategory}-${i}`} style={{
              display: 'flex', gap: 10, alignItems: 'center',
              marginBottom: 12, padding: '12px 16px',
              background: 'var(--white)', borderRadius: 'var(--r-sm)',
              border: '1px solid var(--border)',
            }}>
              {/* Reorder buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                <button
                  onClick={() => moveItem(editingCategory, i, -1)}
                  disabled={i === 0}
                  style={{
                    background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer',
                    opacity: i === 0 ? 0.3 : 1, padding: 2,
                    fontSize: 10, color: 'var(--text-muted)',
                  }}
                >^</button>
                <button
                  onClick={() => moveItem(editingCategory, i, 1)}
                  disabled={i === (dropdowns[editingCategory]?.length ?? 0) - 1}
                  style={{
                    background: 'none', border: 'none',
                    cursor: i === (dropdowns[editingCategory]?.length ?? 0) - 1 ? 'default' : 'pointer',
                    opacity: i === (dropdowns[editingCategory]?.length ?? 0) - 1 ? 0.3 : 1,
                    padding: 2, fontSize: 10, color: 'var(--text-muted)',
                  }}
                >v</button>
              </div>

              {/* Label input */}
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>
                  Nombre
                </label>
                <input
                  value={item.label}
                  onChange={e => updateItem(editingCategory, i, 'label', e.target.value)}
                  placeholder="Ej: Shampoo"
                  style={{
                    width: '100%', padding: '8px 10px',
                    border: '1px solid var(--border2)', borderRadius: 'var(--r-sm)',
                    fontSize: 13, fontFamily: 'var(--font-body)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* URL input */}
              <div style={{ flex: 1.5 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>
                  Enlace
                </label>
                <input
                  value={item.href}
                  onChange={e => updateItem(editingCategory, i, 'href', e.target.value)}
                  placeholder="/catalogo?..."
                  style={{
                    width: '100%', padding: '8px 10px',
                    border: '1px solid var(--border2)', borderRadius: 'var(--r-sm)',
                    fontSize: 13, fontFamily: 'var(--font-body)',
                    outline: 'none', color: 'var(--text-soft)',
                  }}
                />
              </div>

              {/* Delete */}
              <button
                onClick={() => removeItem(editingCategory, i)}
                title="Eliminar"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#e74c3c', padding: 4, flexShrink: 0,
                  marginTop: 14,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Save */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
        {feedback && (
          <span style={{
            fontSize: 14, fontWeight: 600,
            color: feedback.includes('Error') ? '#ef4444' : '#25D366',
          }}>
            {feedback.includes('Error') ? '! ' : '> '}{feedback}
          </span>
        )}
      </div>

      {/* Preview hint */}
      <div style={{
        marginTop: 32, padding: 20,
        background: 'rgba(235,25,130,0.04)',
        borderRadius: 'var(--r-md)',
        border: '1px solid rgba(235,25,130,0.1)',
      }}>
        <p style={{ fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--hot)' }}>Tip:</strong> Los submenus aparecen cuando el usuario pasa el cursor
          sobre cada categoria en la barra marron. Los cambios se reflejaran en la tienda despues de guardar.
        </p>
      </div>
    </div>
  );
}
