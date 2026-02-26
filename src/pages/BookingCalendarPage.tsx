import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, format, eachDayOfInterval, isSameDay } from 'date-fns';
import { useBooking } from '../contexts/BookingContext';
import Calendar from '../components/Calendar';

const BookingCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    setDateRange,
    selectedDates,
    setSelectedDates,
    promoCode,
    setPromoCode,
    appliedPromo,
    setAppliedPromo,
    pricing,
    setPricing,
  } = useBooking();

  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [showBookingMethodModal, setShowBookingMethodModal] = useState(false);

  // TODO: Replace with API fetch - make dynamic
  const adminWhatsApp = '6281809252706';

  // Mock data - Replace with actual API calls
  const basePrice = 2000000;
  const bookedDates: Date[] = [];
  const blockedDates: Date[] = [];

  // Derive checkIn/checkOut from selected dates list
  const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
  const derivedCheckIn = sortedDates.length >= 2 ? sortedDates[0] : null;
  const derivedCheckOut = sortedDates.length >= 2 ? sortedDates[sortedDates.length - 1] : null;
  const numberOfNights = derivedCheckIn && derivedCheckOut
    ? differenceInDays(derivedCheckOut, derivedCheckIn)
    : 0;

  // Sync derived dates to context
  useEffect(() => {
    setDateRange({ checkIn: derivedCheckIn, checkOut: derivedCheckOut });
  }, [derivedCheckIn?.getTime(), derivedCheckOut?.getTime()]);

  const calculatePrice = () => {
    if (numberOfNights <= 0) return;
    const originalPrice = basePrice * numberOfNights;
    let discountAmount = 0;
    if (appliedPromo) {
      discountAmount = (originalPrice * appliedPromo.discountPercentage) / 100;
    }
    const finalPrice = originalPrice - discountAmount;
    setPricing({ originalPrice, discountAmount, finalPrice });
  };

  useEffect(() => {
    calculatePrice();
  }, [numberOfNights, appliedPromo]);

  const handleDateToggle = (dates: Date[]) => {
    if (dates.length === 0) {
      setSelectedDates([]);
      return;
    }

    const wasRemoved = dates.length < selectedDates.length;

    if (wasRemoved) {
      const removed = selectedDates.find(
        sd => !dates.some(d => isSameDay(d, sd))
      );
      if (!removed) { setSelectedDates(dates); return; }

      const sorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
      const first = sorted[0];
      const last = sorted[sorted.length - 1];

      if (isSameDay(removed, first)) {
        setSelectedDates(sorted.filter(d => d > removed));
      } else if (isSameDay(removed, last)) {
        setSelectedDates(sorted.filter(d => d < removed));
      } else {
        setSelectedDates(sorted.filter(d => d < removed));
      }
    } else {
      const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const fullRange = eachDayOfInterval({ start: first, end: last });
      setSelectedDates(fullRange);
    }
  };

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

  const handleContinue = () => {
    if (selectedDates.length < 2) {
      alert('Please select at least 2 dates (check-in and check-out)');
      return;
    }
    setShowBookingMethodModal(true);
  };

  const handleBookViaWebsite = () => {
    setShowBookingMethodModal(false);
    navigate('/book/form');
  };

  const handleBookViaWhatsApp = () => {
    if (!derivedCheckIn || !derivedCheckOut) return;
    const checkInStr = format(derivedCheckIn, 'd MMMM yyyy');
    const checkOutStr = format(derivedCheckOut, 'd MMMM yyyy');
    const message = `Permisi, saya ingin booking villa dari tanggal ${checkInStr} hingga ${checkOutStr}, ${numberOfNights} malam. Mohon informasi ketersediaan dan proses booking. Terima kasih.`;
    window.open(`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`, '_blank');
    setShowBookingMethodModal(false);
  };

  return (
    <div className="section-padding bg-primary-50">
      <div className="container-custom max-w-6xl">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-gold-600">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-gold-600 bg-gold-50">1</div>
              <span className="hidden md:inline text-sm font-medium">Select Dates</span>
            </div>
            <div className="w-12 h-0.5 bg-primary-300"></div>
            <div className="flex items-center gap-2 text-primary-400">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-primary-300">2</div>
              <span className="hidden md:inline text-sm font-medium">Guest Info</span>
            </div>
            <div className="w-12 h-0.5 bg-primary-300"></div>
            <div className="flex items-center gap-2 text-primary-400">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-primary-300">3</div>
              <span className="hidden md:inline text-sm font-medium">Review</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-8 shadow-sm">
              <h2 className="text-3xl font-serif text-primary-900 mb-6">Select Your Dates</h2>
              <p className="text-sm text-primary-600 mb-4">
                Click on dates to select your stay. Click again to deselect.
              </p>
              <Calendar
                multiSelect
                selectedDatesList={selectedDates}
                onDateToggle={handleDateToggle}
                bookedDates={bookedDates}
                blockedDates={blockedDates}
              />

              {derivedCheckIn && derivedCheckOut && (
                <div className="mt-6 p-4 bg-primary-50 border border-primary-200">
                  <p className="text-sm text-primary-700">
                    <strong>Check-in:</strong> {derivedCheckIn.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-primary-700 mt-2">
                    <strong>Check-out:</strong> {derivedCheckOut.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-primary-700 mt-2">
                    <strong>Number of nights:</strong> {numberOfNights}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleContinue}
                disabled={selectedDates.length < 2}
                className="btn-primary flex-1"
              >
                Continue
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 shadow-sm sticky top-24">
              <h3 className="text-xl font-serif text-primary-900 mb-4">Booking Summary</h3>
              <div className="space-y-3 text-sm">
                {derivedCheckIn && derivedCheckOut ? (
                  <>
                    <div className="flex justify-between text-primary-700">
                      <span>IDR {basePrice.toLocaleString()} × {numberOfNights} night{numberOfNights > 1 ? 's' : ''}</span>
                      <span>IDR {pricing.originalPrice.toLocaleString()}</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({appliedPromo.discountPercentage}%)</span>
                        <span>- IDR {pricing.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-primary-200">
                      <div className="flex justify-between font-semibold text-lg text-primary-900">
                        <span>Total</span>
                        <span>IDR {pricing.finalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-primary-600 text-center py-4">Select dates to see pricing</p>
                )}
              </div>

              {/* Promo Code */}
              <div className="mt-6 pt-4 border-t border-primary-200">
                <p className="text-sm font-medium text-primary-900 mb-3">Promo Code</p>
                {!appliedPromo ? (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="input-field flex-1 uppercase text-sm"
                      />
                      <button onClick={handleApplyPromo} className="px-3 py-2 bg-primary-900 text-white text-sm hover:bg-primary-800 transition-colors" disabled={!promoCode}>Apply</button>
                    </div>
                    {promoError && <p className="mt-2 text-xs text-red-600">{promoError}</p>}
                    {promoSuccess && <p className="mt-2 text-xs text-green-600">{promoSuccess}</p>}
                  </div>
                ) : (
                  <div className="p-3 bg-green-50 border border-green-200 text-sm">
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
          </div>
        </div>
      </div>

      {/* Booking Method Modal */}
      {showBookingMethodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowBookingMethodModal(false)}></div>
          <div className="relative bg-white max-w-md w-full mx-4 p-8 shadow-xl">
            <button onClick={() => setShowBookingMethodModal(false)} className="absolute top-4 right-4 text-primary-400 hover:text-primary-900 transition-colors" aria-label="Close">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-2xl font-serif text-primary-900 mb-2">How would you like to book?</h3>
            <p className="text-sm text-primary-600 mb-8">Choose your preferred booking method to continue.</p>
            <div className="space-y-4">
              <button onClick={handleBookViaWebsite} className="w-full flex items-center gap-4 p-4 border-2 border-primary-200 hover:border-gold-600 rounded transition-colors text-left group">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-gold-50">
                  <svg className="w-6 h-6 text-primary-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                </div>
                <div><p className="font-semibold text-primary-900">Book via Website</p><p className="text-sm text-primary-600">Continue with online booking form</p></div>
              </button>
              <button onClick={handleBookViaWhatsApp} className="w-full flex items-center gap-4 p-4 border-2 border-primary-200 hover:border-green-500 rounded transition-colors text-left group">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-green-100">
                  <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                </div>
                <div><p className="font-semibold text-primary-900">Book via WhatsApp</p><p className="text-sm text-primary-600">Chat directly with our team</p></div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendarPage;
