import { describe, it, expect } from 'vitest';
import { calculateCardPenalty, calculateHandPenalty } from '../Scoring';
import type { Card } from '../types';

function numCard(value: number): Card {
  return { id: `n${value}`, type: 'number', color: 'red', value };
}

function wildCard(): Card {
  return { id: 'w', type: 'wild', color: 'wild', value: 0 };
}

function skipCard(): Card {
  return { id: 's', type: 'skip', color: 'red', value: 0 };
}

describe('calculateCardPenalty', () => {
  it('charges 5pts for cards 1-9', () => {
    expect(calculateCardPenalty(numCard(1))).toBe(5);
    expect(calculateCardPenalty(numCard(5))).toBe(5);
    expect(calculateCardPenalty(numCard(9))).toBe(5);
  });

  it('charges 10pts for cards 10-12', () => {
    expect(calculateCardPenalty(numCard(10))).toBe(10);
    expect(calculateCardPenalty(numCard(11))).toBe(10);
    expect(calculateCardPenalty(numCard(12))).toBe(10);
  });

  it('charges 15pts for skip cards', () => {
    expect(calculateCardPenalty(skipCard())).toBe(15);
  });

  it('charges 25pts for wild cards', () => {
    expect(calculateCardPenalty(wildCard())).toBe(25);
  });
});

describe('calculateHandPenalty', () => {
  it('calculates total hand penalty', () => {
    const hand = [numCard(3), numCard(7), numCard(10), wildCard(), skipCard()];
    expect(calculateHandPenalty(hand)).toBe(5 + 5 + 10 + 25 + 15);
  });

  it('returns 0 for empty hand', () => {
    expect(calculateHandPenalty([])).toBe(0);
  });
});
