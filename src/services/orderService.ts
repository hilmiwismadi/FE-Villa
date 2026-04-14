/**
 * OrderService API Client
 * Base URL: http://localhost:4000 (dev) | http://<VPS_IP>:2470 (prod)
 */

const BASE_URL = import.meta.env.VITE_ORDER_SERVICE_URL || 'https://yutaka-order.izcy.tech';

// Import CalendarDay type from types to avoid duplicate
import type { CalendarDay } from '../types';
import { ApiError } from './errors';

export interface CalendarResponse {
  month: string; // YYYY-MM
  days: CalendarDay[];
}

export interface AvailabilityResponse {
  available: boolean;
  blockedDates: string[];
  conflictingDates: string[];
}

export interface OrderResponse {
  orderId: string;
  status: 'in_transaction' | 'pending' | 'booked' | 'check_in' | 'completed' | 'expired' | 'rejected';
  guestName: string;
  guestPhone: string;
  guestAddress: string;
  guestCount: number;
  extraBeds: number;
  estimatedCheckIn: string;
  checkInDate: string;
  checkOutDate: string;
  nightCount: number;
  nightlyBreakdown: Array<{
    date: string;
    basePrice: number;
    source: string;
  }>;
  subtotal: number;
  promoCode: string | null;
  discountAmount: number;
  uniqueCode: number;
  totalAmount: number;
  paymentDeadline: string | null;
  paymentConfirmedAt: string | null;
  rejectionReason: string | null;
  isManualOrder: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  guestName: string;
  guestPhone: string;
  guestAddress: string;
  guestCount: number;
  extraBeds: number;
  estimatedCheckIn: '14-16' | '16-18' | '18-20' | '20-22';
  checkInDate: string;
  checkOutDate: string;
  promoCode?: string;
}

export interface PaymentStatusResponse {
  orderId: string;
  status: 'in_transaction' | 'pending' | 'expired' | 'rejected';
  remainingSeconds: number;
  isExpired: boolean;
  totalAmount: number;
}

export interface ConfirmPaymentResponse {
  orderId: string;
  status: string;
  message: string;
  adminWaNumber: string;
}

export interface DashboardResponse {
  currentMonthRevenue: number;
  yearToDateRevenue: number;
  occupancyRate: number;
  pendingOrders: number;
  activeBookings: number;
  totalGuests: number;
}

export interface RevenueResponse {
  period: 'monthly' | 'yearly';
  year: number;
  month?: number;
  totalRevenue: number;
  totalBookings: number;
  totalNights: number;
  breakdown: Array<{
    label: string;
    revenue: number;
    bookings: number;
  }>;
}

// Re-export ApiError from shared errors file
export { ApiError } from './errors';

// Helper function for API calls
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API Error Response:', errorData);
      throw new ApiError(
        errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Network error or server unavailable');
  }
}

// ========== PUBLIC ENDPOINTS ==========

/**
 * Get calendar view with status and price per day for a month
 * @param month - Format: YYYY-MM (e.g., "2026-03")
 */
export async function getCalendar(month: string): Promise<CalendarResponse> {
  return apiRequest<CalendarResponse>(`/order/calendar?month=${encodeURIComponent(month)}`);
}

/**
 * Check if date range is available for booking
 * @param checkIn - Format: YYYY-MM-DD
 * @param checkOut - Format: YYYY-MM-DD
 */
export async function checkAvailability(
  checkIn: string,
  checkOut: string
): Promise<AvailabilityResponse> {
  return apiRequest<AvailabilityResponse>(
    `/order/availability?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`
  );
}

/**
 * Get order details by ID
 * @param orderId - Order ID (e.g., "VY-260301-001")
 */
export async function getOrder(orderId: string): Promise<OrderResponse> {
  return apiRequest<OrderResponse>(`/order/${encodeURIComponent(orderId)}`);
}

/**
 * Create a new booking order. Starts a 10-minute payment timer.
 */
export async function createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
  return apiRequest<OrderResponse>('/order/create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Confirm payment was made. Transitions order from in_transaction → pending.
 */
export async function confirmPayment(orderId: string): Promise<ConfirmPaymentResponse> {
  return apiRequest<ConfirmPaymentResponse>(`/order/${encodeURIComponent(orderId)}/confirm-payment`, {
    method: 'POST',
  });
}

/**
 * Check payment timer and expiry status
 */
export async function getPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
  return apiRequest<PaymentStatusResponse>(`/order/${encodeURIComponent(orderId)}/payment-status`);
}

// ========== AUTHENTICATED ENDPOINTS ==========

/**
 * Helper to add auth header
 */
function getAuthHeaders(): HeadersInit {
  try {
    const raw = localStorage.getItem('villa-auth');
    if (!raw) return {};
    const auth = JSON.parse(raw);
    return auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {};
  } catch {
    return {};
  }
}

/**
 * Get the logged-in user's booking history
 */
export async function getMyBookings(page = 1, limit = 20): Promise<{
  bookings: OrderResponse[];
  total: number;
  page: number;
  limit: number;
}> {
  return apiRequest(`/order/my-bookings?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders(),
  });
}

// ========== ADMIN ENDPOINTS ==========

/**
 * List all orders with optional status filter
 */
export async function getAdminOrders(
  status?: string,
  page = 1,
  limit = 20
): Promise<{
  orders: OrderResponse[];
  total: number;
  page: number;
  limit: number;
}> {
  let url = `/order/admin/list?page=${page}&limit=${limit}`;
  if (status) url += `&status=${encodeURIComponent(status)}`;
  return apiRequest(url, {
    headers: getAuthHeaders(),
  });
}

/**
 * Approve a pending order → booked
 */
export async function approveOrder(orderId: string): Promise<{
  orderId: string;
  status: string;
  message: string;
  caretakerWaNumber: string;
  houseRules: string;
}> {
  return apiRequest(`/order/${encodeURIComponent(orderId)}/approve`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
}

/**
 * Reject a pending order. Requires a reason.
 */
export async function rejectOrder(orderId: string, reason: string): Promise<{
  orderId: string;
  status: string;
  message: string;
}> {
  return apiRequest(`/order/${encodeURIComponent(orderId)}/reject`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason }),
  });
}

/**
 * Mark guest as checked in. booked → check_in
 */
export async function checkInOrder(orderId: string): Promise<{
  orderId: string;
  status: string;
  message: string;
}> {
  return apiRequest(`/order/${encodeURIComponent(orderId)}/check-in`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
}

/**
 * Mark order as complete (checkout). check_in → completed
 */
export async function completeOrder(orderId: string): Promise<{
  orderId: string;
  status: string;
  message: string;
}> {
  return apiRequest(`/order/${encodeURIComponent(orderId)}/complete`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
}

/**
 * Get dashboard summary
 */
export async function getDashboard(): Promise<DashboardResponse> {
  return apiRequest('/order/admin/dashboard', {
    headers: getAuthHeaders(),
  });
}

/**
 * Get revenue report (monthly or yearly)
 */
export async function getRevenue(
  period: 'monthly' | 'yearly',
  year: number,
  month?: number
): Promise<RevenueResponse> {
  let url = `/order/admin/revenue?period=${period}&year=${year}`;
  if (month) url += `&month=${month}`;
  return apiRequest(url, {
    headers: getAuthHeaders(),
  });
}
