import { useState } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { ToastContainer } from '../../components/ui/Toast';

// Detect studio subdomain for link prefix
const isStudio =
  window.location.hostname === 'estudio.chlea.care' ||
  window.location.hostname.startsWith('estudio.');

// Role-gated navigation: employees see limited options
type AdminRole = 'super_admin' | 'owner' | 'employee';

interface NavItem {
  path: string;
  label: string;
  minRole?: AdminRole[];
}

const NAV_ITEMS: NavItem[] = [
  { path: 'productos',     label: 'Productos' },
  { path: 'marcas',        label: 'Marcas' },
  { path: 'etiquetas',     label: 'Etiquetas' },
  { path: 'ordenes',       label: 'Órdenes' },
  { path: 'social',        label: 'Redes Sociales' },
  { path: 'blog',          label: 'Blog' },
  { path: 'testimonios',   label: 'Testimonios' },
  { path: 'navegacion',    label: 'Navegación',    minRole: ['super_admin', 'owner'] },
  { path: 'configuracion', label: 'Configuración', minRole: ['super_admin', 'owner'] },
];

// Build full href depending on context
function getHref(path: string): string {
  return isStudio ? `/${path}` : `/admin/${path}`;
}

export function AdminLayout() {
  const { user, role, loading, signOut } = useAuthContext();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>Verificando acceso...</div>;
  if (!user || !role) return <Navigate to={isStudio ? '/login' : '/cuenta'} replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <style>{`
        .admin-sidebar {
          width: 220px;
          background: var(--deep);
          display: flex;
          flex-direction: column;
          padding: 24px 0;
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed !important;
            left: -240px;
            top: 0;
            bottom: 0;
            z-index: 100;
            transition: left 0.3s ease;
            width: 240px !important;
          }
          .admin-sidebar.open { left: 0; }
          .admin-content { margin-left: 0 !important; }
        }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            display: 'none',
            position: 'fixed', inset: 0, zIndex: 99,
            background: 'rgba(0,0,0,0.4)',
          }}
          className="admin-overlay"
        />
      )}
      <style>{`
        @media (max-width: 768px) {
          .admin-overlay { display: block !important; }
        }
      `}</style>

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <img src="/chlea-care-logo.svg" alt="Chlea Care" style={{ height: 28, filter: 'brightness(0) invert(1)', marginBottom: 12 }} />
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--pink)', opacity: 0.8 }}>
            Panel Administrativo
          </p>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV_ITEMS
            .filter(item => !item.minRole || item.minRole.includes(role as AdminRole))
            .map(item => {
              const href = getHref(item.path);
              const isActive = pathname === href || pathname === `/${item.path}`;
              return (
                <Link
                  key={item.path}
                  to={href}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'block', padding: '10px 12px',
                    borderRadius: 'var(--r-sm)', marginBottom: 2,
                    fontSize: 14, fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--pink)' : 'rgba(255,255,255,0.7)',
                    background: isActive ? 'rgba(255,194,209,0.1)' : 'transparent',
                    textDecoration: 'none', transition: 'all 0.15s',
                  }}>
                  {item.label}
                </Link>
              );
            })}
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 8, paddingLeft: 12 }}>{user.email}</p>
          <button onClick={signOut} style={{
            width: '100%', padding: '8px 12px',
            background: 'none', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 'var(--r-sm)', color: 'rgba(255,255,255,0.6)',
            fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)',
            textAlign: 'left', transition: 'all 0.15s',
          }}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="admin-content" style={{ flex: 1, background: 'var(--cream)', overflowY: 'auto', overflowX: 'auto' }}>
        {/* Mobile hamburger button */}
        <button
          onClick={() => setSidebarOpen(prev => !prev)}
          aria-label="Abrir menú"
          style={{
            display: 'none',
            position: 'fixed', top: 12, left: 12, zIndex: 101,
            background: 'var(--deep)', border: 'none',
            borderRadius: 'var(--r-sm)', padding: '8px 10px',
            cursor: 'pointer', color: '#fff',
            lineHeight: 1,
          }}
          className="admin-hamburger"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <style>{`
          @media (max-width: 768px) {
            .admin-hamburger { display: block !important; }
          }
        `}</style>
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}
