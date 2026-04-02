import { useState } from 'react';
import { Badge } from '../ui/Badge';
import { useCart } from '../../hooks/useCart';
import { useLists } from '../../hooks/useLists';
import { ListPicker } from './ListPicker';
import { formatPrice } from '../../utils/formatPrice';
import type { SeedProduct } from '../../data/seedData';

interface ProductCardProps {
  product: SeedProduct;
  isMen?: boolean;
  onOpenModal?: (p: SeedProduct) => void;
}

// Soft gradient placeholders per category
const PLACEHOLDERS: Record<string, string> = {
  cabello:    'linear-gradient(135deg,#ffd6e7 0%,#ffb3cb 100%)',
  skincare:   'linear-gradient(135deg,#fff0f5 0%,#ffc2d1 100%)',
  accesorios: 'linear-gradient(135deg,#ffe4f0 0%,#ffd0e4 100%)',
  ropa:       'linear-gradient(135deg,#ffeaf5 0%,#ffb3d1 100%)',
  hombres:    'linear-gradient(135deg,#6b3a2a 0%,#8b4a35 100%)',
};

export function ProductCard({ product, isMen = false, onOpenModal }: ProductCardProps) {
  const addItem = useCart(s => s.addItem);
  const openCart = useCart(s => s.openCart);
  const lists = useLists(s => s.lists);
  const toggleInList = useLists(s => s.toggleInList);
  const isInAnyList = useLists(s => s.isInAnyList);
  const [adding, setAdding] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const liked = isInAnyList(product.id);

  function handleHeartClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (lists.length === 1) {
      // Single list: direct toggle (same UX as before)
      toggleInList(lists[0].id, product.id);
    } else {
      // Multiple lists: show picker
      setPickerOpen(prev => !prev);
    }
  }

  const salePrice = product.sale_percent
    ? Math.round(product.price * (1 - product.sale_percent / 100))
    : null;

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    addItem({ id: product.id, name: product.name, price: salePrice ?? product.price });
    setAdding(true);
    setTimeout(() => setAdding(false), 1200);
    openCart();
  }

  const bg = isMen ? 'var(--deep)' : 'var(--white)';
  const textColor = isMen ? 'var(--cream)' : 'var(--text)';
  const subColor = isMen ? 'var(--men-accent)' : 'var(--text-soft)';

  return (
    <div
      onClick={() => onOpenModal?.(product)}
      style={{
        background: bg,
        borderRadius: 'var(--r-md)',
        border: isMen ? '1px solid rgba(255,194,209,0.15)' : '1px solid var(--border)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Image area — prefer first of image_urls, fall back to image_url */}
      <div style={{
        position: 'relative',
        height: 240,
        background: (product.image_urls?.[0] || product.image_url) ? undefined : (PLACEHOLDERS[product.category] || PLACEHOLDERS.cabello),
        overflow: 'hidden',
      }}>
        {(product.image_urls?.[0] || product.image_url) && (
          <img src={product.image_urls?.[0] || product.image_url!} alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}

        {/* Badge top-left */}
        {(product.badge || product.sale_percent > 0) && (
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <Badge text={product.badge} salePercent={product.sale_percent} />
          </div>
        )}

        {/* Wishlist top-right */}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <button
            onClick={handleHeartClick}
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: 'none', borderRadius: '50%',
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'transform 0.2s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.15)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24"
              fill={liked ? 'var(--hot)' : 'none'}
              stroke="var(--hot)" strokeWidth="2.2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          {pickerOpen && (
            <ListPicker productId={product.id} onClose={() => setPickerOpen(false)} />
          )}
        </div>
      </div>

      {/* Info — Sephora-style: brand bold, name, description, price + add */}
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p style={{ fontSize: 13, color: textColor, fontWeight: 700, lineHeight: 1.3 }}>
          {product.brand}
        </p>
        <h3 style={{ fontSize: 14, fontWeight: 400, color: isMen ? 'rgba(254,250,251,0.8)' : 'var(--text-soft)', lineHeight: 1.4 }}>
          {product.name}
        </h3>
        <p style={{
          fontSize: 12, color: isMen ? 'rgba(254,250,251,0.5)' : 'var(--text-muted)',
          lineHeight: 1.5, marginTop: 2,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {product.description}
        </p>

        <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 700, color: isMen ? 'var(--pink)' : 'var(--text)' }}>
              {formatPrice(salePrice ?? product.price)}
            </span>
            {salePrice && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: 6 }}>
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            style={{
              background: adding ? '#25D366' : 'var(--hot)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--r-pill)',
              padding: '7px 16px',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              transition: 'background 0.3s',
              whiteSpace: 'nowrap',
            }}
          >
            {adding ? '✓ Añadido' : 'Añadir'}
          </button>
        </div>
      </div>
    </div>
  );
}
