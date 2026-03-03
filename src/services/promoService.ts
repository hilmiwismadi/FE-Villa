/**
 * PromoService API Client
 * Base URL: http://localhost:4002 (dev) | http://<VPS_IP>:9999 (prod)
 */

import { ApiError } from './errors';

const BASE_URL = import.meta.env.VITE_PROMO_SERVICE_URL || 'https://villa-promo.izcy.tech';

// Common types
export interface ValidatePromoRequest {
  code: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guestPhone: string;
}

export interface ValidatePromoResponse {
  valid: boolean;
  discountType: 'percentage' | 'fixed';
  discountValue?: number;
  dayCondition?: 'all' | 'weekday' | 'weekend' | 'custom';
  customDays?: number[] | null;
  reason?: string; // Only when valid: false
}

export interface PromoResponse {
  code: string;
  type: 'affiliate' | 'automatic';
  isActive: boolean;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  dayCondition: 'all' | 'weekday' | 'weekend' | 'custom';
  customDays: number[] | null;
  affiliatorId?: string;
  commissionAmount?: number;
  triggerType?: 'booking_count' | 'total_nights' | null;
  triggerThreshold?: number | null;
  expiryType: 'date' | 'duration_days' | 'none';
  expiryDate?: string | null;
  expiryDurationDays?: number | null;
  usageCount: number;
  maxUsage: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplyPromoRequest {
  promoCode: string;
  orderId: string;
  guestPhone: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  nightlyBreakdown: Array<{
    date: string;
    basePrice: number;
  }>;
  userId?: string;
  guestBookingCount?: number;
  guestTotalNights?: number;
}

export interface ApplyPromoResponse {
  discountAmount: number;
  commissionAmount: number;
  affiliatorId?: string;
  promoId: string;
}

export interface PromoUsage {
  promoCode: string;
  orderId: string;
  guestName: string;
  guestPhone: string;
  discountApplied: number;
  commissionAmount: number;
  commissionStatus: string;
  bookingCheckInDate: string;
  usedAt: string;
}

// Re-export ApiError for use by other files
export { ApiError };

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
 * Validate a promo code before booking. Does NOT consume usage.
 * @param data - Promo code, dates, and guest phone
 */
export async function validatePromo(data: ValidatePromoRequest): Promise<ValidatePromoResponse> {
  const params = new URLSearchParams({
    code: data.code,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guestPhone: data.guestPhone,
  });
  return apiRequest<ValidatePromoResponse>(`/promo/validate?${params.toString()}`);
}

// ========== INTERNAL ENDPOINTS ==========

/**
 * Apply a promo code to an order. Records usage and calculates discount.
 * Note: This is typically called internally by OrderService, not directly from frontend.
 */
export async function applyPromo(data: ApplyPromoRequest): Promise<ApplyPromoResponse> {
  return apiRequest<ApplyPromoResponse>('/promo/apply', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ========== ADMIN ENDPOINTS ==========

/**
 * Helper to add auth header
 */
function getAuthHeaders(): HeadersInit {
  const auth = localStorage.getItem('auth');
  return auth ? { Authorization: `Bearer ${auth}` } : {};
}

/**
 * Create a new promo code
 */
export async function createPromo(data: {
  code: string;
  type: 'affiliate' | 'automatic';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  dayCondition: 'all' | 'weekday' | 'weekend' | 'custom';
  customDays?: number[];
  expiryType: 'date' | 'duration_days' | 'none';
  affiliatorId?: string;
  commissionAmount?: number;
  triggerType?: 'booking_count' | 'total_nights';
  triggerThreshold?: number;
  expiryDate?: string;
  expiryDurationDays?: number;
  maxUsage?: number;
}): Promise<PromoResponse> {
  return apiRequest<PromoResponse>('/promo/admin/create', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * List all promo codes with optional filters
 */
export async function listPromos(
  type?: 'affiliate' | 'automatic',
  isActive?: boolean,
  page = 1,
  limit = 20
): Promise<{
  promos: PromoResponse[];
  total: number;
  page: number;
  limit: number;
}> {
  let url = `/promo/admin/list?page=${page}&limit=${limit}`;
  if (type) url += `&type=${type}`;
  if (isActive !== undefined) url += `&isActive=${isActive}`;
  return apiRequest(url, {
    headers: getAuthHeaders(),
  });
}

/**
 * Get a single promo by code
 */
export async function getPromo(id: string): Promise<PromoResponse> {
  return apiRequest<PromoResponse>(`/promo/admin/${encodeURIComponent(id)}`, {
    headers: getAuthHeaders(),
  });
}

/**
 * Update an existing promo
 */
export async function updatePromo(id: string, data: Partial<PromoResponse>): Promise<PromoResponse> {
  return apiRequest<PromoResponse>(`/promo/admin/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * Soft-delete (deactivate) a promo
 */
export async function deactivatePromo(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/promo/admin/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}

/**
 * View usage history for a promo code
 */
export async function getPromoUsage(
  id: string,
  page = 1,
  limit = 20
): Promise<{
  usages: PromoUsage[];
  total: number;
  page: number;
  limit: number;
}> {
  return apiRequest(`/promo/admin/${encodeURIComponent(id)}/usage?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders(),
  });
}

// ========== AFFILIATE ENDPOINTS ==========

/**
 * Get all promo codes belonging to logged-in affiliate
 */
export async function getAffiliateCodes(): Promise<{
  codes: Array<{
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    commissionAmount: number;
    usageCount: number;
    totalCommission: number;
  }>;
}> {
  return apiRequest('/promo/affiliate/codes', {
    headers: getAuthHeaders(),
  });
}

// ========== INTERNAL COMMISSION ENDPOINTS ==========

/**
 * Confirm pending commissions when order is completed
 */
export async function confirmCommission(orderId: string): Promise<{
  orderId: string;
  updated: number;
  message: string;
}> {
  return apiRequest(`/promo/internal/commission/confirm`, {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  });
}

/**
 * Cancel pending commissions when order is rejected
 */
export async function cancelCommission(orderId: string): Promise<{
  orderId: string;
  updated: number;
  message: string;
}> {
  return apiRequest(`/promo/internal/commission/cancel`, {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  });
}

/**
 * Reverse promo usage when order expires
 */
export async function reverseUsage(orderId: string): Promise<{
  orderId: string;
  reversed: boolean;
  message: string;
}> {
  return apiRequest(`/promo/internal/usage/reverse`, {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  });
}

/**
 * Get first active promo code for an affiliate (for manual orders)
 */
export async function getAffiliatePromo(affiliatorId: string): Promise<{
  found: boolean;
  promoCode?: string;
}> {
  return apiRequest(`/promo/internal/affiliate-promo?affiliatorId=${encodeURIComponent(affiliatorId)}`);
}
