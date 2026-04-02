import { useState, useRef, useEffect } from 'react';
import { useLists } from '../../hooks/useLists';

interface ListPickerProps {
  productId: string;
  onClose: () => void;
  /** Anchor position relative to the heart button */
  anchorRect?: DOMRect | null;
}

export function ListPicker({ productId, onClose }: ListPickerProps) {
  const lists = useLists(s => s.lists);
  const toggleInList = useLists(s => s.toggleInList);
  const createList = useLists(s => s.createList);

  const [newName, setNewName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Focus input when shown
  useEffect(() => {
    if (showInput && inputRef.current) inputRef.current.focus();
  }, [showInput]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // Delay listener to avoid closing immediately from the same click
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const id = createList(trimmed);
    // Auto-add the product to the newly created list
    toggleInList(id, productId);
    setNewName('');
    setShowInput(false);
  }

  return (
    <div
      ref={popoverRef}
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: 42,
        right: 0,
        zIndex: 50,
        width: 230,
        maxWidth: 240,
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 194, 209, 0.45)',
        borderRadius: 'var(--r-md)',
        boxShadow: '0 8px 32px rgba(85, 40, 20, 0.12)',
        padding: '10px 0',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 12px 8px', borderBottom: '1px solid rgba(255, 194, 209, 0.3)',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--deep)' }}>
          Mis Listas
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 16, color: 'var(--text-muted)', lineHeight: 1, padding: 2,
          }}
          aria-label="Cerrar"
        >
          &times;
        </button>
      </div>

      {/* List items */}
      <div style={{ maxHeight: 180, overflowY: 'auto', padding: '6px 0' }}>
        {lists.map(list => {
          const checked = list.items.includes(productId);
          return (
            <label
              key={list.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 12px', cursor: 'pointer', fontSize: 13,
                color: 'var(--deep)', transition: 'background 0.15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255, 194, 209, 0.15)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleInList(list.id, productId)}
                style={{ accentColor: 'var(--hot)', width: 15, height: 15, cursor: 'pointer' }}
              />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {list.name}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {list.items.length}
              </span>
            </label>
          );
        })}
      </div>

      {/* Create new list */}
      <div style={{ borderTop: '1px solid rgba(255, 194, 209, 0.3)', padding: '8px 12px 4px' }}>
        {showInput ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowInput(false); }}
              placeholder="Nombre de la lista"
              style={{
                flex: 1, fontSize: 12, padding: '5px 8px',
                border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
                fontFamily: 'var(--font-body)', outline: 'none',
                background: 'var(--white)',
              }}
            />
            <button
              onClick={handleCreate}
              style={{
                background: 'var(--hot)', color: '#fff', border: 'none',
                borderRadius: 'var(--r-sm)', padding: '4px 10px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              OK
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: 'var(--hot)',
              display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: 'var(--font-body)', padding: 0,
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Nueva Lista
          </button>
        )}
      </div>
    </div>
  );
}
