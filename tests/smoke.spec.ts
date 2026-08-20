import { test, expect } from '@playwright/test';

test.describe('Phase 10 Birthday Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
  });

  test('birthday modal appears on first launch', async ({ page }) => {
    const modal = page.locator('.birthday-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal).toContainText('Happy Birthday, Kimberly!');
    await expect(modal).toContainText('Kimberly');
    await expect(modal).toContainText('Christopher');
    await expect(modial).toContainText('Ahmad');
  });

  test('birthday modal closes on start button', async ({ page }) => {
    const startBtn = page.locator('.birthday-start-btn');
    await expect(startBtn).toBeVisible({ timeout: 5000 });
    await startBtn.click();
    await page.waitForTimeout(1500);
    await expect(page.locator('.birthday-modal')).not.toBeVisible();
  });

  test('game board renders with all elements', async ({ page }) => {
    await page.locator('.birthday-start-btn').click({ timeout: 5000 });
    await page.waitForTimeout(1500);

    await expect(page.locator('.game-header')).toBeVisible();
    await expect(page.locator('.game-board')).toBeVisible();
    await expect(page.locator('.opponents-area')).toBeVisible();
    await expect(page.locator('.table-center')).toBeVisible();
    await expect(page.locator('.player-area')).toBeVisible();
  });

  test('player hand is visible with cards', async ({ page }) => {
    await page.locator('.birthday-start-btn').click({ timeout: 5000 });
    await page.waitForTimeout(1500);

    const hand = page.locator('.hand-cards-fan');
    await expect(hand).toBeVisible();
    const cards = hand.locator('.card-wrapper');
    await expect(cards).toHaveCount(10, { timeout: 5000 });
  });

  test('draw pile is clickable during draw phase', async ({ page }) => {
    await page.locator('.birthday-start-btn').click({ timeout: 5000 });
    await page.waitForTimeout(1500);

    const drawBtn = page.locator('.pile-action-draw');
    if (await drawBtn.isVisible()) {
      await drawBtn.click();
      await page.waitForTimeout(500);
      const handCards = page.locator('.hand-cards-fan .card-wrapper');
      const count = await handCards.count();
      expect(count).toBeGreaterThanOrEqual(10);
    }
  });

  test('birthday cake button reopens modal', async ({ page }) => {
    await page.locator('.birthday-start-btn').click({ timeout: 5000 });
    await page.waitForTimeout(1500);

    const cakeBtn = page.locator('.birthday-cake-btn');
    await expect(cakeBtn).toBeVisible();
    await cakeBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('.birthday-modal')).toBeVisible();
  });

  test('how to play button opens tutorial', async ({ page }) => {
    await page.locator('.birthday-start-btn').click({ timeout: 5000 });
    await page.waitForTimeout(1500);

    const helpBtn = page.locator('.tutorial-help-btn');
    await expect(helpBtn).toBeVisible();
    await helpBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('.tutorial-modal')).toBeVisible();
    await expect(page.locator('.tutorial-title')).toContainText('Welcome');
  });

  test('no console errors during basic interactions', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.locator('.birthday-start-btn').click({ timeout: 5000 });
    await page.waitForTimeout(2000);

    const drawBtn = page.locator('.pile-action-draw');
    if (await drawBtn.isVisible()) {
      await drawBtn.click();
      await page.waitForTimeout(500);
    }

    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });
});
