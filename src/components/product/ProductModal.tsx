import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useCart } from '../../hooks/useCart';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLists } from '../../hooks/useLists';
import { ListPicker } from './ListPicker';
import { formatPrice } from '../../utils/formatPrice';
import { buildProductInquiry, openWhatsApp } from '../../utils/whatsapp';
import { fetchProductReviews, submitProductReview, deleteProductReview } from '../../utils/db';
import type { DisplayProduct, ProductReview } from '../../types/database';

// ---------------------------------------------------------------------------
// Placeholder gradients per category
// ---------------------------------------------------------------------------
const PLACEHOLDERS: Record<string, string> = {
  cabello:    'linear-gradient(135deg,#ffd6e7 0%,#ffb3cb 100%)',
  skincare:   'linear-gradient(135deg,#fff0f5 0%,#ffc2d1 100%)',
  accesorios: 'linear-gradient(135deg,#ffe4f0 0%,#ffd0e4 100%)',
  ropa:       'linear-gradient(135deg,#ffeaf5 0%,#ffb3d1 100%)',
  hombres:    'linear-gradient(135deg,#6b3a2a 0%,#8b4a35 100%)',
};

// ---------------------------------------------------------------------------
// Star helpers
// ---------------------------------------------------------------------------
function Stars({ count, size = 14, color = 'var(--hot)' }: { count: number; size?: number; color?: string }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= count ? color : 'none'}
          stroke={color} strokeWidth="1.8">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

function ClickableStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <span style={{ display: 'inline-flex', gap: 4, cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={22} height={22} viewBox="0 0 24 24"
          fill={i <= (hover || value) ? 'var(--hot)' : 'none'}
          stroke="var(--hot)" strokeWidth="1.8"
          style={{ transition: 'transform 0.15s' }}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface ProductModalProps {
  product: DisplayProduct | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const addItem = useCart(s => s.addItem);
  const openCart = useCart(s => s.openCart);
  const { user, role } = useAuthContext();

  // Wishlist state
  const lists = useLists(s => s.lists);
  const toggleInList = useLists(s => s.toggleInList);
  const isInAnyList = useLists(s => s.isInAnyList);
  const [listPickerOpen, setListPickerOpen] = useState(false);

  const liked = product ? isInAnyList(product.id) : false;

  function handleHeartClick() {
    if (!product) return;
    if (lists.length === 1) {
      // Single list: direct toggle
      toggleInList(lists[0].id, product.id);
    } else {
      // Multiple lists: show picker
      setListPickerOpen(prev => !prev);
    }
  }

  // Multi-image state
  const allImages: string[] = product
    ? (product.image_urls && product.image_urls.length > 0
        ? product.image_urls
        : product.image_url ? [product.image_url] : [])
    : [];
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Real reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Reset all modal state when product changes
  useEffect(() => {
    setSelectedIdx(0);
    setShowReviewForm(false);
    setReviewRating(0);
    setReviewText('');
    setReviewSubmitted(false);
    setListPickerOpen(false);
  }, [product?.id]);

  // Fetch reviews from Supabase when the product changes
  useEffect(() => {
    if (!product) return;
    setReviewsLoading(true);
    fetchProductReviews(product.id).then(data => {
      setReviews(data);
      setReviewsLoading(false);
    });
  }, [product?.id]);

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

  async function handleSubmitReview() {
    if (reviewRating === 0 || !user || !product) return;
    const result = await submitProductReview({
      product_id: product.id,
      user_id: user.id,
      user_name: user.email?.split('@')[0] || 'Usuario',
      rating: reviewRating,
      text: reviewText,
    });
    if (result) {
      setReviews(prev => [result, ...prev]);
      setReviewSubmitted(true);
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewText('');
    }
  }

  // Delete a review (own user or admin)
  async function handleDeleteReview(reviewId: string) {
    const ok = await deleteProductReview(reviewId);
    if (ok) setReviews(prev => prev.filter(r => r.id !== reviewId));
  }

  // Compute average rating from real reviews (0 when no reviews yet)
  const avgRating = reviews.length
    ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
    : 0;

  const mainImage = allImages[selectedIdx] || allImages[0] || null;

  return (
    <Modal open={!!product} onClose={onClose} maxWidth={480}>
      {/* ── Image Gallery ── */}
      <div style={{
        height: 260,
        background: mainImage ? undefined : (PLACEHOLDERS[product.category] || PLACEHOLDERS.cabello),
        position: 'relative',
        borderRadius: 'var(--r-lg) var(--r-lg) 0 0',
        overflow: 'hidden',
      }}>
        {mainImage && (
          <img src={mainImage} alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        {(product.badge || product.sale_percent > 0) && (
          <div style={{ position: 'absolute', top: 14, left: 14 }}>
            <Badge text={product.badge} salePercent={product.sale_percent} />
          </div>
        )}

        {/* Wishlist heart button */}
        <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={handleHeartClick}
              title={liked ? 'Quitar de lista' : 'Guardar en lista'}
              style={{
                background: 'rgba(255,255,255,0.92)',
                border: 'none', borderRadius: 'var(--r-pill)',
                padding: '7px 14px',
                display: 'flex', alignItems: 'center', gap: 6,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(85,40,20,0.12)',
                fontFamily: 'var(--font-body)',
                fontSize: 12, fontWeight: 600,
                color: liked ? 'var(--hot)' : 'var(--deep)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.05)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24"
                fill={liked ? 'var(--hot)' : 'none'}
                stroke="var(--hot)" strokeWidth="2.2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {liked ? 'Guardado' : 'Guardar'}
            </button>
            {listPickerOpen && (
              <ListPicker productId={product.id} onClose={() => setListPickerOpen(false)} />
            )}
          </div>
        </div>

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

      {/* Thumbnail strip (only when multiple images) */}
      {allImages.length > 1 && (
        <div style={{
          display: 'flex', gap: 8, padding: '10px 28px 0',
          overflowX: 'auto',
        }}>
          {allImages.map((url, i) => (
            <button key={i} onClick={() => setSelectedIdx(i)} style={{
              width: 52, height: 52, flexShrink: 0,
              borderRadius: 'var(--r-sm)',
              overflow: 'hidden',
              border: i === selectedIdx ? '2px solid var(--hot)' : '2px solid var(--border)',
              cursor: 'pointer',
              padding: 0, background: 'none',
              opacity: i === selectedIdx ? 1 : 0.7,
              transition: 'opacity 0.2s, border-color 0.2s',
            }}>
              <img src={url} alt={`${product.name} ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}

      {/* ── Content ── */}
      <div style={{ padding: '24px 28px 28px' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          {product.brand} · {product.category}
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, color: 'var(--text)', marginBottom: 10, lineHeight: 1.2 }}>
          {product.name}
        </h2>
        <div
          style={{ fontSize: 14, color: 'var(--text-soft)', lineHeight: 1.65, marginBottom: 18 }}
          dangerouslySetInnerHTML={{ __html: product.description }}
        />

        {/* ── Price ── */}
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

        {/* ── By-request disclaimer ── */}
        {product.is_by_request && (
          <div style={{
            background: 'rgba(37, 211, 102, 0.08)',
            border: '1px solid rgba(37, 211, 102, 0.25)',
            borderRadius: 'var(--r-sm)',
            padding: '10px 14px',
            marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.5, margin: 0 }}>
              Este producto se solicita por pedido especial. Contactanos por WhatsApp para consultar disponibilidad y tiempo de entrega.
            </p>
          </div>
        )}

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
          {product.is_by_request ? (
            <Button onClick={handleWA} variant="whatsapp" fullWidth size="lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Solicitar por WhatsApp
            </Button>
          ) : (
            <>
              <Button onClick={handleAdd} fullWidth size="lg">
                Añadir al carrito
              </Button>
              <Button onClick={handleWA} variant="whatsapp" fullWidth size="lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                Preguntar por WhatsApp
              </Button>
            </>
          )}
        </div>

        {/* ── Reviews Section ── */}
        <div style={{
          marginTop: 32,
          borderTop: '1px solid var(--border)',
          paddingTop: 24,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400,
              color: 'var(--text)', margin: 0,
            }}>
              Opiniones de clientes
            </h3>
            {reviews.length > 0 && <Stars count={avgRating} size={16} />}
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              ({reviews.length})
            </span>
          </div>

          {/* Review list — loading / empty / populated */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
            {reviewsLoading ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                Cargando opiniones...
              </p>
            ) : reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Aún no hay opiniones sobre este producto.
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Sé la primera en opinar!
                </p>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} style={{
                  display: 'flex', gap: 12,
                  padding: 14,
                  background: 'var(--cream)',
                  borderRadius: 'var(--r-sm)',
                  position: 'relative',
                }}>
                  {/* Avatar initial */}
                  <div style={{
                    width: 36, height: 36, flexShrink: 0,
                    borderRadius: '50%',
                    background: 'var(--pink)',
                    color: 'var(--hot)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700,
                  }}>
                    {review.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{review.user_name}</span>
                      <Stars count={review.rating} size={12} />
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.5, margin: 0 }}>
                      {review.text}
                    </p>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'inline-block' }}>
                      {new Date(review.created_at).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {/* Delete button — visible to own user or admin roles */}
                  {(user?.id === review.user_id || role === 'super_admin' || role === 'owner') && (
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      title="Eliminar opinión"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', padding: 4, fontSize: 14,
                        opacity: 0.6, transition: 'opacity 0.2s',
                        position: 'absolute', top: 10, right: 10,
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '0.6')}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Review submission area */}
          {reviewSubmitted ? (
            <p style={{
              fontSize: 13, color: 'var(--hot)', fontWeight: 600,
              textAlign: 'center', padding: '12px 0',
            }}>
              ¡Gracias! Tu opinión será revisada antes de publicarse.
            </p>
          ) : user ? (
            showReviewForm ? (
              <div style={{
                background: 'var(--cream)',
                borderRadius: 'var(--r-sm)',
                padding: 16,
              }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    Tu calificación
                  </label>
                  <ClickableStars value={reviewRating} onChange={setReviewRating} />
                </div>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Cuenta tu experiencia con este producto..."
                  rows={3}
                  style={{
                    width: '100%',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)',
                    padding: '10px 12px',
                    fontSize: 13,
                    fontFamily: 'var(--font-body)',
                    color: 'var(--text)',
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--hot)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={handleSubmitReview} style={{
                    background: 'var(--hot)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--r-pill)',
                    padding: '8px 20px',
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                    cursor: reviewRating > 0 ? 'pointer' : 'not-allowed',
                    opacity: reviewRating > 0 ? 1 : 0.5,
                  }}>
                    Enviar opinión
                  </button>
                  <button onClick={() => setShowReviewForm(false)} style={{
                    background: 'none',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-pill)',
                    padding: '8px 16px',
                    fontSize: 13,
                    fontFamily: 'var(--font-body)',
                    cursor: 'pointer',
                  }}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowReviewForm(true)} style={{
                background: 'none',
                color: 'var(--hot)',
                border: '1px solid var(--hot)',
                borderRadius: 'var(--r-pill)',
                padding: '9px 22px',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                width: '100%',
              }}>
                Escribir una opinión
              </button>
            )
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
              <Link to="/cuenta" onClick={onClose} style={{ color: 'var(--hot)', fontWeight: 600, textDecoration: 'none' }}>
                Inicia sesión
              </Link>
              {' '}para dejar tu opinión
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
