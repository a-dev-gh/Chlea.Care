import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SEED_CATEGORIES } from '../data/seedData';
import { fetchBrands } from '../utils/db';
import { useProducts } from '../hooks/useProducts';
import type { Brand } from '../types/database';
import { getBrandsForCategory } from '../utils/brandFilters';

const CATEGORY_TABS = [
  { slug: 'todas', label: 'Todas' },
  ...SEED_CATEGORIES.map(c => ({ slug: c.slug, label: c.name })),
];

export function BrandsPage() {
  const [params, setParams] = useSearchParams();
  const activeTab = params.get('categoria') || 'todas';
  const [brands, setBrands] = useState<Brand[]>([]);
  const { allProducts } = useProducts();

  useEffect(() => {
    fetchBrands().then(setBrands);
  }, []);

  function setTab(slug: string) {
    const next = new URLSearchParams();
    if (slug !== 'todas') next.set('categoria', slug);
    setParams(next);
  }

  // Filter brands: only show brands with products AND a logo
  const filteredBrands = activeTab === 'todas'
    ? brands.filter(b => b.logo_url && allProducts.some(p => p.brand === b.name))
    : getBrandsForCategory(activeTab, allProducts, brands).filter(b => b.logo_url);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <p className="section-label" style={{ marginBottom: 8 }}>Curado con amor</p>
        <h1 className="section-title">Nuestras Marcas</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 12 }}>
          Seleccionadas cuidadosamente por Denisee para garantizar calidad y resultados reales.
        </p>
      </div>

      {/* Category filter tabs */}
      <div style={{
        display: 'flex', gap: 10, justifyContent: 'center',
        flexWrap: 'wrap', marginBottom: 40,
      }}>
        {CATEGORY_TABS.map(tab => {
          const active = activeTab === tab.slug;
          // Only show tab if it has brands (or it's "todas")
          if (tab.slug !== 'todas') {
            const brandsInTab = getBrandsForCategory(tab.slug, allProducts, brands).filter(b => b.logo_url);
            if (brandsInTab.length === 0) return null;
          }
          return (
            <button key={tab.slug} onClick={() => setTab(tab.slug)} style={{
              padding: '9px 22px',
              borderRadius: 'var(--r-pill)',
              border: active ? '1.5px solid var(--hot)' : '1.5px solid var(--border2)',
              background: active ? 'rgba(235,25,130,0.08)' : 'var(--white)',
              color: active ? 'var(--hot)' : 'var(--text-soft)',
              fontSize: 14, fontWeight: 600,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.borderColor = 'var(--hot)'; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Brands grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
        {filteredBrands.map(brand => {
          const count = allProducts.filter(p => p.brand === brand.name).length;
          return (
            <Link key={brand.slug} to={`/marcas/${brand.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)',
                padding: '40px 32px',
                transition: 'all 0.22s ease',
                cursor: 'pointer',
                textAlign: 'center',
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
                {/* Brand logo or initial */}
                <div style={{
                  height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  {brand.logo_url ? (
                    <img src={brand.logo_url} alt={brand.name} style={{
                      maxHeight: 56, maxWidth: 160, objectFit: 'contain',
                    }} />
                  ) : (
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%',
                      background: 'linear-gradient(135deg,var(--pink),#ffd6e7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600,
                      fontStyle: 'italic', color: 'var(--hot)',
                    }}>
                      {brand.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: 'var(--text)', marginBottom: 8 }}>
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

      {filteredBrands.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>No hay marcas en esta categoría aún.</p>
        </div>
      )}
    </div>
  );
}
