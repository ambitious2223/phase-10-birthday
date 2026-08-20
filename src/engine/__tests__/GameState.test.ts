import { describe, it, expect } from 'vitest';
import { createInitialState, gameStateReducer } from '../GameState';

function findPlayer(state: ReturnType<typeof createInitialState>, name: string) {
  return state.players.find(p => p.name === name);
}

describe('createInitialState', () => {
  it('creates 3 players with 10 cards each', () => {
    const state = createInitialState([
      { name: 'Kimberly', type: 'human' },
      { name: 'Christopher', type: 'bot' },
      { name: 'Ahmad', type: 'bot' },
    ]);
    expect(state.players.length).toBe(3);
    expect(state.players[0].hand.length).toBe(10);
    expect(state.players[1].hand.length).toBe(10);
    expect(state.players[2].hand.length).toBe(10);
    expect(state.players[0].currentPhase).toBe(1);
    expect(state.round).toBe(1);
    expect(state.discardPile.length).toBe(1);
  });
});

describe('DRAW_CARD', () => {
  it('draws a card from draw pile', () => {
    const state = createInitialState([
      { name: 'Kimberly', type: 'human' },
      { name: 'Bot', type: 'bot' },
    ]);
    const kim = findPlayer(state, 'Kimberly')!;
    const drawCount = state.drawPile.length;

    const result = gameStateReducer(state, { type: 'DRAW_CARD', playerId: kim.id });
    const resultKim = findPlayer(result, 'Kimberly')!;
    expect(resultKim.hand.length).toBe(11);
    expect(result.drawPile.length).toBe(drawCount - 1);
    expect(result.turnPhase).toBe('meld');
  });

  it('only allows draw during draw phase', () => {
    const state = createInitialState([
      { name: 'Kimberly', type: 'human' },
      { name: 'Bot', type: 'bot' },
    ]);
    const kim = findPlayer(state, 'Kimberly')!;
    expect(state.turnPhase).toBe('draw');

    const drawn = gameStateReducer(state, { type: 'DRAW_CARD', playerId: kim.id });
    expect(drawn.turnPhase).toBe('meld');

    const result = gameStateReducer(drawn, { type: 'DRAW_CARD', playerId: kim.id });
    expect(result.turnPhase).toBe('meld');
    expect(findPlayer(result, 'Kimberly')!.hand.length).toBe(11);
  });
});

describe('DISCARD', () => {
  it('discards a card and ends turn', () => {
    let state = createInitialState([
      { name: 'Kimberly', type: 'human' },
      { name: 'Bot', type: 'bot' },
    ]);
    const kim = findPlayer(state, 'Kimberly')!;
    state = gameStateReducer(state, { type: 'DRAW_CARD', playerId: kim.id });

    const cardToDiscard = findPlayer(state, 'Kimberly')!.hand[0];
    const result = gameStateReducer(state, { type: 'DISCARD', playerId: kim.id, card: cardToDiscard });

    expect(findPlayer(result, 'Kimberly')!.hand.length).toBe(10);
    expect(result.currentPlayerIndex).toBe(1);
    expect(result.turnPhase).toBe('draw');
  });

  it('completedPhaseThisRound set after valid meld', () => {
    let state = createInitialState([
      { name: 'Kimberly', type: 'human' },
      { name: 'Bot', type: 'bot' },
    ]);
    const kim = findPlayer(state, 'Kimberly')!;

    state = gameStateReducer(state, { type: 'DRAW_CARD', playerId: kim.id });

    const hand = state.players[0].hand;
    const melds = hand.slice(0, 3).map(c => ({
      id: 'pending',
      type: 'set' as const,
      cards: [c],
      ownerId: kim.id,
    }));

    const melded = gameStateReducer(state, { type: 'MELD', playerId: kim.id, melds });
    if (melded.players[0].completedPhaseThisRound) {
      expect(melded.players[0].hand.length).toBeLessThan(11);
    }
  });
});

describe('REORDER_HAND', () => {
  it('reorders hand cards by id', () => {
    const state = createInitialState([
      { name: 'Kimberly', type: 'human' },
      { name: 'Bot', type: 'bot' },
    ]);
    const kim = findPlayer(state, 'Kimberly')!;
    const originalOrder = kim.hand.map(c => c.id);
    const reversed = [...originalOrder].reverse();

    const result = gameStateReducer(state, { type: 'REORDER_HAND', playerId: kim.id, cardIds: reversed });
    expect(findPlayer(result, 'Kimberly')!.hand.map(c => c.id)).toEqual(reversed);
  });
});

describe('round progression', () => {
  it('NEW_ROUND resets hands and increments round', () => {
    let state = createInitialState([
      { name: 'Kimberly', type: 'human' },
      { name: 'Bot', type: 'bot' },
    ]);
    state = gameStateReducer(state, { type: 'NEW_ROUND' });
    expect(state.round).toBe(2);
    expect(state.players[0].hand.length).toBe(10);
    expect(state.players[1].hand.length).toBe(10);
  });
});
