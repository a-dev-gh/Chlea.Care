import { Routes, Route, Navigate } from 'react-router-dom';
import { TopNav } from './components/layout/TopNav';
import { SubBanner } from './components/layout/SubBanner';
import { CategoryNav } from './components/layout/CategoryNav';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { BrandsPage } from './pages/BrandsPage';
import { BrandPage } from './pages/BrandPage';
import { AccountPage } from './pages/AccountPage';
import { MensCatalogPage } from './pages/MensCatalogPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminProductos } from './pages/admin/AdminProductos';
import { AdminOrdenes } from './pages/admin/AdminOrdenes';
import { AdminConfiguracion } from './pages/admin/AdminConfiguracion';
import { AdminMarcas } from './pages/admin/AdminMarcas';
import { AdminSocial } from './pages/admin/AdminSocial';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-wrapper">
      <SubBanner />
      <TopNav />
      <CategoryNav />
      <main className="page-content" style={{ paddingBottom: 62 }}>
        {children}
      </main>
      <Footer />
      <BottomNav />
      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/catalogo" element={<PublicLayout><CatalogPage /></PublicLayout>} />
      <Route path="/hombres" element={<PublicLayout><MensCatalogPage /></PublicLayout>} />
      <Route path="/marcas" element={<PublicLayout><BrandsPage /></PublicLayout>} />
      <Route path="/marcas/:slug" element={<PublicLayout><BrandPage /></PublicLayout>} />
      <Route path="/cuenta" element={<PublicLayout><AccountPage /></PublicLayout>} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/productos" replace />} />
        <Route path="productos"     element={<AdminProductos />} />
        <Route path="marcas"        element={<AdminMarcas />} />
        <Route path="ordenes"       element={<AdminOrdenes />} />
        <Route path="social"        element={<AdminSocial />} />
        <Route path="configuracion" element={<AdminConfiguracion />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
