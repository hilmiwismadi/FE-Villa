import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { useTranslation } from '../i18n/LanguageContext';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, localePath } = useTranslation();
  const { dateRange, guestInfo, pricing } = useBooking();

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!dateRange.checkIn || !dateRange.checkOut || !guestInfo) {
    navigate(localePath('/book/calendar'));
    return null;
  }

  // Mock booking reference - In real app, this would come from API after creating booking
  const bookingReference = `VS-${Date.now().toString().slice(-8)}`;

  // Mock bank details - Replace with actual data
  const bankDetails = {
    bankName: 'Bank Mandiri',
    accountNumber: '1234567890',
    accountName: 'Villa Sekipan',
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(t.booking.payment.copiedToClipboard);
  };

  return (
    <div className="section-padding bg-primary-50">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl font-serif text-primary-900 mb-8">{t.booking.payment.title}</h1>

        {/* Step 1: Bank Transfer Details */}
        <div className="bg-white p-8 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gold-600 text-white rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <h2 className="text-2xl font-serif text-primary-900">{t.booking.payment.step1Title}</h2>
          </div>

          <div className="bg-primary-50 border border-primary-200 p-6 mb-6">
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

              <div className="pt-4 border-t border-primary-300">
                <p className="text-sm text-primary-600 mb-1">{t.booking.payment.transferAmount}</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gold-600">IDR {pricing.finalPrice.toLocaleString()}</p>
                  <button
                    onClick={() => copyToClipboard(pricing.finalPrice.toString())}
                    className="text-sm text-gold-600 hover:text-gold-700"
                  >
                    {t.booking.payment.copy}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-primary-300">
                <p className="text-sm text-primary-600 mb-1">{t.booking.payment.bookingReference}</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-primary-900 font-mono">{bookingReference}</p>
                  <button
                    onClick={() => copyToClipboard(bookingReference)}
                    className="text-sm text-gold-600 hover:text-gold-700"
                  >
                    {t.booking.payment.copy}
                  </button>
                </div>
                <p className="text-xs text-primary-600 mt-1">{t.booking.payment.bookingReferenceNote}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> {t.booking.payment.importantNote}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-8 shadow-sm">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(localePath('/book/review'))}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              {t.booking.payment.back}
            </button>
            <button
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  await new Promise(resolve => setTimeout(resolve, 1500));
                  navigate(localePath(`/book/confirmation/${bookingReference}`));
                } catch {
                  alert(t.booking.payment.errorOccurred);
                  setIsSubmitting(false);
                }
              }}
              className="btn-gold flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? t.booking.payment.submitting : t.booking.payment.submitBooking}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
