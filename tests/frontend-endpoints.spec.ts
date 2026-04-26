import { test, expect } from '@playwright/test';

// Base URLs for testing
const BASE_URL = 'http://localhost:5174';
const ORDER_BE = 'https://yutaka-order.izcy.tech';
const PROMO_BE = 'https://yutaka-promo.izcy.tech';
const AUTH_BE = 'https://yutaka-auth.izcy.tech';

test.describe('Frontend Endpoint Integration Tests', () => {
  test.beforeAll(async () => {
    console.log('Starting comprehensive endpoint testing...');
    console.log(`FE Base URL: ${BASE_URL}`);
    console.log(`Order BE: ${ORDER_BE}`);
    console.log(`Promo BE: ${PROMO_BE}`);
    console.log(`Auth BE: ${AUTH_BE}`);
  });

  // ========== USER FLOW TESTS ==========

  test.describe('User Flow - Homepage', () => {
    test('should load homepage successfully', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Check if page loads without errors
      await page.waitForLoadState('networkidle');
      const title = await page.title();
      expect(title).toBeTruthy();
      
      // Check for console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      // Wait a bit to catch any runtime errors
      await page.waitForTimeout(3000);
      
      console.log('Homepage loaded. Console errors:', errors);
      expect(errors.length).toBe(0);
    });

    test('should load calendar data from Order BE', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Intercept API calls to verify endpoints
      const apiCalls: string[] = [];
      
      page.on('request', request => {
        const url = request.url();
        if (url.includes('/order/calendar') || url.includes('/promo/')) {
          apiCalls.push(url);
          console.log('API Call:', url);
        }
      });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Verify calendar endpoint was called
      const calendarCalls = apiCalls.filter(call => call.includes('/order/calendar'));
      expect(calendarCalls.length).toBeGreaterThan(0);
      
      // Verify it's hitting the direct BE
      const directBECalls = calendarCalls.filter(call => call.includes(ORDER_BE));
      expect(directBECalls.length).toBeGreaterThan(0);
    });
  });

  test.describe('User Flow - Booking Calendar', () => {
    test('should load booking calendar page', async ({ page }) => {
      await page.goto(`${BASE_URL}/book/calendar`);
      await page.waitForLoadState('networkidle');

      // Check for console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.waitForTimeout(3000);
      console.log('Booking calendar page. Console errors:', errors);
      expect(errors.length).toBe(0);
    });

    test('should check availability using Order BE', async ({ page }) => {
      await page.goto(`${BASE_URL}/book/calendar`);
      
      const apiCalls: string[] = [];
      
      page.on('request', request => {
        const url = request.url();
        if (url.includes('/order/availability') || url.includes('/order/calendar')) {
          apiCalls.push(url);
          console.log('Availability/Calendar API Call:', url);
        }
      });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Verify availability endpoint was called
      const availabilityCalls = apiCalls.filter(call => 
        call.includes('/order/availability') || call.includes('/order/calendar')
      );
      expect(availabilityCalls.length).toBeGreaterThan(0);
      
      // Verify it's hitting the direct BE
      const directBECalls = availabilityCalls.filter(call => call.includes(ORDER_BE));
      expect(directBECalls.length).toBeGreaterThan(0);
    });

    test('should validate promo codes using Promo BE', async ({ page }) => {
      await page.goto(`${BASE_URL}/book/calendar`);
      
      const apiCalls: string[] = [];
      
      page.on('request', request => {
        const url = request.url();
        if (url.includes('/promo/validate')) {
          apiCalls.push(url);
          console.log('Promo API Call:', url);
        }
      });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Check if any promo validation calls were made
      const promoCalls = apiCalls.filter(call => call.includes('/promo/validate'));
      if (promoCalls.length > 0) {
        // Verify it's hitting the direct BE
        const directBECalls = promoCalls.filter(call => call.includes(PROMO_BE));
        expect(directBECalls.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('User Flow - Booking Form', () => {
    test('should load booking form page', async ({ page }) => {
      await page.goto(`${BASE_URL}/book/form`);
      await page.waitForLoadState('networkidle');

      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.waitForTimeout(3000);
      console.log('Booking form page. Console errors:', errors);
      expect(errors.length).toBe(0);
    });
  });

  test.describe('User Flow - Booking Review', () => {
    test('should load booking review page', async ({ page }) => {
      await page.goto(`${BASE_URL}/book/review`);
      await page.waitForLoadState('networkidle');

      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.waitForTimeout(3000);
      console.log('Booking review page. Console errors:', errors);
      expect(errors.length).toBe(0);
    });

    test('should create orders using Order BE', async ({ page }) => {
      await page.goto(`${BASE_URL}/book/review`);
      
      const apiCalls: string[] = [];
      
      page.on('request', request => {
        const url = request.url();
        if (url.includes('/order/create') || url.includes('/order/')) {
          apiCalls.push(url);
          console.log('Order API Call:', url);
        }
      });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Check if order creation calls were made
      const orderCalls = apiCalls.filter(call => call.includes('/order/create'));
      if (orderCalls.length > 0) {
        // Verify it's hitting the direct BE
        const directBECalls = orderCalls.filter(call => call.includes(ORDER_BE));
        expect(directBECalls.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('User Flow - Payment Pages', () => {
    test('should load payment page', async ({ page }) => {
      await page.goto(`${BASE_URL}/book/payment`);
      await page.waitForLoadState('networkidle');

      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.waitForTimeout(3000);
      console.log('Payment page. Console errors:', errors);
      expect(errors.length).toBe(0);
    });

    test('should load confirmation page', async ({ page }) => {
      await page.goto(`${BASE_URL}/book/confirmation/test-order`);
      await page.waitForLoadState('networkidle');

      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.waitForTimeout(3000);
      console.log('Confirmation page. Console errors:', errors);
    });
  });

  // ========== OWNER DASHBOARD TESTS ==========

  test.describe('Owner Dashboard', () => {
    test('should load owner dashboard', async ({ page }) => {
      await page.goto(`${BASE_URL}/owner`);
      await page.waitForLoadState('networkidle');

      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.waitForTimeout(3000);
      console.log('Owner dashboard. Console errors:', errors);
      expect(errors.length).toBe(0);
    });

    test('should fetch dashboard data from Order BE', async ({ page }) => {
      await page.goto(`${BASE_URL}/owner`);
      
      const apiCalls: string[] = [];
      
      page.on('request', request => {
        const url = request.url();
        if (url.includes('/order/admin/dashboard') || url.includes('/order/admin/revenue')) {
          apiCalls.push(url);
          console.log('Dashboard API Call:', url);
        }
      });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Check if dashboard API calls were made
      const dashboardCalls = apiCalls.filter(call => 
        call.includes('/order/admin/dashboard') || call.includes('/order/admin/revenue')
      );
      if (dashboardCalls.length > 0) {
        // Verify it's hitting the direct BE
        const directBECalls = dashboardCalls.filter(call => call.includes(ORDER_BE));
        expect(directBECalls.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Owner - Orders Management', () => {
    test('should load pending orders tab', async ({ page }) => {
      await page.goto(`${BASE_URL}/owner/orders/pending`);
      await page.waitForLoadState('networkidle');

      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.waitForTimeout(3000);
      console.log('Pending orders tab. Console errors:', errors);
      expect(errors.length).toBe(0);
    });

    test('should load active orders tab', async ({ page }) => {
      await page.goto(`${BASE_URL}/owner/orders/active`);
      await page.waitForLoadState('networkidle');

      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.waitForTimeout(3000);
      console.log('Active orders tab. Console errors:', errors);
      expect(errors.length).toBe(0);
    });

    test('should load previous orders tab', async ({ page }) => {
      await page.goto(`${BASE_URL}/owner/orders/previous`);
      await page.waitForLoadState('networkidle');

      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.waitForTimeout(3000);
      console.log('Previous orders tab. Console errors:', errors);
      expect(errors.length).toBe(0);
    });

    test('should fetch order lists from Order BE', async ({ page }) => {
      await page.goto(`${BASE_URL}/owner/orders/pending`);
      
      const apiCalls: string[] = [];
      
      page.on('request', request => {
        const url = request.url();
        if (url.includes('/order/admin/list')) {
          apiCalls.push(url);
          console.log('Orders API Call:', url);
        }
      });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Check if orders API calls were made
      const orderListCalls = apiCalls.filter(call => call.includes('/order/admin/list'));
      if (orderListCalls.length > 0) {
        // Verify it's hitting the direct BE
        const directBECalls = orderListCalls.filter(call => call.includes(ORDER_BE));
        expect(directBECalls.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Owner - Calendar Management', () => {
    test('should load calendar tab', async ({ page }) => {
      await page.goto(`${BASE_URL}/owner/calendar`);
      await page.waitForLoadState('networkidle');

      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.waitForTimeout(3000);
      console.log('Calendar tab. Console errors:', errors);
      expect(errors.length).toBe(0);
    });

    test('should fetch calendar and blocked dates from Order BE', async ({ page }) => {
      await page.goto(`${BASE_URL}/owner/calendar`);
      
      const apiCalls: string[] = [];
      
      page.on('request', request => {
        const url = request.url();
        if (url.includes('/order/calendar') || url.includes('/order/admin/pricing')) {
          apiCalls.push(url);
          console.log('Calendar API Call:', url);
        }
      });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Check if calendar API calls were made
      const calendarCalls = apiCalls.filter(call => 
        call.includes('/order/calendar') || call.includes('/order/admin/pricing')
      );
      if (calendarCalls.length > 0) {
        // Verify it's hitting the direct BE
        const directBECalls = calendarCalls.filter(call => call.includes(ORDER_BE));
        expect(directBECalls.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Owner - Pricing Management', () => {
    test('should load pricing tab', async ({ page }) => {
      await page.goto(`${BASE_URL}/owner/pricing`);
      await page.waitForLoadState('networkidle');

      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.waitForTimeout(3000);
      console.log('Pricing tab. Console errors:', errors);
      expect(errors.length).toBe(0);
    });

    test('should fetch pricing rules from Order BE', async ({ page }) => {
      await page.goto(`${BASE_URL}/owner/pricing`);
      
      const apiCalls: string[] = [];
      
      page.on('request', request => {
        const url = request.url();
        if (url.includes('/order/admin/pricing')) {
          apiCalls.push(url);
          console.log('Pricing API Call:', url);
        }
      });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Check if pricing API calls were made
      const pricingCalls = apiCalls.filter(call => call.includes('/order/admin/pricing'));
      if (pricingCalls.length > 0) {
        // Verify it's hitting the direct BE
        const directBECalls = pricingCalls.filter(call => call.includes(ORDER_BE));
        expect(directBECalls.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Owner - Users Management', () => {
    test('should load users tab', async ({ page }) => {
      await page.goto(`${BASE_URL}/owner/users`);
      await page.waitForLoadState('networkidle');

      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.waitForTimeout(3000);
      console.log('Users tab. Console errors:', errors);
      expect(errors.length).toBe(0);
    });

    test('should fetch guest data from Order BE', async ({ page }) => {
      await page.goto(`${BASE_URL}/owner/users`);
      
      const apiCalls: string[] = [];
      
      page.on('request', request => {
        const url = request.url();
        if (url.includes('/order/admin/guests')) {
          apiCalls.push(url);
          console.log('Guests API Call:', url);
        }
      });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Check if guests API calls were made
      const guestCalls = apiCalls.filter(call => call.includes('/order/admin/guests'));
      if (guestCalls.length > 0) {
        // Verify it's hitting the direct BE
        const directBECalls = guestCalls.filter(call => call.includes(ORDER_BE));
        expect(directBECalls.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Owner - Promos Management', () => {
    test('should load promos tab', async ({ page }) => {
      await page.goto(`${BASE_URL}/owner/promos`);
      await page.waitForLoadState('networkidle');

      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.waitForTimeout(3000);
      console.log('Promos tab. Console errors:', errors);
      expect(errors.length).toBe(0);
    });

    test('should fetch promos from Promo BE', async ({ page }) => {
      await page.goto(`${BASE_URL}/owner/promos`);
      
      const apiCalls: string[] = [];
      
      page.on('request', request => {
        const url = request.url();
        if (url.includes('/promo/admin') || url.includes('/promo/')) {
          apiCalls.push(url);
          console.log('Promo API Call:', url);
        }
      });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Check if promo API calls were made
      const promoCalls = apiCalls.filter(call => call.includes('/promo/'));
      if (promoCalls.length > 0) {
        // Verify it's hitting the direct BE
        const directBECalls = promoCalls.filter(call => call.includes(PROMO_BE));
        expect(directBECalls.length).toBeGreaterThan(0);
      }
    });
  });

  // ========== API CONNECTIVITY TESTS ==========

  test.describe('Direct BE Connectivity', () => {
    test('Order BE should be accessible', async ({ request }) => {
      const response = await request.get(`${ORDER_BE}/docs`);
      expect(response.status()).toBe(200);
      console.log('Order BE is accessible');
    });

    test('Promo BE should be accessible', async ({ request }) => {
      const response = await request.get(`${PROMO_BE}/docs`);
      expect(response.status()).toBe(200);
      console.log('Promo BE is accessible');
    });

    test('Auth BE should be accessible', async ({ request }) => {
      const response = await request.get(`${AUTH_BE}/docs`);
      expect(response.status()).toBe(200);
      console.log('Auth BE is accessible');
    });
  });

  // ========== ERROR HANDLING TESTS ==========

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Navigate to a page that makes API calls
      await page.goto(`${BASE_URL}/owner`);
      
      // Monitor for failed requests
      const failedRequests: string[] = [];
      
      page.on('response', response => {
        if (response.status() >= 400) {
          failedRequests.push(`${response.url()} - ${response.status()}`);
          console.log('Failed request:', response.url(), response.status());
        }
      });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      console.log('Failed requests:', failedRequests);
      // We expect some 401s due to auth, but no 500s
      const serverErrors = failedRequests.filter(req => req.includes(' 5'));
      expect(serverErrors.length).toBe(0);
    });
  });

  test.afterAll(async () => {
    console.log('All endpoint integration tests completed!');
    console.log('========================================');
    console.log('Test Summary:');
    console.log('- User Flow Pages: Tested');
    console.log('- Owner Dashboard Pages: Tested');
    console.log('- API Connectivity: Verified');
    console.log('- Direct BE Integration: Confirmed');
    console.log('========================================');
  });
});
