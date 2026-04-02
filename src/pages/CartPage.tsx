import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatPrice';
import { openWhatsApp } from '../utils/whatsapp';
import { insertOrder } from '../utils/db';

// ── Types ────────────────────────────────────────────────────────────────────

type PaymentMethod = 'transferencia' | 'efectivo' | '';
type DeliveryMethod = 'santo-domingo' | 'interior' | '';

const BANKS = [
  'Banreservas',
  'Banco Popular',
  'BHD León',
  'Scotiabank',
  'Banco Santa Cruz',
  'Asociación Popular',
];

const TRANSPORTS = [
  'Vimenpaq',
  'Transporte Espinal',
  'Caribe Tours',
  'Otro',
];

// ── Gradient placeholders by badge / fallback ────────────────────────────────

function thumbGradient(badge?: string): string {
  if (badge?.toLowerCase().includes('skin')) return 'linear-gradient(135deg,#ffecd2,#fcb69f)';
  if (badge?.toLowerCase().includes('hombre')) return 'linear-gradient(135deg,#552814,#7a4a38)';
  return 'linear-gradient(135deg,#ffd6e7,#ffb3cb)';
}

// ── Component ────────────────────────────────────────────────────────────────

export function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQty, total, clearCart } = useCart();

  // Form state
  const [payment, setPayment] = useState<PaymentMethod>('');
  const [bank, setBank] = useState('');
  const [delivery, setDelivery] = useState<DeliveryMethod>('');
  const [address, setAddress] = useState('');
  const [transport, setTransport] = useState('');
  const [transportOther, setTransportOther] = useState('');
  const [city, setCity] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  // ── Validation ─────────────────────────────────────────────────────────────

  function validate(): string[] {
    const errs: string[] = [];
    if (items.length === 0) errs.push('Tu carrito está vacío.');
    if (!name.trim()) errs.push('Nombre es requerido.');
    if (!phone.trim()) errs.push('Teléfono / WhatsApp es requerido.');
    if (!payment) errs.push('Selecciona un método de pago.');
    if (payment === 'transferencia' && !bank) errs.push('Selecciona un banco.');
    if (!delivery) errs.push('Selecciona un método de entrega.');
    if (delivery === 'santo-domingo' && !address.trim()) errs.push('Dirección es requerida.');
    if (delivery === 'interior') {
      if (!transport) errs.push('Selecciona un transporte.');
      if (transport === 'Otro' && !transportOther.trim()) errs.push('Especifica el transporte.');
      if (!city.trim()) errs.push('Ciudad / destino es requerido.');
    }
    return errs;
  }

  // ── Build WhatsApp message ─────────────────────────────────────────────────

  function buildCheckoutMessage(): string {
    const itemLines = items
      .map(i => `  • ${i.name} x${i.quantity} — ${formatPrice(i.price * i.quantity)}`)
      .join('\n');

    const paymentLabel = payment === 'transferencia'
      ? `Transferencia Bancaria (${bank})`
      : 'Efectivo contra entrega';

    const deliveryLabel = delivery === 'santo-domingo'
      ? `Santo Domingo — ${address}`
      : `Interior del país (${transport === 'Otro' ? transportOther : transport}) — ${city}`;

    return [
      `*Nuevo Pedido — Chlea Care*`,
      ``,
      `*Cliente:* ${name}`,
      `*Teléfono:* ${phone}`,
      ``,
      `*Productos:*`,
      itemLines,
      ``,
      `*Subtotal:* ${formatPrice(total())}`,
      `*Envío:* Se confirmará por WhatsApp`,
      ``,
      `*Pago:* ${paymentLabel}`,
      `*Entrega:* ${deliveryLabel}`,
      ``,
      `Hola! Quisiera confirmar este pedido. Quedo atenta.`,
    ].join('\n');
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleConfirm() {
    const errs = validate();
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);
    setSending(true);

    try {
      // Attempt to save order to Supabase (non-blocking if not configured)
      await insertOrder({
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        items: items.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        total: total(),
        status: 'pending',
      });
    } catch {
      // Supabase not configured — continue to WhatsApp
    }

    openWhatsApp(buildCheckoutMessage());
    clearCart();
    setSending(false);
  }

  // ── Empty state ────────────────────────────────────────────────────────────

  if (items.length === 0) {
    return (
      <div style={styles.emptyWrap}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🛒</div>
        <h2 style={styles.emptyTitle}>Tu carrito está vacío</h2>
        <p style={styles.emptyText}>Descubre nuestros productos y agrega tus favoritos.</p>
        <button onClick={() => navigate('/catalogo')} style={styles.ctaBtn}>
          Explorar catálogo
        </button>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Checkout</h1>

      <div style={styles.grid}>
        {/* ── LEFT: Order Summary ───────────────────────────────────────── */}
        <div style={styles.leftCol}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Resumen del Pedido</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {items.map(item => (
                <div key={item.id} style={styles.itemRow}>
                  {/* Thumbnail */}
                  <div style={{ ...styles.thumb, background: thumbGradient(item.badge) }}>
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} style={styles.thumbImg} />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={styles.itemName}>{item.name}</p>
                    <p style={styles.itemPrice}>{formatPrice(item.price)}</p>
                  </div>

                  {/* Qty controls */}
                  <div style={styles.qtyWrap}>
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} style={styles.qtyBtn}>−</button>
                    <span style={styles.qtyNum}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} style={styles.qtyBtn}>+</button>
                  </div>

                  {/* Subtotal */}
                  <span style={styles.itemSubtotal}>{formatPrice(item.price * item.quantity)}</span>

                  {/* Remove */}
                  <button onClick={() => removeItem(item.id)} style={styles.removeBtn} aria-label="Eliminar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total</span>
              <span style={styles.totalValue}>{formatPrice(total())}</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Checkout Form ──────────────────────────────────────── */}
        <div style={styles.rightCol}>

          {/* ── Section: Payment Method ──────────────────────────────────── */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Método de Pago</h2>

            <label style={styles.radioCard(payment === 'transferencia')}>
              <input
                type="radio"
                name="payment"
                value="transferencia"
                checked={payment === 'transferencia'}
                onChange={() => setPayment('transferencia')}
                style={styles.radioInput}
              />
              <div>
                <strong style={styles.radioLabel}>Transferencia Bancaria</strong>
                {payment === 'transferencia' && (
                  <div style={styles.subSection}>
                    <select
                      value={bank}
                      onChange={e => setBank(e.target.value)}
                      style={styles.select}
                    >
                      <option value="">Seleccionar banco...</option>
                      {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    {bank && (
                      <p style={styles.note}>
                        Número de cuenta será enviado por WhatsApp
                      </p>
                    )}
                  </div>
                )}
              </div>
            </label>

            <label style={styles.radioCard(payment === 'efectivo')}>
              <input
                type="radio"
                name="payment"
                value="efectivo"
                checked={payment === 'efectivo'}
                onChange={() => setPayment('efectivo')}
                style={styles.radioInput}
              />
              <div>
                <strong style={styles.radioLabel}>Efectivo contra entrega</strong>
                {payment === 'efectivo' && (
                  <p style={styles.note}>
                    Solo disponible en Santo Domingo. Pago en efectivo al momento de recibir tu pedido.
                  </p>
                )}
              </div>
            </label>
          </div>

          {/* ── Section: Delivery Method ─────────────────────────────────── */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Método de Entrega</h2>

            <label style={styles.radioCard(delivery === 'santo-domingo')}>
              <input
                type="radio"
                name="delivery"
                value="santo-domingo"
                checked={delivery === 'santo-domingo'}
                onChange={() => setDelivery('santo-domingo')}
                style={styles.radioInput}
              />
              <div style={{ flex: 1 }}>
                <strong style={styles.radioLabel}>Santo Domingo</strong>
                {delivery === 'santo-domingo' && (
                  <div style={styles.subSection}>
                    <p style={styles.note}>
                      Envío por motorista. Entrega en 2-24 horas.
                    </p>
                    <input
                      type="text"
                      placeholder="Dirección de entrega"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                )}
              </div>
            </label>

            <label style={styles.radioCard(delivery === 'interior')}>
              <input
                type="radio"
                name="delivery"
                value="interior"
                checked={delivery === 'interior'}
                onChange={() => setDelivery('interior')}
                style={styles.radioInput}
              />
              <div style={{ flex: 1 }}>
                <strong style={styles.radioLabel}>Interior del país</strong>
                {delivery === 'interior' && (
                  <div style={styles.subSection}>
                    <select
                      value={transport}
                      onChange={e => setTransport(e.target.value)}
                      style={styles.select}
                    >
                      <option value="">Seleccionar transporte...</option>
                      {TRANSPORTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {transport === 'Otro' && (
                      <input
                        type="text"
                        placeholder="¿Cuál transporte?"
                        value={transportOther}
                        onChange={e => setTransportOther(e.target.value)}
                        style={styles.input}
                      />
                    )}
                    <input
                      type="text"
                      placeholder="Ciudad / destino"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* ── Section: Customer Info ───────────────────────────────────── */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Datos del Cliente</h2>
            <input
              type="text"
              placeholder="Nombre completo *"
              value={name}
              onChange={e => setName(e.target.value)}
              style={styles.input}
            />
            <input
              type="tel"
              placeholder="Teléfono / WhatsApp *"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* ── Section: Order Total + Confirm ──────────────────────────── */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Total del Pedido</h2>

            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 700 }}>{formatPrice(total())}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Costo de envío</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Se confirmará por WhatsApp</span>
            </div>
            <div style={{ ...styles.summaryRow, borderTop: '2px solid var(--border)', paddingTop: 14, marginTop: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--deep)' }}>Total</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--hot)' }}>{formatPrice(total())}</span>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div style={styles.errorBox}>
                {errors.map((e, i) => <p key={i} style={styles.errorLine}>{e}</p>)}
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={sending}
              style={styles.confirmBtn}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              {sending ? 'Enviando...' : 'Confirmar Pedido por WhatsApp'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Inline styles ────────────────────────────────────────────────────────────
// Using a style object to keep everything in one file without a separate CSS

const styles = {
  // Page layout
  page: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '32px 16px 64px',
  } as React.CSSProperties,

  pageTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 32,
    fontWeight: 400,
    fontStyle: 'italic' as const,
    color: 'var(--deep)',
    marginBottom: 28,
    textAlign: 'center' as const,
  } as React.CSSProperties,

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 24,
  } as React.CSSProperties,

  leftCol: {} as React.CSSProperties,
  rightCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 20,
  } as React.CSSProperties,

  // Cards
  card: {
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-md)',
    padding: '24px',
    background: 'var(--white)',
  } as React.CSSProperties,

  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    fontWeight: 400,
    fontStyle: 'italic' as const,
    color: 'var(--deep)',
    marginBottom: 18,
  } as React.CSSProperties,

  // Items
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 'var(--r-sm)',
    border: '1px solid var(--border)',
    background: 'var(--cream)',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,

  thumb: {
    width: 56,
    height: 56,
    borderRadius: 'var(--r-sm)',
    flexShrink: 0,
    overflow: 'hidden',
  } as React.CSSProperties,

  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  } as React.CSSProperties,

  itemName: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: 2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,

  itemPrice: {
    fontSize: 13,
    color: 'var(--text-muted)',
  } as React.CSSProperties,

  qtyWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  } as React.CSSProperties,

  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: '1.5px solid var(--border2)',
    background: 'none',
    cursor: 'pointer',
    fontSize: 16,
    color: 'var(--text)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-body)',
  } as React.CSSProperties,

  qtyNum: {
    minWidth: 22,
    textAlign: 'center' as const,
    fontWeight: 600,
    fontSize: 14,
  } as React.CSSProperties,

  itemSubtotal: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--hot)',
    minWidth: 80,
    textAlign: 'right' as const,
  } as React.CSSProperties,

  removeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
  } as React.CSSProperties,

  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTop: '2px solid var(--border)',
  } as React.CSSProperties,

  totalLabel: {
    fontSize: 16,
    color: 'var(--text-soft)',
    fontWeight: 500,
  } as React.CSSProperties,

  totalValue: {
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--hot)',
  } as React.CSSProperties,

  // Radio cards
  radioCard: (selected: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '16px',
    borderRadius: 'var(--r-sm)',
    border: `2px solid ${selected ? 'var(--hot)' : 'var(--border)'}`,
    background: selected ? 'rgba(235,25,130,0.04)' : 'var(--white)',
    cursor: 'pointer',
    marginBottom: 10,
    transition: 'border-color 0.2s, background 0.2s',
  }),

  radioInput: {
    accentColor: 'var(--hot)',
    marginTop: 3,
    width: 18,
    height: 18,
    flexShrink: 0,
  } as React.CSSProperties,

  radioLabel: {
    fontSize: 15,
    color: 'var(--deep)',
  } as React.CSSProperties,

  subSection: {
    marginTop: 12,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
  } as React.CSSProperties,

  note: {
    fontSize: 13,
    color: 'var(--text-muted)',
    lineHeight: 1.5,
  } as React.CSSProperties,

  // Form inputs
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--r-sm)',
    border: '1.5px solid var(--border2)',
    fontSize: 14,
    fontFamily: 'var(--font-body)',
    color: 'var(--text)',
    background: 'var(--white)',
    outline: 'none',
    boxSizing: 'border-box' as const,
    marginBottom: 8,
  } as React.CSSProperties,

  select: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--r-sm)',
    border: '1.5px solid var(--border2)',
    fontSize: 14,
    fontFamily: 'var(--font-body)',
    color: 'var(--text)',
    background: 'var(--white)',
    outline: 'none',
    boxSizing: 'border-box' as const,
    cursor: 'pointer',
  } as React.CSSProperties,

  // Summary
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 15,
    color: 'var(--text-soft)',
    marginBottom: 10,
  } as React.CSSProperties,

  // Errors
  errorBox: {
    background: 'rgba(235,25,130,0.08)',
    border: '1px solid var(--hot)',
    borderRadius: 'var(--r-sm)',
    padding: '12px 16px',
    marginTop: 14,
    marginBottom: 4,
  } as React.CSSProperties,

  errorLine: {
    fontSize: 13,
    color: 'var(--hot)',
    margin: '2px 0',
  } as React.CSSProperties,

  // Confirm button
  confirmBtn: {
    width: '100%',
    marginTop: 18,
    background: 'var(--hot)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--r-pill)',
    padding: '16px 20px',
    fontSize: 16,
    fontWeight: 700,
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  } as React.CSSProperties,

  // Empty state
  emptyWrap: {
    textAlign: 'center' as const,
    padding: '80px 24px',
    maxWidth: 420,
    margin: '0 auto',
  } as React.CSSProperties,

  emptyTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    fontWeight: 400,
    fontStyle: 'italic' as const,
    color: 'var(--deep)',
    marginBottom: 10,
  } as React.CSSProperties,

  emptyText: {
    fontSize: 15,
    color: 'var(--text-muted)',
    marginBottom: 28,
  } as React.CSSProperties,

  ctaBtn: {
    background: 'var(--hot)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--r-pill)',
    padding: '14px 36px',
    fontSize: 15,
    fontWeight: 700,
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
  } as React.CSSProperties,
} as const;

// ── Responsive: inject a <style> tag for the grid breakpoint ─────────────────

const CART_RESPONSIVE_ID = 'cart-page-responsive';
if (typeof document !== 'undefined' && !document.getElementById(CART_RESPONSIVE_ID)) {
  const style = document.createElement('style');
  style.id = CART_RESPONSIVE_ID;
  style.textContent = `
    @media (min-width: 720px) {
      .cart-page-grid {
        grid-template-columns: 3fr 2fr !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// We need to apply the className to the grid div — let's re-export with className support.
// Since we used inline styles above, we'll add the className in the JSX. Let me fix the grid div.
