# BFF to Direct BE Endpoint Mapping

> **Purpose**: Document mapping between BFF endpoints and direct BE endpoints
> **Date**: 2026-04-25
> **Current Status**: Adjusting FE to hit direct BE for interface development

---

## Overview

This document tracks the transition from BFF-based endpoints to direct backend service endpoints. Currently, the frontend hits BFF at `http://localhost:3100` which then proxies to respective microservices.

**Goal**: For current sprint, hit direct BE endpoints to continue interface development while BFF integration is planned for next sprint.

---

## Environment Variables

### Current (BFF-based)
```env
VITE_AUTH_SERVICE_URL=http://localhost:6969
VITE_ORDER_SERVICE_URL=http://localhost:2471
VITE_PROMO_SERVICE_URL=http://localhost:9998
VITE_BFF_URL=http://localhost:3100
VITE_PUBLIC_URL=https://yutaka.izcy.tech
```

### New (Direct BE)
```env
VITE_ORDER_SERVICE_URL=https://yutaka-order.izcy.tech
VITE_PROMO_SERVICE_URL=https://yutaka-promo.izcy.tech
VITE_AUTH_SERVICE_URL=https://yutaka-auth.izcy.tech
VITE_BFF_URL=  # Empty for direct BE mode
```

---

## OrderService Endpoints

### Public Endpoints

| BFF Endpoint | Direct BE Endpoint | Method | Used By | Status |
|--------------|-------------------|--------|---------|---------|
| `/bff/order/calendar?month=YYYY-MM` | `https://yutaka-order.izcy.tech/order/calendar?month=YYYY-MM` | GET | HomePage, BookingCalendarPage | ✅ Mapped |
| `/bff/order/availability?checkIn=...&checkOut=...` | `https://yutaka-order.izcy.tech/order/availability?checkIn=...&checkOut=...` | GET | BookingCalendarPage | ✅ Mapped |
| `/bff/order/{orderId}` | `https://yutaka-order.izcy.tech/order/{orderId}` | GET | BookingReviewPage, PaymentPage, BookingSubmissionPage | ✅ Mapped |
| `/bff/order/create` | `https://yutaka-order.izcy.tech/order/create` | POST | BookingReviewPage | ✅ Mapped |
| `/bff/order/{orderId}/confirm-payment` | `https://yutaka-order.izcy.tech/order/{orderId}/confirm-payment` | POST | PaymentPage | ✅ Mapped |
| `/bff/order/{orderId}/payment-status` | `https://yutaka-order.izcy.tech/order/{orderId}/payment-status` | GET | PaymentPage | ✅ Mapped |

### Authenticated Endpoints

| BFF Endpoint | Direct BE Endpoint | Method | Used By | Status |
|--------------|-------------------|--------|---------|---------|
| `/bff/order/my-bookings` | `https://yutaka-order.izcy.tech/order/my-bookings` | GET | User bookings | ✅ Mapped |

### Admin Endpoints

