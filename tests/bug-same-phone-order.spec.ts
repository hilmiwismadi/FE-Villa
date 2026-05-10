import { test, expect } from '@playwright/test';

test.describe('Bug Fix: Same Phone Number Order Creation', () => {

  test('bug flow: create order → Buat Pesanan Baru → same phone → button should work', async ({ page }) => {
    const BASE = 'http://localhost:5173';
    const TEST_PHONE = '081234567890';

    console.log('========== STEP 1: Create first order ==========');

    // ─── STEP 1: Navigate to calendar ───
    await page.goto(`${BASE}/book/calendar`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // ─── STEP 2: Select 2 consecutive dates ───
    await page.waitForResponse(resp => resp.url().includes('/order/calendar'), { timeout: 15000 }).catch(() => null);
    await page.waitForTimeout(1000);

    let allButtons = page.locator('.grid.grid-cols-7 button:not([disabled])');
    let availableCount = await allButtons.count();
    let firstIdx = -1;
    let secondIdx = -1;
    let monthNavAttempts = 0;

    while (firstIdx < 0 && monthNavAttempts < 12) {
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

      if (firstIdx < 0) {
        const nextMonthBtn = page.locator('button[aria-label="Next month"], button[title="Next month"]').first();
        const nextMonthBtnText = page.locator('button', { hasText: /Bulan berikutnya|Next month|›|>/i }).first();
        let clicked = false;

        if (await nextMonthBtnText.isVisible().catch(() => false)) {
          const apiPromise = page.waitForResponse(resp => resp.url().includes('/order/calendar'), { timeout: 10000 }).catch(() => null);
          await nextMonthBtnText.click();
          await apiPromise;
          await page.waitForTimeout(1500);
          clicked = true;
        } else if (await nextMonthBtn.isVisible().catch(() => false)) {
          const apiPromise = page.waitForResponse(resp => resp.url().includes('/order/calendar'), { timeout: 10000 }).catch(() => null);
          await nextMonthBtn.click();
          await apiPromise;
          await page.waitForTimeout(1500);
          clicked = true;
        }

        if (clicked) {
          allButtons = page.locator('.grid.grid-cols-7 button:not([disabled])');
          availableCount = await allButtons.count();
          monthNavAttempts++;
        } else {
          break;
        }
      }
    }

    if (firstIdx >= 0) {
      await allButtons.nth(firstIdx).click();
      await page.waitForTimeout(300);
      await allButtons.nth(secondIdx).click();
      await page.waitForTimeout(500);
    }

    // Handle "replace selection" modal if it appears
    const replaceModal = page.locator('text=Ganti Pilihan Tanggal');
    if (await replaceModal.isVisible().catch(() => false)) {
      await page.locator('button', { hasText: /Ya, Ganti/i }).click();
      await page.waitForTimeout(300);
    }

    // ─── STEP 3: Click Lanjut ───
    const lanjutBtn = page.locator('button', { hasText: /Lanjut|Continue/i });
    await expect(lanjutBtn).toBeVisible({ timeout: 5000 });
    await lanjutBtn.click();
    await page.waitForTimeout(5000);

    if (!page.url().includes('/book/form')) {
      await page.goto(`${BASE}/book/form`);
      await page.waitForTimeout(3000);
    }

    // ─── STEP 4: Fill form (FIRST TIME with TEST_PHONE) ───
    await page.fill('input[name="fullName"]', 'QA Test User');
    await page.fill('input[name="phone"]', TEST_PHONE);
    await page.fill('input[name="email"]', 'test@example.com');

    // Province autocomplete
    const provinceInput = page.locator('input[name="province"]');
    await provinceInput.fill('Jawa');
    await page.waitForTimeout(500);
    const provinceOption = page.locator('li', { hasText: 'Jawa Barat' }).first();
    if (await provinceOption.isVisible().catch(() => false)) {
      await provinceOption.click();
    } else {
      await provinceInput.fill('Jawa Barat');
    }

    // City autocomplete
    const cityInput = page.locator('input[name="city"]');
    await cityInput.fill('Band');
    await page.waitForTimeout(500);
    const cityOption = page.locator('li', { hasText: 'Bandung' }).first();
    if (await cityOption.isVisible().catch(() => false)) {
      await cityOption.click();
    } else {
      await cityInput.fill('Bandung');
    }

    // Select check-in time
    const timeBtn = page.locator('button', { hasText: '14:00 - 16:00' });
    if (await timeBtn.isVisible().catch(() => false)) {
      await timeBtn.click();
    }

    // ─── STEP 5: Submit form → Review page ───
    const reviewBtn = page.locator('button', { hasText: /Tinjau Pemesanan|Review Booking/i });
    await expect(reviewBtn).toBeVisible({ timeout: 5000 });
    await reviewBtn.click();

    // Wait for review page to load and order to be created
    await page.waitForURL('**/book/review**', { timeout: 30000 });
    await page.waitForTimeout(3000);

    console.log('[FIRST ORDER] Current URL:', page.url());

    // ─── STEP 6: Click "Konfirmasi & Lanjut Pembayaran" (first order should work) ───
    const confirmBtn = page.locator('button', { hasText: /Konfirmasi.*Lanjut.*Pembayaran/i });
    await expect(confirmBtn).toBeVisible({ timeout: 10000 });

    const isEnabled = await confirmBtn.isEnabled();
    console.log('[FIRST ORDER] Confirm button enabled:', isEnabled);

    expect(isEnabled).toBe(true);

    await confirmBtn.click();
    await page.waitForURL('**/book/payment/**', { timeout: 30000 });

    console.log('[FIRST ORDER] After confirm, URL:', page.url());
    const firstOrderId = page.url().split('/book/payment/')[1] || 'unknown';
    console.log('[FIRST ORDER] Order ID:', firstOrderId);

    // ─── STEP 7: Click "Buat Pesanan Baru" ───
    // This button might be in different locations depending on the page layout
    const buatBaruBtn = page.locator('button', { hasText: /Buat Pesanan Baru/i });
    await expect(buatBaruBtn.first()).toBeVisible({ timeout: 10000 });
    await buatBaruBtn.first().click();

    console.log('========== STEP 2: Create second order with same phone ==========');

    // Wait for calendar page
    await page.waitForURL('**/book/calendar**', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // ─── STEP 8: Select dates again ───
    await page.waitForResponse(resp => resp.url().includes('/order/calendar'), { timeout: 15000 }).catch(() => null);
    await page.waitForTimeout(1000);

    allButtons = page.locator('.grid.grid-cols-7 button:not([disabled])');
    availableCount = await allButtons.count();
    firstIdx = -1;
    secondIdx = -1;
    monthNavAttempts = 0;

    while (firstIdx < 0 && monthNavAttempts < 12) {
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

      if (firstIdx < 0) {
        const nextMonthBtn = page.locator('button[aria-label="Next month"], button[title="Next month"]').first();
        const nextMonthBtnText = page.locator('button', { hasText: /Bulan berikutnya|Next month|›|>/i }).first();
        let clicked = false;

        if (await nextMonthBtnText.isVisible().catch(() => false)) {
          const apiPromise = page.waitForResponse(resp => resp.url().includes('/order/calendar'), { timeout: 10000 }).catch(() => null);
          await nextMonthBtnText.click();
          await apiPromise;
          await page.waitForTimeout(1500);
          clicked = true;
        } else if (await nextMonthBtn.isVisible().catch(() => false)) {
          const apiPromise = page.waitForResponse(resp => resp.url().includes('/order/calendar'), { timeout: 10000 }).catch(() => null);
          await nextMonthBtn.click();
          await apiPromise;
          await page.waitForTimeout(1500);
          clicked = true;
        }

        if (clicked) {
          allButtons = page.locator('.grid.grid-cols-7 button:not([disabled])');
          availableCount = await allButtons.count();
          monthNavAttempts++;
        } else {
          break;
        }
      }
    }

    if (firstIdx >= 0) {
      await allButtons.nth(firstIdx).click();
      await page.waitForTimeout(300);
      await allButtons.nth(secondIdx).click();
      await page.waitForTimeout(500);
    }

    const replaceModal2 = page.locator('text=Ganti Pilihan Tanggal');
    if (await replaceModal2.isVisible().catch(() => false)) {
      await page.locator('button', { hasText: /Ya, Ganti/i }).click();
      await page.waitForTimeout(300);
    }

    // ─── STEP 9: Lanjut → Form ───
    const lanjutBtn2 = page.locator('button', { hasText: /Lanjut|Continue/i });
    await expect(lanjutBtn2).toBeVisible({ timeout: 5000 });
    await lanjutBtn2.click();
    await page.waitForTimeout(5000);

    if (!page.url().includes('/book/form')) {
      await page.goto(`${BASE}/book/form`);
      await page.waitForTimeout(3000);
    }

    // ─── STEP 10: Fill form (SECOND TIME with SAME phone) ───
    await page.fill('input[name="fullName"]', 'QA Test User');
    await page.fill('input[name="phone"]', TEST_PHONE);  // Same phone number
    await page.fill('input[name="email"]', 'test@example.com');

    await provinceInput.fill('Jawa');
    await page.waitForTimeout(500);
    if (await provinceOption.isVisible().catch(() => false)) {
      await provinceOption.click();
    } else {
      await provinceInput.fill('Jawa Barat');
    }

    await cityInput.fill('Band');
    await page.waitForTimeout(500);
    if (await cityOption.isVisible().catch(() => false)) {
      await cityOption.click();
    } else {
      await cityInput.fill('Bandung');
    }

    if (await timeBtn.isVisible().catch(() => false)) {
      await timeBtn.click();
    }

    // ─── STEP 11: Submit form → Review page ───
    await expect(reviewBtn).toBeVisible({ timeout: 5000 });
    await reviewBtn.click();

    // Wait for review page to load and order to be created
    await page.waitForURL('**/book/review**', { timeout: 30000 });
    await page.waitForTimeout(3000);

    console.log('[SECOND ORDER] Current URL:', page.url());

    // ─── STEP 12: Check "Konfirmasi & Lanjut Pembayaran" button ───
    const confirmBtn2 = page.locator('button', { hasText: /Konfirmasi.*Lanjut.*Pembayaran/i });
    await expect(confirmBtn2).toBeVisible({ timeout: 10000 });

    const isEnabled2 = await confirmBtn2.isEnabled();
    console.log('[SECOND ORDER] Confirm button enabled:', isEnabled2);

    // This is the BUG FIX VERIFICATION - button should be enabled even with same phone
    expect(isEnabled2).toBe(true);

    console.log('========== TEST PASSED ==========');
  });
});
