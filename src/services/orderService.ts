/**
 * OrderService API Client
 * Base URL: http://localhost:4000 (dev) | http://<VPS_IP>:2470 (prod)
 */

const BASE_URL = import.meta.env.VITE_BFF_URL || 'http://localhost:3100';

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
  estimatedCheckIn?: '14-16' | '16-18' | '18-20' | '20-22';
  checkInDate: string;
  checkInHour?: string;
  checkOutDate: string;
  checkOutHour?: string;
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

export interface CustomPricingRuleResponse {
  id: string;
  type: string;
  amount: number | null;
  customAmount: number | null;
  startDate: string | null;
  endDate: string | null;
  dayOfWeek: number[] | null;
  blockedDate: string | null;
  blockReason: string | null;
  label: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminGuestListItem {
  phone: string;
  name: string;
  address: string;
  bookingCount: number;
  totalNights: number;
  lastBookingDate: string;
}

export interface AdminGuestDetailResponse {
  phone: string;
  name: string;
  address: string;
  bookingCount: number;
  totalNights: number;
  lastBookingDate: string;
  bookings: Array<{
    orderId: string;
    status: string;
    checkInDate: string;
    checkInHour: string;
    checkOutDate: string;
    checkOutHour: string;
    nightCount: number;
    totalAmount: number;
    createdAt: string;
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
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
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
  return apiRequest<CalendarResponse>(`/bff/order/calendar?month=${encodeURIComponent(month)}`);
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
    `/bff/order/availability?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`
  );
}

/**
 * Get order details by ID
 * @param orderId - Order ID (e.g., "VY-260301-001")
 */
export async function getOrder(orderId: string): Promise<OrderResponse> {
  return apiRequest<OrderResponse>(`/bff/order/${encodeURIComponent(orderId)}`);
}

/**
 * Create a new booking order. Starts a 10-minute payment timer.
 */
export async function createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
  return apiRequest<OrderResponse>('/bff/order/create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Confirm payment was made. Transitions order from in_transaction → pending.
 */
export async function confirmPayment(orderId: string): Promise<ConfirmPaymentResponse> {
  return apiRequest<ConfirmPaymentResponse>(`/bff/order/${encodeURIComponent(orderId)}/confirm-payment`, {
    method: 'POST',
  });
}

/**
 * Check payment timer and expiry status
 */
export async function getPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
  return apiRequest<PaymentStatusResponse>(`/bff/order/${encodeURIComponent(orderId)}/payment-status`);
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
  return apiRequest(`/bff/order/my-bookings?page=${page}&limit=${limit}`, {
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
  let url = `/bff/order/admin/list?page=${page}&limit=${limit}`;
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
  return apiRequest(`/bff/order/${encodeURIComponent(orderId)}/approve`, {
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
  return apiRequest(`/bff/order/${encodeURIComponent(orderId)}/reject`, {
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
  return apiRequest(`/bff/order/${encodeURIComponent(orderId)}/check-in`, {
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
  return apiRequest(`/bff/order/${encodeURIComponent(orderId)}/complete`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
}

/**
 * Get dashboard summary
 */
export async function getDashboard(): Promise<DashboardResponse> {
  return apiRequest('/bff/order/admin/dashboard', {
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
  let url = `/bff/order/admin/revenue?period=${period}&year=${year}`;
  if (month) url += `&month=${month}`;
  return apiRequest(url, {
    headers: getAuthHeaders(),
  });
}

/**
 * List active custom pricing rules (admin auth required)
 */
export async function getAdminCustomPricingRules(
  page = 1,
  limit = 200
): Promise<{
  rules: CustomPricingRuleResponse[];
  total: number;
}> {
  return apiRequest(`/bff/order/admin/pricing/custom?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders(),
  });
}

/**
 * Get default price rule
 */
export async function getAdminDefaultPricingRule(): Promise<CustomPricingRuleResponse> {
  return apiRequest('/bff/order/admin/pricing/default', {
    headers: getAuthHeaders(),
  });
}

/**
 * Set default price rule
 */
export async function setAdminDefaultPricingRule(amount: number): Promise<CustomPricingRuleResponse> {
  return apiRequest('/bff/order/admin/pricing/default', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ amount }),
  });
}

/**
 * Create a custom pricing rule
 */
export async function createAdminCustomPricingRule(data: {
  frequency: 'onetime' | 'weekly';
  amount: number;
  startDate: string;
  endDate: string;
  label: string;
  dayOfWeek?: number[];
}): Promise<CustomPricingRuleResponse> {
  return apiRequest('/bff/order/admin/pricing/custom', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * Delete a custom pricing rule by ID
 */
export async function deleteAdminCustomPricingRule(id: string): Promise<{ message: string }> {
  return apiRequest(`/bff/order/admin/pricing/custom/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}

/**
 * List blocked dates
 */
export async function getAdminBlockedDates(): Promise<{
  blocks: CustomPricingRuleResponse[];
}> {
  return apiRequest('/bff/order/admin/pricing/blocks', {
    headers: getAuthHeaders(),
  });
}

/**
 * Block a date
 */
export async function createAdminBlockedDate(date: string, reason: string): Promise<CustomPricingRuleResponse> {
  return apiRequest('/bff/order/admin/pricing/block', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ date, reason }),
  });
}

/**
 * Unblock a date by block ID
 */
export async function deleteAdminBlockedDate(id: string): Promise<{ message: string }> {
  return apiRequest(`/bff/order/admin/pricing/block/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}

/**
 * List guests for admin users
 */
export async function getAdminGuests(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
  } = {}
): Promise<{
  guests: AdminGuestListItem[];
  total: number;
  page: number;
  limit: number;
}> {
  const search = new URLSearchParams();
  search.set('page', String(params.page ?? 1));
  search.set('limit', String(params.limit ?? 20));
  if (params.search) search.set('search', params.search);
  if (params.sortBy) search.set('sortBy', params.sortBy);

  return apiRequest(`/bff/order/admin/guests?${search.toString()}`, {
    headers: getAuthHeaders(),
  });
}

/**
 * Get details and booking history for one guest
 */
export async function getAdminGuestDetail(phone: string): Promise<AdminGuestDetailResponse> {
  return apiRequest(`/bff/order/admin/guests/${encodeURIComponent(phone)}`, {
    headers: getAuthHeaders(),
  });
}
