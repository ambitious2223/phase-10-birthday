import type { Card, CardColor, Meld, PhaseRequirement } from './types';

export function isValidSet(cards: Card[], count: number): boolean {
  if (cards.length !== count) return false;
  if (count < 2) return false;

  const nonWilds = cards.filter(c => c.type === 'number');
  const wilds = cards.filter(c => c.type === 'wild');

  if (nonWilds.length === 0) return false;

  const values = new Set(nonWilds.map(c => c.value));
  if (values.size !== 1) return false;

  const colors = new Set(nonWilds.map(c => c.color));
  if (colors.size !== nonWilds.length) return false;

  const needed = count - nonWilds.length;
  return wilds.length >= needed;
}

export function isValidRun(cards: Card[], count: number): boolean {
  if (cards.length !== count) return false;
  if (count < 3) return false;

  const nonWilds = cards.filter(c => c.type === 'number');
  const wilds = cards.filter(c => c.type === 'wild');

  if (nonWilds.length === 0) return false;

  const sorted = [...nonWilds].sort((a, b) => a.value - b.value);
  const values = sorted.map(c => c.value);
  if (new Set(values).size !== values.length) return false;

  const minVal = values[0];
  const maxVal = values[values.length - 1];
  const span = maxVal - minVal + 1;

  if (span > count) return false;

  const gaps = span - nonWilds.length;
  if (gaps > wilds.length) return false;

  const totalNeeded = count - nonWilds.length;
  return totalNeeded <= wilds.length;
}

export function isValidColorMeld(cards: Card[], count: number): boolean {
  if (cards.length !== count) return false;
  if (count < 2) return false;

  const nonWilds = cards.filter(c => c.type === 'number');
  const wilds = cards.filter(c => c.type === 'wild');

  if (nonWilds.length === 0) return false;

  const colors = new Set(nonWilds.map(c => c.color));
  if (colors.size !== 1) return false;

  const needed = count - nonWilds.length;
  return wilds.length >= needed;
}

export function satisfiesRequirement(meld: Meld, req: PhaseRequirement): boolean {
  if (req.type === 'set') {
    return isValidSet(meld.cards, req.count);
  } else if (req.type === 'run') {
    return isValidRun(meld.cards, req.count);
  } else if (req.type === 'color') {
    return isValidColorMeld(meld.cards, req.count);
  }
  return false;
}

export function satisfiesPhase(melds: Meld[], requirements: PhaseRequirement[]): boolean {
  if (melds.length !== requirements.length) return false;

  const used = new Set<number>();

  function assignMelds(reqIdx: number): boolean {
    if (reqIdx === requirements.length) return true;
    const req = requirements[reqIdx];

    for (let i = 0; i < melds.length; i++) {
      if (used.has(i)) continue;
      if (satisfiesRequirement(melds[i], req)) {
        used.add(i);
        if (assignMelds(reqIdx + 1)) return true;
        used.delete(i);
      }
    }
    return false;
  }

  return assignMelds(0);
}

export function canExtendMeld(meld: Meld, card: Card): boolean {
  if (card.type === 'wild') return true;
  if (card.type === 'skip') return false;

  if (meld.type === 'set') {
    const setValue = meld.cards.find(c => c.type === 'number')?.value;
    if (setValue === undefined) return true;
    if (card.value !== setValue) return false;
    return !meld.cards.some(c => c.type === 'number' && c.color === card.color);
  }

  if (meld.type === 'run') {
    const values = meld.cards.filter(c => c.type === 'number').map(c => c.value);
    if (values.includes(card.value)) return false;
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    return card.value === minVal - 1 || card.value === maxVal + 1;
  }

  if (meld.type === 'color') {
    if (card.color !== meld.color) return false;
    return !meld.cards.some(c => c.type === 'number' && c.value === card.value);
  }

  return false;
}

/**
 * Given a pool of selected cards, try all ways to split them into groups
 * that match the phase requirements. Returns the first valid assignment, or null.
 */
