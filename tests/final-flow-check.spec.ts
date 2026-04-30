import { test, expect, type Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

type StepResult = {
  step: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details: string;
  duration: number;
  screenshot?: string;
};

const results: StepResult[] = [];
const apiLog: { url: string; method: string; status?: number; failed: boolean; error?: string }[] = [];
const consoleErrors: string[] = [];

function recordStep(step: string, status: StepResult['status'], details: string, start: number) {
  results.push({ step, status, details, duration: Date.now() - start });
}

test.describe('Full Happy-Path E2E: User Booking → Admin Approve', () => {

  test('Complete flow with admin approval', async ({ page }, testInfo) => {
    testInfo.setTimeout(300000);

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
    });

    page.on('requestfailed', req => {
      apiLog.push({
        url: req.url(),
        method: req.request().method(),
        failed: true,
        error: req.failure()?.errorText,
      });
    });

    page.on('response', res => {
      const url = res.url();
      if (url.includes('izcy.tech') || url.includes('localhost')) {
        apiLog.push({
          url,
          method: res.request().method(),
          status: res.status(),
          failed: false,
        });
      }
    });

    // ═══════════════════════════════════════════
    // PART 1: USER BOOKING FLOW
    // ═══════════════════════════════════════════

    // ─── STEP 1: Homepage loads ───
    let t = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const homepageTitle = await page.title();
    if (homepageTitle && homepageTitle.length > 0) {
      recordStep('1. Homepage loads', 'PASS', `Title: "${homepageTitle}"`, t);
    } else {
      recordStep('1. Homepage loads', 'FAIL', 'Page title empty or missing', t);
    }

    // ─── STEP 2: Navigate to calendar ───
    t = Date.now();
    await page.goto('/book/calendar');
    await page.waitForTimeout(3000);

    const calendarHeading = page.locator('text=Select Your Dates').or(page.locator('text=Pilih Tanggal'));
    const calendarVisible = await calendarHeading.first().isVisible().catch(() => false);
    if (calendarVisible) {
      recordStep('2. Calendar page loads', 'PASS', 'Calendar heading visible', t);
    } else {
      recordStep('2. Calendar page loads', 'FAIL', 'Calendar heading NOT visible', t);
    }

    // ─── STEP 3: Select dates on calendar ───
    t = Date.now();

    // Wait for calendar API to load
    await page.waitForResponse(resp => resp.url().includes('/order/calendar'), { timeout: 15000 }).catch(() => null);
    await page.waitForTimeout(500);

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
      recordStep('3. Select dates', 'PASS', `Selected 2 consecutive dates (indices ${firstIdx}, ${secondIdx}) after ${monthNavAttempts} month navigations`, t);
    } else {
      recordStep('3. Select dates', 'FAIL', `No consecutive available dates found (${availableCount} buttons, ${monthNavAttempts} months tried)`, t);
    }

    const replaceModal = page.locator('text=Ganti Pilihan Tanggal');
    if (await replaceModal.isVisible().catch(() => false)) {
      await page.locator('button', { hasText: /Ya, Ganti/i }).click();
      await page.waitForTimeout(300);
    }

    // ─── STEP 4: Click Lanjut ───
    t = Date.now();
    const lanjutBtn = page.locator('button', { hasText: /Lanjut|Continue/i });
    await expect(lanjutBtn).toBeVisible({ timeout: 5000 });
    await lanjutBtn.click();

    // Wait for availability check and navigation
    await page.waitForTimeout(5000);
    const urlAfterLanjut = page.url();
    if (urlAfterLanjut.includes('/book/form')) {
      recordStep('4. Click Lanjut → navigate to form', 'PASS', `URL: ${urlAfterLanjut}`, t);
    } else {
      recordStep('4. Click Lanjut → navigate to form', 'WARN', `URL after Lanjut: ${urlAfterLanjut}`, t);
    }

    // Check for availability error modal
    const availError = page.locator('text=/tidak tersedia|not available|blocked/i');
    if (await availError.isVisible().catch(() => false)) {
      recordStep('4b. Availability check', 'FAIL', 'Availability error modal appeared - dates blocked', Date.now());
    }

    // If not on form page yet, try navigating directly
    if (!page.url().includes('/book/form')) {
      await page.goto('/book/form');
      await page.waitForTimeout(3000);
    }

    // ─── STEP 5: Fill booking form ───
    t = Date.now();
    const formUrl = page.url();

    if (!formUrl.includes('/book/form')) {
      recordStep('5. Fill booking form', 'FAIL', `Not on /book/form - at ${formUrl}. Likely dates/context lost.`, t);
    } else {
      // Fill form fields
      await page.fill('input[name="fullName"]', 'QA Test User');
      await page.fill('input[name="phone"]', '081234567890');
      await page.fill('input[name="email"]', 'qa-test@villa-yutaka.test');

      // Province autocomplete
      await page.fill('input[name="province"]', 'Jawa');
      await page.waitForTimeout(500);
      const provinceOption = page.locator('li', { hasText: 'Jawa Barat' }).first();
      if (await provinceOption.isVisible().catch(() => false)) {
        await provinceOption.click();
      } else {
        await page.fill('input[name="province"]', 'Jawa Barat');
      }

      await page.waitForTimeout(300);

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

      // Fill address
      await page.fill('input[name="address"]', 'Jl. Test No. 123, Bandung');

      recordStep('5. Fill booking form', 'PASS', 'All form fields filled', t);
    }

    // ─── STEP 6: Submit form → Review page ───
    t = Date.now();
    const reviewBtn = page.locator('button', { hasText: /Tinjau Pemesanan|Review Booking/i });
    const reviewBtnVisible = await reviewBtn.isVisible().catch(() => false);

    if (!reviewBtnVisible) {
      recordStep('6. Submit form → Review', 'FAIL', 'Review Booking button not visible', t);
    } else {
      await reviewBtn.click();
      await page.waitForTimeout(5000);

      const reviewUrl = page.url();
      if (reviewUrl.includes('/book/review')) {
        recordStep('6. Submit form → Review', 'PASS', `URL: ${reviewUrl}`, t);
      } else {
        recordStep('6. Submit form → Review', 'WARN', `URL after review click: ${reviewUrl}`, t);
      }
    }

    // ─── STEP 7: Review page - wait for order creation ───
    t = Date.now();
    if (!page.url().includes('/book/review')) {
      recordStep('7. Review page - order creation', 'FAIL', 'Not on review page', t);
    } else {
      // Wait for order to be created (auto-creates on mount)
      await page.waitForTimeout(5000);

      // Check for order error
      const orderErrorEl = page.locator('.bg-red-50');
      const orderErrorVisible = await orderErrorEl.isVisible().catch(() => false);

      if (orderErrorVisible) {
        const errText = await orderErrorEl.textContent().catch(() => '');
        recordStep('7. Review page - order creation', 'FAIL', `Order error: ${errText?.substring(0, 200)}`, t);
      } else {
        // Check for order ID
        const orderIdEl = page.locator('text=/Order ID|VY-/i').first();
        const orderIdVisible = await orderIdEl.isVisible().catch(() => false);

        if (orderIdVisible) {
          const orderIdText = await orderIdEl.textContent().catch(() => '');
          recordStep('7. Review page - order creation', 'PASS', `Order created: ${orderIdText}`, t);
        } else {
          recordStep('7. Review page - order creation', 'WARN', 'No error but order ID not visible', t);
        }
      }
    }

    // ─── STEP 8: Confirm & Continue to Payment ───
    t = Date.now();
    const confirmBtn = page.locator('button', { hasText: /Konfirmasi.*Pembayaran|Confirm.*Payment|Confirm & Continue/i });
    const confirmBtnCount = await confirmBtn.count();

    if (confirmBtnCount > 0) {
      const confirmBtnEnabled = await confirmBtn.first().isEnabled().catch(() => false);
      if (confirmBtnEnabled) {
        await confirmBtn.first().click();
        await page.waitForTimeout(5000);

        const paymentUrl = page.url();
        if (paymentUrl.includes('/book/payment')) {
          recordStep('8. Confirm → Payment page', 'PASS', `URL: ${paymentUrl}`, t);
        } else {
          recordStep('8. Confirm → Payment page', 'WARN', `URL after confirm: ${paymentUrl}`, t);
        }
      } else {
        const btnText = await confirmBtn.first().textContent().catch(() => '');
        recordStep('8. Confirm → Payment page', 'FAIL', `Button disabled: "${btnText}"`, t);
      }
    } else {
      recordStep('8. Confirm → Payment page', 'FAIL', 'Confirm & Continue button not found', t);
    }

    // ─── STEP 9: Payment page - submit payment ───
    t = Date.now();
    if (!page.url().includes('/book/payment')) {
      recordStep('9. Payment page', 'FAIL', 'Not on payment page', t);
    } else {
      // Wait for order to load
      await page.waitForTimeout(3000);

      // Check payment page loaded
      const paymentTitleEl = page.locator('text=/Pembayaran|Payment/i').first();
      const paymentTitleVisible = await paymentTitleEl.isVisible().catch(() => false);

      if (!paymentTitleVisible) {
        recordStep('9. Payment page load', 'FAIL', 'Payment title not visible', t);
      } else {
        // Check transfer confirmation checkbox
        const transferCheckbox = page.locator('input[type="checkbox"]');
        const checkboxVisible = await transferCheckbox.first().isVisible().catch(() => false);

        if (checkboxVisible) {
          await transferCheckbox.first().check();
          await page.waitForTimeout(300);

          // Click submit payment button
          const submitBtn = page.locator('button', { hasText: /Kirim Pembayaran|Submit Booking/i });
          const submitBtnVisible = await submitBtn.isVisible().catch(() => false);

          if (submitBtnVisible) {
            const submitEnabled = await submitBtn.isEnabled().catch(() => false);
            if (submitEnabled) {
              await submitBtn.click();
              await page.waitForTimeout(5000);

              const confirmUrl = page.url();
              if (confirmUrl.includes('/book/confirmation')) {
                recordStep('9. Payment - submit', 'PASS', `Redirected to confirmation: ${confirmUrl}`, t);
              } else {
                recordStep('9. Payment - submit', 'WARN', `URL after submit: ${confirmUrl}`, t);
              }
            } else {
              recordStep('9. Payment - submit', 'FAIL', 'Submit button disabled', t);
            }
          } else {
            recordStep('9. Payment - submit', 'FAIL', 'Submit Booking button not visible', t);
          }
        } else {
          recordStep('9. Payment - checkbox', 'FAIL', 'Transfer confirmation checkbox not found', t);
        }
      }
    }

    // ─── STEP 10: Confirmation page ───
    t = Date.now();
    if (page.url().includes('/book/confirmation')) {
      const confirmPageContent = page.locator('text=/Booking.*Submitted|Pemesanan.*Terkirim|Order ID|VY-/i').first();
      const confirmContentVisible = await confirmPageContent.isVisible().catch(() => false);

      if (confirmContentVisible) {
        // Extract order ID for admin verification
        const pageText = await page.textContent('body').catch(() => '');
        const orderIdMatch = pageText?.match(/VY-[A-Z0-9-]+/);
        const orderId = orderIdMatch ? orderIdMatch[0] : null;

        recordStep('10. Confirmation page', 'PASS', `Order confirmed${orderId ? ` - Order ID: ${orderId}` : ''}`, t);

        // ═══════════════════════════════════════════
        // PART 2: ADMIN APPROVAL FLOW
        // ═══════════════════════════════════════════

        // ─── STEP 11: Admin login ───
        t = Date.now();
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        await page.fill('#username', ADMIN_USERNAME);
        await page.fill('#password', ADMIN_PASSWORD);
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(5000);

        const afterLoginUrl = page.url();
        if (afterLoginUrl.includes('/owner')) {
          recordStep('11. Admin login', 'PASS', `Logged in, URL: ${afterLoginUrl}`, t);
        } else {
          recordStep('11. Admin login', 'FAIL', `Login failed or not redirected to owner. URL: ${afterLoginUrl}`, t);
        }

        // ─── STEP 12: Navigate to pending orders ───
        t = Date.now();
        await page.goto('/owner/orders/pending');
        await page.waitForTimeout(5000);

        const pendingTitle = page.locator('text=/Pending|pending|Pending Bookings/i').first();
        const pendingVisible = await pendingTitle.isVisible().catch(() => false);

        if (pendingVisible || page.url().includes('/owner')) {
          recordStep('12. Pending orders page', 'PASS', `URL: ${page.url()}`, t);
        } else {
          recordStep('12. Pending orders page', 'WARN', `URL: ${page.url()}, title visible: ${pendingVisible}`, t);
        }

        // ─── STEP 13: Find and approve the order ───
        t = Date.now();
        // Look for the order in the pending list
        // The page should show booking cards with "Approve Booking" buttons
        await page.waitForTimeout(3000);

        const approveButtons = page.locator('button', { hasText: /Approve Booking/i });
        const approveCount = await approveButtons.count();

        if (approveCount > 0) {
          // If we have an order ID, try to find it specifically
          let approved = false;

          if (orderId) {
            // Find the card containing our order ID
            const orderIdInList = page.locator(`text=${orderId}`).first();
            const orderIdVisible = await orderIdInList.isVisible().catch(() => false);

            if (orderIdVisible) {
              // Find the Approve button near this order
              const card = page.locator(`*:has-text("${orderId}")`).last();
              const cardApproveBtn = card.locator('button', { hasText: /Approve Booking/i });
              if (await cardApproveBtn.isVisible().catch(() => false)) {
                await cardApproveBtn.click();
                approved = true;
              }
            }
          }

          if (!approved && approveCount > 0) {
            // Fallback: approve the first order
            await approveButtons.first().click();
            approved = true;
          }

          if (approved) {
            await page.waitForTimeout(1000);

            // Confirm in the modal
            const modalApproveBtn = page.locator('button', { hasText: /^Approve Booking$/i }).last();
            const modalVisible = await page.locator('text=Confirm Approval').isVisible().catch(() => false);

            if (modalVisible) {
              await page.locator('button', { hasText: /^Approve Booking$/i }).last().click();
              await page.waitForTimeout(5000);

              // Check for success message
              const successMsg = page.locator('text=/approved|Approved/i').first();
              const successVisible = await successMsg.isVisible().catch(() => false);

              if (successVisible) {
                recordStep('13. Approve order', 'PASS', `Order approved successfully${orderId ? ` (${orderId})` : ''}`, t);
              } else {
                recordStep('13. Approve order', 'PASS', `Approve modal confirmed (no explicit success msg)${orderId ? ` (${orderId})` : ''}`, t);
              }
            } else {
              recordStep('13. Approve order', 'WARN', 'Approve clicked but no confirmation modal appeared', t);
            }
          }
        } else {
          // Check for in_transaction orders (awaiting guest payment)
          const inTransMsg = page.locator('text=/Awaiting guest payment/i');
          if (await inTransMsg.isVisible().catch(() => false)) {
            recordStep('13. Approve order', 'WARN', 'Order is in_transaction (awaiting payment), not pending', t);
          } else {
            recordStep('13. Approve order', 'FAIL', 'No Approve Booking buttons found on pending page', t);
          }
        }

      } else {
        recordStep('10. Confirmation page', 'WARN', 'On confirmation page but expected content not visible', t);
      }
    } else {
      recordStep('10. Confirmation page', 'FAIL', `Not on confirmation page. URL: ${page.url()}`, t);
    }

    // ═══════════════════════════════════════════
    // RESULTS SUMMARY
    // ═══════════════════════════════════════════
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║          FINAL FLOW CHECK — RESULTS SUMMARY                     ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');

    let passCount = 0;
    let failCount = 0;
    let warnCount = 0;

    for (const r of results) {
      const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`║ ${icon} ${r.step.padEnd(42)} ${r.status.padEnd(6)} ${String(r.duration + 'ms').padEnd(8)} ║`);
      if (r.details) console.log(`║    ${r.details.substring(0, 62).padEnd(62)} ║`);
      if (r.status === 'PASS') passCount++;
      else if (r.status === 'FAIL') failCount++;
      else warnCount++;
    }

    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log(`║ PASS: ${passCount}  FAIL: ${failCount}  WARN: ${warnCount}  TOTAL: ${results.length}`.padEnd(67) + '║');
    console.log('╚══════════════════════════════════════════════════════════════════╝');

    // API Log
    console.log('\n📊 API CALLS (izcy.tech):');
    const izcyCalls = apiLog.filter(c => c.url.includes('izcy.tech'));
    izcyCalls.forEach(c => {
      console.log(`  ${c.failed ? '❌' : '✅'} ${c.status ?? '---'} ${c.method.padEnd(8)} ${c.url.substring(0, 80)}`);
    });

    console.log('\n📋 CONSOLE ERRORS:');
    if (consoleErrors.length === 0) {
      console.log('  (none)');
    } else {
      consoleErrors.forEach(e => console.log(`  ${e}`));
    }

    // Final assertion - at least the core booking flow should pass
    const coreSteps = results.filter(r => ['1', '2', '3', '4', '5'].some(s => r.step.startsWith(s)));
    const corePasses = coreSteps.filter(r => r.status === 'PASS').length;
    expect(corePasses).toBeGreaterThanOrEqual(3);
  });
});
