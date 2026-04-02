import { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

// Shared input style used by both sign-in and sign-up forms
const inputStyle: React.CSSProperties = {
  padding: '13px 16px',
  borderRadius: 'var(--r-sm)',
  border: '1.5px solid var(--border2)',
  fontSize: 15,
  fontFamily: 'var(--font-body)',
  outline: 'none',
  color: 'var(--text)',
};

export function AccountPage() {
  const { user, role, signIn, signUp, signOut, loading } = useAuthContext();

  // Form state
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset fields when toggling between modes
  function switchMode(next: 'login' | 'signup') {
    setMode(next);
    setError('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMsg('');
    const { error: err } = await signIn(email, password);
    if (err) setError(err);
    setSubmitting(false);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres.');
      return;
    }

    setSubmitting(true);
    const { error: err } = await signUp(email, password);
    if (err) {
      setError(err);
    } else {
      setSuccessMsg('Cuenta creada! Revisa tu correo para confirmar.');
    }
    setSubmitting(false);
  }

  /* ------------------------------------------------------------------ */
  /* Loading state                                                       */
  /* ------------------------------------------------------------------ */
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
        Cargando...
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Logged-in profile view                                              */
  /* ------------------------------------------------------------------ */
  if (user) {
    // Determine a human-readable role label
    const roleLabel =
      role === 'super_admin' ? 'Super Admin'
      : role === 'owner' ? 'Propietaria'
      : role === 'employee' ? 'Empleada'
      : null;

    return (
      <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        {/* Avatar circle */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--pink)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', fontSize: 32, color: 'var(--deep)',
        }}>
          {(user.email?.[0] ?? '?').toUpperCase()}
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 28,
          fontWeight: 400, marginBottom: 4,
        }}>
          Mi Cuenta
        </h2>

        <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
          {user.email}
        </p>

        {/* Role badge (only for admin users) */}
        {roleLabel && (
          <span style={{
            display: 'inline-block', padding: '4px 14px',
            borderRadius: 999, fontSize: 12, fontWeight: 600,
            letterSpacing: 0.5, textTransform: 'uppercase',
            background: 'var(--deep)', color: 'var(--pink)',
            marginBottom: 24,
          }}>
            {roleLabel}
          </span>
        )}

        {!roleLabel && <div style={{ height: 24 }} />}

        {/* Wishlist sync hint */}
        <div style={{
          background: 'var(--pink)', borderRadius: 'var(--r-sm)',
          padding: '14px 20px', marginBottom: 32, fontSize: 14,
          color: 'var(--deep)', lineHeight: 1.5,
        }}>
          Mis Listas se sincronizaran con tu cuenta
        </div>

        <Button onClick={signOut} variant="outline">
          Cerrar sesion
        </Button>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Auth forms (login / signup)                                         */
  /* ------------------------------------------------------------------ */
  const isLogin = mode === 'login';

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: '0 24px' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 32,
        fontWeight: 300, color: 'var(--text)', marginBottom: 8,
      }}>
        Mi Cuenta
      </h1>

      <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 15 }}>
        {isLogin
          ? 'Inicia sesion para ver tu historial de pedidos.'
          : 'Crea tu cuenta para guardar tus listas y mas.'}
      </p>

      {/* Mode toggle tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => switchMode('login')}
          style={{
            flex: 1, padding: '10px 0', fontSize: 14, fontWeight: isLogin ? 700 : 400,
            fontFamily: 'var(--font-body)', cursor: 'pointer',
            background: 'none', border: 'none',
            borderBottom: isLogin ? '2px solid var(--hot)' : '2px solid var(--border2)',
            color: isLogin ? 'var(--hot)' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}
        >
          Iniciar Sesion
        </button>
        <button
          type="button"
          onClick={() => switchMode('signup')}
          style={{
            flex: 1, padding: '10px 0', fontSize: 14, fontWeight: !isLogin ? 700 : 400,
            fontFamily: 'var(--font-body)', cursor: 'pointer',
            background: 'none', border: 'none',
            borderBottom: !isLogin ? '2px solid var(--hot)' : '2px solid var(--border2)',
            color: !isLogin ? 'var(--hot)' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}
        >
          Crear Cuenta
        </button>
      </div>

      {/* Login form */}
      {isLogin && (
        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="email" placeholder="Correo electronico" required
            value={email} onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password" placeholder="Contrasena" required
            value={password} onChange={e => setPassword(e.target.value)}
            style={inputStyle}
          />
          {error && <p style={{ color: 'var(--hot)', fontSize: 13 }}>{error}</p>}
          <Button type="submit" fullWidth size="lg" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Iniciar sesion'}
          </Button>
        </form>
      )}

      {/* Signup form */}
      {!isLogin && (
        <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="email" placeholder="Correo electronico" required
            value={email} onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password" placeholder="Contrasena" required
            value={password} onChange={e => setPassword(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password" placeholder="Confirmar contrasena" required
            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            style={inputStyle}
          />
          {error && <p style={{ color: 'var(--hot)', fontSize: 13 }}>{error}</p>}
          {successMsg && (
            <p style={{
              color: 'var(--deep)', fontSize: 14,
              background: 'var(--pink)', borderRadius: 'var(--r-sm)',
              padding: '12px 16px', lineHeight: 1.4,
            }}>
              {successMsg}
            </p>
          )}
          <Button type="submit" fullWidth size="lg" disabled={submitting}>
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>
      )}
    </div>
  );
}
