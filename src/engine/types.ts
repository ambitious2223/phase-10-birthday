export type CardColor = 'red' | 'blue' | 'green' | 'yellow';
export type CardType = 'number' | 'wild' | 'skip';

export interface Card {
  id: string;
  type: CardType;
  color: CardColor | 'wild';
  value: number;
}

export interface PhaseRequirement {
  type: 'set' | 'run' | 'color';
  count: number;
  color?: CardColor;
}

export interface Phase {
  id: number;
  name: string;
  requirements: PhaseRequirement[];
}

export interface Meld {
  id: string;
  type: 'set' | 'run' | 'color';
  cards: Card[];
  color?: CardColor;
  ownerId: string;
}

export type PlayerType = 'human' | 'bot';

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  hand: Card[];
  melds: Meld[];
  currentPhase: number;
  completedPhaseThisRound: boolean;
  score: number;
  skippedThisRound: boolean;
}

export type TurnPhase = 'draw' | 'meld' | 'hit' | 'discard';

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  drawPile: Card[];
  discardPile: Card[];
  turnPhase: TurnPhase;
  round: number;
  winner: string | null;
  lastAction: GameAction | null;
  roundOver: boolean;
  gameLog: string[];
  skippedPlayerIds: string[];
  isDiscardDrawAllowed: boolean;
}

export type GameAction =
  | { type: 'DRAW_CARD'; playerId: string }
  | { type: 'DRAW_FROM_DISCARD'; playerId: string }
  | { type: 'MELD'; playerId: string; melds: Meld[] }
  | { type: 'HIT'; playerId: string; meldId: string; cards: Card[] }
  | { type: 'DISCARD'; playerId: string; card: Card }
  | { type: 'USE_SKIP'; playerId: string; targetId: string; cards: Card[] }
  | { type: 'END_TURN'; playerId: string }
  | { type: 'REORDER_HAND'; playerId: string; cardIds: string[] }
  | { type: 'START_GAME'; configs: { name: string; type: PlayerType }[] }
  | { type: 'NEW_ROUND' };
