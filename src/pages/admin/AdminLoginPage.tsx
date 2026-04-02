import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

// Standalone admin login page — rendered outside AdminLayout to avoid the
// infinite redirect loop that occurs when unauthenticated users hit the
// root route on the studio subdomain.
export function AdminLoginPage() {
  const { signIn, role, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError('Correo o contraseña incorrectos.');
      setSubmitting(false);
      return;
    }

    // After sign-in the AuthContext re-evaluates; give it a tick then check role
    // useAuth sets role by querying admin_users — if role is null the user has
    // no admin privileges.
    // We re-check via a short poll so the context has time to resolve the role.
    let attempts = 0;
    const checkRole = setInterval(() => {
      attempts++;
      if (role) {
        clearInterval(checkRole);
        navigate('/productos', { replace: true });
      } else if (attempts >= 10) {
        // After ~2 s the role is still null → not an admin user
        clearInterval(checkRole);
        setError('No tienes permisos de administrador.');
        setSubmitting(false);
      }
    }, 200);
  }

  // Page-level wrapper: centered card on a soft pink-tinted background
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #fff5f8 0%, #ffeef4 100%)',
    fontFamily: 'var(--font-body)',
    padding: 24,
  };

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 32px rgba(235, 25, 130, 0.10)',
    padding: '40px 36px',
    width: '100%',
    maxWidth: 400,
  };

  const logoRowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 28,
    gap: 10,
  };

  const subtitleStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: 'var(--deep)',
    opacity: 0.7,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--deep)',
    marginBottom: 6,
    letterSpacing: 0.5,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1.5px solid #e8d0d8',
    fontSize: 14,
    fontFamily: 'var(--font-body)',
    color: 'var(--deep)',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s',
    background: '#fdfafa',
  };

  const fieldStyle: React.CSSProperties = {
    marginBottom: 18,
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 0',
    background: submitting ? '#e8a0bc' : 'var(--hot)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: 'var(--font-body)',
    cursor: submitting ? 'not-allowed' : 'pointer',
    marginTop: 8,
    letterSpacing: 0.5,
    transition: 'background 0.15s',
  };

  const errorStyle: React.CSSProperties = {
    color: '#d32f2f',
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center' as const,
    background: '#fff0f0',
    borderRadius: 6,
    padding: '8px 12px',
  };

  // While the auth hook is still resolving its initial state, show nothing
  if (authLoading) {
    return (
      <div style={pageStyle}>
        <p style={{ color: 'var(--deep)', opacity: 0.5, fontSize: 14 }}>Verificando sesión...</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Logo + subtitle */}
        <div style={logoRowStyle}>
          <img
            src="/chlea-care-logo.svg"
            alt="Chlea Care"
            style={{ height: 36 }}
          />
          <span style={subtitleStyle}>Panel Administrativo</span>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={fieldStyle}>
            <label htmlFor="email" style={labelStyle}>
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="admin@example.com"
            />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="password" style={labelStyle}>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={submitting} style={buttonStyle}>
            {submitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          {/* Error message */}
          {error && <p style={errorStyle}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
