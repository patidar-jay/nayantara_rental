// ============================================================================
// App — Root Router Configuration
// Customer Website + Admin Dashboard routes
// ============================================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@presentation/shared/Toast';
import { ThemeProvider } from '@presentation/shared/ThemeContext';

// Customer
import CustomerLayout from './presentation/customer/CustomerLayout';
import HomePage from './presentation/customer/pages/HomePage';
import ProductListingPage from './presentation/customer/pages/ProductListingPage';
import ProductDetailsPage from './presentation/customer/pages/ProductDetailsPage';
import BookingFormPage from './presentation/customer/pages/BookingFormPage';
import BookingTrackingPage from './presentation/customer/pages/BookingTrackingPage';

// Admin
import AdminLayout from './presentation/admin/AdminLayout';
import DashboardOverview from './presentation/admin/pages/DashboardOverview';
import ProductManagementPage from './presentation/admin/pages/ProductManagementPage';
import CategoryManagementPage from './presentation/admin/pages/CategoryManagementPage';
import BookingManagementPage from './presentation/admin/pages/BookingManagementPage';
import AvailabilityCalendar from './presentation/admin/pages/AvailabilityCalendar';
import ThemeCustomizationPage from './presentation/admin/pages/ThemeCustomizationPage';

// ---------------------------------------------------------------------------
// TanStack Query Client
// ---------------------------------------------------------------------------

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
      <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* ============================================================== */}
          {/* Customer Routes                                                 */}
          {/* ============================================================== */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListingPage />} />
            <Route path="/products/:slug" element={<ProductDetailsPage />} />
            <Route path="/products/:slug/book" element={<BookingFormPage />} />
            <Route path="/track" element={<BookingTrackingPage />} />
          </Route>

          {/* ============================================================== */}
          {/* Admin Routes — TODO: Wrap with auth guard                      */}
          {/* ============================================================== */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="products" element={<ProductManagementPage />} />
            <Route path="categories" element={<CategoryManagementPage />} />
            <Route path="bookings" element={<BookingManagementPage />} />
            <Route path="availability" element={<AvailabilityCalendar />} />
            <Route path="theme" element={<ThemeCustomizationPage />} />
          </Route>

          {/* ============================================================== */}
          {/* 404                                                             */}
          {/* ============================================================== */}
          <Route path="*" element={
            <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
              <div>
                <h1 className="text-6xl font-bold text-primary">404</h1>
                <p className="mt-4 text-xl text-text-muted">Page not found</p>
                <a href="/" className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-background hover:opacity-90 transition-opacity">
                  Go Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
