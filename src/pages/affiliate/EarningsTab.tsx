import React, { useEffect, useState } from 'react';
import { bffService, type AffiliateDashboardData, type Disbursement } from '../../services/bffService';
import { useToast } from '../../contexts/ToastContext';

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const EarningsTab: React.FC = () => {
  const { toast } = useToast();
  const [data, setData] = useState<AffiliateDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNote, setPayoutNote] = useState('');

  const load = () => {
    setLoading(true);
    bffService.getAffiliateDashboard()
      .then(setData)
      .catch((e) => toast(e.message || 'Failed to load earnings', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRequestPayout = async () => {
    const amount = Number(payoutAmount);
    if (!amount || amount <= 0) {
      toast('Enter a valid amount', 'error');
      return;
    }
    setRequesting(true);
    try {
      await bffService.requestPayout(amount, payoutNote || undefined);
      toast('Payout request submitted!', 'success');
      setShowRequestModal(false);
      setPayoutAmount('');
      setPayoutNote('');
      load();
    } catch (e: any) {
      toast(e.message || 'Failed to request payout', 'error');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-primary-600">Loading earnings...</div>;
  if (!data) return null;

  const { stats, codes, disbursement } = data;
  const available = disbursement?.availableForPayout ?? 0;
  const pending = disbursement?.pendingPayouts ?? 0;
  const disbursed = disbursement?.totalDisbursed ?? 0;
  const history: Disbursement[] = disbursement?.recentDisbursements || [];

  return (
    <div>
      <h3 className="text-2xl font-serif text-primary-900 mb-8">Earnings & Payouts</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Available for Payout</p>
          <p className="text-3xl font-serif text-green-600 mb-1">{fmt(available)}</p>
          <p className="text-xs text-primary-500">Ready to withdraw</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Pending Payouts</p>
          <p className="text-3xl font-serif text-yellow-600 mb-1">{fmt(pending)}</p>
          <p className="text-xs text-primary-500">Awaiting processing</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Total Disbursed</p>
          <p className="text-3xl font-serif text-blue-600 mb-1">{fmt(disbursed)}</p>
          <p className="text-xs text-primary-500">All-time paid out</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Lifetime Earnings</p>
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

      <div className="bg-gold-50 border border-gold-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-serif text-primary-900 mb-1">Request Payout</h4>
            <p className="text-sm text-primary-600">Available balance: <strong className="text-green-600">{fmt(available)}</strong></p>
          </div>
          <button
            className="btn-primary"
            onClick={() => setShowRequestModal(true)}
            disabled={available <= 0}
          >
            Request Payout
          </button>
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h4 className="text-lg font-serif text-primary-900 mb-4">Request Payout</h4>
            <div className="mb-4">
              <label className="block text-sm text-primary-600 mb-1">Amount</label>
              <input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder={`Max: ${available}`}
                max={available}
                min={1}
                className="input-field w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-primary-600 mb-1">Note (optional)</label>
              <textarea
                value={payoutNote}
                onChange={(e) => setPayoutNote(e.target.value)}
                placeholder="e.g., Bank BCA - 1234567890"
                className="input-field w-full"
                rows={3}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button className="btn-secondary" onClick={() => setShowRequestModal(false)} disabled={requesting}>Cancel</button>
              <button className="btn-primary" onClick={handleRequestPayout} disabled={requesting}>
                {requesting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="bg-white rounded-lg p-6">
          <h4 className="text-lg font-serif text-primary-900 mb-4">Payout History</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary-200">
                  <th className="text-left py-3 px-2 text-primary-600">Date</th>
                  <th className="text-left py-3 px-2 text-primary-600">Amount</th>
                  <th className="text-left py-3 px-2 text-primary-600">Status</th>
                  <th className="text-left py-3 px-2 text-primary-600">Note</th>
                </tr>
              </thead>
              <tbody>
                {history.map((d) => (
                  <tr key={d.id} className="border-b border-primary-100">
                    <td className="py-3 px-2 text-primary-900">
                      {new Date(d.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-2 font-medium text-primary-900">{fmt(d.quota)}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[d.status] || 'bg-gray-100 text-gray-800'}`}>
                        {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-primary-600">{(d.metadata as any)?.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsTab;
