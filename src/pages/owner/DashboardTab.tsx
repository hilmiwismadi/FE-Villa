import React, { useEffect, useMemo, useState } from 'react';
import type { DashboardResponse, OrderResponse, RevenueResponse } from '../../services/orderServiceDirectBE';
import { getAdminOrders, getDashboard, getRevenue } from '../../services/orderServiceDirectBE';

const statusLabels: Record<string, string> = {
  in_transaction: 'In Transaction',
  pending: 'Pending',
  booked: 'Booked',
  check_in: 'Check In',
  completed: 'Completed',
  expired: 'Expired',
  rejected: 'Rejected',
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr));
};

const YEAR_MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

const toSafeNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const digitsOnly = value.replace(/[^\d-]/g, '');
    const parsed = Number(digitsOnly);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getMonthIndex = (rawItem: Record<string, unknown>): number => {
  const monthValue = rawItem.month;
  if (typeof monthValue === 'number' && monthValue >= 1 && monthValue <= 12) {
    return monthValue - 1;
  }

  if (typeof monthValue === 'string') {
    const numericMonth = Number(monthValue);
    if (Number.isFinite(numericMonth) && numericMonth >= 1 && numericMonth <= 12) {
      return numericMonth - 1;
    }
  }

  const label = String(rawItem.label ?? '').toLowerCase();
  const monthFromLabel = YEAR_MONTH_LABELS.findIndex((monthLabel) => label.includes(monthLabel.toLowerCase()));
  if (monthFromLabel >= 0) {
    return monthFromLabel;
  }

  const dateValue = rawItem.date;
  if (typeof dateValue === 'string') {
    const parsedDate = new Date(dateValue);
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.getMonth();
    }
  }

  return -1;
};

