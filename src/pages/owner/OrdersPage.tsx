import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/owner/orders/pending', label: 'Pending' },
  { path: '/owner/orders/active', label: 'Active' },
  { path: '/owner/orders/previous', label: 'Previous' },
];

const OrdersPage: React.FC = () => {
  const location = useLocation();

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-primary-200 mb-6">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-gold-600 text-gold-600'
                  : 'border-transparent text-primary-500 hover:text-primary-700 hover:border-primary-300'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Tab Content */}
      <Outlet />
    </div>
  );
};

export default OrdersPage;
