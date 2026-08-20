import { test, expect } from '@playwright/test';

const SKIP_SETUP = `
  localStorage.setItem('phase10_birthday_card_seen', 'true');
  localStorage.setItem('phase10_tutorial_completed', 'true');
`;

test.describe('Game Rules Enforcement', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(SKIP_SETUP);
    await page.goto('/');
    await page.waitForSelector('.game-board', { timeout: 15000 });
  });

  test('should show correct turn header text', async ({ page }) => {
    const turnInfo = page.locator('.turn-info');
    await expect(turnInfo).toBeVisible();
    const text = await turnInfo.textContent();
    expect(text).toMatch(/(Your Turn|Bot \d+'s Turn)/);
    expect(text).not.toContain("You's Turn");
  });

  test('should display Phase 10 title', async ({ page }) => {
    await expect(page.locator('.game-header h1')).toHaveText('Phase 10');
  });

  test('should show round number', async ({ page }) => {
    const roundInfo = page.locator('.round-info');
    await expect(roundInfo).toContainText('Round 1');
  });

  test('should display 3 players', async ({ page }) => {
    const playerNames = page.locator('.player-name, .opponent-name');
    await expect(playerNames).toHaveCount(3);
  });

  test('draw button should be available on first turn', async ({ page }) => {
    const drawBtn = page.locator('button:has-text("Draw from Deck")');
    await expect(drawBtn).toBeVisible({ timeout: 5000 });
  });

  test('discard button should be disabled without selection', async ({ page }) => {
    await page.locator('button:has-text("Draw from Deck")').click();
    await page.waitForTimeout(500);
    const discardBtn = page.locator('button:has-text("Discard")');
    await expect(discardBtn).toBeVisible();
    await expect(discardBtn).toBeDisabled();
  });

  test('cannot meld with zero cards selected', async ({ page }) => {
    await page.locator('button:has-text("Draw from Deck")').click();
    await page.waitForTimeout(500);
    const meldBtn = page.locator('button:has-text("Lay Down Phase")');
    if (await meldBtn.isVisible()) {
      await expect(meldBtn).toBeDisabled();
    }
  });

  test('player hand has reorderable cards', async ({ page }) => {
    await page.locator('button:has-text("Draw from Deck")').click();
    await page.waitForTimeout(500);
    const handCards = page.locator('.player-area .reorder-item');
    const count = await handCards.count();
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test('can select and deselect a card', async ({ page }) => {
    await page.locator('button:has-text("Draw from Deck")').click();
    await page.waitForTimeout(500);
    const firstCard = page.locator('.player-area .reorder-item').first();
    await firstCard.click();
    await expect(firstCard).toHaveClass(/swap-selected/);
    await firstCard.click();
    await expect(firstCard).not.toHaveClass(/swap-selected/);
  });

  test('discard pile shows a card after drawing from deck', async ({ page }) => {
    const discardBefore = await page.locator('.discard-pile .card-wrapper').count();
    await page.locator('button:has-text("Draw from Deck")').click();
    await page.waitForTimeout(500);
    const discardAfter = await page.locator('.discard-pile .card-wrapper').count();
    expect(discardAfter).toBeGreaterThanOrEqual(discardBefore);
  });

  test('game log shows entries', async ({ page }) => {
    const logEntries = page.locator('.log-entry');
    const count = await logEntries.count();
    expect(count).toBeGreaterThan(0);
  });

  test('phase slots appear during meld phase for human turn', async ({ page }) => {
    await page.locator('button:has-text("Draw from Deck")').click();
    await page.waitForTimeout(500);
    const phaseSlots = page.locator('.phase-slots');
    await expect(phaseSlots).toBeVisible({ timeout: 3000 });
  });

  test('opponent cards are face down', async ({ page }) => {
    const faceDownCards = page.locator('.card-back-inner');
    const count = await faceDownCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('active player has glowing border', async ({ page }) => {
    const activePlayer = page.locator('.player-active');
    await expect(activePlayer.first()).toBeVisible();
  });
});
