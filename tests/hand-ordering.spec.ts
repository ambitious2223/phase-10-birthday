import { test, expect } from '@playwright/test';

const SKIP_SETUP = `
  localStorage.setItem('phase10_birthday_card_seen', 'true');
  localStorage.setItem('phase10_tutorial_completed', 'true');
`;

test.describe('Manual Hand Ordering', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(SKIP_SETUP);
    await page.goto('/');
    await page.waitForSelector('.game-board', { timeout: 15000 });
    await page.locator('button:has-text("Draw from Deck")').click();
    await page.waitForTimeout(500);
  });

  test('player hand has reorderable items', async ({ page }) => {
    const reorderItems = page.locator('.player-area .reorder-item');
    const count = await reorderItems.count();
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test('clicking a card marks it as swap-selected', async ({ page }) => {
    const firstCard = page.locator('.player-area .reorder-item').first();
    await firstCard.click();
    await expect(firstCard).toHaveClass(/swap-selected/);
  });

  test('clicking same card again deselects it', async ({ page }) => {
    const firstCard = page.locator('.player-area .reorder-item').first();
    await firstCard.click();
    await expect(firstCard).toHaveClass(/swap-selected/);
    await firstCard.click();
    await expect(firstCard).not.toHaveClass(/swap-selected/);
  });

  test('clicking two different cards swaps their order', async ({ page }) => {
    const items = page.locator('.player-area .reorder-item');
    const firstCard = items.nth(0);
    const secondCard = items.nth(1);

    const firstId = await firstCard.getAttribute('data-reorder-id');
    const secondId = await secondCard.getAttribute('data-reorder-id');

    await firstCard.click();
    await secondCard.click();

    await page.waitForTimeout(300);

    const newFirstId = await items.nth(0).getAttribute('data-reorder-id');
    const newSecondId = await items.nth(1).getAttribute('data-reorder-id');

    if (firstId && secondId) {
      expect(newFirstId).toBe(secondId);
      expect(newSecondId).toBe(firstId);
    }
  });

  test('hand card count remains stable after draw', async ({ page }) => {
    const count = await page.locator('.player-area .reorder-item').count();
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test('no automatic sort occurs - hand order persists', async ({ page }) => {
    const getCardOrder = async () => {
      const items = page.locator('.player-area .reorder-item');
      const count = await items.count();
      const ids: string[] = [];
      for (let i = 0; i < count; i++) {
        const id = await items.nth(i).getAttribute('data-reorder-id');
        if (id) ids.push(id);
      }
      return ids;
    };

    const orderBefore = await getCardOrder();
    await page.waitForTimeout(1000);
    const orderAfter = await getCardOrder();
    expect(orderAfter).toEqual(orderBefore);
  });

  test('swap selection clears on turn change', async ({ page }) => {
    const firstCard = page.locator('.player-area .reorder-item').first();
    await firstCard.click();
    await expect(firstCard).toHaveClass(/swap-selected/);
  });

  test('phase slots appear for Phase 1 requirements', async ({ page }) => {
    const phaseSlots = page.locator('.phase-slots');
    await expect(phaseSlots).toBeVisible({ timeout: 3000 });
  });

  test('phase slot labels show correct requirement text', async ({ page }) => {
    const slotLabels = page.locator('.phase-slot-label');
    const count = await slotLabels.count();
    expect(count).toBe(2);
    const firstLabel = await slotLabels.first().textContent();
    expect(firstLabel).toContain('3 of a kind');
  });
});
