import type { Card, CardColor, Meld, GameState, GameAction, Player, TurnPhase } from './types';
import { createDeck, shuffle, drawCards } from './Deck';
import { satisfiesPhase, canExtendMeld, trySplitForPhase } from './Meld';
import { PHASES, GAME_CONFIG } from './constants';
import { isDiscardPileLocked, processSkipQueue } from '../utils/specialCardRules';

let meldIdCounter = 0;
function nextMeldId(): string {
  return `meld-${meldIdCounter++}`;
}

function findFirstDiscardCard(deck: Card[]): { card: Card; rest: Card[]; skipFirst: boolean; wildFirst: boolean } {
  if (deck.length === 0) return { card: null as any, rest: [], skipFirst: false, wildFirst: false };

  let idx = 0;
  while (idx < deck.length && deck[idx].type === 'skip') {
    idx++;
  }

  if (idx >= deck.length) {
    return { card: deck[0], rest: deck.slice(1), skipFirst: idx > 0, wildFirst: false };
  }

  const card = deck[idx];
  const rest = [...deck.slice(0, idx), ...deck.slice(idx + 1)];
  const skipFirst = idx > 0;
  const wildFirst = card.type === 'wild';

  return { card, rest, skipFirst, wildFirst };
}

export function createInitialState(configs: { name: string; type: 'human' | 'bot' }[]): GameState {
  meldIdCounter = 0;
  const deck = shuffle(createDeck());
  const players: Player[] = [];
  let deckIndex = 0;

  for (let i = 0; i < configs.length; i++) {
    const { drawn, remaining } = drawCards(deck.slice(deckIndex), GAME_CONFIG.handSize);
    deckIndex += GAME_CONFIG.handSize;
    players.push({
      id: `player-${i}`,
      name: configs[i].name,
      type: configs[i].type,
      hand: drawn,
      melds: [],
      currentPhase: 1,
      completedPhaseThisRound: false,
      score: 0,
      skippedThisRound: false,
    });
  }

  const remainingDeck = deck.slice(deckIndex);
  const { card: firstDiscard, rest, skipFirst, wildFirst } = findFirstDiscardCard(remainingDeck);

 return {
    players,
    currentPlayerIndex: skipFirst ? 1 % configs.length : 0,
    drawPile: rest,
    discardPile: firstDiscard ? [firstDiscard] : [],
    turnPhase: 'draw',
    round: 1,
    winner: null,
    lastAction: null,
    roundOver: false,
    skippedPlayerIds: skipFirst ? [players[1 % configs.length]?.id].filter(Boolean) : [],
    isDiscardDrawAllowed: firstDiscard ? firstDiscard.type !== 'skip' : true,
    gameLog: [
      'Game started! Phase 1 begins.',
      ...(wildFirst ? ['Opening card is Wild — first player may claim it!'] : []),
      ...(skipFirst ? ['Opening card is Skip — first player\'s turn is skipped!'] : []),
    ],
  };
}

function dealNewRound(state: GameState): GameState {
  const deck = shuffle(createDeck());
  let deckIndex = 0;

  const players = state.players.map(p => {
    const { drawn, remaining } = drawCards(deck.slice(deckIndex), GAME_CONFIG.handSize);
    deckIndex += GAME_CONFIG.handSize;
    return {
      ...p,
      hand: drawn,
      melds: [],
      completedPhaseThisRound: false,
      skippedThisRound: false,
    };
  });

  const remainingDeck = deck.slice(deckIndex);
  const { card: firstDiscard, rest, skipFirst } = findFirstDiscardCard(remainingDeck);

  const startIdx = skipFirst ? 1 % players.length : 0;

  return {
    ...state,
    players,
    currentPlayerIndex: startIdx,
    drawPile: rest,
    discardPile: firstDiscard ? [firstDiscard] : [],
    turnPhase: 'draw',
    round: state.round + 1,
    roundOver: false,
    lastAction: null,
    skippedPlayerIds: skipFirst ? [players[1 % players.length]?.id].filter(Boolean) : [],
    isDiscardDrawAllowed: firstDiscard ? firstDiscard.type !== 'skip' : true,
    gameLog: [
      ...state.gameLog,
      `Round ${state.round + 1} begins!`,
      ...(skipFirst ? ['Opening card is Skip — first player\'s turn is skipped!'] : []),
    ],
  };
}

