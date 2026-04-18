import React, { useEffect, useState } from 'react';
import { bffService, type AffiliateDashboardData } from '../../services/bffService';
import { useToast } from '../../contexts/ToastContext';

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const CodesTab: React.FC = () => {
  const { toast } = useToast();
  const [codes, setCodes] = useState<AffiliateDashboardData['codes']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bffService.getAffiliateDashboard()
      .then((d) => setCodes(d.codes))
      .catch((e) => toast(e.message || 'Failed to load codes', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast('Copied to clipboard!', 'success');
  };

  if (loading) return <div className="text-center py-12 text-primary-600">Loading codes...</div>;

  return (
    <div>
      <h3 className="text-2xl font-serif text-primary-900 mb-6">My Promo Codes</h3>
      <p className="text-primary-600 mb-8">Share these codes with your audience to earn commission on bookings.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {codes.length === 0 && <p className="text-primary-500">No promo codes assigned yet.</p>}
        {codes.map((c) => (
          <div key={c.code} className="bg-white rounded-lg p-6 shadow-sm border-2 border-primary-100 hover:border-gold-400 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-2xl font-serif text-primary-900 mb-2">{c.code}</h4>
                <p className="text-sm text-primary-600">{c.discountType === 'percentage' ? `${c.discountValue}%` : fmt(c.discountValue)} discount</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">Active</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-primary-600 mb-1">Total Uses</p>
                <p className="text-xl font-semibold text-primary-900">{c.usageCount}</p>
              </div>
              <div>
                <p className="text-sm text-primary-600 mb-1">Your Commission</p>
                <p className="text-lg font-semibold text-gold-600">{fmt(c.totalCommission)}</p>
              </div>
            </div>

            <div className="border-t border-primary-200 pt-4">
              <p className="text-sm text-primary-600 mb-2">Booking Link</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`https://yutaka.izcy.tech/book?code=${c.code}`}
                  readOnly
                  className="input-field flex-1 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(`https://yutaka.izcy.tech/book?code=${c.code}`)}
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
