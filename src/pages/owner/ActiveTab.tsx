import React, { useState, useEffect } from 'react';
import type { OrderResponse } from '../../services/orderService';
import { getAdminOrders, checkInOrder, completeOrder, ApiError } from '../../services/orderService';

type ActiveBooking = OrderResponse;

const ActiveTab: React.FC = () => {
  const [activeBookings, setActiveBookings] = useState<ActiveBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

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

  return (
    <div>
      <h2 className="text-2xl font-serif text-primary-900 mb-6">Active Bookings</h2>
      <p className="text-primary-600 mb-6">Bookings awaiting check-in or currently checked in.</p>

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

      {!loading && !error && activeBookings.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-primary-600">No active bookings at the moment.</p>
        </div>
      ) : (
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
    </div>
  );
};

export default ActiveTab;
