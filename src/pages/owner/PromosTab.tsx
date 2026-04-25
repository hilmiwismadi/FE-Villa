import React, { useEffect, useMemo, useState } from 'react';
import { createPromo, deactivatePromo, listPromos } from '../../services/promoService';
import type { PromoResponse, PromoRule } from '../../services/promoService';

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

type PromoType = 'affiliate' | 'automatic' | 'general';

interface PromoFormState {
  code: string;
  type: PromoType;
  label: string;
  stackable: boolean;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  dayCondition: 'all' | 'weekday' | 'weekend' | 'custom';
  expiryType: 'none' | 'date' | 'duration_days';
  expiryDate: string;
  expiryDurationDays: number;
  maxUsage: number;
  triggerType: '' | 'booking_count' | 'total_nights';
  triggerThreshold: number;
  rules: PromoRule[];
}

const createInitialForm = (): PromoFormState => ({
  code: '',
  type: 'automatic',
  label: '',
  stackable: false,
  discountType: 'percentage',
  discountValue: 10,
  dayCondition: 'all',
  expiryType: 'none',
  expiryDate: '',
  expiryDurationDays: 30,
  maxUsage: 0,
  triggerType: '',
  triggerThreshold: 0,
  rules: [],
});

const createDefaultRule = (): PromoRule => ({
  discountType: 'percentage',
  discountValue: 10,
  dayCondition: 'all',
  customDays: null,
});

