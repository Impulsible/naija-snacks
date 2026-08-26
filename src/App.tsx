import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTopButton from './components/common/ScrollToTopButton';
import ToastProvider from './components/ui/ToastProvider';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import HomePage from './pages/public/HomePage';
import ExplorePage from './pages/public/ExplorePage';
import CategoriesPage from './pages/public/CategoriesPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import DealsPage from './pages/public/DealsPage';
import CartPage from './pages/public/CartPage';
import CheckoutPage from './pages/public/CheckoutPage';
import OrderConfirmationPage from './pages/public/OrderConfirmationPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AboutPage from './pages/public/about';
import DashboardPage from './pages/account/DashboardPage';
import OrdersPage from './pages/account/OrdersPage';
import OrderDetailPage from './pages/account/OrderDetailPage';
import ProfilePage from './pages/account/ProfilePage';
import FavouritesPage from './pages/account/FavouritesPage';
import SettingsPage from './pages/account/SettingsPage';
import AddressesPage from './pages/account/AddressesPage';
// ─── Admin Imports ──────────────────────────────────────────────────
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProductNew from './pages/admin/AdminProductNew';
import AdminProductEdit from './pages/admin/AdminProductEdit';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/deals" element={<DealsPage />} />
                  <Route path="/hotdeals" element={<DealsPage />} />
                  <Route path="/hot-deals" element={<DealsPage />} />
                  <Route path="/snacks/:slug" element={<ProductDetailPage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
                  <Route path="/track-order/:id" element={<OrderConfirmationPage />} />
                  <Route path="/about" element={<AboutPage />} />

                  {/* Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />

                  {/* Account Routes (Protected) */}
                  <Route path="/account" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/account/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                  <Route path="/account/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                  <Route path="/account/favourites" element={<ProtectedRoute><FavouritesPage /></ProtectedRoute>} />
                  <Route path="/account/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/account/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  <Route path="/account/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />

                  {/* Admin Routes (Protected + Admin Only) */}
                  <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/products" element={<ProtectedRoute requireAdmin><AdminProducts /></ProtectedRoute>} />
                  <Route path="/admin/products/new" element={<ProtectedRoute requireAdmin><AdminProductNew /></ProtectedRoute>} />
                  <Route path="/admin/products/:id/edit" element={<ProtectedRoute requireAdmin><AdminProductEdit /></ProtectedRoute>} />
                  <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminOrders /></ProtectedRoute>} />
                  <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
                  <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />
                </Routes>
              </main>
              <Footer />
              <CartDrawer />
              <ScrollToTopButton />
              <ToastProvider />
            </div>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;