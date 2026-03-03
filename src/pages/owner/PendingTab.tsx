import React, { useState, useEffect } from 'react';
import type { OrderResponse } from '../../services/orderService';
import { getAdminOrders, approveOrder, rejectOrder, ApiError } from '../../services/orderService';

type PendingBooking = OrderResponse;

const PendingTab: React.FC = () => {
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  // Fetch pending bookings on mount (both in_transaction and pending)
  const fetchPendingBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pendingRes, inTransactionRes] = await Promise.all([
        getAdminOrders('pending', 1, 100),
        getAdminOrders('in_transaction', 1, 100),
      ]);
      setPendingBookings([...inTransactionRes.orders, ...pendingRes.orders]);
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

  const handleApprove = async (orderId: string) => {
    try {
      setProcessing(orderId);
      await approveOrder(orderId);
      // Remove from list after successful approval
      setPendingBookings(prev => prev.filter(b => b.orderId !== orderId));
    } catch (err) {
      if (err instanceof ApiError) {
        alert(`Failed to approve order: ${err.message}`);
      } else {
        alert('Failed to approve order');
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (orderId: string) => {
    const reason = prompt('Please enter the reason for rejection:');
    if (!reason) return; // User cancelled

    try {
      setProcessing(orderId);
      await rejectOrder(orderId, reason);
      // Remove from list after successful rejection
      setPendingBookings(prev => prev.filter(b => b.orderId !== orderId));
    } catch (err) {
      if (err instanceof ApiError) {
        alert(`Failed to reject order: ${err.message}`);
      } else {
        alert('Failed to reject order');
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
      <h2 className="text-2xl font-serif text-primary-900 mb-6">Pending Booking Approvals</h2>

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

      {!loading && !error && pendingBookings.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-primary-600">No pending bookings at the moment.</p>
        </div>
      ) : (
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
                      <p className="text-sm text-primary-600">{booking.nightCount} nights</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-primary-200 mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-primary-600">Subtotal</span>
                      <span className="text-primary-900">{formatCurrency(booking.subtotal)}</span>
                    </div>
                    {booking.discountAmount > 0 && (
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-primary-600">Discount{booking.promoCode && ` (${booking.promoCode})`}</span>
                        <span className="text-green-600">-{formatCurrency(booking.discountAmount)}</span>
                      </div>
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
                      onClick={() => handleApprove(booking.orderId)}
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
    </div>
  );
};

export default PendingTab;
