import { useState, useEffect, useCallback } from 'react';

interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error' | 'info';
}

let toastId = 0;
let addToastGlobal: ((text: string, type?: 'success' | 'error' | 'info') => void) | null = null;

export function showToast(text: string, type: 'success' | 'error' | 'info' = 'success') {
  addToastGlobal?.(text, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  useEffect(() => {
    addToastGlobal = addToast;
    return () => { addToastGlobal = null; };
  }, [addToast]);

  if (toasts.length === 0) return null;

  const colors = {
    success: { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32' },
    error: { bg: '#ffeef0', border: '#ef4444', text: '#d32f2f' },
    info: { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0' },
  };

  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(toast => (
        <div key={toast.id} style={{
          padding: '12px 20px', borderRadius: 8,
          background: colors[toast.type].bg,
          border: `1px solid ${colors[toast.type].border}`,
          color: colors[toast.type].text,
          fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-body)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          animation: 'toastIn 0.3s ease',
          maxWidth: 360,
        }}>
          {toast.text}
        </div>
      ))}
      <style>{`@keyframes toastIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  );
}
