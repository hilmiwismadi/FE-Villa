import React, { useState, useEffect } from 'react';
import type { OrderResponse } from '../../services/orderService';
import { getAdminOrders, checkInOrder, completeOrder, ApiError } from '../../services/orderService';

type ActiveBooking = OrderResponse;

const ActiveTab: React.FC = () => {
  const [activeBookings, setActiveBookings] = useState<ActiveBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'calendar'>('card');
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

  // Fetch active bookings on mount (both booked and check_in)
  const fetchActiveBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bookedRes, checkedInRes] = await Promise.all([
        getAdminOrders('booked', 1, 100),
        getAdminOrders('check_in', 1, 100),
      ]);
      setActiveBookings([...bookedRes.orders, ...checkedInRes.orders]);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load active bookings');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveBookings();
  }, []);

  const handleCheckIn = async (orderId: string) => {
    try {
      setProcessing(orderId);
      await checkInOrder(orderId);
      // Refresh list after successful check-in
      fetchActiveBookings();
    } catch (err) {
      if (err instanceof ApiError) {
        alert(`Failed to check in: ${err.message}`);
      } else {
        alert('Failed to check in');
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleComplete = async (orderId: string) => {
    try {
      setProcessing(orderId);
      await completeOrder(orderId);
      // Refresh list after successful completion (order will move to completed)
      fetchActiveBookings();
    } catch (err) {
      if (err instanceof ApiError) {
        alert(`Failed to complete order: ${err.message}`);
      } else {
        alert('Failed to complete order');
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
        bookings: activeBookings.filter(booking =>
          booking.checkInDate <= dateStr && booking.checkOutDate > dateStr
        ),
      });
    }

    return days;
  };

  const getBookingColor = (status: string) => {
    switch (status) {
      case 'booked':
        return 'bg-blue-500';
      case 'check_in':
        return 'bg-green-500';
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
    return activeBookings.filter(booking =>
      booking.checkInDate <= dateStr && booking.checkOutDate > dateStr
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-serif text-primary-900 mb-1">Active Bookings</h2>
          <p className="text-primary-600">Bookings awaiting check-in or currently checked in.</p>
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
          <p className="text-primary-600">Loading active bookings...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 rounded-lg p-6 text-center mb-6">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchActiveBookings}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && activeBookings.length === 0 && (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-primary-600">No active bookings at the moment.</p>
        </div>
      )}

      {!loading && !error && activeBookings.length > 0 && (
        <>
          {viewMode === 'card' && (
            <div className="space-y-6">
          {activeBookings.map((booking) => (
            <div
              key={booking.orderId}
              className={`bg-white rounded-lg p-6 shadow-sm border-l-4 ${
                booking.status === 'check_in' ? 'border-green-400' : 'border-blue-400'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-serif text-primary-900 mb-2">
                    Order {booking.orderId}
                  </h3>
                  <p className="text-primary-900 font-medium">{booking.guestName}</p>
                  <p className="text-primary-600">{booking.guestPhone}</p>
                </div>
                {booking.status === 'check_in' ? (
                  <span className="px-4 py-2 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                    Currently Checked In
                  </span>
                ) : (
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                    Approved, Awaiting Check-in
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-primary-200 mb-6">
                <div>
                  <p className="text-sm text-primary-600 mb-1">Check-in Date</p>
                  <p className="text-primary-900 font-medium">{formatDate(booking.checkInDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-600 mb-1">Check-out Date</p>
                  <p className="text-primary-900 font-medium">{formatDate(booking.checkOutDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-600 mb-1">Total Amount</p>
                  <p className="text-primary-900 font-medium">{formatCurrency(booking.totalAmount)}</p>
                </div>
              </div>

              {/* Additional info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-primary-600 mb-1">Guest Count</p>
                    <p className="text-primary-900">{booking.guestCount} people</p>
                  </div>
                  <div>
                    <p className="text-sm text-primary-600 mb-1">Extra Beds</p>
                    <p className="text-primary-900">{booking.extraBeds}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-primary-600 mb-1">Estimated Check-in</p>
                    <p className="text-primary-900">{booking.estimatedCheckIn}</p>
                  </div>
                  <div>
                    <p className="text-sm text-primary-600 mb-1">Address</p>
                    <p className="text-primary-900">{booking.guestAddress}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-primary-200">
                {booking.status === 'booked' ? (
                  <button
                    onClick={() => handleCheckIn(booking.orderId)}
                    disabled={processing === booking.orderId}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing === booking.orderId ? 'Processing...' : 'Check In Guest'}
                  </button>
                ) : booking.status === 'check_in' ? (
                  <button
                    onClick={() => handleComplete(booking.orderId)}
                    disabled={processing === booking.orderId}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing === booking.orderId ? 'Processing...' : 'Check Out Guest'}
                  </button>
                ) : null}
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
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm text-primary-700">Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm text-primary-700">Check-in</span>
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
                    {booking.status === 'booked' ? 'Booked' : 'Check-in'}
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
                {booking.status === 'booked' ? (
                  <button
                    onClick={() => {
                      handleCheckIn(booking.orderId);
                      setHoveredDate(null);
                      setPopupPosition(null);
                    }}
                    disabled={processing === booking.orderId}
                    className="mt-2 w-full btn-primary text-xs py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing === booking.orderId ? 'Processing...' : 'Check In Guest'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleComplete(booking.orderId);
                      setHoveredDate(null);
                      setPopupPosition(null);
                    }}
                    disabled={processing === booking.orderId}
                    className="mt-2 w-full btn-primary text-xs py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing === booking.orderId ? 'Processing...' : 'Check Out Guest'}
                  </button>
                )}
              </div>
            ))}
            {getDayBookings(hoveredDate).length === 0 && (
              <p className="text-sm text-primary-600 text-center py-2">No bookings on this date</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveTab;
