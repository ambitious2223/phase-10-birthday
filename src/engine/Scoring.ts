import type { Card, Player } from './types';
import { SCORING } from './constants';

export function calculateCardPenalty(card: Card): number {
  if (card.type === 'wild') return SCORING.wildCard;
  if (card.type === 'skip') return SCORING.skipCard;
  return SCORING.numberCardLow(card.value);
}

export function calculateHandPenalty(hand: Card[]): number {
  return hand.reduce((total, card) => total + calculateCardPenalty(card), 0);
}

export function updateScores(players: Player[]): Player[] {
  return players.map(player => ({
    ...player,
    score: player.score + calculateHandPenalty(player.hand),
  }));
}

export function getGameWinner(players: Player[]): Player | null {
  const phaseWinner = players.find(p => p.currentPhase > 10);
  if (phaseWinner) return phaseWinner;

  return players.reduce((lowest, p) =>
    p.score < lowest.score ? p : lowest
  );
}
