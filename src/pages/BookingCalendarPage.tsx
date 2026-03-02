import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, format, isSameDay, addDays } from 'date-fns';
import { useBooking } from '../contexts/BookingContext';
import { useTranslation } from '../i18n/LanguageContext';
import Calendar from '../components/Calendar';
import AvailabilityErrorModal from '../components/AvailabilityErrorModal';
import type { CalendarDay } from '../types';
import { getCalendar, checkAvailability, ApiError, type AvailabilityResponse } from '../services/orderService';
import { validatePromo } from '../services/promoService';

const BookingCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, localePath, dateFnsLocale } = useTranslation();
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
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<AvailabilityResponse | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDateToAdd, setPendingDateToAdd] = useState<Date | null>(null);

  const adminWhatsApp = '6281809252706';
  const basePrice = 2000000;

  // Derive checkIn/checkOut from selected dates
  const derivedCheckIn = selectedDates.length >= 1 ? selectedDates.sort((a, b) => a.getTime() - b.getTime())[0] : null;
  const derivedCheckOut = derivedCheckIn ? addDays(derivedCheckIn, selectedDates.length) : null;
  const numberOfNights = selectedDates.length;

  // Sync derived dates to context
  useEffect(() => {
    setDateRange({ checkIn: derivedCheckIn, checkOut: derivedCheckOut });
  }, [selectedDates.length, JSON.stringify(selectedDates).substring(0, 50)]);

  // Fetch calendar data for current month
  const handleMonthChange = async (month: string) => {
    try {
      const response = await getCalendar(month);
      setCalendarData(response.days);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Failed to fetch calendar data:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };

  // Fetch initial calendar on mount
  useEffect(() => {
    const currentMonth = new Date();
    handleMonthChange(format(currentMonth, 'yyyy-MM'));
  }, []);

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

  // Handle date: toggle / add / remove
  const handleDateToggle = (dates: Date[]) => {
    console.log('[handleDateToggle] called with dates:', dates.map(d => format(d, 'yyyy-MM-dd')));
    console.log('[handleDateToggle] current selectedDates:', selectedDates.map(d => format(d, 'yyyy-MM-dd')));

    // Just sync dates from Calendar - Calendar handles all the logic
    setSelectedDates(dates);
  };

  const handleConfirmReplace = () => {
    if (pendingDateToAdd) {
      setSelectedDates([pendingDateToAdd]);
    }
    setShowConfirmModal(false);
    setPendingDateToAdd(null);
  };

  const handleCancelReplace = () => {
    setShowConfirmModal(false);
    setPendingDateToAdd(null);
  };

  const handleApplyPromo = async () => {
    setPromoError('');
    setPromoSuccess('');
    setValidatingPromo(true);

    if (!derivedCheckIn || !derivedCheckOut || !promoCode) {
      setValidatingPromo(false);
      return;
    }

    try {
      const response = await validatePromo({
        code: promoCode,
        checkIn: format(derivedCheckIn, 'yyyy-MM-dd'),
        checkOut: format(derivedCheckOut, 'yyyy-MM-dd'),
        guestPhone: '',
      });

      if (response.valid) {
        setAppliedPromo({
          code: promoCode.toUpperCase(),
          discountPercentage: response.discountValue || 0,
          discountType: response.discountType,
          dayCondition: response.dayCondition,
          customDays: response.customDays,
          validFrom: new Date(),
          validUntil: new Date(),
          isActive: true,
        });
        setPromoSuccess(`${t.booking.calendar.discountApplied}`);
      } else {
        setPromoError(response.reason || t.booking.calendar.invalidPromo);
        setAppliedPromo(null);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setPromoError(error.message || t.booking.calendar.invalidPromo);
      } else {
        setPromoError(t.booking.calendar.invalidPromo);
      }
      setAppliedPromo(null);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setAppliedPromo(null);
    setPromoSuccess('');
    setPromoError('');
  };

  const handleContinue = () => {
    if (selectedDates.length < 1) {
      alert('Silakan pilih tanggal untuk menginap');
      return;
    }
    setShowBookingMethodModal(true);
  };

  const handleBookViaWebsite = async () => {
    console.log('[handleBookViaWebsite] clicked, selectedDates:', selectedDates.length, 'checkIn:', derivedCheckIn, 'checkOut:', derivedCheckOut);

    if (!derivedCheckIn || !derivedCheckOut) {
      console.log('[handleBookViaWebsite] validation FAILED - closing modal');
      alert('Silakan pilih tanggal untuk menginap');
      return;
    }

    console.log('[handleBookViaWebsite] validation passed - closing modal');
    setShowBookingMethodModal(false);

    setCheckingAvailability(true);
    try {
      const checkInStr = format(derivedCheckIn, 'yyyy-MM-dd');
      const checkOutStr = format(derivedCheckOut, 'yyyy-MM-dd');
      console.log('[handleBookViaWebsite] checking availability for:', checkInStr, 'to:', checkOutStr);
      const response = await checkAvailability(checkInStr, checkOutStr);
      console.log('[handleBookViaWebsite] availability response:', response);

      if (!response.available) {
        setAvailabilityError(response);
        setSelectedDates([]);
        return;
      }

      console.log('[handleBookViaWebsite] navigating to /book/form');
      navigate(localePath('/book/form'));
    } catch (error) {
      console.error('[handleBookViaWebsite] Availability check failed:', error);
      alert('Failed to check availability. Please try again.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleBookViaWhatsApp = () => {
    if (!derivedCheckIn || !derivedCheckOut) return;
    const checkInStr = format(derivedCheckIn, 'd MMMM yyyy', { locale: dateFnsLocale });
    const checkOutStr = format(derivedCheckOut, 'd MMMM yyyy', { locale: dateFnsLocale });
    const message = t.booking.calendar.whatsappMessage
      .replace('{checkIn}', checkInStr)
      .replace('{checkOut}', checkOutStr)
      .replace('{nights}', String(numberOfNights));
    window.open(`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`, '_blank');
    setShowBookingMethodModal(false);
  };

  const nightLabel = numberOfNights > 1 ? t.booking.calendar.nightPlural : t.booking.calendar.nightSingular;

  return (
    <div className="section-padding bg-primary-50">
      <div className="container-custom max-w-6xl">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-gold-600">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-gold-600 bg-gold-50">1</div>
              <span className="hidden md:inline text-sm{ font-medium">{t.booking.steps.selectDates}</span>
            </div>
            <div className="w-12 h-0.5 bg-primary-300"></div>
            <div className="flex items-center gap-2 text-primary-400">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-primary-300">2</div>
              <span className="hidden md:inline text-sm{ font-medium">{t.booking.steps.guestInfo}</span>
            </div>
            <div className="w-12 h-0.5 bg-primary-300"></div>
            <div className="flex items-center gap-2 text-primary-400">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-primary-300">3</div>
              <span className="hidden md:inline text-sm{ font-medium">{t.booking.steps.review}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 shadow-sm">
              <h2 className="text-3xl font-serif text-primary-900 mb-6">{t.booking.calendar.title}</h2>
              <p className="text-sm text-primary-600 mb-4">
                Pilih tanggal untuk menginap. Setiap tanggal mewakili 1 malam (check-in 12:00 - check-out 12:00 hari berikutnya).
              </p>
              <Calendar
                multiSelect={true}
                selectedDatesList={selectedDates}
                onDateToggle={handleDateToggle}
                bookedDates={[]}
                blockedDates={[]}
                calendarData={calendarData}
                onMonthChange={handleMonthChange}
              />

              {derivedCheckIn && derivedCheckOut && (
                <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                  <p className="text-xs text-primary-500 uppercase tracking-wide font-medium mb-3">
                    Ringkasan Tanggal
                  </p>
                  <p className="text-sm text-primary-700">
                    <strong>Check-in:</strong> {derivedCheckIn.toLocaleDateString(dateFnsLocale.code === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-primary-700 mt-2">
                    <strong>Check-out:</strong> {derivedCheckOut.toLocaleDateString(dateFnsLocale.code === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-primary-700 mt-2">
                    <strong>Durasi:</strong> {numberOfNights} malam
                  </p>
                  <p className="text-sm text-primary-600 mt-2 pt-2 border-t border-primary-200">
                    <strong>Waktu menginap:</strong> {format(derivedCheckIn, 'd MMMM yyyy', { locale: dateFnsLocale })} 12:00 - {format(derivedCheckOut, 'd MMMM yyyy', { locale: dateFnsLocale })} 12:00 (WIB)
                  </p>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleContinue}
                disabled={selectedDates.length < 1 || checkingAvailability}
                className="btn-primary flex-1"
              >
                {checkingAvailability ? 'Checking...' : 'Lanjut'}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 shadow-sm sticky top-24">
              {/* Date Range Info Section */}
              {derivedCheckIn && derivedCheckOut && (
                <div className="mb-6 pb-6 border-b border-primary-200">
                  <h3 className="text-sm font-semibold text-primary-900 mb-3">
                    Informasi Tanggal
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-primary-600">Check-in</span>
                      <span className="text-primary-900 font-medium">
                        {format(derivedCheckIn, 'd MMM yyyy', { locale: dateFnsLocale })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-600">Check-out</span>
                      <span className="text-primary-900 font-medium">
                        {format(derivedCheckOut, 'd MMM yyyy', { locale: dateFnsLocale })}
                      </span>
                    </div>
                    <div className="pt-2 mt-2 bg-primary-50 rounded p-2">
                      <p className="text-xs text-primary-700">
                        <span className="font-medium">Menginap:</span> {numberOfNights} malam
                      </p>
                      <p className="text-xs text-primary-600 mt-1">
                        {format(derivedCheckIn, 'd MMM', { locale: dateFnsLocale })} 12:00 - {format(derivedCheckOut, 'd MMM', { locale: dateFnsLocale })} 12:00 (WIB)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <h3 className="text-xl font-serif text-primary-900 mb-4">{t.booking.calendar.bookingSummary}</h3>
              <div className="space-y-3 text-sm">
                {derivedCheckIn && derivedCheckOut ? (
                  <>
                    <div className="flex justify-between text-primary-700">
                      <span>IDR {basePrice.toLocaleString()} × {numberOfNights} malam</span>
                      <span>IDR {pricing.originalPrice.toLocaleString()}</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between text-green-600">
                        <span>Diskon ({appliedPromo.discountPercentage}%)</span>
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
                  <p className="text-primary-600 text-center py-4">{t.booking.calendar.selectDatesForPricing}</p>
                )}
              </div>

              {/* Promo Code */}
              <div className="mt-6 pt-4 border-t border-primary-200">
                <p className="text-sm font-medium text-primary-900 mb-3">{t.booking.calendar.promoCode}</p>
                {!appliedPromo ? (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder={t.booking.calendar.enterCode}
                        className="input-field flex-1 uppercase text-sm"
                      />
                      <button onClick={handleApplyPromo} className="px-3 py-2 bg-primary-900 text-white text-sm hover:bg-primary-800 transition-colors" disabled={!promoCode || validatingPromo}>{validatingPromo ? 'Checking...' : t.booking.calendar.apply}</button>
                    </div>
                    {promoError && <p className="mt-2 text-xs text-red-600">{promoError}</p>}
                    {promoSuccess && <p className="mt-2 text-xs text-green-600">{promoSuccess}</p>}
                  </div>
                ) : (
                  <div className="p-3 bg-green-50 border border-green-200 text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-900">{appliedPromo.code}</p>
                        <p className="text-xs text-green-700">{appliedPromo.discountPercentage}% {t.booking.calendar.discount.toLowerCase()}</p>
                      </div>
                      <button onClick={handleRemovePromo} className="text-red-600 hover:text-red-800 text-xs underline">{t.booking.calendar.remove}</button>
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

            <h3 className="text-2xl font-serif text-primary-900 mb-2">{t.booking.calendar.modalTitle}</h3>
            <p className="text-sm text-primary-600 mb-8">{t.booking.calendar.modalSubtitle}</p>
            {showConfirmModal && pendingDateToAdd && (
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 6v.01m-6 6H12m0-6v6m0-6v.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-primary-900 mb-2">
                  Ganti Pilihan Tanggal?
                </h3>
                <p className="text-sm text-primary-600 mb-6">
                  Anda memilih tanggal <strong>{format(pendingDateToAdd, 'd MMMM yyyy', { locale: dateFnsLocale })}</strong> yang terpisah dari pilihan sebelumnya.
                  <br /><br />
                  Pilihan ini akan mengganti tanggal yang sudah dipilih dan memulai dari tanggal baru tersebut.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelReplace}
                    className="flex-1 px-4 py-2 border border-primary-300 text-primary-700 hover:bg-primary-50 rounded transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleConfirmReplace}
                    className="flex-1 px-4 py-2 bg-primary-900 text-white hover:bg-primary-800 rounded transition-colors"
                  >
                    Ya, Ganti
                  </button>
                </div>
              </div>
            )}

            {!showConfirmModal && (
              <div className="space-y-4">
                <button onClick={handleBookViaWebsite} className="w-full flex items-center gap-4 p-4 border-2 border-primary-200 hover:border-gold-600 rounded transition-colors text-left group">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-gold-50">
                    <svg className="w-6 h-6 text-primary-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2121 12a9 9 0 01-9 9m9 9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9 3-9m0 18c-1.657 0 3-4.03 3-9s1.343-9 3-9m9 9c1.657 0 3-4.03 3-9s1.343-9 3-9m9 9c1.657 0 3-4.03 3-9s1.343-9 3-9m9 9a9 9 0 019-9" /></svg>
                  </div>
                  <div><p className="font-semibold text-primary-900">{t.booking.calendar.bookViaWebsite}</p><p className="text-sm text-primary-600">{t.booking.calendar.bookViaWebsiteDesc}</p></div>
                </button>
                <button onClick={handleBookViaWhatsApp} className="w-full flex items-center gap-4 p-4 border-2 border-primary-200 hover:border-green-500 rounded transition-colors text-left group">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-green-100">
                    <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884-9.885 9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884 2.64 0 5.122 1.03 6.988 2.898 9.888-9.888 2.893 6.994 0C5.495 0 .16 5.335 11.893-11.893a11.821 11.821 0 00-9-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9 3-9m9 9c1.657 0 3-4.03 3-9s1.343-9 3-9m9 9a9 9 0 019-9" /></svg>
                  </div>
                  <div><p className="font-semibold text-primary-900">{t.booking.calendar.bookViaWhatsApp}</p><p className="text-sm text-primary-600">{t.booking.calendar.bookViaWhatsAppDesc}</p></div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Availability Error Modal */}
      <AvailabilityErrorModal
        isOpen={!!availabilityError}
        onClose={() => setAvailabilityError(null)}
        blockedDates={availabilityError?.blockedDates}
        conflictingDates={availabilityError?.conflictingDates}
      />
    </div>
  );
};

export default BookingCalendarPage;
