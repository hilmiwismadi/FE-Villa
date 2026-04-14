export const affiliatorInfo = {
  id: 'AFF001',
  name: 'TravelBlogger123',
  email: 'travelblogger@example.com',
  joinDate: new Date('2024-06-01'),
  commissionRate: 15,
  status: 'active',
};

export const promoCodes = [
  {
    code: 'TRAVEL10',
    discount: 10,
    type: 'percentage' as const,
    totalUses: 5,
    totalRevenue: 112500000,
    commission: 16875000,
    createdDate: new Date('2024-06-15'),
    status: 'active' as const,
  },
  {
    code: 'SUMMERESCAPE',
    discount: 15,
    type: 'percentage' as const,
    totalUses: 3,
    totalRevenue: 63750000,
    commission: 9562500,
    createdDate: new Date('2024-11-01'),
    status: 'active' as const,
  },
];

export const bookingsUsingCode = [
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
    status: 'confirmed' as const,
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
    status: 'confirmed' as const,
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
    status: 'pending' as const,
    bookingDate: new Date('2025-02-10'),
  },
];

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
