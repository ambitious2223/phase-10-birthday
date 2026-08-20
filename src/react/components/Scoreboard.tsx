import React from 'react';
import { motion } from 'motion/react';
import type { Player } from '../../engine/types';
import { calculateHandPenalty } from '../../engine/Scoring';

interface ScoreboardProps {
  players: Player[];
  onNewRound: () => void;
  gameWinner: string | null;
}

const springFade = { type: 'spring' as const, stiffness: 300, damping: 25 };

export function Scoreboard({ players, onNewRound, gameWinner }: ScoreboardProps) {
  const sorted = [...players].sort((a, b) => a.score - b.score);
  const winner = gameWinner ? players.find(p => p.id === gameWinner) : null;

  return (
    <motion.div
      className="scoreboard-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="scoreboard"
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 30 }}
        transition={springFade}
      >
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {winner ? `${winner.name} Wins the Game!` : 'Round Complete!'}
        </motion.h2>

        <table className="score-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Phase</th>
              <th>Hand Penalty</th>
              <th>Total Score</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((player, i) => (
              <motion.tr
                key={player.id}
                className={player.id === gameWinner ? 'winner-row' : ''}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <td>{player.name}</td>
                <td>Phase {player.currentPhase}</td>
                <td>+{calculateHandPenalty(player.hand)}</td>
                <td>{player.score}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        <motion.button
          className="btn btn-primary"
          onClick={onNewRound}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...springFade, delay: 0.6 }}
        >
          {gameWinner ? 'Play Again' : 'Next Round'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
