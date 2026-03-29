import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEED_NAV_DROPDOWNS } from '../../data/seedData';

// All links for desktop
const ALL_LINKS = [
  { label: 'Nuevo',       href: '/catalogo?filtro=nuevo',         key: 'nuevo' },
  { label: 'Cabello',     href: '/catalogo?categoria=cabello',    key: 'cabello' },
  { label: 'Skincare',    href: '/catalogo?categoria=skincare',   key: 'skincare' },
  { label: 'Accesorios',  href: '/catalogo?categoria=accesorios', key: 'accesorios' },
  { label: 'Marcas',      href: '/marcas',                        key: 'marcas' },
  { label: 'Ofertas',     href: '/catalogo?filtro=oferta',        key: 'ofertas' },
  { label: 'Hombres ♂',  href: '/hombres',                       key: 'hombres', isMen: true },
];

// Mobile only shows main categories (room for a 4th via admin later)
const MOBILE_KEYS = ['cabello', 'skincare', 'accesorios'];

export function CategoryNav() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const openedByHover = useRef(false);

  // Close dropdown when tapping outside
  useEffect(() => {
    if (!activeDropdown) return;
    function handleOutsideClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    }
    // Small delay so the current click doesn't immediately close
    const timer = setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [activeDropdown]);

  return (
    <nav
      ref={navRef}
      style={{
        background: 'var(--deep)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        padding: '0 24px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        position: 'relative',
        zIndex: 40,
      }}
      className="cat-nav"
      onMouseLeave={() => setActiveDropdown(null)}
    >
      {ALL_LINKS.map(link => {
        const hasDropdown = SEED_NAV_DROPDOWNS[link.key]?.length > 0;
        const isOpen = activeDropdown === link.key;

        return (
          <div
            key={link.key}
            className={`cat-item cat-item-${link.key}`}
            style={{ position: 'relative' }}
            onMouseEnter={() => {
              if (hasDropdown) {
                openedByHover.current = true;
                setActiveDropdown(link.key);
              }
            }}
          >
            {/* Use button for items with dropdowns so click always works */}
            <button
              onClick={() => {
                if (hasDropdown) {
                  if (isOpen && !openedByHover.current) {
                    // Was opened by a previous click — second click navigates
                    setActiveDropdown(null);
                    navigate(link.href);
                  } else {
                    // First click or was opened by hover — keep open, reset flag
                    openedByHover.current = false;
                    setActiveDropdown(link.key);
                  }
                } else {
                  navigate(link.href);
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '12px 18px',
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'var(--font-body)',
                color: (link as any).isMen ? 'var(--pink)' : '#fff',
                whiteSpace: 'nowrap',
                borderBottom: isOpen ? '2px solid var(--pink)' : '2px solid transparent',
                transition: 'color 0.2s, border-color 0.2s',
                background: 'none',
                border: 'none',
                borderBottomStyle: 'solid',
                borderBottomWidth: 2,
                borderBottomColor: isOpen ? 'var(--pink)' : 'transparent',
                cursor: 'pointer',
              }}
              className={`cat-link cat-link-${link.key}`}
            >
              {link.label}
              {hasDropdown && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ opacity: 0.6, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              )}
            </button>

            {/* Dropdown */}
            {hasDropdown && isOpen && (
              <div
                className="cat-dropdown"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  minWidth: 220,
                  background: 'var(--white)',
                  borderRadius: '0 0 var(--r-md) var(--r-md)',
                  boxShadow: '0 8px 32px rgba(85,40,20,0.15)',
                  padding: '8px 0',
                  zIndex: 50,
                  animation: 'dropdownIn 0.15s ease',
                }}
              >
                {SEED_NAV_DROPDOWNS[link.key].map((item, i) => (
                  <Link
                    key={i}
                    to={item.href}
                    onClick={() => setActiveDropdown(null)}
                    style={{
                      display: 'block',
                      padding: '10px 20px',
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'var(--text-soft)',
                      textDecoration: 'none',
                      transition: 'background 0.12s, color 0.12s',
                      fontFamily: 'var(--font-body)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--cream)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--hot)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-soft)';
                    }}
                  >
                    {item.label}
                  </Link>
                ))}

                <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0 0', padding: '4px 0 0' }}>
                  <Link
                    to={link.href}
                    onClick={() => setActiveDropdown(null)}
                    style={{
                      display: 'block',
                      padding: '10px 20px',
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--hot)',
                      textDecoration: 'none',
                      letterSpacing: 0.5,
                    }}
                  >
                    Ver todo →
                  </Link>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        .cat-nav::-webkit-scrollbar { display: none; }
        .cat-link:hover { color: var(--pink) !important; }
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        @media (max-width: 900px) {
          .cat-nav {
            justify-content: center !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .cat-item-nuevo,
          .cat-item-marcas,
          .cat-item-ofertas,
          .cat-item-hombres { display: none !important; }

          .cat-nav .cat-link {
            padding: 11px 20px !important;
            font-size: 12px !important;
            font-weight: 600 !important;
          }

          .cat-item { position: static !important; }
          .cat-dropdown {
            position: absolute !important;
            top: 100% !important;
            left: 0 !important;
            right: 0 !important;
            transform: none !important;
            min-width: 0 !important;
            border-radius: 0 0 12px 12px !important;
            box-shadow: 0 12px 40px rgba(85,40,20,0.2) !important;
            z-index: 50 !important;
          }
        }
      `}</style>
    </nav>
  );
}
