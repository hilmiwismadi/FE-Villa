import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { useTranslation } from '../i18n/LanguageContext';
import { getOrder, ApiError } from '../services/orderService';
import type { OrderResponse } from '../services/orderService';

const BookingSubmissionPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, localePath } = useTranslation();
  const { orderId } = useParams<{ orderId: string }>();
  const { resetBooking } = useBooking();

  const [orderData, setOrderData] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('[BookingSubmissionPage] Component mounted!');
  console.log('[BookingSubmissionPage] Current path:', window.location.pathname);
  console.log('[BookingSubmissionPage] Order ID from params:', orderId);

  // Fetch order details
  useEffect(() => {
    if (!orderId) {
      navigate(localePath('/book/calendar'));
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await getOrder(orderId);
        setOrderData(response);
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate, localePath]);

  const handleNewBooking = () => {
    resetBooking();
    navigate(localePath('/book/calendar'));
  };

  if (loading) {
    return (
      <div className="section-padding bg bg-primary-50 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
      </div>
    );
  }

  if (!orderData) {
    return null;
  }

  return (
    <div className="section-padding bg-primary-50">
      <div className="container-custom max-w-4xl">
        {/* Success Card */}
        <div className="bg-green-50 border border-green-200 p-12 rounded-lg text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7l-4 4m0 0l0 0h14l-7 14" />
            </svg>
          </div>
          <h2 className="text-3xl font-serif text-green-900 mb-3">Pembayaran Anda Sedang Diverifikasi!</h2>
          <p className="text-lg text-green-700 mb-6 max-w-2xl mx-auto">
            Pesanan Anda telah dikirim ke admin villa. Kami sedang memverifikasi pembayaran Anda.
          </p>
          <p className="text-base text-green-600 mb-8">
            Anda akan mendapat notifikasi WhatsApp setelah pembayaran dikonfirmasi.
          </p>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8 text-left">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">Detail Pesanan Anda:</h3>
            <div className="space-y-2 text-sm text-primary-700">
              <p><strong>Order ID:</strong> {orderData.orderId}</p>
              <p><strong>Nama:</strong> {orderData.guestName}</p>
              <p><strong>Total Pembayaran:</strong> IDR {orderData.totalAmount.toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleNewBooking}
              className="px-8 py-3 bg-primary-900 text-white rounded-lg hover:bg-primary-800 transition-colors font-medium"
            >
              Buat Pesanan Baru
            </button>
            <button
              onClick={() => navigate(localePath('/'))}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSubmissionPage;
