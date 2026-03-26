import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { CartIcon } from '../ui/CartIcon';

export function TopNav() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const cartCount = useCart(s => s.count());
  const openCart = useCart(s => s.openCart);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) navigate(`/catalogo?q=${encodeURIComponent(search.trim())}`);
  }

  return (
    <nav
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: 68,
        display: 'flex', alignItems: 'center', gap: 20,
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ flexShrink: 0 }}>
        <img
          src="/chlea-care-logo.svg"
          alt="Chlea Care"
          style={{ height: 57 }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </Link>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480, margin: '0 auto' }}>
        <div style={{ position: 'relative' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            style={{
              width: '100%',
              padding: '10px 16px 10px 44px',
              border: '1.5px solid var(--border2)',
              borderRadius: 'var(--r-pill)',
              fontSize: 14,
              background: 'var(--cream)',
              color: 'var(--text)',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--hot)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border2)')}
          />
          <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.45 }}
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
      </form>

      {/* Desktop right */}
      <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <Link to="/catalogo" style={{ fontSize: 14, color: 'var(--text-soft)', fontWeight: 500 }}>
          Mis Listas
        </Link>
        <Link to="/cuenta" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, borderRadius: '50%',
          color: 'var(--text-soft)', transition: 'color 0.2s, background 0.2s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--cream)'; (e.currentTarget as HTMLElement).style.color = 'var(--hot)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-soft)'; }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </Link>
        <button
          onClick={openCart}
          style={{
            position: 'relative',
            background: 'var(--hot)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--r-pill)',
            padding: '8px 18px',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer',
          }}
        >
          <CartIcon size={20} color="#fff" />
          Carrito
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              background: '#fff', color: 'var(--hot)',
              borderRadius: '50%', width: 20, height: 20,
              fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--hot)',
            }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile right */}
      <div className="nav-mobile" style={{ display: 'none', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <button onClick={openCart} style={{ position: 'relative', background: 'none', border: 'none', padding: 4, cursor: 'pointer' }}>
          <CartIcon size={26} color="var(--hot)" />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: -2, right: -4,
              background: 'var(--hot)', borderRadius: '50%',
              width: 16, height: 16, fontSize: 10, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
            }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
          .nav-mobile  { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
