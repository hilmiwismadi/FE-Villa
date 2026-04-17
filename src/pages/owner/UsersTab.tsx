import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { AdminGuestDetailResponse, AdminGuestListItem } from '../../services/orderService';
import { getAdminGuestDetail, getAdminGuests } from '../../services/orderService';

const PAGE_SIZE = 20;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);

const UsersTab: React.FC = () => {
  const [guests, setGuests] = useState<AdminGuestListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('lastBookingDate');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedGuestPhone, setSelectedGuestPhone] = useState<string | null>(null);
  const [guestDetail, setGuestDetail] = useState<AdminGuestDetailResponse | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const loadGuests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminGuests({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        sortBy,
      });
      setGuests(response.guests);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load guest list');
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy]);

  useEffect(() => {
    loadGuests();
  }, [loadGuests]);

  const loadGuestDetail = async (phone: string) => {
    try {
      setSelectedGuestPhone(phone);
      setDetailLoading(true);
      const detail = await getAdminGuestDetail(phone);
      setGuestDetail(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load guest detail');
    } finally {
      setDetailLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const stats = useMemo(() => {
    const repeatCustomers = guests.filter((item) => item.bookingCount > 1).length;
    const averageNights = guests.length
      ? guests.reduce((sum, item) => sum + item.totalNights, 0) / guests.length
      : 0;

    return {
      repeatCustomers,
      averageNights,
    };
  }, [guests]);

  return (
    <div>
      <h2 className="text-2xl font-serif text-primary-900 mb-2">User Database</h2>
      <p className="text-primary-600 mb-6">Manage guests and view their booking history.</p>

      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            className="input-field"
            placeholder="Search name or phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <select className="input-field" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="lastBookingDate">Last Booking</option>
            <option value="bookingCount">Total Bookings</option>
            <option value="totalNights">Total Nights</option>
          </select>
          <div className="flex items-center text-sm text-primary-600 px-2">
            Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total}
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 rounded-lg p-4 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      ) : null}

      <div className="bg-white rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-primary-600">Loading guests...</div>
        ) : guests.length === 0 ? (
          <div className="p-12 text-center text-primary-600">No guests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-primary-50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-primary-700">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-primary-700">Phone</th>
                  <th className="text-left p-4 text-sm font-medium text-primary-700">Address</th>
                  <th className="text-left p-4 text-sm font-medium text-primary-700">Bookings</th>
                  <th className="text-left p-4 text-sm font-medium text-primary-700">Total Nights</th>
                  <th className="text-left p-4 text-sm font-medium text-primary-700">Last Booking</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => (
                  <tr
                    key={guest.phone}
                    onClick={() => loadGuestDetail(guest.phone)}
                    className={`border-t border-primary-100 hover:bg-primary-25 cursor-pointer ${
                      selectedGuestPhone === guest.phone ? 'bg-primary-25' : ''
                    }`}
                  >
                    <td className="p-4 text-primary-900 font-medium">{guest.name}</td>
                    <td className="p-4 text-primary-700">{guest.phone}</td>
                    <td className="p-4 text-primary-700">{guest.address}</td>
                    <td className="p-4 text-primary-900">{guest.bookingCount}</td>
                    <td className="p-4 text-primary-900">{guest.totalNights}</td>
                    <td className="p-4 text-primary-700">{formatDate(guest.lastBookingDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          type="button"
          className="px-4 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 hover:bg-primary-50 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Previous
        </button>
        <p className="text-sm text-primary-600">
          Page {page} of {totalPages}
        </p>
        <button
          type="button"
          className="px-4 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 hover:bg-primary-50 disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Guests in Current Page</p>
          <p className="text-3xl font-serif text-primary-900">{guests.length}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Repeat Customers</p>
          <p className="text-3xl font-serif text-primary-900">{stats.repeatCustomers}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-primary-600 mb-2">Average Nights</p>
          <p className="text-3xl font-serif text-primary-900">{stats.averageNights.toFixed(1)}</p>
        </div>
      </div>

      {selectedGuestPhone ? (
        <div className="bg-white rounded-lg p-6 mt-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-serif text-primary-900">Guest Detail</h3>
            <button
              type="button"
              className="text-sm text-primary-600 hover:text-primary-800"
              onClick={() => {
                setSelectedGuestPhone(null);
                setGuestDetail(null);
              }}
            >
              Close
            </button>
          </div>
          {detailLoading ? (
            <p className="text-primary-600">Loading detail...</p>
          ) : guestDetail ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-5">
                <p>
                  <span className="text-primary-600">Name:</span> <span className="text-primary-900">{guestDetail.name}</span>
                </p>
                <p>
                  <span className="text-primary-600">Phone:</span> <span className="text-primary-900">{guestDetail.phone}</span>
                </p>
                <p className="md:col-span-2">
                  <span className="text-primary-600">Address:</span>{' '}
                  <span className="text-primary-900">{guestDetail.address}</span>
                </p>
                <p>
                  <span className="text-primary-600">Total Bookings:</span>{' '}
                  <span className="text-primary-900">{guestDetail.bookingCount}</span>
                </p>
                <p>
                  <span className="text-primary-600">Total Nights:</span>{' '}
                  <span className="text-primary-900">{guestDetail.totalNights}</span>
                </p>
              </div>

              <h4 className="text-sm font-medium text-primary-800 mb-3">Booking History</h4>
              {guestDetail.bookings.length === 0 ? (
                <p className="text-primary-600 text-sm">No booking history.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead className="bg-primary-50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-primary-700">Order ID</th>
                        <th className="text-left p-3 text-sm font-medium text-primary-700">Status</th>
                        <th className="text-left p-3 text-sm font-medium text-primary-700">Check-in</th>
                        <th className="text-left p-3 text-sm font-medium text-primary-700">Check-out</th>
                        <th className="text-left p-3 text-sm font-medium text-primary-700">Nights</th>
                        <th className="text-left p-3 text-sm font-medium text-primary-700">Total</th>
                        <th className="text-left p-3 text-sm font-medium text-primary-700">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guestDetail.bookings.map((booking) => (
                        <tr key={booking.orderId} className="border-t border-primary-100">
                          <td className="p-3 text-primary-900">{booking.orderId}</td>
                          <td className="p-3 text-primary-700">{booking.status}</td>
                          <td className="p-3 text-primary-700">{formatDate(booking.checkInDate)}</td>
                          <td className="p-3 text-primary-700">{formatDate(booking.checkOutDate)}</td>
                          <td className="p-3 text-primary-700">{booking.nightCount}</td>
                          <td className="p-3 text-primary-900">{formatCurrency(booking.totalAmount)}</td>
                          <td className="p-3 text-primary-700">{formatDateTime(booking.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <p className="text-primary-600">No detail selected.</p>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default UsersTab;
