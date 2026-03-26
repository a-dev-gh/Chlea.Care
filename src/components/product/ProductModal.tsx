import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatPrice';
import { buildProductInquiry, openWhatsApp } from '../../utils/whatsapp';
import type { SeedProduct } from '../../data/seedData';

const PLACEHOLDERS: Record<string, string> = {
  cabello:    'linear-gradient(135deg,#ffd6e7 0%,#ffb3cb 100%)',
  skincare:   'linear-gradient(135deg,#fff0f5 0%,#ffc2d1 100%)',
  accesorios: 'linear-gradient(135deg,#ffe4f0 0%,#ffd0e4 100%)',
  ropa:       'linear-gradient(135deg,#ffeaf5 0%,#ffb3d1 100%)',
  hombres:    'linear-gradient(135deg,#6b3a2a 0%,#8b4a35 100%)',
};

interface ProductModalProps {
  product: SeedProduct | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const addItem = useCart(s => s.addItem);
  const openCart = useCart(s => s.openCart);

  if (!product) return null;

  const salePrice = product.sale_percent
    ? Math.round(product.price * (1 - product.sale_percent / 100))
    : null;

  function handleAdd() {
    addItem({ id: product!.id, name: product!.name, price: salePrice ?? product!.price });
    openCart();
    onClose();
  }

  function handleWA() {
    openWhatsApp(buildProductInquiry(product!.name));
  }

  return (
    <Modal open={!!product} onClose={onClose} maxWidth={480}>
      {/* Image */}
      <div style={{
        height: 260,
        background: product.image_url ? undefined : (PLACEHOLDERS[product.category] || PLACEHOLDERS.cabello),
        position: 'relative',
        borderRadius: 'var(--r-lg) var(--r-lg) 0 0',
        overflow: 'hidden',
      }}>
        {product.image_url && (
          <img src={product.image_url} alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        {(product.badge || product.sale_percent > 0) && (
          <div style={{ position: 'absolute', top: 14, left: 14 }}>
            <Badge text={product.badge} salePercent={product.sale_percent} />
          </div>
        )}
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14,
          background: 'rgba(255,255,255,0.85)',
          border: 'none', borderRadius: '50%',
          width: 34, height: 34, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 28px 28px' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          {product.brand} · {product.category}
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, color: 'var(--text)', marginBottom: 10, lineHeight: 1.2 }}>
          {product.name}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-soft)', lineHeight: 1.65, marginBottom: 18 }}>
          {product.description}
        </p>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 24 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--hot)' }}>
            {formatPrice(salePrice ?? product.price)}
          </span>
          {salePrice && (
            <span style={{ fontSize: 15, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
          <Button onClick={handleAdd} fullWidth size="lg">
            Añadir al carrito
          </Button>
          <Button onClick={handleWA} variant="whatsapp" fullWidth size="lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            Preguntar por WhatsApp
          </Button>
        </div>
      </div>
    </Modal>
  );
}
