import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { CartIcon } from '../ui/CartIcon';
import { SEED_CATEGORIES, SEED_BRANDS } from '../../data/seedData';

const SEARCH_CATEGORIES = [
  { label: 'Todo', slug: '' },
  ...SEED_CATEGORIES.filter(c => !c.is_men).map(c => ({ label: c.name, slug: c.slug })),
];

const MENU_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Catálogo', href: '/catalogo' },
  { label: 'Marcas', href: '/marcas', expandable: true },
  { label: 'Hombres', href: '/hombres' },
  { label: 'Mi Cuenta', href: '/cuenta' },
];

export function TopNav() {
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchCat, setSearchCat] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [brandsExpanded, setBrandsExpanded] = useState(false);
  const navigate = useNavigate();
  const cartCount = useCart(s => s.count());
  const openCart = useCart(s => s.openCart);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (searchCat) params.set('categoria', searchCat);
    navigate(`/catalogo?${params.toString()}`);
    setSearchFocused(false);
  }

  return (
    <>
      <nav
        style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          padding: '0 24px',
          height: 68,
          display: 'flex', alignItems: 'center', gap: 16,
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

        {/* Search with category dropdown */}
        <div ref={searchRef} style={{ flex: 1, maxWidth: 520, margin: '0 auto', position: 'relative' }}>
          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
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
            />
            <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.45 }}
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </form>

          {/* Search dropdown — category quick filters */}
          {searchFocused && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              background: 'var(--white)',
              border: '1.5px solid var(--border2)',
              borderRadius: 'var(--r-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '12px',
              zIndex: 10,
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10, padding: '0 4px' }}>
                Buscar en
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SEARCH_CATEGORIES.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => { setSearchCat(cat.slug); }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 'var(--r-pill)',
                      border: searchCat === cat.slug ? '1.5px solid var(--hot)' : '1.5px solid var(--border2)',
                      background: searchCat === cat.slug ? 'rgba(235,25,130,0.08)' : 'var(--cream)',
                      color: searchCat === cat.slug ? 'var(--hot)' : 'var(--text-soft)',
                      fontSize: 13, fontWeight: 600,
                      fontFamily: 'var(--font-body)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="nav-icon-btn"
            title="Menú"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, borderRadius: '50%',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--deep)', transition: 'background 0.2s',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Heart / Mis Listas */}
          <Link
            to="/catalogo?filtro=favoritos"
            className="nav-icon-btn"
            title="Mis Listas"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, borderRadius: '50%',
              color: 'var(--deep)', transition: 'background 0.2s, color 0.2s',
              textDecoration: 'none',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </Link>

          {/* Profile */}
          <Link
            to="/cuenta"
            className="nav-icon-btn"
            title="Mi cuenta"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, borderRadius: '50%',
              color: 'var(--deep)', transition: 'background 0.2s, color 0.2s',
              textDecoration: 'none',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </Link>

          {/* Cart — icon only with badge */}
          <button
            onClick={openCart}
            className="nav-icon-btn"
            title="Carrito"
            style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, borderRadius: '50%',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--deep)', transition: 'background 0.2s',
            }}
          >
            <CartIcon size={24} color="var(--deep)" />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                background: 'var(--hot)', color: '#fff',
                borderRadius: '50%', minWidth: 18, height: 18,
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px',
                border: '2px solid #fff',
              }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <style>{`
          .nav-icon-btn:hover {
            background: var(--cream) !important;
            color: var(--hot) !important;
          }
        `}</style>
      </nav>

      {/* ── Hamburger Menu Drawer ── */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}>
          {/* Backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(85,40,20,0.45)',
              backdropFilter: 'blur(8px)',
              animation: 'fadeIn 0.2s ease',
            }}
          />

          {/* Drawer */}
          <div style={{
            position: 'relative', zIndex: 1,
            width: 340, maxWidth: '88vw',
            height: '100%',
            background: 'var(--white)',
            boxShadow: '6px 0 32px rgba(0,0,0,0.15)',
            display: 'flex', flexDirection: 'column',
            animation: 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            {/* Header — Logo + By Denisee Ventura */}
            <div style={{
              padding: '28px 28px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            }}>
              <div>
                <img src="/chlea-care-logo.svg" alt="Chlea Care" style={{ height: 44, marginBottom: 6 }} />
                <p style={{
                  fontSize: 11, fontStyle: 'italic',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: 0.3,
                }}>
                  By Denisee Ventura
                </p>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 4,
                  marginTop: 4,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Menu links with liquid underline effect */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
              {MENU_LINKS.map(link => (
                <div key={link.label}>
                  {link.expandable ? (
                    /* Expandable Brands section */
                    <>
                      <button
                        onClick={() => setBrandsExpanded(!brandsExpanded)}
                        className="menu-link"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          width: '100%',
                          padding: '16px 32px',
                          fontSize: 16, fontWeight: 500,
                          color: 'var(--text)',
                          fontFamily: 'var(--font-body)',
                          background: 'none', border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          position: 'relative',
                          transition: 'color 0.2s',
                        }}
                      >
                        <span>{link.label}</span>
                        <svg
                          width="16" height="16" viewBox="0 0 24 24"
                          fill="none" stroke="var(--text-muted)" strokeWidth="2"
                          style={{
                            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            transform: brandsExpanded ? 'rotate(180deg)' : 'rotate(0)',
                          }}
                        >
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </button>

                      {/* Expandable brand list */}
                      <div style={{
                        maxHeight: brandsExpanded ? 600 : 0,
                        overflow: 'hidden',
                        transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: 'var(--cream)',
                      }}>
                        {SEED_BRANDS.map(brand => (
                          <Link
                            key={brand.slug}
                            to={`/marcas/${brand.slug}`}
                            onClick={() => setMenuOpen(false)}
                            className="menu-link menu-sublink"
                            style={{
                              display: 'block',
                              padding: '11px 32px 11px 48px',
                              fontSize: 14, fontWeight: 400,
                              color: 'var(--text-soft)',
                              textDecoration: 'none',
                              position: 'relative',
                              transition: 'color 0.15s, padding-left 0.2s',
                            }}
                          >
                            {brand.name}
                          </Link>
                        ))}
                        <Link
                          to="/marcas"
                          onClick={() => setMenuOpen(false)}
                          style={{
                            display: 'block',
                            padding: '11px 32px 14px 48px',
                            fontSize: 13, fontWeight: 700,
                            color: 'var(--hot)',
                            textDecoration: 'none',
                          }}
                        >
                          Ver todas →
                        </Link>
                      </div>
                    </>
                  ) : (
                    /* Regular menu link */
                    <Link
                      to={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="menu-link"
                      style={{
                        display: 'block',
                        padding: '16px 32px',
                        fontSize: 16, fontWeight: 500,
                        color: 'var(--text)',
                        fontFamily: 'var(--font-body)',
                        textDecoration: 'none',
                        position: 'relative',
                        transition: 'color 0.2s',
                      }}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}

              {/* Cart link in menu */}
              <div style={{ borderTop: '1px solid var(--border)', margin: '8px 24px 0', paddingTop: 8 }}>
                <button
                  onClick={() => { setMenuOpen(false); openCart(); }}
                  className="menu-link"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    width: '100%',
                    padding: '16px 32px',
                    fontSize: 16, fontWeight: 500,
                    color: 'var(--text)',
                    fontFamily: 'var(--font-body)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                    position: 'relative',
                    transition: 'color 0.2s',
                  }}
                >
                  <CartIcon size={20} color="var(--hot)" />
                  Carrito
                  {cartCount > 0 && (
                    <span style={{
                      background: 'var(--hot)', color: '#fff',
                      borderRadius: 'var(--r-pill)',
                      padding: '2px 8px', fontSize: 11, fontWeight: 700,
                      marginLeft: 'auto',
                    }}>
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Footer — Social + WhatsApp */}
            <div style={{
              padding: '16px 28px 20px',
              borderTop: '1px solid var(--border)',
            }}>
              {/* Social icons row */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 14, justifyContent: 'center' }}>
                <a href="https://instagram.com/chlea.carerd" target="_blank" rel="noreferrer" className="nav-icon-btn"
                  style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-soft)', transition: 'all 0.2s' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                <a href="https://www.tiktok.com/@chlea.carerd" target="_blank" rel="noreferrer" className="nav-icon-btn"
                  style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-soft)', transition: 'all 0.2s' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                  </svg>
                </a>
                <a href="https://wa.me/18097756773" target="_blank" rel="noreferrer" className="nav-icon-btn"
                  style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-soft)', transition: 'all 0.2s' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                </a>
              </div>

              <a
                href="https://wa.me/18097756773"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 20px',
                  background: '#25D366',
                  color: '#fff',
                  borderRadius: 'var(--r-pill)',
                  fontSize: 14, fontWeight: 600,
                  textDecoration: 'none',
                  justifyContent: 'center',
                  transition: 'opacity 0.2s',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                Contáctanos por WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }

        /* Liquid underline effect for menu links */
        .menu-link {
          overflow: hidden;
        }
        .menu-link::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 32px;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--hot), #ff6b9d);
          border-radius: 2px;
          transition: width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .menu-link:hover::after {
          width: calc(100% - 64px);
        }
        .menu-link:hover {
          color: var(--hot) !important;
          background: rgba(235, 25, 130, 0.03);
        }

        .menu-sublink::after {
          left: 48px;
        }
        .menu-sublink:hover::after {
          width: calc(100% - 80px);
        }
        .menu-sublink:hover {
          padding-left: 54px !important;
        }
      `}</style>
    </>
  );
}
