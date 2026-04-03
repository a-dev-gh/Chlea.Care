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
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminProductos } from './pages/admin/AdminProductos';
import { AdminOrdenes } from './pages/admin/AdminOrdenes';
import { AdminConfiguracion } from './pages/admin/AdminConfiguracion';
import { AdminMarcas } from './pages/admin/AdminMarcas';
import { AdminSocial } from './pages/admin/AdminSocial';
import { AdminNavegacion } from './pages/admin/AdminNavegacion';
import { AdminBlog } from './pages/admin/AdminBlog';
import { AdminEtiquetas } from './pages/admin/AdminEtiquetas';
import { AdminBadges } from './pages/admin/AdminBadges';
import { AdminTestimonios } from './pages/admin/AdminTestimonios';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { PoliticasEnvioPage } from './pages/PoliticasEnvioPage';
import { PoliticasReembolsoPage } from './pages/PoliticasReembolsoPage';
import { MisListasPage } from './pages/MisListasPage';
import { CartPage } from './pages/CartPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { BackToTop } from './components/ui/BackToTop';

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
      <WhatsAppFloat />
      <BackToTop />
    </div>
  );
}

// Detect estudio.chlea.care subdomain for dedicated admin panel
const isStudio =
  window.location.hostname === 'estudio.chlea.care' ||
  window.location.hostname.startsWith('estudio.');

export default function App() {
  // Studio subdomain: render only admin routes at root path
  if (isStudio) {
    return (
      <Routes>
        {/* Standalone login — outside AdminLayout to prevent infinite redirect */}
        <Route path="/login" element={<AdminLoginPage />} />
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="productos" element={<AdminProductos />} />
          <Route path="marcas" element={<AdminMarcas />} />
          <Route path="etiquetas" element={<AdminEtiquetas />} />
          <Route path="badges" element={<AdminBadges />} />
          <Route path="ordenes" element={<AdminOrdenes />} />
          <Route path="social" element={<AdminSocial />} />
          <Route path="navegacion" element={<AdminNavegacion />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="testimonios" element={<AdminTestimonios />} />
          <Route path="configuracion" element={<AdminConfiguracion />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/catalogo" element={<PublicLayout><CatalogPage /></PublicLayout>} />
      <Route path="/hombres" element={<PublicLayout><MensCatalogPage /></PublicLayout>} />
      <Route path="/marcas" element={<PublicLayout><BrandsPage /></PublicLayout>} />
      <Route path="/marcas/:slug" element={<PublicLayout><BrandPage /></PublicLayout>} />
      <Route path="/cuenta" element={<PublicLayout><AccountPage /></PublicLayout>} />
      <Route path="/blog" element={<PublicLayout><BlogPage /></PublicLayout>} />
      <Route path="/blog/:slug" element={<PublicLayout><BlogPostPage /></PublicLayout>} />
      <Route path="/politicas-envio" element={<PublicLayout><PoliticasEnvioPage /></PublicLayout>} />
      <Route path="/politicas-reembolso" element={<PublicLayout><PoliticasReembolsoPage /></PublicLayout>} />
      <Route path="/mis-listas" element={<PublicLayout><MisListasPage /></PublicLayout>} />
      <Route path="/carrito" element={<PublicLayout><CartPage /></PublicLayout>} />

      {/* Admin routes (backward compatible, also for localhost testing) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard"     element={<AdminDashboard />} />
        <Route path="productos"     element={<AdminProductos />} />
        <Route path="marcas"        element={<AdminMarcas />} />
        <Route path="etiquetas"     element={<AdminEtiquetas />} />
        <Route path="badges"        element={<AdminBadges />} />
        <Route path="ordenes"       element={<AdminOrdenes />} />
        <Route path="social"        element={<AdminSocial />} />
        <Route path="navegacion"   element={<AdminNavegacion />} />
        <Route path="blog"         element={<AdminBlog />} />
        <Route path="testimonios"  element={<AdminTestimonios />} />
        <Route path="configuracion" element={<AdminConfiguracion />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
    </Routes>
  );
}
