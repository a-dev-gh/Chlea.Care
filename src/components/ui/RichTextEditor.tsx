import { useRef, useEffect, useCallback, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface RichTextEditorProps {
  value: string;          // HTML string
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;     // default 120
  maxHeight?: number;     // default 300
}

// ---------------------------------------------------------------------------
// Toolbar definitions
// ---------------------------------------------------------------------------
interface ToolbarItem {
  type: 'button';
  label: string;
  title: string;
  command: string;
  commandArg?: string;
}

interface ToolbarSeparator {
  type: 'separator';
}

type ToolbarEntry = ToolbarItem | ToolbarSeparator;

const TOOLBAR: ToolbarEntry[] = [
  { type: 'button', label: 'B',  title: 'Negrita',         command: 'bold' },
  { type: 'button', label: 'I',  title: 'Cursiva',         command: 'italic' },
  { type: 'button', label: 'U',  title: 'Subrayado',       command: 'underline' },
  { type: 'separator' },
  { type: 'button', label: '≡',  title: 'Lista',           command: 'insertUnorderedList' },
  { type: 'button', label: '1.', title: 'Lista numerada',  command: 'insertOrderedList' },
  { type: 'button', label: 'H',  title: 'Subtítulo',       command: 'formatBlock', commandArg: 'h3' },
  { type: 'separator' },
  { type: 'button', label: '✕',  title: 'Limpiar formato', command: 'removeFormat' },
];

// Commands whose active state we track via queryCommandState
const STATE_COMMANDS = ['bold', 'italic', 'underline'];

// ---------------------------------------------------------------------------
// ToolbarButton — top-level so React hooks rules are satisfied
// ---------------------------------------------------------------------------
interface ToolbarButtonProps {
  item: ToolbarItem;
  isActive: boolean;
  onAction: (command: string, arg?: string) => void;
}

function ToolbarButton({ item, isActive, onAction }: ToolbarButtonProps) {
  const [hovered, setHovered] = useState(false);

  const isBold      = item.label === 'B';
  const isItalic    = item.label === 'I';
  const isUnderline = item.label === 'U';

  return (
    <button
      type="button"
      title={item.title}
      onMouseDown={e => {
        // Prevent the editor from losing focus when clicking toolbar buttons
        e.preventDefault();
        onAction(item.command, item.commandArg);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 28,
        height: 28,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        borderRadius: 4,
        background: isActive
          ? 'rgba(235,25,130,0.12)'
          : hovered
          ? 'rgba(235,25,130,0.07)'
          : 'transparent',
        color: isActive ? 'var(--hot)' : 'var(--text)',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: isBold ? 800 : 600,
        fontStyle: isItalic ? 'italic' : 'normal',
        textDecoration: isUnderline ? 'underline' : 'none',
        fontFamily: 'var(--font-body)',
        transition: 'background 0.15s, color 0.15s',
        flexShrink: 0,
        padding: 0,
        lineHeight: 1,
      }}
    >
      {item.label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// RichTextEditor
// ---------------------------------------------------------------------------
export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escribe aquí...',
  minHeight = 120,
  maxHeight = 300,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  // Guard so we only set innerHTML from `value` on first mount
  const initialised = useRef(false);

  const [activeCommands, setActiveCommands] = useState<Set<string>>(new Set());
  const [focused, setFocused] = useState(false);

  // ── Initialise content once ──────────────────────────────────────────────
  useEffect(() => {
    if (!initialised.current && editorRef.current) {
      editorRef.current.innerHTML = value || '';
      initialised.current = true;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── When parent clears value (e.g. after save), clear the editor ─────────
  useEffect(() => {
    if (initialised.current && value === '' && editorRef.current) {
      if (editorRef.current.innerHTML !== '') {
        editorRef.current.innerHTML = '';
      }
    }
  }, [value]);

  // ── Re-sync when the editing target changes (new product loaded) ──────────
  // We detect this by comparing: if value is non-empty but editor content
  // differs significantly, it means the parent swapped the record.
  // We reset initialised so the next paint restores correct content.
  const prevValue = useRef(value);
  useEffect(() => {
    if (
      initialised.current &&
      editorRef.current &&
      prevValue.current !== value &&
      // Only re-sync when the value comes from an external swap (not user typing)
      editorRef.current.innerHTML !== value
    ) {
      editorRef.current.innerHTML = value || '';
    }
    prevValue.current = value;
  }, [value]);

  // ── Track bold/italic/underline active state ─────────────────────────────
  const updateActiveStates = useCallback(() => {
    const next = new Set<string>();
    for (const cmd of STATE_COMMANDS) {
      try {
        if (document.queryCommandState(cmd)) next.add(cmd);
      } catch { /* queryCommandState can throw in some browsers */ }
    }
    setActiveCommands(next);
  }, []);

  // ── Execute a toolbar command ────────────────────────────────────────────
  const execCmd = useCallback((command: string, arg?: string) => {
    editorRef.current?.focus();
    if (command === 'formatBlock' && arg) {
      document.execCommand('formatBlock', false, arg);
    } else {
      document.execCommand(command, false);
    }
    if (editorRef.current) onChange(editorRef.current.innerHTML);
    updateActiveStates();
  }, [onChange, updateActiveStates]);

  // ── Handlers ────────────────────────────────────────────────────────────
  function handleInput() {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }

  // Paste: strip Word/browser HTML junk, insert plain text only
  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // Tab key: insert spaces instead of moving focus
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '    ');
    }
  }

  // Placeholder: show when value is empty and editor is not focused
  const isEmpty = !value || value === '' || value === '<br>';

  return (
    <div
      style={{
        border: `1.5px solid ${focused ? 'var(--hot)' : 'var(--border2)'}`,
        borderRadius: 'var(--r-sm)',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        background: 'var(--white)',
      }}
    >
      {/* ── Toolbar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '6px 8px',
          background: 'var(--cream)',
          borderBottom: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}
      >
        {TOOLBAR.map((entry, i) => {
          if (entry.type === 'separator') {
            return (
              <span
                key={`sep-${i}`}
                style={{
                  display: 'inline-block',
                  width: 1,
                  height: 18,
                  background: 'var(--border2)',
                  margin: '0 2px',
                  flexShrink: 0,
                }}
              />
            );
          }
          return (
            <ToolbarButton
              key={entry.command + i}
              item={entry}
              isActive={entry.command !== 'removeFormat' && activeCommands.has(entry.command)}
              onAction={execCmd}
            />
          );
        })}
      </div>

      {/* ── Editable area ── */}
      <div style={{ position: 'relative' }}>
        {/* Placeholder overlay */}
        {isEmpty && !focused && (
          <div
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              padding: '12px 14px',
              fontSize: 14,
              color: 'var(--text-muted)',
              pointerEvents: 'none',
              fontFamily: 'var(--font-body)',
              lineHeight: 1.65,
              userSelect: 'none',
            }}
          >
            {placeholder}
          </div>
        )}

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          data-rte="true"
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onFocus={() => { setFocused(true); updateActiveStates(); }}
          onBlur={() => setFocused(false)}
          onKeyUp={updateActiveStates}
          onMouseUp={updateActiveStates}
          style={{
            minHeight,
            maxHeight,
            overflowY: 'auto',
            padding: '12px 14px',
            fontSize: 14,
            fontFamily: 'var(--font-body)',
            color: 'var(--text)',
            lineHeight: 1.65,
            outline: 'none',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        />
      </div>

      {/* Scoped styles for rich content rendered inside the editor */}
      <style>{`
        [data-rte="true"] h3 {
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
          margin: 8px 0 4px;
          font-family: var(--font-body);
        }
        [data-rte="true"] ul,
        [data-rte="true"] ol {
          padding-left: 22px;
          margin: 4px 0;
        }
        [data-rte="true"] li {
          margin-bottom: 2px;
        }
        [data-rte="true"] p {
          margin: 0 0 4px;
        }
      `}</style>
    </div>
  );
}
