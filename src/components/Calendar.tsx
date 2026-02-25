import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isBefore, startOfToday, addMonths, subMonths } from 'date-fns';

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDates?: { checkIn: Date | null; checkOut: Date | null };
  /** Array of individually selected dates (used when multiSelect is true) */
  selectedDatesList?: Date[];
  /** Called when a date is toggled in multiSelect mode */
  onDateToggle?: (dates: Date[]) => void;
  bookedDates?: Date[];
  blockedDates?: Date[];
  readOnly?: boolean;
  /** Enable click-to-toggle individual dates mode */
  multiSelect?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect, selectedDates = { checkIn: null, checkOut: null }, selectedDatesList = [], onDateToggle, bookedDates = [], blockedDates = [], readOnly = false, multiSelect = false }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = startOfToday();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = monthStart.getDay();

  // Fill in empty days at the start of the month
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate =>
      format(bookedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const isDateBlocked = (date: Date) => {
    return blockedDates.some(blockedDate =>
      format(blockedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const isDateInMultiSelect = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return selectedDatesList.some(d => format(d, 'yyyy-MM-dd') === dateStr);
  };

  const isDateSelected = (date: Date) => {
    if (multiSelect) return isDateInMultiSelect(date);
    if (!selectedDates.checkIn && !selectedDates.checkOut) return false;

    const dateStr = format(date, 'yyyy-MM-dd');
    const checkInStr = selectedDates.checkIn ? format(selectedDates.checkIn, 'yyyy-MM-dd') : null;
    const checkOutStr = selectedDates.checkOut ? format(selectedDates.checkOut, 'yyyy-MM-dd') : null;

    return dateStr === checkInStr || dateStr === checkOutStr;
  };

  const isDateInRange = (date: Date) => {
    if (multiSelect) {
      if (selectedDatesList.length < 2) return false;
      const sorted = [...selectedDatesList].sort((a, b) => a.getTime() - b.getTime());
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      return date > first && date < last && !isDateInMultiSelect(date);
    }
    if (!selectedDates.checkIn || !selectedDates.checkOut) return false;
    return date > selectedDates.checkIn && date < selectedDates.checkOut;
  };

  const handleDateClick = (date: Date) => {
    if (isBefore(date, today) || isDateBooked(date) || isDateBlocked(date)) {
      return;
    }

    if (multiSelect && onDateToggle) {
      const dateStr = format(date, 'yyyy-MM-dd');
      const exists = selectedDatesList.some(d => format(d, 'yyyy-MM-dd') === dateStr);
      if (exists) {
        onDateToggle(selectedDatesList.filter(d => format(d, 'yyyy-MM-dd') !== dateStr));
      } else {
        onDateToggle([...selectedDatesList, date]);
      }
      return;
    }

    if (onDateSelect) onDateSelect(date);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="bg-white border border-primary-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-primary-100 rounded transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5 text-primary-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h3 className="text-lg font-serif text-primary-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-primary-100 rounded transition-colors"
          aria-label="Next month"
        >
          <svg className="w-5 h-5 text-primary-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-primary-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before month starts */}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square"></div>
        ))}

        {/* Days of the month */}
        {daysInMonth.map(date => {
          const isPast = isBefore(date, today) && !isToday(date);
          const booked = isDateBooked(date);
          const blocked = isDateBlocked(date);
          const selected = isDateSelected(date);
          const inRange = isDateInRange(date);
          const disabled = isPast || booked || blocked;

          if (readOnly) {
            return (
              <div
                key={date.toString()}
                className={`
                  aspect-square flex items-center justify-center text-sm rounded transition-all
                  ${disabled ? 'text-primary-300' : 'text-primary-900'}
                  ${isToday(date) ? 'border-2 border-gold-600' : ''}
                  ${booked || blocked ? 'bg-red-50 line-through' : ''}
                `}
              >
                {format(date, 'd')}
              </div>
            );
          }

          return (
            <button
              key={date.toString()}
              onClick={() => handleDateClick(date)}
              disabled={disabled}
              className={`
                aspect-square flex items-center justify-center text-sm rounded transition-all
                ${disabled ? 'text-primary-300 cursor-not-allowed' : 'text-primary-900 hover:bg-primary-100 cursor-pointer'}
                ${selected ? 'bg-primary-900 text-white hover:bg-primary-900' : ''}
                ${inRange ? 'bg-primary-100' : ''}
                ${isToday(date) && !selected ? 'border-2 border-gold-600' : ''}
                ${booked || blocked ? 'bg-red-50 line-through' : ''}
              `}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs text-primary-700">
        {!readOnly && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary-900 rounded"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary-100 rounded"></div>
              <span>In Range</span>
            </div>
          </>
        )}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-50 rounded border border-red-200"></div>
          <span>Unavailable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-gold-600"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
