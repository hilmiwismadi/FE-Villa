import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { bffService, type AffiliateDashboardData } from '../../services/bffService';

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || window.location.origin;

const MarketingTab: React.FC = () => {
  const { toast } = useToast();
  const [codes, setCodes] = useState<AffiliateDashboardData['codes']>([]);

  useEffect(() => {
    bffService.getAffiliateDashboard()
      .then((d) => setCodes(d.codes))
      .catch(() => {});
  }, []);

  const primaryCode = codes[0]?.code || 'YOURCODE';
  const primaryDiscount = codes[0]?.discountType === 'percentage' ? `${codes[0]?.discountValue}%` : '';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast('Copied to clipboard!', 'success');
  };
  return (
    <div>
      <h3 className="text-2xl font-serif text-primary-900 mb-6">Marketing Materials</h3>
      <p className="text-primary-600 mb-8">Download images, banners, and copy to promote Villa Sekipan.</p>

      <div className="bg-white rounded-lg p-6 mb-8">
        <h4 className="text-lg font-serif text-primary-900 mb-4">Quick Links</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">Website Link</label>
            <div className="flex gap-2">
              <input type="text" value={PUBLIC_URL} readOnly className="input-field flex-1" />
              <button onClick={() => copyToClipboard(PUBLIC_URL)} className="btn-secondary whitespace-nowrap">Copy</button>
            </div>
          </div>
          {codes.length === 0 && <p className="text-primary-500 text-sm">No promo codes assigned yet.</p>}
          {codes.map((c) => (
            <div key={c.code}>
              <label className="block text-sm font-medium text-primary-700 mb-2">Booking Link — {c.code} ({c.discountType === 'percentage' ? `${c.discountValue}%` : ''} off)</label>
              <div className="flex gap-2">
                <input type="text" value={`${PUBLIC_URL}/book?code=${c.code}`} readOnly className="input-field flex-1" />
                <button onClick={() => copyToClipboard(`${PUBLIC_URL}/book?code=${c.code}`)} className="btn-secondary whitespace-nowrap">Copy</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 mb-8">
        <h4 className="text-lg font-serif text-primary-900 mb-4">Pre-written Copy</h4>
        <div className="space-y-4">
          <div className="p-4 border border-primary-200 rounded-lg">
            <p className="text-sm font-medium text-primary-700 mb-2">Social Media Post</p>
            <p className="text-primary-900 mb-3 italic">
              "Experience authentic Japanese luxury at Villa Sekipan. This stunning villa combines traditional architecture with modern comfort. Use code {primaryCode} for {primaryDiscount} off your booking! Link in bio."
            </p>
            <button
              onClick={() => copyToClipboard(`Experience authentic Japanese luxury at Villa Sekipan. This stunning villa combines traditional architecture with modern comfort. Use code ${primaryCode} for ${primaryDiscount} off your booking! ${PUBLIC_URL}/book?code=${primaryCode}`)}
              className="text-sm text-gold-600 hover:text-gold-700 font-medium"
            >
              Copy to Clipboard
            </button>
          </div>

          <div className="p-4 border border-primary-200 rounded-lg">
            <p className="text-sm font-medium text-primary-700 mb-2">Email Template</p>
            <p className="text-primary-900 mb-3 italic">
              "Looking for your next getaway? Villa Sekipan offers the perfect blend of tranquility and luxury. Set on a hillside with breathtaking views, this Japanese-inspired villa is the ultimate escape. Book now with code {primaryCode} and save {primaryDiscount}!"
            </p>
            <button
              onClick={() => copyToClipboard(`Looking for your next getaway? Villa Sekipan offers the perfect blend of tranquility and luxury. Set on a hillside with breathtaking views, this Japanese-inspired villa is the ultimate escape. Book now with code ${primaryCode} and save ${primaryDiscount}! ${PUBLIC_URL}/book?code=${primaryCode}`)}
              className="text-sm text-gold-600 hover:text-gold-700 font-medium"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6">
        <h4 className="text-lg font-serif text-primary-900 mb-4">Image Assets</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { src: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', alt: 'Villa exterior', label: 'Villa Exterior' },
            { src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', alt: 'Interior view', label: 'Interior View' },
            { src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', alt: 'Pool area', label: 'Pool Area' },
          ].map((img) => (
            <div key={img.label} className="border border-primary-200 rounded-lg overflow-hidden">
              <img src={img.src} alt={img.alt} className="w-full h-48 object-cover" />
              <div className="p-4">
                <p className="text-sm text-primary-900 mb-2">{img.label}</p>
                <button className="text-sm text-gold-600 hover:text-gold-700 font-medium">Download</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketingTab;
