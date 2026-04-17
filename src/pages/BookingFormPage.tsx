import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useBooking } from '../contexts/BookingContext';
import { useTranslation } from '../i18n/LanguageContext';
import { validatePromo as promoValidatePromo, ApiError } from '../services/promoService';

const normalizePhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return digits;
  if (digits.startsWith('62')) return `0${digits.slice(2)}`;
  if (digits.startsWith('8')) return `0${digits}`;
  return digits;
};

const isValidPhoneNumber = (value: string) => /^08\d{8,13}$/.test(value);

const BookingFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, localePath, lang } = useTranslation();
  const {
    selectedDates,
    formData,
    setFormData,
    setGuestInfo,
    guestInfo,
    pricing,
    appliedPromo,
    setAppliedPromo,
    promoCode,
    setPromoCode,
    dateRange,
  } = useBooking();

  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(appliedPromo ? `${appliedPromo.discountPercentage}% ${t.booking.calendar.discountApplied}` : '');
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // City/Province autocomplete states
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [provinceSuggestions, setProvinceSuggestions] = useState<string[]>([]);
  const [showProvinceSuggestions, setShowProvinceSuggestions] = useState(false);

  // Guest count range popup state
  const [showGuestCountPopup, setShowGuestCountPopup] = useState(false);
  const [guestCountPopupValue, setGuestCountPopupValue] = useState<number>(26);
  const [guestCountPopupError, setGuestCountPopupError] = useState('');

  // Indonesian provinces data
  const provinces = [
    'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi', 'Sumatera Selatan', 'Bengkulu',
    'Lampung', 'Kepulauan Bangka Belitung', 'Kepulauan Riau', 'DKI Jakarta', 'Jawa Barat',
    'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Banten', 'Bali', 'Nusa Tenggara Barat',
    'Nusa Tenggara Timur', 'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan',
    'Kalimantan Timur', 'Kalimantan Utara', 'Sulawesi Utara', 'Sulawesi Tengah',
    'Sulawesi Selatan', 'Sulawesi Tenggara', 'Gorontalo', 'Sulawesi Barat', 'Maluku',
    'Maluku Utara', 'Papua', 'Papua Barat', 'Papua Tengah', 'Papua Selatan', 'Papua Pegunungan'
  ];

  // Major Indonesian cities organized by province
  const citiesByProvince: Record<string, string[]> = {
    'Aceh': ['Banda Aceh', 'Sabang', 'Langsa', 'Lhokseumawe'],
    'Sumatera Utara': ['Medan', 'Binjai', 'Pematang Siantar', 'Tebing Tinggi'],
    'Sumatera Barat': ['Padang', 'Bukittinggi', 'Payakumbuh', 'Pariaman'],
    'Riau': ['Pekanbaru', 'Dumai'],
    'Jambi': ['Jambi', 'Sungai Penuh'],
    'Sumatera Selatan': ['Palembang', 'Prabumulih', 'Pagar Alam'],
    'Bengkulu': ['Bengkulu'],
    'Lampung': ['Bandar Lampung', 'Metro'],
    'Kepulauan Bangka Belitung': ['Pangkalpinang'],
    'Kepulauan Riau': ['Batam', 'Tanjung Pinang'],
    'DKI Jakarta': ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara'],
    'Jawa Barat': ['Bandung', 'Bekasi', 'Bogor', 'Depok', 'Cirebon', 'Sukabumi', 'Tasikmalaya'],
    'Jawa Tengah': ['Semarang', 'Solo', 'Magelang', 'Pekalongan', 'Tegal', 'Salatiga'],
    'DI Yogyakarta': ['Yogyakarta', 'Sleman', 'Bantul'],
    'Jawa Timur': ['Surabaya', 'Malang', 'Madiun', 'Kediri', 'Probolinggo', 'Pasuruan', 'Batu'],
    'Banten': ['Tangerang', 'Serang', 'Cilegon', 'Tangerang Selatan'],
    'Bali': ['Denpasar', 'Badung', 'Gianyar'],
    'Nusa Tenggara Barat': ['Mataram', 'Bima'],
    'Nusa Tenggara Timur': ['Kupang', 'Ende', 'Maumere'],
    'Kalimantan Barat': ['Pontianak', 'Singkawang'],
    'Kalimantan Tengah': ['Palangka Raya'],
    'Kalimantan Selatan': ['Banjarmasin', 'Banjarbaru'],
    'Kalimantan Timur': ['Balikpapan', 'Samarinda', 'Bontang'],
    'Kalimantan Utara': ['Tanjung Selor'],
    'Sulawesi Utara': ['Manado', 'Bitung', 'Tomohon'],
    'Sulawesi Tengah': ['Palu'],
    'Sulawesi Selatan': ['Makassar', 'Parepare', 'Polewali'],
    'Sulawesi Tenggara': ['Kendari', 'Baubau'],
    'Gorontalo': ['Gorontalo'],
    'Sulawesi Barat': ['Mamuju'],
    'Maluku': ['Ambon', 'Tual'],
    'Maluku Utara': ['Ternate', 'Tidore'],
    'Papua': ['Jayapura'],
    'Papua Barat': ['Manokwari'],
    'Papua Tengah': ['Nabire'],
    'Papua Selatan': ['Merauke'],
    'Papua Pegunungan': ['Wamena']
  };

  // Get all cities for fallback
  const allCities = Object.values(citiesByProvince).flat();

  // Get filtered cities based on selected province
  const getFilteredCities = () => {
    if (formData.province && citiesByProvince[formData.province]) {
      return citiesByProvince[formData.province];
    }
    return allCities;
  };

  const getProvinceSuggestions = (query: string) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return provinces.slice(0, 5);
    return provinces
      .filter(province => province.toLowerCase().includes(normalizedQuery))
      .slice(0, 5);
  };

  const getCitySuggestions = (query: string) => {
    const normalizedQuery = query.trim().toLowerCase();
    const sourceCities = getFilteredCities();
    if (!normalizedQuery) return sourceCities.slice(0, 5);
    return sourceCities
      .filter(city => city.toLowerCase().includes(normalizedQuery))
      .slice(0, 5);
  };

  // Handle city input changes with autocomplete
  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, city: value });
    const filtered = getCitySuggestions(value);
    setCitySuggestions(filtered);
    setShowCitySuggestions(filtered.length > 0);
  };

  // Handle province selection and reset city
  const handleProvinceSelect = (province: string) => {
    setFormData({ ...formData, province, city: '' });
    setShowProvinceSuggestions(false);
  };

  // Handle province input changes with autocomplete
  const handleProvinceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, province: value });
    const filtered = getProvinceSuggestions(value);
    setProvinceSuggestions(filtered);
    setShowProvinceSuggestions(filtered.length > 0);
  };

  // Handle guest count range selection
  const handleGuestCountChange = (value: string) => {
    if (value === '25+') {
      setShowGuestCountPopup(true);
    } else {
      // Convert range to maximum value
      const guestCountMap: Record<string, number> = {
        '1-10': 10,
        '11-20': 20,
        '21-25': 25
      };
      setFormData({ ...formData, numberOfGuests: guestCountMap[value] || 10 });
    }
  };

  // Handle popup submission for guest count 25+
  const handleGuestCountPopupSubmit = () => {
    if (guestCountPopupValue < 1 || guestCountPopupValue > 35) {
      setGuestCountPopupError('Jumlah tamu harus antara 1-35 orang');
      return;
    }
    setGuestCountPopupError('');
    setFormData({ ...formData, numberOfGuests: guestCountPopupValue });
    setShowGuestCountPopup(false);
  };

  const derivedCheckIn = dateRange.checkIn;
  const derivedCheckOut = dateRange.checkOut;

  // Redirect if no dates selected (must use useEffect to avoid warning)
  useEffect(() => {
    if (selectedDates.length === 0 || !derivedCheckIn || !derivedCheckOut) {
      navigate(localePath('/book/calendar'));
    }
  }, [selectedDates.length, derivedCheckIn, derivedCheckOut, localePath, navigate]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      setPhoneError('');
      setFormData({ ...formData, phone: value.replace(/\D/g, '').slice(0, 15) });
      return;
    }

    // Convert numeric fields to numbers
    if (name === 'numberOfGuests' || name === 'extraBed') {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleApplyPromo = useCallback(async () => {
    setPromoError('');
    setPromoSuccess('');
    setValidatingPromo(true);

    // Validate with phone if available
    const guestPhone = normalizePhoneNumber(formData.phone || '');

    try {
      const response = await promoValidatePromo({
        code: promoCode,
        checkIn: derivedCheckIn ? format(derivedCheckIn, 'yyyy-MM-dd') : '',
        checkOut: derivedCheckOut ? format(derivedCheckOut, 'yyyy-MM-dd') : '',
        guestPhone,
      });

      if (response.valid) {
        setAppliedPromo({
          code: promoCode.toUpperCase(),
          discountPercentage: response.discountValue || 0,
          discountType: response.discountType,
          dayCondition: response.dayCondition,
          customDays: response.customDays,
          validFrom: new Date(),
          validUntil: new Date(),
          isActive: true,
        });
        setPromoSuccess(t.booking.calendar.discountApplied);
      } else {
        setPromoError(response.reason || t.booking.calendar.invalidPromo);
        setAppliedPromo(null);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setPromoError(error.message || t.booking.calendar.invalidPromo);
      } else {
        setPromoError(t.booking.calendar.invalidPromo);
      }
      setAppliedPromo(null);
    } finally {
      setValidatingPromo(false);
    }
  }, [derivedCheckIn, derivedCheckOut, formData.phone, promoCode, t, setAppliedPromo]);

  // Auto-validate promo when phone is entered and dates are selected
  useEffect(() => {
    if (derivedCheckIn && derivedCheckOut && formData.phone && promoCode && !appliedPromo && !validatingPromo) {
      handleApplyPromo();
    }
  }, [derivedCheckIn?.getTime(), derivedCheckOut?.getTime(), formData.phone, promoCode, handleApplyPromo, appliedPromo, validatingPromo]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRemovePromo = () => {
    setPromoCode('');
    setAppliedPromo(null);
    setPromoSuccess('');
    setPromoError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation - removed address requirement
    if (!formData.fullName || !formData.phone || !formData.city || !formData.province) {
      alert(t.booking.form.fillRequired);
      return;
    }

    if (!derivedCheckIn || !derivedCheckOut) {
      alert('Dates are required');
      return;
    }

    if (!formData.checkInTime) {
      alert('Please select check-in time');
      return;
    }

    const normalizedPhone = normalizePhoneNumber(formData.phone || '');
    if (!isValidPhoneNumber(normalizedPhone)) {
      const invalidPhoneMessage = 'Nomor HP tidak valid. Gunakan format angka aktif (contoh: 08123456789).';
      setPhoneError(invalidPhoneMessage);
      alert(invalidPhoneMessage);
      return;
    }

    // Clear stale orderId from previous booking if dates don't match
    if (formData.orderId && derivedCheckIn && derivedCheckOut) {
      const guestDateStr = format(derivedCheckIn, 'yyyy-MM-dd');
      if (!formData.orderId.startsWith(guestDateStr) && !formData.orderId.includes(guestDateStr)) {
        console.log('Stale orderId detected, clearing:', formData.orderId);
        const { orderId: _orderId, ...restFormData } = formData;
        void _orderId;
        setFormData({ orderId: undefined, ...restFormData });
      }
    }

    // Console log the payload that will be sent
    console.log('========================================');
    console.log('BOOKING FORM PAYLOAD (FE -> Review Page)');
    console.log('========================================');
    console.log('Raw formData:', formData);
    console.log('Normalized phone:', normalizedPhone);
    console.log('Date Range:', {
      checkIn: derivedCheckIn ? derivedCheckIn.toISOString() : null,
      checkOut: derivedCheckOut ? derivedCheckOut.toISOString() : null,
      nightCount: nightCount
    });
    console.log('Guest Info Payload:', {
      ...formData,
      phone: normalizedPhone,
      checkInDate: derivedCheckIn ? format(derivedCheckIn, 'yyyy-MM-dd') : null,
      checkOutDate: derivedCheckOut ? format(derivedCheckOut, 'yyyy-MM-dd') : null
    });
    console.log('========================================');

    // Just save form data to context, navigate to review
    // Order will be created on review page
    setGuestInfo({
      ...formData,
      ...(guestInfo || {}), // Preserve existing orderId and other fields from guestInfo
      phone: normalizedPhone,
    });

    navigate(localePath('/book/review'));
  };

  const dateLocale = lang === 'id' ? 'id-ID' : 'en-US';
  const nightCount = selectedDates.length;

  return (
    <div className="section-padding bg-primary-50">
      <div className="container-custom max-w-6xl">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-primary-900">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-primary-900 bg-primary-900 text-white">1</div>
              <span className="hidden md:inline text-sm font-medium">{t.booking.steps.selectDates}</span>
            </div>
            <div className="w-12 h-0.5 bg-primary-900"></div>
            <div className="flex items-center gap-2 text-gold-600">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-gold-600 bg-gold-50">2</div>
              <span className="hidden md:inline text-sm font-medium">{t.booking.steps.guestInfo}</span>
            </div>
            <div className="w-12 h-0.5 bg-primary-300"></div>
            <div className="flex items-center gap-2 text-primary-400">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-primary-300">3</div>
              <span className="hidden md:inline text-sm font-medium">{t.booking.steps.review}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-8 shadow-sm">
              <h2 className="text-3xl font-serif text-primary-900 mb-6">{t.booking.form.title}</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nama */}
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    {t.booking.form.fullName} *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    className="input-field"
                    placeholder={t.booking.form.fullNamePlaceholder}
                    required
                  />
                </div>

                {/* No HP & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-primary-900 mb-2">
                      {t.booking.form.phone} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="input-field"
                      placeholder={t.booking.form.phonePlaceholder}
                      inputMode="numeric"
                      pattern="[0-9]+"
                      maxLength={15}
                      required
                    />
                    {phoneError && <p className="mt-2 text-xs text-red-600">{phoneError}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-900 mb-2">
                      {t.booking.form.email} <span className="text-primary-400 font-normal">({t.booking.form.emailOptional})</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="input-field"
                      placeholder={t.booking.form.emailPlaceholder}
                    />
                  </div>
                </div>

                {/* Provinsi & Kota - with autocomplete (Province first) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-primary-900 mb-2">
                      {t.booking.form.province} *
                    </label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleProvinceChange}
                      onFocus={() => {
                        const filtered = getProvinceSuggestions(formData.province || '');
                        setProvinceSuggestions(filtered);
                        setShowProvinceSuggestions(filtered.length > 0);
                      }}
                      className="input-field"
                      placeholder={t.booking.form.provincePlaceholder}
                      required
                      autoComplete="off"
                    />
                    {showProvinceSuggestions && provinceSuggestions.length > 0 && (
                      <ul className="absolute z-10 w-full bg-white border border-primary-200 rounded mt-1 max-h-40 overflow-y-auto">
                        {provinceSuggestions.map((province, index) => (
                          <li
                            key={index}
                            onClick={() => handleProvinceSelect(province)}
                            className="px-4 py-2 hover:bg-primary-50 cursor-pointer text-sm"
                          >
                            {province}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-primary-900 mb-2">
                      {t.booking.form.city} *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleCityChange}
                      onFocus={() => {
                        const filtered = getCitySuggestions(formData.city || '');
                        setCitySuggestions(filtered);
                        setShowCitySuggestions(filtered.length > 0);
                      }}
                      className="input-field"
                      placeholder={formData.province ? `Kota di ${formData.province}` : t.booking.form.cityPlaceholder}
                      required
                      autoComplete="off"
                    />
                    {formData.province && !formData.city && (
                      <p className="text-xs text-primary-500 mt-1">
                        Menampilkan kota di {formData.province}
                      </p>
                    )}
                    {showCitySuggestions && citySuggestions.length > 0 && (
                      <ul className="absolute z-10 w-full bg-white border border-primary-200 rounded mt-1 max-h-40 overflow-y-auto">
                        {citySuggestions.map((city, index) => (
                          <li
                            key={index}
                            onClick={() => {
                              setFormData({ ...formData, city });
                              setShowCitySuggestions(false);
                            }}
                            className="px-4 py-2 hover:bg-primary-50 cursor-pointer text-sm"
                          >
                            {city}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Jumlah Orang & Extra Bed */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-primary-900 mb-2">
                      {t.booking.form.numberOfGuests} *
                    </label>
                    <select
                      name="numberOfGuests"
                      value={formData.numberOfGuests <= 10 ? '1-10' : formData.numberOfGuests <= 20 ? '11-20' : formData.numberOfGuests <= 25 ? '21-25' : '25+'}
                      onChange={(e) => handleGuestCountChange(e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="1-10">1-10 orang</option>
                      <option value="11-20">11-20 orang</option>
                      <option value="21-25">21-25 orang</option>
                      <option value="25+">25+ orang</option>
                    </select>
                    {formData.numberOfGuests > 25 && (
                      <p className="text-xs text-primary-600 mt-1">
                        Jumlah tamu: {formData.numberOfGuests} orang
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-900 mb-2">
                      {t.booking.form.extraBed}
                    </label>
                    <select
                      name="extraBed"
                      value={formData.extraBed}
                      onChange={handleFormChange}
                      className="input-field"
                    >
                      <option value={0}>{t.booking.form.extraBedNone}</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(count => (
                        <option key={count} value={count}>
                          {count} Bed Tambahan (Rp{(count * 100000).toLocaleString()})
                        </option>
                      ))}
                    </select>
                    {formData.extraBed > 0 && (
                      <p className="text-xs text-primary-600 mt-1">
                        Total biaya bed tambahan: Rp{(formData.extraBed * 100000).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Estimasi Check-in */}
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    {t.booking.form.checkInTime} *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00'].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setFormData({ ...formData, checkInTime: time })}
                        className={`p-3 text-sm border-2 rounded transition-all text-center
                          ${formData.checkInTime === time
                            ? 'border-gold-600 bg-gold-50 text-primary-900 font-medium'
                            : 'border-primary-200 text-primary-700 hover:border-primary-400'
                          }
                        `}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

              </form>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => navigate(localePath('/book/calendar'))}
                className="btn-secondary"
              >
                {t.booking.form.back}
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary flex-1"
              >
                {t.booking.form.reviewBooking}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 shadow-sm sticky top-24">
              <h3 className="text-xl font-serif text-primary-900 mb-4">{t.booking.calendar.bookingSummary}</h3>
              <div className="space-y-3 text-sm">
                <div className="text-primary-700">
                  <p className="text-xs text-primary-500">{t.booking.calendar.checkIn}</p>
                  <p className="font-medium">{derivedCheckIn?.toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) || ''}</p>
                </div>
                <div className="text-primary-700">
                  <p className="text-xs text-primary-500">{t.booking.calendar.checkOut}</p>
                  <p className="font-medium">{derivedCheckOut?.toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) || ''}</p>
                </div>
                <div className="pt-3 border-t border-primary-200">
                  <div className="flex justify-between text-primary-700">
                    <span>IDR {(pricing.originalPrice / (nightCount || 1)).toLocaleString()} × {nightCount} {t.booking.form.nightLabel}</span>
                    <span>IDR {pricing.originalPrice.toLocaleString()}</span>
                  </div>
                  {formData.extraBed > 0 && (
                    <div className="flex justify-between text-primary-700 mt-2">
                      <span>Bed Tambahan ({formData.extraBed} × Rp100.000)</span>
                      <span>IDR {(formData.extraBed * 100000).toLocaleString()}</span>
                    </div>
                  )}
                  {appliedPromo && (
                    <div className="flex justify-between text-green-600 mt-2">
                      <span>{t.booking.calendar.discount} ({appliedPromo.discountPercentage}%)</span>
                      <span>- IDR {pricing.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-3 mt-3 border-t border-primary-200">
                    <div className="flex justify-between font-semibold text-lg text-primary-900">
                      <span>{t.booking.calendar.total}</span>
                      <span>IDR {(pricing.finalPrice + (formData.extraBed * 100000)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-6 pt-4 border-t border-primary-200">
                <p className="text-sm font-medium text-primary-900 mb-3">{t.booking.calendar.promoCode}</p>
                {!appliedPromo ? (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder={t.booking.calendar.enterCode}
                        className="input-field flex-1 uppercase text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className={`px-3 py-2 text-sm transition-colors ${
                          !promoCode || validatingPromo
                            ? 'bg-primary-300 text-white cursor-not-allowed'
                            : 'bg-primary-900 text-white hover:bg-primary-800'
                        }`}
                        disabled={!promoCode || validatingPromo}
                      >
                        {validatingPromo ? t.booking.calendar.validating : t.booking.calendar.apply}
                      </button>
                    </div>
                    {promoError && <p className="mt-2 text-xs text-red-600">{promoError}</p>}
                    {promoSuccess && <p className="mt-2 text-xs text-green-600">{promoSuccess}</p>}
                  </div>
                ) : (
                  <div className="p-3 bg-green-50 border border-green-200 text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-900">{appliedPromo.code}</p>
                        <p className="text-xs text-green-700">{appliedPromo.discountPercentage}% {t.booking.calendar.discount.toLowerCase()}</p>
                      </div>
                      <button onClick={handleRemovePromo} className="text-red-600 hover:text-red-800 text-xs underline">{t.booking.calendar.remove}</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Count Popup for 25+ */}
      {showGuestCountPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">
              Masukkan Jumlah Tamu
            </h3>
            <input
              type="number"
              min="1"
              max="35"
              value={guestCountPopupValue}
              onChange={(e) => setGuestCountPopupValue(Number(e.target.value))}
              className="input-field mb-2"
              placeholder="Masukkan jumlah tamu"
            />
            <p className="text-sm text-primary-600 mb-4">
              Maksimal 35 orang
            </p>
            {guestCountPopupError && (
              <p className="text-sm text-red-600 mb-4">{guestCountPopupError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowGuestCountPopup(false);
                  setGuestCountPopupError('');
                }}
                className="flex-1 px-4 py-2 border border-primary-300 text-primary-700 hover:bg-primary-50 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleGuestCountPopupSubmit}
                className="flex-1 px-4 py-2 bg-primary-900 text-white hover:bg-primary-800 rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingFormPage;
