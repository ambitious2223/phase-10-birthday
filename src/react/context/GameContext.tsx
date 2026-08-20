import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import type { GameState, GameAction } from '../../engine/types';
import { createInitialState, gameStateReducer } from '../../engine/GameState';
import { decideBotAction } from '../../engine/AI/botPlayer';
import { birthdayConfig } from '../birthday/birthdayConfig';

interface GameContextType {
  state: GameState;
  dispatch: (action: GameAction) => void;
  startGame: (configs: { name: string; type: 'human' | 'bot' }[]) => void;
  isHumanTurn: boolean;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameStateReducer, createInitialState([
    { name: `${birthdayConfig.birthdayGirlName}`, type: 'human' },
    { name: birthdayConfig.friend1Name, type: 'bot' },
    { name: birthdayConfig.friend2Name, type: 'bot' },
  ]));

  const stateRef = useRef(state);
  stateRef.current = state;

  const startGame = useCallback((configs: { name: string; type: 'human' | 'bot' }[]) => {
    dispatch({ type: 'START_GAME', configs });
  }, []);

  const humanPlayer = state.players.find(p => p.type === 'human');
  const isHumanTurn = humanPlayer
    ? state.players[state.currentPlayerIndex]?.id === humanPlayer.id
    : false;

  useEffect(() => {
    if (state.roundOver) return;

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.type !== 'bot') return;

    const timer = setTimeout(() => {
      const action = decideBotAction(stateRef.current, currentPlayer.id);
      if (action) {
        dispatch(action);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [state.currentPlayerIndex, state.turnPhase, state.roundOver, state.players]);

  return (
    <GameContext.Provider value={{ state, dispatch, startGame, isHumanTurn }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
