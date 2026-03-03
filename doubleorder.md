# Double Order Creation Issue

## Problem Description
When a user completes a booking flow, the same order data was sent to the backend **TWICE**, creating 2 duplicate orders in the database.

## Root Cause

### Original Flow (Before Fix)
```
/book/form      → createOrder()  → POST /order/create  → Creates "VY-20260303-001"
/book/review    → (no API)
/book/payment     → createOrder()  → POST /order/create  → Creates "VY-20260303-002" (DUPLICATE!)
```

### Why It Happened
The `PaymentPage.tsx` component had a `useEffect` that was triggering `createOrder()` again:
```typescript
// PaymentPage.tsx - OLD CODE
useEffect(() => {
  if (orderId) {
    fetchOrder(orderId);
  } else {
    createNewOrder();  // ← THIS RUNS AGAIN!
  }
}, [orderId, hasValidBooking, dateRange.checkIn, dateRange.checkOut, formData, appliedPromo?.code, setPricing]);
//                                                      ^^^^^^^^^^^^^
//                                                      formData object reference changes on every render!
```

When `formData` changes (which happens on every re-render), the `useEffect` runs again, calling `createOrder()` a second time with the same data.

---

## Solution Implemented

### New Flow (After Fix)
```
/book/form      → (no API) - saves form data to context only
/book/review    → createOrder()  → POST /order/create  → Creates "VY-20260303-001"
/book/payment/VY-20260303-001  → getOrder()  → GET /order/{orderId}
```

**Now only 1 order is created per booking.**

---

## FE Components & Functions Modified

### 1. `BookingFormPage.tsx`

**Component**: `/book/form` page

**Change**: Removed `createOrder()` API call entirely

**Before**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ... validation ...

  const response: OrderResponse = await createOrder(orderData);  // ← REMOVED
  setGuestInfo({ ...formData, orderId: response.orderId, ... });
  navigate(localePath('/book/review'));
};
```

**After**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ... validation ...

  // Just save form data to context, no API call
  setGuestInfo({ ...formData });
  navigate(localePath('/book/review'));
};
```

**FE Functions Called**: None (saves to context only)
**FE Endpoints Hit**: None
**BE Endpoints Hit**: None (on this page)

---

### 2. `BookingReviewPage.tsx`

**Component**: `/book/review` page

**Changes**:
1. Added `useRef` to track if order was already created
2. Added `useEffect` with `createOrder()` that runs only once
3. Added guard to prevent duplicate API calls
4. Added loading/error UI states
5. Modified `handleConfirm` to navigate with `orderResponse.orderId`

**Added State**:
```typescript
const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(null);
const [creatingOrder, setCreatingOrder] = useState(false);
const [orderError, setOrderError] = useState('');
const orderCreatedRef = useRef(false); // Prevent duplicate API calls
```

