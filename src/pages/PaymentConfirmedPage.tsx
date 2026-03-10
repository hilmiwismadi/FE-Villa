import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useBooking } from '../contexts/BookingContext';
import { useTranslation } from '../i18n/LanguageContext';
import { getOrder, ApiError } from '../services/orderService';
import type { OrderResponse } from '../services/orderService';

const PaymentConfirmedPage: React.FC = () => {
  const navigate = useNavigate();
  const { localePath, lang } = useTranslation();
  const { orderId } = useParams<{ orderId: string }>();
  const { resetBooking } = useBooking();

  const [orderData, setOrderData] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');

  // Redirect if no orderId
  useEffect(() => {
    if (!orderId) {
      navigate(localePath('/book/calendar'));
      return;
    }

    // Fetch order details
    const fetchOrder = async () => {
      try {
        const response = await getOrder(orderId);
        setOrderData(response);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Failed to load order details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate, localePath]);

  const dateLocale = lang === 'id' ? id : undefined;

  // Generate WhatsApp message
  const generateWhatsAppMessage = () => {
    if (!orderData) return '';

    const checkIn = format(new Date(orderData.checkInDate), 'd MMMM yyyy', { locale: dateLocale });
    const checkOut = format(new Date(orderData.checkOutDate), 'd MMMM yyyy', { locale: dateLocale });
    const now = format(new Date(), 'd MMMM yyyy, HH:mm', { locale: dateLocale });

    return `Halo admin, saya mau konfirmasi pesanan saya:

    Detail Pesanan:
    Order ID: ${orderData.orderId}
    Nama: ${orderData.guestName}
    No. HP: ${orderData.guestPhone}
    Check-in: ${checkIn}
    Check-out: ${checkOut}
    Durasi: ${orderData.nightCount} malam
    Total: IDR ${orderData.totalAmount.toLocaleString('id-ID')}

    Waktu Konfirmasi: ${now}

Mohon diproses segera untuk mengkonfirmasi pesanan saya. Terima kasih!`;
  };

  const handleCopyMessage = () => {
    const message = generateWhatsAppMessage();
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const message = whatsappMessage || generateWhatsAppMessage();
    const adminWhatsApp = '6281809252706';
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${adminWhatsApp}?text=${encodedMessage}`, '_blank');
  };

  const handleSubmitWhatsApp = () => {
    if (!transferConfirmed) {
      alert('Mohon centang kotak "Saya sudah transfer dana ke rekening" sebelum mengirim pembayaran.');
      return;
    }

    if (!orderData) return;

    const checkIn = format(new Date(orderData.checkInDate), 'd MMMM yyyy', { locale: dateLocale });
    const checkOut = format(new Date(orderData.checkOutDate), 'd MMMM yyyy', { locale: dateLocale });

    setWhatsappMessage(`Halo admin, saya mau konfirmasi pesanan saya:

    Detail Pesanan:
    Order ID: ${orderData.orderId}
    Nama: ${orderData.guestName}
    No. HP: ${orderData.guestPhone}
    Check-in: ${checkIn}
    Check-out: ${checkOut}
    Durasi: ${orderData.nightCount} malam
    Total: IDR ${orderData.totalAmount.toLocaleString('id-ID')}

    Template Pesanan:
Saya telah memesan pada tanggal ${checkIn} - ${checkOut} dengan nomer ${orderData.guestName} (${orderData.guestPhone}) dengan kode ${orderData.orderId}. Terima kasih!`);
  };

  const handleConfirmSubmit = async () => {
    setWhatsappMessage('');
    navigate(localePath(`/book/confirmation/${orderId}`));
  };

  const handleNewBooking = () => {
    resetBooking();
    navigate(localePath('/book/calendar'));
  };

  if (loading) {
    return (
      <div className="section-padding bg-primary-50 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
        <p className="mt-4 text-primary-700">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-padding bg-primary-50">
        <div className="container-custom max-w-4xl">
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-red-900 mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => navigate(localePath('/book/calendar'))}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Kembali ke Calendar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return null;
  }

  return (
    <div className="section-padding bg-primary-50">
      <div className="container-custom max-w-4xl">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 p-8 rounded-lg mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7l-4 4m0 0l0 0h14l-7 14" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-serif text-green-900 text-center mb-2">Pembayaran Dikonfirmasi!</h2>
          <p className="text-center text-green-700 mb-4">
            Terima kasih! Pemesanan Anda telah kami terima. Silakan tunggu konfirmasi dari admin villa.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white p-6 shadow-sm mb-6">
          <h3 className="text-xl font-serif text-primary-900 mb-4">Detail Pesanan</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-primary-600">Order ID:</span>
              <span className="font-medium text-primary-900 font-mono">{orderData.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-600">Status:</span>
              <span className="font-medium text-primary-900">{orderData.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-600">Nama:</span>
              <span className="font-medium text-primary-900">{orderData.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-600">No. HP:</span>
              <span className="font-medium text-primary-900">{orderData.guestPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-600">Check-in:</span>
              <span className="font-medium text-primary-900">
                {format(new Date(orderData.checkInDate), 'EEEE, d MMMM yyyy', { locale: dateLocale })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-600">Check-out:</span>
              <span className="font-medium text-primary-900">
                {format(new Date(orderData.checkOutDate), 'EEEE, d MMMM yyyy', { locale: dateLocale })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-600">Durasi:</span>
              <span className="font-medium text-primary-900">{orderData.nightCount} malam</span>
            </div>
            <div className="pt-3 border-t-t border-primary-200 mt-3">
              <div className="flex justify-between">
                <span className="text-primary-600">Subtotal:</span>
                <span className="font-medium text-primary-900">IDR {orderData.subtotal.toLocaleString('id-ID')}</span>
              </div>
              {orderData.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-600">Diskon:</span>
                  <span className="font-medium text-green-900">IDR {orderData.discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-primary-600">Total:</span>
                <span className="font-bold text-lg text-primary-900">IDR {orderData.totalAmount.toLocaleString('id-ID')}</span>
              </div>
              {orderData.paymentDeadline && (
                <div className="flex justify-between">
                  <span className="text-primary-600">Batas Pembayaran:</span>
                  <span className="font-medium text-primary-900">
                    {format(new Date(orderData.paymentDeadline), 'EEEE, d MMMM yyyy, HH:mm', { locale: dateLocale })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* WhatsApp Message Section */}
        <div className="bg-white p-6 shadow-sm mb-6">
          <h3 className="text-xl font-serif text-primary-900 mb-4">Kirim Pesanan via WhatsApp</h3>
          <div className="space-y-4">
            <p className="text-sm text-primary-700">
              Salin pesanan template di bawah dan kirim ke admin villa via WhatsApp:
            </p>
            <div className="bg-primary-50 border border-primary-200 p-4 rounded">
              <textarea
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                placeholder="Contoh: Saya telah memesan/transfer dana pada tanggal 18 Mar 2026 - 19 Mar 2026 dengan nomer John Doe (+62812345678) dengan kode VY-20260303-001. Terima kasih!"
                className="w-full p-3 text-sm text-primary-800 font-mono border border-primary-200 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
                rows={4}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <button
                onClick={handleCopyMessage}
                className="flex-1 px-4 py-3 bg-primary-900 text-white rounded hover:bg-primary-800 transition-colors"
              >
                {copied ? 'Tersalin!' : 'Salin Template'}
              </button>
              <button
                onClick={handleOpenWhatsApp}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.571l-7.417 7.414c-.557-.743 2.527-2.688.642-3.476.829-.284-1.521.396.421-.693-1.921.217-.356-5.549.476-4.191.4-16.974.059-3.273-2.957-1.32.298-1.086-.579-.749.248-2.962.965-1.431.491.7.39-.659-1.802-3.419-1.086.3.298.591-.882 2.464.557.802-.385.3.821-4.599.491.7.395.591-.882 2.464.557.802-.385z" />
                  </svg>
                  Buka WhatsApp
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Transfer Confirmation Checkbox */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
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

            {/* Submit WhatsApp Message Button */}
            <button
              onClick={handleSubmitWhatsApp}
              className="btn-primary"
              disabled={!transferConfirmed}
            >
              {transferConfirmed ? 'Edit Pesanan' : 'Kirim Pesanan'}
            </button>

            {/* Confirm & Submit Button */}
            <button
              onClick={handleConfirmSubmit}
              className="btn-gold"
              disabled={!whatsappMessage || !transferConfirmed}
            >
              Konfirmasi & Submit
            </button>

            {/* Back Button */}
            <button
              onClick={handleNewBooking}
              className="btn-secondary"
            >
              Kembali ke Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmedPage;
