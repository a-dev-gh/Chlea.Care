import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatPrice';
import { buildCartMessage, openWhatsApp } from '../../utils/whatsapp';

export function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQty, total } = useCart();

  function handleCheckout() {
    if (items.length === 0) return;
    openWhatsApp(buildCartMessage(items));
    closeCart();
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        style={{
          position: 'fixed', inset: 0, zIndex: 150,
          background: 'rgba(85,40,20,0.4)',
          backdropFilter: 'blur(6px)',
        }}
      />

      {/* Drawer */}
      <div
        className="animate-slide-in-right"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 151,
          width: '100%', maxWidth: 420,
          background: 'var(--white)',
          boxShadow: '-8px 0 40px rgba(85,40,20,0.18)',
          display: 'flex', flexDirection: 'column',
          animation: 'slideInRight 0.3s ease both',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, fontStyle: 'italic', color: 'var(--text)' }}>
            Mi Carrito
          </h2>
          <button onClick={closeCart} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 4,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 80 }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🛍️</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Tu carrito está vacío</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {items.map(item => (
                <div key={item.id} style={{
                  display: 'flex', gap: 14, alignItems: 'center',
                  padding: '14px', borderRadius: 'var(--r-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--cream)',
                }}>
                  {/* Placeholder thumb */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 'var(--r-sm)',
                    background: 'linear-gradient(135deg,#ffd6e7,#ffb3cb)',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}>
                    {item.image_url && <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: 14, color: 'var(--hot)', fontWeight: 700 }}>
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Qty */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        border: '1.5px solid var(--border2)',
                        background: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >−</button>
                    <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 600, fontSize: 14 }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        border: '1.5px solid var(--border2)',
                        background: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >+</button>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0 4px' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--border)',
            background: 'var(--cream)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 15, color: 'var(--text-soft)' }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--hot)' }}>{formatPrice(total())}</span>
            </div>
            <button
              onClick={handleCheckout}
              style={{
                width: '100%',
                background: '#25D366',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--r-pill)',
                padding: '15px',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Pedir por WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
}
