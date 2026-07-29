import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthPages } from './pages/auth/AuthPages';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardHome } from './pages/DashboardHome';
import { ProductsPage } from './pages/ProductsPage';
import { PublicStorePage } from './pages/shop/PublicStorePage';
import { SingleProductPage } from './pages/shop/SingleProductPage';
import { SettingsPage } from './pages/SettingsPage';
import { DeliveryPartnersPage } from './pages/DeliveryPartnersPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { OrdersPage } from './pages/OrdersPage';
import { FinancesPage } from './pages/FinancesPage';
import { AdminRoute } from './components/auth/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminShopsPage } from './pages/admin/AdminShopsPage';
import { AdminDeliveryPartnersPage } from './pages/admin/AdminDeliveryPartnersPage';
import { AdminTrafficPage } from './pages/admin/AdminTrafficPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<AuthPages />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="finance" element={<FinancesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="delivery-partners" element={<DeliveryPartnersPage />} />
          </Route>

          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="shops" element={<AdminShopsPage />} />
            <Route path="delivery-partners" element={<AdminDeliveryPartnersPage />} />
            <Route path="traffic" element={<AdminTrafficPage />} />
          </Route>

          {/* Route publique pour voir la boutique */}
          <Route path="/shop/:storeSlug" element={<PublicStorePage />} />
          <Route path="/shop/:storeSlug/product/:productSlug" element={<SingleProductPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;