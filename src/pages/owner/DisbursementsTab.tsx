import React, { useEffect, useState } from 'react';
import { bffService, type Disbursement } from '../../services/bffService';
import { useToast } from '../../contexts/ToastContext';

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const statusLabel: Record<string, string> = {
  pending: 'Pending',
  processed: 'Processed',
  rejected: 'Rejected',
};

const DisbursementsTab: React.FC = () => {
  const { toast } = useToast();
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  const load = () => {
    setLoading(true);
    bffService.listDisbursements(filter || undefined)
      .then((d) => setDisbursements(Array.isArray(d) ? d : []))
      .catch((e) => toast(e.message || 'Failed to load disbursements', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleStatus = async (id: string, status: 'processed' | 'rejected') => {
    setProcessing(id);
    try {
      const note = noteMap[id] || '';
      await bffService.updateDisbursementStatus(id, status, note ? { adminNote: note } : undefined);
      toast(`Disbursement ${status === 'processed' ? 'approved' : 'rejected'}`, 'success');
      setNoteMap((prev) => { const n = { ...prev }; delete n[id]; return n; });
      load();
    } catch (e: any) {
      toast(e.message || 'Failed to update', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const pendingCount = disbursements.filter((d) => d.status === 'pending').length;
  const totalPending = disbursements.filter((d) => d.status === 'pending').reduce((s, d) => s + d.quota, 0);

  if (loading) return <div className="text-center py-12 text-primary-600">Loading disbursements...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-serif text-primary-900">Disbursements</h2>
          {pendingCount > 0 && (
            <p className="text-sm text-yellow-700 mt-1">{pendingCount} pending request{pendingCount > 1 ? 's' : ''} totaling {fmt(totalPending)}</p>
          )}
        </div>
        <div className="flex gap-2">
          {['', 'pending', 'processed', 'rejected'].map((s) => (
            <button
              key={s}
              className={`px-3 py-1.5 rounded-lg text-sm ${filter === s ? 'bg-gold-600 text-white' : 'bg-white text-primary-700 border border-primary-200 hover:bg-primary-50'}`}
              onClick={() => setFilter(s)}
            >
              {s ? statusLabel[s] : 'All'}
            </button>
          ))}
        </div>
      </div>

      {disbursements.length === 0 ? (
        <p className="text-primary-500">No disbursements found.</p>
      ) : (
        <div className="space-y-4">
          {disbursements.map((d) => (
            <div key={d.id} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium text-primary-900">{(d.metadata as any)?.affiliateName || d.affiliate_code}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[d.status] || 'bg-gray-100 text-gray-800'}`}>
                      {statusLabel[d.status] || d.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-primary-500">Amount</p>
                      <p className="font-medium text-primary-900">{fmt(d.quota)}</p>
                    </div>
                    <div>
                      <p className="text-primary-500">Code</p>
                      <p className="font-medium text-primary-900">{d.affiliate_code}</p>
                    </div>
                    <div>
                      <p className="text-primary-500">Requested</p>
                      <p className="text-primary-900">{new Date(d.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                    {d.processed_at && (
                      <div>
                        <p className="text-primary-500">Processed</p>
                        <p className="text-primary-900">{new Date(d.processed_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                    )}
                  </div>
                  {(d.metadata as any)?.note && (
                    <p className="text-sm text-primary-600 mt-2 italic">"{(d.metadata as any).note}"</p>
                  )}
                  {(d.metadata as any)?.adminNote && (
                    <p className="text-sm text-blue-600 mt-1">Admin: {(d.metadata as any).adminNote}</p>
                  )}
                </div>

                {d.status === 'pending' && (
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Admin note (optional)"
                      value={noteMap[d.id] || ''}
                      onChange={(e) => setNoteMap((prev) => ({ ...prev, [d.id]: e.target.value }))}
                      className="input-field text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                        onClick={() => handleStatus(d.id, 'processed')}
                        disabled={processing === d.id}
                      >
                        {processing === d.id ? '...' : 'Approve'}
                      </button>
                      <button
                        className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 disabled:opacity-50"
                        onClick={() => handleStatus(d.id, 'rejected')}
                        disabled={processing === d.id}
                      >
                        {processing === d.id ? '...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisbursementsTab;
