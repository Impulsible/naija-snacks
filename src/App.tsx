import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/public/HomePage';
import ExplorePage from './pages/public/ExplorePage';
import CategoriesPage from './pages/public/CategoriesPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import DealsPage from './pages/public/DealsPage';
import CartPage from './pages/public/CartPage';
import CheckoutPage from './pages/public/CheckoutPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AboutPage from './pages/public/about';

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
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
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </main>
            <Footer />
            <CartDrawer />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;