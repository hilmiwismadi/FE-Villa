import React, { useEffect, useState } from 'react';
import { bffService } from '../../services/bffService';

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const AffiliatesTab: React.FC = () => {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddCode, setShowAddCode] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', commissionRate: 0, code: '', discountType: 'percentage', discountValue: 10 });

  const load = () => {
    bffService.listAffiliates()
      .then((a) => setAffiliates(a as any[] || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    await bffService.createAffiliate({ name: form.name, email: form.email, password: form.password, phone: form.phone, commissionRate: form.commissionRate, discountType: form.discountType, discountValue: form.discountValue });
    setForm({ name: '', email: '', password: '', phone: '', commissionRate: 0, code: '', discountType: 'percentage', discountValue: 10 });
    setShowCreate(false);
    load();
  };

  const handleAddCode = async (affiliateId: string) => {
    await bffService.addAffiliateCode(affiliateId, form.code, form.commissionRate, form.discountType, form.discountValue);
    setForm(prev => ({ ...prev, code: '' }));
    setShowAddCode(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this affiliate and their login account?')) {
      await bffService.deleteAffiliate(id);
      load();
    }
  };

  const handleRemoveCode = async (id: string, code: string) => {
    if (confirm(`Remove code "${code}"?`)) {
      await bffService.removeAffiliateCode(id, code);
      load();
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
            <input type="text" className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input type="email" className="input-field" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input type="password" className="input-field" placeholder="Login Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <input type="text" className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input type="number" className="input-field" placeholder="Commission Rate (per booking)" value={form.commissionRate || ''} onChange={(e) => setForm({ ...form, commissionRate: Number(e.target.value) })} />
            <div className="grid grid-cols-2 gap-2">
              <select className="input-field" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                <option value="percentage">Discount %</option>
                <option value="fixed">Discount Fixed</option>
              </select>
              <input type="number" className="input-field" placeholder="Value" value={form.discountValue || ''} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
            </div>
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
                  <p className="text-xs text-primary-500 mt-1">Commission: {fmt(a.metadata?.commissionRate || 0)} / booking</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${a.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {a.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button className="text-sm text-blue-600 hover:text-blue-800" onClick={() => { setShowAddCode(a.id); setForm(prev => ({ ...prev, commissionRate: a.metadata?.commissionRate || 0 })); }}>Add Code</button>
                  <button className="text-sm text-red-600 hover:text-red-800" onClick={() => handleDelete(a.id)}>Delete</button>
                </div>
              </div>

              {a.codes && a.codes.length > 0 ? (
                <div className="border-t border-primary-100 pt-3">
                  <p className="text-sm font-medium text-primary-700 mb-2">Promo Codes ({a.codes.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {a.codes.map((code: string) => (
                      <span key={code} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold-100 text-gold-800 text-sm rounded-full">
                        {code}
                        <button className="text-red-500 hover:text-red-700 text-xs font-bold" onClick={() => handleRemoveCode(a.id, code)}>&times;</button>
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-primary-500 mt-2">Total usage: {a.usage_count || 0}</p>
                </div>
              ) : (
                <p className="text-sm text-primary-400 border-t border-primary-100 pt-3">No codes assigned yet.</p>
              )}

              {showAddCode === a.id && (
                <div className="border-t border-primary-200 mt-3 pt-4">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="text-sm text-primary-700">Code</label>
                      <input type="text" className="input-field mt-1" placeholder="e.g., TRAVEL10" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
                    </div>
                    <div className="w-24">
                      <label className="text-sm text-primary-700">Commission</label>
                      <input type="number" className="input-field mt-1" value={form.commissionRate || ''} onChange={(e) => setForm({ ...form, commissionRate: Number(e.target.value) })} />
                    </div>
                    <button className="btn-primary" onClick={() => handleAddCode(a.id)}>Add</button>
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
