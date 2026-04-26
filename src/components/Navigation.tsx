import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';

const NavItem: React.FC<{
  to: string;
  children: React.ReactNode;
  active?: boolean;
}> = ({ to, children, active }) => {
  const base = 'text-sm uppercase tracking-wider transition-colors pb-1 border-b-2';
  const activeClass = active
    ? 'text-primary-900 border-primary-900'
    : 'text-primary-700 border-transparent hover:text-primary-900 hover:border-primary-900';

  return (
    <Link to={to} className={`${base} ${activeClass}`}>
      {children}
    </Link>
  );
};

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, localePath, lang } = useTranslation();
  const location = useLocation();

  const isActive = (path: string) => {
    const pathname = location.pathname.replace(/^\/en/, '') || '/';
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <nav className="bg-white border-b border-primary-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-20 px-4 md:px-0">
          {/* Logo */}
          <Link to={localePath('/')} className="text-2xl md:text-3xl font-serif text-primary-900">
            VILLA SEKIPAN
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavItem to={localePath('/')} active={isActive('/') && !isActive('/villa') && !isActive('/rules') && !isActive('/book')}>
              {t.nav.home}
            </NavItem>
            <NavItem to={localePath('/villa')} active={isActive('/villa')}>
              {t.nav.theVilla}
            </NavItem>
            <NavItem to={localePath('/rules')} active={isActive('/rules')}>
              Peraturan
            </NavItem>
            <Link
              to={localePath('/book')}
              className="btn-primary"
            >
              {t.nav.bookNow}
            </Link>
            {/* Language switcher */}
            <Link
              to={lang === 'id' ? '/en' : '/'}
              className="text-sm uppercase tracking-wider text-primary-500 hover:text-primary-900 transition-colors font-medium"
            >
              {lang === 'id' ? 'ID' : 'EN'}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-primary-900 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 px-4 border-t border-primary-200">
            <div className="flex flex-col space-y-4">
              <NavItem to={localePath('/')} active={isActive('/') && !isActive('/villa') && !isActive('/rules') && !isActive('/book')}>
                {t.nav.home}
              </NavItem>
              <NavItem to={localePath('/villa')} active={isActive('/villa')}>
                {t.nav.theVilla}
              </NavItem>
              <NavItem to={localePath('/rules')} active={isActive('/rules')}>
                Peraturan
              </NavItem>
              <Link
                to={localePath('/book')}
                className="btn-primary text-center"
                onClick={() => setIsOpen(false)}
              >
                {t.nav.bookNow}
              </Link>
              <Link
                to={lang === 'id' ? '/en' : '/'}
                className="text-sm uppercase tracking-wider text-primary-500 hover:text-primary-900 transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                {lang === 'id' ? 'ID' : 'EN'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
