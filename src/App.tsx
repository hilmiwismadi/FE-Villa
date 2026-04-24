import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider } from './contexts/BookingContext';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './i18n/LanguageContext';
import MainLayout from './layouts/MainLayout';
import OwnerLayout from './layouts/OwnerLayout';
import AffiliateLayout from './pages/affiliate/AffiliateLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
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
      <BookingProvider>
        <Router>
          <Routes>
            {/* Indonesian (default) */}
            <Route path="/" element={<LanguageProvider><MainLayout /></LanguageProvider>}>
              <Route index element={<HomePage />} />
              <Route path="villa" element={<VillaPage />} />
              <Route path="book" element={<Navigate to="/book/calendar" replace />} />
              <Route path="book/calendar" element={<BookingCalendarPage />} />
              <Route path="book/form" element={<BookingFormPage />} />
              <Route path="book/review" element={<BookingReviewPage />} />
              <Route path="book/payment" element={<PaymentPage />} />
              <Route path="book/payment/:orderId" element={<PaymentPage />} />
              <Route path="book/confirmation/:orderId" element={<BookingSubmissionPage />} />
            </Route>

            {/* English */}
            <Route path="/en" element={<LanguageProvider><MainLayout /></LanguageProvider>}>
              <Route index element={<HomePage />} />
              <Route path="villa" element={<VillaPage />} />
              <Route path="book" element={<Navigate to="/en/book/calendar" replace />} />
              <Route path="book/calendar" element={<BookingCalendarPage />} />
              <Route path="book/form" element={<BookingFormPage />} />
              <Route path="book/review" element={<BookingReviewPage />} />
              <Route path="book/payment" element={<PaymentPage />} />
              <Route path="book/payment/:orderId" element={<PaymentPage />} />
              <Route path="book/confirmation/:orderId" element={<BookingSubmissionPage />} />
            </Route>

            {/* Login — public */}
            <Route path="/login" element={<LoginPage />} />

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
                <Route path="promos" element={<PromosTab />} />
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
    </AuthProvider>
  );
}

export default App;
