import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { useTranslation } from '../i18n/LanguageContext';
import { differenceInDays, format } from 'date-fns';
import { validatePromo as promoValidatePromo, ApiError } from '../services/promoService';
import { createOrder, getOrder, type CreateOrderRequest, type OrderResponse } from '../services/orderService';
import { normalizePhoneNumber } from '../utils/phone';

const orderCreateInFlight = new Map<string, Promise<OrderResponse>>();

function createOrderDeduped(data: CreateOrderRequest): Promise<OrderResponse> {
  const requestKey = JSON.stringify(data);
  const existingRequest = orderCreateInFlight.get(requestKey);
  if (existingRequest) return existingRequest;

  const requestPromise = createOrder(data).finally(() => {
    orderCreateInFlight.delete(requestKey);
  });
  orderCreateInFlight.set(requestKey, requestPromise);
  return requestPromise;
}

// Helper function to convert check-in time slot to hour string (HH:mm format)
const formatCheckInHour = (timeSlot: string): string => {
  const hourMap: Record<string, string> = {
    '14:00 - 16:00': '14:00',
    '16:00 - 18:00': '16:00',
    '18:00 - 20:00': '18:00',
    '20:00 - 22:00': '20:00',
  };

  return hourMap[timeSlot] ?? '14:00';
}

// Helper function to convert check-in time slot to estimatedCheckIn format
const formatEstimatedCheckIn = (timeSlot: string): '14-16' | '16-18' | '18-20' | '20-22' => {
  const estimatedMap: Record<string, '14-16' | '16-18' | '18-20' | '20-22'> = {
    '14:00 - 16:00': '14-16',
    '16:00 - 18:00': '16-18',
    '18:00 - 20:00': '18-20',
    '20:00 - 22:00': '20-22',
  };

  return estimatedMap[timeSlot] ?? '14-16';
}

const BookingReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, localePath } = useTranslation();
  const {
    dateRange, guestInfo, formData, appliedPromo, setAppliedPromo,
    pricing, setPricing, promoCode, setPromoCode, setGuestInfo,
  } = useBooking();

  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(null);
  const orderCreatedRef = useRef(false);

  useEffect(() => {
    const orderKey = `order-created-${formData.fullName}-${formData.phone}`;
    if (orderCreatedRef.current || sessionStorage.getItem(orderKey)) {
      return;
    }

    // If guestInfo has orderId already, fetch the existing order details
    if (guestInfo?.orderId) {
      const fetchExistingOrder = async () => {
        setCreatingOrder(true);
        setOrderError('');

        try {
          const existingOrder = await getOrder(guestInfo.orderId || '');
          setOrderResponse(existingOrder);
          orderCreatedRef.current = true;

          setPricing({
            originalPrice: existingOrder.subtotal + existingOrder.discountAmount,
            discountAmount: existingOrder.discountAmount,
            finalPrice: existingOrder.totalAmount,
          });

          // Update guestInfo with existing order details
          setGuestInfo({
            ...formData,
            ...guestInfo,
            orderId: existingOrder.orderId,
            totalAmount: existingOrder.totalAmount,
            paymentDeadline: existingOrder.paymentDeadline,
          });
        } catch (error) {
          if (error instanceof ApiError) {
            setOrderError(error.message || 'Failed to load existing order');
          } else {
            setOrderError('Failed to load existing order');
          }
        } finally {
          setCreatingOrder(false);
        }
      };

      fetchExistingOrder();
      return;
    }

    // If no dates selected, return
    if (!dateRange.checkIn || !dateRange.checkOut) {
      return;
    }

    // Create order on review page
    const createOrderOnReview = async () => {
      setCreatingOrder(true);
      setOrderError('');

      try {
        if (!dateRange.checkIn || !dateRange.checkOut) {
          throw new Error('Check-in and check-out dates are required');
        }

        const checkInTime = formData.checkInTime || '14:00 - 16:00';
        const checkInHour = formatCheckInHour(checkInTime);
        const estimatedCheckIn = formatEstimatedCheckIn(checkInTime);

        const orderData: CreateOrderRequest = {
          guestName: formData.fullName || '',
          guestPhone: normalizePhoneNumber(formData.phone || ''),
          guestAddress: formData.address ? `${formData.address}, ${formData.city}, ${formData.province}` : `${formData.city || ''}, ${formData.province || ''}`,
          guestCount: Number(formData.numberOfGuests) || 1,
          extraBeds: Number(formData.extraBed) || 0,
          estimatedCheckIn: estimatedCheckIn,
          checkInDate: format(dateRange.checkIn, 'yyyy-MM-dd'),
          checkInHour: checkInHour,
          checkOutDate: format(dateRange.checkOut, 'yyyy-MM-dd'),
          checkOutHour: '12:00',
          promoCodes: appliedPromo?.code ? [appliedPromo.code] : undefined,
        };

        console.log('========================================');
        console.log('BOOKING REVIEW PAYLOAD (FE -> API)');
        console.log('========================================');
        console.log('API Request Body (POST /order/create):', orderData);
        console.log('Form Data Source:', formData);
        console.log('Pricing Context:', pricing);
        console.log('Applied Promo:', appliedPromo);
        console.log('========================================');

        const response: OrderResponse = await createOrderDeduped(orderData);
        setOrderResponse(response);
        orderCreatedRef.current = true;
        sessionStorage.setItem(orderKey, '1');

        setPricing({
          originalPrice: response.subtotal + response.discountAmount,
          discountAmount: response.discountAmount,
          finalPrice: response.totalAmount,
        });

        // Update guestInfo with orderId
        setGuestInfo({
          ...formData,
          orderId: response.orderId,
          totalAmount: response.totalAmount,
          paymentDeadline: response.paymentDeadline,
        });
      } catch (error) {
        if (error instanceof ApiError) {
          // Handle 409 conflict - dates not available or phone number conflict
          if (error.status === 409) {
            console.error('[BookingReviewPage] 409 Conflict Error from POST /order/create:', error);

            // This could be due to phone number conflict (BE issue) or actual date availability
            setOrderError('Unable to create order. This might be because your phone number has been used before or the dates are not available. Please try again or contact support.');
          } else if (error.status === 400) {
            setOrderError('Invalid booking data. Please check your information and try again.');
          } else {
            setOrderError(error.message || 'Failed to create order');
          }
        } else {
          setOrderError('Failed to create order');
        }
      } finally {
        setCreatingOrder(false);
      }
    };

    createOrderOnReview();
  }, []); // Empty deps - run only once on mount

  // Redirect if no booking data
  if (!dateRange.checkIn || !dateRange.checkOut || (!guestInfo && !formData.phone)) {
    navigate(localePath('/book/calendar'));
    return null;
  }

  const guest = formData;
  const numberOfNights = dateRange.checkIn && dateRange.checkOut ? Math.max(1, differenceInDays(dateRange.checkOut, dateRange.checkIn)) : 1;

  const handleApplyPromo = async () => {
    setPromoError('');
    setPromoSuccess('');
    setValidatingPromo(true);

    const guestPhone = formData.phone || '';

    try {
      const response = await promoValidatePromo({
        code: promoCode,
        checkIn: dateRange.checkIn ? format(dateRange.checkIn, 'yyyy-MM-dd') : '',
        checkOut: dateRange.checkOut ? format(dateRange.checkOut, 'yyyy-MM-dd') : '',
        guestPhone,
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
        setPromoSuccess(t.booking.calendar.discountApplied);
      } else {
        setPromoError(response.reason || t.booking.review.invalidPromo);
        setAppliedPromo(null);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setPromoError(error.message || t.booking.review.invalidPromo);
      } else {
        setPromoError(t.booking.review.invalidPromo);
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

  const handleConfirm = () => {
    if (!orderResponse?.orderId) {
      alert('Order not created yet. Please wait...');
      return;
    }
    navigate(localePath(`/book/payment/${orderResponse.orderId}`));
  };

  return (
    <div className="section-padding bg-primary-50">
      <div className="container-custom max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-primary-900">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-primary-900 bg-primary-900 text-white">1</div>
              <span className="hidden md:inline text-sm font-medium">{t.booking.steps.selectDates}</span>
            </div>
            <div className="w-12 h-0.5 bg-primary-900"></div>
            <div className="flex items-center gap-2 text-primary-900">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-primary-900 bg-primary-900 text-white">2</div>
              <span className="hidden md:inline text-sm font-medium">{t.booking.steps.guestInfo}</span>
            </div>
            <div className="w-12 h-0.5 bg-primary-900"></div>
            <div className="flex items-center gap-2 text-gold-600">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-gold-600 bg-gold-50">3</div>
              <span className="hidden md:inline text-sm font-medium">{t.booking.steps.review}</span>
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-serif text-primary-900 mb-8">{t.booking.review.title}</h1>

        <div className="bg-white p-8 shadow-sm mb-6">
          <h2 className="text-2xl font-serif text-primary-900 mb-6">{t.booking.review.bookingDetails}</h2>

          {/* Dates */}
          <div className="mb-6 pb-6 border-b border-primary-200">
            <h3 className="font-semibold text-primary-900 mb-3">{t.booking.review.stayDates}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-primary-700">
              <div>
                <p className="text-sm text-primary-600">{t.booking.review.checkIn}</p>
                <p className="font-medium">{dateRange.checkIn.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-sm text-primary-600">{t.booking.review.checkOut}</p>
                <p className="font-medium">{dateRange.checkOut.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-primary-600">{numberOfNights} {t.booking.review.nightLabel}</p>
          </div>

          {/* Guest Information */}
          <div className="mb-6 pb-6 border-b border-primary-200">
            <h3 className="font-semibold text-primary-900 mb-3">{t.booking.review.guestInfoTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-primary-600">{t.booking.review.fullName}</p>
                <p className="font-medium text-primary-900">{guest.fullName || '-'}</p>
              </div>
              <div>
                <p className="text-primary-600">{t.booking.review.phone}</p>
                <p className="font-medium text-primary-900">{guest.phone || '-'}</p>
              </div>
              <div>
                <p className="text-primary-600">{t.booking.review.email}</p>
                <p className="font-medium text-primary-900">{guest.email || '-'}</p>
              </div>
              <div>
                <p className="text-primary-600">{t.booking.review.numberOfGuests}</p>
                <p className="font-medium text-primary-900">{guest.numberOfGuests || 1} {t.booking.review.guestUnit}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-primary-600">{t.booking.review.address}</p>
                <p className="font-medium text-primary-900">
                  {guest.address || '-'}
                  {(guest.city || guest.province) && (
                    <>, {guest.city}{guest.city && guest.province ? ', ' : ''}{guest.province}</>
                  )}
                </p>
              </div>
              <div>
                <p className="text-primary-600">{t.booking.review.extraBed}</p>
                <p className="font-medium text-primary-900">
                  {guest.extraBed ? `${guest.extraBed} ${t.booking.review.extraBedUnit}` : t.booking.review.extraBedNone}
                </p>
              </div>
              <div>
                <p className="text-primary-600">{t.booking.review.checkInTime}</p>
                <p className="font-medium text-primary-900">{guest.checkInTime || '-'}</p>
              </div>
            </div>
            {guest.specialRequests && (
              <div className="mt-4">
                <p className="text-sm text-primary-600">{t.booking.review.specialRequests}</p>
                <p className="text-sm text-primary-900">{guest.specialRequests}</p>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div>
            <h3 className="font-semibold text-primary-900 mb-3">{t.booking.review.pricingTitle}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-primary-700">
                <span>{t.booking.review.basePrice.replace('{nights}', String(numberOfNights))}</span>
                <span>IDR {pricing.originalPrice.toLocaleString()}</span>
              </div>
              {Number(guest.extraBed || 0) > 0 && (
                <div className="flex justify-between text-primary-700">
                  <span>Bed Tambahan ({guest.extraBed} × Rp100.000)</span>
                  <span>IDR {(Number(guest.extraBed || 0) * 100000).toLocaleString()}</span>
                </div>
              )}
              {appliedPromo && (
                <div className="flex justify-between text-green-600">
                  <span>{t.booking.review.discount.replace('{code}', appliedPromo.code).replace('{percent}', appliedPromo.discountType === 'fixed' ? `Rp${appliedPromo.discountPercentage.toLocaleString()}` : `${appliedPromo.discountPercentage}%`)}</span>
                  <span>- IDR {pricing.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="pt-3 border-t border-primary-200">
                <div className="flex justify-between font-semibold text-xl text-primary-900">
                  <span>{t.booking.review.total}</span>
                  <span>IDR {(pricing.finalPrice + (Number(guest.extraBed || 0) * 100000)).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Promo Code */}
          <div className="mt-6 pt-6 border-t border-primary-200">
            <h3 className="font-semibold text-primary-900 mb-3">{t.booking.review.promoCode}</h3>
            {!appliedPromo ? (
              <div>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder={t.booking.review.enterCode}
                    className="input-field flex-1 uppercase text-sm"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className={`px-4 py-2 text-sm transition-colors ${
                      !promoCode || validatingPromo
                        ? 'bg-primary-300 text-white cursor-not-allowed'
                        : 'bg-primary-900 text-white hover:bg-primary-800'
                    }`}
                    disabled={!promoCode || validatingPromo}
                  >
                    {validatingPromo ? t.booking.calendar.validating : t.booking.review.apply}
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
                    <p className="text-xs text-green-700">{appliedPromo.discountPercentage}% {t.booking.review.discount.split('(')[0].trim().toLowerCase()}</p>
                  </div>
                  <button onClick={handleRemovePromo} className="text-red-600 hover:text-red-800 text-xs underline">{t.booking.review.remove}</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Error */}
        {orderError && (
          <div className="mb-4 p-6 bg-red-50 border border-red-200 rounded">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium mb-3">{orderError}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setOrderError('');
                      setCreatingOrder(false);
                      // Reset the ref to allow retry
                      orderCreatedRef.current = false;
                    }}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate(localePath('/book/calendar'))}
                    className="px-3 py-2 bg-white text-red-600 border border-red-300 text-sm rounded hover:bg-red-50 transition-colors"
                  >
                    Select Different Dates
                  </button>
                  <button
                    onClick={() => navigate(localePath('/book/form'))}
                    className="px-3 py-2 bg-white text-red-600 border border-red-300 text-sm rounded hover:bg-red-50 transition-colors"
                  >
                    Edit Guest Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(localePath('/book/form'))}
            className="btn-secondary"
            disabled={creatingOrder}
          >
            {t.booking.review.editBooking}
          </button>
          <button
            onClick={handleConfirm}
            className="btn-primary flex-1"
            disabled={creatingOrder || !orderResponse || !!orderError}
          >
            {creatingOrder ? 'Creating order...' : t.booking.review.confirmPayment}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingReviewPage;
