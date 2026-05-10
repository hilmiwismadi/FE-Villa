# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bug-same-phone-order.spec.ts >> Bug Fix: Same Phone Number Order Creation >> bug flow: create order → Buat Pesanan Baru → same phone → button should work
- Location: tests\bug-same-phone-order.spec.ts:5:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button').filter({ hasText: /Buat Pesanan Baru/i }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('button').filter({ hasText: /Buat Pesanan Baru/i }).first()

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
      - heading "Pembayaran" [level=1] [ref=e17]
      - generic [ref=e18]:
        - heading "Order Summary" [level=2] [ref=e19]
        - generic [ref=e20]:
          - paragraph [ref=e21]:
            - strong [ref=e22]: "Order ID:"
            - text: VY-20260510-005
          - paragraph [ref=e23]:
            - strong [ref=e24]: "Status:"
            - text: in_transaction
          - paragraph [ref=e25]:
            - strong [ref=e26]: "Guest Name:"
            - text: QA Test User
          - paragraph [ref=e27]:
            - strong [ref=e28]: "Check-in:"
            - text: 5/29/2026 (14:00)
          - paragraph [ref=e29]:
            - strong [ref=e30]: "Check-out:"
            - text: 5/31/2026 (12:00)
          - paragraph [ref=e31]:
            - strong [ref=e32]: "Number of Nights:"
            - text: "2"
          - paragraph [ref=e33]:
            - strong [ref=e34]: "Subtotal:"
            - text: IDR 4,000,000
          - paragraph [ref=e35]:
            - strong [ref=e36]: "Total Amount:"
            - text: IDR 4,000,097
          - paragraph [ref=e37]:
            - strong [ref=e38]: "Unique Code:"
            - text: "97"
          - paragraph [ref=e39]:
            - strong [ref=e40]: "Payment Deadline:"
            - text: 5/10/2026, 1:36:44 PM
      - generic [ref=e41]:
        - img [ref=e43]
        - generic [ref=e45]:
          - paragraph [ref=e46]: Batas Waktu Pembayaran
          - paragraph [ref=e47]: 09:47
          - paragraph [ref=e48]: Selesaikan pembayaran sebelum waktu habis
          - paragraph [ref=e49]: Timer berjalan sejak order dibuat (berdasarkan payment deadline dari server).
        - generic [ref=e50]:
          - paragraph [ref=e51]: 10 menit tersisa
          - paragraph [ref=e52]: batas waktu
      - generic [ref=e53]:
        - generic [ref=e54]:
          - generic [ref=e55]: "1"
          - heading "Transfer Bank" [level=2] [ref=e56]
        - generic [ref=e58]:
          - generic [ref=e59]:
            - paragraph [ref=e60]: Nama Bank
            - generic [ref=e61]:
              - paragraph [ref=e62]: Bank Mandiri
              - button "Salin" [ref=e63] [cursor=pointer]
          - generic [ref=e64]:
            - paragraph [ref=e65]: Nomor Rekening
            - generic [ref=e66]:
              - paragraph [ref=e67]: "1234567890"
              - button "Salin" [ref=e68] [cursor=pointer]
          - generic [ref=e69]:
            - paragraph [ref=e70]: Nama Pemilik Rekening
            - generic [ref=e71]:
              - paragraph [ref=e72]: Villa Sekipan
              - button "Salin" [ref=e73] [cursor=pointer]
        - generic [ref=e74]:
          - paragraph [ref=e75]: Jumlah Transfer
          - generic [ref=e76]:
            - paragraph [ref=e77]: IDR 4,000,097
            - button "Salin" [ref=e78] [cursor=pointer]
          - paragraph [ref=e79]: "Catatan: 2 digit terakhir (97) adalah kode pembeda transaksi."
        - generic [ref=e80]:
          - paragraph [ref=e81]: Referensi Pemesanan
          - generic [ref=e82]:
            - paragraph [ref=e83]: VY-20260510-005
            - button "Salin" [ref=e84] [cursor=pointer]
        - generic [ref=e85]: Mohon sertakan referensi ini di catatan transfer Anda
      - paragraph [ref=e87]:
        - strong [ref=e88]: "Important:"
        - text: Mohon transfer sesuai jumlah yang tertera di atas dan sertakan referensi pemesanan di catatan transfer Anda.
      - generic [ref=e89]:
        - generic [ref=e91] [cursor=pointer]:
          - 'checkbox "Saya sudah transfer dana ke rekening: Pastikan kembali nomor rekening dan jumlah transfer Anda. Centang kotak ini jika sudah benar, lalu klik tombol \"Kirim Pembayaran\" di bawah." [ref=e92]'
          - generic [ref=e93]:
            - text: "Saya sudah transfer dana ke rekening:"
            - paragraph [ref=e94]: Pastikan kembali nomor rekening dan jumlah transfer Anda. Centang kotak ini jika sudah benar, lalu klik tombol "Kirim Pembayaran" di bawah.
        - generic [ref=e96] [cursor=pointer]:
          - checkbox "Saya sudah membaca peraturan villa Bersedia mematuhi Ketentuan dan Peraturan yang villa ini tetapkan." [ref=e97]
          - generic [ref=e98]:
            - text: Saya sudah membaca
            - link "peraturan villa" [ref=e99]:
              - /url: /rules
            - paragraph [ref=e100]: Bersedia mematuhi Ketentuan dan Peraturan yang villa ini tetapkan.
        - button "Kirim Pembayaran" [disabled] [ref=e101]
  - contentinfo [ref=e102]:
    - generic [ref=e103]:
      - generic [ref=e104]:
        - generic [ref=e105]:
          - heading "VILLA SEKIPAN" [level=3] [ref=e106]
          - paragraph [ref=e107]: Rasakan kemewahan dan ketenangan di villa eksklusif kami. Tempat peristirahatan sempurna untuk liburan Anda.
        - generic [ref=e108]:
          - heading "Tautan Cepat" [level=4] [ref=e109]
          - list [ref=e110]:
            - listitem [ref=e111]:
              - link "Beranda" [ref=e112] [cursor=pointer]:
                - /url: /
            - listitem [ref=e113]:
              - link "Villa" [ref=e114] [cursor=pointer]:
                - /url: /villa
            - listitem [ref=e115]:
              - link "Pesan Sekarang" [ref=e116] [cursor=pointer]:
                - /url: /book
            - listitem [ref=e117]:
              - link "Status Pemesanan" [ref=e118] [cursor=pointer]:
                - /url: /booking-status
        - generic [ref=e119]:
          - heading "Kontak" [level=4] [ref=e120]
          - list [ref=e121]:
            - listitem [ref=e122]: "Email: info@villasekipan.com"
            - listitem [ref=e123]: "Telepon: +62 XXX XXX XXXX"
            - listitem [ref=e124]: "Lokasi: Tawangmangu, Indonesia"
      - paragraph [ref=e126]: © 2026 Villa Sekipan. Hak cipta dilindungi.
