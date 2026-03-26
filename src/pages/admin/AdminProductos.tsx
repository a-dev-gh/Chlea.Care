import { useState } from 'react';
import { SEED_PRODUCTS, type SeedProduct } from '../../data/seedData';
import { formatPrice } from '../../utils/formatPrice';
import { Badge } from '../../components/ui/Badge';

export function AdminProductos() {
  const [products] = useState<SeedProduct[]>(SEED_PRODUCTS);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--text)' }}>Productos</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{products.length} productos</p>
        </div>
        <button style={{
          background: 'var(--hot)', color: '#fff',
          border: 'none', borderRadius: 'var(--r-pill)',
          padding: '10px 22px', fontSize: 14, fontWeight: 600,
          fontFamily: 'var(--font-body)', cursor: 'pointer',
        }}>
          + Nuevo Producto
        </button>
      </div>

      <div style={{ background: 'var(--white)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--cream)' }}>
              {['Producto', 'Categoría', 'Precio', 'Badge', 'Oferta', 'Visible'].map(h => (
                <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'left' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={p.id} style={{
                borderBottom: i < products.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.15s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(235,25,130,0.03)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: 'linear-gradient(135deg,#ffd6e7,#ffb3cb)',
                      flexShrink: 0,
                    }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{p.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.brand}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-soft)', textTransform: 'capitalize' }}>
                  {p.category}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: 'var(--hot)' }}>
                  {formatPrice(p.price)}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {p.badge && <Badge text={p.badge} />}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: p.sale_percent > 0 ? 'var(--hot)' : 'var(--text-muted)' }}>
                  {p.sale_percent > 0 ? `${p.sale_percent}%` : '—'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{
                    width: 36, height: 20, borderRadius: 10,
                    background: p.is_visible ? 'var(--hot)' : 'var(--border2)',
                    position: 'relative', cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}>
                    <div style={{
                      position: 'absolute', top: 2,
                      left: p.is_visible ? 18 : 2,
                      width: 16, height: 16, borderRadius: '50%',
                      background: '#fff', transition: 'left 0.2s',
                    }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
