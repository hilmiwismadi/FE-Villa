import { ApiError, extractApiErrorMessage } from './errors';

const BFF_URL = import.meta.env.VITE_BFF_URL || 'http://localhost:3100';

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

async function bffRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BFF_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = extractApiErrorMessage(errorData, response.status, response.statusText);
      throw new ApiError(message, response.status, errorData);
    }
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Network error or BFF unavailable');
  }
}

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  phone: string;
  codes: string[];
  is_active: boolean;
  usage_count: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AffiliateDashboardData {
  codes: Array<{
    code: string;
    discountType: string;
    discountValue: number;
    commissionAmount: number;
    usageCount: number;
    totalCommission: number;
  }>;
  stats: {
    totalBookings: number;
    confirmedCommission: number;
    pendingCommission: number;
    totalCommission: number;
    revenue: number;
  };
  bookings: Array<any>;
  disbursement: {
    totalDisbursed: number;
    pendingPayouts: number;
    availableForPayout: number;
    recentDisbursements: Array<Disbursement>;
  };
}

export interface Disbursement {
  id: string;
  affiliate_id: string;
  affiliate_code: string;
  quota: number;
  status: "pending" | "processed" | "rejected";
  processed_at?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OwnerDashboardData {
  affiliates: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
    codeCount: number;
    usageCount: number;
  }>;
  promos: Array<{
    code: string;
    discountType: string;
    discountValue: number;
    commissionAmount: number;
    usageCount: number;
    affiliatorId: string;
    isActive: boolean;
  }>;
  stats: {
    totalAffiliates: number;
    totalPromos: number;
    totalRevenue: number;
    totalCommission: number;
    totalBookings: number;
  };
  recentOrders: Array<any>;
}

export const bffService = {
  createAffiliate: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => bffRequest<{ user: any; affiliate: Affiliate }>('/bff/affiliate/create', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  listAffiliates: () => bffRequest<Affiliate[]>('/bff/affiliate/list'),

  getMyAffiliate: () => bffRequest<Affiliate>('/bff/affiliate/me'),

  getAffiliate: (id: string) => bffRequest<Affiliate>(`/bff/affiliate/${id}`),

  updateAffiliate: (id: string, data: Partial<Affiliate>) => bffRequest<Affiliate>(`/bff/affiliate/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  deleteAffiliate: (id: string) => bffRequest<{ message: string }>(`/bff/affiliate/${id}`, {
    method: 'DELETE',
  }),

  addAffiliateCode: (id: string, data: {
    code: string;
    commissionRate: number;
    discountType: string;
    discountValue: number;
    expiryType?: 'date' | 'duration_days' | 'none';
    expiryDate?: string;
    expiryDurationDays?: number;
    maxUsage?: number;
  }) =>
    bffRequest<{ message: string }>(`/bff/affiliate/${id}/code`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  removeAffiliateCode: (id: string, code: string) =>
    bffRequest<{ message: string }>(`/bff/affiliate/${id}/code`, {
      method: 'DELETE',
      body: JSON.stringify({ code }),
    }),

  getAffiliateDashboard: () => bffRequest<AffiliateDashboardData>('/bff/dashboard/affiliate'),

  getOwnerDashboard: () => bffRequest<OwnerDashboardData>('/bff/dashboard/owner'),

  listPromos: (type?: string, isActive?: string) => {
    let url = '/bff/promo/list?';
    if (type) url += `type=${type}&`;
    if (isActive) url += `isActive=${isActive}&`;
    return bffRequest<{ promos: any[]; total: number }>(url);
  },

  getPromoUsage: (code: string) => bffRequest<{ usages: any[]; total: number }>(`/bff/promo/${encodeURIComponent(code)}/usage`),

  deactivatePromo: (code: string) => bffRequest<{ message: string }>(`/bff/promo/${encodeURIComponent(code)}`, {
    method: 'DELETE',
  }),

  createPromo: (data: Record<string, unknown>) => bffRequest<any>('/bff/promo/create', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getDisbursementBalance: () => bffRequest<{
    affiliateId: string;
    totalUsage: number;
    unclaimedQuota: number;
    pendingPayouts: number;
    totalDisbursed: number;
    availableForPayout: number;
    disbursements: Disbursement[];
  }>('/bff/disbursement/balance'),

  requestPayout: (amount: number, note?: string) => bffRequest<Disbursement>('/bff/disbursement/request', {
    method: 'POST',
    body: JSON.stringify({ amount, note }),
  }),

  listDisbursements: (status?: string) => {
    const url = status ? `/bff/disbursement/list?status=${status}` : '/bff/disbursement/list';
    return bffRequest<Disbursement[]>(url);
  },

  updateDisbursementStatus: (id: string, status: 'processed' | 'rejected', metadata?: Record<string, unknown>) =>
    bffRequest<Disbursement>(`/bff/disbursement/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, metadata }),
    }),
};


