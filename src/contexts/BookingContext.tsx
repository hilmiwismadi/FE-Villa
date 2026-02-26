import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { DateRange, GuestInfo, PromoCode } from '../types';

interface BookingContextType {
  dateRange: DateRange;
  setDateRange: (dates: DateRange) => void;
  selectedDates: Date[];
  setSelectedDates: (dates: Date[]) => void;
  guestInfo: GuestInfo | null;
  setGuestInfo: (info: GuestInfo) => void;
  formData: GuestInfo;
  setFormData: (data: GuestInfo) => void;
  promoCode: string;
  setPromoCode: (code: string) => void;
  appliedPromo: PromoCode | null;
  setAppliedPromo: (promo: PromoCode | null) => void;
  pricing: {
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
  };
  setPricing: (pricing: { originalPrice: number; discountAmount: number; finalPrice: number }) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

const STORAGE_KEY = 'villa-sekipan-booking';

const defaultFormData: GuestInfo = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  province: '',
  numberOfGuests: 1,
  extraBed: 0,
  checkInTime: '',
  specialRequests: '',
};

function loadFromStorage() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Rehydrate dates
    if (data.dateRange?.checkIn) data.dateRange.checkIn = new Date(data.dateRange.checkIn);
    if (data.dateRange?.checkOut) data.dateRange.checkOut = new Date(data.dateRange.checkOut);
    if (data.selectedDates) data.selectedDates = data.selectedDates.map((d: string) => new Date(d));
    if (data.appliedPromo?.validFrom) data.appliedPromo.validFrom = new Date(data.appliedPromo.validFrom);
    if (data.appliedPromo?.validUntil) data.appliedPromo.validUntil = new Date(data.appliedPromo.validUntil);
    return data;
  } catch {
    return null;
  }
}

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const saved = loadFromStorage();

  const [dateRange, setDateRange] = useState<DateRange>(saved?.dateRange ?? { checkIn: null, checkOut: null });
  const [selectedDates, setSelectedDates] = useState<Date[]>(saved?.selectedDates ?? []);
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(saved?.guestInfo ?? null);
  const [formData, setFormData] = useState<GuestInfo>(saved?.formData ?? defaultFormData);
  const [promoCode, setPromoCode] = useState<string>(saved?.promoCode ?? '');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(saved?.appliedPromo ?? null);
  const [pricing, setPricing] = useState(saved?.pricing ?? {
    originalPrice: 0,
    discountAmount: 0,
    finalPrice: 0,
  });

  // Persist to sessionStorage on every change
  useEffect(() => {
    const data = { dateRange, selectedDates, guestInfo, formData, promoCode, appliedPromo, pricing };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [dateRange, selectedDates, guestInfo, formData, promoCode, appliedPromo, pricing]);

  const resetBooking = () => {
    setDateRange({ checkIn: null, checkOut: null });
    setSelectedDates([]);
    setGuestInfo(null);
    setFormData(defaultFormData);
    setPromoCode('');
    setAppliedPromo(null);
    setPricing({ originalPrice: 0, discountAmount: 0, finalPrice: 0 });
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <BookingContext.Provider
      value={{
        dateRange,
        setDateRange,
        selectedDates,
        setSelectedDates,
        guestInfo,
        setGuestInfo,
        formData,
        setFormData,
        promoCode,
        setPromoCode,
        appliedPromo,
        setAppliedPromo,
        pricing,
        setPricing,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
