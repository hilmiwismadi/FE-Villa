import { test, expect } from '@playwright/test';

const DEMO_URL = 'http://localhost:5173/demo';

test.describe('/demo Theme Customizer Page', () => {
  test('should load demo page without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(DEMO_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const criticalErrors = errors.filter(e =>
      e.includes('Error') && !e.includes('401') && !e.includes('Failed to fetch')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('should render hero section', async ({ page }) => {
    await page.goto(DEMO_URL);
    await page.waitForLoadState('networkidle');

    const hero = page.locator('section').first();
    expect(await hero.isVisible()).toBe(true);
  });

  test('should show demo banner at top', async ({ page }) => {
    await page.goto(DEMO_URL);
    await page.waitForLoadState('networkidle');

    const banner = page.locator('text=Theme Demo Mode');
    expect(await banner.isVisible()).toBe(true);
  });

  test('should show theme picker toggle button (bottom right)', async ({ page }) => {
    await page.goto(DEMO_URL);
    await page.waitForLoadState('networkidle');

    const toggleBtn = page.locator('button[title="Open Theme Picker"]');
    expect(await toggleBtn.isVisible()).toBe(true);
  });

  test('should expand theme picker on click', async ({ page }) => {
    await page.goto(DEMO_URL);
    await page.waitForLoadState('networkidle');

    const toggleBtn = page.locator('button[title="Open Theme Picker"]');
    await toggleBtn.click();
    await page.waitForTimeout(500);

    const header = page.locator('text=Theme Customizer');
    expect(await header.isVisible()).toBe(true);
  });

  test('should show preset themes in picker', async ({ page }) => {
    await page.goto(DEMO_URL);
    await page.waitForLoadState('networkidle');

    await page.locator('button[title="Open Theme Picker"]').click();
    await page.waitForTimeout(500);

    const presets = ['Earthy Brown', 'Deep Navy Blue', 'Ocean Teal', 'Forest Green', 'Charcoal Slate', 'Royal Purple'];
    for (const name of presets) {
      const el = page.locator(`text=${name}`).first();
      expect(await el.isVisible()).toBe(true);
    }
  });

  test('should switch to custom tab', async ({ page }) => {
    await page.goto(DEMO_URL);
    await page.waitForLoadState('networkidle');

    await page.locator('button[title="Open Theme Picker"]').click();
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Custom' }).click();
    const primaryLabel = page.locator('text=Primary Colors');
    expect(await primaryLabel.isVisible()).toBe(true);
  });

  test('should apply theme change when selecting a preset', async ({ page }) => {
    await page.goto(DEMO_URL);
    await page.waitForLoadState('networkidle');

    await page.locator('button[title="Open Theme Picker"]').click();
    await page.waitForTimeout(500);

    await page.locator('text=Forest Green').click();
    await page.waitForTimeout(500);

    const footer = page.locator('text=Active: Forest Green');
    expect(await footer.isVisible()).toBe(true);
  });

  test('should minimize theme picker', async ({ page }) => {
    await page.goto(DEMO_URL);
    await page.waitForLoadState('networkidle');

    await page.locator('button[title="Open Theme Picker"]').click();
    await page.waitForTimeout(500);

    const closeBtn = page.locator('.fixed button').filter({ has: page.locator('svg') }).last();
    const allButtons = page.locator('.fixed button');
    const count = await allButtons.count();

    for (let i = 0; i < count; i++) {
      const btn = allButtons.nth(i);
      const text = await btn.textContent();
      if (text === null || text.trim() === '') {
        const isVisible = await btn.isVisible();
        if (isVisible) {
          const box = await btn.boundingBox();
          if (box && box.width < 40 && box.height < 40) {
            await btn.click();
            break;
          }
        }
      }
    }

    await page.waitForTimeout(500);
    const toggleBtn = page.locator('button[title="Open Theme Picker"]');
    expect(await toggleBtn.isVisible()).toBe(true);
  });

  test('should show export button in expanded picker', async ({ page }) => {
    await page.goto(DEMO_URL);
    await page.waitForLoadState('networkidle');

    await page.locator('button[title="Open Theme Picker"]').click();
    await page.waitForTimeout(500);

    const exportBtn = page.locator('text=Export');
    expect(await exportBtn.isVisible()).toBe(true);
  });

  test('should render all homepage sections', async ({ page }) => {
    await page.goto(DEMO_URL);
    await page.waitForLoadState('networkidle');

    const sections = page.locator('section');
    const count = await sections.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('should persist theme after page reload', async ({ page }) => {
    await page.goto(DEMO_URL);
    await page.waitForLoadState('networkidle');

    await page.locator('button[title="Open Theme Picker"]').click();
    await page.waitForTimeout(500);

    await page.locator('text=Royal Purple').click();
    await page.waitForTimeout(500);

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('button[title="Open Theme Picker"]').click();
    await page.waitForTimeout(500);

    const footer = page.locator('text=Active: Royal Purple');
    expect(await footer.isVisible()).toBe(true);
  });
});
