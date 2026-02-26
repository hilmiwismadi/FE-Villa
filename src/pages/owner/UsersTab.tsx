import React, { useState } from 'react';
import { formatCurrency, formatDate, initialUsers } from './ownerData';

const UsersTab: React.FC = () => {
  const [users] = useState(initialUsers);

  return (
    <div>
      <h2 className="text-2xl font-serif text-primary-900 mb-6">User Database</h2>
      <p className="text-primary-600 mb-6">Manage guests and view their booking history.</p>

      <div className="bg-white rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-primary-700">User ID</th>
              <th className="text-left p-4 text-sm font-medium text-primary-700">Name</th>
              <th className="text-left p-4 text-sm font-medium text-primary-700">Email</th>
              <th className="text-left p-4 text-sm font-medium text-primary-700">Phone</th>
              <th className="text-left p-4 text-sm font-medium text-primary-700">Total Bookings</th>
              <th className="text-left p-4 text-sm font-medium text-primary-700">Total Spent</th>
              <th className="text-left p-4 text-sm font-medium text-primary-700">Last Booking</th>
              <th className="text-left p-4 text-sm font-medium text-primary-700">Booking IDs</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-primary-100 hover:bg-primary-25">
                <td className="p-4 text-primary-900 font-medium">{user.id}</td>
                <td className="p-4 text-primary-900">{user.name}</td>
                <td className="p-4 text-primary-700">{user.email}</td>
                <td className="p-4 text-primary-700">{user.phone}</td>
                <td className="p-4 text-primary-900 text-center">{user.totalBookings}</td>
                <td className="p-4 text-primary-900">{formatCurrency(user.totalSpent)}</td>
                <td className="p-4 text-primary-700">{formatDate(user.lastBooking)}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {user.bookingIds.map((bookingId) => (
                      <span key={bookingId} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                        {bookingId}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Total Users</p>
          <p className="text-3xl font-serif text-primary-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Repeat Customers</p>
          <p className="text-3xl font-serif text-primary-900">{users.filter(u => u.totalBookings > 1).length}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Average Lifetime Value</p>
          <p className="text-3xl font-serif text-primary-900">
            {formatCurrency(users.reduce((sum, u) => sum + u.totalSpent, 0) / users.length)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsersTab;
