import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEED_NAV_DROPDOWNS } from '../../data/seedData';

const LINKS = [
  { label: 'Nuevo',       href: '/catalogo?filtro=nuevo',       key: 'nuevo' },
  { label: 'Cabello',     href: '/catalogo?categoria=cabello',  key: 'cabello' },
  { label: 'Skincare',    href: '/catalogo?categoria=skincare', key: 'skincare' },
  { label: 'Accesorios',  href: '/catalogo?categoria=accesorios', key: 'accesorios' },
  { label: 'Marcas',      href: '/marcas',                      key: 'marcas' },
  { label: 'Ofertas',     href: '/catalogo?filtro=oferta',      key: 'ofertas' },
  { label: 'Hombres ♂',  href: '/hombres',                     key: 'hombres', isMen: true },
];

export function CategoryNav() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <nav
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
      }}
      className="cat-nav"
      onMouseLeave={() => setActiveDropdown(null)}
    >
      {LINKS.map(link => {
        const hasDropdown = SEED_NAV_DROPDOWNS[link.key]?.length > 0;
        return (
          <div
            key={link.key}
            style={{ position: 'relative' }}
            onMouseEnter={() => hasDropdown ? setActiveDropdown(link.key) : setActiveDropdown(null)}
          >
            <Link
              to={link.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '12px 18px',
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'var(--font-body)',
                color: link.isMen ? 'var(--pink)' : '#fff',
                whiteSpace: 'nowrap',
                borderBottom: activeDropdown === link.key ? '2px solid var(--pink)' : '2px solid transparent',
                transition: 'color 0.2s, border-color 0.2s',
                textDecoration: 'none',
              }}
              className={`cat-link cat-link-${link.key}`}
            >
              {link.label}
              {hasDropdown && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.6 }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              )}
            </Link>

            {/* Dropdown */}
            {hasDropdown && activeDropdown === link.key && (
              <div
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

                {/* "Ver todo" link at bottom */}
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
        @media (max-width: 900px) { .cat-nav { display: none; } }
        .cat-link:hover { color: var(--pink) !important; }
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </nav>
  );
}
