import React, { useState } from 'react';
import type { Booking } from '../../types';
import {
  formatCurrency,
  formatDate,
  initialPendingBookings,
  initialApprovedBookings,
} from './ownerData';

const PendingTab: React.FC = () => {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>(initialPendingBookings);
  const [approvedBookings, setApprovedBookings] = useState<Booking[]>(initialApprovedBookings);

  const handleApprove = (bookingId: string) => {
    const booking = pendingBookings.find((b) => b.id === bookingId);
    if (booking) {
      const approvedBooking = { ...booking, status: 'confirmed' as const };
      setApprovedBookings([...approvedBookings, approvedBooking]);
      setPendingBookings(pendingBookings.filter((b) => b.id !== bookingId));
    }
  };

  const handleReject = (bookingId: string) => {
    setPendingBookings(pendingBookings.filter((b) => b.id !== bookingId));
  };

  return (
    <div>
      <h2 className="text-2xl font-serif text-primary-900 mb-6">Pending Booking Approvals</h2>
      {pendingBookings.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-primary-600">No pending bookings at the moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Booking Details */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-serif text-primary-900">Booking {booking.id}</h3>
                    <span className="text-sm text-primary-600">
                      Submitted: {formatDate(booking.createdAt)}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-sm text-primary-600 mb-1">Guest Name</p>
                      <p className="text-primary-900 font-medium">
                        {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-primary-600 mb-1">Contact</p>
                      <p className="text-primary-900">{booking.guestInfo.email}</p>
                      <p className="text-primary-900">{booking.guestInfo.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-primary-600 mb-1">Check-in / Check-out</p>
                      <p className="text-primary-900 font-medium">
                        {booking.dateRange && formatDate(booking.dateRange.start)} - {booking.dateRange && formatDate(booking.dateRange.end)}
                      </p>
                      <p className="text-sm text-primary-600">{booking.pricing.numNights || 0} nights</p>
                    </div>
                    {booking.guestInfo.specialRequests && (
                      <div>
                        <p className="text-sm text-primary-600 mb-1">Special Requests</p>
                        <p className="text-primary-700">{booking.guestInfo.specialRequests}</p>
                      </div>
                    )}
                    <div className="pt-3 border-t border-primary-200">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-primary-600">Subtotal</span>
                        <span className="text-primary-900">{formatCurrency(booking.pricing.subtotal || 0)}</span>
                      </div>
                      {(booking.pricing.discount || 0) > 0 && (
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-primary-600">Discount</span>
                          <span className="text-green-600">-{formatCurrency(booking.pricing.discount || 0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-lg mt-2">
                        <span className="text-primary-900">Total</span>
                        <span className="text-primary-900">{formatCurrency(booking.pricing.total || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Proof */}
                <div>
                  <h4 className="text-lg font-serif text-primary-900 mb-4">Payment Proof</h4>
                  {booking.paymentProof && (
                    <div>
                      <div className="mb-4">
                        <img
                          src={booking.paymentProof.imageUrl}
                          alt="Payment proof"
                          className="w-full rounded border border-primary-200"
                        />
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-primary-600">Amount Transferred</span>
                          <span className="text-primary-900 font-medium">
                            {formatCurrency(booking.paymentProof.amount || booking.paymentProof.transferAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-primary-600">Transfer Date</span>
                          <span className="text-primary-900">
                            {formatDate(booking.paymentProof.transferDate)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-primary-600">Uploaded</span>
                          <span className="text-primary-900">
                            {booking.paymentProof.uploadDate && formatDate(booking.paymentProof.uploadDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6 pt-6 border-t border-primary-200">
                <button
                  onClick={() => handleApprove(booking.id)}
                  className="btn-primary flex-1"
                >
                  Approve Booking
                </button>
                <button
                  onClick={() => handleReject(booking.id)}
                  className="btn-secondary flex-1"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingTab;
