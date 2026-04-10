import { useState, useEffect, useCallback } from 'react';
import { formatPrice } from '../../utils/formatPrice';
import { adminFetch, adminUpdate } from '../../utils/adminApi';
import { supabase } from '../../utils/supabase';
import { showToast } from '../../components/ui/Toast';
import type { WhatsAppOrder, OrderStatus } from '../../types/database';

// Status configuration
const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; color: string }> = {
  pending:   { label: 'Pendiente',  bg: 'rgba(245,166,35,0.12)',  color: '#f5a623' },
  confirmed: { label: 'Confirmada', bg: 'rgba(52,152,219,0.12)',  color: '#3498db' },
  completed: { label: 'Completada', bg: 'rgba(37,211,102,0.12)',  color: '#25D366' },
  cancelled: { label: 'Cancelada',  bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
};

const STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'completed'];

export function AdminOrdenes() {
  const [orders, setOrders] = useState<WhatsAppOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const data = await adminFetch<WhatsAppOrder>('whatsapp_orders', {
      orderBy: 'created_at',
      ascending: false,
    });
    setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  async function updateStatus(orderId: string, newStatus: OrderStatus) {
    if (supabase) {
      const { error } = await adminUpdate<WhatsAppOrder>('whatsapp_orders', orderId, { status: newStatus } as any);
      if (error) { showToast('Error al actualizar: ' + error, 'error'); } else { showToast(`Orden marcada como ${STATUS_CONFIG[newStatus].label}`, 'success'); }
      await loadOrders();
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast(`Orden marcada como ${STATUS_CONFIG[newStatus].label}`, 'success');
    }
  }

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('es-DO', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return iso;
    }
  }

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando órdenes...</div>;
  }

  if (orders.length === 0) {
    return (
      <div style={{ padding: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--text)', marginBottom: 8 }}>Órdenes</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Las órdenes aparecerán aquí una vez conectada la base de datos.</p>
        <div style={{
          marginTop: 40, background: 'var(--white)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)', padding: '60px 24px', textAlign: 'center',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Sin órdenes aún</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--text)' }}>Órdenes</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{orders.length} órdenes</p>
      </div>

      {/* Orders list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {orders.map(order => {
          const expanded = expandedId === order.id;
          const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          const nextStatusIdx = STATUS_FLOW.indexOf(order.status);

          return (
            <div key={order.id} style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              overflow: 'hidden',
            }}>
              {/* Order header row */}
              <div
                onClick={() => setExpandedId(expanded ? null : order.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 20px', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(235,25,130,0.02)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                {/* Order number */}
                <span style={{
                  fontSize: 13, fontWeight: 700, color: 'var(--deep)',
                  fontFamily: 'monospace', flexShrink: 0, minWidth: 60,
                }}>
                  #{order.order_number ? String(order.order_number).padStart(4, '0') : '—'}
                </span>

                {/* Customer info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                    {order.customer_name}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {order.customer_phone}
                  </p>
                </div>

                {/* Total */}
                <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 12 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--hot)' }}>
                    {formatPrice(order.total)}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {order.items?.length || 0} producto{(order.items?.length || 0) !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Status badge */}
                <span style={{
                  padding: '5px 14px', borderRadius: 'var(--r-pill)',
                  fontSize: 12, fontWeight: 700,
                  background: statusCfg.bg,
                  color: statusCfg.color,
                  flexShrink: 0,
                }}>
                  {statusCfg.label}
                </span>

                {/* Date */}
                <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, minWidth: 110, textAlign: 'right' }}>
                  {formatDate(order.created_at)}
                </span>

                {/* Expand arrow */}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)', color: 'var(--text-muted)', flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>

              {/* Expanded detail */}
              {expanded && (
                <div style={{
                  padding: '0 20px 20px',
                  borderTop: '1px solid var(--border)',
                }}>
                  {/* Order items */}
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
                      Productos
                    </p>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '6px 0', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Producto</th>
                          <th style={{ textAlign: 'center', padding: '6px 0', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Cant.</th>
                          <th style={{ textAlign: 'right', padding: '6px 0', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Precio</th>
                          <th style={{ textAlign: 'right', padding: '6px 0', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items?.map((item, idx) => (
                          <tr key={idx} style={{ borderTop: '1px solid var(--border)' }}>
                            <td style={{ padding: '8px 0', fontSize: 14, color: 'var(--text)' }}>{item.name}</td>
                            <td style={{ padding: '8px 0', fontSize: 14, color: 'var(--text-soft)', textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ padding: '8px 0', fontSize: 14, color: 'var(--text-soft)', textAlign: 'right' }}>{formatPrice(item.price)}</td>
                            <td style={{ padding: '8px 0', fontSize: 14, fontWeight: 600, color: 'var(--text)', textAlign: 'right' }}>{formatPrice(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop: '2px solid var(--border)' }}>
                          <td colSpan={3} style={{ padding: '10px 0', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Total</td>
                          <td style={{ padding: '10px 0', fontSize: 16, fontWeight: 700, color: 'var(--hot)', textAlign: 'right' }}>{formatPrice(order.total)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Status actions */}
                  <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {/* Next status button */}
                    {nextStatusIdx >= 0 && nextStatusIdx < STATUS_FLOW.length - 1 && (
                      <button
                        onClick={() => updateStatus(order.id, STATUS_FLOW[nextStatusIdx + 1])}
                        style={{
                          padding: '8px 18px', borderRadius: 'var(--r-pill)',
                          border: 'none', fontSize: 13, fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'var(--font-body)',
                          background: STATUS_CONFIG[STATUS_FLOW[nextStatusIdx + 1]].bg,
                          color: STATUS_CONFIG[STATUS_FLOW[nextStatusIdx + 1]].color,
                        }}
                      >
                        Marcar como {STATUS_CONFIG[STATUS_FLOW[nextStatusIdx + 1]].label}
                      </button>
                    )}

                    {/* Cancel button (only if not already cancelled or completed) */}
                    {order.status !== 'cancelled' && order.status !== 'completed' && (
                      <button
                        onClick={() => updateStatus(order.id, 'cancelled')}
                        style={{
                          padding: '8px 18px', borderRadius: 'var(--r-pill)',
                          border: '1px solid rgba(239,68,68,0.3)', background: 'none',
                          fontSize: 13, fontWeight: 600, color: '#ef4444',
                          cursor: 'pointer', fontFamily: 'var(--font-body)',
                        }}
                      >
                        Cancelar orden
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
