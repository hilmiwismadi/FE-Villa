import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';

const BookingFormPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectedDates,
    formData,
    setFormData,
    setGuestInfo,
    pricing,
    appliedPromo,
    setAppliedPromo,
    promoCode,
    setPromoCode,
    dateRange,
  } = useBooking();

  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(appliedPromo ? `${appliedPromo.discountPercentage}% discount applied!` : '');

  const derivedCheckIn = dateRange.checkIn;
  const derivedCheckOut = dateRange.checkOut;

  // Redirect if no dates selected
  if (selectedDates.length < 2 || !derivedCheckIn || !derivedCheckOut) {
    navigate('/book/calendar');
    return null;
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleApplyPromo = () => {
    setPromoError('');
    setPromoSuccess('');
    const validPromoCodes = [
      { code: 'TRAVEL10', discountPercentage: 10, affiliateId: 'aff1', validFrom: new Date(), validUntil: new Date(2026, 11, 31), isActive: true },
      { code: 'SUMMER25', discountPercentage: 25, affiliateId: 'aff2', validFrom: new Date(), validUntil: new Date(2026, 11, 31), isActive: true },
    ];
    const promo = validPromoCodes.find(p => p.code === promoCode.toUpperCase());
    if (promo) {
      setAppliedPromo(promo);
      setPromoSuccess(`${promo.discountPercentage}% discount applied!`);
    } else {
      setPromoError('Invalid promo code');
      setAppliedPromo(null);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setAppliedPromo(null);
    setPromoSuccess('');
    setPromoError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }
    setGuestInfo(formData);
    navigate('/book/review');
  };

  return (
    <div className="section-padding bg-primary-50">
      <div className="container-custom max-w-6xl">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-primary-900">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-primary-900 bg-primary-900 text-white">1</div>
              <span className="hidden md:inline text-sm font-medium">Select Dates</span>
            </div>
            <div className="w-12 h-0.5 bg-primary-900"></div>
            <div className="flex items-center gap-2 text-gold-600">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-gold-600 bg-gold-50">2</div>
              <span className="hidden md:inline text-sm font-medium">Guest Info</span>
            </div>
            <div className="w-12 h-0.5 bg-primary-300"></div>
            <div className="flex items-center gap-2 text-primary-400">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-primary-300">3</div>
              <span className="hidden md:inline text-sm font-medium">Review</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-8 shadow-sm">
              <h2 className="text-3xl font-serif text-primary-900 mb-6">Guest Information</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nama */}
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    className="input-field"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>

                {/* No HP & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-primary-900 mb-2">
                      No. Handphone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="input-field"
                      placeholder="08xxxxxxxxxx"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-900 mb-2">
                      Email <span className="text-primary-400 font-normal">(Opsional)</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="input-field"
                      placeholder="email@contoh.com"
                    />
                  </div>
                </div>

                {/* Alamat */}
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Alamat *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                    required
                  ></textarea>
                </div>

                {/* Kota & Provinsi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-primary-900 mb-2">
                      Kota / Kabupaten *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleFormChange}
                      className="input-field"
                      placeholder="Contoh: Jakarta Selatan"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-900 mb-2">
                      Provinsi *
                    </label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleFormChange}
                      className="input-field"
                      placeholder="Contoh: DKI Jakarta"
                      required
                    />
                  </div>
                </div>

                {/* Jumlah Orang & Extra Bed */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-primary-900 mb-2">
                      Jumlah Tamu *
                    </label>
                    <input
                      type="number"
                      name="numberOfGuests"
                      value={formData.numberOfGuests}
                      onChange={handleFormChange}
                      min="1"
                      max="10"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-900 mb-2">
                      Bed Tambahan
                    </label>
                    <select
                      name="extraBed"
                      value={formData.extraBed}
                      onChange={handleFormChange}
                      className="input-field"
                    >
                      <option value={0}>Tidak perlu</option>
                      <option value={1}>1 bed tambahan</option>
                      <option value={2}>2 bed tambahan</option>
                      <option value={3}>3 bed tambahan</option>
                    </select>
                  </div>
                </div>

                {/* Estimasi Check-in */}
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Estimasi Waktu Check-in *
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

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Permintaan Khusus <span className="text-primary-400 font-normal">(Opsional)</span>
                  </label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleFormChange}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Ada permintaan atau kebutuhan khusus?"
                  ></textarea>
                </div>
              </form>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => navigate('/book/calendar')}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary flex-1"
              >
                Review Booking
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 shadow-sm sticky top-24">
              <h3 className="text-xl font-serif text-primary-900 mb-4">Booking Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="text-primary-700">
                  <p className="text-xs text-primary-500">Check-in</p>
                  <p className="font-medium">{derivedCheckIn.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="text-primary-700">
                  <p className="text-xs text-primary-500">Check-out</p>
                  <p className="font-medium">{derivedCheckOut.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="pt-3 border-t border-primary-200">
                  <div className="flex justify-between text-primary-700">
                    <span>IDR {(pricing.originalPrice / (selectedDates.length - 1 || 1)).toLocaleString()} × {selectedDates.length - 1} malam</span>
                    <span>IDR {pricing.originalPrice.toLocaleString()}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-green-600 mt-2">
                      <span>Diskon ({appliedPromo.discountPercentage}%)</span>
                      <span>- IDR {pricing.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-3 mt-3 border-t border-primary-200">
                    <div className="flex justify-between font-semibold text-lg text-primary-900">
                      <span>Total</span>
                      <span>IDR {pricing.finalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-6 pt-4 border-t border-primary-200">
                <p className="text-sm font-medium text-primary-900 mb-3">Promo Code</p>
                {!appliedPromo ? (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="input-field flex-1 uppercase text-sm"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="px-3 py-2 bg-primary-900 text-white text-sm hover:bg-primary-800 transition-colors"
                        disabled={!promoCode}
                      >
                        Apply
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
                        <p className="text-xs text-green-700">{appliedPromo.discountPercentage}% discount</p>
                      </div>
                      <button onClick={handleRemovePromo} className="text-red-600 hover:text-red-800 text-xs underline">Remove</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFormPage;
