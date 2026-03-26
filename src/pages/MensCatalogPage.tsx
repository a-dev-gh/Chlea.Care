import { useState, useMemo } from 'react';
import { SEED_PRODUCTS } from '../data/seedData';
import { ProductGrid } from '../components/product/ProductGrid';
import { formatPrice } from '../utils/formatPrice';

const SORT_OPTIONS = [
  { value: 'relevancia',  label: 'Relevancia' },
  { value: 'precio-asc',  label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
];

export function MensCatalogPage() {
  const [sort, setSort] = useState('relevancia');
  const [maxPrice, setMaxPrice] = useState(5000);

  const menProducts = SEED_PRODUCTS.filter(p => p.category === 'hombres' && p.is_visible);
  const allBrands = [...new Set(menProducts.map(p => p.brand).filter(Boolean))] as string[];
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const filtered = useMemo(() => {
    let result = [...menProducts];
    if (maxPrice < 5000) result = result.filter(p => p.price <= maxPrice);
    if (selectedBrands.length) result = result.filter(p => selectedBrands.includes(p.brand || ''));
    if (sort === 'precio-asc')  result.sort((a, b) => a.price - b.price);
    if (sort === 'precio-desc') result.sort((a, b) => b.price - a.price);
    return result;
  }, [maxPrice, selectedBrands, sort]);

  return (
    <div style={{ background: 'var(--deep)', minHeight: '100vh' }}>
      {/* Hero banner */}
      <div style={{
        padding: '64px 24px 48px',
        textAlign: 'center',
        background: 'linear-gradient(160deg, #552814 0%, #3d1d0e 100%)',
        borderBottom: '1px solid rgba(255,194,209,0.1)',
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 12, opacity: 0.8 }}>
          Línea Platinum
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
          fontWeight: 300, fontStyle: 'italic',
          color: 'var(--cream)',
          marginBottom: 12,
        }}>
          Para Hombres
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(254,250,251,0.55)', maxWidth: 420, margin: '0 auto' }}>
          Grooming premium para el hombre que cuida cada detalle.
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Filters row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 32, gap: 16, flexWrap: 'wrap',
        }}>
          <p style={{ fontSize: 14, color: 'rgba(254,250,251,0.5)' }}>
            {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {/* Price filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(254,250,251,0.5)' }}>Hasta</span>
              <input type="range" min={200} max={5000} step={100} value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                style={{ width: 100, accentColor: 'var(--pink)' }} />
              <span style={{ fontSize: 12, color: 'var(--pink)', fontWeight: 600, minWidth: 80 }}>
                {formatPrice(maxPrice)}
              </span>
            </div>
            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value)} style={{
              padding: '8px 14px', borderRadius: 'var(--r-sm)',
              border: '1px solid rgba(255,194,209,0.2)',
              fontSize: 13, fontWeight: 600,
              color: 'var(--cream)', background: 'rgba(255,255,255,0.06)',
              cursor: 'pointer', fontFamily: 'var(--font-body)', outline: 'none',
            }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Brand pills */}
        {allBrands.length > 1 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
            {allBrands.map(brand => {
              const active = selectedBrands.includes(brand);
              return (
                <button key={brand} onClick={() =>
                  setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand])
                } style={{
                  padding: '8px 18px', borderRadius: 'var(--r-pill)',
                  border: active ? '1.5px solid var(--pink)' : '1.5px solid rgba(255,194,209,0.2)',
                  background: active ? 'rgba(255,194,209,0.12)' : 'transparent',
                  color: active ? 'var(--pink)' : 'rgba(254,250,251,0.6)',
                  fontSize: 13, fontWeight: 600,
                  fontFamily: 'var(--font-body)', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                  {brand}
                </button>
              );
            })}
          </div>
        )}

        {/* Product grid */}
        {filtered.length > 0 ? (
          <ProductGrid products={filtered} isMen />
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 16, color: 'rgba(254,250,251,0.5)' }}>No hay productos con esos filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
