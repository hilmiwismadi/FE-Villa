import { ApiError } from './errors';

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
      throw new ApiError(errorData?.error || `HTTP ${response.status}`, response.status, errorData);
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
    revenue: number;
  };
  bookings: Array<any>;
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
    commissionRate: number;
    discountType?: string;
    discountValue?: number;
  }) => bffRequest<{ user: any; affiliate: Affiliate }>('/bff/affiliate/create', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'x-admin-token': getAdminToken() },
  }),

  listAffiliates: () => bffRequest<Affiliate[]>('/bff/affiliate/list'),

  getAffiliate: (id: string) => bffRequest<Affiliate>(`/bff/affiliate/${id}`),

  updateAffiliate: (id: string, data: Partial<Affiliate>) => bffRequest<Affiliate>(`/bff/affiliate/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  deleteAffiliate: (id: string) => bffRequest<{ message: string }>(`/bff/affiliate/${id}`, {
    method: 'DELETE',
  }),

  addAffiliateCode: (id: string, code: string, commissionRate: number, discountType?: string, discountValue?: number) =>
    bffRequest<{ message: string }>(`/bff/affiliate/${id}/code`, {
      method: 'POST',
      body: JSON.stringify({ code, commissionRate, discountType, discountValue }),
      headers: { 'x-admin-token': getAdminToken() },
    }),

  removeAffiliateCode: (id: string, code: string) =>
    bffRequest<{ message: string }>(`/bff/affiliate/${id}/code`, {
      method: 'DELETE',
      body: JSON.stringify({ code }),
      headers: { 'x-admin-token': getAdminToken() },
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
};

function getAdminToken(): string {
  try {
    const raw = localStorage.getItem('villa-auth');
    if (!raw) return '';
    const auth = JSON.parse(raw);
    return auth.accessToken || '';
  } catch {
    return '';
  }
}
