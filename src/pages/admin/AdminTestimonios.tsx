import { useState, useEffect, useCallback } from 'react';
import { adminFetch, adminUpdate, adminDelete } from '../../utils/adminApi';
import { showToast } from '../../components/ui/Toast';
import type { Testimonial } from '../../types/database';

// Render filled/empty stars up to 5
function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="14" height="14" viewBox="0 0 24 24"
          fill={i < rating ? 'var(--hot)' : 'none'}
          stroke={i < rating ? 'var(--hot)' : 'var(--border2)'}
          strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

// Toggle switch component — reused for approve/pending
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        position: 'relative',
        display: 'inline-flex', alignItems: 'center',
        width: 44, height: 24,
        background: checked ? 'var(--hot)' : 'var(--border2)',
        borderRadius: 12,
        border: 'none', cursor: 'pointer',
        padding: 0, flexShrink: 0,
        transition: 'background 0.2s',
      }}
      aria-label={checked ? 'Aprobado' : 'Pendiente'}
    >
      <span style={{
        position: 'absolute',
        left: checked ? 22 : 2,
        width: 20, height: 20,
        background: '#fff',
        borderRadius: '50%',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

export function AdminTestimonios() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Load all testimonials ordered newest first
  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await adminFetch<Testimonial>('testimonials', {
      orderBy: 'created_at',
      ascending: false,
    });
    setTestimonials(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Toggle is_approved on/off
  async function toggleApprove(t: Testimonial) {
    const newVal = !t.is_approved;
    const { error } = await adminUpdate<Testimonial>(
      'testimonials',
      t.id,
      { is_approved: newVal } as any,
    );
    if (error) { showToast('Error: ' + error, 'error'); } else { showToast(newVal ? 'Testimonio aprobado' : 'Testimonio pendiente', 'info'); }
    await loadData();
  }

  // Delete a testimonial after inline confirmation
  async function handleDelete(id: string) {
    const { ok, error } = await adminDelete('testimonials', id);
    if (error) { showToast('Error: ' + error, 'error'); }
    if (ok) { await loadData(); showToast('Testimonio eliminado', 'success'); }
    setConfirmDelete(null);
  }

  // Format date in Dominican locale (short month)
  function formatDate(iso: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-DO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  // Truncate review text to ~60 chars for the table
  function truncate(str: string, max = 60) {
    if (!str) return '—';
    return str.length > max ? str.slice(0, max) + '...' : str;
  }

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
        Cargando testimonios...
      </div>
    );
  }

  return (
    <div style={{ padding: 32 }}>
      {/* Page header — no create button (testimonials come from visitors) */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 28,
            fontWeight: 400, color: 'var(--text)', margin: 0,
          }}>
            Testimonios
          </h1>
          <span style={{
            fontSize: 13, fontWeight: 600, color: 'var(--text-muted)',
            background: 'var(--cream)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-pill)', padding: '2px 10px',
          }}>
            {testimonials.length}
          </span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>
          Testimonios enviados por visitantes. Aprueba los que quieras mostrar en la pagina principal.
        </p>
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--white)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)', overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 90px 2fr 110px 130px 130px',
          padding: '10px 20px',
          background: 'var(--cream)',
          borderBottom: '1px solid var(--border)',
          fontSize: 11, fontWeight: 700, letterSpacing: 0.8,
          textTransform: 'uppercase', color: 'var(--text-muted)',
        }}>
          <span>Nombre</span>
          <span>Rating</span>
          <span>Texto</span>
          <span>Fecha</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>

        {/* Table rows */}
        {testimonials.length === 0 ? (
          <div style={{
            padding: '60px 24px', textAlign: 'center',
            color: 'var(--text-muted)', fontSize: 15,
          }}>
            No hay testimonios aun.
          </div>
        ) : (
          testimonials.map(t => (
            <div
              key={t.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 90px 2fr 110px 130px 130px',
                padding: '14px 20px',
                borderBottom: '1px solid var(--border)',
                alignItems: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Nombre */}
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                {t.name || '—'}
              </span>

              {/* Rating */}
              <span>
                <StarRating rating={t.rating} />
              </span>

              {/* Texto (truncated) */}
              <span style={{
                fontSize: 13, color: 'var(--text-soft)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {truncate(t.text)}
              </span>

              {/* Fecha */}
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {formatDate(t.created_at)}
              </span>

              {/* Estado — toggle switch + label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ToggleSwitch
                  checked={t.is_approved}
                  onChange={() => toggleApprove(t)}
                />
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: t.is_approved ? 'var(--hot)' : '#b45309',
                }}>
                  {t.is_approved ? 'Aprobado' : 'Pendiente'}
                </span>
              </div>

              {/* Acciones — delete with inline confirm */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {confirmDelete === t.id ? (
                  <>
                    <button
                      onClick={() => handleDelete(t.id)}
                      style={{
                        padding: '4px 10px', borderRadius: 'var(--r-sm)',
                        border: 'none', background: '#ef4444',
                        fontSize: 12, fontWeight: 600, color: '#fff',
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                      }}
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      style={{
                        padding: '4px 10px', borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--border2)', background: 'none',
                        fontSize: 12, fontWeight: 600, color: 'var(--text-soft)',
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                      }}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(t.id)}
                    style={{
                      padding: '5px 12px', borderRadius: 'var(--r-sm)',
                      border: '1px solid rgba(239,68,68,0.3)', background: 'none',
                      fontSize: 12, fontWeight: 600, color: '#ef4444',
                      cursor: 'pointer', fontFamily: 'var(--font-body)',
                    }}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
