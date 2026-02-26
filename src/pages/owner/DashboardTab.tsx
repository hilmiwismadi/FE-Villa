import React, { useState } from 'react';
import {
  formatCurrency,
  formatDate,
  analytics,
  initialPendingBookings,
  initialApprovedBookings,
} from './ownerData';

const DashboardTab: React.FC = () => {
  const [pendingBookings] = useState(initialPendingBookings);
  const [approvedBookings] = useState(initialApprovedBookings);

  return (
    <div>
      <h2 className="text-2xl font-serif text-primary-900 mb-8">Analytics Overview</h2>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-primary-600">Current Revenue</p>
            <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-serif text-primary-900">{formatCurrency(analytics.currentRevenue)}</p>
          <p className="text-xs text-primary-500 mt-1">From active bookings</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-primary-600">This Month Revenue</p>
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-3xl font-serif text-primary-900">{formatCurrency(analytics.thisMonthRevenue)}</p>
          <p className="text-xs text-green-600 mt-1">+{analytics.thisMonthBookingPercentage}% from last month</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-primary-600">This Month Bookings</p>
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-3xl font-serif text-primary-900">{analytics.thisMonthBookings}</p>
          <p className="text-xs text-primary-500 mt-1">{analytics.totalBookings} total bookings</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-primary-600">YTD Revenue</p>
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-3xl font-serif text-primary-900">{formatCurrency(analytics.ytdRevenue)}</p>
          <p className="text-xs text-primary-500 mt-1">Year to date 2025</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-serif text-primary-900 mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {[...pendingBookings, ...approvedBookings].slice(0, 3).map((booking) => (
              <div key={booking.id} className="flex justify-between items-center pb-3 border-b border-primary-100 last:border-0">
                <div>
                  <p className="text-primary-900 font-medium">{booking.guestInfo.firstName} {booking.guestInfo.lastName}</p>
                  <p className="text-sm text-primary-600">{booking.dateRange && formatDate(booking.dateRange.start)} - {booking.dateRange && formatDate(booking.dateRange.end)}</p>
                </div>
                <div className="text-right">
                  <p className="text-primary-900 font-medium">{formatCurrency(booking.pricing.total || 0)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {booking.status === 'pending' ? 'Pending' : 'Confirmed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Check-ins */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-serif text-primary-900 mb-4">Upcoming Check-ins</h3>
          <div className="space-y-3">
            {approvedBookings.slice(0, 3).map((booking) => (
              <div key={booking.id} className="flex justify-between items-center pb-3 border-b border-primary-100 last:border-0">
                <div>
                  <p className="text-primary-900 font-medium">{booking.guestInfo.firstName} {booking.guestInfo.lastName}</p>
                  <p className="text-sm text-primary-600">Check-in: {booking.dateRange && formatDate(booking.dateRange.start)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-primary-900">{booking.pricing.numNights || 0} nights</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
