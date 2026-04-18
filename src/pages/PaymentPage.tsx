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
    pricing,
    setPricing,
    resetBooking,
  } = useBooking();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(null);
  const [createOrderError, setCreateOrderError] = useState<string | null>(null);
  const [paymentConfirmed] = useState(false);
  const [confirmPaymentError, setConfirmPaymentError] = useState<string | null>(null);
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Check if booking data is valid
  const hasValidBooking = Boolean(dateRange.checkIn && dateRange.checkOut);

  // Redirect if no booking data (only on initial mount)
  // Note: We use a ref to prevent this from running again after resetBooking
  const hasMountedRef = React.useRef(false);

  // Track if user has confirmed payment (to prevent redirect loop)
  const paymentConfirmedRef = React.useRef(false);

  // Track if we're currently fetching to prevent double-invocation in React 18 strict mode
  const isFetchingRef = React.useRef(false);

  // Fetch order on mount if we have an orderId in URL
  useEffect(() => {
    console.log('[PaymentPage] useEffect RUNNING =================================');
    console.log('[PaymentPage] Current window.location.pathname:', window.location.pathname);
    console.log('[PaymentPage] hasValidBooking:', hasValidBooking);
    console.log('[PaymentPage] orderId:', orderId);
    console.log('[PaymentPage] hasMountedRef.current:', hasMountedRef.current);
    console.log('[PaymentPage] dateRange:', dateRange);

    // Mark as mounted to prevent redirect loop
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      console.log('[PaymentPage] First mount - marking as mounted');
    }

    // Fetch order if we have an orderId, regardless of booking state
    if (orderId) {
      if (isFetchingRef.current) {
        console.log('[PaymentPage] ⚠️ DUPLICATE INVOCATION - Already fetching, skipping!');
        return;
      }
      console.log('[PaymentPage] Fetching order...');
      isFetchingRef.current = true;
      setLoadingOrder(true);
      console.log('[PaymentPage] Loading state set to true');
      const fetchOrder = async () => {
        try {
          const response = await getOrder(orderId);
          console.log('[PaymentPage] ✅ Order fetched:', response);
          console.log('[PaymentPage] Order status:', response.status);
          setOrderResponse(response);
          setLoadingOrder(false);
          isFetchingRef.current = false;

          // Console log for pricing comparison
          console.log('========================================');
          console.log('PAYMENT PAGE PRICING COMPARISON');
          console.log('========================================');
          console.log('API Response Pricing:', {
            subtotal: response.subtotal,
            discountAmount: response.discountAmount,
            totalAmount: response.totalAmount,
            uniqueCode: response.uniqueCode,
            calculatedOriginal: response.subtotal + response.discountAmount
          });
          console.log('FE Context Pricing (before update):', pricing);
          console.log('Date Range:', {
            checkIn: dateRange.checkIn ? dateRange.checkIn.toISOString() : null,
            checkOut: dateRange.checkOut ? dateRange.checkOut.toISOString() : null
          });
          console.log('========================================');

          // Update pricing with actual values from API response
          setPricing({
            originalPrice: response.subtotal + response.discountAmount,
            discountAmount: response.discountAmount,
            finalPrice: response.totalAmount,
          });
        } catch (error) {
          console.error('[PaymentPage] Fetch order error:', error);
          setLoadingOrder(false);
          isFetchingRef.current = false;
          if (error instanceof ApiError) {
            setCreateOrderError(error.message);
          } else {
            setCreateOrderError('Failed to load order details');
          }
        }
      };

      fetchOrder();
    } else {
      console.log('[PaymentPage] No orderId available, skipping fetch');
    }
  }, [orderId, setPricing, navigate, localePath]);

  // Countdown timer based on paymentDeadline from order
  useEffect(() => {
    if (!orderResponse?.paymentDeadline) return;
    const deadline = new Date(orderResponse.paymentDeadline).getTime();
    const update = () => {
      const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setTimeLeft(remaining);
      return remaining;
    };
    update();
    const timer = setInterval(() => {
      const remaining = update();
      if (remaining <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [orderResponse?.paymentDeadline]);



  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Early return for render (after all hooks)
  // Remove hasValidBooking check to prevent blank page - show page even if booking data is cleared
  // const if (!hasValidBooking) {
  //   return null;
  // }

  const handleConfirmPayment = async () => {
    console.log('[PaymentPage] handleConfirmPayment called');
    console.log('[PaymentPage] orderResponse:', orderResponse);
    console.log('[PaymentPage] transferConfirmed:', transferConfirmed);
    console.log('[PaymentPage] hasValidBooking:', hasValidBooking);

    if (!orderResponse?.orderId) {
      console.log('[PaymentPage] Returning - no orderId');
      return;
    }
    if (!transferConfirmed) {
      alert('Mohon centang kotak "Saya sudah transfer" sebelum mengirim pembayaran.');
      console.log('[PaymentPage] Returning - transfer not confirmed');
      return;
    }

    setIsSubmitting(true);
    setConfirmPaymentError(null);

    try {
      console.log('[PaymentPage] Calling confirmPayment API with orderId:', orderResponse.orderId);
      await confirmPayment(orderResponse.orderId);
      console.log('[PaymentPage] confirmPayment API succeeded');

      resetBooking();

      const targetPath = localePath(`/book/confirmation/${orderResponse.orderId}`);
      console.log('[PaymentPage] Current path:', window.location.pathname);
      console.log('[PaymentPage] Target path:', targetPath);
      console.log('[PaymentPage] Navigating to confirmation page...');
      navigate(targetPath);
      console.log('[PaymentPage] Navigation called');
    } catch (error) {
      console.error('[PaymentPage] confirmPayment API error:', error);
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

        {/* Loading State */}
        {loadingOrder && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
            <p className="ml-4 text-primary-700">Loading order details...</p>
          </div>
        )}

        {/* Order Fetch Error */}
        {createOrderError && !loadingOrder && (
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

        {/* Payment Countdown Timer */}
        {orderResponse && !paymentConfirmed && timeLeft !== null && (
          <div className={`p-4 mb-6 flex items-center gap-4 border ${
            timeLeft <= 60
              ? 'bg-red-50 border-red-300'
              : 'bg-gold-50 border-gold-300'
          }`}>
            <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center ${
              timeLeft <= 60 ? 'bg-red-100' : 'bg-gold-100'
            }`}>
              <svg className={`w-7 h-7 ${timeLeft <= 60 ? 'text-red-600' : 'text-gold-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${timeLeft <= 60 ? 'text-red-600' : 'text-gold-700'}`}>
                Batas Waktu Pembayaran
              </p>
              <p className={`text-3xl font-mono font-bold leading-none ${timeLeft <= 60 ? 'text-red-700' : 'text-gold-800'}`}>
                {formatTime(timeLeft)}
              </p>
              <p className={`text-xs mt-1 ${timeLeft <= 60 ? 'text-red-500' : 'text-gold-600'}`}>
                {timeLeft <= 0
                  ? 'Waktu habis. Silakan buat pemesanan baru.'
                  : 'Selesaikan pembayaran sebelum waktu habis'}
              </p>
              <p className={`text-xs mt-1 ${timeLeft <= 60 ? 'text-red-500' : 'text-gold-600'}`}>
                Timer berjalan sejak order dibuat (berdasarkan payment deadline dari server).
              </p>
            </div>
            {timeLeft > 0 && (
              <div className={`text-right text-xs ${timeLeft <= 60 ? 'text-red-500' : 'text-gold-600'}`}>
                <p className="font-medium">{Math.ceil(timeLeft / 60)} menit tersisa</p>
                <p>batas waktu</p>
              </div>
            )}
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
              {orderResponse.totalAmount > 0 && (
                <p className="text-xs text-primary-600 mt-1">
                  Catatan: 2 digit terakhir ({String(orderResponse.totalAmount).slice(-2)}) adalah kode pembeda transaksi.
                </p>
              )}
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

            <button
              onClick={handleConfirmPayment}
              className={`w-full ${
                isSubmitting || !transferConfirmed
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'btn-gold'
              }`}
              disabled={isSubmitting || !transferConfirmed}
            >
              {isSubmitting ? 'Confirming...' : t.booking.payment.submitBooking}
            </button>
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
