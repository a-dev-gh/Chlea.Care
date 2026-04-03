import { useState, useEffect } from 'react';

const COOKIE_KEY = 'chlea_cookie_consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show banner if user hasn't consented yet
    if (!localStorage.getItem(COOKIE_KEY)) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
  }

  function handleDecline() {
    localStorage.setItem(COOKIE_KEY, 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    // Fixed bottom banner, above the mobile bottom nav (z-index 140)
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 140,
      background: 'var(--deep)', color: 'rgba(255,255,255,0.85)',
      padding: '16px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 16, flexWrap: 'wrap',
      boxShadow: '0 -4px 20px rgba(85,40,20,0.2)',
      fontFamily: 'var(--font-body)',
      animation: 'slideUpCookie 0.4s ease',
    }}>
      <p style={{ fontSize: 13, lineHeight: 1.5, maxWidth: 600, margin: 0, textAlign: 'center' }}>
        Usamos cookies para mejorar tu experiencia. Al continuar navegando, aceptas nuestra{' '}
        <a href="/politicas-envio" style={{ color: 'var(--pink)', textDecoration: 'underline' }}>
          política de privacidad
        </a>.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleAccept} style={{
          background: 'var(--hot)', color: '#fff', border: 'none',
          borderRadius: 'var(--r-pill)', padding: '8px 20px',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}>
          Aceptar
        </button>
        <button onClick={handleDecline} style={{
          background: 'none', color: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 'var(--r-pill)', padding: '8px 16px',
          fontSize: 13, cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}>
          Rechazar
        </button>
      </div>
      <style>{`
        @keyframes slideUpCookie {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (max-width: 600px) {
          /* Push above mobile bottom nav (~62px tall) */
          .cookie-banner-inner { padding-bottom: 70px !important; }
        }
      `}</style>
    </div>
  );
}
