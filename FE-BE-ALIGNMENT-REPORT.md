### Order contract expansion (check-in/out hour + promo breakdown + multi-promo request)

- File Modified:
  src/services/orderService.ts

- Type of Change:
  Payload / Mapping

- Before:
  `OrderResponse` did not include `checkInHour`, `checkOutHour`, or `promos[]`. `CreateOrderRequest` only exposed `promoCode`.

- After:
  Added `checkInHour`, `checkOutHour`, and `promos: Array<{ promoCode; discountAmount }>` to `OrderResponse`, and added `promoCodes?: string[]` to `CreateOrderRequest` (keeping legacy `promoCode` for compatibility).

- Reasoning:
  BE adjustment sections 1 and 2 require explicit order-time fields and multi-promo support.

- Impact:
  All order consumers now have typed access to new fields and request payload supports backend-preferred promo array.

- Test Instructions:
  - Endpoint:
    - `POST /order/create`
    - `GET /order/:orderId`
  - Action:
    - Create booking with promo, then fetch order detail.
  - Expected Request Payload:
    - Includes `promoCodes: ["CODE"]` (single-code flow), plus `checkInHour` and `checkOutHour`.
  - Expected Response:
    - Contains `checkInHour`, `checkOutHour`, and `promos[]`.
  - Verify in Network Tab:
    - Confirm `promoCodes` exists in request and `promos` exists in response.
  - Verify in Console:
    - Existing booking payload/order-response logs include new fields.

### Dashboard response alignment with expanded backend analytics fields

- File Modified:
  src/services/orderService.ts

- Type of Change:
  Mapping

- Before:
  `DashboardResponse` used legacy `occupancyRate` and fewer metrics.

- After:
  Replaced with expanded fields (`currentWeekRevenue`, `currentMonthBookings`, `yearToDateNights`, `weeklyOccupancyRate`, `monthlyOccupancyRate`, `averageNightlyRate`, etc.).

- Reasoning:
  BE adjustment section 4 replaces old dashboard contract.

- Impact:
  Prevents stale field access and aligns analytics typing with backend output.

- Test Instructions:
  - Endpoint:
    - `GET /order/admin/dashboard`
  - Action:
    - Open owner dashboard.
  - Expected Request Payload:
    - No body; authorized request.
  - Expected Response:
    - Expanded analytics fields available.
  - Verify in Network Tab:
    - Response JSON includes new dashboard keys.
  - Verify in Console:
    - No runtime `undefined` access for old `occupancyRate`.

### Revenue endpoint migration to BFF path + weekly period support

- File Modified:
  src/services/orderService.ts

- Type of Change:
  API Endpoint / Payload

- Before:
  `getRevenue` called `/order/admin/revenue` and accepted only `'monthly' | 'yearly'`.

- After:
  `getRevenue` now accepts `'weekly' | 'monthly' | 'yearly'`, supports optional `week`, and calls `/bff/order/admin/revenue`.

- Reasoning:
  BE adjustment section 5 defines weekly support and BFF route usage.

- Impact:
  Revenue API call shape now matches BE/BFF contract and supports week-based analytics.

- Test Instructions:
  - Endpoint:
    - `GET /bff/order/admin/revenue?period=weekly&year=YYYY&week=W`
  - Action:
    - Trigger revenue fetch (owner dashboard load currently yearly; weekly callable from service).
  - Expected Request Payload:
    - Query includes `period`, `year`, optional `month`, optional `week`.
  - Expected Response:
    - Includes `period`, `week`, and daily breakdown for weekly.
  - Verify in Network Tab:
    - Request path starts with `/bff/order/admin/revenue`.
  - Verify in Console:
    - No request construction errors when `week` supplied.

### New stats API wiring for owner analytics

- File Modified:
  src/services/orderService.ts

- Type of Change:
  API Endpoint / Mapping

- Before:
  No typed stats endpoint in FE service.

- After:
  Added `StatsResponse` type and `getStats(year?, month?)` hitting `/bff/order/admin/stats`.

