import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { differenceInDays } from 'date-fns';

const BookingReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    dateRange, guestInfo, formData, appliedPromo, setAppliedPromo,
    pricing, setPricing, promoCode, setPromoCode,
  } = useBooking();

  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  if (!dateRange.checkIn || !dateRange.checkOut || (!guestInfo && !formData.phone)) {
    navigate('/book/calendar');
    return null;
  }

  const numberOfNights = differenceInDays(dateRange.checkOut, dateRange.checkIn);
  const guest = guestInfo || formData;

  const basePrice = 2000000; // TODO: Replace with API fetch

  // Recalculate pricing when promo changes
  useEffect(() => {
    if (numberOfNights <= 0) return;
    const originalPrice = basePrice * numberOfNights;
    let discountAmount = 0;
    if (appliedPromo) {
      discountAmount = (originalPrice * appliedPromo.discountPercentage) / 100;
    }
    setPricing({ originalPrice, discountAmount, finalPrice: originalPrice - discountAmount });
  }, [numberOfNights, appliedPromo]);

  const handleApplyPromo = () => {
    setPromoError('');
    setPromoSuccess('');
    const validPromoCodes = [
      { code: 'TRAVEL10', discountPercentage: 10, affiliateId: 'aff1', validFrom: new Date(), validUntil: new Date(2026, 11, 31), isActive: true },
      { code: 'SUMMER25', discountPercentage: 25, affiliateId: 'aff2', validFrom: new Date(), validUntil: new Date(2026, 11, 31), isActive: true },
    ];
    const promo = validPromoCodes.find(p => p.code === promoCode.toUpperCase());
    if (promo) {
      setAppliedPromo(promo);
      setPromoSuccess(`${promo.discountPercentage}% discount applied!`);
    } else {
      setPromoError('Invalid promo code');
      setAppliedPromo(null);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setAppliedPromo(null);
    setPromoSuccess('');
    setPromoError('');
  };

  const handleConfirm = () => {
    navigate('/book/payment');
  };

  return (
    <div className="section-padding bg-primary-50">
      <div className="container-custom max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-primary-900">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-primary-900 bg-primary-900 text-white">1</div>
              <span className="hidden md:inline text-sm font-medium">Select Dates</span>
            </div>
            <div className="w-12 h-0.5 bg-primary-900"></div>
            <div className="flex items-center gap-2 text-primary-900">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-primary-900 bg-primary-900 text-white">2</div>
              <span className="hidden md:inline text-sm font-medium">Guest Info</span>
            </div>
            <div className="w-12 h-0.5 bg-primary-900"></div>
            <div className="flex items-center gap-2 text-gold-600">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-gold-600 bg-gold-50">3</div>
              <span className="hidden md:inline text-sm font-medium">Review</span>
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-serif text-primary-900 mb-8">Review Your Booking</h1>

        <div className="bg-white p-8 shadow-sm mb-6">
          <h2 className="text-2xl font-serif text-primary-900 mb-6">Booking Details</h2>

          {/* Dates */}
          <div className="mb-6 pb-6 border-b border-primary-200">
            <h3 className="font-semibold text-primary-900 mb-3">Tanggal Menginap</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-primary-700">
              <div>
                <p className="text-sm text-primary-600">Check-in</p>
                <p className="font-medium">{dateRange.checkIn.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-sm text-primary-600">Check-out</p>
                <p className="font-medium">{dateRange.checkOut.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-primary-600">{numberOfNights} malam</p>
          </div>

          {/* Guest Information */}
          <div className="mb-6 pb-6 border-b border-primary-200">
            <h3 className="font-semibold text-primary-900 mb-3">Informasi Tamu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-primary-600">Nama Lengkap</p>
                <p className="font-medium text-primary-900">{guest.fullName || '-'}</p>
              </div>
              <div>
                <p className="text-primary-600">No. Handphone</p>
                <p className="font-medium text-primary-900">{guest.phone || '-'}</p>
              </div>
              <div>
                <p className="text-primary-600">Email</p>
                <p className="font-medium text-primary-900">{guest.email || '-'}</p>
              </div>
              <div>
                <p className="text-primary-600">Jumlah Tamu</p>
                <p className="font-medium text-primary-900">{guest.numberOfGuests || 1} orang</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-primary-600">Alamat</p>
                <p className="font-medium text-primary-900">
                  {guest.address || '-'}
                  {(guest.city || guest.province) && (
                    <>, {guest.city}{guest.city && guest.province ? ', ' : ''}{guest.province}</>
                  )}
                </p>
              </div>
              <div>
                <p className="text-primary-600">Bed Tambahan</p>
                <p className="font-medium text-primary-900">
                  {guest.extraBed ? `${guest.extraBed} bed` : 'Tidak perlu'}
                </p>
              </div>
              <div>
                <p className="text-primary-600">Estimasi Check-in</p>
                <p className="font-medium text-primary-900">{guest.checkInTime || '-'}</p>
              </div>
            </div>
            {guest.specialRequests && (
              <div className="mt-4">
                <p className="text-sm text-primary-600">Permintaan Khusus</p>
                <p className="text-sm text-primary-900">{guest.specialRequests}</p>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div>
            <h3 className="font-semibold text-primary-900 mb-3">Rincian Harga</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-primary-700">
                <span>Harga dasar ({numberOfNights} malam)</span>
                <span>IDR {pricing.originalPrice.toLocaleString()}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-green-600">
                  <span>Diskon ({appliedPromo.code} - {appliedPromo.discountPercentage}%)</span>
                  <span>- IDR {pricing.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="pt-3 border-t border-primary-200">
                <div className="flex justify-between font-semibold text-xl text-primary-900">
                  <span>Total</span>
                  <span>IDR {pricing.finalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Promo Code */}
          <div className="mt-6 pt-6 border-t border-primary-200">
            <h3 className="font-semibold text-primary-900 mb-3">Promo Code</h3>
            {!appliedPromo ? (
              <div>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="input-field flex-1 uppercase text-sm"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-primary-900 text-white text-sm hover:bg-primary-800 transition-colors"
                    disabled={!promoCode}
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="mt-2 text-xs text-red-600">{promoError}</p>}
                {promoSuccess && <p className="mt-2 text-xs text-green-600">{promoSuccess}</p>}
              </div>
            ) : (
              <div className="p-3 bg-green-50 border border-green-200 text-sm max-w-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-900">{appliedPromo.code}</p>
                    <p className="text-xs text-green-700">{appliedPromo.discountPercentage}% discount</p>
                  </div>
                  <button onClick={handleRemovePromo} className="text-red-600 hover:text-red-800 text-xs underline">Remove</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/book/form')}
            className="btn-secondary"
          >
            Edit Booking
          </button>
          <button
            onClick={handleConfirm}
            className="btn-primary flex-1"
          >
            Confirm & Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingReviewPage;
