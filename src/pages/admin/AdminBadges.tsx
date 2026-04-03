import { useState, useEffect, useCallback } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { adminFetch, adminInsert, adminUpdate, adminDelete } from '../../utils/adminApi';
import { showToast } from '../../components/ui/Toast';
import type { BadgeEntry } from '../../types/database';

// Shared input style matching the rest of the admin pages
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1.5px solid var(--border2)',
  borderRadius: 'var(--r-sm)',
  fontSize: 14,
  fontFamily: 'var(--font-body)',
  color: 'var(--text)',
  outline: 'none',
  background: 'var(--white)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-muted)',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: 1,
};

// Small color swatch showing badge color
function ColorSwatch({ color }: { color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 24,
      height: 24,
      borderRadius: 6,
      background: color,
      border: '1px solid rgba(0,0,0,0.12)',
      flexShrink: 0,
      verticalAlign: 'middle',
    }} />
  );
}

// Inline delete confirmation shown in the table row
function DeleteConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>¿Eliminar?</span>
      <button
        onClick={onConfirm}
        style={{
          padding: '4px 12px',
          borderRadius: 'var(--r-sm)',
          border: '1px solid rgba(239,68,68,0.4)',
          background: 'none',
          fontSize: 12,
          fontWeight: 600,
          color: '#ef4444',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}
      >
        Sí
      </button>
      <button
        onClick={onCancel}
        style={{
          padding: '4px 12px',
          borderRadius: 'var(--r-sm)',
          border: '1px solid var(--border2)',
          background: 'none',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}
      >
        No
      </button>
    </div>
  );
}

// Blank form shape reused for create and edit
const emptyForm = { name: '', emoji: '', color: '#EB1982' };

// Main page component
export function AdminBadges() {
  const [badges, setBadges] = useState<BadgeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state — null means closed, 'create' or a BadgeEntry id means open
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<BadgeEntry | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Per-row delete confirmation state
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const loadBadges = useCallback(async () => {
    setLoading(true);
    const data = await adminFetch<BadgeEntry>('badges', { orderBy: 'sort_order' });
    setBadges(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadBadges(); }, [loadBadges]);

  function openCreate() {
    setForm(emptyForm);
    setEditTarget(null);
    setModalMode('create');
  }

  function openEdit(badge: BadgeEntry) {
    setForm({ name: badge.name, emoji: badge.emoji, color: badge.color });
    setEditTarget(badge);
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
    setEditTarget(null);
  }

  async function handleSave() {
    const name = form.name.trim();
    const emoji = form.emoji.trim();
    if (!name) return;

    setSaving(true);

    if (modalMode === 'create') {
      const { error } = await adminInsert<BadgeEntry>('badges', {
        name,
        emoji,
        color: form.color,
        sort_order: badges.length,
      } as Omit<BadgeEntry, 'id' | 'created_at'>);

      if (error) {
        showToast('Error al crear: ' + error, 'error');
      } else {
        await loadBadges();
        closeModal();
        showToast('Badge creado', 'success');
      }
    } else if (modalMode === 'edit' && editTarget) {
      const { error } = await adminUpdate<BadgeEntry>('badges', editTarget.id, {
        name,
        emoji,
        color: form.color,
      });

      if (error) {
        showToast('Error al guardar: ' + error, 'error');
      } else {
        await loadBadges();
        closeModal();
        showToast('Badge actualizado', 'success');
      }
    }

    setSaving(false);
  }

  async function handleDelete(id: string) {
    const { ok, error } = await adminDelete('badges', id);
    if (error) { showToast('Error al eliminar: ' + error, 'error'); }
    if (ok) {
      setBadges(prev => prev.filter(b => b.id !== id));
      showToast('Badge eliminado', 'success');
    }
    setConfirmingDeleteId(null);
  }

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
        Cargando badges...
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 720 }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 400,
            color: 'var(--text)',
            marginBottom: 6,
          }}>
            Badges
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Badges que se muestran en las tarjetas de producto (ej: Nuevo, Oferta, Agotado).
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            background: 'var(--hot)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--r-pill)',
            padding: '10px 22px',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            flexShrink: 0,
            marginLeft: 16,
          }}
        >
          + Nuevo Badge
        </button>
      </div>

      {/* Empty state */}
      {badges.length === 0 && (
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
          padding: '48px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}>
          <p style={{ fontSize: 15, marginBottom: 8 }}>No hay badges todavía.</p>
          <p style={{ fontSize: 13 }}>Crea el primero con el botón de arriba.</p>
        </div>
      )}

      {/* Badges table */}
      {badges.length > 0 && (
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '48px 1fr 80px 160px',
            gap: 0,
            padding: '10px 18px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--cream)',
          }}>
            {['Emoji', 'Nombre', 'Color', 'Acciones'].map(col => (
              <span key={col} style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}>
                {col}
              </span>
            ))}
          </div>

          {/* Table rows */}
          {badges.map((badge, idx) => (
            <div
              key={badge.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr 80px 160px',
                alignItems: 'center',
                gap: 0,
                padding: '12px 18px',
                borderBottom: idx < badges.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              {/* Emoji */}
              <span style={{ fontSize: 20, lineHeight: 1 }}>{badge.emoji || '—'}</span>

              {/* Name */}
              <span style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
                {badge.name}
              </span>

              {/* Color swatch */}
              <ColorSwatch color={badge.color} />

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {confirmingDeleteId === badge.id ? (
                  <DeleteConfirm
                    onConfirm={() => handleDelete(badge.id)}
                    onCancel={() => setConfirmingDeleteId(null)}
                  />
                ) : (
                  <>
                    {/* Edit button */}
                    <button
                      onClick={() => openEdit(badge)}
                      title="Editar badge"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        lineHeight: 1,
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => setConfirmingDeleteId(badge.id)}
                      title="Eliminar badge"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        lineHeight: 1,
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal open={modalMode !== null} onClose={closeModal} maxWidth={440}>
        <div style={{ padding: 28 }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 400,
            color: 'var(--text)',
            marginBottom: 24,
          }}>
            {modalMode === 'create' ? 'Nuevo Badge' : 'Editar Badge'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Name */}
            <div>
              <label style={labelStyle}>Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Nuevo, Oferta, Agotado"
                style={inputStyle}
                autoFocus
                required
              />
            </div>

            {/* Emoji */}
            <div>
              <label style={labelStyle}>Emoji</label>
              <input
                type="text"
                value={form.emoji}
                onChange={e => setForm(f => ({ ...f, emoji: e.target.value.slice(0, 2) }))}
                placeholder="🔥"
                maxLength={2}
                style={{ ...inputStyle, fontSize: 20, letterSpacing: 2 }}
              />
            </div>

            {/* Color */}
            <div>
              <label style={labelStyle}>Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="color"
                  value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  style={{
                    width: 48,
                    height: 40,
                    padding: 2,
                    border: '1.5px solid var(--border2)',
                    borderRadius: 'var(--r-sm)',
                    cursor: 'pointer',
                    background: 'var(--white)',
                  }}
                />
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                  {form.color.toUpperCase()}
                </span>
                <ColorSwatch color={form.color} />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <Button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                fullWidth
              >
                {saving ? 'Guardando...' : modalMode === 'create' ? 'Crear Badge' : 'Guardar Cambios'}
              </Button>
              <Button
                onClick={closeModal}
                variant="outline"
                fullWidth
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
