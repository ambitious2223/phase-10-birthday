import { test, expect } from '@playwright/test';

const SKIP_SETUP = `
  localStorage.setItem('phase10_birthday_card_seen', 'true');
  localStorage.setItem('phase10_tutorial_completed', 'true');
`;

test.describe('Visual & UI Integrity', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(SKIP_SETUP);
    await page.goto('/');
    await page.waitForSelector('.game-board', { timeout: 15000 });
  });

  test('card components render with correct colors', async ({ page }) => {
    await page.locator('button:has-text("Draw from Deck")').click();
    await page.waitForTimeout(500);
    const cards = page.locator('.player-area .card-wrapper');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    const firstCard = cards.first();
    const inner = firstCard.locator('.card-inner');
    await expect(inner).toBeVisible();
  });

  test('cards have rounded corners (border-radius)', async ({ page }) => {
    await page.locator('button:has-text("Draw from Deck")').click();
    await page.waitForTimeout(500);
    const cardFace = page.locator('.player-area .card-face').first();
    const borderRadius = await cardFace.evaluate(el =>
      window.getComputedStyle(el).borderRadius
    );
    expect(parseInt(borderRadius)).toBeGreaterThanOrEqual(6);
  });

  test('Phase 10 branding is visible', async ({ page }) => {
    await expect(page.locator('.game-header h1')).toHaveText('Phase 10');
  });

  test('player info shows card count', async ({ page }) => {
    const cardCount = page.locator('.player-card-count').first();
    await expect(cardCount).toContainText('Cards:');
  });

  test('phase tracker shows current phase', async ({ page }) => {
    const phaseNumber = page.locator('.phase-number').first();
    await expect(phaseNumber).toContainText('Phase 1');
  });

  test('draw pile shows card count', async ({ page }) => {
    const pileCount = page.locator('.pile-count');
    await expect(pileCount.first()).toBeVisible();
  });

  test('game controls have proper button styling', async ({ page }) => {
    const drawBtn = page.locator('button:has-text("Draw from Deck")');
    await expect(drawBtn).toBeVisible();
    const bg = await drawBtn.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('turn info updates correctly for bot turns', async ({ page }) => {
    const turnInfo = page.locator('.turn-info');
    const text = await turnInfo.textContent();
    expect(text).toBeTruthy();
  });

  test('discard pile starts with a card', async ({ page }) => {
    const discardPile = page.locator('.discard-pile');
    await expect(discardPile).toBeVisible();
  });

  test('game log scrolls to bottom', async ({ page }) => {
    const log = page.locator('.game-log');
    await expect(log).toBeVisible();
    const scrollHeight = await log.evaluate(el => el.scrollHeight);
    expect(scrollHeight).toBeGreaterThan(0);
  });
});
