import { test, expect } from '@playwright/test';
import { format, addDays } from 'date-fns';

test.describe('Full Booking Flow — CORS & Error Check', () => {

  test('Complete flow: homepage → calendar → form → review → payment', async ({ page }, testInfo) => {
    testInfo.setTimeout(120000);
    const apiCalls: { url: string; method: string; status?: number; failed: boolean; error?: string }[] = [];
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
    });

    page.on('requestfailed', req => {
      apiCalls.push({
        url: req.url(),
        method: req.resourceType(),
        failed: true,
        error: req.failure()?.errorText,
      });
    });

    page.on('response', res => {
      const url = res.url();
      if (url.includes('izcy.tech')) {
        apiCalls.push({
          url,
          method: res.request().method(),
          status: res.status(),
          failed: false,
        });
      }
    });

    // ─── STEP 1: Homepage ───
    console.log('\n========== STEP 1: HOMEPAGE ==========');
    await page.goto('/');
    await page.waitForSelector('#availability', { timeout: 10000 });
    await page.waitForTimeout(3000);

    const homepageAPI = apiCalls.filter(c => c.url.includes('/order/calendar'));
    console.log('Homepage calendar API calls:', homepageAPI.length);
    homepageAPI.forEach(c => console.log(`  ${c.failed ? 'FAIL' : 'OK'} ${c.status} ${c.url}`));

    // ─── STEP 2: /book/calendar ───
    console.log('\n========== STEP 2: /book/calendar ==========');
    await page.goto('/book/calendar');
    await page.waitForTimeout(4000);

    const calendarAPI = apiCalls.filter(c => c.url.includes('/order/calendar'));
    console.log('Calendar page API calls:', calendarAPI.length);
    calendarAPI.forEach(c => console.log(`  ${c.failed ? 'FAIL' : 'OK'} ${c.status} ${c.method} ${c.url}`));

    // Find 2 adjacent available dates by looking for a pair of consecutive enabled buttons
    // The grid has empty cells for days before month starts, so we look for enabled buttons
    const allButtons = page.locator('.grid.grid-cols-7 button:not([disabled])');
    const availableCount = await allButtons.count();
    console.log(`Available (non-disabled) calendar buttons: ${availableCount}`);

    // Get the date number of each available button and find adjacent pair
    // Available dates from API: 14(today), 17-30. We need consecutive days like 17,18
    // Strategy: iterate available buttons, find two where day numbers differ by 1
    let firstIdx = -1;
    let secondIdx = -1;
    for (let i = 0; i < availableCount - 1; i++) {
      const text1 = (await allButtons.nth(i).textContent())?.trim() || '';
      const text2 = (await allButtons.nth(i + 1).textContent())?.trim() || '';
      const day1 = parseInt(text1);
      const day2 = parseInt(text2);
      if (!isNaN(day1) && !isNaN(day2) && day2 - day1 === 1) {
        firstIdx = i;
        secondIdx = i + 1;
        break;
      }
    }

    if (firstIdx >= 0) {
      const t1 = (await allButtons.nth(firstIdx).textContent())?.trim();
      const t2 = (await allButtons.nth(secondIdx).textContent())?.trim();
      await allButtons.nth(firstIdx).click();
      console.log(`Clicked date: ${t1}`);
      await page.waitForTimeout(300);
      await allButtons.nth(secondIdx).click();
      console.log(`Clicked date: ${t2}`);
      await page.waitForTimeout(300);
    } else if (availableCount >= 2) {
      // Fallback: click first two and handle replace modal
      const t1 = (await allButtons.nth(0).textContent())?.trim();
      const t2 = (await allButtons.nth(1).textContent())?.trim();
      await allButtons.nth(0).click();
      console.log(`Fallback: clicked date ${t1}`);
      await page.waitForTimeout(300);
      await allButtons.nth(1).click();
      console.log(`Fallback: clicked date ${t2}`);
      await page.waitForTimeout(300);
    }

    await page.waitForTimeout(500);

    // Handle possible "Ganti Pilihan Tanggal" confirmation modal
    const replaceModal = page.locator('text=Ganti Pilihan Tanggal?');
    if (await replaceModal.isVisible().catch(() => false)) {
      console.log('Replace date modal appeared - clicking Ya, Ganti');
      await page.locator('button', { hasText: /Ya, Ganti/i }).click();
      await page.waitForTimeout(300);
    }

    // Verify sidebar shows check-in/check-out
    const sidebarCheckIn = page.locator('text=Check-in').first();
    if (await sidebarCheckIn.isVisible()) {
      console.log('Sidebar shows check-in info');
    }

    // Click "Lanjut" button
    const lanjutBtn = page.locator('button', { hasText: /Lanjut/i });
    await expect(lanjutBtn).toBeVisible({ timeout: 5000 });
    await lanjutBtn.click();
    console.log('Clicked Lanjut');
    await page.waitForTimeout(1000);

    // ─── Booking Method Modal ───
    console.log('\n========== BOOKING METHOD MODAL ==========');

    // Check if modal appeared or if we're already on a different page
    await page.waitForTimeout(1500);
    const currentUrlAfterLanjut = page.url();
    console.log('URL after Lanjut:', currentUrlAfterLanjut);

    const websiteBtn = page.locator('button', { hasText: /Website|website/i });
    const modalVisible = await websiteBtn.isVisible().catch(() => false);

    if (modalVisible) {
      // Listen for availability API call
      await websiteBtn.click();
      console.log('Clicked Book via Website');
      await page.waitForTimeout(5000);

      // Check if availability API was called
      const availabilityAPI = apiCalls.filter(c => c.url.includes('/order/availability'));
      console.log('Availability API calls:', availabilityAPI.length);
      availabilityAPI.forEach(c => console.log(`  ${c.failed ? 'FAIL' : 'OK'} ${c.status} ${c.url}`));

      // Check for error modal
      const errorModal = page.locator('text=/tidak tersedia|not available|blocked/i');
      if (await errorModal.isVisible().catch(() => false)) {
        console.log('ERROR: Availability error modal appeared');
      }
    } else {
      console.log('Booking method modal NOT visible. Looking for Website button in page...');
      // Maybe we need to wait more or the modal isn't showing
      // Dump visible buttons
      const allBtns = page.locator('button:visible');
      const btnCount = await allBtns.count();
      for (let i = 0; i < Math.min(btnCount, 15); i++) {
        const text = await allBtns.nth(i).textContent().catch(() => '');
        console.log(`  Visible button ${i}: "${text?.trim().substring(0, 60)}"`);
      }
    }

    // Check current URL
    const urlAfterModal = page.url();
    console.log('URL after modal interaction:', urlAfterModal);

    if (!urlAfterModal.includes('/book/form')) {
      console.log('❌ Not on /book/form yet');
    }

    // ─── STEP 3: /book/form ───
    console.log('\n========== STEP 3: /book/form ==========');

    // Fill form
    await page.fill('input[name="fullName"]', 'Test User Playwright');
    await page.fill('input[name="phone"]', '081234567890');

    // Province autocomplete
    await page.fill('input[name="province"]', 'Jawa');
    await page.waitForTimeout(500);
    const provinceOption = page.locator('li', { hasText: 'Jawa Barat' }).first();
    if (await provinceOption.isVisible().catch(() => false)) {
      await provinceOption.click();
      console.log('Selected province: Jawa Barat');
    }

    await page.waitForTimeout(300);

    // City autocomplete
    const cityInput = page.locator('input[name="city"]');
    await cityInput.fill('Band');
    await page.waitForTimeout(500);
    const cityOption = page.locator('li', { hasText: 'Bandung' }).first();
    if (await cityOption.isVisible().catch(() => false)) {
      await cityOption.click();
      console.log('Selected city: Bandung');
    }

    // Select check-in time
    const timeBtn = page.locator('button', { hasText: '14:00 - 16:00' });
    if (await timeBtn.isVisible()) {
      await timeBtn.click();
      console.log('Selected check-in time: 14:00-16:00');
    }

    await page.waitForTimeout(500);

    // Check current URL - might have been redirected
    await page.waitForTimeout(2000);
    const formUrl = page.url();
    console.log('Current URL after form fill:', formUrl);

    if (!formUrl.includes('/book/form')) {
      console.log('❌ REDIRECTED AWAY from /book/form - likely dates/context lost');
      console.log('This means BookingContext was reset or dates not persisted properly');
    }

    // Click review button (Indonesian: "Tinjau Pemesanan")
    const reviewBtn = page.locator('button', { hasText: /Tinjau Pemesanan|Review Booking|reviewBooking/i });
    const reviewBtnVisible = await reviewBtn.isVisible().catch(() => false);

    if (!reviewBtnVisible) {
      console.log('❌ Review button NOT FOUND. Dumping all visible buttons:');
      const allButtons = page.locator('button');
      const btnCount = await allButtons.count();
      for (let i = 0; i < btnCount; i++) {
        const text = await allButtons.nth(i).textContent().catch(() => '');
        const visible = await allButtons.nth(i).isVisible().catch(() => false);
        if (visible) console.log(`  Button ${i}: "${text?.trim()}"`);
      }
    } else {
      await reviewBtn.click();
      console.log('Clicked Tinjau Pemesanan');
    }

    await page.waitForTimeout(8000);

    // ─── STEP 4: /book/review ───
    console.log('\n========== STEP 4: /book/review ==========');
    console.log('Current URL:', page.url());

    const orderAPI = apiCalls.filter(c => c.url.includes('/order/create'));
    console.log('Order create API calls:', orderAPI.length);
    orderAPI.forEach(c => console.log(`  ${c.failed ? 'FAIL' : 'OK'} ${c.status} ${c.method} ${c.url}`));

    // Check for order error
    const orderErrorEl = page.locator('text=/Failed to create|Unable to create|Invalid booking|Gagal/i');
    if (await orderErrorEl.isVisible().catch(() => false)) {
      console.log('❌ Order creation error visible on page');
      const errText = await page.locator('.bg-red-50').textContent().catch(() => '');
      console.log('Error text:', errText);
    }

    // Check for order ID displayed
    const orderIdEl = page.locator('text=/Order ID|VY-/i').first();
    if (await orderIdEl.isVisible().catch(() => false)) {
      console.log('✅ Order ID displayed on review page');
    }

    // Click confirm payment button (Indonesian: "Konfirmasi & Lanjut ke Pembayaran")
    const confirmBtn = page.locator('button', { hasText: /Konfirmasi|Pembayaran|Confirm Payment/i });
    const confirmBtnExists = await confirmBtn.count();

    if (confirmBtnExists > 0) {
      const confirmBtnEnabled = await confirmBtn.first().isEnabled().catch(() => false);
      console.log(`Confirm Payment button found: ${confirmBtnExists}, enabled: ${confirmBtnEnabled}`);

      if (confirmBtnEnabled) {
        await confirmBtn.first().click();
        console.log('Clicked Confirm Payment button');
        await page.waitForTimeout(8000);
      } else {
        console.log('Confirm Payment button is DISABLED');
        const text = await confirmBtn.first().textContent().catch(() => '');
        console.log('Button text:', text);
      }
    } else {
      console.log('Confirm Payment button NOT FOUND');

      // Dump visible buttons for debugging
      try {
        const allBtns = page.locator('button');
        const count = await allBtns.count();
        for (let i = 0; i < Math.min(count, 20); i++) {
          const visible = await allBtns.nth(i).isVisible().catch(() => false);
          if (visible) {
            const text = await allBtns.nth(i).textContent().catch(() => '');
            const disabled = await allBtns.nth(i).getAttribute('disabled').catch(() => null);
            console.log(`  Button ${i}: "${text?.trim().substring(0, 60)}" disabled=${disabled}`);
          }
        }
      } catch (e) {
        console.log('Error dumping buttons:', e);
      }
    }

    // ─── STEP 5: /book/payment ───
    console.log('\n========== STEP 5: /book/payment ==========');
    console.log('Current URL:', page.url());

    const paymentAPI = apiCalls.filter(c => c.url.includes('/confirm-payment'));
    console.log('Confirm payment API calls:', paymentAPI.length);
    paymentAPI.forEach(c => console.log(`  ${c.failed ? 'FAIL' : 'OK'} ${c.status} ${c.method} ${c.url}`));

    // Check if payment page loaded
    const paymentTitle = page.locator('text=/Pembayaran|Payment/i').first();
    if (await paymentTitle.isVisible().catch(() => false)) {
      console.log('✅ Payment page loaded');
    } else {
      console.log('❌ Payment page NOT loaded');
    }

    // ─── FINAL SUMMARY ───
    console.log('\n========================================');
    console.log('ALL API CALLS TO izcy.tech');
    console.log('========================================');
    apiCalls.forEach(c => {
      console.log(`${c.failed ? '❌ FAIL' : '✅ OK'} ${c.status ?? '---'} ${c.method.padEnd(8)} ${c.url}${c.error ? ' | ' + c.error : ''}`);
    });

    console.log('\n========================================');
    console.log('CONSOLE ERRORS');
    console.log('========================================');
    if (consoleErrors.length === 0) {
      console.log('(none)');
    } else {
      consoleErrors.forEach(e => console.log(e));
    }
  });
});