| BFF Endpoint | Direct BE Endpoint | Method | Used By | Status |
|--------------|-------------------|--------|---------|---------|
| `/bff/order/admin/list` | `https://yutaka-order.izcy.tech/order/admin/list` | GET | Owner: PendingTab, ActiveTab, PreviousTab | ✅ Mapped |
| `/bff/order/admin/{orderId}/approve` | `https://yutaka-order.izcy.tech/order/{orderId}/approve` | POST | Owner: PendingTab | ✅ Mapped |
| `/bff/order/admin/{orderId}/reject` | `https://yutaka-order.izcy.tech/order/{orderId}/reject` | POST | Owner: PendingTab | ✅ Mapped |
| `/bff/order/admin/{orderId}/check-in` | `https://yutaka-order.izcy.tech/order/{orderId}/check-in` | POST | Owner: ActiveTab | ✅ Mapped |
| `/bff/order/admin/{orderId}/complete` | `https://yutaka-order.izcy.tech/order/{orderId}/complete` | POST | Owner: ActiveTab | ✅ Mapped |
| `/bff/order/admin/dashboard` | `https://yutaka-order.izcy.tech/order/admin/dashboard` | GET | Owner: DashboardTab | ✅ Mapped |
| `/bff/order/admin/revenue` | `https://yutaka-order.izcy.tech/order/admin/revenue` | GET | Owner: DashboardTab | ✅ Mapped |
| `/bff/order/admin/pricing/custom` | `https://yutaka-order.izcy.tech/order/admin/pricing/custom` | GET/POST/DELETE | Owner: PricingTab | ✅ Mapped |
| `/bff/order/admin/pricing/default` | `https://yutaka-order.izcy.tech/order/admin/pricing/default` | GET/POST | Owner: PricingTab | ✅ Mapped |
| `/bff/order/admin/pricing/blocks` | `https://yutaka-order.izcy.tech/order/admin/pricing/blocks` | GET | Owner: CalendarTab | ✅ Mapped |
| `/bff/order/admin/pricing/block` | `https://yutaka-order.izcy.tech/order/admin/pricing/block` | POST/DELETE | Owner: CalendarTab | ✅ Mapped |
| `/bff/order/admin/guests` | `https://yutaka-order.izcy.tech/order/admin/guests` | GET | Owner: UsersTab | ✅ Mapped |
| `/bff/order/admin/guests/{phone}` | `https://yutaka-order.izcy.tech/order/admin/guests/{phone}` | GET | Owner: UsersTab | ✅ Mapped |

---

## PromoService Endpoints

| BFF Endpoint | Direct BE Endpoint | Method | Used By | Status |
|--------------|-------------------|--------|---------|---------|
| `/bff/promo/validate` | `https://yutaka-promo.izcy.tech/promo/validate` | GET | BookingCalendarPage, BookingFormPage, BookingReviewPage | ✅ Mapped |

---

## AuthService Endpoints

| BFF Endpoint | Direct BE Endpoint | Method | Used By | Status |
|--------------|-------------------|--------|---------|---------|
| `/bff/auth/login` | `https://yutaka-auth.izcy.tech/auth/login` | POST | LoginPage | ✅ Mapped |
| `/bff/auth/me` | `https://yutaka-auth.izcy.tech/auth/me` | GET | AuthContext | ✅ Mapped |
| `/bff/auth/refresh` | `https://yutaka-auth.izcy.tech/auth/refresh` | POST | AuthContext | ✅ Mapped |
| `/bff/auth/logout` | `https://yutaka-auth.izcy.tech/auth/logout` | POST | AuthContext | ✅ Mapped |
| `/bff/auth/magic/verify` | `https://yutaka-auth.izcy.tech/auth/magic/verify` | POST | MagicLinkPage | ✅ Mapped |

---

## User Flow Endpoint Mapping

Based on `user_flow.md`, here are the endpoints used in the booking flow:

### Step 1 - Homepage
- `GET /order/calendar?month=YYYY-MM` → Calendar display

### Step 2 - Select Dates (`/book/calendar`)
- `GET /order/calendar?month=YYYY-MM` → Calendar data
- `GET /order/availability?checkIn=...&checkOut=...` → Check availability before proceeding
- `GET /promo/validate?code=...&checkIn=...&checkOut=...&guestPhone=...` → Validate promo code

### Step 3 - Guest Info (`/book/form`)
- `GET /promo/validate?code=...&checkIn=...&checkOut=...&guestPhone=...` → Auto-validate promo

### Step 4 - Review (`/book/review`)
- `POST /order/create` → Create order
- `GET /order/{orderId}` → Fetch existing order if already created
- `GET /promo/validate?code=...&checkIn=...&checkOut=...&guestPhone=...` → Validate new promo codes

### Step 5 - Payment (`/book/payment/:orderId`)
- `GET /order/{orderId}` → Fetch order details
- `GET /order/{orderId}/payment-status` → Check payment status (optional)
- `POST /order/{orderId}/confirm-payment` → Confirm payment

### Step 6 - Confirmation (`/book/confirmation/:orderId`)
- `GET /order/{orderId}` → Fetch final order status

---

## Owner Dashboard Endpoint Mapping

### Dashboard Tab (`/owner`)
- `GET /order/admin/dashboard` → Dashboard stats
- `GET /order/admin/revenue?period=yearly&year=YYYY` → Revenue data
- `GET /order/admin/list?status=pending` → Recent pending orders
- `GET /order/admin/list?status=booked` → Upcoming check-ins

