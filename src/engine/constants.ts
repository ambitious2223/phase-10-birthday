import type { CardColor, Phase } from './types';

export const CARD_COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow'];

export const DECK_SPEC = {
  numbersPerColor: 12,
  copiesPerNumber: 2,
  wildCount: 8,
  skipCount: 4,
  totalCards: 108,
};

export const PHASES: Phase[] = [
  { id: 1, name: '2 Sets of 3', requirements: [{ type: 'set', count: 3 }, { type: 'set', count: 3 }] },
  { id: 2, name: '1 Set of 3 + 1 Run of 4', requirements: [{ type: 'set', count: 3 }, { type: 'run', count: 4 }] },
  { id: 3, name: '1 Set of 4 + 1 Run of 4', requirements: [{ type: 'set', count: 4 }, { type: 'run', count: 4 }] },
  { id: 4, name: '1 Run of 7', requirements: [{ type: 'run', count: 7 }] },
  { id: 5, name: '1 Run of 8', requirements: [{ type: 'run', count: 8 }] },
  { id: 6, name: '1 Run of 9', requirements: [{ type: 'run', count: 9 }] },
  { id: 7, name: '2 Sets of 4', requirements: [{ type: 'set', count: 4 }, { type: 'set', count: 4 }] },
  { id: 8, name: '7 Cards of 1 Color', requirements: [{ type: 'color', count: 7 }] },
  { id: 9, name: '1 Set of 5 + 1 Set of 2', requirements: [{ type: 'set', count: 5 }, { type: 'set', count: 2 }] },
  { id: 10, name: '1 Set of 5 + 1 Set of 3', requirements: [{ type: 'set', count: 5 }, { type: 'set', count: 3 }] },
];

export const SCORING = {
  numberCardLow: (value: number) => (value <= 9 ? 5 : 10),
  wildCard: 25,
  skipCard: 15,
};

export const GAME_CONFIG = {
  minPlayers: 2,
  maxPlayers: 6,
  handSize: 10,
  phasesToWin: 10,
};
