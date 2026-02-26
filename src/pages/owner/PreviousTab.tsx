import React, { useState } from 'react';
import { formatCurrency, formatDate, initialPreviousBookings } from './ownerData';

const PreviousTab: React.FC = () => {
  const [previousBookings] = useState(initialPreviousBookings);

  return (
    <div>
      <h2 className="text-2xl font-serif text-primary-900 mb-6">Previous Bookings</h2>
      <p className="text-primary-600 mb-6">Completed bookings and booking history.</p>
      {previousBookings.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-primary-600">No previous bookings yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Booking ID</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Guest</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Check-in</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Check-out</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Nights</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Total</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {previousBookings.map((booking) => (
                <tr key={booking.id} className="border-t border-primary-100">
                  <td className="p-4 text-primary-900 font-medium">{booking.id}</td>
                  <td className="p-4 text-primary-900">
                    {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                  </td>
                  <td className="p-4 text-primary-700">{booking.dateRange && formatDate(booking.dateRange.start)}</td>
                  <td className="p-4 text-primary-700">{booking.dateRange && formatDate(booking.dateRange.end)}</td>
                  <td className="p-4 text-primary-700">{booking.pricing.numNights || 0}</td>
                  <td className="p-4 text-primary-900">{formatCurrency(booking.pricing.total || 0)}</td>
                  <td className="p-4">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PreviousTab;
