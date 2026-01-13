import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import type { Booking } from '../types';

const OwnerDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pending' | 'active' | 'previous' | 'calendar' | 'pricing' | 'users' | 'promos'>('dashboard');
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 0, 1)); // Start at January 2025
  const [pricingMonth, setPricingMonth] = useState(new Date(2025, 0, 1)); // For pricing calendar

  // Mock data - in real app, this would come from backend
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([
    {
      id: 'BK001',
      dateRange: {
        start: new Date('2025-03-15'),
        end: new Date('2025-03-20'),
      },
      guestInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        specialRequests: 'Early check-in if possible',
      },
      pricing: {
        basePrice: 5000000,
        numNights: 5,
        subtotal: 25000000,
        discount: 2500000,
        total: 22500000,
      },
      paymentProof: {
        imageUrl: 'https://via.placeholder.com/400x300',
        uploadDate: new Date('2025-03-01'),
        amount: 22500000,
        transferDate: new Date('2025-02-28'),
      },
      status: 'pending',
      createdAt: new Date('2025-03-01'),
    },
  ]);

  // Active bookings (currently checked in)
  const [activeBookings] = useState<Booking[]>([
    {
      id: 'BK002',
      dateRange: {
        start: new Date('2025-01-10'),
        end: new Date('2025-01-15'),
      },
      guestInfo: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@example.com',
        phone: '+1234567891',
        specialRequests: '',
      },
      pricing: {
        basePrice: 5000000,
        numNights: 5,
        subtotal: 25000000,
        discount: 0,
        total: 25000000,
      },
      status: 'confirmed',
      createdAt: new Date('2025-01-01'),
    },
    {
      id: 'BK007',
      dateRange: {
        start: new Date('2025-01-20'),
        end: new Date('2025-01-27'),
      },
      guestInfo: {
        firstName: 'Robert',
        lastName: 'Martinez',
        email: 'robert.m@example.com',
        phone: '+1234567895',
        specialRequests: 'Celebrating anniversary',
      },
      pricing: {
        basePrice: 5000000,
        numNights: 7,
        subtotal: 35000000,
        discount: 3500000,
        total: 31500000,
      },
      status: 'confirmed',
      createdAt: new Date('2025-01-05'),
    },
    {
      id: 'BK008',
      dateRange: {
        start: new Date('2025-02-01'),
        end: new Date('2025-02-05'),
      },
      guestInfo: {
        firstName: 'Lisa',
        lastName: 'Anderson',
        email: 'lisa.a@example.com',
        phone: '+1234567896',
        specialRequests: 'Vegetarian meals preferred',
      },
      pricing: {
        basePrice: 5000000,
        numNights: 4,
        subtotal: 20000000,
        discount: 0,
        total: 20000000,
      },
      status: 'confirmed',
      createdAt: new Date('2025-01-15'),
    },
  ]);

  // Previous bookings (completed)
  const [previousBookings] = useState<Booking[]>([
    {
      id: 'BK003',
      dateRange: {
        start: new Date('2024-12-20'),
        end: new Date('2024-12-27'),
      },
      guestInfo: {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@example.com',
        phone: '+1234567892',
        specialRequests: '',
      },
      pricing: {
        basePrice: 5000000,
        numNights: 7,
        subtotal: 35000000,
        discount: 3500000,
        total: 31500000,
      },
      status: 'completed',
      createdAt: new Date('2024-12-10'),
    },
    {
      id: 'BK004',
      dateRange: {
        start: new Date('2024-11-15'),
        end: new Date('2024-11-20'),
      },
      guestInfo: {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.d@example.com',
        phone: '+1234567893',
        specialRequests: '',
      },
      pricing: {
        basePrice: 5000000,
        numNights: 5,
        subtotal: 25000000,
        discount: 2500000,
        total: 22500000,
      },
      status: 'completed',
      createdAt: new Date('2024-11-01'),
    },
  ]);

  const [approvedBookings, setApprovedBookings] = useState<Booking[]>([
    {
      id: 'BK005',
      dateRange: {
        start: new Date('2025-02-10'),
        end: new Date('2025-02-15'),
      },
      guestInfo: {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.w@example.com',
        phone: '+1234567894',
        specialRequests: '',
      },
      pricing: {
        basePrice: 5000000,
        numNights: 5,
        subtotal: 25000000,
        discount: 0,
        total: 25000000,
      },
      status: 'confirmed',
      createdAt: new Date('2025-01-05'),
    },
    {
      id: 'BK006',
      dateRange: {
        start: new Date('2025-02-20'),
        end: new Date('2025-02-25'),
      },
      guestInfo: {
        firstName: 'Jennifer',
        lastName: 'Brown',
        email: 'jennifer.b@example.com',
        phone: '+1234567897',
        specialRequests: 'Birthday celebration',
      },
      pricing: {
        basePrice: 5000000,
        numNights: 5,
        subtotal: 25000000,
        discount: 2500000,
        total: 22500000,
      },
      status: 'confirmed',
      createdAt: new Date('2025-02-01'),
    },
    {
      id: 'BK009',
      dateRange: {
        start: new Date('2025-03-05'),
        end: new Date('2025-03-10'),
      },
      guestInfo: {
        firstName: 'Thomas',
        lastName: 'Lee',
        email: 'thomas.l@example.com',
        phone: '+1234567898',
        specialRequests: '',
      },
      pricing: {
        basePrice: 5000000,
        numNights: 5,
        subtotal: 25000000,
        discount: 0,
        total: 25000000,
      },
      status: 'confirmed',
      createdAt: new Date('2025-02-15'),
    },
  ]);

  const [blockedDates, setBlockedDates] = useState<Date[]>([
    new Date('2025-01-28'),
    new Date('2025-01-29'),
    new Date('2025-01-30'),
  ]);

  // Pricing data
  const [basePrice] = useState(5000000);
  const [weekendMultiplier] = useState(1.3); // 30% increase on weekends
  const [specialDates] = useState([
    {
      id: 1,
      name: 'New Year 2025',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-01'),
      price: 10000000,
      type: 'holiday'
    },
    {
      id: 2,
      name: 'Chinese New Year',
      startDate: new Date('2025-01-29'),
      endDate: new Date('2025-01-31'),
      price: 8000000,
      type: 'holiday'
    },
    {
      id: 3,
      name: 'Valentine Week',
      startDate: new Date('2025-02-14'),
      endDate: new Date('2025-02-16'),
      price: 7000000,
      type: 'special'
    },
    {
      id: 4,
      name: 'Easter Weekend',
      startDate: new Date('2025-04-18'),
      endDate: new Date('2025-04-21'),
      price: 7500000,
      type: 'holiday'
    },
    {
      id: 5,
      name: 'Summer Peak Season',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-08-31'),
      price: 6500000,
      type: 'season'
    },
    {
      id: 6,
      name: 'Christmas & New Year',
      startDate: new Date('2025-12-24'),
      endDate: new Date('2026-01-05'),
      price: 12000000,
      type: 'holiday'
    },
  ]);

  const [promoCodes, setPromoCodes] = useState([
    { code: 'TRAVEL10', discount: 10, type: 'percentage', affiliate: 'TravelBlogger123', uses: 5 },
    { code: 'SUMMER25', discount: 25, type: 'percentage', affiliate: 'SummerVibes', uses: 2 },
  ]);

  // User database
  const [users] = useState([
    {
      id: 'U001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      totalBookings: 1,
      bookingIds: ['BK001'],
      totalSpent: 22500000,
      lastBooking: new Date('2025-03-01'),
    },
    {
      id: 'U002',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '+1234567891',
      totalBookings: 1,
      bookingIds: ['BK002'],
      totalSpent: 25000000,
      lastBooking: new Date('2025-01-10'),
    },
    {
      id: 'U003',
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      phone: '+1234567892',
      totalBookings: 1,
      bookingIds: ['BK003'],
      totalSpent: 31500000,
      lastBooking: new Date('2024-12-20'),
    },
    {
      id: 'U004',
      name: 'Emily Davis',
      email: 'emily.d@example.com',
      phone: '+1234567893',
      totalBookings: 1,
      bookingIds: ['BK004'],
      totalSpent: 22500000,
      lastBooking: new Date('2024-11-15'),
    },
    {
      id: 'U005',
      name: 'David Wilson',
      email: 'david.w@example.com',
      phone: '+1234567894',
      totalBookings: 1,
      bookingIds: ['BK005'],
      totalSpent: 25000000,
      lastBooking: new Date('2025-02-10'),
    },
    {
      id: 'U006',
      name: 'Robert Martinez',
      email: 'robert.m@example.com',
      phone: '+1234567895',
      totalBookings: 1,
      bookingIds: ['BK007'],
      totalSpent: 31500000,
      lastBooking: new Date('2025-01-20'),
    },
    {
      id: 'U007',
      name: 'Lisa Anderson',
      email: 'lisa.a@example.com',
      phone: '+1234567896',
      totalBookings: 1,
      bookingIds: ['BK008'],
      totalSpent: 20000000,
      lastBooking: new Date('2025-02-01'),
    },
    {
      id: 'U008',
      name: 'Jennifer Brown',
      email: 'jennifer.b@example.com',
      phone: '+1234567897',
      totalBookings: 1,
      bookingIds: ['BK006'],
      totalSpent: 22500000,
      lastBooking: new Date('2025-02-20'),
    },
    {
      id: 'U009',
      name: 'Thomas Lee',
      email: 'thomas.l@example.com',
      phone: '+1234567898',
      totalBookings: 1,
      bookingIds: ['BK009'],
      totalSpent: 25000000,
      lastBooking: new Date('2025-03-05'),
    },
  ]);

  // Analytics data
  const analytics = {
    currentRevenue: 76500000, // from active bookings (BK002 + BK007 + BK008)
    thisMonthRevenue: 56500000, // January check-ins: BK002 + BK007
    thisMonthBookings: 2,
    thisMonthBookingPercentage: 15, // compared to last month
    ytdRevenue: 171500000, // all 2025 bookings: BK001 + BK002 + BK005 + BK006 + BK007 + BK008 + BK009
    totalBookings: 9, // total bookings including previous
    averageBookingValue: 25000000,
  };

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

  // Calendar helpers
  const getAllBookedDates = () => {
    const allBookings = [...pendingBookings, ...activeBookings, ...approvedBookings];
    const bookedDates: Date[] = [];

    allBookings.forEach(booking => {
      const start = booking.dateRange.start;
      const end = booking.dateRange.end;
      const dates = eachDayOfInterval({ start, end });
      bookedDates.push(...dates);
    });

    return bookedDates;
  };

  const isDateBooked = (date: Date) => {
    const bookedDates = getAllBookedDates();
    return bookedDates.some(bookedDate => isSameDay(bookedDate, date));
  };

  const isDateBlocked = (date: Date) => {
    return blockedDates.some(blockedDate => isSameDay(blockedDate, date));
  };

  const getBookingForDate = (date: Date) => {
    const allBookings = [...pendingBookings, ...activeBookings, ...approvedBookings];
    return allBookings.find(booking => {
      const start = booking.dateRange.start;
      const end = booking.dateRange.end;
      return date >= start && date <= end;
    });
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weeks: Date[][] = [];

    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  };

  const renderPricingCalendar = () => {
    const monthStart = startOfMonth(pricingMonth);
    const monthEnd = endOfMonth(pricingMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weeks: Date[][] = [];

    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  };

  const getPriceForDate = (date: Date) => {
    // Check if date has special pricing
    const specialDate = specialDates.find(sd => {
      return date >= sd.startDate && date <= sd.endDate;
    });

    if (specialDate) {
      return specialDate.price;
    }

    // Check if it's weekend (Saturday = 6, Sunday = 0)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return Math.round(basePrice * weekendMultiplier);
    }

    // Return base price for weekdays
    return basePrice;
  };

  const getPriceType = (date: Date) => {
    const specialDate = specialDates.find(sd => {
      return date >= sd.startDate && date <= sd.endDate;
    });

    if (specialDate) {
      return specialDate.type;
    }

    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 'weekend';
    }

    return 'base';
  };

  const previousPricingMonth = () => {
    setPricingMonth(new Date(pricingMonth.getFullYear(), pricingMonth.getMonth() - 1, 1));
  };

  const nextPricingMonth = () => {
    setPricingMonth(new Date(pricingMonth.getFullYear(), pricingMonth.getMonth() + 1, 1));
  };

  return (
    <div className="flex min-h-screen bg-primary-50">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-900 text-white fixed h-screen overflow-y-auto">
        <div className="p-6 border-b border-primary-800">
          <h1 className="text-2xl font-serif mb-1">Villa Sekipan</h1>
          <p className="text-sm text-primary-300">Owner Dashboard</p>
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
            onClick={() => setActiveTab('pending')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === 'pending'
                ? 'bg-gold-600 text-white'
                : 'text-primary-200 hover:bg-primary-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="flex-1 text-left">Pending</span>
            {pendingBookings.length > 0 && (
              <span className="bg-gold-500 text-white text-xs px-2 py-1 rounded-full">
                {pendingBookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === 'active'
                ? 'bg-gold-600 text-white'
                : 'text-primary-200 hover:bg-primary-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="flex-1 text-left">Active</span>
            {activeBookings.length > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {activeBookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('previous')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === 'previous'
                ? 'bg-gold-600 text-white'
                : 'text-primary-200 hover:bg-primary-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>Previous</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === 'calendar'
                ? 'bg-gold-600 text-white'
                : 'text-primary-200 hover:bg-primary-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === 'pricing'
                ? 'bg-gold-600 text-white'
                : 'text-primary-200 hover:bg-primary-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Pricing</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === 'users'
                ? 'bg-gold-600 text-white'
                : 'text-primary-200 hover:bg-primary-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Users</span>
          </button>

          <button
            onClick={() => setActiveTab('promos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === 'promos'
                ? 'bg-gold-600 text-white'
                : 'text-primary-200 hover:bg-primary-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>Promo Codes</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white border-b border-primary-200 px-8 py-6">
          <h2 className="text-3xl font-serif text-primary-900">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'pending' && 'Pending Approvals'}
            {activeTab === 'active' && 'Active Bookings'}
            {activeTab === 'previous' && 'Previous Bookings'}
            {activeTab === 'calendar' && 'Booking Calendar'}
            {activeTab === 'pricing' && 'Pricing Editor'}
            {activeTab === 'users' && 'User Database'}
            {activeTab === 'promos' && 'Promo Codes'}
          </h2>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
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
                        <p className="text-sm text-primary-600">{formatDate(booking.dateRange.start)} - {formatDate(booking.dateRange.end)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary-900 font-medium">{formatCurrency(booking.pricing.total)}</p>
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
                        <p className="text-sm text-primary-600">Check-in: {formatDate(booking.dateRange.start)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-primary-900">{booking.pricing.numNights} nights</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Pending Approvals Tab */}
          {activeTab === 'pending' && (
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
                              {formatDate(booking.dateRange.start)} - {formatDate(booking.dateRange.end)}
                            </p>
                            <p className="text-sm text-primary-600">{booking.pricing.numNights} nights</p>
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
                              <span className="text-primary-900">{formatCurrency(booking.pricing.subtotal)}</span>
                            </div>
                            {booking.pricing.discount > 0 && (
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-primary-600">Discount</span>
                                <span className="text-green-600">-{formatCurrency(booking.pricing.discount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-semibold text-lg mt-2">
                              <span className="text-primary-900">Total</span>
                              <span className="text-primary-900">{formatCurrency(booking.pricing.total)}</span>
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
                                  {formatCurrency(booking.paymentProof.amount)}
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
                                  {formatDate(booking.paymentProof.uploadDate)}
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
          )}

          {/* Active Bookings Tab */}
          {activeTab === 'active' && (
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
                        <p className="text-primary-900 font-medium">{formatDate(booking.dateRange.start)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-primary-600 mb-1">Check-out Date</p>
                        <p className="text-primary-900 font-medium">{formatDate(booking.dateRange.end)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-primary-600 mb-1">Booking Value</p>
                        <p className="text-primary-900 font-medium">{formatCurrency(booking.pricing.total)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          {/* Previous Bookings Tab */}
          {activeTab === 'previous' && (
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
                        <td className="p-4 text-primary-700">{formatDate(booking.dateRange.start)}</td>
                        <td className="p-4 text-primary-700">{formatDate(booking.dateRange.end)}</td>
                        <td className="p-4 text-primary-700">{booking.pricing.numNights}</td>
                        <td className="p-4 text-primary-900">{formatCurrency(booking.pricing.total)}</td>
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
          )}

          {/* Calendar Management Tab */}
          {activeTab === 'calendar' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-primary-900">Booking Calendar</h2>
              <div className="flex items-center gap-4">
                <button onClick={previousMonth} className="p-2 hover:bg-primary-100 rounded">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-lg font-medium text-primary-900 min-w-[180px] text-center">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button onClick={nextMonth} className="p-2 hover:bg-primary-100 rounded">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
                <span className="text-primary-700">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-200 border border-red-400 rounded"></div>
                <span className="text-primary-700">Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border border-primary-300 rounded"></div>
                <span className="text-primary-700">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded"></div>
                <span className="text-primary-700">Today</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-7 bg-primary-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-primary-700 border-r border-primary-200 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              {renderCalendar().map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 border-t border-primary-200">
                  {week.map((day, dayIndex) => {
                    const isBooked = isDateBooked(day);
                    const isBlocked = isDateBlocked(day);
                    const booking = getBookingForDate(day);
                    const today = isToday(day);
                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

                    return (
                      <div
                        key={dayIndex}
                        className={`min-h-[80px] p-2 border-r border-primary-200 last:border-r-0 ${
                          !isCurrentMonth ? 'bg-primary-25' : ''
                        } ${isBooked ? 'bg-green-50' : ''} ${isBlocked ? 'bg-red-50' : ''} ${
                          today ? 'bg-blue-50' : ''
                        } hover:bg-primary-100 transition-colors cursor-pointer`}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          !isCurrentMonth ? 'text-primary-400' : 'text-primary-900'
                        } ${today ? 'text-blue-600 font-bold' : ''}`}>
                          {format(day, 'd')}
                        </div>
                        {isBooked && booking && (
                          <div className="text-xs bg-green-600 text-white px-1 py-0.5 rounded">
                            {booking.id}
                          </div>
                        )}
                        {isBlocked && (
                          <div className="text-xs bg-red-600 text-white px-1 py-0.5 rounded">
                            Blocked
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Block Dates Form */}
            <div className="mt-8 bg-white rounded-lg p-6">
              <h3 className="text-lg font-serif text-primary-900 mb-4">Block Dates</h3>
              <p className="text-sm text-primary-600 mb-4">Block dates for maintenance or personal use.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Start Date</label>
                  <input type="date" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">End Date</label>
                  <input type="date" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Reason</label>
                  <input type="text" className="input-field" placeholder="e.g., Maintenance" />
                </div>
              </div>
              <button className="btn-primary mt-4">Block Dates</button>
            </div>
          </div>
          )}

          {/* Pricing Editor Tab */}
          {activeTab === 'pricing' && (
          <div>
            {/* Pricing Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-serif text-primary-900 mb-4">Base Price</h3>
                <div className="text-3xl font-serif text-primary-900 mb-2">{formatCurrency(basePrice)}</div>
                <p className="text-sm text-primary-600 mb-4">Per night (weekdays)</p>
                <button className="text-sm text-gold-600 hover:text-gold-700 font-medium">Edit Base Price</button>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-serif text-primary-900 mb-4">Weekend Rate</h3>
                <div className="text-3xl font-serif text-primary-900 mb-2">{formatCurrency(Math.round(basePrice * weekendMultiplier))}</div>
                <p className="text-sm text-primary-600 mb-4">+{Math.round((weekendMultiplier - 1) * 100)}% from base price</p>
                <button className="text-sm text-gold-600 hover:text-gold-700 font-medium">Edit Weekend Rate</button>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-serif text-primary-900 mb-4">Special Dates</h3>
                <div className="text-3xl font-serif text-primary-900 mb-2">{specialDates.length}</div>
                <p className="text-sm text-primary-600 mb-4">Holiday & peak periods</p>
                <button className="text-sm text-gold-600 hover:text-gold-700 font-medium">Manage Special Dates</button>
              </div>
            </div>

            {/* Pricing Calendar */}
            <div className="bg-white rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif text-primary-900">Price Calendar</h3>
                <div className="flex items-center gap-4">
                  <button onClick={previousPricingMonth} className="p-2 hover:bg-primary-100 rounded">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-lg font-medium text-primary-900 min-w-[180px] text-center">
                    {format(pricingMonth, 'MMMM yyyy')}
                  </span>
                  <button onClick={nextPricingMonth} className="p-2 hover:bg-primary-100 rounded">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary-100 border border-primary-300 rounded"></div>
                  <span className="text-primary-700">Base ({formatCurrency(basePrice)})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-400 rounded"></div>
                  <span className="text-primary-700">Weekend ({formatCurrency(Math.round(basePrice * weekendMultiplier))})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-100 border border-orange-400 rounded"></div>
                  <span className="text-primary-700">Special Event</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-400 rounded"></div>
                  <span className="text-primary-700">Holiday</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-100 border border-purple-400 rounded"></div>
                  <span className="text-primary-700">Peak Season</span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 bg-primary-50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="p-3 text-center text-sm font-medium text-primary-700 border-r border-primary-200 last:border-r-0">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  {renderPricingCalendar().map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 border-t border-primary-200">
                      {week.map((day, dayIndex) => {
                        const price = getPriceForDate(day);
                        const priceType = getPriceType(day);
                        const isCurrentMonth = day.getMonth() === pricingMonth.getMonth();
                        const today = isToday(day);

                        let bgColor = 'bg-white';
                        if (priceType === 'weekend') bgColor = 'bg-blue-50';
                        if (priceType === 'special') bgColor = 'bg-orange-50';
                        if (priceType === 'holiday') bgColor = 'bg-red-50';
                        if (priceType === 'season') bgColor = 'bg-purple-50';
                        if (today) bgColor = 'bg-yellow-50';

                        return (
                          <div
                            key={dayIndex}
                            className={`min-h-[90px] p-2 border-r border-primary-200 last:border-r-0 ${
                              !isCurrentMonth ? 'bg-primary-25 opacity-50' : bgColor
                            } hover:bg-primary-100 transition-colors cursor-pointer`}
                          >
                            <div className={`text-sm font-medium mb-1 ${
                              !isCurrentMonth ? 'text-primary-400' : 'text-primary-900'
                            } ${today ? 'text-gold-600 font-bold' : ''}`}>
                              {format(day, 'd')}
                            </div>
                            {isCurrentMonth && (
                              <div className="text-xs text-primary-900 font-semibold">
                                {formatCurrency(price)}
                              </div>
                            )}
                            {isCurrentMonth && priceType !== 'base' && (
                              <div className="text-xs text-primary-600 mt-1">
                                {priceType === 'weekend' && 'Weekend'}
                                {priceType === 'special' && 'Special'}
                                {priceType === 'holiday' && 'Holiday'}
                                {priceType === 'season' && 'Peak'}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Add New Special Date Form */}
            <div className="bg-white rounded-lg p-6 mb-8">
              <h3 className="text-xl font-serif text-primary-900 mb-4">Add Special Pricing Period</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Period Name</label>
                  <input type="text" className="input-field" placeholder="e.g., Eid Holiday" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Start Date</label>
                  <input type="date" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">End Date</label>
                  <input type="date" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Price per Night</label>
                  <input type="number" className="input-field" placeholder="8000000" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-primary-700 mb-2">Type</label>
                <select className="input-field max-w-xs">
                  <option value="holiday">Holiday</option>
                  <option value="special">Special Event</option>
                  <option value="season">Peak Season</option>
                </select>
              </div>
              <button className="btn-primary mt-6">Add Pricing Period</button>
            </div>

            {/* Special Dates List */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-xl font-serif text-primary-900 mb-6">Current Special Pricing Periods</h3>

              <div className="space-y-4">
                {specialDates.map((sd) => (
                  <div key={sd.id} className="flex items-center justify-between p-4 border border-primary-200 rounded-lg hover:bg-primary-25">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-primary-900">{sd.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          sd.type === 'holiday' ? 'bg-red-100 text-red-800' :
                          sd.type === 'special' ? 'bg-orange-100 text-orange-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {sd.type}
                        </span>
                      </div>
                      <p className="text-sm text-primary-600 mt-1">
                        {formatDate(sd.startDate)} - {formatDate(sd.endDate)}
                      </p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-lg font-serif text-primary-900">{formatCurrency(sd.price)}</p>
                      <p className="text-xs text-primary-600">per night</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-sm text-gold-600 hover:text-gold-700 font-medium px-3 py-1">
                        Edit
                      </button>
                      <button className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
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
          )}

          {/* Promo Codes Tab */}
          {activeTab === 'promos' && (
          <div>
            <h2 className="text-2xl font-serif text-primary-900 mb-6">Promo Codes & Affiliates</h2>

            {/* Create New Promo */}
            <div className="bg-white rounded-lg p-8 mb-8">
              <h3 className="text-lg font-serif text-primary-900 mb-4">Create New Promo Code</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Promo Code
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., WELCOME20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Affiliate Name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Content creator name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    className="input-field"
                  />
                </div>
              </div>
              <button className="btn-primary mt-4">Create Promo Code</button>
            </div>

            {/* Active Promos */}
            <div className="bg-white rounded-lg overflow-hidden">
              <h3 className="text-lg font-serif text-primary-900 p-6 border-b border-primary-200">
                Active Promo Codes
              </h3>
              <table className="w-full">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-primary-700">Code</th>
                    <th className="text-left p-4 text-sm font-medium text-primary-700">Discount</th>
                    <th className="text-left p-4 text-sm font-medium text-primary-700">Affiliate</th>
                    <th className="text-left p-4 text-sm font-medium text-primary-700">Uses</th>
                    <th className="text-left p-4 text-sm font-medium text-primary-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promoCodes.map((promo, index) => (
                    <tr key={index} className="border-t border-primary-100">
                      <td className="p-4 text-primary-900 font-medium">{promo.code}</td>
                      <td className="p-4 text-primary-900">{promo.discount}%</td>
                      <td className="p-4 text-primary-700">{promo.affiliate}</td>
                      <td className="p-4 text-primary-700">{promo.uses} times</td>
                      <td className="p-4">
                        <button className="text-sm text-red-600 hover:text-red-800">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboardPage;
