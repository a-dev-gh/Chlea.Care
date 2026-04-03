import { useState, useEffect } from 'react';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export function SubBanner() {
  const settings = useSiteSettings();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // banner_text from admin settings leads the rotation so the owner's message
  // is always the first thing visitors see. Fallback static messages follow.
  const messages = [
    settings.banner_text,
    '📱 +1 (809) 451-7690 · WhatsApp',
    'Envío a todo el país 🚚',
    'Siempre productos nuevos y de calidad ✨',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % messages.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        background: 'var(--hot)',
        backdropFilter: 'blur(10px)',
        color: '#fff',
        textAlign: 'center',
        padding: '8px 16px',
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: '0.3px',
        fontFamily: 'var(--font-body)',
        transition: 'opacity 0.4s ease',
        opacity: visible ? 1 : 0,
        minHeight: 34,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {messages[index]}
    </div>
  );
}
