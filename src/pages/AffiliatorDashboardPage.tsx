import React, { useState } from 'react';
import { format } from 'date-fns';

const AffiliatorDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'codes' | 'bookings' | 'earnings' | 'marketing'>('dashboard');

  // Mock affiliator data
  const [affiliatorInfo] = useState({
    id: 'AFF001',
    name: 'TravelBlogger123',
    email: 'travelblogger@example.com',
    joinDate: new Date('2024-06-01'),
    commissionRate: 15, // 15% commission
    status: 'active',
  });

  const [promoCodes] = useState([
    {
      code: 'TRAVEL10',
      discount: 10,
      type: 'percentage',
      totalUses: 5,
      totalRevenue: 112500000,
      commission: 16875000,
      createdDate: new Date('2024-06-15'),
      status: 'active',
    },
    {
      code: 'SUMMERESCAPE',
      discount: 15,
      type: 'percentage',
      totalUses: 3,
      totalRevenue: 63750000,
      commission: 9562500,
      createdDate: new Date('2024-11-01'),
      status: 'active',
    },
  ]);

  const [bookingsUsingCode] = useState([
    {
      id: 'BK010',
      guestName: 'Alice Thompson',
      checkIn: new Date('2025-02-15'),
      checkOut: new Date('2025-02-20'),
      promoCode: 'TRAVEL10',
      originalPrice: 25000000,
      discount: 2500000,
      finalPrice: 22500000,
      commission: 3375000,
      status: 'confirmed',
      bookingDate: new Date('2025-01-20'),
    },
    {
      id: 'BK011',
      guestName: 'Mark Wilson',
      checkIn: new Date('2025-03-01'),
      checkOut: new Date('2025-03-06'),
      promoCode: 'TRAVEL10',
      originalPrice: 30000000,
      discount: 3000000,
      finalPrice: 27000000,
      commission: 4050000,
      status: 'confirmed',
      bookingDate: new Date('2025-02-01'),
    },
    {
      id: 'BK012',
      guestName: 'Sophie Chen',
      checkIn: new Date('2025-03-15'),
      checkOut: new Date('2025-03-18'),
      promoCode: 'SUMMERESCAPE',
      originalPrice: 15000000,
      discount: 2250000,
      finalPrice: 12750000,
      commission: 1912500,
      status: 'pending',
      bookingDate: new Date('2025-02-10'),
    },
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const totalCommission = promoCodes.reduce((sum, code) => sum + code.commission, 0);
  const totalBookings = promoCodes.reduce((sum, code) => sum + code.totalUses, 0);
  const totalRevenue = promoCodes.reduce((sum, code) => sum + code.totalRevenue, 0);

  const pendingCommission = bookingsUsingCode
    .filter(b => b.status === 'pending')
    .reduce((sum, b) => sum + b.commission, 0);

  const confirmedCommission = bookingsUsingCode
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.commission, 0);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="flex min-h-screen bg-primary-50">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-900 text-white fixed h-screen overflow-y-auto">
        <div className="p-6 border-b border-primary-800">
          <h1 className="text-2xl font-serif mb-1">Villa Sekipan</h1>
          <p className="text-sm text-primary-300">Affiliate Dashboard</p>
        </div>

        <div className="p-6 border-b border-primary-800">
          <p className="text-xs text-primary-400 mb-1">Affiliate ID</p>
          <p className="text-sm font-medium">{affiliatorInfo.id}</p>
          <p className="text-xs text-primary-400 mt-3 mb-1">Affiliate Name</p>
          <p className="text-sm font-medium">{affiliatorInfo.name}</p>
          <p className="text-xs text-primary-400 mt-3 mb-1">Commission Rate</p>
          <p className="text-sm font-medium text-gold-400">{affiliatorInfo.commissionRate}%</p>
        </div>

        <nav className="p-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-gold-600 text-white'
                : 'text-primary-200 hover:bg-primary-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('codes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === 'codes'
                ? 'bg-gold-600 text-white'
                : 'text-primary-200 hover:bg-primary-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="flex-1 text-left">Promo Codes</span>
            <span className="bg-gold-500 text-white text-xs px-2 py-1 rounded-full">
              {promoCodes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === 'bookings'
                ? 'bg-gold-600 text-white'
                : 'text-primary-200 hover:bg-primary-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Bookings</span>
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === 'earnings'
                ? 'bg-gold-600 text-white'
                : 'text-primary-200 hover:bg-primary-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Earnings</span>
          </button>

          <button
            onClick={() => setActiveTab('marketing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === 'marketing'
                ? 'bg-gold-600 text-white'
                : 'text-primary-200 hover:bg-primary-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Marketing</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white border-b border-primary-200 px-8 py-6">
          <h2 className="text-3xl font-serif text-primary-900">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'codes' && 'My Promo Codes'}
            {activeTab === 'bookings' && 'Bookings Using My Codes'}
            {activeTab === 'earnings' && 'Earnings & Payouts'}
            {activeTab === 'marketing' && 'Marketing Materials'}
          </h2>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <h3 className="text-2xl font-serif text-primary-900 mb-8">Performance Overview</h3>

              {/* Stats Cards */}
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

              {/* Quick Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Promo Codes */}
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

                {/* Recent Bookings */}
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
          )}

          {/* Promo Codes Tab */}
          {activeTab === 'codes' && (
            <div>
              <h3 className="text-2xl font-serif text-primary-900 mb-6">My Promo Codes</h3>
              <p className="text-primary-600 mb-8">Share these codes with your audience to earn commission on bookings.</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {promoCodes.map((code) => (
                  <div key={code.code} className="bg-white rounded-lg p-6 shadow-sm border-2 border-primary-100 hover:border-gold-400 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-2xl font-serif text-primary-900 mb-2">{code.code}</h4>
                        <p className="text-sm text-primary-600">Created {formatDate(code.createdDate)}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-primary-600 mb-1">Discount</p>
                        <p className="text-xl font-semibold text-primary-900">{code.discount}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-primary-600 mb-1">Total Uses</p>
                        <p className="text-xl font-semibold text-primary-900">{code.totalUses}</p>
                      </div>
                      <div>
                        <p className="text-sm text-primary-600 mb-1">Revenue Generated</p>
                        <p className="text-lg font-semibold text-primary-900">{formatCurrency(code.totalRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-primary-600 mb-1">Your Commission</p>
                        <p className="text-lg font-semibold text-gold-600">{formatCurrency(code.commission)}</p>
                      </div>
                    </div>

                    <div className="border-t border-primary-200 pt-4">
                      <p className="text-sm text-primary-600 mb-2">Booking Link</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={`https://villasekipan.com/book?code=${code.code}`}
                          readOnly
                          className="input-field flex-1 text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(`https://villasekipan.com/book?code=${code.code}`)}
                          className="btn-secondary whitespace-nowrap"
                        >
                          Copy Link
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
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
          )}

          {/* Earnings Tab */}
          {activeTab === 'earnings' && (
            <div>
              <h3 className="text-2xl font-serif text-primary-900 mb-8">Earnings & Payouts</h3>

              {/* Earnings Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-sm text-primary-600 mb-2">Confirmed Earnings</p>
                  <p className="text-3xl font-serif text-green-600 mb-1">{formatCurrency(confirmedCommission)}</p>
                  <p className="text-xs text-primary-500">Ready for payout</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-sm text-primary-600 mb-2">Pending Earnings</p>
                  <p className="text-3xl font-serif text-yellow-600 mb-1">{formatCurrency(pendingCommission)}</p>
                  <p className="text-xs text-primary-500">Awaiting confirmation</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-sm text-primary-600 mb-2">Total Lifetime Earnings</p>
                  <p className="text-3xl font-serif text-primary-900 mb-1">{formatCurrency(totalCommission)}</p>
                  <p className="text-xs text-primary-500">All time</p>
                </div>
              </div>

              {/* Commission Breakdown */}
              <div className="bg-white rounded-lg p-6 mb-8">
                <h4 className="text-lg font-serif text-primary-900 mb-4">Commission Breakdown by Code</h4>
                <div className="space-y-4">
                  {promoCodes.map((code) => (
                    <div key={code.code} className="flex items-center justify-between p-4 border border-primary-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-primary-900">{code.code}</span>
                          <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
                            {code.totalUses} bookings
                          </span>
                        </div>
                        <p className="text-sm text-primary-600 mt-1">
                          {formatCurrency(code.totalRevenue)} revenue generated
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-serif text-gold-600">{formatCurrency(code.commission)}</p>
                        <p className="text-xs text-primary-600">{affiliatorInfo.commissionRate}% commission</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payout Info */}
              <div className="bg-gold-50 border border-gold-200 rounded-lg p-6">
                <h4 className="text-lg font-serif text-primary-900 mb-2">Payout Information</h4>
                <p className="text-primary-700 mb-4">
                  Commissions are paid out monthly on the 5th of each month for all confirmed bookings from the previous month.
                </p>
                <button className="btn-primary">Request Payout</button>
              </div>
            </div>
          )}

          {/* Marketing Materials Tab */}
          {activeTab === 'marketing' && (
            <div>
              <h3 className="text-2xl font-serif text-primary-900 mb-6">Marketing Materials</h3>
              <p className="text-primary-600 mb-8">Download images, banners, and copy to promote Villa Sekipan.</p>

              {/* Quick Links */}
              <div className="bg-white rounded-lg p-6 mb-8">
                <h4 className="text-lg font-serif text-primary-900 mb-4">Quick Links</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Website Link</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value="https://villasekipan.com"
                        readOnly
                        className="input-field flex-1"
                      />
                      <button
                        onClick={() => copyToClipboard('https://villasekipan.com')}
                        className="btn-secondary whitespace-nowrap"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Booking Link with Your Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={`https://villasekipan.com/book?code=${promoCodes[0].code}`}
                        readOnly
                        className="input-field flex-1"
                      />
                      <button
                        onClick={() => copyToClipboard(`https://villasekipan.com/book?code=${promoCodes[0].code}`)}
                        className="btn-secondary whitespace-nowrap"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pre-written Copy */}
              <div className="bg-white rounded-lg p-6 mb-8">
                <h4 className="text-lg font-serif text-primary-900 mb-4">Pre-written Copy</h4>
                <div className="space-y-4">
                  <div className="p-4 border border-primary-200 rounded-lg">
                    <p className="text-sm font-medium text-primary-700 mb-2">Social Media Post</p>
                    <p className="text-primary-900 mb-3 italic">
                      "Experience authentic Japanese luxury at Villa Sekipan. This stunning villa combines traditional architecture with modern comfort. Use code {promoCodes[0].code} for {promoCodes[0].discount}% off your booking! Link in bio."
                    </p>
                    <button
                      onClick={() => copyToClipboard(`Experience authentic Japanese luxury at Villa Sekipan. This stunning villa combines traditional architecture with modern comfort. Use code ${promoCodes[0].code} for ${promoCodes[0].discount}% off your booking! https://villasekipan.com/book?code=${promoCodes[0].code}`)}
                      className="text-sm text-gold-600 hover:text-gold-700 font-medium"
                    >
                      Copy to Clipboard
                    </button>
                  </div>

                  <div className="p-4 border border-primary-200 rounded-lg">
                    <p className="text-sm font-medium text-primary-700 mb-2">Email Template</p>
                    <p className="text-primary-900 mb-3 italic">
                      "Looking for your next getaway? Villa Sekipan offers the perfect blend of tranquility and luxury. Set on a hillside with breathtaking views, this Japanese-inspired villa is the ultimate escape. Book now with code {promoCodes[0].code} and save {promoCodes[0].discount}%!"
                    </p>
                    <button
                      onClick={() => copyToClipboard(`Looking for your next getaway? Villa Sekipan offers the perfect blend of tranquility and luxury. Set on a hillside with breathtaking views, this Japanese-inspired villa is the ultimate escape. Book now with code ${promoCodes[0].code} and save ${promoCodes[0].discount}%! https://villasekipan.com/book?code=${promoCodes[0].code}`)}
                      className="text-sm text-gold-600 hover:text-gold-700 font-medium"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Assets */}
              <div className="bg-white rounded-lg p-6">
                <h4 className="text-lg font-serif text-primary-900 mb-4">Image Assets</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border border-primary-200 rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800"
                      alt="Villa exterior"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <p className="text-sm text-primary-900 mb-2">Villa Exterior</p>
                      <button className="text-sm text-gold-600 hover:text-gold-700 font-medium">Download</button>
                    </div>
                  </div>
                  <div className="border border-primary-200 rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
                      alt="Interior view"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <p className="text-sm text-primary-900 mb-2">Interior View</p>
                      <button className="text-sm text-gold-600 hover:text-gold-700 font-medium">Download</button>
                    </div>
                  </div>
                  <div className="border border-primary-200 rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
                      alt="Pool area"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <p className="text-sm text-primary-900 mb-2">Pool Area</p>
                      <button className="text-sm text-gold-600 hover:text-gold-700 font-medium">Download</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AffiliatorDashboardPage;
