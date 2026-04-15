import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { useTranslation } from '../i18n/LanguageContext';
import { format } from 'date-fns';
import { getOrder } from '../services/orderService';

const ConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { dateRange } = useBooking();
  const { t, localePath, dateFnsLocale } = useTranslation();
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // TODO: Replace with API fetch
  const adminWhatsApp = '6281809252706';

  // Poll order status to check pending → booked transition
  useEffect(() => {
    if (!bookingId) return;
    const fetchStatus = async () => {
      try {
        const order = await getOrder(bookingId);
        setOrderStatus(order.status);
        setOrderData(order);
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
        setOrderData(order);
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

  // PDF generation function
  const generatePDF = () => {
    if (!orderData) return;

    const pdfContent = `
========================================
BOOKING CONFIRMATION - VILLA SEKIPAN
========================================

ORDER DATA
----------
Order ID: ${orderData.orderId || bookingId}
Nama Tamu: ${orderData.guestName || orderData.guest_name || 'N/A'}
Nomor HP: ${orderData.guestPhone || orderData.guest_phone || 'N/A'}
Email: ${orderData.guestEmail || orderData.guest_email || '-'}

Check-in: ${orderData.checkInDate || orderData.check_in_date ? format(new Date(orderData.checkInDate || orderData.check_in_date), 'd MMMM yyyy', { locale: dateFnsLocale }) : '-'}
Check-out: ${orderData.checkOutDate || orderData.check_out_date ? format(new Date(orderData.checkOutDate || orderData.check_out_date), 'd MMMM yyyy', { locale: dateFnsLocale }) : '-'}
Durasi: ${orderData.nightCount || orderData.night_count || 0} malam
Jumlah Tamu: ${orderData.guestCount || orderData.guest_count || 0} orang

PAYMENT STATUS
--------------
Status: Booking Dikonfirmasi
Total Pembayaran: IDR ${(orderData.totalAmount || 0).toLocaleString('id-ID')}
Waktu Pesanan: ${orderTimestamp}

========================================
ATURAN MENGINAP DI VILLA SEKIPAN
========================================

1. Waktu Check-In & Check-Out
   - Waktu Check-In: Mulai pukul 14.00 WIB
   - Waktu Check-Out: Maksimal pukul 12.00 WIB
   - Denda Keterlambatan: Beberapa villa memberlakukan denda hingga 50% dari harga sewa jika tamu melakukan check-out melebihi jam yang ditentukan

2. Aturan Perilaku & Larangan Utama
   Villa di area ini mayoritas adalah "Villa Keluarga" yang menerapkan aturan ketat terhadap pelanggaran hukum dan norma:
   - Dilarang Keras: Membawa atau mengonsumsi minuman keras (alkohol) dan narkoba
   - Larangan Asusila: Dilarang membawa pasangan yang bukan muhrim (no pacaran/mesum)
   - Dilarang Merokok di Dalam: Merokok biasanya hanya diperbolehkan di area luar atau teras villa; pelanggaran dapat dikenakan denda

3. Penggunaan Fasilitas Hiburan
   - Jam Malam: Berlaku pukul 24.00 WIB untuk menjaga ketenangan lingkungan sekitar
   - Karaoke: Penggunaan fasilitas karaoke keluarga biasanya dibatasi hingga pukul 23.30 WIB
   - Larangan Sound Besar: Dilarang mengadakan acara dengan live music, DJ, organ tunggal, atau alat musik dengan big sound tanpa izin khusus

4. Kapasitas & Identitas
   - Identitas: Tamu wajib menunjukkan kartu identitas (KTP) saat proses registrasi/check-in
   - Batas Kapasitas: Jumlah tamu tidak boleh melebihi kapasitas maksimal yang disepakati (misal 15-30 orang). Kelebihan jumlah tamu biasanya dikenakan biaya tambahan

========================================
Terima kasih telah memilih Villa Sekipan!
Untuk pertanyaan lebih lanjut, hubungi:
WhatsApp: 6281809252706
========================================
`;

    // Create a simple text-based PDF download
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-confirmation-${bookingId || 'N/A'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

          {/* PDF Download Button - Only show when confirmed */}
          {(orderStatus === 'booked' || orderStatus === 'check_in' || orderStatus === 'completed') && (
            <button
              onClick={generatePDF}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors mb-3"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Bukti Booking
            </button>
          )}

          <h1 className="text-lg font-serif text-primary-900 mb-2">
            {t.booking.confirmation.title}
          </h1>

          <p className="text-xs text-primary-700 mb-2">
            Order ID: <strong className="text-sm">{bookingId}</strong>
          </p>

          {/* Show Rules Button */}
          <button
            onClick={() => setShowPdfModal(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary-100 text-primary-700 text-xs font-bold rounded-lg hover:bg-primary-200 active:bg-primary-300 transition-colors mb-2"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Lihat Aturan Villa
          </button>

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

      {/* Villa Rules Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPdfModal(false)}></div>
          <div className="relative bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl rounded-lg">
            <button
              onClick={() => setShowPdfModal(false)}
              className="absolute top-4 right-4 text-primary-400 hover:text-primary-900 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-serif text-primary-900 mb-6">Aturan Menginap di Villa Sekipan</h2>

            <div className="space-y-6 text-sm text-primary-700">
              <div className="border-l-4 border-gold-600 pl-4">
                <h3 className="font-semibold text-primary-900 mb-2">1. Waktu Check-In & Check-Out</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Waktu Check-In:</strong> Mulai pukul 14.00 WIB</li>
                  <li><strong>Waktu Check-Out:</strong> Maksimal pukul 12.00 WIB</li>
                  <li><strong>Denda Keterlambatan:</strong> Beberapa villa memberlakukan denda hingga 50% dari harga sewa jika tamu melakukan check-out melebihi jam yang ditentukan</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-600 pl-4">
                <h3 className="font-semibold text-primary-900 mb-2">2. Aturan Perilaku & Larangan Utama</h3>
                <p className="mb-2 italic">Villa di area ini mayoritas adalah "Villa Keluarga" yang menerapkan aturan ketat terhadap pelanggaran hukum dan norma:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Dilarang Keras:</strong> Membawa atau mengonsumsi minuman keras (alkohol) dan narkoba</li>
                  <li><strong>Larangan Asusila:</strong> Dilarang membawa pasangan yang bukan muhrim (no pacaran/mesum)</li>
                  <li><strong>Dilarang Merokok di Dalam:</strong> Merokok biasanya hanya diperbolehkan di area luar atau teras villa; pelanggaran dapat dikenakan denda</li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-semibold text-primary-900 mb-2">3. Penggunaan Fasilitas Hiburan</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Jam Malam:</strong> Berlaku pukul 24.00 WIB untuk menjaga ketenangan lingkungan sekitar</li>
                  <li><strong>Karaoke:</strong> Penggunaan fasilitas karaoke keluarga biasanya dibatasi hingga pukul 23.30 WIB</li>
                  <li><strong>Larangan Sound Besar:</strong> Dilarang mengadakan acara dengan live music, DJ, organ tunggal, atau alat musik dengan big sound tanpa izin khusus</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="font-semibold text-primary-900 mb-2">4. Kapasitas & Identitas</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Identitas:</strong> Tamu wajib menunjukkan kartu identitas (KTP) saat proses registrasi/check-in</li>
                  <li><strong>Batas Kapasitas:</strong> Jumlah tamu tidak boleh melebihi kapasitas maksimal yang disepakati (misal 15-30 orang). Kelebihan jumlah tamu biasanya dikenakan biaya tambahan</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowPdfModal(false)}
                className="flex-1 px-4 py-2 border border-primary-300 text-primary-700 hover:bg-primary-50 rounded"
              >
                Tutup
              </button>
              <button
                onClick={generatePDF}
                className="flex-1 px-4 py-2 bg-primary-900 text-white hover:bg-primary-800 rounded"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