- Reasoning:
  BE adjustment section 6 introduces new stats endpoint and response schema.

- Impact:
  FE now has contract-ready stats accessor for current/future dashboard statistics modules.

- Test Instructions:
  - Endpoint:
    - `GET /bff/order/admin/stats`
  - Action:
    - Invoke service with and without filters.
  - Expected Request Payload:
    - Optional query params `year`, `month`.
  - Expected Response:
    - Includes cancellation, promoImpact, leadTime, repeatGuests, sourceBreakdown, statusDistribution.
  - Verify in Network Tab:
    - Query params forwarded correctly.
  - Verify in Console:
    - Service returns parsed typed object.

### Promo service contract update for general promos, rules, stackability, and batch apply

- File Modified:
  src/services/promoService.ts

- Type of Change:
  Payload / Mapping / API Endpoint

- Before:
  Promo typing only supported `affiliate | automatic`; no `label`, `rules`, `stackable`; no apply-batch type/function.

- After:
  Added `general` type support, `PromoRule`, `label`, `rules`, `stackable`, updated `createPromo`/`listPromos` types, and added `applyPromoBatch` with request/response types.

- Reasoning:
  BE adjustment sections 7 and 8 define these promo contract changes.

- Impact:
  Promo API calls and FE typing are now aligned with current promo engine capabilities.

- Test Instructions:
  - Endpoint:
    - `POST /promo/admin/create`
    - `GET /promo/admin/list`
    - `POST /bff/promo/apply-batch`
  - Action:
    - Create/list general promo and validate batch-apply payload shape.
  - Expected Request Payload:
    - Create supports `type: "general"`, `label`, `rules[]`, `stackable`.
    - Apply-batch supports `promoCodes[]`.
  - Expected Response:
    - Promo objects include `label`, `rules`, `stackable`.
  - Verify in Network Tab:
    - Request/response fields align exactly.
  - Verify in Console:
    - No missing-property type assumptions at runtime.

### Shared promo domain typing update

- File Modified:
  src/types/index.ts

- Type of Change:
  Mapping

- Before:
  `PromoCode` lacked `type`, `label`, `rules`, and `stackable`.

- After:
  Added those fields and added `PromoRule` interface in shared type definitions.

- Reasoning:
  BE adjustment section 7D requires FE domain type parity.

- Impact:
  Booking/context/component code can safely carry new promo metadata without ad-hoc casting.

- Test Instructions:
  - Endpoint:
    - N/A (type layer).
  - Action:
    - Build/type-check and run promo flows.
  - Expected Request Payload:
    - N/A.
  - Expected Response:
    - N/A.
  - Verify in Network Tab:
    - Existing promo payloads unaffected by this type-only change.
  - Verify in Console:
    - No runtime regression in promo object usage.

### Booking create flow now sends promoCodes array

- File Modified:
  src/pages/BookingReviewPage.tsx

- Type of Change:
  Payload

- Before:
  Create order payload sent `promoCode: appliedPromo?.code`.

- After:
  Create order payload now sends `promoCodes: [appliedPromo.code]` when promo exists.

- Reasoning:
  BE adjustment section 2B and section 9C (simplified single-promo FE approach) require array-based field while keeping FE flow simple.

- Impact:
  Booking submission stays single-code in UI but matches backend multi-promo contract.

- Test Instructions:
  - Endpoint:
    - `POST /order/create`
  - Action:
    - Apply one promo and proceed to review/create.
  - Expected Request Payload:
    - Includes `promoCodes` array with one item.
  - Expected Response:
    - Order created successfully with promo applied.
  - Verify in Network Tab:
    - `promoCodes` appears instead of relying on `promoCode`.
  - Verify in Console:
    - Existing booking payload log shows `promoCodes`.

### Owner dashboard metric rendering updated to new fields

- File Modified:
  src/pages/owner/DashboardTab.tsx

- Type of Change:
  Logic / Mapping

- Before:
  UI read legacy `dashboard.occupancyRate` and displayed older metric set.

