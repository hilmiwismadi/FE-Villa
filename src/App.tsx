import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider } from './contexts/BookingContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import VillaPage from './pages/VillaPage';
import BookingCalendarPage from './pages/BookingCalendarPage';
import BookingFormPage from './pages/BookingFormPage';
import BookingReviewPage from './pages/BookingReviewPage';
import PaymentPage from './pages/PaymentPage';
import ConfirmationPage from './pages/ConfirmationPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import AffiliatorDashboardPage from './pages/AffiliatorDashboardPage';

function App() {
  return (
    <BookingProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="villa" element={<VillaPage />} />
            <Route path="book" element={<Navigate to="/book/calendar" replace />} />
            <Route path="book/calendar" element={<BookingCalendarPage />} />
            <Route path="book/form" element={<BookingFormPage />} />
            <Route path="book/review" element={<BookingReviewPage />} />
            <Route path="book/payment" element={<PaymentPage />} />
            <Route path="book/confirmation/:bookingId" element={<ConfirmationPage />} />
            <Route path="owner" element={<OwnerDashboardPage />} />
            <Route path="affiliate" element={<AffiliatorDashboardPage />} />
          </Route>
        </Routes>
      </Router>
    </BookingProvider>
  );
}

export default App;
