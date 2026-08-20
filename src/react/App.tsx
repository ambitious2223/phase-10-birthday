import React from 'react';
import { GameProvider } from './context/GameContext';
import { GameBoard } from './components/GameBoard';

export default function App() {
  return (
    <GameProvider>
      <GameBoard />
    </GameProvider>
  );
}