### Orders - Pending Tab (`/owner/orders/pending`)
- `GET /order/admin/list?status=pending&page=1&limit=20` → List pending orders
- `POST /order/{orderId}/approve` → Approve order
- `POST /order/{orderId}/reject` → Reject order

### Orders - Active Tab (`/owner/orders/active`)
- `GET /order/admin/list?status=booked&page=1&limit=20` → List active bookings
- `POST /order/{orderId}/check-in` → Check in guest
- `POST /order/{orderId}/complete` → Complete checkout

### Orders - Previous Tab (`/owner/orders/previous`)
- `GET /order/admin/list?status=completed&page=1&limit=20` → List completed orders

### Calendar Tab (`/owner/calendar`)
- `GET /order/calendar?month=YYYY-MM` → Calendar view
- `GET /order/admin/pricing/blocks` → List blocked dates
- `POST /order/admin/pricing/block` → Block date
- `DELETE /order/admin/pricing/block/{id}` → Unblock date

### Pricing Tab (`/owner/pricing`)
- `GET /order/admin/pricing/default` → Get default pricing
- `POST /order/admin/pricing/default` → Set default pricing
- `GET /order/admin/pricing/custom` → List custom pricing rules
- `POST /order/admin/pricing/custom` → Create custom pricing rule
- `DELETE /order/admin/pricing/custom/{id}` → Delete custom pricing rule

### Users Tab (`/owner/users`)
- `GET /order/admin/guests` → List guests
- `GET /order/admin/guests/{phone}` → Get guest details

---

## Implementation Notes

### CORS Considerations
Direct BE calls may encounter CORS issues. The following services have CORS configured:
- `https://yutaka-order.izcy.tech` ✅
- `https://yutaka-promo.izcy.tech` ✅
- `https://yutaka-auth.izcy.tech` ✅

### Authentication
Authentication headers are still required for admin endpoints:
```typescript
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

### Switching Between BFF and Direct BE

To switch between BFF mode and Direct BE mode, modify service imports:

**BFF Mode (Current):**
```typescript
import { getCalendar, createOrder } from '../services/orderService';
```

**Direct BE Mode (New):**
```typescript
import { getCalendar, createOrder } from '../services/orderServiceDirectBE';
```

---

## Migration Plan

### Phase 1 (Current Sprint)
- ✅ Create `orderServiceDirectBE.ts` for OrderService
- ✅ Create `promoServiceDirectBE.ts` for PromoService
- ✅ Create `authServiceDirectBE.ts` for AuthService
- ✅ Update `.env` to use direct BE URLs
- ✅ Update component imports to use direct BE services
- ✅ Test user flow with direct BE endpoints
- ✅ Test owner dashboard with direct BE endpoints

### Phase 2 (Next Sprint)
- Integrate with BFF endpoints
- Update service files to use BFF URLs
- Test BFF integration
- Remove direct BE service files

---

## Testing Checklist

### User Flow
- [ ] Homepage calendar loads correctly
- [ ] Date selection and availability check works
- [ ] Promo code validation works
- [ ] Order creation works
- [ ] Payment confirmation works
- [ ] Order status updates correctly

### Owner Dashboard
- [ ] Dashboard stats load correctly
- [ ] Revenue charts load correctly
- [ ] Order list (pending/active/previous) loads correctly
- [ ] Order actions (approve/reject/check-in/complete) work
- [ ] Calendar view and blocking works
- [ ] Pricing management works
- [ ] Guest list and details work

---

## References

- User Flow: `D:\Hilmi\Coding\FE-villa-yutaka\user_flow.md`
- OrderService API: `https://yutaka-order.izcy.tech/docs`
- PromoService API: `https://yutaka-promo.izcy.tech/docs`
- AuthService API: `https://yutaka-auth.izcy.tech/docs`
- FE Source: `D:\Hilmi\Coding\FE-villa-yutaka\FE-Villa\src\`

---

**Last Updated**: 2026-04-25
**Status**: ✅ Documentation Complete - Ready for Implementation
