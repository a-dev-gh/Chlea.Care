import { useState, useEffect } from 'react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    function onResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    onResize();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  if (!visible) return null;

  // On mobile: position above the BottomNav (~62px) + small gap
  // On desktop: keep original high position so it doesn't overlap anything
  const bottomOffset = isMobile ? 76 : 150;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Volver arriba"
      style={{
        position: 'fixed',
        bottom: bottomOffset,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: 'var(--hot)',
        color: '#fff',
        border: 'none',
        boxShadow: '0 4px 16px rgba(235,25,130,0.3)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 90,
        animation: 'fadeIn 0.3s ease',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(235,25,130,0.4)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(235,25,130,0.3)';
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="18 15 12 9 6 15"/>
      </svg>
    </button>
  );
}
