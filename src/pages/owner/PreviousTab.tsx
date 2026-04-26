import React, { useState, useEffect } from 'react';
import { formatCurrency } from './ownerData';
import { getAdminOrders, type OrderResponse } from '../../services/orderServiceDirectBE';

const PreviousTab: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'in_transaction', label: 'In Transaction' },
    { value: 'pending', label: 'Pending' },
    { value: 'booked', label: 'Booked' },
    { value: 'check_in', label: 'Check-in' },
    { value: 'completed', label: 'Completed' },
    { value: 'expired', label: 'Expired' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      in_transaction: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Transaction' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      booked: { bg: 'bg-green-100', text: 'text-green-800', label: 'Booked' },
      check_in: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Check-in' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completed' },
      expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expired' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: status,
    };

    return (
      <span className={`inline-block px-3 py-1 ${config.bg} ${config.text} text-sm rounded-full`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTimestamp = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatNullableTimestamp = (dateString: string | null) => {
    return dateString ? formatTimestamp(dateString) : '-';
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminOrders(statusFilter || undefined, currentPage);
      setOrders(response.orders);
      setTotalOrders(response.total);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, currentPage]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const totalPages = Math.ceil(totalOrders / 20);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-serif text-primary-900 mb-1">Order History</h2>
          <p className="text-primary-600">View and manage all booking orders.</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 text-primary-900"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-primary-600">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-primary-600">No orders found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
            <thead className="bg-primary-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Order ID</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Guest Name</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Guest Phone</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Transaction Timestamp</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Check-in</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Check-out</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Nights</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Total</th>
                <th className="text-left p-4 text-sm font-medium text-primary-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.orderId}
                  className="border-t border-primary-100 hover:bg-primary-50 cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="p-4 text-primary-900 font-medium">{order.orderId}</td>
                  <td className="p-4 text-primary-900">{order.guestName}</td>
                  <td className="p-4 text-primary-700">{order.guestPhone}</td>
                  <td className="p-4 text-primary-700">{formatTimestamp(order.createdAt)}</td>
                  <td className="p-4 text-primary-700">{formatDate(order.checkInDate)}</td>
                  <td className="p-4 text-primary-700">{formatDate(order.checkOutDate)}</td>
                  <td className="p-4 text-primary-700">{order.nightCount}</td>
                  <td className="p-4 text-primary-900">{formatCurrency(order.totalAmount)}</td>
                  <td className="p-4">{getStatusBadge(order.status)}</td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-primary-50 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-primary-600">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalOrders)} of {totalOrders} orders
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-primary-900">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-primary-200 rounded-lg text-primary-900 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary-100">
              <h3 className="text-lg font-semibold text-primary-900">Order Detail</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-primary-500 hover:text-primary-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <p><strong>Order ID:</strong> {selectedOrder.orderId}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Guest Name:</strong> {selectedOrder.guestName}</p>
              <p><strong>Guest Phone:</strong> {selectedOrder.guestPhone}</p>
              <p className="md:col-span-2"><strong>Guest Address:</strong> {selectedOrder.guestAddress}</p>
              <p><strong>Guest Count:</strong> {selectedOrder.guestCount}</p>
              <p><strong>Extra Beds:</strong> {selectedOrder.extraBeds}</p>
              <p><strong>Check-in Date:</strong> {formatDate(selectedOrder.checkInDate)}</p>
              <p><strong>Check-in Hour:</strong> {selectedOrder.checkInHour}</p>
              <p><strong>Check-out Date:</strong> {formatDate(selectedOrder.checkOutDate)}</p>
              <p><strong>Check-out Hour:</strong> {selectedOrder.checkOutHour}</p>
              <p><strong>Nights:</strong> {selectedOrder.nightCount}</p>
              <p><strong>Estimated Check-in:</strong> {selectedOrder.estimatedCheckIn}</p>
              <p><strong>Subtotal:</strong> {formatCurrency(selectedOrder.subtotal)}</p>
              <p><strong>Discount:</strong> {formatCurrency(selectedOrder.discountAmount)}</p>
              {(selectedOrder.promos?.length
                ? selectedOrder.promos
                : (selectedOrder.promoCode ? [{ promoCode: selectedOrder.promoCode, discountAmount: selectedOrder.discountAmount }] : [])
              ).map((promo) => (
                <p key={`${promo.promoCode}-${promo.discountAmount}`}><strong>Promo {promo.promoCode}:</strong> -{formatCurrency(promo.discountAmount)}</p>
              ))}
              <p><strong>Unique Code:</strong> {selectedOrder.uniqueCode}</p>
              <p><strong>Total:</strong> {formatCurrency(selectedOrder.totalAmount)}</p>
              <p><strong>Transaction Timestamp:</strong> {formatTimestamp(selectedOrder.createdAt)}</p>
              <p><strong>Payment Confirmed:</strong> {formatNullableTimestamp(selectedOrder.paymentConfirmedAt)}</p>
              <p><strong>Payment Deadline:</strong> {formatNullableTimestamp(selectedOrder.paymentDeadline)}</p>
              <p><strong>Last Updated:</strong> {formatTimestamp(selectedOrder.updatedAt)}</p>
              {selectedOrder.rejectionReason && (
                <p className="md:col-span-2"><strong>Rejection Reason:</strong> {selectedOrder.rejectionReason}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviousTab;
