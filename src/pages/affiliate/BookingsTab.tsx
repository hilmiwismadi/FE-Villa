import React from 'react';
import { bookingsUsingCode, formatCurrency, formatDate } from './data';

const BookingsTab: React.FC = () => {
  return (
    <div>
      <h3 className="text-2xl font-serif text-primary-900 mb-6">Bookings Using Your Codes</h3>
      <p className="text-primary-600 mb-6">Track all bookings made with your promo codes.</p>

      <div className="bg-white rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-primary-700">Booking ID</th>
              <th className="text-left p-4 text-sm font-medium text-primary-700">Guest</th>
              <th className="text-left p-4 text-sm font-medium text-primary-700">Check-in</th>
              <th className="text-left p-4 text-sm font-medium text-primary-700">Promo Code</th>
              <th className="text-left p-4 text-sm font-medium text-primary-700">Original Price</th>
              <th className="text-left p-4 text-sm font-medium text-primary-700">Final Price</th>
              <th className="text-left p-4 text-sm font-medium text-primary-700">Your Commission</th>
              <th className="text-left p-4 text-sm font-medium text-primary-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookingsUsingCode.map((booking) => (
              <tr key={booking.id} className="border-t border-primary-100">
                <td className="p-4 text-primary-900 font-medium">{booking.id}</td>
                <td className="p-4 text-primary-900">{booking.guestName}</td>
                <td className="p-4 text-primary-700">{formatDate(booking.checkIn)}</td>
                <td className="p-4">
                  <span className="inline-block px-2 py-1 bg-gold-100 text-gold-800 text-xs rounded font-medium">
                    {booking.promoCode}
                  </span>
                </td>
                <td className="p-4 text-primary-700 line-through">{formatCurrency(booking.originalPrice)}</td>
                <td className="p-4 text-primary-900 font-medium">{formatCurrency(booking.finalPrice)}</td>
                <td className="p-4 text-gold-600 font-semibold">{formatCurrency(booking.commission)}</td>
                <td className="p-4">
                  <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsTab;
