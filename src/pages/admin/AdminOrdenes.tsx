export function AdminOrdenes() {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--text)', marginBottom: 8 }}>Órdenes</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Las órdenes aparecerán aquí una vez conectada la base de datos.</p>
      <div style={{
        marginTop: 40, background: 'var(--white)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)', padding: '60px 24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Sin órdenes aún</p>
      </div>
    </div>
  );
}
