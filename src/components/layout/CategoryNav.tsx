import { Link, useSearchParams } from 'react-router-dom';

const LINKS = [
  { label: 'Nuevo',       href: '/catalogo?filtro=nuevo' },
  { label: 'Cabello',     href: '/catalogo?categoria=cabello' },
  { label: 'Skincare',    href: '/catalogo?categoria=skincare' },
  { label: 'Accesorios',  href: '/catalogo?categoria=accesorios' },
  { label: 'Ropa',        href: '/catalogo?categoria=ropa' },
  { label: 'Marcas',      href: '/marcas' },
  { label: 'Ofertas',     href: '/catalogo?filtro=oferta' },
  { label: 'Hombres ♂',  href: '/hombres', isMen: true },
];

export function CategoryNav() {
  const [params] = useSearchParams();
  const currentCat = params.get('categoria');

  return (
    <nav
      style={{
        background: 'var(--deep)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '0 24px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
      className="cat-nav"
    >
      {LINKS.map(link => (
        <Link
          key={link.href}
          to={link.href}
          style={{
            display: 'inline-block',
            padding: '11px 16px',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'var(--font-body)',
            color: link.isMen ? 'var(--pink)' : '#fff',
            whiteSpace: 'nowrap',
            borderBottom: '2px solid transparent',
            transition: 'color 0.2s, border-color 0.2s',
            textDecoration: 'none',
          }}
          onMouseEnter={e => ((e.target as HTMLElement).style.color = link.isMen ? '#fff' : 'var(--pink)')}
          onMouseLeave={e => ((e.target as HTMLElement).style.color = link.isMen ? 'var(--pink)' : '#fff')}
        >
          {link.label}
        </Link>
      ))}
      <style>{`
        .cat-nav::-webkit-scrollbar { display: none; }
        @media (max-width: 900px) { .cat-nav { display: none; } }
      `}</style>
    </nav>
  );
}
