import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLists } from '../hooks/useLists';
import { useProducts } from '../hooks/useProducts';
import { ProductGrid } from '../components/product/ProductGrid';

export function MisListasPage() {
  const lists = useLists(s => s.lists);
  const createList = useLists(s => s.createList);
  const renameList = useLists(s => s.renameList);
  const deleteList = useLists(s => s.deleteList);
  const { allProducts, loading } = useProducts();

  // Active tab index
  const [activeIdx, setActiveIdx] = useState(0);

  // New list creation
  const [showNewInput, setShowNewInput] = useState(false);
  const [newName, setNewName] = useState('');
  const newInputRef = useRef<HTMLInputElement>(null);

  // Inline rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Keep active index in bounds
  useEffect(() => {
    if (activeIdx >= lists.length) setActiveIdx(Math.max(0, lists.length - 1));
  }, [lists.length, activeIdx]);

  // Focus inputs
  useEffect(() => {
    if (showNewInput && newInputRef.current) newInputRef.current.focus();
  }, [showNewInput]);
  useEffect(() => {
    if (editingId && editInputRef.current) editInputRef.current.focus();
  }, [editingId]);

  const activeList = lists[activeIdx] ?? null;
  const activeProducts = activeList
    ? allProducts.filter(p => activeList.items.includes(p.id))
    : [];

  function handleCreateList() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    createList(trimmed);
    setNewName('');
    setShowNewInput(false);
    // Switch to the newly created list
    setActiveIdx(lists.length); // it will be appended at the end
  }

  function handleRename(id: string) {
    const trimmed = editName.trim();
    if (trimmed) renameList(id, trimmed);
    setEditingId(null);
  }

  function handleDelete(id: string) {
    deleteList(id);
    setConfirmDeleteId(null);
  }

  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 60px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--deep)', margin: 0 }}>
          Mis Listas
        </h1>

        {showNewInput ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              ref={newInputRef}
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreateList(); if (e.key === 'Escape') setShowNewInput(false); }}
              placeholder="Nombre de la lista"
              style={{
                fontSize: 14, padding: '8px 12px',
                border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
                fontFamily: 'var(--font-body)', outline: 'none',
              }}
            />
            <button
              onClick={handleCreateList}
              style={{
                background: 'var(--hot)', color: '#fff', border: 'none',
                borderRadius: 'var(--r-pill)', padding: '8px 18px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              Crear
            </button>
            <button
              onClick={() => setShowNewInput(false)}
              style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 'var(--r-pill)', padding: '8px 14px',
                fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)',
                color: 'var(--text-muted)',
              }}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewInput(true)}
            style={{
              background: 'var(--hot)', color: '#fff', border: 'none',
              borderRadius: 'var(--r-pill)', padding: '10px 22px',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Nueva Lista
          </button>
        )}
      </div>

      {/* Tab bar (only if multiple lists) */}
      {lists.length > 1 && (
        <div style={{
          display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap',
          overflowX: 'auto', paddingBottom: 4,
        }}>
          {lists.map((list, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={list.id}
                onClick={() => setActiveIdx(idx)}
                style={{
                  background: isActive ? 'var(--hot)' : 'rgba(255, 194, 209, 0.2)',
                  color: isActive ? '#fff' : 'var(--deep)',
                  border: isActive ? 'none' : '1px solid rgba(255, 194, 209, 0.5)',
                  borderRadius: 'var(--r-pill)',
                  padding: '8px 18px',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                {list.name} ({list.items.length})
              </button>
            );
          })}
        </div>
      )}

      {/* Active list content */}
      {activeList && (
        <div>
          {/* List header: name + actions */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
            flexWrap: 'wrap',
          }}>
            {editingId === activeList.id ? (
              <input
                ref={editInputRef}
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleRename(activeList.id); if (e.key === 'Escape') setEditingId(null); }}
                onBlur={() => handleRename(activeList.id)}
                style={{
                  fontSize: 20, fontWeight: 600, padding: '4px 8px',
                  border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
                  fontFamily: 'var(--font-body)', outline: 'none', color: 'var(--deep)',
                }}
              />
            ) : (
              <h2
                onClick={() => { setEditingId(activeList.id); setEditName(activeList.name); }}
                style={{
                  fontSize: 20, fontWeight: 600, color: 'var(--deep)', margin: 0,
                  cursor: 'pointer', borderBottom: '1px dashed rgba(85, 40, 20, 0.3)',
                  paddingBottom: 2,
                }}
                title="Haz clic para renombrar"
              >
                {activeList.name}
              </h2>
            )}

            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {activeList.items.length} {activeList.items.length === 1 ? 'producto' : 'productos'}
            </span>

            {/* Delete button */}
            {lists.length > 1 && (
              <>
                {confirmDeleteId === activeList.id ? (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Eliminar?</span>
                    <button
                      onClick={() => handleDelete(activeList.id)}
                      style={{
                        background: '#e74c3c', color: '#fff', border: 'none',
                        borderRadius: 'var(--r-sm)', padding: '4px 12px',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      Si
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      style={{
                        background: 'none', border: '1px solid var(--border)',
                        borderRadius: 'var(--r-sm)', padding: '4px 10px',
                        fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(activeList.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', fontSize: 13, padding: '4px 8px',
                      fontFamily: 'var(--font-body)', transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#e74c3c')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Product grid or empty state */}
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Cargando productos...</p>
          ) : activeProducts.length > 0 ? (
            <ProductGrid products={activeProducts} />
          ) : (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              background: 'rgba(255, 194, 209, 0.08)',
              borderRadius: 'var(--r-md)',
              border: '1px dashed rgba(255, 194, 209, 0.4)',
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                stroke="var(--pink)" strokeWidth="1.5" style={{ marginBottom: 16, opacity: 0.6 }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <p style={{ fontSize: 16, color: 'var(--deep)', fontWeight: 500, marginBottom: 8 }}>
                Esta lista esta vacia.
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
                Explora el catalogo para anadir productos!
              </p>
              <Link
                to="/catalogo"
                style={{
                  display: 'inline-block',
                  background: 'var(--hot)', color: '#fff',
                  borderRadius: 'var(--r-pill)',
                  padding: '10px 28px', fontSize: 14, fontWeight: 600,
                  textDecoration: 'none', fontFamily: 'var(--font-body)',
                }}
              >
                Ver Catalogo
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Fallback: no lists at all (edge case, should not happen) */}
      {lists.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>No tienes listas aun.</p>
          <button
            onClick={() => { createList('Favoritos'); setActiveIdx(0); }}
            style={{
              background: 'var(--hot)', color: '#fff', border: 'none',
              borderRadius: 'var(--r-pill)', padding: '10px 24px',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body)', marginTop: 16,
            }}
          >
            Crear "Favoritos"
          </button>
        </div>
      )}
    </section>
  );
}
