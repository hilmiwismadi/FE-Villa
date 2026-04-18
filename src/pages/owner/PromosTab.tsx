import React, { useEffect, useState } from 'react';
import { bffService } from '../../services/bffService';
import { useToast } from '../../contexts/ToastContext';

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const PromosTab: React.FC = () => {
  const { toast } = useToast();
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    dayCondition: 'all' as 'all' | 'weekday' | 'weekend' | 'custom',
    expiryType: 'none' as 'date' | 'duration_days' | 'none',
    expiryDate: '',
    expiryDurationDays: 30,
    maxUsage: 0,
    triggerType: '' as '' | 'booking_count' | 'total_nights',
    triggerThreshold: 0,
  });

  const load = () => {
    bffService.listPromos('automatic')
      .then((p) => setPromos((p as any).promos?.filter((pr: any) => pr.type === 'automatic') || []))
      .catch((e) => toast(e.message || 'Failed to load promos', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await bffService.createPromo({
        code: form.code,
        type: 'automatic',
        discountType: form.discountType,
        discountValue: form.discountValue,
        dayCondition: form.dayCondition,
        expiryType: form.expiryType,
        expiryDate: form.expiryType === 'date' ? form.expiryDate : undefined,
        expiryDurationDays: form.expiryType === 'duration_days' ? form.expiryDurationDays : undefined,
        maxUsage: form.maxUsage || undefined,
        triggerType: form.triggerType || undefined,
        triggerThreshold: form.triggerThreshold || undefined,
      });
      toast('Promo created successfully', 'success');
      setForm({ code: '', discountType: 'percentage', discountValue: 10, dayCondition: 'all', expiryType: 'none', expiryDate: '', expiryDurationDays: 30, maxUsage: 0, triggerType: '', triggerThreshold: 0 });
      setShowCreate(false);
      load();
    } catch (e: any) {
      toast(e.message || 'Failed to create promo', 'error');
    }
  };

  const handleDeactivate = async (code: string) => {
    if (confirm(`Deactivate promo "${code}"?`)) {
      try {
        await bffService.deactivatePromo(code);
        toast('Promo deactivated', 'success');
        load();
      } catch (e: any) {
        toast(e.message || 'Failed to deactivate promo', 'error');
      }
    }
  };

  if (loading) return <div className="text-center py-12 text-primary-600">Loading promos...</div>;

  return (
    <div>
      <h2 className="text-2xl font-serif text-primary-900 mb-2">Promo Codes</h2>
      <p className="text-primary-600 mb-6">Automatic discounts triggered by guest activity (booking count, total nights). For affiliate codes, go to the Affiliates tab.</p>

      <button className="btn-primary mb-6" onClick={() => setShowCreate(true)}>Create Promo</button>

      {showCreate && (
        <div className="bg-white rounded-lg p-8 mb-8 border border-gold-200">
          <h3 className="text-lg font-serif text-primary-900 mb-4">New Automatic Promo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Code</label>
              <input type="text" className="input-field" placeholder="e.g., WELCOME20" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Discount Type</label>
                <select className="input-field" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}>
                  <option value="percentage">Percentage %</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Discount Value</label>
                <input type="number" className="input-field" value={form.discountValue || ''} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Day Condition</label>
              <select className="input-field" value={form.dayCondition} onChange={(e) => setForm({ ...form, dayCondition: e.target.value as any })}>
                <option value="all">All Days</option>
                <option value="weekday">Weekdays Only</option>
                <option value="weekend">Weekends Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Expiry</label>
              <select className="input-field" value={form.expiryType} onChange={(e) => setForm({ ...form, expiryType: e.target.value as any })}>
                <option value="none">Never Expires</option>
                <option value="date">Specific Date</option>
                <option value="duration_days">Duration (Days)</option>
              </select>
            </div>
            {form.expiryType === 'date' && (
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Expiry Date</label>
                <input type="date" className="input-field" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
              </div>
            )}
            {form.expiryType === 'duration_days' && (
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Duration (days)</label>
                <input type="number" className="input-field" value={form.expiryDurationDays || ''} onChange={(e) => setForm({ ...form, expiryDurationDays: Number(e.target.value) })} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Max Usage (0 = unlimited)</label>
              <input type="number" className="input-field" value={form.maxUsage || ''} onChange={(e) => setForm({ ...form, maxUsage: Number(e.target.value) })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Trigger</label>
                <select className="input-field" value={form.triggerType} onChange={(e) => setForm({ ...form, triggerType: e.target.value as any })}>
                  <option value="">No Trigger</option>
                  <option value="booking_count">Booking Count</option>
                  <option value="total_nights">Total Nights</option>
                </select>
              </div>
              {form.triggerType && (
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Threshold</label>
                  <input type="number" className="input-field" placeholder="e.g., 3" value={form.triggerThreshold || ''} onChange={(e) => setForm({ ...form, triggerThreshold: Number(e.target.value) })} />
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn-primary" onClick={handleCreate}>Create Promo</button>
            <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg overflow-hidden">
        <h3 className="text-lg font-serif text-primary-900 p-6 border-b border-primary-200">Automatic Promos</h3>
        {promos.length === 0 ? (
          <p className="p-6 text-primary-500">No automatic promos yet.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-primary-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Code</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Discount</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Days</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Trigger</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Uses</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Status</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p: any) => (
                <tr key={p.code} className="border-t border-primary-100">
                  <td className="p-4 text-primary-900 font-medium">{p.code}</td>
                  <td className="p-4 text-primary-900">{p.discountType === 'percentage' ? `${p.discountValue}%` : fmt(p.discountValue)}</td>
                  <td className="p-4 text-primary-700 capitalize">{p.dayCondition}</td>
                  <td className="p-4 text-primary-700">
                    {p.triggerType ? `${p.triggerThreshold} ${p.triggerType === 'booking_count' ? 'bookings' : 'nights'}` : '—'}
                  </td>
                  <td className="p-4 text-primary-700">{p.usageCount}{p.maxUsage ? ` / ${p.maxUsage}` : ''}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    {p.isActive && (
                      <button className="text-sm text-red-600 hover:text-red-800" onClick={() => handleDeactivate(p.code)}>Deactivate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PromosTab;
