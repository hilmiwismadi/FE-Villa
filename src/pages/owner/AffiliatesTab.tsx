import React, { useEffect, useState } from 'react';
import { bffService } from '../../services/bffService';
import { useToast } from '../../contexts/ToastContext';
import { getPromo as fetchPromo, getPromoUsage } from '../../services/promoServiceDirectBE';
import type { PromoUsage } from '../../services/promoServiceDirectBE';
import { formatNumberWithDots, parseFormattedNumber } from '../../utils/numberFormat';

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const AffiliatesTab: React.FC = () => {
  const { toast } = useToast();
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddCode, setShowAddCode] = useState<string | null>(null);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [codeDetails, setCodeDetails] = useState<Record<string, any>>({});
  const [codeUsages, setCodeUsages] = useState<Record<string, { rows: PromoUsage[]; total: number; loading: boolean }>>({});
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [codeForm, setCodeForm] = useState({
    code: '',
    commissionRate: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '10',
    expiryType: 'none' as 'date' | 'duration_days' | 'none',
    expiryDate: '',
    expiryDurationDays: '',
    maxUsage: '',
  });

  const load = () => {
    bffService.listAffiliates()
      .then((a) => setAffiliates(a as any[] || []))
      .catch((e) => toast(e.message || 'Failed to load affiliates', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await bffService.createAffiliate({ name: createForm.name, email: createForm.email, password: createForm.password, phone: createForm.phone });
      toast('Affiliate created successfully', 'success');
      setCreateForm({ name: '', email: '', password: '', phone: '' });
      setShowCreate(false);
      load();
    } catch (e: any) {
      toast(e.message || 'Failed to create affiliate', 'error');
    }
  };

  const handleAddCode = async (affiliateId: string) => {
    try {
      await bffService.addAffiliateCode(affiliateId, {
        code: codeForm.code,
        commissionRate: parseFormattedNumber(codeForm.commissionRate),
        discountType: codeForm.discountType,
        discountValue: parseFormattedNumber(codeForm.discountValue),
        expiryType: codeForm.expiryType,
        expiryDate: codeForm.expiryType === 'date' ? codeForm.expiryDate : undefined,
        expiryDurationDays: codeForm.expiryType === 'duration_days' ? Number(codeForm.expiryDurationDays) || undefined : undefined,
        maxUsage: codeForm.maxUsage ? Number(codeForm.maxUsage) : undefined,
      });
      toast('Promo code added successfully', 'success');
      setCodeForm({ code: '', commissionRate: '', discountType: 'percentage', discountValue: '10', expiryType: 'none', expiryDate: '', expiryDurationDays: '', maxUsage: '' });
      setShowAddCode(null);
      load();
    } catch (e: any) {
      toast(e.message || 'Failed to add code', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this affiliate and their login account?')) {
      try {
        await bffService.deleteAffiliate(id);
        toast('Affiliate deleted', 'success');
        load();
      } catch (e: any) {
        toast(e.message || 'Failed to delete affiliate', 'error');
      }
    }
  };

  const handleRemoveCode = async (id: string, code: string) => {
    if (confirm(`Remove code "${code}"?`)) {
      try {
        await bffService.removeAffiliateCode(id, code);
        toast('Code removed', 'success');
        load();
      } catch (e: any) {
        toast(e.message || 'Failed to remove code', 'error');
      }
    }
  };

  const toggleCodeDetails = async (code: string) => {
    if (expandedCode === code) {
      setExpandedCode(null);
      return;
    }
    setExpandedCode(code);
    if (!codeDetails[code]) {
      try {
        const promo = await fetchPromo(code);
        setCodeDetails(prev => ({ ...prev, [code]: promo }));
      } catch {
        setCodeDetails(prev => ({ ...prev, [code]: null }));
      }
    }
    // Load usage data
    loadCodeUsage(code);
  };

  const loadCodeUsage = async (code: string) => {
    setCodeUsages(prev => ({ ...prev, [code]: { rows: [], total: 0, loading: true } }));
    try {
      const usage = await getPromoUsage(code, 1, 50);
      setCodeUsages(prev => ({ ...prev, [code]: { rows: usage.usages, total: usage.total, loading: false } }));
    } catch {
      setCodeUsages(prev => ({ ...prev, [code]: { rows: [], total: 0, loading: false } }));
    }
  };

  if (loading) return <div className="text-center py-12 text-primary-600">Loading affiliates...</div>;

  return (
    <div>
      <h2 className="text-2xl font-serif text-primary-900 mb-6">Affiliates</h2>

      <button className="btn-primary mb-6" onClick={() => setShowCreate(true)}>Create Affiliate</button>

      {showCreate && (
        <div className="bg-white rounded-lg p-8 mb-8 border border-gold-200">
          <h3 className="text-lg font-serif text-primary-900 mb-4">New Affiliate</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" className="input-field" placeholder="Name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
            <input type="email" className="input-field" placeholder="Email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} className="input-field pr-10" placeholder="Login Password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-700" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            <input type="text" className="input-field" placeholder="Phone" value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} />
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn-primary" onClick={handleCreate}>Create</button>
            <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      {affiliates.length === 0 ? (
        <p className="text-primary-500">No affiliates yet. Create one above.</p>
      ) : (
        <div className="space-y-4">
          {affiliates.map((a: any) => (
            <div key={a.id} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-primary-900">{a.name}</h4>
                  <p className="text-sm text-primary-600">{a.email} {a.phone && `· ${a.phone}`}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${a.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {a.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button className="text-sm text-blue-600 hover:text-blue-800" onClick={() => { setShowAddCode(a.id); setCodeForm({ code: '', commissionRate: '', discountType: 'percentage', discountValue: '10', expiryType: 'none', expiryDate: '', expiryDurationDays: '', maxUsage: '' }); }}>Add Code</button>
                  <button className="text-sm text-red-600 hover:text-red-800" onClick={() => handleDelete(a.id)}>Delete</button>
                </div>
              </div>

              {a.codes && a.codes.length > 0 ? (
                <div className="border-t border-primary-100 pt-3">
                  <p className="text-sm font-medium text-primary-700 mb-2">Promo Codes ({a.codes.length})</p>
                  <div className="space-y-2">
                    {a.codes.map((code: string) => {
                      const detail = codeDetails[code];
                      const isExpanded = expandedCode === code;
                      return (
                        <div key={code}>
                          <div className="flex items-center gap-2">
                            <button
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-100 text-gold-800 text-sm rounded-full hover:bg-gold-200 transition-colors cursor-pointer"
                              onClick={() => toggleCodeDetails(code)}
                            >
                              {code}
                              <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            <button className="text-red-500 hover:text-red-700 text-xs font-bold" onClick={() => handleRemoveCode(a.id, code)}>&times;</button>
                          </div>
                          {isExpanded && (
                            <div className="mt-2 ml-1 p-3 bg-primary-50 rounded-lg text-sm">
                              {detail === undefined ? (
                                <p className="text-primary-400">Loading...</p>
                              ) : detail === null ? (
                                <p className="text-red-500">Promo not found in PromoService</p>
                              ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div>
                                    <p className="text-xs text-primary-500">Discount</p>
                                    <p className="font-medium text-primary-900">{detail.discountType === 'percentage' ? `${detail.discountValue}%` : fmt(detail.discountValue)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-primary-500">Commission</p>
                                    <p className="font-medium text-primary-900">{fmt(detail.commissionAmount || 0)}<span className="text-xs text-primary-500"> /booking</span></p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-primary-500">Usage</p>
                                    <p className="font-medium text-primary-900">{detail.usageCount || 0}{detail.maxUsage ? ` / ${detail.maxUsage}` : ''}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-primary-500">Status</p>
                                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${detail.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {detail.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                  {detail.expiryType === 'date' && detail.expiryDate && (
                                    <div>
                                      <p className="text-xs text-primary-500">Expires</p>
                                      <p className="font-medium text-primary-900">{new Date(detail.expiryDate).toLocaleDateString()}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Usage Transactions Table */}
                              {detail && (
                                <div className="mt-3 border-t border-primary-200 pt-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-medium text-primary-700">Usage Transactions</p>
                                    <button
                                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                                      onClick={() => loadCodeUsage(code)}
                                    >
                                      {codeUsages[code]?.loading ? 'Loading...' : codeUsages[code] ? 'Refresh' : 'Load Usage'}
                                    </button>
                                  </div>
                                  {codeUsages[code] && codeUsages[code].rows.length > 0 ? (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-xs">
                                        <thead>
                                          <tr className="text-left text-primary-600 border-b border-primary-200">
                                            <th className="pb-1 pr-3 font-medium">Guest</th>
                                            <th className="pb-1 pr-3 font-medium">Order ID</th>
                                            <th className="pb-1 pr-3 font-medium">Check-in</th>
                                            <th className="pb-1 pr-3 font-medium text-right">Discount</th>
                                            <th className="pb-1 pr-3 font-medium text-right">Commission</th>
                                            <th className="pb-1 pr-3 font-medium">Status</th>
                                            <th className="pb-1 font-medium">Date</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {codeUsages[code].rows.map((u, i) => (
                                            <tr key={i} className="border-b border-primary-100 last:border-0">
                                              <td className="py-1.5 pr-3">
                                                <div className="font-medium text-primary-900">{u.guestName || '-'}</div>
                                                <div className="text-primary-400">{u.guestPhone || '-'}</div>
                                              </td>
                                              <td className="py-1.5 pr-3 text-primary-700 font-mono text-[10px]">{u.orderId?.slice(-8) || '-'}</td>
                                              <td className="py-1.5 pr-3">{fmtDate(u.bookingCheckInDate)}</td>
                                              <td className="py-1.5 pr-3 text-right text-green-700">{fmt(u.discountApplied)}</td>
                                              <td className="py-1.5 pr-3 text-right text-amber-700">{fmt(u.commissionAmount)}</td>
                                              <td className="py-1.5 pr-3">
                                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                                                  u.commissionStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                  u.commissionStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                  u.commissionStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                  'bg-gray-100 text-gray-700'
                                                }`}>{u.commissionStatus}</span>
                                              </td>
                                              <td className="py-1.5 text-primary-500">{fmtDate(u.usedAt)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                      {codeUsages[code].total > codeUsages[code].rows.length && (
                                        <p className="text-[10px] text-primary-400 mt-1">Showing {codeUsages[code].rows.length} of {codeUsages[code].total}</p>
                                      )}
                                    </div>
                                  ) : codeUsages[code] ? (
                                    <p className="text-xs text-primary-400">No usage recorded yet.</p>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-primary-500 mt-2">Total usage: {a.usage_count || 0}</p>
                </div>
              ) : (
                <p className="text-sm text-primary-400 border-t border-primary-100 pt-3">No codes assigned yet.</p>
              )}

              {showAddCode === a.id && (
                <div className="border-t border-primary-200 mt-3 pt-4 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-sm text-primary-700">Code</label>
                      <input type="text" className="input-field mt-1" placeholder="e.g., TRAVEL10" value={codeForm.code} onChange={(e) => setCodeForm({ ...codeForm, code: e.target.value.toUpperCase() })} />
                    </div>
                    <div>
                      <label className="text-sm text-primary-700">Commission</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="input-field mt-1"
                        placeholder="2.000.000"
                        value={codeForm.commissionRate}
                        onChange={(e) => setCodeForm({ ...codeForm, commissionRate: formatNumberWithDots(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-primary-700">Discount Type</label>
                      <select className="input-field mt-1" value={codeForm.discountType} onChange={(e) => setCodeForm({ ...codeForm, discountType: e.target.value as 'percentage' | 'fixed' })}>
                        <option value="percentage">Percentage %</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-primary-700">Discount Value</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="input-field mt-1"
                        placeholder={codeForm.discountType === 'fixed' ? '2.000.000' : '10'}
                        value={codeForm.discountValue}
                        onChange={(e) => setCodeForm({ ...codeForm, discountValue: formatNumberWithDots(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    <div>
                      <label className="text-sm text-primary-700">Expiry</label>
                      <select className="input-field mt-1" value={codeForm.expiryType} onChange={(e) => setCodeForm({ ...codeForm, expiryType: e.target.value as 'date' | 'duration_days' | 'none' })}>
                        <option value="none">No Expiry</option>
                        <option value="date">Specific Date</option>
                        <option value="duration_days">Duration (days)</option>
                      </select>
                    </div>
                    {codeForm.expiryType === 'date' && (
                      <div>
                        <label className="text-sm text-primary-700">Expiry Date</label>
                        <input type="date" className="input-field mt-1" value={codeForm.expiryDate} onChange={(e) => setCodeForm({ ...codeForm, expiryDate: e.target.value })} />
                      </div>
                    )}
                    {codeForm.expiryType === 'duration_days' && (
                      <div>
                        <label className="text-sm text-primary-700">Duration (days)</label>
                        <input type="number" className="input-field mt-1" placeholder="30" value={codeForm.expiryDurationDays} onChange={(e) => setCodeForm({ ...codeForm, expiryDurationDays: e.target.value })} />
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-primary-700">Max Usage</label>
                      <input type="number" className="input-field mt-1" placeholder="Unlimited" value={codeForm.maxUsage} onChange={(e) => setCodeForm({ ...codeForm, maxUsage: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-3">
                    <button className="btn-primary" onClick={() => handleAddCode(a.id)}>Add Code</button>
                    <button className="btn-secondary" onClick={() => setShowAddCode(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AffiliatesTab;
