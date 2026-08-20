import type { Card, CardColor } from './types';
import { CARD_COLORS, DECK_SPEC } from './constants';

let cardIdCounter = 0;

function createCardId(color: string, value: number, copy: number): string {
  return `${color}-${value}-${copy}-${cardIdCounter++}`;
}

export function createDeck(): Card[] {
  cardIdCounter = 0;
  const deck: Card[] = [];

  for (const color of CARD_COLORS) {
    for (let value = 1; value <= DECK_SPEC.numbersPerColor; value++) {
      for (let copy = 0; copy < DECK_SPEC.copiesPerNumber; copy++) {
        deck.push({
          id: createCardId(color, value, copy),
          type: 'number',
          color,
          value,
        });
      }
    }
  }

  for (let i = 0; i < DECK_SPEC.wildCount; i++) {
    deck.push({
      id: createCardId('wild', 0, i),
      type: 'wild',
      color: 'wild',
      value: 0,
    });
  }

  for (let i = 0; i < DECK_SPEC.skipCount; i++) {
    deck.push({
      id: createCardId('skip', 0, i),
      type: 'skip',
      color: CARD_COLORS[i] as CardColor,
      value: 0,
    });
  }

  return deck;
}

export function shuffle(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function drawCards(deck: Card[], count: number): { drawn: Card[]; remaining: Card[] } {
  return {
    drawn: deck.slice(0, count),
    remaining: deck.slice(count),
  };
}
