import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider } from './contexts/BookingContext';
import { LanguageProvider } from './i18n/LanguageContext';
import MainLayout from './layouts/MainLayout';
import OwnerLayout from './layouts/OwnerLayout';
import HomePage from './pages/HomePage';
import VillaPage from './pages/VillaPage';
import BookingCalendarPage from './pages/BookingCalendarPage';
import BookingFormPage from './pages/BookingFormPage';
import BookingReviewPage from './pages/BookingReviewPage';
import PaymentPage from './pages/PaymentPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AffiliatorDashboardPage from './pages/AffiliatorDashboardPage';
import DashboardTab from './pages/owner/DashboardTab';
import PendingTab from './pages/owner/PendingTab';
import ActiveTab from './pages/owner/ActiveTab';
import PreviousTab from './pages/owner/PreviousTab';
import CalendarTab from './pages/owner/CalendarTab';
import PricingTab from './pages/owner/PricingTab';
import UsersTab from './pages/owner/UsersTab';
import PromosTab from './pages/owner/PromosTab';

function App() {
  return (
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
            <Route path="book/confirmation/:bookingId" element={<ConfirmationPage />} />
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
            <Route path="book/confirmation/:bookingId" element={<ConfirmationPage />} />
          </Route>

          {/* Owner — nested routes with dedicated layout */}
          <Route path="owner" element={<OwnerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardTab />} />
            <Route path="pending" element={<PendingTab />} />
            <Route path="active" element={<ActiveTab />} />
            <Route path="previous" element={<PreviousTab />} />
            <Route path="calendar" element={<CalendarTab />} />
            <Route path="pricing" element={<PricingTab />} />
            <Route path="users" element={<UsersTab />} />
            <Route path="promos" element={<PromosTab />} />
          </Route>

          {/* Affiliate — no i18n */}
          <Route path="/" element={<MainLayout />}>
            <Route path="affiliate" element={<AffiliatorDashboardPage />} />
          </Route>
        </Routes>
      </Router>
    </BookingProvider>
  );
}

export default App;
