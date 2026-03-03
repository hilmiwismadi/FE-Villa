import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { useTranslation } from '../i18n/LanguageContext';
import { confirmPayment, getOrder, ApiError } from '../services/orderService';
import type { OrderResponse } from '../services/orderService';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, localePath } = useTranslation();
  const { orderId } = useParams<{ orderId: string }>();
  const {
    dateRange,
    setPricing,
    resetBooking,
  } = useBooking();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(null);
  const [createOrderError, setCreateOrderError] = useState<string | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [confirmPaymentError, setConfirmPaymentError] = useState<string | null>(null);
  const [transferConfirmed, setTransferConfirmed] = useState(false);

  // Check if booking data is valid
  const hasValidBooking = Boolean(dateRange.checkIn && dateRange.checkOut);

  // Redirect if no booking data
  useEffect(() => {
    if (!hasValidBooking) {
      navigate(localePath('/book/calendar'));
    }
  }, [hasValidBooking, localePath, navigate]);

  // Fetch order on mount if we have an orderId in URL
  useEffect(() => {
    if (!hasValidBooking || !orderId) return;

    const fetchOrder = async () => {
      try {
        const response = await getOrder(orderId);
        setOrderResponse(response);

        // Update pricing with actual values from API response
        setPricing({
          originalPrice: response.subtotal + response.discountAmount,
          discountAmount: response.discountAmount,
          finalPrice: response.totalAmount,
        });
      } catch (error) {
        if (error instanceof ApiError) {
          setCreateOrderError(error.message);
        } else {
          setCreateOrderError('Failed to load order details');
        }
      }
    };

    fetchOrder();
  }, [orderId, hasValidBooking, setPricing]);

  // Early return for render (after all hooks)
  if (!hasValidBooking) {
    return null;
  }

  const handleConfirmPayment = async () => {
    if (!orderResponse?.orderId) return;
    if (!transferConfirmed) {
      alert('Mohon centang kotak "Saya sudah transfer" sebelum mengirim pembayaran.');
      return;
    }

    setIsSubmitting(true);
    setConfirmPaymentError(null);

    try {
      await confirmPayment(orderResponse.orderId);
      setPaymentConfirmed(true);
      setConfirmPaymentError(null);

      // Clear sessionStorage after successful payment confirmation
      resetBooking();
    } catch (error) {
      if (error instanceof ApiError) {
        setConfirmPaymentError(error.message || 'Failed to confirm payment');
      } else {
        setConfirmPaymentError('Failed to confirm payment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Use toast notification instead of alert in production
  };

  // Bank details - TODO: Fetch from API or use config
  const bankDetails = {
    bankName: 'Bank Mandiri',
    accountNumber: '1234567890',
    accountName: 'Villa Sekipan',
  };

  return (
    <div className="section-padding bg-primary-50">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl font-serif text-primary-900 mb-8">{t.booking.payment.title}</h1>

        {/* Create Order Error */}
        {createOrderError && (
          <div className="bg-red-50 border border-red-200 p-4 mb-6">
            <p className="text-red-700">{createOrderError}</p>
            <button
              onClick={() => navigate(localePath('/book/form'))}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Go Back
            </button>
          </div>
        )}

        {/* Order Summary - Show when order is created */}
        {orderResponse && (
          <div className="bg-white p-6 shadow-sm mb-6">
            <h2 className="text-xl font-serif text-primary-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm text-primary-700">
              <p><strong>Order ID:</strong> {orderResponse.orderId}</p>
              <p><strong>Status:</strong> {orderResponse.status}</p>
              <p><strong>Guest Name:</strong> {orderResponse.guestName}</p>
              <p><strong>Check-in:</strong> {new Date(orderResponse.checkInDate).toLocaleDateString()}</p>
              <p><strong>Check-out:</strong> {new Date(orderResponse.checkOutDate).toLocaleDateString()}</p>
              <p><strong>Number of Nights:</strong> {orderResponse.nightCount}</p>
              <p><strong>Subtotal:</strong> IDR {orderResponse.subtotal.toLocaleString()}</p>
              {orderResponse.discountAmount > 0 && (
                <p className="text-green-600"><strong>Discount:</strong> IDR {orderResponse.discountAmount.toLocaleString()}</p>
              )}
              <p><strong>Total Amount:</strong> IDR {orderResponse.totalAmount.toLocaleString()}</p>
              {orderResponse.uniqueCode > 0 && (
                <p><strong>Unique Code:</strong> {orderResponse.uniqueCode}</p>
              )}
              {orderResponse.paymentDeadline && (
                <p><strong>Payment Deadline:</strong> {new Date(orderResponse.paymentDeadline).toLocaleString()}</p>
              )}
              {orderResponse.promoCode && (
                <p><strong>Promo Code:</strong> {orderResponse.promoCode}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 1: Bank Transfer Details */}
        {orderResponse && !paymentConfirmed && (
          <div className="bg-white p-8 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gold-600 text-white rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <h2 className="text-2xl font-serif text-primary-900">{t.booking.payment.step1Title}</h2>
            </div>

            <div className="bg-primary-50 border border-primary-200 p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-primary-600 mb-1">{t.booking.payment.bankName}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-primary-900">{bankDetails.bankName}</p>
                    <button
                      onClick={() => copyToClipboard(bankDetails.bankName)}
                      className="text-sm text-gold-600 hover:text-gold-700"
                    >
                      {t.booking.payment.copy}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-primary-600 mb-1">{t.booking.payment.accountNumber}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-primary-900">{bankDetails.accountNumber}</p>
                    <button
                      onClick={() => copyToClipboard(bankDetails.accountNumber)}
                      className="text-sm text-gold-600 hover:text-gold-700"
                    >
                      {t.booking.payment.copy}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-primary-600 mb-1">{t.booking.payment.accountName}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-primary-900">{bankDetails.accountName}</p>
                    <button
                      onClick={() => copyToClipboard(bankDetails.accountName)}
                      className="text-sm text-gold-600 hover:text-gold-700"
                    >
                      {t.booking.payment.copy}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-primary-300">
              <p className="text-sm text-primary-600 mb-1">{t.booking.payment.transferAmount}</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-gold-600">IDR {orderResponse.totalAmount.toLocaleString()}</p>
                <button
                  onClick={() => copyToClipboard(orderResponse.totalAmount.toString())}
                  className="text-sm text-gold-600 hover:text-gold-700"
                >
                  {t.booking.payment.copy}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-primary-300">
              <p className="text-sm text-primary-600 mb-1">{t.booking.payment.bookingReference}</p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-primary-900 font-mono">{orderResponse.orderId}</p>
                <button
                  onClick={() => copyToClipboard(orderResponse.orderId)}
                  className="text-sm text-gold-600 hover:text-gold-700"
                >
                  {t.booking.payment.copy}
                </button>
              </div>
            </div>

            <div className="text-xs text-primary-600 mt-1">{t.booking.payment.bookingReferenceNote}</div>
          </div>
        )}

        {/* Payment Confirmed Success */}
        {paymentConfirmed && (
          <div className="bg-green-50 border border-green-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-green-900 mb-2">Payment Confirmed!</h3>
            <p className="text-sm text-green-700">
              Your payment has been confirmed. Your booking is now pending approval.
              The villa owner will review your booking and you will be notified via WhatsApp.
            </p>
          </div>
        )}

        {/* Confirm Payment Error */}
        {confirmPaymentError && (
          <div className="bg-red-50 border border-red-200 p-4 mb-6">
            <p className="text-red-700">{confirmPaymentError}</p>
            <button
              onClick={() => setConfirmPaymentError(null)}
              className="text-sm text-red-600 hover:text-red-800 underline mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Important Note */}
        {orderResponse && !paymentConfirmed && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> {t.booking.payment.importantNote}
            </p>
          </div>
        )}

        {/* Actions */}
        {orderResponse && !paymentConfirmed && (
          <div className="bg-white p-8 shadow-sm">
            {/* Transfer Confirmation Checkbox */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={transferConfirmed}
                  onChange={(e) => setTransferConfirmed(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <div className="text-sm text-primary-800">
                  <span className="font-medium">Saya sudah transfer dana ke rekening:</span>
                  <p className="text-primary-600 mt-1">
                    Pastikan kembali nomor rekening dan jumlah transfer Anda. Centang kotak ini jika sudah benar, lalu klik tombol "Kirim Pembayaran" di bawah.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  resetBooking();
                  navigate(localePath('/book/calendar'));
                }}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                {t.booking.payment.back}
              </button>
              <button
                onClick={handleConfirmPayment}
                className="btn-gold flex-1"
                disabled={isSubmitting || !transferConfirmed}
              >
                {isSubmitting ? 'Confirming...' : t.booking.payment.submitBooking}
              </button>
            </div>
          </div>
        )}

        {/* Back Button after payment confirmed */}
        {paymentConfirmed && (
          <div className="bg-white p-8 shadow-sm">
            <button
              type="button"
              onClick={() => {
                resetBooking();
                navigate(localePath('/'));
              }}
              className="btn-primary w-full"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
