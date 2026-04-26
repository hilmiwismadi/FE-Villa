import React, { useEffect, useMemo, useState } from 'react';
import type { CustomPricingRuleResponse } from '../../services/orderServiceDirectBE';
import {
  createAdminBlockedDate,
  createAdminCustomPricingRule,
  deleteAdminBlockedDate,
  deleteAdminCustomPricingRule,
  getAdminBlockedDates,
  getAdminCustomPricingRules,
  getAdminDefaultPricingRule,
  setAdminDefaultPricingRule,
} from '../../services/orderServiceDirectBE';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr));
};

const formatDateTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getRuleAmount = (rule: CustomPricingRuleResponse) => {
  return rule.customAmount ?? rule.amount ?? 0;
};

const PricingTab: React.FC = () => {
  const [defaultRule, setDefaultRule] = useState<CustomPricingRuleResponse | null>(null);
  const [customRules, setCustomRules] = useState<CustomPricingRuleResponse[]>([]);
  const [blockedDates, setBlockedDates] = useState<CustomPricingRuleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [defaultPriceInput, setDefaultPriceInput] = useState('');
  const [updatingDefault, setUpdatingDefault] = useState(false);

  const [frequency, setFrequency] = useState<'onetime' | 'weekly'>('onetime');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [label, setLabel] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [creatingRule, setCreatingRule] = useState(false);

  const [blockDate, setBlockDate] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockingDate, setBlockingDate] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [defaultPriceResponse, customRulesResponse, blockedResponse] = await Promise.all([
        getAdminDefaultPricingRule(),
        getAdminCustomPricingRules(1, 200),
        getAdminBlockedDates(),
      ]);

      setDefaultRule(defaultPriceResponse);
      setCustomRules(customRulesResponse.rules);
      setBlockedDates(blockedResponse.blocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pricing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const weeklyLabel = useMemo(() => {
    if (!defaultRule?.amount) return 'Weekend pricing is controlled by custom weekly rules.';
    const weekendRule = customRules.find((rule) => rule.type === 'custom_weekly');
    if (!weekendRule) return 'No custom weekly rule active.';
    return `Example weekly rule amount: ${formatCurrency(getRuleAmount(weekendRule))}`;
  }, [customRules, defaultRule]);

  const handleUpdateDefault = async () => {
    const parsed = Number(defaultPriceInput);
    if (!Number.isFinite(parsed) || parsed <= 0) return;

    try {
      setUpdatingDefault(true);
      const updated = await setAdminDefaultPricingRule(parsed);
      setDefaultRule(updated);
      setDefaultPriceInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update default price');
    } finally {
      setUpdatingDefault(false);
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleCreateRule = async () => {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || !startDate || !endDate) return;
    if (frequency === 'weekly' && selectedDays.length === 0) return;

    try {
      setCreatingRule(true);
      await createAdminCustomPricingRule({
        frequency,
        amount: parsedAmount,
        startDate,
        endDate,
        label: label.trim() || "",
        dayOfWeek: frequency === 'weekly' ? selectedDays : undefined,
      });

      setAmount('');
      setStartDate('');
      setEndDate('');
      setLabel('');
      setSelectedDays([]);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create custom pricing rule');
    } finally {
      setCreatingRule(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await deleteAdminCustomPricingRule(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete custom pricing rule');
    }
  };

  const handleBlockDate = async () => {
    if (!blockDate || !blockReason.trim()) return;
    try {
      setBlockingDate(true);
      await createAdminBlockedDate(blockDate, blockReason.trim());
      setBlockDate('');
      setBlockReason('');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to block date');
    } finally {
      setBlockingDate(false);
    }
  };

  const handleUnblockDate = async (id: string) => {
    try {
      await deleteAdminBlockedDate(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unblock date');
    }
  };

  return (
    <div>
      {error ? (
        <div className="bg-red-50 rounded-lg p-4 mb-6">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      ) : null}

      {loading ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-primary-600">Loading pricing data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-serif text-primary-900 mb-2">Default Price</h3>
              <p className="text-3xl font-serif text-primary-900 mb-2">{formatCurrency(defaultRule?.amount ?? 0)}</p>
              <p className="text-xs text-primary-500">Last updated: {formatDateTime(defaultRule?.updatedAt)}</p>
              <div className="mt-4 flex gap-2">
                <input
                  type="number"
                  className="input-field"
                  placeholder="New price"
                  value={defaultPriceInput}
                  onChange={(e) => setDefaultPriceInput(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-primary whitespace-nowrap disabled:opacity-50"
                  disabled={updatingDefault}
                  onClick={handleUpdateDefault}
                >
                  {updatingDefault ? 'Saving...' : 'Update'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-serif text-primary-900 mb-2">Custom Rules</h3>
              <p className="text-3xl font-serif text-primary-900 mb-2">{customRules.length}</p>
              <p className="text-sm text-primary-600">One-time and weekly overrides</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-serif text-primary-900 mb-2">Blocked Dates</h3>
              <p className="text-3xl font-serif text-primary-900 mb-2">{blockedDates.length}</p>
              <p className="text-sm text-primary-600">{weeklyLabel}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 mb-8">
            <h3 className="text-xl font-serif text-primary-900 mb-4">Add Custom Price Rule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Frequency</label>
                <select className="input-field" value={frequency} onChange={(e) => setFrequency(e.target.value as 'onetime' | 'weekly')}>
                  <option value="onetime">One-time</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Amount</label>
                <input type="number" className="input-field" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Start Date</label>
                <input type="date" className="input-field" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">End Date</label>
                <input type="date" className="input-field" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Label</label>
                <input type="text" className="input-field" value={label} onChange={(e) => setLabel(e.target.value)} />
              </div>
            </div>

            {frequency === 'weekly' ? (
              <div className="mt-4">
                <label className="block text-sm font-medium text-primary-700 mb-2">Week Days</label>
                <div className="flex flex-wrap gap-2">
                  {dayLabels.map((day, index) => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(index)}
                      className={`px-3 py-1 rounded-full border text-sm ${
                        selectedDays.includes(index)
                          ? 'bg-gold-600 text-white border-gold-600'
                          : 'bg-white text-primary-700 border-primary-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <button
              type="button"
              className="btn-primary mt-6 disabled:opacity-50"
              disabled={creatingRule}
              onClick={handleCreateRule}
            >
              {creatingRule ? 'Creating...' : 'Create Rule'}
            </button>
          </div>

          <div className="bg-white rounded-lg p-6 mb-8">
            <h3 className="text-xl font-serif text-primary-900 mb-4">Current Custom Rules</h3>
            {customRules.length === 0 ? (
              <p className="text-primary-600">No custom pricing rules found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-primary-700">Type</th>
                      <th className="text-left p-3 text-sm font-medium text-primary-700">Label</th>
                      <th className="text-left p-3 text-sm font-medium text-primary-700">Amount</th>
                      <th className="text-left p-3 text-sm font-medium text-primary-700">Period</th>
                      <th className="text-left p-3 text-sm font-medium text-primary-700">Days</th>
                      <th className="text-left p-3 text-sm font-medium text-primary-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customRules.map((rule) => (
                      <tr key={rule.id} className="border-t border-primary-100">
                        <td className="p-3 text-primary-900">{rule.type}</td>
                        <td className="p-3 text-primary-900">{rule.label || '-'}</td>
                        <td className="p-3 text-primary-900">{formatCurrency(getRuleAmount(rule))}</td>
                        <td className="p-3 text-primary-700">
                          {formatDate(rule.startDate)} - {formatDate(rule.endDate)}
                        </td>
                        <td className="p-3 text-primary-700">
                          {Array.isArray(rule.dayOfWeek) ? rule.dayOfWeek.map((d) => dayLabels[d] || d).join(', ') : '-'}
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg p-6">
            <h3 className="text-xl font-serif text-primary-900 mb-4">Blocked Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <input
                type="date"
                className="input-field"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
              />
              <input
                type="text"
                className="input-field md:col-span-2"
                placeholder="Reason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn-primary mb-6 disabled:opacity-50"
              disabled={blockingDate}
              onClick={handleBlockDate}
            >
              {blockingDate ? 'Saving...' : 'Block Date'}
            </button>

            {blockedDates.length === 0 ? (
              <p className="text-primary-600">No blocked dates found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-primary-700">Date</th>
                      <th className="text-left p-3 text-sm font-medium text-primary-700">Reason</th>
                      <th className="text-left p-3 text-sm font-medium text-primary-700">Created</th>
                      <th className="text-left p-3 text-sm font-medium text-primary-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockedDates.map((item) => (
                      <tr key={item.id} className="border-t border-primary-100">
                        <td className="p-3 text-primary-900">{formatDate(item.blockedDate)}</td>
                        <td className="p-3 text-primary-700">{item.blockReason || '-'}</td>
                        <td className="p-3 text-primary-700">{formatDateTime(item.createdAt)}</td>
                        <td className="p-3">
                          <button
                            type="button"
                            className="text-gold-700 hover:text-gold-800 text-sm font-medium"
                            onClick={() => handleUnblockDate(item.id)}
                          >
                            Unblock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PricingTab;
