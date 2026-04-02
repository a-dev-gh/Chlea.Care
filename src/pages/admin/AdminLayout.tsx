import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

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
  { path: 'ordenes',       label: 'Ordenes' },
  { path: 'social',        label: 'Redes Sociales' },
  { path: 'blog',         label: 'Blog' },
  { path: 'navegacion',   label: 'Navegacion',    minRole: ['super_admin', 'owner'] },
  { path: 'configuracion', label: 'Configuracion', minRole: ['super_admin', 'owner'] },
];

// Build full href depending on context
function getHref(path: string): string {
  return isStudio ? `/${path}` : `/admin/${path}`;
}

export function AdminLayout() {
  const { user, role, loading, signOut } = useAuthContext();
  const { pathname } = useLocation();

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>Verificando acceso...</div>;
  if (!user || !role) return <Navigate to={isStudio ? '/' : '/cuenta'} replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: 'var(--deep)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 0', flexShrink: 0,
      }}>
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
                <Link key={item.path} to={href} style={{
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
            Cerrar sesion
          </button>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, background: 'var(--cream)', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