- After:
  UI now reads and displays weekly/monthly occupancy and average nightly rate, plus current week revenue, while preserving existing dashboard structure/styling patterns.

- Reasoning:
  BE adjustment section 4 removes old occupancy field and adds expanded metrics.

- Impact:
  Dashboard no longer depends on removed backend field and reflects current analytics schema.

- Test Instructions:
  - Endpoint:
    - `GET /order/admin/dashboard`
  - Action:
    - Load owner dashboard.
  - Expected Request Payload:
    - Authenticated GET.
  - Expected Response:
    - New metrics visible and populated.
  - Verify in Network Tab:
    - Response includes weekly/monthly occupancy and average nightly rate.
  - Verify in Console:
    - No undefined rendering errors.

### Owner promos management updated for general type, label, stackable, rules

- File Modified:
  src/pages/owner/PromosTab.tsx

- Type of Change:
  Payload / Logic / Mapping

- Before:
  Promos view was automatic-only oriented and lacked `general` type, `label`, `stackable`, and rule composition support.

- After:
  Added typed loading from promo service, type filter including `general`, overview stats including general count, create form support for `label`, `stackable`, dynamic rules, and table display for label/stackable/rule count.

- Reasoning:
  BE adjustment section 7E requires these fields to be supported in owner promo management.

- Impact:
  Owner promo module can now create and inspect promos using the updated BE promo model.

- Test Instructions:
  - Endpoint:
    - `GET /promo/admin/list`
    - `POST /promo/admin/create`
    - `DELETE /promo/admin/:id`
  - Action:
    - Create a general promo with stackable and rules, then list and deactivate.
  - Expected Request Payload:
    - Includes `type: "general"`, `label`, `stackable`, optional `rules`.
  - Expected Response:
    - Created/listed promo returns new fields.
  - Verify in Network Tab:
    - Create/list/deactivate payloads match service contract.
  - Verify in Console:
    - No malformed data state when rules are added/removed.

### Order detail views now render check-in/out hours and promo breakdown arrays

- File Modified:
  src/pages/PaymentPage.tsx
  src/pages/PaymentConfirmedPage.tsx
  src/pages/owner/PendingTab.tsx
  src/pages/owner/PreviousTab.tsx

- Type of Change:
  Logic / Mapping

- Before:
  Views relied mainly on legacy `promoCode` and did not display `checkInHour` / `checkOutHour`.

- After:
  Views now display check-in/out date with hour and render promo breakdown from `promos[]` with fallback to legacy `promoCode` when needed.

- Reasoning:
  BE adjustment section 1 requires explicit time fields and promo-array detail rendering.

- Impact:
  Order details are now consistent with backend response model in both customer and owner flows.

- Test Instructions:
  - Endpoint:
    - `GET /order/:orderId`
    - `GET /order/admin/list`
  - Action:
    - Open payment/order detail screens and owner order detail modals/cards.
  - Expected Request Payload:
    - N/A (read operations).
  - Expected Response:
    - Includes `checkInHour`, `checkOutHour`, and `promos`.
  - Verify in Network Tab:
    - Response contains new fields.
  - Verify in Console:
    - No runtime errors when `promos` is empty or populated.

### Calendar metadata handling completed with block reason and price-source cues

- File Modified:
  src/components/Calendar.tsx

- Type of Change:
  Logic / Mapping

- Before:
  Calendar tooltip favored custom pricing labels only and did not surface blocked-date reason or price-source text fallback.

- After:
  Added tooltip fallback logic to prioritize `blockReason` for blocked dates and use `priceSource` labels when custom labels are absent.

- Reasoning:
  BE adjustment section 3 requires metadata (`label`, `priceSource`, `blockReason`) to be represented in calendar rendering.

- Impact:
  Calendar day metadata now reflects backend response semantics more completely.

