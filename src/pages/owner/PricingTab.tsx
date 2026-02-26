import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, startOfWeek, endOfWeek } from 'date-fns';
import {
  formatCurrency,
  formatDate,
  BASE_PRICE,
  WEEKEND_MULTIPLIER,
  initialSpecialDates,
} from './ownerData';

const PricingTab: React.FC = () => {
  const [pricingMonth, setPricingMonth] = useState(new Date(2025, 0, 1));
  const [basePrice] = useState(BASE_PRICE);
  const [weekendMultiplier] = useState(WEEKEND_MULTIPLIER);
  const [specialDates] = useState(initialSpecialDates);

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
    const specialDate = specialDates.find(sd => date >= sd.startDate && date <= sd.endDate);
    if (specialDate) return specialDate.price;
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return Math.round(basePrice * weekendMultiplier);
    return basePrice;
  };

  const getPriceType = (date: Date) => {
    const specialDate = specialDates.find(sd => date >= sd.startDate && date <= sd.endDate);
    if (specialDate) return specialDate.type;
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return 'weekend';
    return 'base';
  };

  const previousPricingMonth = () => {
    setPricingMonth(new Date(pricingMonth.getFullYear(), pricingMonth.getMonth() - 1, 1));
  };

  const nextPricingMonth = () => {
    setPricingMonth(new Date(pricingMonth.getFullYear(), pricingMonth.getMonth() + 1, 1));
  };

  return (
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
            <div className="grid grid-cols-7 bg-primary-50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-primary-700 border-r border-primary-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

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
  );
};

export default PricingTab;
