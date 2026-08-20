import { describe, it, expect } from 'vitest';
import { isValidSet, isValidRun, isValidColorMeld, satisfiesPhase, canExtendMeld, trySplitForPhase } from '../Meld';
import type { Card, Meld, PhaseRequirement } from '../types';

function numCard(id: string, value: number, color: Card['color']): Card {
  return { id, type: 'number', color, value };
}

function wildCard(id: string): Card {
  return { id, type: 'wild', color: 'wild', value: 0 };
}

function skipCard(id: string): Card {
  return { id, type: 'skip', color: 'red', value: 0 };
}

describe('isValidSet', () => {
  it('validates 3 of a kind', () => {
    expect(isValidSet([numCard('a', 5, 'red'), numCard('b', 5, 'blue'), numCard('c', 5, 'green')], 3)).toBe(true);
  });

  it('rejects different values', () => {
    expect(isValidSet([numCard('a', 5, 'red'), numCard('b', 6, 'blue'), numCard('c', 5, 'green')], 3)).toBe(false);
  });

  it('rejects duplicate colors', () => {
    expect(isValidSet([numCard('a', 5, 'red'), numCard('b', 5, 'red'), numCard('c', 5, 'green')], 3)).toBe(false);
  });

  it('allows wilds to fill gaps', () => {
    expect(isValidSet([numCard('a', 5, 'red'), numCard('b', 5, 'blue'), wildCard('w')], 3)).toBe(true);
  });

  it('rejects all-wild melds (natural card required)', () => {
    expect(isValidSet([wildCard('w1'), wildCard('w2'), wildCard('w3')], 3)).toBe(false);
  });

  it('rejects wrong count', () => {
    expect(isValidSet([numCard('a', 5, 'red'), numCard('b', 5, 'blue')], 3)).toBe(false);
  });
});

describe('isValidRun', () => {
  it('validates consecutive numbers any color', () => {
    expect(isValidRun([numCard('a', 3, 'red'), numCard('b', 4, 'blue'), numCard('c', 5, 'green')], 3)).toBe(true);
  });

  it('rejects non-consecutive', () => {
    expect(isValidRun([numCard('a', 3, 'red'), numCard('b', 5, 'blue'), numCard('c', 7, 'green')], 3)).toBe(false);
  });

  it('allows mixed colors in run', () => {
    expect(isValidRun([numCard('a', 1, 'red'), numCard('b', 2, 'blue'), numCard('c', 3, 'green'), numCard('d', 4, 'yellow')], 4)).toBe(true);
  });

  it('allows wilds in run', () => {
    expect(isValidRun([numCard('a', 3, 'red'), wildCard('w'), numCard('c', 5, 'green')], 3)).toBe(true);
  });

  it('rejects all-wild runs (natural required)', () => {
    expect(isValidRun([wildCard('w1'), wildCard('w2'), wildCard('w3')], 3)).toBe(false);
  });

  it('rejects duplicate values', () => {
    expect(isValidRun([numCard('a', 3, 'red'), numCard('b', 3, 'blue'), numCard('c', 4, 'green')], 3)).toBe(false);
  });
});

describe('isValidColorMeld', () => {
  it('validates 7 same-color cards', () => {
    const cards = Array.from({ length: 7 }, (_, i) => numCard(`c${i}`, i + 1, 'red'));
    expect(isValidColorMeld(cards, 7)).toBe(true);
  });

  it('rejects mixed colors', () => {
    const cards = [numCard('a', 1, 'red'), numCard('b', 2, 'blue'), numCard('c', 3, 'red'), numCard('d', 4, 'red'), numCard('e', 5, 'red'), numCard('f', 6, 'red'), numCard('g', 7, 'red')];
    expect(isValidColorMeld(cards, 7)).toBe(false);
  });

  it('allows wilds to fill', () => {
    const cards = [numCard('a', 1, 'red'), numCard('b', 2, 'red'), numCard('c', 3, 'red'), numCard('d', 4, 'red'), wildCard('w1'), wildCard('w2'), wildCard('w3')];
    expect(isValidColorMeld(cards, 7)).toBe(true);
  });
});

