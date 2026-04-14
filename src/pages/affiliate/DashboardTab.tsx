import React from 'react';
import { promoCodes, bookingsUsingCode, formatCurrency } from './data';

const totalCommission = promoCodes.reduce((sum, code) => sum + code.commission, 0);
const totalBookings = promoCodes.reduce((sum, code) => sum + code.totalUses, 0);
const totalRevenue = promoCodes.reduce((sum, code) => sum + code.totalRevenue, 0);

const AffiliateDashboard: React.FC = () => {
  return (
    <div>
      <h3 className="text-2xl font-serif text-primary-900 mb-8">Performance Overview</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-primary-600">Total Commission</p>
            <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-serif text-primary-900">{formatCurrency(totalCommission)}</p>
          <p className="text-xs text-primary-500 mt-1">Lifetime earnings</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-primary-600">Total Bookings</p>
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-3xl font-serif text-primary-900">{totalBookings}</p>
          <p className="text-xs text-primary-500 mt-1">Using your codes</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-primary-600">Revenue Generated</p>
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-3xl font-serif text-primary-900">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-primary-500 mt-1">Total booking value</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-primary-600">Conversion Rate</p>
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-3xl font-serif text-primary-900">3.2%</p>
          <p className="text-xs text-green-600 mt-1">+0.5% this month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-serif text-primary-900 mb-4">Active Promo Codes</h3>
          <div className="space-y-3">
            {promoCodes.map((code) => (
              <div key={code.code} className="flex justify-between items-center pb-3 border-b border-primary-100 last:border-0">
                <div>
                  <p className="text-primary-900 font-medium">{code.code}</p>
                  <p className="text-sm text-primary-600">{code.totalUses} uses</p>
                </div>
                <div className="text-right">
                  <p className="text-primary-900 font-medium">{formatCurrency(code.commission)}</p>
                  <p className="text-xs text-primary-600">Commission</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-serif text-primary-900 mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {bookingsUsingCode.slice(0, 3).map((booking) => (
              <div key={booking.id} className="flex justify-between items-center pb-3 border-b border-primary-100 last:border-0">
                <div>
                  <p className="text-primary-900 font-medium">{booking.guestName}</p>
                  <p className="text-sm text-primary-600">Code: {booking.promoCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-primary-900 font-medium">{formatCurrency(booking.commission)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