**New useEffect**:
```typescript
useEffect(() => {
  // Prevent duplicate API calls
  if (orderCreatedRef.current) {
    return;
  }

  // If guestInfo has orderId already, order was created (shouldn't happen in this flow)
  if (guestInfo?.orderId || !dateRange.checkIn || !dateRange.checkOut) {
    return;
  }

  // Create order on review page
  const createOrderOnReview = async () => {
    setCreatingOrder(true);
    setOrderError('');

    try {
      const timeMap: Record<string, '14-16' | '16-18' | '18-20' | '20-22'> = {
        '14:00 - 16:00': '14-16',
        '16:00 - 18:00': '16-18',
        '18:00 - 20:00': '18-20',
        '20:00 - 22:00': '20-22',
      };

      const checkInTime = formData.checkInTime || '14:00 - 16:00';
      const estimatedCheckIn: '14-16' | '16-18' | '18-20' | '20-22' =
        checkInTime === '16:00 - 18:00' ? '16-18' :
        checkInTime === '18:00 - 20:00' ? '18-20' :
        checkInTime === '20:00 - 22:00' ? '20-22' : '14-16';

      const orderData = {
        guestName: formData.fullName || '',
        guestPhone: formData.phone || '',
        guestAddress: formData.address ? `${formData.address}, ${formData.city}, ${formData.province}` : '',
        guestCount: Number(formData.numberOfGuests) || 1,
        extraBeds: Number(formData.extraBed) || 0,
        estimatedCheckIn,
        checkInDate: format(dateRange.checkIn, 'yyyy-MM-dd'),
        checkOutDate: format(dateRange.checkOut, 'yyyy-MM-dd'),
        promoCode: appliedPromo?.code || undefined,
      };

      const response: OrderResponse = await createOrder(orderData);
      setOrderResponse(response);
      orderCreatedRef.current = true; // Mark as created

      // Update pricing with actual values from API response
      setPricing({
        originalPrice: response.subtotal + response.discountAmount,
        discountAmount: response.discountAmount,
        finalPrice: response.totalAmount,
      });

      // Update guestInfo with orderId
      setGuestInfo({
        ...formData,
        orderId: response.orderId,
        totalAmount: response.totalAmount,
        paymentDeadline: response.paymentDeadline,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setOrderError(error.message || 'Failed to create order');
      } else {
        setOrderError('Failed to create order');
      }
    } finally {
      setCreatingOrder(false);
    }
  };

  createOrderOnReview();
}, []); // Empty deps - run only once on mount
```

**Modified handleConfirm**:
```typescript
const handleConfirm = () => {
  if (!orderResponse?.orderId) {
    alert('Order not created yet. Please wait...');
    return;
  }
  navigate(localePath(`/book/payment/${orderResponse.orderId}`));
};
```

**FE Functions Called**: `createOrder(orderData)`, `setOrderResponse()`, `setPricing()`, `setGuestInfo()`
**FE Endpoints Hit**: `POST /order/create`
**BE Endpoints Hit**: `POST /order/create`

**Why `orderCreatedRef` is needed**:
Without this ref, even with empty `[]` dependency array, the effect could run multiple times due to React's rendering behavior. The ref ensures `createOrder()` is called exactly once.

---

### 3. `PaymentPage.tsx`

**Component**: `/book/payment` page

**Changes**:
1. Removed `createOrder()` call entirely
2. Removed unused imports (`createOrder`, `OrderResponse` type for create)
3. Removed unused states (`isCreatingOrder`, `setIsCreatingOrder`)
4. Simplified `useEffect` to only fetch order via `getOrder()`
5. Fixed dependency array to prevent unnecessary re-runs
6. Added `resetBooking()` call after successful payment confirmation

**Before**:
```typescript
// OLD CODE - Had both fetch and create branches
useEffect(() => {
  if (orderId) {
    fetchOrder(orderId);
  } else {
    createNewOrder();  // ← REMOVED - could run again!
  }
}, [orderId, hasValidBooking, dateRange.checkIn, dateRange.checkOut, formData, appliedPromo?.code, setPricing]);
```

**After**:
```typescript
// Simplified - only fetch, no create
useEffect(() => {
  if (!hasValidBooking || !orderId) return;

  const fetchOrder = async () => {
    try {
      const response = await getOrder(orderId);
      setOrderResponse(response);

      // Update pricing with actual values from API response
      setPricing({
        originalPrice: response.subtotal + response.discountAmount,
        discountAmount: response.discountAmount,
        finalPrice: response.totalAmount,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setCreateOrderError(error.message);
      } else {
        setCreateOrderError('Failed to load order details');
      }
    }
  };

  fetchOrder();
}, [orderId, hasValidBooking, setPricing]);
```

