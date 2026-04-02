import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px',
      textAlign: 'center',
      background: 'linear-gradient(180deg, #fff5f9 0%, var(--white) 100%)',
    }}>
      <img src="/chlea-care-logo.svg" alt="Chlea Care" style={{ height: 40, marginBottom: 32, opacity: 0.6 }} />
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(4rem, 12vw, 8rem)',
        fontWeight: 300,
        color: 'var(--hot)',
        lineHeight: 1,
        marginBottom: 16,
      }}>
        404
      </h1>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
        fontWeight: 400,
        fontStyle: 'italic',
        color: 'var(--text)',
        marginBottom: 8,
      }}>
        ¡Oops! Esta página no existe
      </p>
      <p style={{
        fontSize: 15,
        color: 'var(--text-soft)',
        maxWidth: 400,
        lineHeight: 1.6,
        marginBottom: 36,
      }}>
        La página que buscas no se encontró. Quizás fue movida o ya no está disponible.
      </p>
      <Link to="/" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '14px 32px',
        borderRadius: 'var(--r-pill)',
        background: 'var(--hot)',
        color: '#fff',
        fontSize: 14,
        fontWeight: 600,
        textDecoration: 'none',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 4px 20px rgba(235,25,130,0.3)',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Volver al inicio
      </Link>
    </div>
  );
}
