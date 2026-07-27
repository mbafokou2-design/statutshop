import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthPages } from './pages/auth/AuthPages';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardHome } from './pages/DashboardHome';
import { ProductsPage } from './pages/ProductsPage';
import { PublicStorePage } from './pages/shop/PublicStorePage';
import { SingleProductPage } from './pages/shop/SingleProductPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<AuthPages />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="products" element={<ProductsPage />} />
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