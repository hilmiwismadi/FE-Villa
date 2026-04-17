# Integrate Plain Dashboard (`Yutaka-OrderService/dashboard/index.html`) into FE-Villa `/owner`

## Scope

This compares:

- Plain dashboard: `D:\Hilmi\Coding\FE-villa-yutaka\Yutaka-OrderService\dashboard\index.html`
- Current React owner UI: `D:\Hilmi\Coding\FE-villa-yutaka\FE-Villa\src\pages\owner\*`

Target routes:

1. `/owner`
2. `/owner/calendar`
3. `/owner/pricing`
4. `/owner/users`
5. `/ owner/users` (same target as `/owner/users`, the extra space appears to be a typo)

---

## High-level comparison: Plain HTML vs FE-Villa Owner UI

| Area | Plain Dashboard (`index.html`) | FE-Villa Owner (React + Tailwind) | Integration approach used |
|---|---|---|---|
| Structure | Single HTML file, multi-page sections toggled by JS | Route-based pages inside `/owner/*` with `OwnerLayout` | Keep FE-Villa routing/layout, port behavior (API calls + page features) |
| Styling | Custom CSS in one file (sidebar, cards, tables, modal, toast) | Existing Tailwind design tokens (`primary-*`, `gold-*`) | Keep existing FE-Villa style system; do not copy plain CSS directly |
| State management | Global variables in script | Component state (`useState`, `useEffect`) | Per-page API fetch + local state |
| API access | `fetch()` helper with hardcoded token in page script | Typed service layer (`src/services/orderService.ts`) | Use typed service layer for all `/owner` data |
| Error handling | Toast + inline string | Inline error panels / state | Keep React UX; explicit error states |

---

## API contracts used for owner pages

Contracts checked against:

- `D:\Hilmi\Coding\FE-villa-yutaka\BE_integrate.md`
- `https://yutaka-order.izcy.tech/openapi.json`
- `https://yutaka-promo.izcy.tech/openapi.json`

### `/owner` (Dashboard)

| Purpose | Endpoint | Method | Main response fields |
|---|---|---|---|
| Metrics cards | `/order/admin/dashboard` | GET | `currentMonthRevenue`, `yearToDateRevenue`, `occupancyRate`, `pendingOrders`, `activeBookings`, `totalGuests` |
| Revenue chart | `/order/admin/revenue?period=yearly&year=YYYY` | GET | `totalRevenue`, `totalBookings`, `totalNights`, `breakdown[{label,revenue,bookings}]` |
| Recent pending | `/order/admin/list?status=pending&page=1&limit=5` | GET | `orders[]` |
| Upcoming check-ins | `/order/admin/list?status=booked&page=1&limit=10` | GET | `orders[]` |

### `/owner/calendar`

| Purpose | Endpoint | Method | Main response/request fields |
|---|---|---|---|
| Monthly calendar | `/order/calendar?month=YYYY-MM` | GET | `days[{date,status,price,label,priceSource,blockReason}]` |
| Block date form | `/order/admin/pricing/block` | POST | request `{date,reason}` |

### `/owner/pricing`

| Purpose | Endpoint | Method | Main response/request fields |
|---|---|---|---|
| Get default price | `/order/admin/pricing/default` | GET | pricing rule object (`amount`, timestamps, etc.) |
| Set default price | `/order/admin/pricing/default` | POST | request `{amount}` |
| List custom rules | `/order/admin/pricing/custom?page=1&limit=200` | GET | `rules[]`, `total` |
| Create custom rule | `/order/admin/pricing/custom` | POST | request `{frequency,amount,startDate,endDate,label,dayOfWeek?}` |
| Delete custom rule | `/order/admin/pricing/custom/{id}` | DELETE | `{message}` |
| List blocked dates | `/order/admin/pricing/blocks` | GET | `blocks[]` |
| Block date | `/order/admin/pricing/block` | POST | request `{date,reason}` |
| Unblock date | `/order/admin/pricing/block/{id}` | DELETE | `{message}` |

### `/owner/users` (and duplicate `/ owner/users`)

| Purpose | Endpoint | Method | Main response/request fields |
|---|---|---|---|
| Guest list | `/order/admin/guests?page=&limit=&search=&sortBy=` | GET | `guests[]`, `total`, `page`, `limit` |
| Guest detail + booking history | `/order/admin/guests/{phone}` | GET | guest profile + `bookings[]` |

---

## What was implemented in FE-Villa

### 1. Real API integration for owner pages

- `src/pages/owner/DashboardTab.tsx`
  - Replaced mock analytics with live `/order/admin/dashboard` + `/order/admin/revenue`.
  - Added live recent pending orders and upcoming check-ins from `/order/admin/list`.

- `src/pages/owner/CalendarTab.tsx`
  - Replaced local mock booking map with `/order/calendar`.
  - Added functional block date form using `/order/admin/pricing/block`.
  - Added day detail panel using API fields (`status`, `price`, `priceSource`, `blockReason`).

- `src/pages/owner/PricingTab.tsx`
  - Replaced static pricing cards/forms with full CRUD wiring:
    - default price get/set,
    - custom price list/create/delete,
    - blocked date list/create/delete.

- `src/pages/owner/UsersTab.tsx`
  - Replaced hardcoded users with live `/order/admin/guests`.
  - Added search/sort/pagination and guest detail history from `/order/admin/guests/{phone}`.

### 2. Service layer additions

- Extended `src/services/orderService.ts` with owner-admin functions for:
  - guests list/detail,
  - default/custom pricing operations,
  - blocked date operations.

### 3. CORS/dev setup

- Added optional dev-proxy support:
  - `vite.config.ts` proxy routes:
    - `/order` → `VITE_ORDER_SERVICE_URL`
    - `/promo` → `VITE_PROMO_SERVICE_URL`
    - `/api/v1/auth` → `VITE_AUTH_SERVICE_URL`
- Added optional proxy mode in service clients:
  - `src/services/orderService.ts`
  - `src/services/promoService.ts`
  - `src/services/authService.ts`
- Enable proxy mode by setting:
  - `VITE_USE_PROXY=true`
  - This avoids browser CORS failures in local dev by routing through Vite dev server.

---

## Notes

- Backend OpenAPI currently marks several nullable fields with odd `anyOf` shapes (number/string or nullable boolean); frontend handles these safely.
- `/ owner/users` is treated as `/owner/users`; route key in app remains `/owner/users`.
