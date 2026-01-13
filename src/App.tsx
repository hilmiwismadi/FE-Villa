import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BookingProvider } from './contexts/BookingContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import VillaPage from './pages/VillaPage';
import BookingPage from './pages/BookingPage';
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
            <Route path="book" element={<BookingPage />} />
            <Route path="review" element={<BookingReviewPage />} />
            <Route path="payment" element={<PaymentPage />} />
            <Route path="confirmation/:bookingId" element={<ConfirmationPage />} />
            <Route path="owner" element={<OwnerDashboardPage />} />
            <Route path="affiliate" element={<AffiliatorDashboardPage />} />
          </Route>
        </Routes>
      </Router>
    </BookingProvider>
  );
}

export default App;
