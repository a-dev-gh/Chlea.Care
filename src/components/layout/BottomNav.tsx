import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { CartIcon } from '../ui/CartIcon';

const TABS = [
  {
    label: 'Inicio', href: '/',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--hot)' : 'none'}
        stroke={active ? 'var(--hot)' : 'var(--text-muted)'} strokeWidth="2">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    label: 'Mi Cuenta', href: '/cuenta',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--hot)' : 'var(--text-muted)'} strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    label: 'Catálogo', href: '/catalogo',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--hot)' : 'var(--text-muted)'} strokeWidth="2">
        <rect x="2" y="3" width="7" height="7"/><rect x="15" y="3" width="7" height="7"/>
        <rect x="2" y="14" width="7" height="7"/><rect x="15" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    label: 'Mis Listas', href: '/catalogo',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24"
        fill={active ? 'var(--hot)' : 'none'}
        stroke={active ? 'var(--hot)' : 'var(--text-muted)'} strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const cartCount = useCart(s => s.count());
  const openCart = useCart(s => s.openCart);

  return (
    <nav style={{
      display: 'none',
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
      height: 62,
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 8px',
    }} className="bottom-nav">
      {TABS.map(tab => {
        const active = pathname === tab.href;
        return (
          <Link key={tab.label} to={tab.href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            flex: 1, padding: '6px 0', textDecoration: 'none',
          }}>
            {tab.icon(active)}
            <span style={{
              fontSize: 10, fontWeight: 500, fontFamily: 'var(--font-body)',
              color: active ? 'var(--hot)' : 'var(--text-muted)',
            }}>{tab.label}</span>
          </Link>
        );
      })}

      {/* Cart tab */}
      <button onClick={openCart} style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        flex: 1, padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer',
        position: 'relative',
      }}>
        <span style={{ position: 'relative' }}>
          <CartIcon size={24} color="var(--text-muted)" />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -6,
              background: 'var(--hot)', borderRadius: '50%',
              width: 14, height: 14, fontSize: 9, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
            }}>{cartCount}</span>
          )}
        </span>
        <span style={{ fontSize: 10, fontWeight: 500, fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>
          Carrito
        </span>
      </button>

      <style>{`@media (max-width: 900px) { .bottom-nav { display: flex !important; } }`}</style>
    </nav>
  );
}