describe('satisfiesPhase', () => {
  it('Phase 1: 2 sets of 3', () => {
    const melds: Meld[] = [
      { id: 'm1', type: 'set', cards: [numCard('a', 5, 'red'), numCard('b', 5, 'blue'), numCard('c', 5, 'green')], ownerId: 'p1' },
      { id: 'm2', type: 'set', cards: [numCard('d', 8, 'red'), numCard('e', 8, 'blue'), numCard('f', 8, 'yellow')], ownerId: 'p1' },
    ];
    const reqs: PhaseRequirement[] = [{ type: 'set', count: 3 }, { type: 'set', count: 3 }];
    expect(satisfiesPhase(melds, reqs)).toBe(true);
  });

  it('Phase 4: 1 run of 7', () => {
    const melds: Meld[] = [
      { id: 'm1', type: 'run', cards: [numCard('a', 1, 'red'), numCard('b', 2, 'blue'), numCard('c', 3, 'green'), numCard('d', 4, 'yellow'), numCard('e', 5, 'red'), numCard('f', 6, 'blue'), numCard('g', 7, 'green')], ownerId: 'p1' },
    ];
    const reqs: PhaseRequirement[] = [{ type: 'run', count: 7 }];
    expect(satisfiesPhase(melds, reqs)).toBe(true);
  });

  it('Phase 8: 7 cards of 1 color', () => {
    const melds: Meld[] = [
      { id: 'm1', type: 'color', cards: Array.from({ length: 7 }, (_, i) => numCard(`c${i}`, i + 1, 'blue')), ownerId: 'p1' },
    ];
    const reqs: PhaseRequirement[] = [{ type: 'color', count: 7 }];
    expect(satisfiesPhase(melds, reqs)).toBe(true);
  });
});

describe('canExtendMeld', () => {
  it('extends set with matching value', () => {
    const meld: Meld = { id: 'm1', type: 'set', cards: [numCard('a', 5, 'red'), numCard('b', 5, 'blue')], ownerId: 'p1' };
    expect(canExtendMeld(meld, numCard('c', 5, 'green'))).toBe(true);
  });

  it('rejects wrong value for set', () => {
    const meld: Meld = { id: 'm1', type: 'set', cards: [numCard('a', 5, 'red'), numCard('b', 5, 'blue')], ownerId: 'p1' };
    expect(canExtendMeld(meld, numCard('c', 6, 'green'))).toBe(false);
  });

  it('extends run with adjacent value', () => {
    const meld: Meld = { id: 'm1', type: 'run', cards: [numCard('a', 3, 'red'), numCard('b', 4, 'blue'), numCard('c', 5, 'green')], ownerId: 'p1' };
    expect(canExtendMeld(meld, numCard('d', 6, 'yellow'))).toBe(true);
    expect(canExtendMeld(meld, numCard('d', 2, 'yellow'))).toBe(true);
  });

  it('rejects non-adjacent for run', () => {
    const meld: Meld = { id: 'm1', type: 'run', cards: [numCard('a', 3, 'red'), numCard('b', 4, 'blue'), numCard('c', 5, 'green')], ownerId: 'p1' };
    expect(canExtendMeld(meld, numCard('d', 7, 'yellow'))).toBe(false);
  });

  it('allows wild to extend anything', () => {
    const meld: Meld = { id: 'm1', type: 'set', cards: [numCard('a', 5, 'red')], ownerId: 'p1' };
    expect(canExtendMeld(meld, wildCard('w'))).toBe(true);
  });

  it('rejects skip cards', () => {
    const meld: Meld = { id: 'm1', type: 'set', cards: [numCard('a', 5, 'red')], ownerId: 'p1' };
    expect(canExtendMeld(meld, skipCard('s'))).toBe(false);
  });
});

describe('trySplitForPhase', () => {
  it('splits cards for Phase 1 (2 sets of 3)', () => {
    const cards = [
      numCard('a', 5, 'red'), numCard('b', 5, 'blue'), numCard('c', 5, 'green'),
      numCard('d', 8, 'red'), numCard('e', 8, 'blue'), numCard('f', 8, 'yellow'),
    ];
    const reqs: PhaseRequirement[] = [{ type: 'set', count: 3 }, { type: 'set', count: 3 }];
    const result = trySplitForPhase(cards, reqs, 'p1');
    expect(result).not.toBeNull();
    expect(result!.length).toBe(2);
  });

  it('returns null for impossible split', () => {
    const cards = [numCard('a', 1, 'red'), numCard('b', 2, 'blue'), numCard('c', 3, 'green')];
    const reqs: PhaseRequirement[] = [{ type: 'set', count: 3 }, { type: 'set', count: 3 }];
    const result = trySplitForPhase(cards, reqs, 'p1');
    expect(result).toBeNull();
  });
});
