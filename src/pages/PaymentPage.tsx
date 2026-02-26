import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { dateRange, guestInfo, pricing } = useBooking();

  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [transferDate, setTransferDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!dateRange.checkIn || !dateRange.checkOut || !guestInfo) {
    navigate('/book/calendar');
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentProof || !transferDate) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Upload payment proof and create booking
      // const formData = new FormData();
      // formData.append('paymentProof', paymentProof);
      // formData.append('transferDate', transferDate);
      // formData.append('transferAmount', transferAmount);
      // formData.append('bookingData', JSON.stringify({ dateRange, guestInfo, pricing }));
      // await api.createBooking(formData);

      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Navigate to confirmation page with booking ID
      navigate(`/book/confirmation/${bookingReference}`);
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="section-padding bg-primary-50">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl font-serif text-primary-900 mb-8">Payment</h1>

        {/* Step 1: Bank Transfer Details */}
        <div className="bg-white p-8 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gold-600 text-white rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <h2 className="text-2xl font-serif text-primary-900">Make Bank Transfer</h2>
          </div>

          <div className="bg-primary-50 border border-primary-200 p-6 mb-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-primary-600 mb-1">Bank Name</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-primary-900">{bankDetails.bankName}</p>
                  <button
                    onClick={() => copyToClipboard(bankDetails.bankName)}
                    className="text-sm text-gold-600 hover:text-gold-700"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm text-primary-600 mb-1">Account Number</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-primary-900">{bankDetails.accountNumber}</p>
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountNumber)}
                    className="text-sm text-gold-600 hover:text-gold-700"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm text-primary-600 mb-1">Account Name</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-primary-900">{bankDetails.accountName}</p>
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountName)}
                    className="text-sm text-gold-600 hover:text-gold-700"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-primary-300">
                <p className="text-sm text-primary-600 mb-1">Transfer Amount</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gold-600">IDR {pricing.finalPrice.toLocaleString()}</p>
                  <button
                    onClick={() => copyToClipboard(pricing.finalPrice.toString())}
                    className="text-sm text-gold-600 hover:text-gold-700"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-primary-300">
                <p className="text-sm text-primary-600 mb-1">Booking Reference</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-primary-900 font-mono">{bookingReference}</p>
                  <button
                    onClick={() => copyToClipboard(bookingReference)}
                    className="text-sm text-gold-600 hover:text-gold-700"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-primary-600 mt-1">Please include this reference in your transfer notes</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Please transfer the exact amount shown above and include the booking reference in your transfer notes.
            </p>
          </div>
        </div>

        {/* Step 2: Upload Payment Proof */}
        <div className="bg-white p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gold-600 text-white rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <h2 className="text-2xl font-serif text-primary-900">Upload Payment Proof</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-2">
                Payment Receipt / Screenshot *
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-primary-700
                  file:mr-4 file:py-2 file:px-4
                  file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary-900 file:text-white
                  hover:file:bg-primary-800
                  file:cursor-pointer cursor-pointer"
                required
              />
              <p className="text-xs text-primary-600 mt-1">
                Supported formats: JPG, PNG, PDF (Max 5MB)
              </p>
              {paymentProof && (
                <p className="text-sm text-green-600 mt-2">✓ File selected: {paymentProof.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-900 mb-2">
                Transfer Date *
              </label>
              <input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="input-field"
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong> After you submit your payment proof, our team will verify your transfer.
                You'll receive a confirmation email once your booking is approved (usually within 24 hours).
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/book/review')}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-gold flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
