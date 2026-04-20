import React, { useEffect, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const MainLayout: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showExpiredPopup, setShowExpiredPopup] = useState(false);

  useEffect(() => {
    if (searchParams.get('magic_link_error') === 'expired') {
      setShowExpiredPopup(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />

      {showExpiredPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
              </svg>
            </div>
            <h2 className="text-xl font-serif text-primary-900 mb-2">Login Link Expired</h2>
            <p className="text-primary-500 text-sm mb-6">
              The login link has expired or is invalid. Please request a new one.
            </p>
            <button
              onClick={() => setShowExpiredPopup(false)}
              className="w-full bg-primary-900 hover:bg-primary-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
