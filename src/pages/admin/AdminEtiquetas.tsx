import { useState, useEffect, useCallback } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { adminFetch, adminInsert, adminUpdate, adminDelete } from '../../utils/adminApi';
import type { LabelGroup } from '../../types/database';

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

// Pink pill for each tag value
function ValuePill({ value, onRemove }: { value: string; onRemove: () => void }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: 'rgba(235,25,130,0.08)',
      border: '1px solid rgba(235,25,130,0.2)',
      borderRadius: 'var(--r-pill)',
      padding: '6px 14px',
      fontSize: 13,
      color: 'var(--hot)',
      fontFamily: 'var(--font-body)',
    }}>
      {value}
      <button
        onClick={onRemove}
        title="Eliminar valor"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          lineHeight: 1,
          color: 'rgba(235,25,130,0.55)',
          fontSize: 15,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        ×
      </button>
    </span>
  );
}

// Inline delete confirmation shown inside the card header
function DeleteConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Eliminar este grupo?</span>
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
        Si
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

// Individual expandable label group card
function LabelGroupCard({
  group,
  onDelete,
  onUpdate,
}: {
  group: LabelGroup;
  onDelete: (id: string) => void;
  onUpdate: (id: string, values: string[]) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAddValue() {
    const trimmed = newValue.trim();
    if (!trimmed || group.values.includes(trimmed)) return;
    setSaving(true);
    await onUpdate(group.id, [...group.values, trimmed]);
    setNewValue('');
    setSaving(false);
  }

  async function handleRemoveValue(val: string) {
    await onUpdate(group.id, group.values.filter(v => v !== val));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAddValue();
  }

  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)',
      overflow: 'hidden',
    }}>
      {/* Card header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 18px',
        gap: 12,
        cursor: 'pointer',
      }}>
        {/* Expand / collapse — click anywhere in header except the right controls */}
        <div
          onClick={() => !confirmingDelete && setExpanded(e => !e)}
          style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
            {group.name}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {group.values.length} valor{group.values.length !== 1 ? 'es' : ''}
          </span>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {confirmingDelete ? (
            <DeleteConfirm
              onConfirm={() => onDelete(group.id)}
              onCancel={() => setConfirmingDelete(false)}
            />
          ) : (
            <button
              onClick={() => setConfirmingDelete(true)}
              title="Eliminar grupo"
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
              {/* Trash icon (inline SVG) */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </button>
          )}

          {/* Chevron */}
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.2s',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '16px 18px',
          background: 'var(--cream)',
        }}>
          {/* Pills */}
          {group.values.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {group.values.map(val => (
                <ValuePill key={val} value={val} onRemove={() => handleRemoveValue(val)} />
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Sin valores todavia. Agrega el primero abajo.
            </p>
          )}

          {/* Add new value row */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nuevo valor..."
              style={{ ...inputStyle, flex: 1, padding: '8px 12px' }}
            />
            <button
              onClick={handleAddValue}
              disabled={saving || !newValue.trim()}
              style={{
                background: saving || !newValue.trim() ? 'rgba(235,25,130,0.35)' : 'var(--hot)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--r-sm)',
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                cursor: saving || !newValue.trim() ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Agregar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Main page component
export function AdminEtiquetas() {
  const [groups, setGroups] = useState<LabelGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state for creating a new group
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newValuesRaw, setNewValuesRaw] = useState(''); // comma-separated string
  const [creating, setCreating] = useState(false);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    const data = await adminFetch<LabelGroup>('label_groups', { orderBy: 'sort_order' });
    setGroups(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadGroups(); }, [loadGroups]);

  function openModal() {
    setNewName('');
    setNewValuesRaw('');
    setShowModal(true);
  }

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;

    const values = newValuesRaw
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);

    setCreating(true);
    const { error } = await adminInsert<LabelGroup>('label_groups', {
      name,
      values,
      sort_order: groups.length,
    } as Omit<LabelGroup, 'id' | 'created_at'>);

    if (error) {
      alert('Error al crear: ' + error);
    } else {
      await loadGroups();
      setShowModal(false);
    }
    setCreating(false);
  }

  async function handleDelete(id: string) {
    const { ok, error } = await adminDelete('label_groups', id);
    if (error) alert('Error al eliminar: ' + error);
    if (ok) setGroups(prev => prev.filter(g => g.id !== id));
  }

  async function handleUpdateValues(id: string, values: string[]) {
    const { error } = await adminUpdate<LabelGroup>('label_groups', id, { values });
    if (error) {
      alert('Error al guardar: ' + error);
    } else {
      setGroups(prev => prev.map(g => g.id === id ? { ...g, values } : g));
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
        Cargando etiquetas...
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
            Etiquetas
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Estas etiquetas se usan para organizar y filtrar productos en el catálogo.
          </p>
        </div>
        <button
          onClick={openModal}
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
          + Nueva Etiqueta
        </button>
      </div>

      {/* Empty state */}
      {groups.length === 0 && (
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
          padding: '48px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}>
          <p style={{ fontSize: 15, marginBottom: 8 }}>No hay grupos de etiquetas todavia.</p>
          <p style={{ fontSize: 13 }}>Crea el primero con el boton de arriba.</p>
        </div>
      )}

      {/* Label group cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {groups.map(group => (
          <LabelGroupCard
            key={group.id}
            group={group}
            onDelete={handleDelete}
            onUpdate={handleUpdateValues}
          />
        ))}
      </div>

      {/* Create new group modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} maxWidth={480}>
        <div style={{ padding: 28 }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 400,
            color: 'var(--text)',
            marginBottom: 24,
          }}>
            Nueva Etiqueta
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Nombre del grupo</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Ej: Tipo de Cabello"
                style={inputStyle}
                autoFocus
              />
            </div>

            <div>
              <label style={labelStyle}>Valores iniciales (separados por coma)</label>
              <input
                type="text"
                value={newValuesRaw}
                onChange={e => setNewValuesRaw(e.target.value)}
                placeholder="Ej: Rizado, Lacio, Todo Tipo"
                style={inputStyle}
              />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                Opcional — puedes agregar mas valores despues.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <Button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                fullWidth
              >
                {creating ? 'Creando...' : 'Crear grupo'}
              </Button>
              <Button
                onClick={() => setShowModal(false)}
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
