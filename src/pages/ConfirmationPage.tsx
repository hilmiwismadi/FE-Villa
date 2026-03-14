import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { useTranslation } from '../i18n/LanguageContext';
import { format } from 'date-fns';
import { getOrder } from '../services/orderService';

const ConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { dateRange } = useBooking();
  const { t, localePath, dateFnsLocale } = useTranslation();
  const [linkCopied, setLinkCopied] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);

  // TODO: Replace with API fetch
  const adminWhatsApp = '6281809252706';

  // Poll order status to check pending → booked transition
  useEffect(() => {
    if (!bookingId) return;
    const fetchStatus = async () => {
      try {
        const order = await getOrder(bookingId);
        setOrderStatus(order.status);
      } catch (err) {
        console.error('[ConfirmationPage] Failed to fetch order status:', err);
      }
    };
    fetchStatus();
    // Stop polling if already booked
    const interval = setInterval(async () => {
      try {
        const order = await getOrder(bookingId);
        setOrderStatus(order.status);
        if (order.status === 'booked' || order.status === 'check_in' || order.status === 'completed') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('[ConfirmationPage] Poll error:', err);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const orderLink = `${window.location.origin}${localePath(`/book/confirmation/${bookingId}`)}`;
  const orderTimestamp = format(new Date(), "d MMMM yyyy, HH:mm", { locale: dateFnsLocale });

  const handleConfirmOrder = () => {
    const checkInStr = dateRange.checkIn
      ? format(dateRange.checkIn, 'd MMMM yyyy', { locale: dateFnsLocale })
      : '-';
    const checkOutStr = dateRange.checkOut
      ? format(dateRange.checkOut, 'd MMMM yyyy', { locale: dateFnsLocale })
      : '-';

    const message = t.booking.confirmation.whatsappMessage
      .replace('{checkIn}', checkInStr)
      .replace('{checkOut}', checkOutStr)
      .replace('{timestamp}', orderTimestamp)
      .replace('{bookingId}', bookingId || '')
      .replace('{orderLink}', orderLink);
    window.open(`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSaveLink = () => {
    navigator.clipboard.writeText(orderLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="section-padding bg-primary-50 min-h-[40vh] flex items-center">
      <div className="container-custom max-w-3xl">
        <div className="bg-white p-3 md:p-4 shadow-sm text-center">
          {/* Status Banner */}
          {orderStatus === 'booked' || orderStatus === 'check_in' || orderStatus === 'completed' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1 inline-flex items-center gap-2 mb-3">
              <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800 font-semibold text-xs">Booking Dikonfirmasi</span>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg px-3 py-1 inline-flex items-center gap-2 mb-3">
              <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-yellow-800 font-semibold text-xs">Pembayaran Sedang Diverifikasi...</span>
            </div>
          )}

          <h1 className="text-lg font-serif text-primary-900 mb-2">
            {t.booking.confirmation.title}
          </h1>

          <p className="text-xs text-primary-700 mb-2">
            Order ID: <strong className="text-sm">{bookingId}</strong>
          </p>

          {/* Confirm Order via WhatsApp */}
          <button
            onClick={handleConfirmOrder}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Konfirmasi WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
