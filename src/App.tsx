import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider } from './contexts/BookingContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { LanguageProvider } from './i18n/LanguageContext';
import MainLayout from './layouts/MainLayout';
import OwnerLayout from './layouts/OwnerLayout';
import AffiliateLayout from './pages/affiliate/AffiliateLayout';
import ProtectedRoute from './components/ProtectedRoute';
import BookingLoginGuard from './components/BookingLoginGuard';
import LoginPage from './pages/LoginPage';
import MagicLinkPage from './pages/MagicLinkPage';
import HomePage from './pages/HomePage';
import VillaPage from './pages/VillaPage';
import BookingCalendarPage from './pages/BookingCalendarPage';
import BookingFormPage from './pages/BookingFormPage';
import BookingReviewPage from './pages/BookingReviewPage';
import PaymentPage from './pages/PaymentPage';
import BookingSubmissionPage from './pages/BookingSubmissionPage';
import DashboardTab from './pages/owner/DashboardTab';
import OrdersPage from './pages/owner/OrdersPage';
import PendingTab from './pages/owner/PendingTab';
import ActiveTab from './pages/owner/ActiveTab';
import PreviousTab from './pages/owner/PreviousTab';
import CalendarTab from './pages/owner/CalendarTab';
import PricingTab from './pages/owner/PricingTab';
import UsersTab from './pages/owner/UsersTab';
import PromosTab from './pages/owner/PromosTab';
import AffiliatesTab from './pages/owner/AffiliatesTab';
import AffiliateDashboard from './pages/affiliate/DashboardTab';
import CodesTab from './pages/affiliate/CodesTab';
import BookingsTab from './pages/affiliate/BookingsTab';
import EarningsTab from './pages/affiliate/EarningsTab';
import MarketingTab from './pages/affiliate/MarketingTab';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BookingProvider>
          <Router>
          <Routes>
            {/* Indonesian (default) */}
            <Route path="/" element={<LanguageProvider><MainLayout /></LanguageProvider>}>
              <Route index element={<HomePage />} />
              <Route path="villa" element={<VillaPage />} />
              <Route path="book" element={<BookingLoginGuard />}>
                <Route index element={<Navigate to="/book/calendar" replace />} />
                <Route path="calendar" element={<BookingCalendarPage />} />
                <Route path="form" element={<BookingFormPage />} />
                <Route path="review" element={<BookingReviewPage />} />
                <Route path="payment" element={<PaymentPage />} />
                <Route path="payment/:orderId" element={<PaymentPage />} />
                <Route path="confirmation/:orderId" element={<BookingSubmissionPage />} />
              </Route>
            </Route>

            {/* English */}
            <Route path="/en" element={<LanguageProvider><MainLayout /></LanguageProvider>}>
              <Route index element={<HomePage />} />
              <Route path="villa" element={<VillaPage />} />
              <Route path="book" element={<BookingLoginGuard />}>
                <Route index element={<Navigate to="/en/book/calendar" replace />} />
                <Route path="calendar" element={<BookingCalendarPage />} />
                <Route path="form" element={<BookingFormPage />} />
                <Route path="review" element={<BookingReviewPage />} />
                <Route path="payment" element={<PaymentPage />} />
                <Route path="payment/:orderId" element={<PaymentPage />} />
                <Route path="confirmation/:orderId" element={<BookingSubmissionPage />} />
              </Route>
            </Route>

            {/* Login — public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/magic" element={<MagicLinkPage />} />

            {/* Owner dashboard — PROTECTED */}
            <Route path="/owner" element={<ProtectedRoute />}>
              <Route element={<OwnerLayout />}>
                <Route index element={<DashboardTab />} />
                <Route path="orders" element={<OrdersPage />}>
                  <Route index element={<Navigate to="pending" replace />} />
                  <Route path="pending" element={<PendingTab />} />
                  <Route path="active" element={<ActiveTab />} />
                  <Route path="previous" element={<PreviousTab />} />
                </Route>
                <Route path="calendar" element={<CalendarTab />} />
                <Route path="pricing" element={<PricingTab />} />
                <Route path="users" element={<UsersTab />} />
                <Route path="affiliates" element={<AffiliatesTab />} />
                <Route path="promos">
                  <Route index element={<Navigate to="overview" replace />} />
                  <Route path=":section" element={<PromosTab />} />
                </Route>
              </Route>
            </Route>

            {/* Affiliate dashboard — PROTECTED */}
            <Route path="/affiliate" element={<ProtectedRoute />}>
              <Route element={<AffiliateLayout />}>
                <Route index element={<AffiliateDashboard />} />
                <Route path="codes" element={<CodesTab />} />
                <Route path="bookings" element={<BookingsTab />} />
                <Route path="earnings" element={<EarningsTab />} />
                <Route path="marketing" element={<MarketingTab />} />
              </Route>
            </Route>
          </Routes>
        </Router>
        </BookingProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
