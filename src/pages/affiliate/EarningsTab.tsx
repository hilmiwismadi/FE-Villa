import React, { useEffect, useState } from 'react';
import { bffService, type AffiliateDashboardData } from '../../services/bffService';

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const EarningsTab: React.FC = () => {
  const [data, setData] = useState<AffiliateDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bffService.getAffiliateDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-primary-600">Loading earnings...</div>;
  if (!data) return null;

  const { stats, codes } = data;

  return (
    <div>
      <h3 className="text-2xl font-serif text-primary-900 mb-8">Earnings & Payouts</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Confirmed Earnings</p>
          <p className="text-3xl font-serif text-green-600 mb-1">{fmt(stats.confirmedCommission)}</p>
          <p className="text-xs text-primary-500">Ready for payout</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Pending Earnings</p>
          <p className="text-3xl font-serif text-yellow-600 mb-1">{fmt(stats.pendingCommission)}</p>
          <p className="text-xs text-primary-500">Awaiting confirmation</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Total Lifetime Earnings</p>
          <p className="text-3xl font-serif text-primary-900 mb-1">{fmt(stats.confirmedCommission + stats.pendingCommission)}</p>
          <p className="text-xs text-primary-500">All time</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 mb-8">
        <h4 className="text-lg font-serif text-primary-900 mb-4">Commission Breakdown by Code</h4>
        <div className="space-y-4">
          {codes.length === 0 && <p className="text-primary-500">No codes yet.</p>}
          {codes.map((c) => (
            <div key={c.code} className="flex items-center justify-between p-4 border border-primary-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-primary-900">{c.code}</span>
                  <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">{c.usageCount} uses</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-serif text-gold-600">{fmt(c.totalCommission)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gold-50 border border-gold-200 rounded-lg p-6">
        <h4 className="text-lg font-serif text-primary-900 mb-2">Payout Information</h4>
        <p className="text-primary-700 mb-4">
          Commissions are paid out monthly on the 5th of each month for all confirmed bookings from the previous month.
        </p>
        <button className="btn-primary">Request Payout</button>
      </div>
    </div>
  );
};

export default EarningsTab;
