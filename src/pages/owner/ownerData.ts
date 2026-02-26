import type { Booking } from '../../types';

// Shared utility functions
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Mock data
export const initialPendingBookings: Booking[] = [
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
      transferAmount: 22500000,
    },
    status: 'pending',
    createdAt: new Date('2025-03-01'),
  },
];

export const initialActiveBookings: Booking[] = [
  {
    id: 'BK002',
    dateRange: { start: new Date('2025-01-10'), end: new Date('2025-01-15') },
    guestInfo: { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@example.com', phone: '+1234567891', specialRequests: '' },
    pricing: { basePrice: 5000000, numNights: 5, subtotal: 25000000, discount: 0, total: 25000000 },
    status: 'confirmed',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'BK007',
    dateRange: { start: new Date('2025-01-20'), end: new Date('2025-01-27') },
    guestInfo: { firstName: 'Robert', lastName: 'Martinez', email: 'robert.m@example.com', phone: '+1234567895', specialRequests: 'Celebrating anniversary' },
    pricing: { basePrice: 5000000, numNights: 7, subtotal: 35000000, discount: 3500000, total: 31500000 },
    status: 'confirmed',
    createdAt: new Date('2025-01-05'),
  },
  {
    id: 'BK008',
    dateRange: { start: new Date('2025-02-01'), end: new Date('2025-02-05') },
    guestInfo: { firstName: 'Lisa', lastName: 'Anderson', email: 'lisa.a@example.com', phone: '+1234567896', specialRequests: 'Vegetarian meals preferred' },
    pricing: { basePrice: 5000000, numNights: 4, subtotal: 20000000, discount: 0, total: 20000000 },
    status: 'confirmed',
    createdAt: new Date('2025-01-15'),
  },
];

export const initialPreviousBookings: Booking[] = [
  {
    id: 'BK003',
    dateRange: { start: new Date('2024-12-20'), end: new Date('2024-12-27') },
    guestInfo: { firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@example.com', phone: '+1234567892', specialRequests: '' },
    pricing: { basePrice: 5000000, numNights: 7, subtotal: 35000000, discount: 3500000, total: 31500000 },
    status: 'completed',
    createdAt: new Date('2024-12-10'),
  },
  {
    id: 'BK004',
    dateRange: { start: new Date('2024-11-15'), end: new Date('2024-11-20') },
    guestInfo: { firstName: 'Emily', lastName: 'Davis', email: 'emily.d@example.com', phone: '+1234567893', specialRequests: '' },
    pricing: { basePrice: 5000000, numNights: 5, subtotal: 25000000, discount: 2500000, total: 22500000 },
    status: 'completed',
    createdAt: new Date('2024-11-01'),
  },
];

export const initialApprovedBookings: Booking[] = [
  {
    id: 'BK005',
    dateRange: { start: new Date('2025-02-10'), end: new Date('2025-02-15') },
    guestInfo: { firstName: 'David', lastName: 'Wilson', email: 'david.w@example.com', phone: '+1234567894', specialRequests: '' },
    pricing: { basePrice: 5000000, numNights: 5, subtotal: 25000000, discount: 0, total: 25000000 },
    status: 'confirmed',
    createdAt: new Date('2025-01-05'),
  },
  {
    id: 'BK006',
    dateRange: { start: new Date('2025-02-20'), end: new Date('2025-02-25') },
    guestInfo: { firstName: 'Jennifer', lastName: 'Brown', email: 'jennifer.b@example.com', phone: '+1234567897', specialRequests: 'Birthday celebration' },
    pricing: { basePrice: 5000000, numNights: 5, subtotal: 25000000, discount: 2500000, total: 22500000 },
    status: 'confirmed',
    createdAt: new Date('2025-02-01'),
  },
  {
    id: 'BK009',
    dateRange: { start: new Date('2025-03-05'), end: new Date('2025-03-10') },
    guestInfo: { firstName: 'Thomas', lastName: 'Lee', email: 'thomas.l@example.com', phone: '+1234567898', specialRequests: '' },
    pricing: { basePrice: 5000000, numNights: 5, subtotal: 25000000, discount: 0, total: 25000000 },
    status: 'confirmed',
    createdAt: new Date('2025-02-15'),
  },
];

export const initialBlockedDates: Date[] = [
  new Date('2025-01-28'),
  new Date('2025-01-29'),
  new Date('2025-01-30'),
];

export const BASE_PRICE = 5000000;
export const WEEKEND_MULTIPLIER = 1.3;

export const initialSpecialDates = [
  { id: 1, name: 'New Year 2025', startDate: new Date('2025-01-01'), endDate: new Date('2025-01-01'), price: 10000000, type: 'holiday' },
  { id: 2, name: 'Chinese New Year', startDate: new Date('2025-01-29'), endDate: new Date('2025-01-31'), price: 8000000, type: 'holiday' },
  { id: 3, name: 'Valentine Week', startDate: new Date('2025-02-14'), endDate: new Date('2025-02-16'), price: 7000000, type: 'special' },
  { id: 4, name: 'Easter Weekend', startDate: new Date('2025-04-18'), endDate: new Date('2025-04-21'), price: 7500000, type: 'holiday' },
  { id: 5, name: 'Summer Peak Season', startDate: new Date('2025-07-01'), endDate: new Date('2025-08-31'), price: 6500000, type: 'season' },
  { id: 6, name: 'Christmas & New Year', startDate: new Date('2025-12-24'), endDate: new Date('2026-01-05'), price: 12000000, type: 'holiday' },
];

export const initialPromoCodes = [
  { code: 'TRAVEL10', discount: 10, type: 'percentage', affiliate: 'TravelBlogger123', uses: 5 },
  { code: 'SUMMER25', discount: 25, type: 'percentage', affiliate: 'SummerVibes', uses: 2 },
];

export const initialUsers = [
  { id: 'U001', name: 'John Doe', email: 'john.doe@example.com', phone: '+1234567890', totalBookings: 1, bookingIds: ['BK001'], totalSpent: 22500000, lastBooking: new Date('2025-03-01') },
  { id: 'U002', name: 'Sarah Johnson', email: 'sarah.j@example.com', phone: '+1234567891', totalBookings: 1, bookingIds: ['BK002'], totalSpent: 25000000, lastBooking: new Date('2025-01-10') },
  { id: 'U003', name: 'Michael Chen', email: 'michael.chen@example.com', phone: '+1234567892', totalBookings: 1, bookingIds: ['BK003'], totalSpent: 31500000, lastBooking: new Date('2024-12-20') },
  { id: 'U004', name: 'Emily Davis', email: 'emily.d@example.com', phone: '+1234567893', totalBookings: 1, bookingIds: ['BK004'], totalSpent: 22500000, lastBooking: new Date('2024-11-15') },
  { id: 'U005', name: 'David Wilson', email: 'david.w@example.com', phone: '+1234567894', totalBookings: 1, bookingIds: ['BK005'], totalSpent: 25000000, lastBooking: new Date('2025-02-10') },
  { id: 'U006', name: 'Robert Martinez', email: 'robert.m@example.com', phone: '+1234567895', totalBookings: 1, bookingIds: ['BK007'], totalSpent: 31500000, lastBooking: new Date('2025-01-20') },
  { id: 'U007', name: 'Lisa Anderson', email: 'lisa.a@example.com', phone: '+1234567896', totalBookings: 1, bookingIds: ['BK008'], totalSpent: 20000000, lastBooking: new Date('2025-02-01') },
  { id: 'U008', name: 'Jennifer Brown', email: 'jennifer.b@example.com', phone: '+1234567897', totalBookings: 1, bookingIds: ['BK006'], totalSpent: 22500000, lastBooking: new Date('2025-02-20') },
  { id: 'U009', name: 'Thomas Lee', email: 'thomas.l@example.com', phone: '+1234567898', totalBookings: 1, bookingIds: ['BK009'], totalSpent: 25000000, lastBooking: new Date('2025-03-05') },
];

export const analytics = {
  currentRevenue: 76500000,
  thisMonthRevenue: 56500000,
  thisMonthBookings: 2,
  thisMonthBookingPercentage: 15,
  ytdRevenue: 171500000,
  totalBookings: 9,
  averageBookingValue: 25000000,
};
