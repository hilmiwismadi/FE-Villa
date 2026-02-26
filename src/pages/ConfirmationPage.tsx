import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const ConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { dateRange } = useBooking();
  const [linkCopied, setLinkCopied] = useState(false);

  // TODO: Replace with API fetch
  const adminWhatsApp = '6281809252706';

  const orderLink = `${window.location.origin}/book/confirmation/${bookingId}`;
  const orderTimestamp = format(new Date(), "d MMMM yyyy, HH:mm", { locale: id });

  const handleConfirmOrder = () => {
    const checkInStr = dateRange.checkIn
      ? format(dateRange.checkIn, 'd MMMM yyyy', { locale: id })
      : '-';
    const checkOutStr = dateRange.checkOut
      ? format(dateRange.checkOut, 'd MMMM yyyy', { locale: id })
      : '-';

    const message = `Saya mau konfirmasi pemesanan tanggal ${checkInStr} sampai ${checkOutStr} pada jam ${orderTimestamp}. Kode booking: ${bookingId}. Link order: ${orderLink}. Terima kasih.`;
    window.open(`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSaveLink = () => {
    navigator.clipboard.writeText(orderLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="section-padding bg-primary-50 min-h-screen flex items-center">
      <div className="container-custom max-w-3xl">
        <div className="bg-white p-8 md:p-12 shadow-sm text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif text-primary-900 mb-4">
            Booking Submitted Successfully!
          </h1>

          <p className="text-lg text-primary-700 mb-8">
            Your booking reference number is
          </p>

          <div className="bg-gold-50 border-2 border-gold-600 p-4 mb-8 inline-block">
            <p className="text-2xl font-bold font-mono text-gold-900">{bookingId}</p>
          </div>

          {/* Confirm Order via WhatsApp */}
          <div className="mb-10">
            <button
              onClick={handleConfirmOrder}
              className="w-full inline-flex items-center justify-center gap-4 px-10 py-5 bg-green-500 text-white text-xl font-bold rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Confirm Order via WhatsApp
            </button>
            <button
              onClick={handleSaveLink}
              className="w-full mt-3 inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-primary-300 text-primary-900 text-lg font-semibold rounded-lg hover:bg-primary-50 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              {linkCopied ? 'Link Copied!' : 'Save Link'}
            </button>
          </div>

          <div className="text-left bg-primary-50 p-6 mb-8">
            <h2 className="text-xl font-serif text-primary-900 mb-4">What Happens Next?</h2>
            <ol className="space-y-3 text-primary-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-gold-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </span>
                <span>
                  <strong>We're reviewing your payment:</strong> Our team will verify your bank transfer within 24 hours.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-gold-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </span>
                <span>
                  <strong>Confirmation email:</strong> Once approved, you'll receive a confirmation email with your booking details and check-in instructions.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-gold-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </span>
                <span>
                  <strong>Prepare for your stay:</strong> We'll send you owner contact information and everything you need for a smooth check-in.
                </span>
              </li>
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 mb-8">
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> Keep your booking reference number ({bookingId}) safe. You can use it to check your booking status or contact us if needed.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-primary-700">
              A confirmation email has been sent to your email address with all the booking details.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link to="/" className="btn-primary">
                Return to Homepage
              </Link>
              <button
                onClick={() => window.print()}
                className="btn-secondary"
              >
                Print Confirmation
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-12 pt-8 border-t border-primary-200">
            <h3 className="text-lg font-serif text-primary-900 mb-3">Need Help?</h3>
            <p className="text-sm text-primary-700">
              If you have any questions about your booking, please contact us:
            </p>
            <div className="mt-3 text-sm text-primary-700">
              <p>Email: info@villasekipan.com</p>
              <p>Phone: +62 XXX XXX XXXX</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