```

# Test source

```ts
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
  85  |     await lanjutBtn.click();
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
> 156 |     await expect(buatBaruBtn.first()).toBeVisible({ timeout: 10000 });
      |                                       ^ Error: expect(locator).toBeVisible() failed
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
  186 |       }
  187 | 
  188 |       if (firstIdx < 0) {
  189 |         const nextMonthBtn = page.locator('button[aria-label="Next month"], button[title="Next month"]').first();
  190 |         const nextMonthBtnText = page.locator('button', { hasText: /Bulan berikutnya|Next month|›|>/i }).first();
  191 |         let clicked = false;
  192 | 
  193 |         if (await nextMonthBtnText.isVisible().catch(() => false)) {
  194 |           const apiPromise = page.waitForResponse(resp => resp.url().includes('/order/calendar'), { timeout: 10000 }).catch(() => null);
  195 |           await nextMonthBtnText.click();
  196 |           await apiPromise;
  197 |           await page.waitForTimeout(1500);
  198 |           clicked = true;
  199 |         } else if (await nextMonthBtn.isVisible().catch(() => false)) {
  200 |           const apiPromise = page.waitForResponse(resp => resp.url().includes('/order/calendar'), { timeout: 10000 }).catch(() => null);
  201 |           await nextMonthBtn.click();
  202 |           await apiPromise;
  203 |           await page.waitForTimeout(1500);
  204 |           clicked = true;
  205 |         }
  206 | 
  207 |         if (clicked) {
  208 |           allButtons = page.locator('.grid.grid-cols-7 button:not([disabled])');
  209 |           availableCount = await allButtons.count();
  210 |           monthNavAttempts++;
  211 |         } else {
  212 |           break;
  213 |         }
  214 |       }
  215 |     }
  216 | 
  217 |     if (firstIdx >= 0) {
  218 |       await allButtons.nth(firstIdx).click();
  219 |       await page.waitForTimeout(300);
  220 |       await allButtons.nth(secondIdx).click();
  221 |       await page.waitForTimeout(500);
  222 |     }
  223 | 
  224 |     const replaceModal2 = page.locator('text=Ganti Pilihan Tanggal');
  225 |     if (await replaceModal2.isVisible().catch(() => false)) {
  226 |       await page.locator('button', { hasText: /Ya, Ganti/i }).click();
  227 |       await page.waitForTimeout(300);
  228 |     }
  229 | 
  230 |     // ─── STEP 9: Lanjut → Form ───
  231 |     const lanjutBtn2 = page.locator('button', { hasText: /Lanjut|Continue/i });
  232 |     await expect(lanjutBtn2).toBeVisible({ timeout: 5000 });
  233 |     await lanjutBtn2.click();
  234 |     await page.waitForTimeout(5000);
  235 | 
  236 |     if (!page.url().includes('/book/form')) {
  237 |       await page.goto(`${BASE}/book/form`);
  238 |       await page.waitForTimeout(3000);
  239 |     }
  240 | 
  241 |     // ─── STEP 10: Fill form (SECOND TIME with SAME phone) ───
  242 |     await page.fill('input[name="fullName"]', 'QA Test User');
  243 |     await page.fill('input[name="phone"]', TEST_PHONE);  // Same phone number
  244 |     await page.fill('input[name="email"]', 'test@example.com');
  245 | 
  246 |     await provinceInput.fill('Jawa');
  247 |     await page.waitForTimeout(500);
  248 |     if (await provinceOption.isVisible().catch(() => false)) {
  249 |       await provinceOption.click();
  250 |     } else {
  251 |       await provinceInput.fill('Jawa Barat');
  252 |     }
  253 | 
  254 |     await cityInput.fill('Band');
  255 |     await page.waitForTimeout(500);
  256 |     if (await cityOption.isVisible().catch(() => false)) {
```