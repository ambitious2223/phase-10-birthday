import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GameLogProps {
  messages: string[];
  round: number;
}

export const GameLog = forwardRef<HTMLDivElement, GameLogProps>(
  ({ messages, round }, ref) => {
    return (
      <motion.div
        className="game-log"
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="log-header">Game Log</div>
        <AnimatePresence>
          {messages.slice(-10).map((msg, i) => (
            <motion.div
              key={`${round}-${i}`}
              className="log-entry"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }
);

GameLog.displayName = 'GameLog';
