import React, { useEffect, useState } from 'react';
import { bffService } from '../../services/bffService';

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const BookingsTab: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bffService.getAffiliateDashboard()
      .then((d) => setBookings(d.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-primary-600">Loading bookings...</div>;

  return (
    <div>
      <h3 className="text-2xl font-serif text-primary-900 mb-6">Bookings Using Your Codes</h3>
      <p className="text-primary-600 mb-6">Track all bookings made with your promo codes.</p>

      <div className="bg-white rounded-lg overflow-hidden">
        {bookings.length === 0 ? (
          <p className="p-6 text-primary-500">No bookings yet.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-primary-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Order ID</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Guest</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Promo Code</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Total</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Commission</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b: any, i: number) => (
                <tr key={i} className="border-t border-primary-100">
                  <td className="p-4 text-primary-900 font-medium">{b.orderId}</td>
                  <td className="p-4 text-primary-900">{b.guestName || '—'}</td>
                  <td className="p-4">
                    <span className="inline-block px-2 py-1 bg-gold-100 text-gold-800 text-xs rounded font-medium">
                      {b.promoCode || '—'}
                    </span>
                  </td>
                  <td className="p-4 text-primary-900 font-medium">{fmt(b.totalAmount || 0)}</td>
                  <td className="p-4 text-gold-600 font-semibold">{fmt(b.commissionAmount || 0)}</td>
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                      b.commissionStatus === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {b.commissionStatus === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </span>
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

export default BookingsTab;
