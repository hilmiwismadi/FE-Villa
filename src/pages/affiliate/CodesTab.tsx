import React from 'react';
import { promoCodes, formatCurrency, formatDate } from './data';

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  alert('Copied to clipboard!');
};

const CodesTab: React.FC = () => {
  return (
    <div>
      <h3 className="text-2xl font-serif text-primary-900 mb-6">My Promo Codes</h3>
      <p className="text-primary-600 mb-8">Share these codes with your audience to earn commission on bookings.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {promoCodes.map((code) => (
          <div key={code.code} className="bg-white rounded-lg p-6 shadow-sm border-2 border-primary-100 hover:border-gold-400 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-2xl font-serif text-primary-900 mb-2">{code.code}</h4>
                <p className="text-sm text-primary-600">Created {formatDate(code.createdDate)}</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">Active</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-primary-600 mb-1">Discount</p>
                <p className="text-xl font-semibold text-primary-900">{code.discount}%</p>
              </div>
              <div>
                <p className="text-sm text-primary-600 mb-1">Total Uses</p>
                <p className="text-xl font-semibold text-primary-900">{code.totalUses}</p>
              </div>
              <div>
                <p className="text-sm text-primary-600 mb-1">Revenue Generated</p>
                <p className="text-lg font-semibold text-primary-900">{formatCurrency(code.totalRevenue)}</p>
              </div>
              <div>
                <p className="text-sm text-primary-600 mb-1">Your Commission</p>
                <p className="text-lg font-semibold text-gold-600">{formatCurrency(code.commission)}</p>
              </div>
            </div>

            <div className="border-t border-primary-200 pt-4">
              <p className="text-sm text-primary-600 mb-2">Booking Link</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`https://villasekipan.com/book?code=${code.code}`}
                  readOnly
                  className="input-field flex-1 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(`https://villasekipan.com/book?code=${code.code}`)}
                  className="btn-secondary whitespace-nowrap"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodesTab;
