import React from 'react';
import { motion } from 'motion/react';
import type { TurnPhase } from '../../engine/types';
import { PHASES } from '../../engine/constants';

interface GameControlsProps {
  turnPhase: TurnPhase;
  canMeld: boolean;
  canDiscard: boolean;
  canHit: boolean;
  selectedCards: string[];
  playerPhase: number;
  hasSkipCard: boolean;
  onDraw: () => void;
  onDrawFromDiscard: () => void;
  onMeld: () => void;
  onHit: () => void;
  onDiscard: () => void;
  onSkip: () => void;
  onEndTurn: () => void;
}

const springBtn = { type: 'spring' as const, stiffness: 400, damping: 25 };

export function GameControls({
  turnPhase,
  canMeld,
  canDiscard,
  canHit,
  selectedCards,
  playerPhase,
  hasSkipCard,
  onDraw,
  onDrawFromDiscard,
  onMeld,
  onHit,
  onDiscard,
  onSkip,
  onEndTurn,
}: GameControlsProps) {
  const phase = PHASES[playerPhase - 1];
  const hasSelection = selectedCards.length > 0;

  return (
    <div className="game-controls">
      {turnPhase === 'draw' && (
        <div className="control-group">
          <motion.button
            className="btn btn-primary"
            onClick={onDraw}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={springBtn}
          >
            Draw from Deck
          </motion.button>
          <motion.button
            className="btn btn-secondary"
            onClick={onDrawFromDiscard}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={springBtn}
          >
            Take from Discard
          </motion.button>
        </div>
      )}

      {turnPhase === 'meld' && (
        <div className="control-group">
          {canMeld && (
            <motion.button
              className="btn btn-success"
              onClick={onMeld}
              disabled={!hasSelection}
              whileHover={hasSelection ? { scale: 1.05 } : undefined}
              whileTap={hasSelection ? { scale: 0.95 } : undefined}
              transition={springBtn}
            >
              Lay Down Phase {playerPhase}
            </motion.button>
          )}
          {hasSkipCard && (
            <motion.button
              className="btn btn-warning"
              onClick={onSkip}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={springBtn}
            >
              Play Skip
            </motion.button>
          )}
          <motion.button
            className="btn btn-danger"
            onClick={onDiscard}
            disabled={!hasSelection || selectedCards.length !== 1}
            whileHover={hasSelection && selectedCards.length === 1 ? { scale: 1.05 } : undefined}
            whileTap={hasSelection && selectedCards.length === 1 ? { scale: 0.95 } : undefined}
            transition={springBtn}
          >
            Discard
          </motion.button>
        </div>
      )}

      {turnPhase === 'hit' && (
        <div className="control-group">
          {canHit && (
            <motion.button
              className="btn btn-info"
              onClick={onHit}
              disabled={!hasSelection}
              whileHover={hasSelection ? { scale: 1.05 } : undefined}
              whileTap={hasSelection ? { scale: 0.95 } : undefined}
              transition={springBtn}
            >
              Hit on Meld
            </motion.button>
          )}
          {hasSkipCard && (
            <motion.button
              className="btn btn-warning"
              onClick={onSkip}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={springBtn}
            >
              Play Skip
            </motion.button>
          )}
          <motion.button
            className="btn btn-danger"
            onClick={onDiscard}
            disabled={!hasSelection || selectedCards.length !== 1}
            whileHover={hasSelection && selectedCards.length === 1 ? { scale: 1.05 } : undefined}
            whileTap={hasSelection && selectedCards.length === 1 ? { scale: 0.95 } : undefined}
            transition={springBtn}
          >
            Discard
          </motion.button>
        </div>
      )}

      {phase && (
        <motion.div
          className="phase-reminder"
          key={playerPhase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springBtn}
        >
          Your Phase {playerPhase}: {phase.name}
        </motion.div>
      )}
    </div>
  );
}