const PromosTab: React.FC = () => {
  const [promos, setPromos] = useState<PromoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterType, setFilterType] = useState<'all' | PromoType>('all');
  const [form, setForm] = useState<PromoFormState>(createInitialForm());

  const load = async () => {
    try {
      setLoading(true);
      const response = await listPromos(undefined, undefined, 1, 200);
      setPromos(response.promos || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visiblePromos = useMemo(
    () => promos.filter((promo) => (filterType === 'all' ? true : promo.type === filterType)),
    [promos, filterType]
  );

  const stats = useMemo(() => ({
    affiliate: promos.filter((promo) => promo.type === 'affiliate').length,
    automatic: promos.filter((promo) => promo.type === 'automatic').length,
    general: promos.filter((promo) => promo.type === 'general').length,
  }), [promos]);

  const updateRule = (index: number, patch: Partial<PromoRule>) => {
    setForm((current) => {
      const nextRules = current.rules.map((rule, ruleIndex) => (
        ruleIndex === index ? { ...rule, ...patch } : rule
      ));
      return { ...current, rules: nextRules };
    });
  };

  const handleCreate = async () => {
    await createPromo({
      code: form.code,
      type: form.type,
      label: form.label || undefined,
      stackable: form.stackable,
      discountType: form.discountType,
      discountValue: form.discountValue,
      dayCondition: form.dayCondition,
      expiryType: form.expiryType,
      expiryDate: form.expiryType === 'date' ? form.expiryDate : undefined,
      expiryDurationDays: form.expiryType === 'duration_days' ? form.expiryDurationDays : undefined,
      maxUsage: form.maxUsage || undefined,
      triggerType: form.type === 'general' ? undefined : (form.triggerType || undefined),
      triggerThreshold: form.type === 'general' ? undefined : (form.triggerThreshold || undefined),
      rules: form.rules.length > 0 ? form.rules : undefined,
      commissionAmount: form.type === 'general' ? undefined : undefined,
      affiliatorId: form.type === 'affiliate' ? undefined : undefined,
    });

    setForm(createInitialForm());
    setShowCreate(false);
    await load();
  };

  const handleDeactivate = async (code: string) => {
    if (confirm(`Deactivate promo "${code}"?`)) {
      await deactivatePromo(code);
      await load();
    }
  };

  if (loading) return <div className="text-center py-12 text-primary-600">Loading promos...</div>;

  return (
    <div>
      <h2 className="text-2xl font-serif text-primary-900 mb-2">Promo Codes</h2>
      <p className="text-primary-600 mb-6">Manage affiliate, automatic, and general promos.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-primary-200">
          <p className="text-sm text-primary-600">Affiliate Promos</p>
          <p className="text-2xl font-serif text-primary-900">{stats.affiliate}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-primary-200">
          <p className="text-sm text-primary-600">Automatic Promos</p>
          <p className="text-2xl font-serif text-primary-900">{stats.automatic}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-primary-200">
          <p className="text-sm text-primary-600">General Promos</p>
          <p className="text-2xl font-serif text-primary-900">{stats.general}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button className="btn-primary" onClick={() => setShowCreate(true)}>Create Promo</button>
        <select className="input-field w-auto" value={filterType} onChange={(e) => setFilterType(e.target.value as 'all' | PromoType)}>
          <option value="all">All Types</option>
          <option value="affiliate">Affiliate</option>
          <option value="automatic">Automatic</option>
          <option value="general">General</option>
        </select>
      </div>

      {showCreate && (
        <div className="bg-white rounded-lg p-8 mb-8 border border-gold-200">
          <h3 className="text-lg font-serif text-primary-900 mb-4">New Promo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Code</label>
              <input type="text" className="input-field" placeholder="e.g., WELCOME20" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Type</label>
              <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PromoType })}>
                <option value="affiliate">Affiliate</option>
                <option value="automatic">Automatic</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Label</label>
              <input type="text" className="input-field" placeholder="Human-readable promo label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm text-primary-800">
                <input type="checkbox" checked={form.stackable} onChange={(e) => setForm({ ...form, stackable: e.target.checked })} />
                Stackable
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Discount Type</label>
                <select className="input-field" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as 'percentage' | 'fixed' })}>
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
              <select className="input-field" value={form.dayCondition} onChange={(e) => setForm({ ...form, dayCondition: e.target.value as 'all' | 'weekday' | 'weekend' | 'custom' })}>
                <option value="all">All Days</option>
                <option value="weekday">Weekdays Only</option>
                <option value="weekend">Weekends Only</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Expiry</label>
              <select className="input-field" value={form.expiryType} onChange={(e) => setForm({ ...form, expiryType: e.target.value as 'none' | 'date' | 'duration_days' })}>
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
            {form.type !== 'general' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Trigger</label>
                  <select className="input-field" value={form.triggerType} onChange={(e) => setForm({ ...form, triggerType: e.target.value as '' | 'booking_count' | 'total_nights' })}>
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
            )}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-primary-800">Rules</h4>
              <button type="button" className="btn-secondary" onClick={() => setForm((current) => ({ ...current, rules: [...current.rules, createDefaultRule()] }))}>
                Add Rule
              </button>
            </div>
            <div className="space-y-3">
              {form.rules.map((rule, index) => (
                <div key={`${index}-${rule.dayCondition}-${rule.discountType}`} className="grid grid-cols-1 md:grid-cols-5 gap-2 bg-primary-50 p-3 rounded">
                  <select className="input-field" value={rule.discountType} onChange={(e) => updateRule(index, { discountType: e.target.value as 'percentage' | 'fixed' })}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                  <input type="number" className="input-field" value={rule.discountValue} onChange={(e) => updateRule(index, { discountValue: Number(e.target.value) })} />
                  <select className="input-field" value={rule.dayCondition} onChange={(e) => updateRule(index, { dayCondition: e.target.value as 'all' | 'weekday' | 'weekend' | 'custom' })}>
                    <option value="all">All Days</option>
                    <option value="weekday">Weekday</option>
                    <option value="weekend">Weekend</option>
                    <option value="custom">Custom</option>
                  </select>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Custom days: 1,2,3"
                    value={(rule.customDays || []).join(',')}
                    onChange={(e) => {
                      const customDays = e.target.value
                        .split(',')
                        .map((value) => Number(value.trim()))
                        .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6);
                      updateRule(index, { customDays: customDays.length ? customDays : null });
                    }}
                  />
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:text-red-800"
                    onClick={() => setForm((current) => ({ ...current, rules: current.rules.filter((_, ruleIndex) => ruleIndex !== index) }))}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button className="btn-primary" onClick={handleCreate}>Create Promo</button>
            <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg overflow-hidden">
        <h3 className="text-lg font-serif text-primary-900 p-6 border-b border-primary-200">Promos</h3>
        {visiblePromos.length === 0 ? (
          <p className="p-6 text-primary-500">No promos found.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-primary-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Code</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Type</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Label</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Discount</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Stackable</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Rules</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Uses</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Status</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visiblePromos.map((promo) => (
                <tr key={promo.code} className="border-t border-primary-100">
                  <td className="p-4 text-primary-900 font-medium">{promo.code}</td>
                  <td className="p-4 text-primary-700 capitalize">{promo.type}</td>
                  <td className="p-4 text-primary-700">{promo.label || '-'}</td>
                  <td className="p-4 text-primary-900">{promo.discountType === 'percentage' ? `${promo.discountValue}%` : fmt(promo.discountValue)}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${promo.stackable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                      {promo.stackable ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="p-4 text-primary-700">{promo.rules?.length ? `${promo.rules.length} rules` : '—'}</td>
                  <td className="p-4 text-primary-700">{promo.usageCount}{promo.maxUsage ? ` / ${promo.maxUsage}` : ''}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${promo.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {promo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    {promo.isActive && (
                      <button className="text-sm text-red-600 hover:text-red-800" onClick={() => handleDeactivate(promo.code)}>Deactivate</button>
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