export function gameStateReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'START_GAME') {
    return createInitialState(action.configs);
  }

  if (action.type === 'NEW_ROUND') {
    return dealNewRound(state);
  }

  if (state.roundOver) {
    return state;
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer) return state;

  switch (action.type) {
    case 'DRAW_CARD': {
      if (action.playerId !== currentPlayer.id) return state;
      if (state.turnPhase !== 'draw') return state;

      let drawPile = [...state.drawPile];
      let discardPile = [...state.discardPile];

      if (drawPile.length === 0) {
        if (discardPile.length <= 1) return state;
        const topCard = discardPile[discardPile.length - 1];
        const toShuffle = discardPile.slice(0, -1);
        drawPile = shuffle(toShuffle);
        discardPile = [topCard];
      }

      const drawnCard = drawPile[drawPile.length - 1];
      drawPile = drawPile.slice(0, -1);

      const players = state.players.map((p, i) =>
        i === state.currentPlayerIndex
          ? { ...p, hand: [...p.hand, drawnCard] }
          : p
      );

      return {
        ...state,
        players,
        drawPile,
        discardPile,
        turnPhase: 'meld',
        lastAction: { type: 'DRAW_CARD', playerId: currentPlayer.id },
        gameLog: [...state.gameLog, `${currentPlayer.name} drew a card.`],
      };
    }

    case 'DRAW_FROM_DISCARD': {
      if (action.playerId !== currentPlayer.id) return state;
      if (state.turnPhase !== 'draw') return state;
      if (state.discardPile.length === 0) return state;
      if (!state.isDiscardDrawAllowed) return state;

      const topDiscard = state.discardPile[state.discardPile.length - 1];
      if (topDiscard.type === 'skip') return state;

      const drawnCard = topDiscard;
      const discardPile = state.discardPile.slice(0, -1);

      const players = state.players.map((p, i) =>
        i === state.currentPlayerIndex
          ? { ...p, hand: [...p.hand, drawnCard] }
          : p
      );

      return {
        ...state,
        players,
        discardPile,
        turnPhase: 'meld',
        lastAction: { type: 'DRAW_FROM_DISCARD', playerId: currentPlayer.id },
        gameLog: [...state.gameLog, `${currentPlayer.name} drew from discard pile.`],
      };
    }

    case 'MELD': {
      if (action.playerId !== currentPlayer.id) return state;
      if (state.turnPhase !== 'meld') return state;

      const phaseReq = PHASES[currentPlayer.currentPhase - 1];
      if (!phaseReq) return state;

      const allMeldCards = action.melds.flatMap(m => m.cards);
      const handIds = new Set(currentPlayer.hand.map(c => c.id));
      if (!allMeldCards.every(c => handIds.has(c.id))) return state;

      const assignedMelds = trySplitForPhase(allMeldCards, phaseReq.requirements, currentPlayer.id);
      if (!assignedMelds) return state;

      const validMelds = assignedMelds.map(m => ({
        ...m,
        id: nextMeldId(),
      }));

      const usedIds = new Set(allMeldCards.map(c => c.id));
      const updatedHand = currentPlayer.hand.filter(c => !usedIds.has(c.id));
      const completedPhase = true;

      const players = state.players.map((p, i) =>
        i === state.currentPlayerIndex
          ? {
              ...p,
              hand: updatedHand,
              melds: [...p.melds, ...validMelds],
              completedPhaseThisRound: completedPhase,
              currentPhase: completedPhase ? Math.min(p.currentPhase + 1, 11) : p.currentPhase,
            }
          : p
      );

      if (updatedHand.length === 0) {
        return {
          ...state,
          players,
          turnPhase: 'draw',
          roundOver: true,
          lastAction: { type: 'MELD', playerId: currentPlayer.id, melds: validMelds },
          gameLog: [...state.gameLog, `${currentPlayer.name} completed Phase ${currentPlayer.currentPhase} and went out!`],
        };
      }

      return {
        ...state,
        players,
        turnPhase: 'hit',
        lastAction: { type: 'MELD', playerId: currentPlayer.id, melds: validMelds },
        gameLog: [...state.gameLog, `${currentPlayer.name} laid down their phase!`],
      };
    }

    case 'HIT': {
      if (action.playerId !== currentPlayer.id) return state;
      if (state.turnPhase !== 'hit' && state.turnPhase !== 'meld') return state;
      if (!currentPlayer.completedPhaseThisRound) return state;

      const handIds = new Set(currentPlayer.hand.map(c => c.id));
      if (!action.cards.every(c => handIds.has(c.id))) return state;

      let targetMeld: Meld | null = null;
      for (const p of state.players) {
        const found = p.melds.find(m => m.id === action.meldId);
        if (found) {
          targetMeld = found;
          break;
        }
      }
      if (!targetMeld) return state;

      for (const card of action.cards) {
        if (!canExtendMeld(targetMeld, card)) return state;
      }

      const updatedMeld = {
        ...targetMeld,
        cards: [...targetMeld.cards, ...action.cards],
      };

      const usedIds = new Set(action.cards.map(c => c.id));
      const updatedHand = currentPlayer.hand.filter(c => !usedIds.has(c.id));

      const players = state.players.map(p => ({
        ...p,
        melds: p.melds.map(m => m.id === action.meldId ? updatedMeld : m),
        hand: p.id === currentPlayer.id ? updatedHand : p.hand,
      }));

      if (updatedHand.length === 0) {
        return {
          ...state,
          players,
          turnPhase: 'draw',
          roundOver: true,
          lastAction: { type: 'HIT', playerId: currentPlayer.id, meldId: action.meldId, cards: action.cards },
          gameLog: [...state.gameLog, `${currentPlayer.name} hit and went out!`],
        };
      }

      return {
        ...state,
        players,
        turnPhase: 'hit',
        lastAction: { type: 'HIT', playerId: currentPlayer.id, meldId: action.meldId, cards: action.cards },
        gameLog: [...state.gameLog, `${currentPlayer.name} hit on a meld.`],
      };
    }

    case 'DISCARD': {
      if (action.playerId !== currentPlayer.id) return state;
      if (state.turnPhase !== 'hit' && state.turnPhase !== 'meld') return state;

      const handIds = new Set(currentPlayer.hand.map(c => c.id));
      if (!handIds.has(action.card.id)) return state;

      const updatedHand = currentPlayer.hand.filter(c => c.id !== action.card.id);

      const players = state.players.map((p, i) =>
        i === state.currentPlayerIndex
          ? { ...p, hand: updatedHand }
          : p
      );

      if (updatedHand.length === 0) {
        return {
          ...state,
          players,
          currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
          discardPile: [...state.discardPile, action.card],
          turnPhase: 'draw',
          roundOver: true,
          isDiscardDrawAllowed: action.card.type !== 'skip',
          lastAction: { type: 'DISCARD', playerId: currentPlayer.id, card: action.card },
          gameLog: [...state.gameLog, `${currentPlayer.name} discarded and went out!`],
        };
      }

      let nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
      const logMsg = `${currentPlayer.name} discarded a card.`;

      const skipResult = processSkipQueue(
        state.currentPlayerIndex,
        state.players,
        state.skippedPlayerIds,
      );

      if (skipResult.skippedPlayerName) {
        return {
          ...state,
          players,
          currentPlayerIndex: skipResult.nextIndex,
          discardPile: [...state.discardPile, action.card],
          turnPhase: 'draw',
          skippedPlayerIds: skipResult.updatedSkippedIds,
          isDiscardDrawAllowed: action.card.type !== 'skip',
          lastAction: { type: 'DISCARD', playerId: currentPlayer.id, card: action.card },
          gameLog: [
            ...state.gameLog,
            logMsg,
            `${skipResult.skippedPlayerName} was skipped!`,
          ],
        };
      }

      return {
        ...state,
        players,
        currentPlayerIndex: nextPlayerIndex,
        discardPile: [...state.discardPile, action.card],
        turnPhase: 'draw',
        isDiscardDrawAllowed: action.card.type !== 'skip',
        lastAction: { type: 'DISCARD', playerId: currentPlayer.id, card: action.card },
        gameLog: [...state.gameLog, logMsg],
      };
    }

    case 'USE_SKIP': {
      if (action.playerId !== currentPlayer.id) return state;
      if (state.turnPhase !== 'hit' && state.turnPhase !== 'meld') return state;

      const skipCard = currentPlayer.hand.find(c => c.type === 'skip' && action.cards?.some(ac => ac.id === c.id));
      if (!skipCard) return state;

      const targetIndex = state.players.findIndex(p => p.id === action.targetId);
      if (targetIndex === -1) return state;

      const targetPlayer = state.players[targetIndex];
      if (state.skippedPlayerIds.includes(targetPlayer.id)) return state;

      const updatedHand = currentPlayer.hand.filter(c => c.id !== skipCard.id);

      const players = state.players.map((p, i) => {
        if (i === state.currentPlayerIndex) {
          return { ...p, hand: updatedHand };
        }
        return p;
      });

      let nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

      const skipResult = processSkipQueue(
        state.currentPlayerIndex,
        state.players,
        [...state.skippedPlayerIds, targetPlayer.id],
      );

      return {
        ...state,
        players,
        currentPlayerIndex: skipResult.nextIndex,
        discardPile: [...state.discardPile, skipCard],
        turnPhase: 'draw',
        skippedPlayerIds: skipResult.updatedSkippedIds,
        isDiscardDrawAllowed: skipCard.type !== 'skip',
        lastAction: { type: 'USE_SKIP', playerId: currentPlayer.id, targetId: action.targetId, cards: action.cards },
        gameLog: [
          ...state.gameLog,
          `${currentPlayer.name} skipped ${targetPlayer.name}!`,
          ...(skipResult.skippedPlayerName ? [`${skipResult.skippedPlayerName} was skipped!`] : []),
        ],
      };
    }

    case 'END_TURN': {
      if (action.playerId !== currentPlayer.id) return state;

      let nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

      return {
        ...state,
        currentPlayerIndex: nextPlayerIndex,
        turnPhase: 'draw',
        lastAction: { type: 'END_TURN', playerId: currentPlayer.id },
      };
    }

    case 'REORDER_HAND': {
      if (action.playerId !== currentPlayer.id) return state;

      const cardMap = new Map(currentPlayer.hand.map(c => [c.id, c]));
      const reordered = action.cardIds
        .map(id => cardMap.get(id))
        .filter((c): c is Card => c !== undefined);

      const remaining = currentPlayer.hand.filter(c => !action.cardIds.includes(c.id));
      const newHand = [...reordered, ...remaining];

      const players = state.players.map((p, i) =>
        i === state.currentPlayerIndex
          ? { ...p, hand: newHand }
          : p
      );

      return { ...state, players };
    }

    default:
      return state;
  }
}
