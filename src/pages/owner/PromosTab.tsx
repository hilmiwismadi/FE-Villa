import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { PromoResponse, PromoUsage } from '../../services/promoService';
import { useToast } from '../../contexts/ToastContext';
import { createPromo, deactivatePromo, getPromoUsage, listPromos } from '../../services/promoService';

type PromoSection = 'overview' | 'create' | 'usage' | 'commissions';

const isPromoSection = (section?: string): section is PromoSection =>
  section === 'overview'
  || section === 'create'
  || section === 'usage'
  || section === 'commissions';

const statusBadgeClass = (active: boolean) =>
  active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700';

const commissionBadgeClass = (status: string) => {
  if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
  if (status === 'confirmed') return 'bg-green-100 text-green-800';
  if (status === 'cancelled') return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-700';
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
};

const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

const formatDiscount = (promo: PromoResponse) =>
  promo.discountType === 'percentage' ? `${promo.discountValue}%` : formatCurrency(promo.discountValue);

const formatDayCondition = (promo: PromoResponse) => {
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  if (promo.dayCondition === 'custom' && promo.customDays?.length) {
    return promo.customDays.map((d) => dayNames[d] || d).join(', ');
  }
  if (promo.dayCondition === 'weekday') return 'Weekday';
  if (promo.dayCondition === 'weekend') return 'Weekend';
  if (promo.dayCondition === 'all') return 'All Days';
  return promo.dayCondition;
};

const formatExpiry = (promo: PromoResponse) => {
  if (promo.expiryType === 'none') return 'No Expiry';
  if (promo.expiryType === 'date') return formatDate(promo.expiryDate);
  if (promo.expiryType === 'duration_days') return `${promo.expiryDurationDays || 0} days`;
  return '-';
};

