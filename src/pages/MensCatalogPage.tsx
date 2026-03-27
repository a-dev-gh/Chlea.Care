import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEED_PRODUCTS } from '../data/seedData';
import { ProductGrid } from '../components/product/ProductGrid';
import { formatPrice } from '../utils/formatPrice';

const SORT_OPTIONS = [
  { value: 'relevancia',  label: 'Relevancia' },
  { value: 'precio-asc',  label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'nuevo',       label: 'Más nuevo' },
];

const FILTER_PILLS = [
  { key: 'nuevo',      label: 'Nuevo',       icon: '✦' },
  { key: 'bestseller', label: 'Bestsellers', icon: '🏆' },
  { key: 'oferta',     label: 'Ofertas',     icon: '🔥' },
];

export function MensCatalogPage() {
  const [params] = useSearchParams();
  const [sort, setSort] = useState('relevancia');
  const [minPrice, setMinPrice] = useState(200);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [activePills, setActivePills] = useState<string[]>([]);
  const [priceOpen, setPriceOpen] = useState(true);
  const [brandOpen, setBrandOpen] = useState(true);
  const [labelGroupsOpen, setLabelGroupsOpen] = useState<Record<string, boolean>>({});
  const [selectedLabels, setSelectedLabels] = useState<Record<string, string[]>>({});

  const searchQ = params.get('q') || '';
  const menProducts = SEED_PRODUCTS.filter(p => p.category === 'hombres' && p.is_visible);
  const allBrands = [...new Set(menProducts.map(p => p.brand).filter(Boolean))] as string[];

  // Collect dynamic label groups
  const labelGroups = useMemo(() => {
    const groups: Record<string, Set<string>> = {};
    for (const p of menProducts) {
      if (!p.labels) continue;
      for (const [groupName, values] of Object.entries(p.labels)) {
        if (!groups[groupName]) groups[groupName] = new Set();
        for (const v of values) groups[groupName].add(v);
      }
    }
    return Object.entries(groups)
      .map(([name, valuesSet]) => ({ name, values: [...valuesSet].sort() }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  function togglePill(key: string) {
    setActivePills(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }

  function toggleBrand(brand: string) {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  }

  function toggleLabel(group: string, value: string) {
    setSelectedLabels(prev => {
      const current = prev[group] || [];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [group]: next };
    });
  }

  function isLabelGroupOpen(name: string) {
    return labelGroupsOpen[name] !== false;
  }

  const filtered = useMemo(() => {
    let result = [...menProducts];
    if (searchQ) {
      const q = searchQ.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (activePills.includes('oferta'))     result = result.filter(p => p.sale_percent > 0);
    if (activePills.includes('nuevo'))      result = result.filter(p => p.badge === 'Nuevo');
    if (activePills.includes('bestseller')) result = result.filter(p => p.badge === 'Bestseller');
    if (minPrice > 200) result = result.filter(p => p.price >= minPrice);
    if (maxPrice < 5000) result = result.filter(p => p.price <= maxPrice);
    if (selectedBrands.length) result = result.filter(p => selectedBrands.includes(p.brand || ''));

    for (const [group, values] of Object.entries(selectedLabels)) {
      if (values.length === 0) continue;
      result = result.filter(p => {
        const productLabels = p.labels?.[group];
        if (!productLabels) return false;
        return values.some(v => productLabels.includes(v));
      });
    }

    if (sort === 'precio-asc')  result.sort((a, b) => a.price - b.price);
    if (sort === 'precio-desc') result.sort((a, b) => b.price - a.price);
    return result;
  }, [searchQ, minPrice, maxPrice, selectedBrands, sort, activePills, selectedLabels]);

  const FilterSection = ({ title, isOpen, onToggle, children }: {
    title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode;
  }) => (
    <div style={{ marginBottom: 20 }}>
      <button onClick={onToggle} style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        width: '100%', padding: '8px 0', background: 'none', border: 'none',
        fontSize: 14, fontWeight: 600, color: 'var(--cream)', cursor: 'pointer',
        fontFamily: 'var(--font-body)',
      }}>
        {title}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {isOpen && <div style={{ paddingTop: 10 }}>{children}</div>}
    </div>
  );

  const Sidebar = () => (
    <aside style={{ width: 240, flexShrink: 0 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 8, opacity: 0.8 }}>
        Línea Platinum
      </p>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 300,
        fontStyle: 'italic', color: 'var(--cream)', marginBottom: 24,
      }}>
        Para Hombres
      </h2>

      <div style={{ borderTop: '1px solid rgba(255,194,209,0.15)', paddingTop: 20, marginBottom: 8 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--pink)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16, opacity: 0.7 }}>
          Filtros
        </p>
      </div>

      {/* Price Range */}
      <FilterSection title="Rango de Precio" isOpen={priceOpen} onToggle={() => setPriceOpen(!priceOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: 'rgba(254,250,251,0.5)', display: 'block', marginBottom: 4 }}>Mín</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'rgba(254,250,251,0.5)' }}>RD$</span>
              <input
                type="number" min={200} max={maxPrice} step={100} value={minPrice}
                onChange={e => { const v = Number(e.target.value); if (v >= 200 && v <= maxPrice) setMinPrice(v); }}
                style={{
                  width: '100%', padding: '6px 8px', fontSize: 13,
                  border: '1px solid rgba(255,194,209,0.2)', borderRadius: 'var(--r-sm)',
                  fontFamily: 'var(--font-body)', color: 'var(--cream)',
                  outline: 'none', background: 'rgba(255,255,255,0.06)',
                }}
              />
            </div>
          </div>
          <span style={{ marginTop: 18, color: 'rgba(254,250,251,0.4)' }}>—</span>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: 'rgba(254,250,251,0.5)', display: 'block', marginBottom: 4 }}>Máx</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'rgba(254,250,251,0.5)' }}>RD$</span>
              <input
                type="number" min={minPrice} max={5000} step={100} value={maxPrice}
                onChange={e => { const v = Number(e.target.value); if (v >= minPrice && v <= 5000) setMaxPrice(v); }}
                style={{
                  width: '100%', padding: '6px 8px', fontSize: 13,
                  border: '1px solid rgba(255,194,209,0.2)', borderRadius: 'var(--r-sm)',
                  fontFamily: 'var(--font-body)', color: 'var(--cream)',
                  outline: 'none', background: 'rgba(255,255,255,0.06)',
                }}
              />
            </div>
          </div>
        </div>
        <input type="range" min={200} max={5000} step={100} value={maxPrice}
          onChange={e => setMaxPrice(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--pink)' }} />
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Marca" isOpen={brandOpen} onToggle={() => setBrandOpen(!brandOpen)}>
        {allBrands.map(brand => (
          <label key={brand} style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
            cursor: 'pointer', fontSize: 14, color: 'rgba(254,250,251,0.65)',
          }}>
            <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)}
              style={{ accentColor: 'var(--pink)', width: 16, height: 16 }} />
            {brand}
          </label>
        ))}
      </FilterSection>

      {/* Dynamic labels */}
      {labelGroups.map(group => (
        <FilterSection
          key={group.name}
          title={group.name}
          isOpen={isLabelGroupOpen(group.name)}
          onToggle={() => setLabelGroupsOpen(prev => ({ ...prev, [group.name]: !isLabelGroupOpen(group.name) }))}
        >
          {group.values.map(value => {
            const selected = (selectedLabels[group.name] || []).includes(value);
            return (
              <label key={value} style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
                cursor: 'pointer', fontSize: 14, color: selected ? 'var(--cream)' : 'rgba(254,250,251,0.65)',
              }}>
                <input type="checkbox" checked={selected} onChange={() => toggleLabel(group.name, value)}
                  style={{ accentColor: 'var(--pink)', width: 16, height: 16 }} />
                {value}
              </label>
            );
          })}
        </FilterSection>
      ))}
    </aside>
  );

  return (
    <div style={{ background: 'var(--deep)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Mobile filter button */}
        <button className="men-filter-btn" onClick={() => setFilterOpen(true)} style={{
          display: 'none', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,194,209,0.2)',
          borderRadius: 'var(--r-pill)', padding: '9px 18px',
          fontSize: 14, fontWeight: 600, color: 'var(--cream)',
          fontFamily: 'var(--font-body)', cursor: 'pointer',
          marginBottom: 20,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
            <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
            <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/>
            <line x1="17" y1="16" x2="23" y2="16"/>
          </svg>
          Filtros
        </button>

        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
          {/* Desktop sidebar */}
          <div className="men-sidebar-desktop"><Sidebar /></div>

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Filter pills */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              {FILTER_PILLS.map(pill => {
                const active = activePills.includes(pill.key);
                return (
                  <button key={pill.key} onClick={() => togglePill(pill.key)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 18px', borderRadius: 'var(--r-sm)',
                    border: active ? '2px solid var(--pink)' : '1.5px solid rgba(255,194,209,0.2)',
                    background: active ? 'rgba(255,194,209,0.1)' : 'rgba(255,255,255,0.04)',
                    color: active ? 'var(--pink)' : 'rgba(254,250,251,0.6)',
                    fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
                    cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                  }}>
                    <span style={{ fontSize: 15 }}>{pill.icon}</span>
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Results count + sort */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 24, gap: 12,
            }}>
              <p style={{ fontSize: 14, color: 'rgba(254,250,251,0.5)' }}>
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: 'rgba(254,250,251,0.5)', fontWeight: 500 }}>Ordenar:</span>
                <select value={sort} onChange={e => setSort(e.target.value)} style={{
                  padding: '7px 12px', borderRadius: 'var(--r-sm)',
                  border: '1px solid rgba(255,194,209,0.2)',
                  fontSize: 13, fontWeight: 600, color: 'var(--cream)',
                  background: 'rgba(255,255,255,0.06)', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', outline: 'none',
                }}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

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

        {/* Mobile filter drawer */}
        {filterOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column' }}>
            <div onClick={() => setFilterOpen(false)} style={{ flex: 1, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} />
            <div style={{
              background: 'var(--deep)', borderRadius: 'var(--r-lg) var(--r-lg) 0 0',
              padding: '24px', maxHeight: '80vh', overflowY: 'auto',
              border: '1px solid rgba(255,194,209,0.1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: 'var(--cream)' }}>Filtros</h3>
                <button onClick={() => setFilterOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--pink)' }}>✕</button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        <style>{`
          @media (max-width: 900px) {
            .men-sidebar-desktop { display: none !important; }
            .men-filter-btn { display: flex !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
