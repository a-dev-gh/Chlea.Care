import { useParams, Link } from 'react-router-dom';
import { SEED_BRANDS, SEED_PRODUCTS } from '../data/seedData';
import { ProductGrid } from '../components/product/ProductGrid';

export function BrandPage() {
  const { slug } = useParams<{ slug: string }>();
  const brand = SEED_BRANDS.find(b => b.slug === slug);

  if (!brand) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 16 }}>Marca no encontrada.</p>
        <Link to="/marcas" style={{ color: 'var(--hot)', fontWeight: 600 }}>← Volver a marcas</Link>
      </div>
    );
  }

  const products = SEED_PRODUCTS.filter(p => p.brand === brand.name && p.is_visible);

  return (
    <div>
      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg,#fff0f5 0%,var(--pink) 100%)',
        padding: '72px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--white)',
          margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36,
          boxShadow: 'var(--shadow-md)',
        }}>✨</div>
        <p className="section-label" style={{ marginBottom: 8 }}>Marca oficial</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 300, color: 'var(--text)' }}>
          {brand.name}
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-soft)', marginTop: 10 }}>{brand.tagline}</p>
      </div>

      {/* Products */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px' }}>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
          {products.length} producto{products.length !== 1 ? 's' : ''}
        </p>
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Próximamente productos de esta marca.
          </div>
        )}
      </div>
    </div>
  );
}
