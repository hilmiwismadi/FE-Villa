import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isBefore, startOfToday, addMonths, subMonths, parse } from 'date-fns';
import { useTranslation } from '../i18n/LanguageContext';
import type { CalendarDay } from '../types';

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDates?: { checkIn: Date | null; checkOut: Date | null };
  /** Array of individually selected dates (used when multiSelect is true) */
  selectedDatesList?: Date[];
  /** Called when a date is toggled in multiSelect mode */
  onDateToggle?: (dates: Date[]) => void;
  /** Called when a date is clicked in multiSelect mode - passes raw clicked date for parent to handle logic */
  onDateClickInMultiSelect?: (date: Date) => void;
  bookedDates?: Date[];
  blockedDates?: Date[];
  readOnly?: boolean;
  /** Enable click-to-toggle individual dates mode */
  multiSelect?: boolean;
  /** Initial month (YYYY-MM string) - used to sync calendar state with parent */
  defaultMonth?: string;
  /** Calendar data from API (optional - if provided, backend data is used) */
  calendarData?: CalendarDay[];
  /** Callback when month changes (for API fetching) */
  onMonthChange?: (month: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  onDateSelect,
  selectedDates = { checkIn: null, checkOut: null },
  selectedDatesList = [],
  onDateToggle,
  onDateClickInMultiSelect,
  bookedDates = [],
  blockedDates = [],
  readOnly = false,
  multiSelect = false,
  defaultMonth,
  calendarData,
  onMonthChange
}) => {
  const [currentMonth, setCurrentMonth] = useState(defaultMonth ? parse(defaultMonth, 'yyyy-MM', new Date()) : new Date());
  const today = startOfToday();
  const { t, dateFnsLocale } = useTranslation();

  // Map calendar data to unavailable dates
  const getBookedDatesFromAPI = (): Date[] => {
    if (!calendarData) return [];
    return calendarData
      .filter(day => day.status === 'booked' || day.status === 'in_transaction')
      .map(day => parse(day.date, 'yyyy-MM-dd', new Date()));
  };

  const getBlockedDatesFromAPI = (): Date[] => {
    if (!calendarData) return [];
    return calendarData
      .filter(day => day.status === 'blocked')
      .map(day => parse(day.date, 'yyyy-MM-dd', new Date()));
  };

  // Combine API data with props data
  const effectiveBookedDates = [...bookedDates, ...getBookedDatesFromAPI()];
  const effectiveBlockedDates = [...blockedDates, ...getBlockedDatesFromAPI()];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = monthStart.getDay();

  // Fill in empty days at start of month
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const isDateBooked = (date: Date) => {
    return effectiveBookedDates.some(bookedDate =>
      format(bookedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const isDateBlocked = (date: Date) => {
    return effectiveBlockedDates.some(blockedDate =>
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
    console.log('[[Calendar handleDateClick] date clicked:', format(date, 'yyyy-MM-dd'), 'multiSelect:', multiSelect);

    if (isBefore(date, today) || isDateBooked(date) || isDateBlocked(date)) {
      console.log('[Calendar handleDateClick] date is before today or booked/blocked, returning');
      return;
    }

    // When multiSelect and onDateClickInMultiSelect is provided, pass date to parent
    // Parent handles all contiguous logic
    if (multiSelect && onDateClickInMultiSelect) {
      console.log('[Calendar handleDateClick] calling onDateClickInMultiSelect');
      onDateClickInMultiSelect(date);
      return;
    }

    // Fallback to onDateToggle if provided (works in both multiSelect and non-multiSelect modes)
    if (onDateToggle) {
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

  const nextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    if (onMonthChange) {
      onMonthChange(format(newMonth, 'yyyy-MM'));
    }
  };

  const prevMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    if (onMonthChange) {
      onMonthChange(format(newMonth, 'yyyy-MM'));
    }
  };

  return (
    <div className="bg-white border border-primary-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-primary-100 rounded transition-colors"
          aria-label={t.calendar.prevMonth}
        >
          <svg className="w-5 h-5 text-primary-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7 7" />
          </svg>
        </button>

        <h3 className="text-lg font-serif text-primary-900">
          {format(currentMonth, 'MMMM yyyy', { locale: dateFnsLocale })}
        </h3>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-primary-100 rounded transition-colors"
          aria-label={t.calendar.nextMonth}
        >
          <svg className="w-5 h-5 text-primary-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7" />
          </svg>
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {t.calendar.dayNames.map(day => (
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

        {/* Days of month */}
        {daysInMonth.map(date => {
          const isPast = isBefore(date, today) && !isToday(date);
          const booked = isDateBooked(date);
          const blocked = isDateBlocked(date);
          const selected = isDateSelected(date);
          const inRange = isDateInRange(date);
          const disabled = isPast || booked || blocked;

          // Get price from API data
          const dateStr = format(date, 'yyyy-MM-dd');
          const dayData = calendarData?.find(d => d.date === dateStr);
          const price = dayData?.price;

          if (readOnly) {
            return (
              <div
                key={date.toString()}
                className={`
                  aspect-square flex flex-col items-center justify-center text-sm rounded transition-all
                  ${disabled ? 'text-primary-300' : 'text-primary-900'}
                  ${isToday(date) ? 'border-2 border-gold-600' : ''}
                  ${booked || blocked ? 'bg-red-50 line-through' : ''}
                `}
              >
                <span>{format(date, 'd')}</span>
                {price && !disabled && (
                  <span className="text-xs text-primary-500 mt-1">
                    {(price / 1000000).toFixed(1)}jt
                  </span>
                )}
              </div>
            );
          }

          return (
            <button
              key={date.toString()}
              onClick={() => handleDateClick(date)}
              disabled={disabled}
              className={`
                aspect-square flex flex-col items-center justify-center text-sm rounded transition-all
                ${disabled ? 'text-primary-300 cursor-not-allowed' : 'text-primary-900 hover:bg-primary-100 cursor-pointer'}
                ${selected ? 'bg-primary-900 text-white hover:bg-primary-900' : ''}
                ${inRange ? 'bg-primary-100' : ''}
                ${isToday(date) && !selected ? 'border-2 border-gold-600' : ''}
                ${booked || blocked ? 'bg-red-50 line-through' : ''}
              `}
            >
              <span>{format(date, 'd')}</span>
              {price && !disabled && (
                <span className="text-xs mt-1">
                  {(price / 1000000).toFixed(1)}jt
                </span>
              )}
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
              <span>{t.calendar.selected}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary-100 rounded"></div>
              <span>{t.calendar.inRange}</span>
            </div>
          </>
        )}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-50 rounded border border-red-200"></div>
          <span>{t.calendar.unavailable}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-gold-600"></div>
          <span>{t.calendar.today}</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