**Added resetBooking after payment confirmation**:
```typescript
const handleConfirmPayment = async () => {
  if (!orderResponse?.orderId) return;

  setIsSubmitting(true);
  setConfirmPaymentError(null);

  try {
    await confirmPayment(orderResponse.orderId);
    setPaymentConfirmed(true);
    setSubmitError(null);

    // Clear sessionStorage after successful payment confirmation
    resetBooking();
  } catch (error) {
    // error handling...
  } finally {
    setIsSubmitting(false);
  }
};
```

**FE Functions Called**: `getOrder(orderId)`, `confirmPayment(orderId)`, `resetBooking()`
**FE Endpoints Hit**: `GET /order/{orderId}`, `POST /order/{orderId}/confirm-payment`
**BE Endpoints Hit**: `GET /order/{orderId}`, `POST /order/{orderId}/confirm-payment`

**Why removed `formData` from dependencies**:
The `formData` object reference changes on every component re-render, which would cause the `useEffect` to run unnecessarily. After the fix, `orderId` is the only trigger since the order is already created.

---

### 4. `App.tsx`

**Component**: Root app router

**Change**: Added route with optional `:orderId` parameter

**Before**:
```typescript
<Route path="book/payment" element={<PaymentPage />} />
```

**After**:
```typescript
<Route path="book/payment" element={<PaymentPage />} />
<Route path="book/payment/:orderId" element={<PaymentPage />} />
```

This allows both paths to work:
- `/book/payment` - fallback (though shouldn't happen in normal flow)
- `/book/payment/VY-20260303-001` - normal flow with orderId

**FE Functions Called**: None (routing only)
**FE Endpoints Hit**: None
**BE Endpoints Hit**: None

---

### 5. `BookingContext.tsx`

**Component**: Booking state context

**No changes made** - Only consumed `resetBooking()` function

**What `resetBooking()` does**:
```typescript
const resetBooking = () => {
  setDateRange({ checkIn: null, checkOut: null });
  setSelectedDates([]);              // ← Clears "selected" visual state
  setGuestInfo(null);
  setFormData(defaultFormData);
  setPromoCode('');
  setAppliedPromo(null);
  setPricing({ originalPrice: 0, discountAmount: 0, finalPrice: 0 });
  sessionStorage.removeItem(STORAGE_KEY);  // ← Clears persistent storage
};
```

This ensures that after payment confirmation, when user navigates back to calendar or tries a new booking, there's no stale data.

---

## Complete Flow Summary

| Step | Page | FE Function | FE Endpoint | BE Endpoint | Action |
|-------|-------|-------------|------------|------------|--------|
| 1 | `/book/form` | `setGuestInfo()` | None | None | Save form to context |
| 2 | `/book/review` | `createOrder()` | `POST /order/create` | `POST /order/create` | Create order in DB |
| 3 | `/book/review` | `handleConfirm()` | Navigation | None | Navigate with orderId |
| 4 | `/book/payment/:orderId` | `getOrder()` | `GET /order/{id}` | `GET /order/{id}` | Fetch order details |
| 5 | `/book/payment/:orderId` | `confirmPayment()` | `POST /order/{id}/confirm` | `POST /order/{id}/confirm` | Confirm payment |
| 6 | `/book/payment/:orderId` | `resetBooking()` | None | None | Clear sessionStorage |

---

## Key Takeaways

1. **URL parameters are more reliable than context** for page state:
   - Survives browser refresh
   - Survives new tab/window
   - Allows sharing payment links
   - RESTful design pattern

2. **Empty dependency arrays** prevent duplicate API calls:
   - `useEffect(() => { ... }, [])` runs exactly once on mount
   - No need for complex dependencies when data should be used fresh

3. **useRef for one-time operations**:
   - Persists across re-renders without triggering effect re-runs
   - Perfect for preventing duplicate API calls

4. **Clear state after completion**:
   - `resetBooking` ensures clean slate for next booking
   - Prevents stale data from showing in UI

5. **SessionStorage volatility**:
   - Session storage is cleared on browser close
   - Order ID in URL allows recovery even after storage is cleared
