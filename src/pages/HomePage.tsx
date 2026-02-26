import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/images/hero.png';
import Calendar from '../components/Calendar';
import { useTranslation } from '../i18n/LanguageContext';

const HomePage: React.FC = () => {
  const { t, localePath } = useTranslation();

  // TODO: Replace with API fetch - GET /api/calendar/booked-dates
  const bookedDates: Date[] = [];
  // TODO: Replace with API fetch - GET /api/calendar/blocked-dates
  const blockedDates: Date[] = [];

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
          <button onClick={scrollToAvailability} className="btn-gold inline-block">
            {t.home.heroButton}
          </button>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-serif mb-6 text-primary-900">
              {t.home.introTitle}
            </h2>
            <p className="text-lg text-primary-700 leading-relaxed mb-8">
              {t.home.introText}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-primary-50">
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

      {/* Amenities Section */}
      <section className="section-padding bg-white">
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
            <Calendar
              readOnly
              bookedDates={bookedDates}
              blockedDates={blockedDates}
            />

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
          <Link to={localePath('/book')} className="btn-gold inline-block">
            {t.home.ctaButton}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
