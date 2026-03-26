import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

export function AccountPage() {
  const { user, signIn, signOut, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const { error: err } = await signIn(email, password);
    if (err) setError(err);
    setSubmitting(false);
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>Cargando...</div>;
  }

  if (user) {
    return (
      <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>👤</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, marginBottom: 8 }}>Mi Cuenta</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>{user.email}</p>
        <Button onClick={signOut} variant="outline">Cerrar sesión</Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: '0 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300, color: 'var(--text)', marginBottom: 8 }}>
        Mi Cuenta
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 15 }}>
        Inicia sesión para ver tu historial de pedidos.
      </p>

      <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input
          type="email" placeholder="Correo electrónico" required
          value={email} onChange={e => setEmail(e.target.value)}
          style={{
            padding: '13px 16px', borderRadius: 'var(--r-sm)',
            border: '1.5px solid var(--border2)', fontSize: 15,
            fontFamily: 'var(--font-body)', outline: 'none', color: 'var(--text)',
          }}
        />
        <input
          type="password" placeholder="Contraseña" required
          value={password} onChange={e => setPassword(e.target.value)}
          style={{
            padding: '13px 16px', borderRadius: 'var(--r-sm)',
            border: '1.5px solid var(--border2)', fontSize: 15,
            fontFamily: 'var(--font-body)', outline: 'none', color: 'var(--text)',
          }}
        />
        {error && <p style={{ color: 'var(--hot)', fontSize: 13 }}>{error}</p>}
        <Button type="submit" fullWidth size="lg" disabled={submitting}>
          {submitting ? 'Entrando...' : 'Iniciar sesión'}
        </Button>
      </form>
    </div>
  );
}
