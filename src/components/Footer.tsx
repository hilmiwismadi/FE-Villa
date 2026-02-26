import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

const Footer: React.FC = () => {
  const { t, localePath } = useTranslation();

  return (
    <footer className="bg-primary-900 text-white">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-serif mb-4">VILLA SEKIPAN</h3>
            <p className="text-primary-200 text-sm leading-relaxed">
              {t.footer.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-serif mb-4 uppercase tracking-wider">{t.footer.quickLinks}</h4>
            <ul className="space-y-2">
              <li>
                <a href={localePath('/')} className="text-primary-200 hover:text-white text-sm transition-colors">
                  {t.nav.home}
                </a>
              </li>
              <li>
                <a href={localePath('/villa')} className="text-primary-200 hover:text-white text-sm transition-colors">
                  {t.nav.theVilla}
                </a>
              </li>
              <li>
                <a href={localePath('/book')} className="text-primary-200 hover:text-white text-sm transition-colors">
                  {t.nav.bookNow}
                </a>
              </li>
              <li>
                <a href={localePath('/booking-status')} className="text-primary-200 hover:text-white text-sm transition-colors">
                  {t.footer.bookingStatus}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-serif mb-4 uppercase tracking-wider">{t.footer.contact}</h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li>{t.footer.email}</li>
              <li>{t.footer.phone}</li>
              <li>{t.footer.location}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-700 text-center">
          <p className="text-primary-300 text-sm">
            &copy; {new Date().getFullYear()} {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