export function trySplitForPhase(
  selectedCards: Card[],
  requirements: PhaseRequirement[],
  ownerId: string,
): Meld[] | null {
  if (requirements.length === 1) {
    const req = requirements[0];
    const meldType = req.type === 'color' ? 'color' : req.type;
    const meld: Meld = {
      id: 'pending',
      type: meldType,
      cards: selectedCards,
      ownerId,
    };
    if (req.type === 'color') {
      meld.color = selectedCards.find(c => c.type === 'number')?.color as CardColor;
    }
    if (satisfiesRequirement(meld, req)) {
      return [meld];
    }
    return null;
  }

  if (requirements.length === 2) {
    const reqA = requirements[0];
    const reqB = requirements[1];

    for (let split = 1; split < selectedCards.length; split++) {
      for (const combo of combinations(selectedCards, split)) {
        const groupA = combo;
        const groupB = selectedCards.filter(c => !groupA.includes(c));

        if (groupA.length !== reqA.count || groupB.length !== reqB.count) continue;

        const meldA = makeMeld(groupA, reqA, ownerId);
        const meldB = makeMeld(groupB, reqB, ownerId);

        if (meldA && meldB && satisfiesRequirement(meldA, reqA) && satisfiesRequirement(meldB, reqB)) {
          return [meldA, meldB];
        }

        const meldA2 = makeMeld(groupA, reqB, ownerId);
        const meldB2 = makeMeld(groupB, reqA, ownerId);

        if (meldA2 && meldB2 && satisfiesRequirement(meldA2, reqB) && satisfiesRequirement(meldB2, reqA)) {
          return [meldA2, meldB2];
        }
      }
    }
  }

  return null;
}

function* combinations<T>(arr: T[], size: number): Generator<T[]> {
  if (size === 0) { yield []; return; }
  if (size > arr.length) return;
  for (let i = 0; i <= arr.length - size; i++) {
    for (const rest of combinations(arr.slice(i + 1), size - 1)) {
      yield [arr[i], ...rest];
    }
  }
}

function makeMeld(cards: Card[], req: PhaseRequirement, ownerId: string): Meld | null {
  const meldType = req.type === 'color' ? 'color' : req.type;
  const meld: Meld = {
    id: 'pending',
    type: meldType,
    cards,
    ownerId,
  };
  if (req.type === 'color') {
    meld.color = cards.find(c => c.type === 'number')?.color as CardColor;
  }
  return meld;
}

export function findAllValidMeldsFromHand(hand: Card[]): Meld[] {
  const melds: Meld[] = [];
  const numberCards = hand.filter(c => c.type === 'number');
  const wilds = hand.filter(c => c.type === 'wild');

  const byValue = new Map<number, Card[]>();
  for (const card of numberCards) {
    const existing = byValue.get(card.value) ?? [];
    existing.push(card);
    byValue.set(card.value, existing);
  }

  for (const [, cards] of byValue) {
    if (cards.length >= 2) {
      for (let size = Math.min(cards.length + wilds.length, 7); size >= 2; size--) {
        const meldCards = [...cards.slice(0, size)];
        const remainingWilds = size - meldCards.length;
        for (let w = 0; w < remainingWilds && w < wilds.length; w++) {
          meldCards.push(wilds[w]);
        }
        if (isValidSet(meldCards, size)) {
          melds.push({
            id: `meld-set-${cards[0].value}-${size}`,
            type: 'set',
            cards: meldCards,
            ownerId: '',
          });
        }
      }
    }
  }

  const sorted = [...numberCards].sort((a, b) => a.value - b.value);
  for (let start = 0; start < sorted.length; start++) {
    for (let end = start + 2; end < sorted.length; end++) {
      const runCards = sorted.slice(start, end + 1);
      for (let size = runCards.length; size <= runCards.length + wilds.length && size <= 12; size++) {
        const testCards = [...runCards];
        const needed = size - testCards.length;
        for (let w = 0; w < needed && w < wilds.length; w++) {
          testCards.push(wilds[w]);
        }
        if (isValidRun(testCards, size)) {
          melds.push({
            id: `meld-run-${size}-${start}`,
            type: 'run',
            cards: testCards,
            ownerId: '',
          });
        }
      }
    }
  }

  return melds;
}
