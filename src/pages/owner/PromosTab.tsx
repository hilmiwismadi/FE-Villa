import React, { useState } from 'react';
import { initialPromoCodes } from './ownerData';

const PromosTab: React.FC = () => {
  const [promoCodes] = useState(initialPromoCodes);

  return (
    <div>
      <h2 className="text-2xl font-serif text-primary-900 mb-6">Promo Codes & Affiliates</h2>

      {/* Create New Promo */}
      <div className="bg-white rounded-lg p-8 mb-8">
        <h3 className="text-lg font-serif text-primary-900 mb-4">Create New Promo Code</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Promo Code
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., WELCOME20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Discount (%)
            </label>
            <input
              type="number"
              className="input-field"
              placeholder="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Affiliate Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Content creator name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Valid Until
            </label>
            <input
              type="date"
              className="input-field"
            />
          </div>
        </div>
        <button className="btn-primary mt-4">Create Promo Code</button>
      </div>

      {/* Active Promos */}
      <div className="bg-white rounded-lg overflow-hidden">
        <h3 className="text-lg font-serif text-primary-900 p-6 border-b border-primary-200">
          Active Promo Codes
        </h3>
        <table className="w-full">
          <thead className="bg-primary-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-primary-700">Code</th>
              <th className="text-left p-4 text-sm font-medium text-primary-700">Discount</th>
              <th className="text-left p-4 text-sm font-medium text-primary-700">Affiliate</th>
              <th className="text-left p-4 text-sm font-medium text-primary-700">Uses</th>
              <th className="text-left p-4 text-sm font-medium text-primary-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promoCodes.map((promo, index) => (
              <tr key={index} className="border-t border-primary-100">
                <td className="p-4 text-primary-900 font-medium">{promo.code}</td>
                <td className="p-4 text-primary-900">{promo.discount}%</td>
                <td className="p-4 text-primary-700">{promo.affiliate}</td>
                <td className="p-4 text-primary-700">{promo.uses} times</td>
                <td className="p-4">
                  <button className="text-sm text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PromosTab;
