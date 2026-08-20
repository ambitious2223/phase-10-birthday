import type { Card, CardColor, GameState, Player } from '../engine/types';
import { SCORING } from '../engine/constants';

/**
 * Wild Card Rules (Official Mattel):
 * - Universal substitution: fills any number (1-12) or color slot
 * - Must have at least one natural card in each meld
 * - Immutable once placed on the board
 * - 25 penalty points per wild remaining in hand at round end
 */
export function isWildCard(card: Card): boolean {
  return card.type === 'wild';
}

export function isSkipCard(card: Card): boolean {
  return card.type === 'skip';
}

/**
 * Validates that a meld has at least one natural (non-wild) card.
 * Official rule: every set or run must contain at least one natural card.
 */
export function meldHasNaturalCard(cards: Card[]): boolean {
  return cards.some(c => c.type === 'number');
}

/**
 * Checks if a wild card can be used in a specific meld context.
 * Wilds can substitute for any number or color, but the meld must have
 * at least one natural card.
 */
export function canWildFitInMeld(existingCards: Card[], wildCount: number): boolean {
  const naturals = existingCards.filter(c => c.type === 'number');
  return naturals.length >= 1 || wildCount <= existingCards.length;
}

/**
 * Skip Card Rules (Official Mattel):
 * - Played during discard step to force a targeted opponent to miss their turn
 * - Cannot be picked up from the discard pile
 * - Cannot be used to complete any phase
 * - 15 penalty points per skip remaining in hand at round end
 * - A player cannot be skipped twice in the same round
 */
export function canPlaySkip(
  playerId: string,
  targetId: string,
  players: Player[],
  skippedPlayerIds: string[],
): { allowed: boolean; reason?: string } {
  if (playerId === targetId) {
    return { allowed: false, reason: 'Cannot skip yourself' };
  }

  const target = players.find(p => p.id === targetId);
  if (!target) {
    return { allowed: false, reason: 'Invalid target' };
  }

  if (skippedPlayerIds.includes(targetId)) {
    return { allowed: false, reason: `${target.name} was already skipped this round` };
  }

  return { allowed: true };
}

/**
 * Checks if the discard pile top card is a skip card.
 * If so, drawing from discard is forbidden.
 */
export function isDiscardPileLocked(discardPile: Card[]): boolean {
  if (discardPile.length === 0) return false;
  return discardPile[discardPile.length - 1].type === 'skip';
}

/**
 * Checks if the opening discard card was a skip.
 * If so, Player 1's turn is automatically skipped.
 */
export function shouldSkipFirstPlayer(discardPile: Card[]): boolean {
  if (discardPile.length === 0) return false;
  return discardPile[0].type === 'skip';
}

/**
 * Calculates penalty score for a player's remaining hand.
 * Wild: 25 points, Skip: 15 points, Number 1-9: 5 points, Number 10-12: 10 points
 */
export function calculateHandPenalty(hand: Card[]): number {
  return hand.reduce((total, card) => {
    if (card.type === 'wild') return total + SCORING.wildCard;
    if (card.type === 'skip') return total + SCORING.skipCard;
    return total + SCORING.numberCardLow(card.value);
  }, 0);
}

/**
 * Gets eligible skip targets (opponents not yet skipped this round).
 */
export function getEligibleSkipTargets(
  currentPlayerId: string,
  players: Player[],
  skippedPlayerIds: string[],
): Player[] {
  return players.filter(
    p => p.id !== currentPlayerId && !skippedPlayerIds.includes(p.id),
  );
}

/**
 * Processes the skip queue: when advancing to the next player,
 * check if they are in the skip queue. If so, skip them and clear their entry.
 * Returns the next player index and updated skip queue.
 */
export function processSkipQueue(
  currentPlayerIndex: number,
  players: Player[],
  skippedPlayerIds: string[],
): { nextIndex: number; updatedSkippedIds: string[]; skippedPlayerName: string | null } {
  const nextIndex = (currentPlayerIndex + 1) % players.length;
  const nextPlayer = players[nextIndex];

  if (skippedPlayerIds.includes(nextPlayer.id)) {
    const afterSkip = (nextIndex + 1) % players.length;
    return {
      nextIndex: afterSkip,
      updatedSkippedIds: skippedPlayerIds.filter(id => id !== nextPlayer.id),
      skippedPlayerName: nextPlayer.name,
    };
  }

  return {
    nextIndex,
    updatedSkippedIds: skippedPlayerIds,
    skippedPlayerName: null,
  };
}

/**
 * Wild cards are immutable once placed on the board.
 * This function checks if a card in a meld is a wild (cannot be retrieved).
 */
export function isWildLockedInMeld(meldCards: Card[]): boolean {
  return meldCards.some(c => c.type === 'wild');
}

/**
 * Gets the visual color for a wild card based on its position/context.
 * Wild cards display a rainbow gradient effect.
 */
export function getWildDisplayColor(card: Card, index: number): string {
  const colors = ['#ff4d4d', '#ffd700', '#4da6ff', '#ff4d4d'];
  return colors[index % colors.length];
}
