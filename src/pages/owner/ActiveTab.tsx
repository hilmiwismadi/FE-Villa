import React, { useState } from 'react';
import { formatCurrency, formatDate, initialActiveBookings } from './ownerData';

const ActiveTab: React.FC = () => {
  const [activeBookings] = useState(initialActiveBookings);

  return (
    <div>
      <h2 className="text-2xl font-serif text-primary-900 mb-6">Active Bookings</h2>
      <p className="text-primary-600 mb-6">Guests currently checked in at the villa.</p>
      {activeBookings.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-primary-600">No active bookings at the moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-serif text-primary-900 mb-2">
                    {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                  </h3>
                  <p className="text-primary-600">{booking.guestInfo.email}</p>
                  <p className="text-primary-600">{booking.guestInfo.phone}</p>
                </div>
                <span className="px-4 py-2 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                  Currently Checked In
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-primary-200">
                <div>
                  <p className="text-sm text-primary-600 mb-1">Check-in Date</p>
                  <p className="text-primary-900 font-medium">{booking.dateRange && formatDate(booking.dateRange.start)}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-600 mb-1">Check-out Date</p>
                  <p className="text-primary-900 font-medium">{booking.dateRange && formatDate(booking.dateRange.end)}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-600 mb-1">Booking Value</p>
                  <p className="text-primary-900 font-medium">{formatCurrency(booking.pricing.total || 0)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveTab;
