import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEED_PRODUCTS, SEED_CATEGORIES } from '../data/seedData';
import { ProductGrid } from '../components/product/ProductGrid';
import { formatPrice } from '../utils/formatPrice';

const SORT_OPTIONS = [
  { value: 'relevancia',  label: 'Relevancia' },
  { value: 'precio-asc',  label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'nuevo',       label: 'Más nuevo' },
];

const FILTER_PILLS = [
  { key: 'nuevo',      label: 'Nuevo',         icon: '✦' },
  { key: 'bestseller', label: 'Bestsellers',   icon: '🏆' },
  { key: 'oferta',     label: 'Ofertas',       icon: '🔥' },
  { key: 'vegano',     label: 'Vegano',        icon: '🌿' },
  { key: 'crueldad',   label: 'Sin Crueldad',  icon: '🐰' },
];

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState('relevancia');
  const [minPrice, setMinPrice] = useState(200);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [activePills, setActivePills] = useState<string[]>([]);
  const [priceOpen, setPriceOpen] = useState(true);
  const [brandOpen, setBrandOpen] = useState(true);
  // Track which label groups are open (all open by default)
  const [labelGroupsOpen, setLabelGroupsOpen] = useState<Record<string, boolean>>({});
  // Track selected label values per group
  const [selectedLabels, setSelectedLabels] = useState<Record<string, string[]>>({});

  const category  = params.get('categoria') || 'todos';
  const searchQ   = params.get('q') || '';

  // Only women's products in main catalog — men's is separate page
  const womenCategories = SEED_CATEGORIES.filter(c => !c.is_men);
  const allProducts = SEED_PRODUCTS.filter(p => p.is_visible && p.category !== 'hombres');
  const allBrands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))] as string[];

  // Collect dynamic label groups from products in current category
  const labelGroups = useMemo(() => {
    const productsInCategory = category === 'todos'
      ? allProducts
      : allProducts.filter(p => p.category === category);

    const groups: Record<string, Set<string>> = {};
    for (const p of productsInCategory) {
      if (!p.labels) continue;
      for (const [groupName, values] of Object.entries(p.labels)) {
        if (!groups[groupName]) groups[groupName] = new Set();
        for (const v of values) groups[groupName].add(v);
      }
    }

    // Convert to sorted arrays
    return Object.entries(groups)
      .map(([name, valuesSet]) => ({ name, values: [...valuesSet].sort() }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [category]);

  function setCategory(cat: string) {
    const next = new URLSearchParams(params);
    if (cat === 'todos') next.delete('categoria'); else next.set('categoria', cat);
    next.delete('q');
    setParams(next);
    // Reset label filters when category changes since labels are category-dependent
    setSelectedLabels({});
  }

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
    return labelGroupsOpen[name] !== false; // default open
  }

  const filtered = useMemo(() => {
    let result = [...allProducts];
    if (category !== 'todos') result = result.filter(p => p.category === category);
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

    // Apply dynamic label filters
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
  }, [category, searchQ, minPrice, maxPrice, selectedBrands, sort, activePills, selectedLabels]);

  // Collapsible filter section component
  const FilterSection = ({ title, isOpen, onToggle, children }: {
    title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode;
  }) => (
    <div style={{ marginBottom: 20 }}>
      <button onClick={onToggle} style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        width: '100%', padding: '8px 0', background: 'none', border: 'none',
        fontSize: 14, fontWeight: 600, color: 'var(--text)', cursor: 'pointer',
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
      {/* Page title in sidebar */}
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
        {category === 'todos' ? 'Catálogo' : ''}
      </p>
      <h2 style={{
        fontFamily: 'var(--font-body)', fontSize: 22, fontWeight: 700,
        color: 'var(--text)', marginBottom: 20,
        textTransform: 'capitalize',
      }}>
        {category === 'todos' ? 'Todo' : womenCategories.find(c => c.slug === category)?.name || 'Catálogo'}
      </h2>

      {/* Category list */}
      <div style={{ marginBottom: 28 }}>
        {[{ slug: 'todos', name: 'Todos' }, ...womenCategories].map(cat => {
          const count = cat.slug === 'todos'
            ? allProducts.length
            : allProducts.filter(p => p.category === cat.slug).length;
          const active = category === cat.slug;
          return (
            <button key={cat.slug} onClick={() => setCategory(cat.slug)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              width: '100%', padding: '8px 0',
              background: 'none',
              border: 'none',
              color: active ? 'var(--text)' : 'var(--text-soft)',
              fontSize: 14, fontWeight: active ? 700 : 400,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s',
              borderBottom: 'none',
            }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--text-soft)'; }}
            >
              <span>{cat.name}</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginBottom: 8 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
          Filtros
        </p>
      </div>

      {/* Price Range */}
      <FilterSection title="Rango de Precio" isOpen={priceOpen} onToggle={() => setPriceOpen(!priceOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Mín</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>RD$</span>
              <input
                type="number"
                min={200} max={maxPrice} step={100}
                value={minPrice}
                onChange={e => {
                  const v = Number(e.target.value);
                  if (v >= 200 && v <= maxPrice) setMinPrice(v);
                }}
                style={{
                  width: '100%', padding: '6px 8px', fontSize: 13,
                  border: '1.5px solid var(--border2)', borderRadius: 'var(--r-sm)',
                  fontFamily: 'var(--font-body)', color: 'var(--text)', outline: 'none',
                  background: 'var(--white)',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--hot)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border2)')}
              />
            </div>
          </div>
          <span style={{ marginTop: 18, color: 'var(--text-muted)' }}>—</span>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Máx</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>RD$</span>
              <input
                type="number"
                min={minPrice} max={5000} step={100}
                value={maxPrice}
                onChange={e => {
                  const v = Number(e.target.value);
                  if (v >= minPrice && v <= 5000) setMaxPrice(v);
                }}
                style={{
                  width: '100%', padding: '6px 8px', fontSize: 13,
                  border: '1.5px solid var(--border2)', borderRadius: 'var(--r-sm)',
                  fontFamily: 'var(--font-body)', color: 'var(--text)', outline: 'none',
                  background: 'var(--white)',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--hot)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border2)')}
              />
            </div>
          </div>
        </div>
        <input type="range" min={200} max={5000} step={100} value={maxPrice}
          onChange={e => setMaxPrice(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--hot)' }} />
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Marca" isOpen={brandOpen} onToggle={() => setBrandOpen(!brandOpen)}>
        {allBrands.map(brand => (
          <label key={brand} style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
            cursor: 'pointer', fontSize: 14, color: 'var(--text-soft)',
          }}>
            <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)}
              style={{ accentColor: 'var(--hot)', width: 16, height: 16 }} />
            {brand}
          </label>
        ))}
      </FilterSection>

      {/* Dynamic label groups — populated from product labels in current category */}
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
                cursor: 'pointer', fontSize: 14, color: selected ? 'var(--text)' : 'var(--text-soft)',
              }}>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleLabel(group.name, value)}
                  style={{ accentColor: 'var(--hot)', width: 16, height: 16 }}
                />
                {value}
              </label>
            );
          })}
        </FilterSection>
      ))}
    </aside>
  );

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 80px' }}>
      {/* Mobile filter button */}
      <button className="filter-btn-mobile" onClick={() => setFilterOpen(true)} style={{
        display: 'none', alignItems: 'center', gap: 8,
        background: 'var(--white)', border: '1.5px solid var(--border2)',
        borderRadius: 'var(--r-pill)', padding: '9px 18px',
        fontSize: 14, fontWeight: 600, color: 'var(--text)',
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
        <div className="sidebar-desktop"><Sidebar /></div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Filter pills row */}
          <div style={{
            display: 'flex', gap: 10, flexWrap: 'wrap',
            marginBottom: 20,
          }}>
            {FILTER_PILLS.map(pill => {
              const active = activePills.includes(pill.key);
              return (
                <button key={pill.key} onClick={() => togglePill(pill.key)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px',
                  borderRadius: 'var(--r-sm)',
                  border: active ? '2px solid var(--hot)' : '1.5px solid var(--border2)',
                  background: active ? 'rgba(235,25,130,0.06)' : 'var(--white)',
                  color: active ? 'var(--hot)' : 'var(--text-soft)',
                  fontSize: 13, fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.borderColor = 'var(--hot)'; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; }}
                >
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
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-soft)', fontWeight: 500 }}>Ordenar:</span>
              <select value={sort} onChange={e => setSort(e.target.value)} style={{
                padding: '7px 12px', borderRadius: 'var(--r-sm)',
                border: '1.5px solid var(--border2)',
                fontSize: 13, fontWeight: 600, color: 'var(--text)',
                background: 'var(--white)', cursor: 'pointer',
                fontFamily: 'var(--font-body)', outline: 'none',
              }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Product grid */}
          {filtered.length > 0 ? (
            <ProductGrid products={filtered} />
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
              <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>No encontramos productos con esos filtros.</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column' }}>
          <div onClick={() => setFilterOpen(false)} style={{ flex: 1, background: 'rgba(85,40,20,0.4)', backdropFilter: 'blur(6px)' }} />
          <div style={{
            background: 'var(--white)', borderRadius: 'var(--r-lg) var(--r-lg) 0 0',
            padding: '24px', maxHeight: '80vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400 }}>Filtros</h3>
              <button onClick={() => setFilterOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)' }}>✕</button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .sidebar-desktop { display: none !important; }
          .filter-btn-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
