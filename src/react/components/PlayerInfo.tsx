import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Player } from '../../engine/types';
import { PhaseTracker } from './PhaseTracker';

interface PlayerInfoProps {
  player: Player;
  isActive: boolean;
  isHuman: boolean;
  isSkipped?: boolean;
}

export function PlayerInfo({ player, isActive, isHuman, isSkipped }: PlayerInfoProps) {
  return (
    <div className={`player-info ${isActive ? 'player-active' : ''} ${isHuman ? 'player-human' : ''} ${isSkipped ? 'player-skipped' : ''}`}>
      <div className="player-name">{player.name}</div>
      <PhaseTracker
        currentPhase={player.currentPhase}
        completedPhase={player.completedPhaseThisRound}
        score={player.score}
        isCurrentPlayer={isActive}
      />
      <div className="player-card-count">
        Cards: {player.hand.length}
      </div>

      <AnimatePresence>
        {isSkipped && (
          <motion.div
            className="skip-locked-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="skip-badge-container">
              <motion.div
                className="skip-badge"
                initial={{ scale: 2.5, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 15,
                }}
              >
                <span className="skip-badge-text">SKIPPED</span>
                <span className="skip-badge-icon">&#x1F6AB;</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
