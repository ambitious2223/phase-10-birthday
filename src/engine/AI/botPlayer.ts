import type { Card, GameState, GameAction, Meld } from '../types';
import { PHASES } from '../constants';
import { satisfiesPhase, canExtendMeld, trySplitForPhase } from '../Meld';
import { calculateCardPenalty } from '../Scoring';

function cardUsefulness(card: Card, hand: Card[], phase: number): number {
  if (card.type === 'wild') return 20;
  if (card.type === 'skip') return 15;

  const phaseReq = PHASES[phase - 1];
  if (!phaseReq) return 0;

  let score = 0;
  const sameValue = hand.filter(c => c.type === 'number' && c.value === card.value);
  const sameColor = hand.filter(c => c.type === 'number' && c.color === card.color);

  score += sameValue.length * 3;
  score += sameColor.length * 2;

  for (const req of phaseReq.requirements) {
    if (req.type === 'set' && sameValue.length >= req.count - 1) {
      score += 10;
    }
    if (req.type === 'run') {
      const values = sameColor.map(c => c.value).sort((a, b) => a - b);
      if (values.includes(card.value - 1) || values.includes(card.value + 1)) {
        score += 8;
      }
    }
    if (req.type === 'color' && card.color === req.color) {
      score += sameColor.length * 2;
    }
  }

  return score;
}

function chooseBestDiscard(hand: Card[], phase: number): Card {
  if (hand.length === 0) throw new Error('Cannot discard from empty hand');

  const scored = hand.map(card => ({
    card,
    value: cardUsefulness(card, hand, phase),
    penalty: calculateCardPenalty(card),
  }));

  scored.sort((a, b) => {
    if (a.value !== b.value) return a.value - b.value;
    return b.penalty - a.penalty;
  });

  return scored[0].card;
}

function botTryMeld(playerId: string, hand: Card[], phase: number): Meld[] | null {
  const phaseReq = PHASES[phase - 1];
  if (!phaseReq) return null;

  const numberCards = hand.filter(c => c.type === 'number');
  const wilds = hand.filter(c => c.type === 'wild');

  const byValue = new Map<number, Card[]>();
  for (const card of numberCards) {
    const existing = byValue.get(card.value) ?? [];
    existing.push(card);
    byValue.set(card.value, existing);
  }

  for (const [, cards] of byValue) {
    for (let size = Math.min(cards.length + wilds.length, 9); size >= 2; size--) {
      const meldCards = [...cards.slice(0, size)];
      const needed = size - meldCards.length;
      for (let w = 0; w < needed && w < wilds.length; w++) {
        meldCards.push(wilds[w]);
      }
      const result = trySplitForPhase(meldCards, phaseReq.requirements, playerId);
      if (result) return result;
    }
  }

  const byColor = new Map<string, Card[]>();
  for (const card of numberCards) {
    const existing = byColor.get(card.color) ?? [];
    existing.push(card);
    byColor.set(card.color, existing);
  }

  for (const [, cards] of byColor) {
    const sorted = [...cards].sort((a, b) => a.value - b.value);
    for (let start = 0; start < sorted.length; start++) {
      for (let end = start + 2; end < sorted.length; end++) {
        const runCards = sorted.slice(start, end + 1);
        const allCards = [...runCards, ...wilds];
        for (let size = runCards.length; size <= allCards.length && size <= 12; size++) {
          const testCards = allCards.slice(0, size);
          const result = trySplitForPhase(testCards, phaseReq.requirements, playerId);
          if (result) return result;
        }
      }
    }
  }

  return null;
}

export function decideBotAction(state: GameState, playerId: string): GameAction | null {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return null;

  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.id !== playerId) return null;

  if (state.turnPhase === 'draw') {
    const topDiscard = state.discardPile[state.discardPile.length - 1];
    if (topDiscard && topDiscard.type !== 'skip') {
      const isUseful = cardUsefulness(topDiscard, player.hand, player.currentPhase) > 5;
      if (isUseful) {
        return { type: 'DRAW_FROM_DISCARD', playerId };
      }
    }
    return { type: 'DRAW_CARD', playerId };
  }

  if (state.turnPhase === 'meld') {
    if (!player.completedPhaseThisRound) {
      const result = botTryMeld(playerId, player.hand, player.currentPhase);
      if (result) {
        return { type: 'MELD', playerId, melds: result };
      }
    }

    const discardCard = chooseBestDiscard(player.hand, player.currentPhase);
    return { type: 'DISCARD', playerId, card: discardCard };
  }

  if (state.turnPhase === 'hit') {
    if (player.completedPhaseThisRound) {
      const skipCard = player.hand.find(c => c.type === 'skip');
      const opponents = state.players.filter(p => p.id !== playerId && !p.skippedThisRound);
      const highThreat = opponents.find(p => p.currentPhase >= 7);

      if (skipCard && highThreat) {
        return {
          type: 'USE_SKIP',
          playerId,
          targetId: highThreat.id,
          cards: [skipCard],
        };
      }

      for (const card of player.hand) {
        if (card.type === 'skip') continue;

        for (const p of state.players) {
          for (const meld of p.melds) {
            if (canExtendMeld(meld, card)) {
              return { type: 'HIT', playerId, meldId: meld.id, cards: [card] };
            }
          }
        }
      }
    }

    const discardCard = chooseBestDiscard(player.hand, player.currentPhase);
    return { type: 'DISCARD', playerId, card: discardCard };
  }

  return null;
}
