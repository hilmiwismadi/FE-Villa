export interface Villa {
  id: string;
  name: string;
  description: string;
  location: string;
  images: string[];
  amenities: string[];
  capacity: number;
  basePrice: number;
}

export interface DateRange {
  checkIn: Date | null;
  checkOut: Date | null;
}

export interface PricingRule {
  id: string;
  type: 'base' | 'date-specific' | 'recurring';
  price: number;
  startDate?: Date;
  endDate?: Date;
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
  label?: string;
}

export interface PromoCode {
  code: string;
  discountPercentage: number; // Legacy field for backward compatibility
  affiliateId?: string;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;

  // New fields from API response (GET /promo/validate)
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  dayCondition?: 'all' | 'weekday' | 'weekend' | 'custom';
  customDays?: number[] | null;
  type?: 'affiliate' | 'automatic' | 'general';
  label?: string;
  rules?: PromoRule[] | null;
  stackable?: boolean;
}

export interface PromoRule {
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  dayCondition: 'all' | 'weekday' | 'weekend' | 'custom';
  customDays?: number[] | null;
}

export interface GuestInfo {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone: string;
  idNumber?: string;
  numberOfGuests?: number | string;
  specialRequests?: string;
  address?: string;
  city?: string;
  province?: string;
  extraBed?: number | string; // string from select, converted to number for API
  checkInTime?: string;
  // Fields from Order API response
  orderId?: string;
  totalAmount?: number;
  paymentDeadline?: string | null;
}

export interface BookingSummary {
  dates: DateRange;
  numberOfNights: number;
  originalPrice: number;
  promoCode?: string;
  discountAmount: number;
  finalPrice: number;
  guestInfo: GuestInfo;
}

export interface PaymentProof {
  file?: File;
  imageUrl?: string;
  transferDate: Date;
  transferAmount: number;
  uploadDate?: Date;
  amount?: number;
}

export interface Booking {
  id: string;
  bookingReference?: string;
  villa?: Villa;
  dates?: DateRange;
  dateRange?: {
    start: Date;
    end: Date;
  };
  guestInfo: GuestInfo;
  pricing: {
    originalPrice?: number;
    basePrice?: number;
    numNights?: number;
    subtotal?: number;
    discount?: number;
    discountAmount?: number;
    finalPrice?: number;
    total?: number;
    promoCode?: string;
  };
  paymentProof?: PaymentProof;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt?: Date;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  status: 'available' | 'booked' | 'blocked' | 'in_transaction';
  price?: number;
  source?: string;
  label?: string | null;
  customPriceLabel?: string | null;
  pricingLabel?: string | null;
  priceSource?: 'default' | 'custom_onetime' | 'custom_weekly' | 'none';
  blockReason?: string | null;
}

export interface CalendarDate {
  date: Date;
  status: 'available' | 'booked' | 'blocked';
  price?: number;
  bookingId?: string;
}
