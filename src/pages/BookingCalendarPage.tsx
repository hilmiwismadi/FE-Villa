import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { useBooking } from '../contexts/BookingContext';
import { useTranslation } from '../i18n/LanguageContext';
import Calendar from '../components/Calendar';
import AvailabilityErrorModal from '../components/AvailabilityErrorModal';
import type { CalendarDay } from '../types';
import {
  getCalendar,
  checkAvailability,
  getAdminCustomPricingRules,
  ApiError,
  type AvailabilityResponse,
  type CustomPricingRuleResponse
} from '../services/orderService';
import { validatePromo } from '../services/promoService';

const BookingCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, localePath, dateFnsLocale } = useTranslation();

  console.log('[BookingCalendarPage] Component mounted!');
  console.log('[BookingCalendarPage] Current path:', window.location.pathname);
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

  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl && !promoCode) {
      setPromoCode(codeFromUrl.toUpperCase());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<AvailabilityResponse | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDateToAdd, setPendingDateToAdd] = useState<Date | null>(null);

  const basePrice = 2000000;

  // Derive checkIn/checkOut from selected dates using useMemo to prevent infinite loops
  const derivedCheckIn = useMemo(() => {
    if (selectedDates.length >= 1) {
      const sorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
      return sorted[0];
    }
    return null;
  }, [selectedDates.length, ...selectedDates.map(d => d.getTime()), setSelectedDates]);

  const derivedCheckOut = useMemo(() => {
    return derivedCheckIn ? addDays(derivedCheckIn, selectedDates.length) : null;
  }, [derivedCheckIn, selectedDates.length]);

  const numberOfNights = selectedDates.length;

  const selectedCustomPricingLabels = useMemo(() => {
    return selectedDates
      .map(date => {
        const dayData = calendarData.find(d => d.date === format(date, 'yyyy-MM-dd'));
        const label = dayData?.label
          || dayData?.customPriceLabel
          || dayData?.pricingLabel;
        if (!label) return null;
        return { date, label };
      })
      .filter((entry): entry is { date: Date; label: string } => entry !== null);
  }, [selectedDates, calendarData]);

  const isRuleAppliedToDate = (rule: CustomPricingRuleResponse, dateStr: string, dayPrice?: number): boolean => {
    if (!rule.isActive) return false;
    if (!rule.label) return false;
    if (!rule.startDate || !rule.endDate) return false;
    if (dateStr < rule.startDate || dateStr > rule.endDate) return false;

    if (Array.isArray(rule.dayOfWeek) && rule.dayOfWeek.length > 0) {
      const dateDay = new Date(`${dateStr}T00:00:00`).getDay();
      if (!rule.dayOfWeek.includes(dateDay)) return false;
    }

    const rulePrice = typeof rule.customAmount === 'number'
      ? rule.customAmount
      : rule.amount;

    if (typeof rulePrice === 'number' && typeof dayPrice === 'number' && rulePrice !== dayPrice) {
      return false;
    }

    return true;
  };

  // Sync derived dates to context
  useEffect(() => {
    setDateRange({ checkIn: derivedCheckIn, checkOut: derivedCheckOut });
  }, [derivedCheckIn, derivedCheckOut, setDateRange]);

  // Fetch calendar data for current month
  const handleMonthChange = async (month: string) => {
    try {
      const response = await getCalendar(month);
      const daysWithLabel = [...response.days];

      try {
        const customPricingResponse = await getAdminCustomPricingRules(1, 500);
        if (customPricingResponse.rules.length > 0) {
          daysWithLabel.forEach(day => {
            const matchingRule = customPricingResponse.rules.find(rule =>
              isRuleAppliedToDate(rule, day.date, day.price)
            );

            if (matchingRule?.label) {
              day.label = matchingRule.label;
              day.source = 'custom';
            }
          });
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          // Public users cannot access admin pricing rules; keep calendar usable without labels.
        } else {
          console.error('Failed to fetch custom pricing rules:', error);
        }
      }

      setCalendarData(daysWithLabel);
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

  // Debug log for selectedDates changes
  useEffect(() => {
    console.log('[BookingCalendarPage] selectedDates changed:', selectedDates.map(d => format(d, 'yyyy-MM-dd')));
    console.log('[BookingCalendarPage] derivedCheckIn:', derivedCheckIn ? format(derivedCheckIn, 'yyyy-MM-dd') : null);
  }, [selectedDates]);

  const calculatePrice = () => {
    if (numberOfNights <= 0) return;

    // Calculate price using actual prices from calendarData if available
    let originalPrice = 0;
    if (calendarData.length > 0) {
      // Sum prices from calendarData for each selected date
      selectedDates.forEach(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayData = calendarData.find(d => d.date === dateStr);
        if (dayData && dayData.price) {
          originalPrice += dayData.price;
        }
      });
    } else {
      // Fallback to basePrice if calendarData not available
      originalPrice = basePrice * numberOfNights;
    }

    let discountAmount = 0;
    if (appliedPromo) {
      if (appliedPromo.discountType === 'fixed') {
        discountAmount = appliedPromo.discountValue || appliedPromo.discountPercentage || 0;
      } else {
        const percentage = appliedPromo.discountValue || appliedPromo.discountPercentage || 0;
        discountAmount = (originalPrice * percentage) / 100;
      }
    }
    discountAmount = Math.min(discountAmount, originalPrice);
    const finalPrice = originalPrice - discountAmount;
    setPricing({ originalPrice, discountAmount, finalPrice });
  };

  useEffect(() => {
    calculatePrice();
  }, [numberOfNights, appliedPromo, calendarData, selectedDates]);

  // Handle date: toggle / add / remove
  const handleDateToggle = (dates: Date[]) => {
    console.log('[handleDateToggle] called with dates:', dates.map(d => format(d, 'yyyy-MM-dd')));
    console.log('[handleDateToggle] current selectedDates:', selectedDates.map(d => format(d, 'yyyy-MM-dd')));

    // Just sync dates from Calendar - Calendar handles all the logic
    setSelectedDates(dates);
  };

  // Handle date click in multi-select mode with contiguous logic
  const handleDateClickInMultiSelect = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    console.log('[handleDateClickInMultiSelect] ===== CLICK START =====');
    console.log('[handleDateClickInMultiSelect] clicked date:', dateStr);
    console.log('[handleDateClickInMultiSelect] current selectedDates:', selectedDates.map(d => format(d, 'yyyy-MM-dd')));
    console.log('[handleDateClickInMultiSelect] pendingDateToAdd:', pendingDateToAdd ? format(pendingDateToAdd, 'yyyy-MM-dd') : null);
    console.log('[handleDateClickInMultiSelect] showConfirmModal:', showConfirmModal);

    // If date is already selected, remove it
    const isSelected = selectedDates.some(d => format(d, 'yyyy-MM-dd') === dateStr);
    if (isSelected) {
      console.log('[handleDateClickInMultiSelect] date already selected, removing');
      setSelectedDates(selectedDates.filter(d => format(d, 'yyyy-MM-dd') !== dateStr));
      return;
    }

    // If no dates selected, add this one
    if (selectedDates.length === 0) {
      console.log('[handleDateClickInMultiSelect] no dates selected, adding first date');
      setSelectedDates([date]);
      return;
    }

    // Check if new date is contiguous with existing selection
    const sorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    const lastDate = sorted[sorted.length - 1];

    const dayDifference = Math.abs(date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    console.log('[handleDateClickInMultiSelect] dayDifference:', dayDifference, 'lastDate:', format(lastDate, 'yyyy-MM-dd'));

    // If contiguous (within 1 day), add to selection
    if (dayDifference === 1) {
      console.log('[handleDateClickInMultiSelect] date is contiguous, adding to selection');
      setSelectedDates([...selectedDates, date]);
      return;
    }

    // If not contiguous, show confirmation modal to replace selection
    console.log('[handleDateClickInMultiSelect] date is not contiguous, showing confirm modal for:', dateStr);
    setPendingDateToAdd(date);
    setShowConfirmModal(true);
  };

  const handleConfirmReplace = () => {
    console.log('[handleConfirmReplace] confirmed, pendingDateToAdd:', pendingDateToAdd ? format(pendingDateToAdd, 'yyyy-MM-dd') : null);
    if (pendingDateToAdd) {
      setSelectedDates([pendingDateToAdd]);
    }
    setShowConfirmModal(false);
    setPendingDateToAdd(null);
  };

  const handleCancelReplace = () => {
    console.log('[handleCancelReplace] cancelled, keeping current selection');
    setShowConfirmModal(false);
    setPendingDateToAdd(null);
  };

  const handleApplyPromo = async (promoCodeInput?: string) => {
    setPromoError('');
    setPromoSuccess('');
    setValidatingPromo(true);

    const code = (promoCodeInput ?? promoCode).trim().toUpperCase();
    if (!derivedCheckIn || !derivedCheckOut || !code) {
      setValidatingPromo(false);
      return;
    }

    try {
      const response = await validatePromo({
        code,
        checkIn: format(derivedCheckIn, 'yyyy-MM-dd'),
        checkOut: format(derivedCheckOut, 'yyyy-MM-dd'),
        guestPhone: '',
      });

      if (response.valid) {
        const discountValue = response.discountValue || 0;
        const discountText = response.discountType === 'fixed'
          ? `IDR ${discountValue.toLocaleString()}`
          : `${discountValue}%`;

        setAppliedPromo({
          code,
          discountPercentage: response.discountType === 'percentage' ? discountValue : 0,
          discountValue,
          discountType: response.discountType,
          dayCondition: response.dayCondition,
          customDays: response.customDays,
          validFrom: new Date(),
          validUntil: new Date(),
          isActive: true,
        });
        setPromoSuccess(`Diskon ditemukan: ${discountText}`);
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

  useEffect(() => {
    if (!derivedCheckIn || !derivedCheckOut) return;
    if (!promoCode.trim()) {
      setPromoError('');
      setPromoSuccess('');
      setAppliedPromo(null);
      return;
    }

    const timer = setTimeout(() => {
      handleApplyPromo(promoCode);
    }, 400);

    return () => clearTimeout(timer);
  }, [promoCode, derivedCheckIn, derivedCheckOut]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRemovePromo = () => {
    setPromoCode('');
    setAppliedPromo(null);
    setPromoSuccess('');
    setPromoError('');
  };

  const handleContinue = async () => {
    if (selectedDates.length < 1) {
      alert('Silakan pilih tanggal untuk menginap');
      return;
    }

    if (!derivedCheckIn || !derivedCheckOut) {
      alert('Silakan pilih tanggal untuk menginap');
      return;
    }

    setCheckingAvailability(true);
    try {
      const checkInStr = format(derivedCheckIn, 'yyyy-MM-dd');
      const checkOutStr = format(derivedCheckOut, 'yyyy-MM-dd');
      const response = await checkAvailability(checkInStr, checkOutStr);

      if (!response.available) {
        setAvailabilityError(response);
        setSelectedDates([]);
        return;
      }

      navigate(localePath('/book/form'));
    } catch (error) {
      console.error('[handleContinue] Availability check failed:', error);
      alert('Failed to check availability. Please try again.');
    } finally {
      setCheckingAvailability(false);
    }
  };

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
                onDateClickInMultiSelect={handleDateClickInMultiSelect}
                bookedDates={[]}
                blockedDates={[]}
                calendarData={calendarData}
                onMonthChange={handleMonthChange}
                hidePrices={true}
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
                        {derivedCheckIn.toLocaleDateString(dateFnsLocale.code === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-600">Check-out</span>
                      <span className="text-primary-900 font-medium">
                        {derivedCheckOut.toLocaleDateString(dateFnsLocale.code === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="pt-2 mt-2 bg-primary-50 rounded p-2">
                      <p className="text-xs text-primary-700">
                        <span className="font-medium">Menginap:</span> {numberOfNights} malam
                      </p>
                      <p className="text-xs text-primary-600 mt-1">
                        {format(derivedCheckIn, 'EEEE, d MMMM yyyy', { locale: dateFnsLocale })} 14:00 - {format(derivedCheckOut, 'EEEE, d MMMM yyyy', { locale: dateFnsLocale })} 12:00 (WIB)
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
                      <span>IDR {(pricing.originalPrice / numberOfNights).toLocaleString(undefined, { maximumFractionDigits: 0 })} × {numberOfNights} malam</span>
                      <span>IDR {pricing.originalPrice.toLocaleString()}</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between text-green-600">
                        <span>
                          Diskon (
                          {appliedPromo.discountType === 'fixed'
                            ? `IDR ${(appliedPromo.discountValue || 0).toLocaleString()}`
                            : `${appliedPromo.discountValue || appliedPromo.discountPercentage || 0}%`}
                          )
                        </span>
                        <span>- IDR {pricing.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedCustomPricingLabels.length > 0 && (
                      <div className="rounded bg-red-50 border border-red-100 p-2">
                        <p className="text-xs font-semibold text-red-700">Hari Libur Nasional</p>
                        <div className="mt-1 space-y-1">
                          {selectedCustomPricingLabels.map(({ date, label }) => (
                            <p key={`${format(date, 'yyyy-MM-dd')}-${label}`} className="text-xs text-red-700">
                              {format(date, 'd MMM yyyy', { locale: dateFnsLocale })}: {label}
                            </p>
                          ))}
                        </div>
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
                      <button onClick={() => handleApplyPromo()} className="px-3 py-2 bg-primary-900 text-white text-sm hover:bg-primary-800 transition-colors" disabled={!promoCode || validatingPromo}>
                        {validatingPromo ? 'Checking...' : t.booking.calendar.apply}
                      </button>
                    </div>
                    {promoError && <p className="mt-2 text-xs text-red-600">{promoError}</p>}
                    {promoSuccess && <p className="mt-2 text-xs text-green-600">{promoSuccess}</p>}
                  </div>
                ) : (
                  <div className="p-3 bg-green-50 border border-green-200 text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-900">{appliedPromo.code}</p>
                        <p className="text-xs text-green-700">
                          {appliedPromo.discountType === 'fixed'
                            ? `IDR ${(appliedPromo.discountValue || 0).toLocaleString()}`
                            : `${appliedPromo.discountValue || appliedPromo.discountPercentage || 0}%`} {t.booking.calendar.discount.toLowerCase()}
                        </p>
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

      {/* Replace date selection confirmation */}
      {showConfirmModal && pendingDateToAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleCancelReplace}></div>
          <div className="relative bg-white max-w-md w-full mx-4 p-8 shadow-xl">
            <button onClick={handleCancelReplace} className="absolute top-4 right-4 text-primary-400 hover:text-primary-900 transition-colors" aria-label="Close">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
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
