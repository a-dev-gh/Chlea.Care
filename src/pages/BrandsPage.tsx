import { Link } from 'react-router-dom';
import { SEED_BRANDS, SEED_PRODUCTS } from '../data/seedData';

const EMOJIS = ['✨', '💫', '🌿', '⚡'];

export function BrandsPage() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <p className="section-label" style={{ marginBottom: 8 }}>Curado con amor</p>
        <h1 className="section-title">Nuestras Marcas</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 12 }}>
          Seleccionadas cuidadosamente por Denisee para garantizar calidad y resultados reales.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
        {SEED_BRANDS.map((brand, i) => {
          const count = SEED_PRODUCTS.filter(p => p.brand === brand.name).length;
          return (
            <Link key={brand.slug} to={`/marcas/${brand.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)',
                padding: '40px 32px',
                transition: 'all 0.22s ease',
                cursor: 'pointer',
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'translateY(-6px)';
                  el.style.boxShadow = 'var(--shadow-md)';
                  el.style.borderColor = 'var(--border2)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'none';
                  el.style.borderColor = 'var(--border)';
                }}
              >
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg,var(--pink),#ffd6e7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, marginBottom: 20,
                }}>
                  {EMOJIS[i] || '✨'}
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, color: 'var(--text)', marginBottom: 8 }}>
                  {brand.name}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                  {brand.tagline}
                </p>
                <p style={{ fontSize: 13, color: 'var(--hot)', fontWeight: 600 }}>
                  {count} producto{count !== 1 ? 's' : ''} →
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
