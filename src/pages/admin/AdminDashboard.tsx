import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { adminFetch } from '../../utils/adminApi';
import type { Product, Brand, WhatsAppOrder, Testimonial } from '../../types/database';

// Detect studio subdomain for link prefix
const isStudio =
  window.location.hostname === 'estudio.chlea.care' ||
  window.location.hostname.startsWith('estudio.');

function getAdminPath(path: string): string {
  return isStudio ? `/${path}` : `/admin/${path}`;
}

interface DashboardStats {
  products: number;
  brands: number;
  pendingOrders: number;
  pendingTestimonials: number;
}

// Simple SVG icons
function IconBox() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--hot)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}

function IconTag() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--hot)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--hot)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--hot)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

export function AdminDashboard() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminFetch<Product>('products'),
      adminFetch<Brand>('brands'),
      adminFetch<WhatsAppOrder>('whatsapp_orders', { filters: { status: 'pending' } }),
      adminFetch<Testimonial>('testimonials', { filters: { is_approved: false } }),
    ]).then(([prods, brands, orders, testimonials]) => {
      setStats({
        products: prods.length,
        brands: brands.length,
        pendingOrders: orders.length,
        pendingTestimonials: testimonials.length,
      });
      setLoading(false);
    });
  }, []);

  const statCards = [
    {
      icon: <IconBox />,
      count: stats?.products ?? 0,
      label: 'Productos',
      link: getAdminPath('productos'),
    },
    {
      icon: <IconTag />,
      count: stats?.brands ?? 0,
      label: 'Marcas',
      link: getAdminPath('marcas'),
    },
    {
      icon: <IconClipboard />,
      count: stats?.pendingOrders ?? 0,
      label: 'Pedidos Pendientes',
      link: getAdminPath('ordenes'),
    },
    {
      icon: <IconStar />,
      count: stats?.pendingTestimonials ?? 0,
      label: 'Testimonios Pendientes',
      link: getAdminPath('testimonios'),
    },
  ];

  return (
    <div style={{ padding: '32px 28px', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          fontWeight: 400,
          color: 'var(--deep)',
          margin: 0,
          marginBottom: 6,
        }}>
          Dashboard
        </h1>
        {user?.email && (
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            Hola, {user.email}
          </p>
        )}
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20,
        marginBottom: 40,
      }}>
        {statCards.map(card => (
          <div
            key={card.label}
            style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {card.icon}
            <div>
              <p style={{
                fontSize: 36,
                fontWeight: 700,
                color: 'var(--hot)',
                margin: 0,
                lineHeight: 1,
              }}>
                {loading ? '—' : card.count}
              </p>
              <p style={{
                fontSize: 14,
                color: 'var(--text-muted)',
                margin: '4px 0 0',
              }}>
                {card.label}
              </p>
            </div>
            <button
              onClick={() => navigate(card.link)}
              style={{
                alignSelf: 'flex-start',
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-pill)',
                padding: '5px 14px',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--deep)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'border-color 0.15s, color 0.15s',
                marginTop: 4,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--hot)';
                (e.currentTarget as HTMLElement).style.color = 'var(--hot)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.color = 'var(--deep)';
              }}
            >
              Ver
            </button>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          fontWeight: 400,
          color: 'var(--deep)',
          margin: 0,
          marginBottom: 16,
        }}>
          Acciones rápidas
        </h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: '+ Nuevo Producto', path: 'productos' },
            { label: '+ Nueva Marca',    path: 'marcas' },
            { label: 'Ver Pedidos',      path: 'ordenes' },
          ].map(action => (
            <button
              key={action.path}
              onClick={() => navigate(getAdminPath(action.path))}
              style={{
                background: 'none',
                border: '1px solid var(--deep)',
                borderRadius: 'var(--r-pill)',
                padding: '10px 20px',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--deep)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--deep)';
                (e.currentTarget as HTMLElement).style.color = 'var(--cream)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'none';
                (e.currentTarget as HTMLElement).style.color = 'var(--deep)';
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
