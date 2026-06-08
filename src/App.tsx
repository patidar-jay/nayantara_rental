// ============================================================================
// App — Root Router Configuration
// Customer Website + Admin Dashboard routes
// ============================================================================

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@presentation/shared/Toast';
import { ThemeProvider } from '@presentation/shared/ThemeContext';
import ErrorBoundary from '@presentation/shared/ErrorBoundary';
import { AuthProvider } from '@infrastructure/auth/AuthContext';
import RequireAuth from '@infrastructure/auth/RequireAuth';
import PageLoader from '@presentation/shared/PageLoader';

// Customer
const CustomerLayout = lazy(() => import('./presentation/customer/CustomerLayout'));
const HomePage = lazy(() => import('./presentation/customer/pages/HomePage'));
const ProductListingPage = lazy(() => import('./presentation/customer/pages/ProductListingPage'));
const ProductDetailsPage = lazy(() => import('./presentation/customer/pages/ProductDetailsPage'));
const BookingFormPage = lazy(() => import('./presentation/customer/pages/BookingFormPage'));
const BookingTrackingPage = lazy(() => import('./presentation/customer/pages/BookingTrackingPage'));
const ContactPage = lazy(() => import('./presentation/customer/pages/ContactPage'));

// Admin
const AdminLayout = lazy(() => import('./presentation/admin/AdminLayout'));
const AdminLoginPage = lazy(() => import('./presentation/admin/pages/AdminLoginPage'));
const DashboardOverview = lazy(() => import('./presentation/admin/pages/DashboardOverview'));
const ProductManagementPage = lazy(() => import('./presentation/admin/pages/ProductManagementPage'));
const CategoryManagementPage = lazy(() => import('./presentation/admin/pages/CategoryManagementPage'));
const BookingManagementPage = lazy(() => import('./presentation/admin/pages/BookingManagementPage'));
const AvailabilityCalendar = lazy(() => import('./presentation/admin/pages/AvailabilityCalendar'));
const ThemeCustomizationPage = lazy(() => import('./presentation/admin/pages/ThemeCustomizationPage'));

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
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <ThemeProvider>
      <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
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
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* ============================================================== */}
            {/* Admin Login (public)                                            */}
            {/* ============================================================== */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* ============================================================== */}
            {/* Admin Routes — Protected by RequireAuth                         */}
            {/* ============================================================== */}
            <Route path="/admin" element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }>
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
        </Suspense>
      </BrowserRouter>
      </ToastProvider>
      </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
