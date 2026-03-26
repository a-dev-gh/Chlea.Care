import { useState } from 'react';
import { SEED_BRANDS } from '../../data/seedData';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

interface Brand {
  name: string;
  slug: string;
  tagline: string;
  is_premier?: boolean;
}

export function AdminMarcas() {
  const [brands, setBrands] = useState<Brand[]>(
    SEED_BRANDS.map(b => ({ ...b, is_premier: true }))
  );
  const [editing, setEditing] = useState<Brand | null>(null);
  const [isNew, setIsNew] = useState(false);

  function openNew() {
    setEditing({ name: '', slug: '', tagline: '', is_premier: false });
    setIsNew(true);
  }

  function openEdit(brand: Brand) {
    setEditing({ ...brand });
    setIsNew(false);
  }

  function handleSave() {
    if (!editing || !editing.name.trim()) return;
    const slug = editing.slug || editing.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const updated = { ...editing, slug };

    if (isNew) {
      setBrands(prev => [...prev, updated]);
    } else {
      setBrands(prev => prev.map(b => b.slug === editing.slug ? updated : b));
    }
    setEditing(null);
    // TODO: save to Supabase brands table
  }

  function handleDelete(slug: string) {
    setBrands(prev => prev.filter(b => b.slug !== slug));
    // TODO: delete from Supabase
  }

  const premierCount = brands.filter(b => b.is_premier).length;

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
              {['Marca', 'Slug', 'Tagline', 'Premier', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'left' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {brands.map((b, i) => (
              <tr key={b.slug} style={{
                borderBottom: i < brands.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(235,25,130,0.03)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'linear-gradient(135deg,var(--pink),#ffd6e7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600,
                      color: 'var(--hot)', fontStyle: 'italic',
                    }}>
                      {b.name.charAt(0)}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{b.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  /marcas/{b.slug}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-soft)' }}>
                  {b.tagline}
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
                    <button onClick={() => handleDelete(b.slug)} style={{
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

      {/* Edit/Create Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} maxWidth={460}>
        {editing && (
          <div style={{ padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, marginBottom: 24 }}>
              {isNew ? 'Nueva Marca' : 'Editar Marca'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Nombre
                </label>
                <input
                  type="text" value={editing.name}
                  onChange={e => setEditing({ ...editing, name: e.target.value })}
                  placeholder="Ej: Alfaparf Milano"
                  style={{
                    width: '100%', padding: '12px 14px',
                    border: '1.5px solid var(--border2)', borderRadius: 'var(--r-sm)',
                    fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--text)', outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Tagline
                </label>
                <input
                  type="text" value={editing.tagline}
                  onChange={e => setEditing({ ...editing, tagline: e.target.value })}
                  placeholder="Descripción corta de la marca"
                  style={{
                    width: '100%', padding: '12px 14px',
                    border: '1.5px solid var(--border2)', borderRadius: 'var(--r-sm)',
                    fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--text)', outline: 'none',
                  }}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: 'var(--text-soft)' }}>
                <input
                  type="checkbox"
                  checked={editing.is_premier || false}
                  onChange={e => setEditing({ ...editing, is_premier: e.target.checked })}
                  style={{ accentColor: 'var(--hot)', width: 16, height: 16 }}
                />
                Marca Premier (aparece en el footer, máximo 6)
              </label>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <Button onClick={handleSave} fullWidth>
                  {isNew ? 'Crear Marca' : 'Guardar cambios'}
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
