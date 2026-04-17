import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { CalendarDay } from '../../types';
import { createAdminBlockedDate, getCalendar } from '../../services/orderService';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`));

const statusConfig: Record<string, string> = {
  available: 'bg-green-50',
  booked: 'bg-blue-50',
  blocked: 'bg-red-50',
  in_transaction: 'bg-amber-50',
};

const CalendarTab: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [blockDate, setBlockDate] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const monthParam = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

  const loadCalendar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCalendar(monthParam);
      setDays(response.days);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, [monthParam]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const previousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const gridDays = useMemo(() => {
    const firstDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    return {
      leadingEmptyCells: Array.from({ length: firstDayOfWeek }),
      monthDays: days,
    };
  }, [currentMonth, days]);

  const handleBlockDate = async () => {
    if (!blockDate || !blockReason.trim()) {
      return;
    }
    try {
      setSubmitting(true);
      await createAdminBlockedDate(blockDate, blockReason.trim());
      setBlockDate('');
      setBlockReason('');
      await loadCalendar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to block date');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif text-primary-900">Booking Calendar</h2>
        <div className="flex items-center gap-4">
          <button onClick={previousMonth} className="p-2 hover:bg-primary-100 rounded" aria-label="Previous month">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-medium text-primary-900 min-w-[200px] text-center">
            {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-primary-100 rounded" aria-label="Next month">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
          <span className="text-primary-700">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded" />
          <span className="text-primary-700">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />
          <span className="text-primary-700">Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-100 border border-amber-300 rounded" />
          <span className="text-primary-700">In Transaction</span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-primary-600">Loading calendar...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-lg p-8 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 bg-primary-50">
            {DAY_NAMES.map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-primary-700 border-r border-primary-200 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 border-t border-primary-200">
            {gridDays.leadingEmptyCells.map((_, index) => (
              <div key={`empty-${index}`} className="min-h-[92px] bg-primary-25 border-r border-primary-100" />
            ))}
            {gridDays.monthDays.map((day) => {
              const dayNumber = new Date(`${day.date}T00:00:00`).getDate();
              return (
                <button
                  type="button"
                  key={day.date}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[92px] p-2 border-r border-b border-primary-100 text-left hover:bg-primary-100 transition-colors ${
                    statusConfig[day.status] || 'bg-white'
                  }`}
                  title={day.label || day.status}
                >
                  <div className="text-sm font-medium text-primary-900 mb-1">{dayNumber}</div>
                  <div className="text-xs text-primary-700">{formatCurrency(day.price ?? 0)}</div>
                  {day.label ? (
                    <div className="text-[10px] text-primary-600 truncate mt-1">{day.label}</div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedDay ? (
        <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-serif text-primary-900 mb-4">Day Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <p>
              <span className="text-primary-600">Date:</span> <span className="text-primary-900">{formatDate(selectedDay.date)}</span>
            </p>
            <p>
              <span className="text-primary-600">Status:</span> <span className="text-primary-900">{selectedDay.status}</span>
            </p>
            <p>
              <span className="text-primary-600">Price:</span> <span className="text-primary-900">{formatCurrency(selectedDay.price ?? 0)}</span>
            </p>
            <p>
              <span className="text-primary-600">Price Source:</span>{' '}
              <span className="text-primary-900">{selectedDay.priceSource || '-'}</span>
            </p>
            {selectedDay.label ? (
              <p className="md:col-span-2">
                <span className="text-primary-600">Label:</span> <span className="text-primary-900">{selectedDay.label}</span>
              </p>
            ) : null}
            {selectedDay.blockReason ? (
              <p className="md:col-span-2">
                <span className="text-primary-600">Block Reason:</span>{' '}
                <span className="text-red-700">{selectedDay.blockReason}</span>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-8 bg-white rounded-lg p-6">
        <h3 className="text-lg font-serif text-primary-900 mb-4">Block Date</h3>
        <p className="text-sm text-primary-600 mb-4">Add a blocked date for maintenance or private usage.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">Date</label>
            <input
              type="date"
              className="input-field"
              value={blockDate}
              onChange={(e) => setBlockDate(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary-700 mb-2">Reason</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., Maintenance"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
            />
          </div>
        </div>
        <button
          type="button"
          className="btn-primary mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleBlockDate}
          disabled={submitting || !blockDate || !blockReason.trim()}
        >
          {submitting ? 'Saving...' : 'Block Date'}
        </button>
      </div>
    </div>
  );
};

export default CalendarTab;
