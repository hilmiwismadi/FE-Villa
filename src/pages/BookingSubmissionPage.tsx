import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { useTranslation } from '../i18n/LanguageContext';
import { getOrder } from '../services/orderService';
import type { OrderResponse } from '../services/orderService';
import { format } from 'date-fns';

const BookingSubmissionPage: React.FC = () => {
  const navigate = useNavigate();
  const { localePath } = useTranslation();
  const { orderId } = useParams<{ orderId: string }>();
  const { resetBooking } = useBooking();

  const [orderData, setOrderData] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const adminWhatsApp = '6281809252706';

  console.log('[BookingSubmissionPage] Component mounted!');
  console.log('[BookingSubmissionPage] Current path:', window.location.pathname);
  console.log('[BookingSubmissionPage] Order ID from params:', orderId);

  // Generate WhatsApp message with order details
  const generateWhatsAppMessage = () => {
    if (!orderData) return '';

    const checkIn = format(new Date(orderData.checkInDate), 'd MMMM yyyy');
    const checkOut = format(new Date(orderData.checkOutDate), 'd MMMM yyyy');
    const now = format(new Date(), 'd MMMM yyyy, HH:mm');
    const orderLink = `${window.location.origin}${localePath(`/book/confirmation/${orderData.orderId}`)}`;

    return `Halo Admin,
Link: ${orderLink}

Saya ingin mengkonfirmasi pembayaran untuk pesanan Villa Sekipan:

━━━━━━━━━━━━━━━━━━━
DETAIL PESANAN
━━━━━━━━━━━━━━━━━━━

Kode Pesanan: ${orderData.orderId}
Nama: ${orderData.guestName}
Nomor HP: ${orderData.guestPhone}
Check-in: ${checkIn}
Check-out: ${checkOut}
Durasi: ${orderData.nightCount} malam
Total Pembayaran: IDR ${orderData.totalAmount.toLocaleString('id-ID')}

━━━━━━━━━━━━━━━━━━━
Waktu Konfirmasi: ${now}
━━━━━━━━━━━━━━━━━━━

Mohon diproses segera. Terima kasih.`;
  };

  // Generate WhatsApp message when button is clicked
  const handleConfirmViaWhatsApp = () => {
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${adminWhatsApp}?text=${encodedMessage}`, '_blank');
  };

  // Copy message to clipboard
  const handleCopyMessage = () => {
    const message = generateWhatsAppMessage();
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewBooking = () => {
    resetBooking();
    navigate(localePath('/book/calendar'));
  };

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

  const isRejected = orderData.status === 'rejected';
  const isPendingStatus = orderData.status === 'pending' || orderData.status === 'in_transaction';
  const isGreenStatus = !isRejected && !isPendingStatus;

  return (
    <div className="section-padding bg-primary-50">
      <div className="container-custom max-w-4xl">
        {/* Success Message - Simplified for mobile */}
        <div className={`${isRejected ? 'bg-red-50 border-red-300 ring-red-300' : isGreenStatus ? 'bg-green-50 border-green-300 ring-green-300' : 'bg-yellow-50 border-yellow-300 ring-yellow-300'} border-2 ring-4 p-6 md:p-8 rounded-lg text-center mb-6 animate-pulse`}>
          <div className={`${isRejected ? 'bg-red-100' : isGreenStatus ? 'bg-green-100' : 'bg-yellow-100'} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
            <svg className={`w-8 h-8 ${isRejected ? 'text-red-600' : isGreenStatus ? 'text-green-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRejected ? 'M6 18L18 6M6 6l12 12' : isGreenStatus ? 'M5 13l4 4L19 7' : 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'} />
            </svg>
          </div>
          <h2 className={`text-2xl md:text-3xl font-serif mb-2 ${isRejected ? 'text-red-900' : isGreenStatus ? 'text-green-900' : 'text-yellow-900'}`}>
            {isRejected ? 'Booking Ditolak' : isGreenStatus ? 'Booking Dikonfirmasi' : 'Pembayaran Sedang Diverifikasi'}
          </h2>
          <p className={`text-base md:text-lg mb-4 max-w-2xl mx-auto ${isRejected ? 'text-red-700' : isGreenStatus ? 'text-green-700' : 'text-yellow-700'}`}>
            {isRejected
              ? 'Pesanan Anda ditolak oleh admin villa'
              : isGreenStatus
                ? 'Pembayaran Anda sudah dikonfirmasi admin villa'
                : 'Pesanan Anda telah dikirim ke admin villa'}
          </p>
          {isRejected ? (
            <p className="text-sm md:text-base text-red-600">
              Alasan penolakan: {orderData.rejectionReason || 'Tidak ada alasan yang diberikan.'}
            </p>
          ) : (
            <p className={`text-sm md:text-base ${isGreenStatus ? 'text-green-600' : 'text-yellow-600'}`}>
              {isPendingStatus
                ? 'Anda akan mendapat notifikasi WhatsApp setelah pembayaran dikonfirmasi'
                : 'Status pesanan Anda telah diperbarui'}
            </p>
          )}
        </div>

        {/* WhatsApp Button - Main Highlight, Above the Fold */}
        <div className="bg-green-50 border-2 border-green-400 p-6 rounded-lg mb-6 shadow-lg">
          <div className="text-center mb-4">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884-9.885 9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884 2.64 0 5.122 1.03 6.988 2.898 9.888-9.888 2.893 6.994 0C5.495 0 .16 5.335 11.893-11.893a11.821 11.821 0 00-9-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9 3-9m9 9c1.657 0 3-4.03 3-9s1.343-9 3-9m9 9c1.657 0 3-4.03 3-9s1.343-9 3-9m9 9c1.657 0 3-4.03 3-9s1.343-9 3-9m9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-green-900 mb-2">Kirim Konfirmasi via WhatsApp</h3>
            <p className="text-green-700 mb-4 text-sm md:text-base">
              Kirim detail pesanan untuk konfirmasi pembayaran lebih cepat
            </p>
          </div>

          {/* WhatsApp Button - Main CTA */}
          <button
            onClick={handleConfirmViaWhatsApp}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all transform hover:scale-105 active:scale-95 font-bold text-xl shadow-xl md:text-2xl md:py-6"
          >
            <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884-9.885 9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884 2.64 0 5.122 1.03 6.988 2.898 9.888-9.888 2.893 6.994 0C5.495 0 .16 5.335 11.893-11.893a11.821 11.821 0 00-9-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9 3-9m9 9c1.657 0 3-4.03 3-9s1.343-9 3-9m9 9c1.657 0 3-4.03 3-9s1.343-9 3-9m9 9a9 9 0 019-9" />
            </svg>
            <span className="text-lg md:text-xl">Kirim via WhatsApp</span>
          </button>
        </div>

        {/* Order Summary - Below the Fold */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">Detail Pesanan Anda:</h3>
          <div className="space-y-2 text-sm text-primary-700">
            <p><strong>Order ID:</strong> {orderData.orderId}</p>
            <p><strong>Nama:</strong> {orderData.guestName}</p>
            <p><strong>Total Pembayaran:</strong> IDR {orderData.totalAmount.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* WhatsApp Message Preview - Optional */}
        <div className="bg-white p-4 rounded-lg border border-green-200 mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-primary-900">Lihat Template Pesan:</p>
            <button
              onClick={handleCopyMessage}
              className="text-sm text-green-600 hover:text-green-800 underline"
            >
              {copied ? 'Tersalin!' : 'Salin'}
            </button>
          </div>
          <div className="bg-green-50 p-3 rounded text-sm text-primary-800 whitespace-pre-wrap font-mono leading-relaxed">
            {generateWhatsAppMessage()}
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
  );
};

export default BookingSubmissionPage;