const DashboardTab: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [revenue, setRevenue] = useState<RevenueResponse | null>(null);
  const [recentPending, setRecentPending] = useState<OrderResponse[]>([]);
  const [upcomingCheckIns, setUpcomingCheckIns] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const currentYear = new Date().getFullYear();

        const [dashboardData, revenueData, pendingData, bookedData] = await Promise.all([
          getDashboard(),
          getRevenue('yearly', currentYear),
          getAdminOrders('pending', 1, 5),
          getAdminOrders('booked', 1, 10),
        ]);

        const sortedPending = [...pendingData.orders].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const sortedBooked = [...bookedData.orders]
          .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime())
          .slice(0, 5);

        setDashboard(dashboardData);
        setRevenue(revenueData);
        setRecentPending(sortedPending.slice(0, 5));
        setUpcomingCheckIns(sortedBooked);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const normalizedRevenueBreakdown = useMemo(() => {
    const currentMonthRevenue = toSafeNumber(dashboard?.currentMonthRevenue);
    const initialMonths = YEAR_MONTH_LABELS.map((label) => ({
      label,
      revenue: 0,
      bookings: 0,
    }));

    if (!revenue?.breakdown?.length) {
      return initialMonths;
    }

    const mergedMonths = [...initialMonths];
    const rawBreakdown: unknown[] = Array.isArray(revenue.breakdown) ? revenue.breakdown : [];

    rawBreakdown.forEach((item) => {
      if (typeof item !== 'object' || item === null) return;
      const rawItem = item as Record<string, unknown>;
      const monthIndex = getMonthIndex(rawItem);
      if (monthIndex < 0 || monthIndex > 11) return;

      mergedMonths[monthIndex] = {
        label: YEAR_MONTH_LABELS[monthIndex],
        revenue: toSafeNumber(
          rawItem.revenue ??
          rawItem.amount ??
          rawItem.total ??
          rawItem.value ??
          rawItem.monthRevenue ??
          rawItem.income
        ),
        bookings: toSafeNumber(
          rawItem.bookings ??
          rawItem.bookingCount ??
          rawItem.orders ??
          rawItem.orderCount
        ),
      };
    });

    const hasAnyRevenue = mergedMonths.some((month) => month.revenue > 0);
    if (!hasAnyRevenue && currentMonthRevenue > 0) {
      const currentMonthIndex = new Date().getMonth();
      mergedMonths[currentMonthIndex] = {
        ...mergedMonths[currentMonthIndex],
        revenue: currentMonthRevenue,
      };
    }

    return mergedMonths;
  }, [revenue, dashboard?.currentMonthRevenue]);

  const revenueBars = useMemo(() => {
    if (!normalizedRevenueBreakdown.length) return [];
    const maxRevenue = Math.max(...normalizedRevenueBreakdown.map((item) => item.revenue), 1);
    return normalizedRevenueBreakdown.map((item) => ({
      ...item,
      height: Math.max((item.revenue / maxRevenue) * 100, 3),
    }));
  }, [normalizedRevenueBreakdown]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-12 text-center">
        <p className="text-primary-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="bg-red-50 rounded-lg p-8 text-center">
        <p className="text-red-600">{error || 'Failed to load dashboard'}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-serif text-primary-900 mb-8">Analytics Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Current Week Revenue</p>
          <p className="text-3xl font-serif text-primary-900">{formatCurrency(dashboard.currentWeekRevenue)}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Current Month Revenue</p>
          <p className="text-3xl font-serif text-primary-900">{formatCurrency(dashboard.currentMonthRevenue)}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">YTD Revenue</p>
          <p className="text-3xl font-serif text-primary-900">{formatCurrency(dashboard.yearToDateRevenue)}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Weekly Occupancy</p>
          <p className="text-3xl font-serif text-primary-900">{dashboard.weeklyOccupancyRate}%</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Monthly Occupancy</p>
          <p className="text-3xl font-serif text-primary-900">{dashboard.monthlyOccupancyRate}%</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Avg Nightly Rate</p>
          <p className="text-3xl font-serif text-primary-900">{formatCurrency(dashboard.averageNightlyRate)}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Pending Orders</p>
          <p className="text-3xl font-serif text-primary-900">{dashboard.pendingOrders}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Active Bookings</p>
          <p className="text-3xl font-serif text-primary-900">{dashboard.activeBookings}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Total Guests</p>
          <p className="text-3xl font-serif text-primary-900">{dashboard.totalGuests}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
        <h3 className="text-lg font-serif text-primary-900 mb-6">Yearly Revenue</h3>
        {!revenueBars.length ? (
          <p className="text-primary-600">No revenue data available.</p>
        ) : (
          <>
            <div className="flex items-end gap-2 h-52 border-b border-primary-200 pb-4">
              {revenueBars.map((bar) => (
                <div key={bar.label} className="flex-1 min-w-0 flex flex-col h-full">
                  <div className="flex-1 flex items-end">
                    <div
                      className="w-full bg-primary-500 rounded-t-md hover:bg-primary-400 transition-colors"
                      style={{ height: `${bar.height}%` }}
                      title={`${bar.label}: ${formatCurrency(bar.revenue)} (${bar.bookings} bookings)`}
                    />
                  </div>
                  <p className="text-xs text-primary-600 mt-2 text-center truncate shrink-0">{bar.label}</p>
                  {bar.revenue > 0 && (
                    <p className="text-[10px] text-primary-700 text-center truncate shrink-0">{formatCurrency(bar.revenue)}</p>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-primary-600 mt-4">
              Total: {formatCurrency(toSafeNumber(revenue?.totalRevenue))} · {toSafeNumber(revenue?.totalBookings)} bookings ·{' '}
              {toSafeNumber(revenue?.totalNights)} nights
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-serif text-primary-900 mb-4">Recent Pending Orders</h3>
          {recentPending.length === 0 ? (
            <p className="text-primary-600 text-sm">No pending orders.</p>
          ) : (
            <div className="space-y-3">
              {recentPending.map((order) => (
                <div
                  key={order.orderId}
                  className="flex justify-between items-center pb-3 border-b border-primary-100 last:border-0"
                >
                  <div>
                    <p className="text-primary-900 font-medium">{order.guestName}</p>
                    <p className="text-sm text-primary-600">
                      {formatDate(order.checkInDate)} - {formatDate(order.checkOutDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary-900 font-medium">{formatCurrency(order.totalAmount)}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-serif text-primary-900 mb-4">Upcoming Check-ins</h3>
          {upcomingCheckIns.length === 0 ? (
            <p className="text-primary-600 text-sm">No upcoming check-ins.</p>
          ) : (
            <div className="space-y-3">
              {upcomingCheckIns.map((order) => (
                <div
                  key={order.orderId}
                  className="flex justify-between items-center pb-3 border-b border-primary-100 last:border-0"
                >
                  <div>
                    <p className="text-primary-900 font-medium">{order.guestName}</p>
                    <p className="text-sm text-primary-600">Check-in: {formatDate(order.checkInDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-primary-900">{order.nightCount} nights</p>
                    <p className="text-xs text-primary-600">{order.orderId}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
