import React, { useState, useEffect } from 'react';
import type { OrderResponse } from '../../services/orderService';
import { getAdminOrders, approveOrder, rejectOrder, ApiError } from '../../services/orderService';
import { useToast } from '../../contexts/ToastContext';

type PendingBooking = OrderResponse;

const PendingTab: React.FC = () => {
  const { toast } = useToast();
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ orderId: string; booking: PendingBooking } | null>(null);
  const [rejectModal, setRejectModal] = useState<{ orderId: string; booking: PendingBooking } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'calendar'>('card');
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const [successMessage, _setSuccessMessage] = useState<string | null>(null);

  // Fetch pending bookings on mount (both in_transaction and pending)
  const fetchPendingBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pendingRes, inTransactionRes] = await Promise.all([
        getAdminOrders('pending', 1, 100),
        getAdminOrders('in_transaction', 1, 100),
      ]);

      // Merge all orders and sort by createdAt descending (newest first)
      // Pending orders will naturally appear higher as they're confirmed more recently
      const allBookings = [...pendingRes.orders, ...inTransactionRes.orders];
      const sortedBookings = allBookings.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setPendingBookings(sortedBookings);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load pending bookings');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const handleApproveClick = (orderId: string) => {
    const booking = pendingBookings.find(b => b.orderId === orderId);
    if (!booking) return;
    setConfirmModal({ orderId, booking });
  };

  const confirmApprove = async () => {
    if (!confirmModal) return;

    try {
      setProcessing(confirmModal.orderId);
      await approveOrder(confirmModal.orderId);
      setPendingBookings(prev => prev.filter(b => b.orderId !== confirmModal.orderId));
      setPendingBookings(prev => prev.filter(b => b.orderId !== confirmModal.orderId));
      setConfirmModal(null);
      toast('Order berhasil diterima', 'success');
    } catch (err) {
      if (err instanceof ApiError) {
        toast(`Failed to approve order: ${err.message}`, 'error');
      } else {
        toast('Failed to approve order', 'error');
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = (orderId: string) => {
    const booking = pendingBookings.find(b => b.orderId === orderId);
    if (!booking) return;
    setRejectModal({ orderId, booking });
  };

  const confirmReject = async () => {
    if (!rejectModal || !rejectionReason.trim()) return;

    try {
      setProcessing(rejectModal.orderId);
      await rejectOrder(rejectModal.orderId, rejectionReason.trim());
      setPendingBookings(prev => prev.filter(b => b.orderId !== rejectModal.orderId));
      setPendingBookings(prev => prev.filter(b => b.orderId !== rejectModal.orderId));
      setRejectModal(null);
      setRejectionReason('');
      toast('Order berhasil ditolak', 'success');
    } catch (err) {
      if (err instanceof ApiError) {
        toast(`Failed to reject order: ${err.message}`, 'error');
      } else {
        toast('Failed to reject order', 'error');
      }
    } finally {
      setProcessing(null);
    }
  };

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  // Calendar view helpers
  const getCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay(); // 0 = Sunday
    const totalDays = lastDay.getDate();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        date: dateStr,
        bookings: pendingBookings.filter(booking =>
          booking.checkInDate <= dateStr && booking.checkOutDate > dateStr
        ),
      });
    }

    return days;
  };

  const getBookingColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'in_transaction':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleDayClick = (dateStr: string, event: React.MouseEvent) => {
    if (hoveredDate === dateStr) {
      setHoveredDate(null);
      setPopupPosition(null);
    } else {
      setHoveredDate(dateStr);
      const rect = event.currentTarget.getBoundingClientRect();
      setPopupPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 10
      });
    }
  };

  const getDayBookings = (dateStr: string) => {
    return pendingBookings.filter(booking =>
      booking.checkInDate <= dateStr && booking.checkOutDate > dateStr
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-serif text-primary-900 mb-1">Pending Booking Approvals</h2>
        </div>
        <div className="flex items-center gap-2 bg-primary-50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('card')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === 'card'
                ? 'bg-white text-primary-900 shadow-sm'
                : 'text-primary-600 hover:text-primary-900'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === 'calendar'
                ? 'bg-white text-primary-900 shadow-sm'
                : 'text-primary-600 hover:text-primary-900'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-primary-600">Loading pending bookings...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 rounded-lg p-6 text-center mb-6">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchPendingBookings}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && pendingBookings.length === 0 && (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-primary-600">No pending bookings at the moment.</p>
        </div>
      )}

      {!loading && !error && pendingBookings.length > 0 && (
        <>
          {viewMode === 'card' && (
            <div className="space-y-6">
          {pendingBookings.map((booking) => (
            <div
              key={booking.orderId}
              className={`bg-white rounded-lg p-6 shadow-sm border-l-4 ${
                booking.status === 'pending' ? 'border-yellow-400' : 'border-blue-400'
              }`}
            >
              <div className="grid grid-cols-1 gap-8">
                {/* Booking Details */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-serif text-primary-900">Order {booking.orderId}</h3>
                      {/* Status Badge */}
                      {booking.status === 'pending' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Awaiting Approval
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Awaiting Payment
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-primary-600">
                      Submitted: {formatDateTime(booking.createdAt)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-primary-600 mb-1">Guest Name</p>
                        <p className="text-primary-900 font-medium">{booking.guestName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-primary-600 mb-1">Phone</p>
                        <p className="text-primary-900">{booking.guestPhone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-primary-600 mb-1">Address</p>
                        <p className="text-primary-900">{booking.guestAddress}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-primary-600 mb-1">Guests</p>
                        <p className="text-primary-900">{booking.guestCount} people</p>
                      </div>
                      <div>
                        <p className="text-sm text-primary-600 mb-1">Extra Beds</p>
                        <p className="text-primary-900">{booking.extraBeds}</p>
                      </div>
                      <div>
                        <p className="text-sm text-primary-600 mb-1">Estimated Check-in</p>
                        <p className="text-primary-900">{booking.estimatedCheckIn}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-sm text-primary-600 mb-1">Check-in / Check-out</p>
                      <p className="text-primary-900 font-medium">
                        {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                      </p>
                      <p className="text-xs text-primary-600">
                        {booking.checkInHour} - {booking.checkOutHour}
                      </p>
                      <p className="text-sm text-primary-600">{booking.nightCount} nights</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-primary-200 mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-primary-600">Subtotal</span>
                      <span className="text-primary-900">{formatCurrency(booking.subtotal)}</span>
                    </div>
                    {booking.discountAmount > 0 && (
                      <>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-primary-600">Discount</span>
                          <span className="text-green-600">-{formatCurrency(booking.discountAmount)}</span>
                        </div>
                        {(booking.promos?.length
                          ? booking.promos
                          : (booking.promoCode ? [{ promoCode: booking.promoCode, discountAmount: booking.discountAmount }] : [])
                        ).map((promo) => (
                          <div key={`${promo.promoCode}-${promo.discountAmount}`} className="flex justify-between text-xs mb-1">
                            <span className="text-green-700">Promo {promo.promoCode}</span>
                            <span className="text-green-700">-{formatCurrency(promo.discountAmount)}</span>
                          </div>
                        ))}
                      </>
                    )}
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-primary-600">Unique Code</span>
                      <span className="text-primary-900">{booking.uniqueCode}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg mt-2">
                      <span className="text-primary-900">Total Amount</span>
                      <span className="text-primary-900">{formatCurrency(booking.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Payment Info */}
                  {booking.status === 'pending' ? (
                    // Pending: Show e-bank verification info
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-blue-500 mt-1">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">Payment Confirmation</h4>
                          <p className="text-sm text-blue-700 mb-2">
                            Payment confirmed at: <span className="font-medium">{formatDateTime(booking.paymentConfirmedAt)}</span>
                          </p>
                          <p className="text-sm text-blue-600">
                            Please verify the transfer in your e-bank app for amount: <span className="font-semibold text-blue-800">{formatCurrency(booking.totalAmount)}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // In Transaction: Show payment deadline
                    <div className="bg-amber-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-amber-500 mt-1">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-amber-900 mb-1">Awaiting Payment</h4>
                          <p className="text-sm text-amber-700 mb-2">
                            Payment deadline: <span className="font-medium">{formatDateTime(booking.paymentDeadline)}</span>
                          </p>
                          <p className="text-sm text-amber-600">
                            Guest has 10 minutes to confirm payment. Order will be automatically expired if not confirmed.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {booking.isManualOrder && (
                    <div className="mt-4">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        Manual Order
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6 pt-6 border-t border-primary-200">
                {booking.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleApproveClick(booking.orderId)}
                      disabled={processing === booking.orderId}
                      className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === booking.orderId ? 'Approving...' : 'Approve Booking'}
                    </button>
                    <button
                      onClick={() => handleReject(booking.orderId)}
                      disabled={processing === booking.orderId}
                      className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === booking.orderId ? 'Rejecting...' : 'Reject'}
                    </button>
                  </>
                ) : (
                  <div className="flex-1 text-center text-sm text-amber-700">
                    Awaiting guest payment confirmation. Actions available once payment is confirmed.
                  </div>
                )}
              </div>
            </div>
          ))}
            </div>
          )}

          {viewMode === 'calendar' && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-primary-50 px-6 py-4">
                <h3 className="text-lg font-semibold text-primary-900">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
              </div>
              <div className="p-6">
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-primary-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {getCalendarDays().map((day, index) => (
                    <div
                      key={index}
                      onClick={(e) => day && handleDayClick(day.date, e)}
                      className={`min-h-24 border border-primary-100 rounded-lg p-2 cursor-pointer ${
                        day ? 'hover:bg-primary-50 transition-colors' : 'bg-primary-50/30'
                      }`}
                    >
                      {day ? (
                        <>
                          <div className="text-sm font-medium text-primary-900 mb-2">{day.date.split('-')[2]}</div>
                          <div className="space-y-1">
                            {day.bookings.map((booking) => (
                              <div
                                key={booking.orderId}
                                className={`text-xs p-1 rounded text-white truncate ${getBookingColor(booking.status)} hover:opacity-90`}
                                title={`${booking.guestName} - ${booking.orderId}`}
                              >
                                {booking.guestName}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : null}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-4 border-t border-primary-200">
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span className="text-sm text-primary-700">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm text-primary-700">In Transaction</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Popup Card for Calendar Details */}
      {hoveredDate && popupPosition && (
        <div
          className="fixed bg-white rounded-lg shadow-xl p-4 z-50 min-w-80 max-w-sm"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <h4 className="text-sm font-medium text-primary-600 mb-2">
            {new Date(hoveredDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h4>
          <div className="space-y-2">
            {getDayBookings(hoveredDate).map((booking) => (
              <div key={booking.orderId} className="border border-primary-200 rounded p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-primary-900">{booking.guestName}</span>
                  <span className={`text-xs px-2 py-1 rounded ${getBookingColor(booking.status)}`}>
                    {booking.status === 'pending' ? 'Pending' : 'In Transaction'}
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-primary-600">Order:</span>
                    <span className="text-primary-900 font-medium">{booking.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-600">Phone:</span>
                    <span className="text-primary-900">{booking.guestPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-600">Check-in:</span>
                    <span className="text-primary-900">{formatDate(booking.checkInDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-600">Check-out:</span>
                    <span className="text-primary-900">{formatDate(booking.checkOutDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-600">Total:</span>
                    <span className="text-primary-900 font-medium">{formatCurrency(booking.totalAmount)}</span>
                  </div>
                </div>
                {booking.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        handleApproveClick(booking.orderId);
                        setHoveredDate(null);
                        setPopupPosition(null);
                      }}
                      disabled={processing === booking.orderId}
                      className="flex-1 btn-primary text-xs py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === booking.orderId ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => {
                        handleReject(booking.orderId);
                        setHoveredDate(null);
                        setPopupPosition(null);
                      }}
                      disabled={processing === booking.orderId}
                      className="flex-1 btn-danger text-xs py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === booking.orderId ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                )}
              </div>
            ))}
            {getDayBookings(hoveredDate).length === 0 && (
              <p className="text-sm text-primary-600 text-center py-2">No bookings on this date</p>
            )}
          </div>
        </div>
      )}

      {/* Success Message Popup */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl z-[100] animate-bounce">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setConfirmModal(null)}>
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-serif text-primary-900 mb-4">Confirm Approval</h3>
            <p className="text-primary-700 mb-6">Are you sure you want to approve this booking?</p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-primary-100">
                <span className="text-sm text-primary-600">Order ID</span>
                <span className="text-sm font-medium text-primary-900">{confirmModal.booking.orderId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-primary-100">
                <span className="text-sm text-primary-600">Guest Name</span>
                <span className="text-sm font-medium text-primary-900">{confirmModal.booking.guestName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-primary-100">
                <span className="text-sm text-primary-600">Guest Phone</span>
                <span className="text-sm font-medium text-primary-900">{confirmModal.booking.guestPhone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-primary-100">
                <span className="text-sm text-primary-600">Check-in Date</span>
                <span className="text-sm font-medium text-primary-900">{formatDate(confirmModal.booking.checkInDate)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-primary-100">
                <span className="text-sm text-primary-600">Check-out Date</span>
                <span className="text-sm font-medium text-primary-900">{formatDate(confirmModal.booking.checkOutDate)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-primary-100">
                <span className="text-sm text-primary-600">Nights</span>
                <span className="text-sm font-medium text-primary-900">{confirmModal.booking.nightCount} nights</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-primary-600">Total Amount</span>
                <span className="text-lg font-bold text-primary-900">{formatCurrency(confirmModal.booking.totalAmount)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                disabled={processing === confirmModal.orderId}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing === confirmModal.orderId ? 'Approving...' : 'Approve Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setRejectModal(null)}>
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-serif text-primary-900 mb-4">Reject Booking</h3>
            <p className="text-primary-700 mb-6">Please provide a reason for rejecting this booking.</p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-primary-100">
                <span className="text-sm text-primary-600">Order ID</span>
                <span className="text-sm font-medium text-primary-900">{rejectModal.booking.orderId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-primary-100">
                <span className="text-sm text-primary-600">Guest Name</span>
                <span className="text-sm font-medium text-primary-900">{rejectModal.booking.guestName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-primary-100">
                <span className="text-sm text-primary-600">Guest Phone</span>
                <span className="text-sm font-medium text-primary-900">{rejectModal.booking.guestPhone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-primary-100">
                <span className="text-sm text-primary-600">Check-in Date</span>
                <span className="text-sm font-medium text-primary-900">{formatDate(rejectModal.booking.checkInDate)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-primary-600">Total Amount</span>
                <span className="text-lg font-bold text-primary-900">{formatCurrency(rejectModal.booking.totalAmount)}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please enter the reason for rejection..."
                rows={4}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 text-primary-900 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectionReason('');
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectionReason.trim() || processing === rejectModal.orderId}
                className="btn-danger flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing === rejectModal.orderId ? 'Rejecting...' : 'Reject Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingTab;
