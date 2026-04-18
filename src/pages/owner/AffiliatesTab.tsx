import React, { useEffect, useState } from 'react';
import { bffService } from '../../services/bffService';
import { useToast } from '../../contexts/ToastContext';

const AffiliatesTab: React.FC = () => {
  const { toast } = useToast();
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddCode, setShowAddCode] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [codeForm, setCodeForm] = useState({ code: '', commissionRate: 0, discountType: 'percentage', discountValue: 10 });

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
        commissionRate: codeForm.commissionRate,
        discountType: codeForm.discountType,
        discountValue: codeForm.discountValue,
      });
      toast('Promo code added successfully', 'success');
      setCodeForm({ code: '', commissionRate: 0, discountType: 'percentage', discountValue: 10 });
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
            <input type="password" className="input-field" placeholder="Login Password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
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
                  <button className="text-sm text-blue-600 hover:text-blue-800" onClick={() => { setShowAddCode(a.id); setCodeForm({ code: '', commissionRate: 0, discountType: 'percentage', discountValue: 10 }); }}>Add Code</button>
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
                <div className="border-t border-primary-200 mt-3 pt-4 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-sm text-primary-700">Code</label>
                      <input type="text" className="input-field mt-1" placeholder="e.g., TRAVEL10" value={codeForm.code} onChange={(e) => setCodeForm({ ...codeForm, code: e.target.value.toUpperCase() })} />
                    </div>
                    <div>
                      <label className="text-sm text-primary-700">Commission</label>
                      <input type="number" className="input-field mt-1" value={codeForm.commissionRate || ''} onChange={(e) => setCodeForm({ ...codeForm, commissionRate: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="text-sm text-primary-700">Discount Type</label>
                      <select className="input-field mt-1" value={codeForm.discountType} onChange={(e) => setCodeForm({ ...codeForm, discountType: e.target.value })}>
                        <option value="percentage">Percentage %</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-primary-700">Discount Value</label>
                      <input type="number" className="input-field mt-1" value={codeForm.discountValue || ''} onChange={(e) => setCodeForm({ ...codeForm, discountValue: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="flex gap-3">
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