- Test Instructions:
  - Endpoint:
    - `GET /order/calendar?month=YYYY-MM`
  - Action:
    - Open booking calendar with blocked/custom-priced dates.
  - Expected Request Payload:
    - Month query only.
  - Expected Response:
    - Day objects include label/priceSource/blockReason.
  - Verify in Network Tab:
    - Metadata fields are present in day entries.
  - Verify in Console:
    - Calendar renders tooltips without errors.

### Dev proxy alignment for BFF-prefixed routes

- File Modified:
  vite.config.ts

- Type of Change:
  API Endpoint

- Before:
  Vite dev proxy did not include `/bff`, so new BFF-prefixed FE calls would bypass configured proxy behavior in dev.

- After:
  Added `/bff` proxy target (`VITE_BFF_URL`, fallback `http://localhost:3100`).

- Reasoning:
  BE adjustment sections 5/6/8 introduce BFF route usage (`/bff/...`) from FE.

- Impact:
  FE dev environment can reach new BFF endpoints consistently.

- Test Instructions:
  - Endpoint:
    - `/bff/order/admin/revenue`
    - `/bff/order/admin/stats`
    - `/bff/promo/apply-batch`
  - Action:
    - Run dev server and trigger relevant requests.
  - Expected Request Payload:
    - Unchanged per endpoint.
  - Expected Response:
    - Requests are proxied to BFF target.
  - Verify in Network Tab:
    - Calls originate from FE host with `/bff/...` path and return BFF response.
  - Verify in Console:
    - No CORS/proxy errors for `/bff` paths.

## Testing Scenarios

### Booking with Single Promo (FE simplified flow, BE multi-promo-compatible)

- Steps:
  1. Select dates and fill booking form.
  2. Apply one promo code.
  3. Continue to review and create order.
  4. Open payment summary.

- API Calls:
  - `POST /order/create`
  - `GET /order/:orderId`

- Expected Behavior:
  - UI:
    - Payment/review screens show check-in and check-out hours; discount section supports promo breakdown.
  - Network:
    - Create payload includes `promoCodes`.
    - Order response includes `promos[]`, `checkInHour`, `checkOutHour`.
  - Console:
    - Existing booking/order logs show aligned payload and response fields.

- Edge Cases:
  - Invalid payload
  - Empty response
  - Backend error response

### Owner Dashboard Analytics Load

- Steps:
  1. Login as owner.
  2. Open Dashboard tab.
  3. Observe revenue and occupancy cards.

- API Calls:
  - `GET /order/admin/dashboard`
  - `GET /bff/order/admin/revenue`

- Expected Behavior:
  - UI:
    - Weekly/monthly occupancy and average nightly rate render correctly.
  - Network:
    - Revenue request uses `/bff/order/admin/revenue`.
  - Console:
    - No references to removed `occupancyRate`.

- Edge Cases:
  - Invalid payload
  - Empty response
  - Backend error response

### Owner Promo Management (general + rules + stackable)

- Steps:
  1. Open owner Promos tab.
  2. Create promo with type `general`, set label, toggle stackable, add rules.
  3. Refresh list and deactivate promo.

- API Calls:
  - `GET /promo/admin/list`
  - `POST /promo/admin/create`
  - `DELETE /promo/admin/:id`

- Expected Behavior:
  - UI:
    - Promo list shows type, label, stackable badge, and rules count.
  - Network:
    - Create payload includes new contract fields (`type`, `label`, `stackable`, `rules`).
  - Console:
    - No create/list/deactivate runtime errors.

- Edge Cases:
  - Invalid payload
  - Empty response
  - Backend error response

### Calendar Metadata Visibility

- Steps:
  1. Open booking calendar for month with blocked/custom pricing dates.
  2. Hover day cells with metadata.

- API Calls:
  - `GET /order/calendar?month=YYYY-MM`

- Expected Behavior:
  - UI:
    - Tooltips show block reason or pricing label/price source indicator text.
  - Network:
    - Calendar day metadata includes `label`, `priceSource`, `blockReason`.
  - Console:
    - No tooltip-related rendering errors.

- Edge Cases:
  - Invalid payload
  - Empty response
  - Backend error response
