# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bug-same-phone-order.spec.ts >> Bug Fix: Same Phone Number Order Creation >> bug flow: create order → Buat Pesanan Baru → same phone → button should work
- Location: tests\bug-same-phone-order.spec.ts:5:3

# Error details

```
Test timeout of 600000ms exceeded.
```

```
Error: locator.click: Test timeout of 600000ms exceeded.
Call log:
  - waiting for locator('button').filter({ hasText: /Lanjut|Continue/i })
    - locator resolved to <button disabled class="btn-primary flex-1">Lanjut</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
      - waiting 100ms
    1095 × waiting for element to be visible, enabled and stable
         - element is not enabled
       - retrying click action
         - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e6]:
      - link "VILLA SEKIPAN" [ref=e7] [cursor=pointer]:
        - /url: /
      - generic [ref=e8]:
        - link "Beranda" [ref=e9] [cursor=pointer]:
          - /url: /
        - link "Villa" [ref=e10] [cursor=pointer]:
          - /url: /villa
        - link "Peraturan" [ref=e11] [cursor=pointer]:
          - /url: /rules
        - link "Pesan Sekarang" [ref=e12] [cursor=pointer]:
          - /url: /book
        - link "ID" [ref=e13] [cursor=pointer]:
          - /url: /en
  - main [ref=e14]:
    - generic [ref=e16]:
      - generic [ref=e18]:
        - generic [ref=e19]:
          - generic [ref=e20]: "1"
          - generic [ref=e21]: Pilih Tanggal
        - generic [ref=e23]:
          - generic [ref=e24]: "2"
          - generic [ref=e25]: Info Tamu
        - generic [ref=e27]:
          - generic [ref=e28]: "3"
          - generic [ref=e29]: Tinjauan
      - generic [ref=e30]:
        - generic [ref=e31]:
          - generic [ref=e32]:
            - heading "Pilih Tanggal Anda" [level=2] [ref=e33]
            - paragraph [ref=e34]: Pilih tanggal untuk menginap. Setiap tanggal mewakili 1 malam (check-in 12:00 - check-out 12:00 hari berikutnya).
            - generic [ref=e35]:
              - generic [ref=e36]:
                - button "Bulan sebelumnya" [ref=e37] [cursor=pointer]:
                  - img [ref=e38]
                - heading "Mei 2026" [level=3] [ref=e40]
                - button "Bulan berikutnya" [ref=e41] [cursor=pointer]:
                  - img [ref=e42]
              - generic [ref=e44]:
                - generic [ref=e45]: Min
                - generic [ref=e46]: Sen
                - generic [ref=e47]: Sel
                - generic [ref=e48]: Rab
                - generic [ref=e49]: Kam
                - generic [ref=e50]: Jum
                - generic [ref=e51]: Sab
              - generic [ref=e52]:
                - button "1" [disabled] [ref=e58]:
                  - generic [ref=e59]: "1"
                - button "2" [disabled] [ref=e60]:
                  - generic [ref=e61]: "2"
                - button "3" [disabled] [ref=e62]:
                  - generic [ref=e63]: "3"
                - button "4" [disabled] [ref=e64]:
                  - generic [ref=e65]: "4"
                - button "5" [disabled] [ref=e66]:
                  - generic [ref=e67]: "5"
                - button "6" [disabled] [ref=e68]:
                  - generic [ref=e69]: "6"
                - button "7" [disabled] [ref=e70]:
                  - generic [ref=e71]: "7"
                - button "8" [disabled] [ref=e72]:
                  - generic [ref=e73]: "8"
                - button "9" [disabled] [ref=e74]:
                  - generic [ref=e75]: "9"
                - button "10" [disabled] [ref=e76]:
                  - generic [ref=e77]: "10"
                - button "11" [disabled] [ref=e78]:
                  - generic [ref=e79]: "11"
                - button "12" [disabled] [ref=e80]:
                  - generic [ref=e81]: "12"
                - button "13" [disabled] [ref=e82]:
                  - generic [ref=e83]: "13"
                - button "14" [disabled] [ref=e84]:
                  - generic [ref=e85]: "14"
                - button "15" [disabled] [ref=e86]:
                  - generic [ref=e87]: "15"
                - button "16" [disabled] [ref=e88]:
                  - generic [ref=e89]: "16"
                - button "17" [ref=e90] [cursor=pointer]:
                  - generic [ref=e91]: "17"
                - button "18" [disabled] [ref=e92]:
                  - generic [ref=e93]: "18"
                - button "19" [disabled] [ref=e94]:
                  - generic [ref=e95]: "19"
                - button "20" [disabled] [ref=e96]:
                  - generic [ref=e97]: "20"
                - button "21" [disabled] [ref=e98]:
                  - generic [ref=e99]: "21"
                - button "22" [disabled] [ref=e100]:
                  - generic [ref=e101]: "22"
                - button "23" [disabled] [ref=e102]:
                  - generic [ref=e103]: "23"
                - button "24" [ref=e104] [cursor=pointer]:
                  - generic [ref=e105]: "24"
                - button "25" [disabled] [ref=e106]:
                  - generic [ref=e107]: "25"
                - button "26" [disabled] [ref=e108]:
                  - generic [ref=e109]: "26"
                - button "27" [disabled] [ref=e110]:
                  - generic [ref=e111]: "27"
                - button "28" [disabled] [ref=e112]:
                  - generic [ref=e113]: "28"
                - button "29" [disabled] [ref=e114]:
                  - generic [ref=e115]: "29"
                - button "30" [disabled] [ref=e116]:
                  - generic [ref=e117]: "30"
                - button "31" [ref=e118] [cursor=pointer]:
                  - generic [ref=e119]: "31"
              - generic [ref=e120]:
                - generic [ref=e123]: Dipilih
                - generic [ref=e126]: Dalam Rentang
                - generic [ref=e129]: Tidak Tersedia
                - generic [ref=e132]: Hari Ini
          - button "Lanjut" [disabled] [ref=e134]
        - generic [ref=e136]:
          - heading "Ringkasan Pemesanan" [level=3] [ref=e137]
          - paragraph [ref=e139]: Pilih tanggal untuk melihat harga
          - generic [ref=e140]:
            - paragraph [ref=e141]: Kode Promo
            - generic [ref=e143]:
              - textbox "Masukkan kode" [ref=e144]
              - button "Terapkan" [disabled] [ref=e145]
  - contentinfo [ref=e146]:
    - generic [ref=e147]:
      - generic [ref=e148]:
        - generic [ref=e149]:
          - heading "VILLA SEKIPAN" [level=3] [ref=e150]
          - paragraph [ref=e151]: Rasakan kemewahan dan ketenangan di villa eksklusif kami. Tempat peristirahatan sempurna untuk liburan Anda.
        - generic [ref=e152]:
          - heading "Tautan Cepat" [level=4] [ref=e153]
          - list [ref=e154]:
            - listitem [ref=e155]:
              - link "Beranda" [ref=e156] [cursor=pointer]:
                - /url: /
            - listitem [ref=e157]:
              - link "Villa" [ref=e158] [cursor=pointer]:
                - /url: /villa
            - listitem [ref=e159]:
              - link "Pesan Sekarang" [ref=e160] [cursor=pointer]:
                - /url: /book
            - listitem [ref=e161]:
              - link "Status Pemesanan" [ref=e162] [cursor=pointer]:
                - /url: /booking-status
        - generic [ref=e163]:
          - heading "Kontak" [level=4] [ref=e164]
          - list [ref=e165]:
            - listitem [ref=e166]: "Email: info@villasekipan.com"
            - listitem [ref=e167]: "Telepon: +62 XXX XXX XXXX"
            - listitem [ref=e168]: "Lokasi: Tawangmangu, Indonesia"
      - paragraph [ref=e170]: © 2026 Villa Sekipan. Hak cipta dilindungi.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Bug Fix: Same Phone Number Order Creation', () => {
  4   | 
  5   |   test('bug flow: create order → Buat Pesanan Baru → same phone → button should work', async ({ page }) => {
  6   |     const BASE = 'http://localhost:5173';
  7   |     const TEST_PHONE = '081234567890';
  8   | 
  9   |     console.log('========== STEP 1: Create first order ==========');
  10  | 
  11  |     // ─── STEP 1: Navigate to calendar ───
  12  |     await page.goto(`${BASE}/book/calendar`);
  13  |     await page.waitForLoadState('networkidle');
  14  |     await page.waitForTimeout(2000);
  15  | 
  16  |     // ─── STEP 2: Select 2 consecutive dates ───
  17  |     await page.waitForResponse(resp => resp.url().includes('/order/calendar'), { timeout: 15000 }).catch(() => null);
  18  |     await page.waitForTimeout(1000);
  19  | 
  20  |     let allButtons = page.locator('.grid.grid-cols-7 button:not([disabled])');
  21  |     let availableCount = await allButtons.count();
  22  |     let firstIdx = -1;
  23  |     let secondIdx = -1;
  24  |     let monthNavAttempts = 0;
  25  | 
  26  |     while (firstIdx < 0 && monthNavAttempts < 12) {
  27  |       for (let i = 0; i < availableCount - 1; i++) {
  28  |         const text1 = (await allButtons.nth(i).textContent())?.trim() || '';
  29  |         const text2 = (await allButtons.nth(i + 1).textContent())?.trim() || '';
  30  |         const day1 = parseInt(text1);
  31  |         const day2 = parseInt(text2);
  32  |         if (!isNaN(day1) && !isNaN(day2) && day2 - day1 === 1) {
  33  |           firstIdx = i;
  34  |           secondIdx = i + 1;
  35  |           break;
  36  |         }
  37  |       }
  38  | 
  39  |       if (firstIdx < 0) {
  40  |         const nextMonthBtn = page.locator('button[aria-label="Next month"], button[title="Next month"]').first();
  41  |         const nextMonthBtnText = page.locator('button', { hasText: /Bulan berikutnya|Next month|›|>/i }).first();
  42  |         let clicked = false;
  43  | 
  44  |         if (await nextMonthBtnText.isVisible().catch(() => false)) {
  45  |           const apiPromise = page.waitForResponse(resp => resp.url().includes('/order/calendar'), { timeout: 10000 }).catch(() => null);
  46  |           await nextMonthBtnText.click();
  47  |           await apiPromise;
  48  |           await page.waitForTimeout(1500);
  49  |           clicked = true;
  50  |         } else if (await nextMonthBtn.isVisible().catch(() => false)) {
  51  |           const apiPromise = page.waitForResponse(resp => resp.url().includes('/order/calendar'), { timeout: 10000 }).catch(() => null);
  52  |           await nextMonthBtn.click();
  53  |           await apiPromise;
  54  |           await page.waitForTimeout(1500);
  55  |           clicked = true;
  56  |         }
  57  | 
  58  |         if (clicked) {
  59  |           allButtons = page.locator('.grid.grid-cols-7 button:not([disabled])');
  60  |           availableCount = await allButtons.count();
  61  |           monthNavAttempts++;
  62  |         } else {
  63  |           break;
  64  |         }
  65  |       }
  66  |     }
  67  | 
  68  |     if (firstIdx >= 0) {
  69  |       await allButtons.nth(firstIdx).click();
  70  |       await page.waitForTimeout(300);
  71  |       await allButtons.nth(secondIdx).click();
  72  |       await page.waitForTimeout(500);
  73  |     }
  74  | 
  75  |     // Handle "replace selection" modal if it appears
  76  |     const replaceModal = page.locator('text=Ganti Pilihan Tanggal');
  77  |     if (await replaceModal.isVisible().catch(() => false)) {
  78  |       await page.locator('button', { hasText: /Ya, Ganti/i }).click();
  79  |       await page.waitForTimeout(300);
  80  |     }
  81  | 
  82  |     // ─── STEP 3: Click Lanjut ───
  83  |     const lanjutBtn = page.locator('button', { hasText: /Lanjut|Continue/i });
  84  |     await expect(lanjutBtn).toBeVisible({ timeout: 5000 });
> 85  |     await lanjutBtn.click();
      |                     ^ Error: locator.click: Test timeout of 600000ms exceeded.
  86  |     await page.waitForTimeout(5000);
  87  | 
  88  |     if (!page.url().includes('/book/form')) {
  89  |       await page.goto(`${BASE}/book/form`);
  90  |       await page.waitForTimeout(3000);
  91  |     }
  92  | 
  93  |     // ─── STEP 4: Fill form (FIRST TIME with TEST_PHONE) ───
  94  |     await page.fill('input[name="fullName"]', 'QA Test User');
  95  |     await page.fill('input[name="phone"]', TEST_PHONE);
  96  |     await page.fill('input[name="email"]', 'test@example.com');
  97  | 
  98  |     // Province autocomplete
  99  |     const provinceInput = page.locator('input[name="province"]');
  100 |     await provinceInput.fill('Jawa');
  101 |     await page.waitForTimeout(500);
  102 |     const provinceOption = page.locator('li', { hasText: 'Jawa Barat' }).first();
  103 |     if (await provinceOption.isVisible().catch(() => false)) {
  104 |       await provinceOption.click();
  105 |     } else {
  106 |       await provinceInput.fill('Jawa Barat');
  107 |     }
  108 | 
  109 |     // City autocomplete
  110 |     const cityInput = page.locator('input[name="city"]');
  111 |     await cityInput.fill('Band');
  112 |     await page.waitForTimeout(500);
  113 |     const cityOption = page.locator('li', { hasText: 'Bandung' }).first();
  114 |     if (await cityOption.isVisible().catch(() => false)) {
  115 |       await cityOption.click();
  116 |     } else {
  117 |       await cityInput.fill('Bandung');
  118 |     }
  119 | 
  120 |     // Select check-in time
  121 |     const timeBtn = page.locator('button', { hasText: '14:00 - 16:00' });
  122 |     if (await timeBtn.isVisible().catch(() => false)) {
  123 |       await timeBtn.click();
  124 |     }
  125 | 
  126 |     // ─── STEP 5: Submit form → Review page ───
  127 |     const reviewBtn = page.locator('button', { hasText: /Tinjau Pemesanan|Review Booking/i });
  128 |     await expect(reviewBtn).toBeVisible({ timeout: 5000 });
  129 |     await reviewBtn.click();
  130 | 
  131 |     // Wait for review page to load and order to be created
  132 |     await page.waitForURL('**/book/review**', { timeout: 30000 });
  133 |     await page.waitForTimeout(3000);
  134 | 
  135 |     console.log('[FIRST ORDER] Current URL:', page.url());
  136 | 
  137 |     // ─── STEP 6: Click "Konfirmasi & Lanjut Pembayaran" (first order should work) ───
  138 |     const confirmBtn = page.locator('button', { hasText: /Konfirmasi.*Lanjut.*Pembayaran/i });
  139 |     await expect(confirmBtn).toBeVisible({ timeout: 10000 });
  140 | 
  141 |     const isEnabled = await confirmBtn.isEnabled();
  142 |     console.log('[FIRST ORDER] Confirm button enabled:', isEnabled);
  143 | 
  144 |     expect(isEnabled).toBe(true);
  145 | 
  146 |     await confirmBtn.click();
  147 |     await page.waitForURL('**/book/payment/**', { timeout: 30000 });
  148 | 
  149 |     console.log('[FIRST ORDER] After confirm, URL:', page.url());
  150 |     const firstOrderId = page.url().split('/book/payment/')[1] || 'unknown';
  151 |     console.log('[FIRST ORDER] Order ID:', firstOrderId);
  152 | 
  153 |     // ─── STEP 7: Click "Buat Pesanan Baru" ───
  154 |     // This button might be in different locations depending on the page layout
  155 |     const buatBaruBtn = page.locator('button', { hasText: /Buat Pesanan Baru/i });
  156 |     await expect(buatBaruBtn.first()).toBeVisible({ timeout: 10000 });
  157 |     await buatBaruBtn.first().click();
  158 | 
  159 |     console.log('========== STEP 2: Create second order with same phone ==========');
  160 | 
  161 |     // Wait for calendar page
  162 |     await page.waitForURL('**/book/calendar**', { timeout: 10000 });
  163 |     await page.waitForTimeout(2000);
  164 | 
  165 |     // ─── STEP 8: Select dates again ───
  166 |     await page.waitForResponse(resp => resp.url().includes('/order/calendar'), { timeout: 15000 }).catch(() => null);
  167 |     await page.waitForTimeout(1000);
  168 | 
  169 |     allButtons = page.locator('.grid.grid-cols-7 button:not([disabled])');
  170 |     availableCount = await allButtons.count();
  171 |     firstIdx = -1;
  172 |     secondIdx = -1;
  173 |     monthNavAttempts = 0;
  174 | 
  175 |     while (firstIdx < 0 && monthNavAttempts < 12) {
  176 |       for (let i = 0; i < availableCount - 1; i++) {
  177 |         const text1 = (await allButtons.nth(i).textContent())?.trim() || '';
  178 |         const text2 = (await allButtons.nth(i + 1).textContent())?.trim() || '';
  179 |         const day1 = parseInt(text1);
  180 |         const day2 = parseInt(text2);
  181 |         if (!isNaN(day1) && !isNaN(day2) && day2 - day1 === 1) {
  182 |           firstIdx = i;
  183 |           secondIdx = i + 1;
  184 |           break;
  185 |         }
```