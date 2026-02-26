import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import {
  initialPendingBookings,
  initialActiveBookings,
  initialApprovedBookings,
  initialBlockedDates,
} from './ownerData';

const CalendarTab: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 0, 1));
  const [pendingBookings] = useState(initialPendingBookings);
  const [activeBookings] = useState(initialActiveBookings);
  const [approvedBookings] = useState(initialApprovedBookings);
  const [blockedDates] = useState(initialBlockedDates);

  const getAllBookedDates = () => {
    const allBookings = [...pendingBookings, ...activeBookings, ...approvedBookings];
    const bookedDates: Date[] = [];
    allBookings.forEach(booking => {
      if (booking.dateRange) {
        const dates = eachDayOfInterval({ start: booking.dateRange.start, end: booking.dateRange.end });
        bookedDates.push(...dates);
      }
    });
    return bookedDates;
  };

  const isDateBooked = (date: Date) => {
    return getAllBookedDates().some(bookedDate => isSameDay(bookedDate, date));
  };

  const isDateBlocked = (date: Date) => {
    return blockedDates.some(blockedDate => isSameDay(blockedDate, date));
  };

  const getBookingForDate = (date: Date) => {
    const allBookings = [...pendingBookings, ...activeBookings, ...approvedBookings];
    return allBookings.find(booking => {
      if (!booking.dateRange) return false;
      return date >= booking.dateRange.start && date <= booking.dateRange.end;
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

  return (
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
        <div className="grid grid-cols-7 bg-primary-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-primary-700 border-r border-primary-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

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
  );
};

export default CalendarTab;