const PromosTab: React.FC = () => {
  const { toast: _toast } = useToast();
  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();
  const activeSection: PromoSection = isPromoSection(section) ? section : 'overview';
  const [error, setError] = useState<string | null>(null);

  const [overviewPromos, setOverviewPromos] = useState<PromoResponse[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(false);

  const [promoTypeFilter, setPromoTypeFilter] = useState<'affiliate' | 'automatic' | ''>('');
  const [promoStatusFilter, setPromoStatusFilter] = useState<'true' | 'false' | ''>('');
  const [promos, setPromos] = useState<PromoResponse[]>([]);
  const [promosPage, setPromosPage] = useState(1);
  const [promosTotal, setPromosTotal] = useState(0);
  const [promosLoading, setPromosLoading] = useState(false);

  const [creatingPromo, setCreatingPromo] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoType, setNewPromoType] = useState<'affiliate' | 'automatic'>('affiliate');
  const [newDiscountType, setNewDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [newDiscountValue, setNewDiscountValue] = useState('');
  const [newDayCondition, setNewDayCondition] = useState<'all' | 'weekday' | 'weekend' | 'custom'>('all');
  const [newCustomDays, setNewCustomDays] = useState<number[]>([]);
  const [newAffiliatorId, setNewAffiliatorId] = useState('');
  const [newCommissionAmount, setNewCommissionAmount] = useState('');
  const [newTriggerType, setNewTriggerType] = useState<'booking_count' | 'total_nights'>('booking_count');
  const [newTriggerThreshold, setNewTriggerThreshold] = useState('');
  const [newExpiryType, setNewExpiryType] = useState<'date' | 'duration_days' | 'none'>('none');
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [newExpiryDurationDays, setNewExpiryDurationDays] = useState('');
  const [newMaxUsage, setNewMaxUsage] = useState('');

  const [usagePromoList, setUsagePromoList] = useState<PromoResponse[]>([]);
  const [usageSelectedCode, setUsageSelectedCode] = useState('');
  const [usageRows, setUsageRows] = useState<PromoUsage[]>([]);
  const [usagePage, setUsagePage] = useState(1);
  const [usageLimit, setUsageLimit] = useState(20);
  const [usageTotal, setUsageTotal] = useState(0);
  const [usageLoading, setUsageLoading] = useState(false);

  const [commissionRows, setCommissionRows] = useState<PromoUsage[]>([]);
  const [commissionLoading, setCommissionLoading] = useState(false);
  const [commissionFilter, setCommissionFilter] = useState('');

  useEffect(() => {
    if (!isPromoSection(section)) {
      navigate('/owner/promos/overview', { replace: true });
    }
  }, [navigate, section]);

  const loadOverview = useCallback(async () => {
    try {
      setOverviewLoading(true);
      setError(null);
      const response = await listPromos(undefined, undefined, 1, 100);
      setOverviewPromos(response.promos || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promo overview');
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  const loadPromos = useCallback(async () => {
    try {
      setPromosLoading(true);
      setError(null);
      const response = await listPromos(
        promoTypeFilter || undefined,
        promoStatusFilter ? promoStatusFilter === 'true' : undefined,
        promosPage,
        20
      );
      setPromos(response.promos || []);
      setPromosTotal(response.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promos');
    } finally {
      setPromosLoading(false);
    }
  }, [promoStatusFilter, promoTypeFilter, promosPage]);

  const loadUsagePromoList = useCallback(async () => {
    try {
      setError(null);
      const response = await listPromos(undefined, undefined, 1, 100);
      setUsagePromoList(response.promos || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promo list');
    }
  }, []);

  const loadUsage = useCallback(async () => {
    if (!usageSelectedCode) {
      setUsageRows([]);
      setUsageTotal(0);
      return;
    }
    try {
      setUsageLoading(true);
      setError(null);
      const response = await getPromoUsage(usageSelectedCode, usagePage, 20);
      setUsageRows(response.usages || []);
      setUsageTotal(response.total || 0);
      setUsageLimit(response.limit || 20);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promo usage');
    } finally {
      setUsageLoading(false);
    }
  }, [usagePage, usageSelectedCode]);

  const loadCommissions = useCallback(async () => {
    try {
      setCommissionLoading(true);
      setError(null);
      const response = await listPromos(undefined, undefined, 1, 100);
      const promosWithUsage = (response.promos || []).filter((promo) => promo.usageCount > 0);

      const usageResults = await Promise.all(
        promosWithUsage.map((promo) =>
          getPromoUsage(promo.code, 1, 100).catch(() => ({
            usages: [],
            total: 0,
            page: 1,
            limit: 100,
          }))
        )
      );

      const allUsages = usageResults.flatMap((item) => item.usages || []);
      setCommissionRows(allUsages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load commissions');
    } finally {
      setCommissionLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === 'overview') {
      loadOverview();
      return;
    }
    if (activeSection === 'create') {
      loadPromos();
      return;
    }
    if (activeSection === 'usage') {
      loadUsagePromoList();
      return;
    }
    if (activeSection === 'commissions') {
      loadCommissions();
    }
  }, [activeSection, loadCommissions, loadOverview, loadPromos, loadUsagePromoList]);

  useEffect(() => {
    if (activeSection === 'create') {
      loadPromos();
    }
  }, [activeSection, loadPromos]);

  useEffect(() => {
    if (activeSection === 'usage') {
      loadUsage();
    }
  }, [activeSection, loadUsage]);

  const usageStats = useMemo(() => {
    const totalDiscount = usageRows.reduce((sum, item) => sum + (item.discountApplied || 0), 0);
    const totalCommission = usageRows.reduce((sum, item) => sum + (item.commissionAmount || 0), 0);
    return { totalDiscount, totalCommission };
  }, [usageRows]);

  const commissionSummary = useMemo(() => {
    let pending = 0;
    let confirmed = 0;
    let cancelled = 0;

    for (const row of commissionRows) {
      if (row.commissionStatus === 'pending') pending += row.commissionAmount || 0;
      if (row.commissionStatus === 'confirmed') confirmed += row.commissionAmount || 0;
      if (row.commissionStatus === 'cancelled') cancelled += row.commissionAmount || 0;
    }

    return { pending, confirmed, cancelled };
  }, [commissionRows]);

  const filteredCommissionRows = useMemo(() => {
    const rows = commissionFilter
      ? commissionRows.filter((row) => row.commissionStatus === commissionFilter)
      : commissionRows;
    return [...rows].sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime());
  }, [commissionFilter, commissionRows]);

  const handleCreatePromo = async () => {
    const code = newPromoCode.trim().toUpperCase();
    const discountValue = Number(newDiscountValue);

    if (!code || !Number.isFinite(discountValue) || discountValue <= 0) {
      setError('Promo code and valid discount value are required.');
      return;
    }

    if (newPromoType === 'affiliate' && !newAffiliatorId.trim()) {
      setError('Affiliator ID is required for affiliate promo.');
      return;
    }

    if (newPromoType === 'automatic' && !newTriggerThreshold) {
      setError('Trigger threshold is required for automatic promo.');
      return;
    }

    if (newDayCondition === 'custom' && newCustomDays.length === 0) {
      setError('Select at least one custom day.');
      return;
    }

    if (newExpiryType === 'date' && !newExpiryDate) {
      setError('Expiry date is required.');
      return;
    }

    if (newExpiryType === 'duration_days' && !newExpiryDurationDays) {
      setError('Expiry duration days is required.');
      return;
    }

    try {
      setCreatingPromo(true);
      setError(null);

      await createPromo({
        code,
        type: newPromoType,
        discountType: newDiscountType,
        discountValue,
        dayCondition: newDayCondition,
        customDays: newDayCondition === 'custom' ? newCustomDays : undefined,
        expiryType: newExpiryType,
        affiliatorId: newPromoType === 'affiliate' ? newAffiliatorId.trim() : undefined,
        commissionAmount: newPromoType === 'affiliate' && newCommissionAmount ? Number(newCommissionAmount) : undefined,
        triggerType: newPromoType === 'automatic' ? newTriggerType : undefined,
        triggerThreshold: newPromoType === 'automatic' ? Number(newTriggerThreshold) : undefined,
        expiryDate: newExpiryType === 'date' ? newExpiryDate : undefined,
        expiryDurationDays: newExpiryType === 'duration_days' ? Number(newExpiryDurationDays) : undefined,
        maxUsage: newMaxUsage ? Number(newMaxUsage) : undefined,
      });

      setNewPromoCode('');
      setNewDiscountValue('');
      setNewCustomDays([]);
      setNewAffiliatorId('');
      setNewCommissionAmount('');
      setNewTriggerThreshold('');
      setNewExpiryDate('');
      setNewExpiryDurationDays('');
      setNewMaxUsage('');

      await loadPromos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create promo');
    } finally {
      setCreatingPromo(false);
    }
  };

  const handleDeactivatePromo = async (code: string) => {
    try {
      setError(null);
      await deactivatePromo(code);
      await loadPromos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate promo');
    }
  };

  const overviewStats = useMemo(() => {
    const active = overviewPromos.filter((promo) => promo.isActive).length;
    const affiliate = overviewPromos.filter((promo) => promo.type === 'affiliate').length;
    const automatic = overviewPromos.filter((promo) => promo.type === 'automatic').length;
    const totalUsage = overviewPromos.reduce((sum, promo) => sum + (promo.usageCount || 0), 0);

    return { active, affiliate, automatic, totalUsage };
  }, [overviewPromos]);

  const promosTotalPages = Math.max(1, Math.ceil(promosTotal / 20));
  const usageTotalPages = Math.max(1, Math.ceil(usageTotal / usageLimit));

  return (
    <section>
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        ) : null}

        {activeSection === 'overview' ? (
          <div>
            <h2 className="text-2xl font-serif text-primary-900 mb-6">Promo Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-5 border border-primary-100">
                <p className="text-xs uppercase text-primary-500 mb-1">Active Promos</p>
                <p className="text-2xl font-serif text-primary-900">{overviewLoading ? '-' : overviewStats.active}</p>
              </div>
              <div className="bg-white rounded-lg p-5 border border-primary-100">
                <p className="text-xs uppercase text-primary-500 mb-1">Affiliate Promos</p>
                <p className="text-2xl font-serif text-primary-900">{overviewLoading ? '-' : overviewStats.affiliate}</p>
              </div>
              <div className="bg-white rounded-lg p-5 border border-primary-100">
                <p className="text-xs uppercase text-primary-500 mb-1">Automatic Promos</p>
                <p className="text-2xl font-serif text-primary-900">{overviewLoading ? '-' : overviewStats.automatic}</p>
              </div>
              <div className="bg-white rounded-lg p-5 border border-primary-100">
                <p className="text-xs uppercase text-primary-500 mb-1">Total Usage</p>
                <p className="text-2xl font-serif text-primary-900">
                  {overviewLoading ? '-' : overviewStats.totalUsage.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-primary-100 overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Code</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Type</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Discount</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Day Condition</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Expiry</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Usage</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Status</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {overviewLoading ? (
                    <tr>
                      <td className="p-6 text-center text-primary-500" colSpan={8}>
                        Loading overview...
                      </td>
                    </tr>
                  ) : overviewPromos.length === 0 ? (
                    <tr>
                      <td className="p-6 text-center text-primary-500" colSpan={8}>
                        No promos found.
                      </td>
                    </tr>
                  ) : (
                    overviewPromos.slice(0, 10).map((promo) => (
                      <tr key={promo.code} className="border-t border-primary-100">
                        <td className="p-3 font-medium text-primary-900">{promo.code}</td>
                        <td className="p-3 text-primary-700">{promo.type}</td>
                        <td className="p-3 text-primary-700">{formatDiscount(promo)}</td>
                        <td className="p-3 text-primary-700">{formatDayCondition(promo)}</td>
                        <td className="p-3 text-primary-700">{formatExpiry(promo)}</td>
                        <td className="p-3 text-primary-700">{promo.maxUsage ? `${promo.usageCount} / ${promo.maxUsage}` : promo.usageCount}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusBadgeClass(promo.isActive)}`}>
                            {promo.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-3 text-primary-700">{formatDate(promo.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {activeSection === 'create' ? (
          <div>
            <h2 className="text-2xl font-serif text-primary-900 mb-4">Create Promo</h2>

            <div className="bg-white rounded-lg border border-primary-100 p-4 mb-4">
              <h3 className="text-lg font-medium text-primary-900 mb-3">Create Promo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <input className="input-field" placeholder="Code" value={newPromoCode} onChange={(e) => setNewPromoCode(e.target.value)} />
                <select className="input-field" value={newPromoType} onChange={(e) => setNewPromoType(e.target.value as 'affiliate' | 'automatic')}>
                  <option value="affiliate">Affiliate</option>
                  <option value="automatic">Automatic</option>
                </select>
                <select className="input-field" value={newDiscountType} onChange={(e) => setNewDiscountType(e.target.value as 'percentage' | 'fixed')}>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
                <input className="input-field" type="number" placeholder="Discount Value" value={newDiscountValue} onChange={(e) => setNewDiscountValue(e.target.value)} />
                <select className="input-field" value={newDayCondition} onChange={(e) => setNewDayCondition(e.target.value as 'all' | 'weekday' | 'weekend' | 'custom')}>
                  <option value="all">All Days</option>
                  <option value="weekday">Weekday</option>
                  <option value="weekend">Weekend</option>
                  <option value="custom">Custom</option>
                </select>
                {newDayCondition === 'custom' ? (
                  <div className="md:col-span-2 lg:col-span-4">
                    <div className="flex flex-wrap gap-2">
                      {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((label, day) => (
                        <button
                          type="button"
                          key={label}
                          onClick={() =>
                            setNewCustomDays((prev) =>
                              prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]
                            )
                          }
                          className={`px-3 py-1 rounded-full border text-sm ${
                            newCustomDays.includes(day)
                              ? 'bg-gold-600 text-white border-gold-600'
                              : 'bg-white text-primary-700 border-primary-300'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                <select className="input-field" value={newExpiryType} onChange={(e) => setNewExpiryType(e.target.value as 'date' | 'duration_days' | 'none')}>
                  <option value="none">No Expiry</option>
                  <option value="date">Date</option>
                  <option value="duration_days">Duration (days)</option>
                </select>
                {newPromoType === 'affiliate' ? (
                  <>
                    <input className="input-field" placeholder="Affiliator ID" value={newAffiliatorId} onChange={(e) => setNewAffiliatorId(e.target.value)} />
                    <input className="input-field" type="number" placeholder="Commission Amount" value={newCommissionAmount} onChange={(e) => setNewCommissionAmount(e.target.value)} />
                  </>
                ) : (
                  <>
                    <select className="input-field" value={newTriggerType} onChange={(e) => setNewTriggerType(e.target.value as 'booking_count' | 'total_nights')}>
                      <option value="booking_count">Trigger: booking_count</option>
                      <option value="total_nights">Trigger: total_nights</option>
                    </select>
                    <input className="input-field" type="number" placeholder="Trigger Threshold" value={newTriggerThreshold} onChange={(e) => setNewTriggerThreshold(e.target.value)} />
                  </>
                )}
                {newExpiryType === 'date' ? (
                  <input className="input-field" type="date" value={newExpiryDate} onChange={(e) => setNewExpiryDate(e.target.value)} />
                ) : null}
                {newExpiryType === 'duration_days' ? (
                  <input className="input-field" type="number" placeholder="Expiry Duration Days" value={newExpiryDurationDays} onChange={(e) => setNewExpiryDurationDays(e.target.value)} />
                ) : null}
                <input className="input-field" type="number" placeholder="Max Usage (optional)" value={newMaxUsage} onChange={(e) => setNewMaxUsage(e.target.value)} />
              </div>
              <button type="button" className="btn-primary mt-4 disabled:opacity-50" disabled={creatingPromo} onClick={handleCreatePromo}>
                {creatingPromo ? 'Creating...' : 'Create Promo'}
              </button>
            </div>

            <div className="bg-white rounded-lg border border-primary-100 p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select className="input-field" value={promoTypeFilter} onChange={(e) => { setPromoTypeFilter(e.target.value as 'affiliate' | 'automatic' | ''); setPromosPage(1); }}>
                  <option value="">All Types</option>
                  <option value="affiliate">Affiliate</option>
                  <option value="automatic">Automatic</option>
                </select>
                <select className="input-field" value={promoStatusFilter} onChange={(e) => { setPromoStatusFilter(e.target.value as 'true' | 'false' | ''); setPromosPage(1); }}>
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-primary-100 overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Code</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Type</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Discount</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Day Condition</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Expiry</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Usage</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Status</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {promosLoading ? (
                    <tr>
                      <td className="p-6 text-center text-primary-500" colSpan={8}>
                        Loading promos...
                      </td>
                    </tr>
                  ) : promos.length === 0 ? (
                    <tr>
                      <td className="p-6 text-center text-primary-500" colSpan={8}>
                        No promos found.
                      </td>
                    </tr>
                  ) : (
                    promos.map((promo) => (
                      <tr key={promo.code} className="border-t border-primary-100">
                        <td className="p-3 font-medium text-primary-900">{promo.code}</td>
                        <td className="p-3 text-primary-700">{promo.type}</td>
                        <td className="p-3 text-primary-700">{formatDiscount(promo)}</td>
                        <td className="p-3 text-primary-700">{formatDayCondition(promo)}</td>
                        <td className="p-3 text-primary-700">{formatExpiry(promo)}</td>
                        <td className="p-3 text-primary-700">{promo.maxUsage ? `${promo.usageCount} / ${promo.maxUsage}` : promo.usageCount}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusBadgeClass(promo.isActive)}`}>
                            {promo.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-3">
                          {promo.isActive ? (
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                              onClick={() => handleDeactivatePromo(promo.code)}
                            >
                              Deactivate
                            </button>
                          ) : (
                            <span className="text-xs text-primary-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                type="button"
                className="px-4 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 hover:bg-primary-50 disabled:opacity-50"
                onClick={() => setPromosPage((p) => Math.max(1, p - 1))}
                disabled={promosPage <= 1}
              >
                Previous
              </button>
              <p className="text-sm text-primary-600">Page {promosPage} of {promosTotalPages}</p>
              <button
                type="button"
                className="px-4 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 hover:bg-primary-50 disabled:opacity-50"
                onClick={() => setPromosPage((p) => Math.min(promosTotalPages, p + 1))}
                disabled={promosPage >= promosTotalPages}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}

        {activeSection === 'usage' ? (
          <div>
            <h2 className="text-2xl font-serif text-primary-900 mb-4">Usage</h2>
            <div className="bg-white rounded-lg border border-primary-100 p-4 mb-4">
              <select
                className="input-field max-w-md"
                value={usageSelectedCode}
                onChange={(e) => {
                  setUsageSelectedCode(e.target.value);
                  setUsagePage(1);
                }}
              >
                <option value="">-- Select promo code --</option>
                {usagePromoList.map((promo) => (
                  <option key={promo.code} value={promo.code}>
                    {promo.code} ({promo.type}, {formatDiscount(promo)})
                  </option>
                ))}
              </select>
            </div>

            {usageSelectedCode ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-5 border border-primary-100">
                  <p className="text-xs uppercase text-primary-500 mb-1">Total Uses</p>
                  <p className="text-2xl font-serif text-primary-900">{usageTotal}</p>
                </div>
                <div className="bg-white rounded-lg p-5 border border-primary-100">
                  <p className="text-xs uppercase text-primary-500 mb-1">Total Discount (Page)</p>
                  <p className="text-2xl font-serif text-primary-900">{formatCurrency(usageStats.totalDiscount)}</p>
                </div>
                <div className="bg-white rounded-lg p-5 border border-primary-100">
                  <p className="text-xs uppercase text-primary-500 mb-1">Total Commission (Page)</p>
                  <p className="text-2xl font-serif text-primary-900">{formatCurrency(usageStats.totalCommission)}</p>
                </div>
              </div>
            ) : null}

            <div className="bg-white rounded-lg border border-primary-100 overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Order ID</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Guest Name</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Phone</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Discount</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Commission</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Status</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Check-in</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Used At</th>
                  </tr>
                </thead>
                <tbody>
                  {!usageSelectedCode ? (
                    <tr>
                      <td className="p-6 text-center text-primary-500" colSpan={8}>
                        Select promo code to view usage.
                      </td>
                    </tr>
                  ) : usageLoading ? (
                    <tr>
                      <td className="p-6 text-center text-primary-500" colSpan={8}>
                        Loading usage...
                      </td>
                    </tr>
                  ) : usageRows.length === 0 ? (
                    <tr>
                      <td className="p-6 text-center text-primary-500" colSpan={8}>
                        No usage data.
                      </td>
                    </tr>
                  ) : (
                    usageRows.map((usage) => (
                      <tr key={`${usage.orderId}-${usage.usedAt}`} className="border-t border-primary-100">
                        <td className="p-3 text-primary-900">{usage.orderId}</td>
                        <td className="p-3 text-primary-900">{usage.guestName}</td>
                        <td className="p-3 text-primary-700">{usage.guestPhone}</td>
                        <td className="p-3 text-primary-700">{formatCurrency(usage.discountApplied)}</td>
                        <td className="p-3 text-primary-700">{formatCurrency(usage.commissionAmount)}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${commissionBadgeClass(usage.commissionStatus)}`}>
                            {usage.commissionStatus}
                          </span>
                        </td>
                        <td className="p-3 text-primary-700">{formatDate(usage.bookingCheckInDate)}</td>
                        <td className="p-3 text-primary-700">{formatDateTime(usage.usedAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {usageSelectedCode ? (
              <div className="flex items-center justify-between mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 hover:bg-primary-50 disabled:opacity-50"
                  onClick={() => setUsagePage((p) => Math.max(1, p - 1))}
                  disabled={usagePage <= 1}
                >
                  Previous
                </button>
                <p className="text-sm text-primary-600">Page {usagePage} of {usageTotalPages}</p>
                <button
                  type="button"
                  className="px-4 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 hover:bg-primary-50 disabled:opacity-50"
                  onClick={() => setUsagePage((p) => Math.min(usageTotalPages, p + 1))}
                  disabled={usagePage >= usageTotalPages}
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {activeSection === 'commissions' ? (
          <div>
            <h2 className="text-2xl font-serif text-primary-900 mb-4">Commissions</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-5 border border-primary-100">
                <p className="text-xs uppercase text-primary-500 mb-1">Pending</p>
                <p className="text-2xl font-serif text-primary-900">{commissionLoading ? '-' : formatCurrency(commissionSummary.pending)}</p>
              </div>
              <div className="bg-white rounded-lg p-5 border border-primary-100">
                <p className="text-xs uppercase text-primary-500 mb-1">Confirmed</p>
                <p className="text-2xl font-serif text-primary-900">{commissionLoading ? '-' : formatCurrency(commissionSummary.confirmed)}</p>
              </div>
              <div className="bg-white rounded-lg p-5 border border-primary-100">
                <p className="text-xs uppercase text-primary-500 mb-1">Cancelled</p>
                <p className="text-2xl font-serif text-primary-900">{commissionLoading ? '-' : formatCurrency(commissionSummary.cancelled)}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-primary-100 p-4 mb-4">
              <select className="input-field max-w-xs" value={commissionFilter} onChange={(e) => setCommissionFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="bg-white rounded-lg border border-primary-100 overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Promo Code</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Order ID</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Guest</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Phone</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Discount</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Commission</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Status</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Check-in</th>
                    <th className="text-left p-3 text-sm font-medium text-primary-700">Used At</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionLoading ? (
                    <tr>
                      <td className="p-6 text-center text-primary-500" colSpan={9}>
                        Loading commissions...
                      </td>
                    </tr>
                  ) : filteredCommissionRows.length === 0 ? (
                    <tr>
                      <td className="p-6 text-center text-primary-500" colSpan={9}>
                        No commission data.
                      </td>
                    </tr>
                  ) : (
                    filteredCommissionRows.map((usage) => (
                      <tr key={`${usage.promoCode}-${usage.orderId}-${usage.usedAt}`} className="border-t border-primary-100">
                        <td className="p-3 text-primary-900 font-medium">{usage.promoCode}</td>
                        <td className="p-3 text-primary-900">{usage.orderId}</td>
                        <td className="p-3 text-primary-900">{usage.guestName}</td>
                        <td className="p-3 text-primary-700">{usage.guestPhone}</td>
                        <td className="p-3 text-primary-700">{formatCurrency(usage.discountApplied)}</td>
                        <td className="p-3 text-primary-700">{formatCurrency(usage.commissionAmount)}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${commissionBadgeClass(usage.commissionStatus)}`}>
                            {usage.commissionStatus}
                          </span>
                        </td>
                        <td className="p-3 text-primary-700">{formatDate(usage.bookingCheckInDate)}</td>
                        <td className="p-3 text-primary-700">{formatDateTime(usage.usedAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
    </section>

  );
};

export default PromosTab;
