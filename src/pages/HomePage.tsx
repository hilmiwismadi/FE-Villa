import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import heroImage from '../assets/images/hero.png';
import Calendar from '../components/Calendar';
import VillaCarousel from '../components/VillaCarousel';
import type { CalendarDay } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { getCalendar, ApiError } from '../services/orderServiceDirectBE';

const HomePage: React.FC = () => {
  const { t, localePath } = useTranslation();
  const navigate = useNavigate();
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthLoading, setMonthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial month calendar data on mount (only once, not on every render)
  useEffect(() => {
    const initialMonth = format(new Date(), 'yyyy-MM');
    fetchCalendarData(initialMonth);
  }, []); // Empty dependency array = runs only on mount

  // Poll calendar data every 60s to pick up expired/released dates
  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentMonth = format(new Date(), 'yyyy-MM');
      fetchCalendarData(currentMonth, true);
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Fetch calendar data for current month
  const fetchCalendarData = async (month: string, preserveCalendar = false) => {
    try {
      if (preserveCalendar) {
        setMonthLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await getCalendar(month);
      setCalendarData(response.days);
    } catch (err) {
      if (err instanceof ApiError) {
        console.error('Failed to fetch calendar data:', err.message);
        setError('Failed to load availability. Please try again later.');
      } else {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
      setMonthLoading(false);
    }
  };

  const scrollToAvailability = () => {
    document.getElementById('availability')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/40 via-primary-900/50 to-primary-900/60"></div>

        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight">
            {t.home.heroTitle}
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light tracking-wide max-w-2xl mx-auto">
            {t.home.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <button onClick={scrollToAvailability} className="btn-gold inline-block">
              {t.home.heroButton}
            </button>
            <a
              href="https://wa.me/6281809252706?text=Halo%20Admin,%20saya%20ingin%20memesan%20villa%20dengan%20bantuan%20Anda.%20Mohon%20informasikan%20ketersediaan%20dan%20harga."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Pesan via WhatsApp
            </a>
          </div>
          <p className="text-sm text-primary-200 mb-4 max-w-lg mx-auto">
            Jika ingin pesan cepat dengan bantuan admin, hubungin lewat WA untuk bantuan langsung.
          </p>
        </div>
      </section>

      {/* Introduction + Carousel Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-serif mb-6 text-primary-900">
              {t.home.introTitle}
            </h2>
            <p className="text-lg text-primary-700 leading-relaxed mb-12">
              {t.home.introText}
            </p>
          </div>
        </div>
        <VillaCarousel />
      </section>

      {/* Amenities Section */}
      <section className="section-padding bg-primary-50">
        <div className="container-custom">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-16 text-primary-900">
            {t.home.amenitiesTitle}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {t.home.amenities.map((amenity, index) => (
              <div key={index} className="text-center">
                <div className="text-gold-600 mb-2">
                  <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-primary-700 uppercase tracking-wide">{amenity}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif mb-3 text-primary-900">{t.home.zenTitle}</h3>
              <p className="text-primary-700">
                {t.home.zenText}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif mb-3 text-primary-900">{t.home.natureTitle}</h3>
              <p className="text-primary-700">
                {t.home.natureText}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif mb-3 text-primary-900">{t.home.energyTitle}</h3>
              <p className="text-primary-700">
                {t.home.energyText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Availability Calendar Section */}
      <section id="availability" className="section-padding bg-primary-50">
        <div className="container-custom">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-4 text-primary-900">
            {t.home.availabilityTitle}
          </h2>
          <p className="text-lg text-primary-700 text-center mb-12 max-w-2xl mx-auto">
            {t.home.availabilityText}
          </p>

          <div className="max-w-3xl mx-auto">
            {loading && (
              <div className="text-center text-primary-700 py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600 mb-4"></div>
                <p>Loading availability...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
                {error}
              </div>
            )}

            {!loading && (
              <Calendar
                readOnly
                calendarData={calendarData}
                onMonthChange={(month) => fetchCalendarData(month, true)}
                onDateSelect={() => navigate(localePath('/book/calendar'))}
                hidePrices={true}
              />
            )}

            {monthLoading && !loading && (
              <p className="text-center text-sm text-primary-600 mt-3">Loading selected month...</p>
            )}

            {/* Book Now Button */}
            <div className="text-center mt-8">
              <Link to={localePath('/book')} className="btn-gold inline-block">
                {t.nav.bookNow}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-6">
            {t.home.ctaTitle}
          </h2>
          <p className="text-xl mb-8 text-primary-200 max-w-2xl mx-auto">
            {t.home.ctaText}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to={localePath('/book')} className="btn-gold inline-block">
              {t.home.ctaButton}
            </Link>
            <a
              href="https://wa.me/6281809252706?text=Halo%20Admin,%20saya%20ingin%20memesan%20villa%20dengan%20bantuan%20Anda.%20Mohon%20informasikan%20ketersediaan%20dan%20harga."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Pesan via WhatsApp
            </a>
          </div>
          <p className="text-sm text-primary-300 mt-4 max-w-lg mx-auto">
            Jika ingin pesan cepat dengan bantuan admin, hubungin lewat WA untuk bantuan langsung.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
