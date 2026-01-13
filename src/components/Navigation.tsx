import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-primary-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="text-2xl md:text-3xl font-serif text-primary-900">
            VILLA SEKIPAN
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-sm uppercase tracking-wider text-primary-700 hover:text-primary-900 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/villa"
              className="text-sm uppercase tracking-wider text-primary-700 hover:text-primary-900 transition-colors"
            >
              The Villa
            </Link>
            <Link
              to="/book"
              className="btn-primary"
            >
              Book Now
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
              <Link
                to="/"
                className="text-sm uppercase tracking-wider text-primary-700 hover:text-primary-900 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/villa"
                className="text-sm uppercase tracking-wider text-primary-700 hover:text-primary-900 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                The Villa
              </Link>
              <Link
                to="/book"
                className="btn-primary text-center"
                onClick={() => setIsOpen(false)}
              >
                Book Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
