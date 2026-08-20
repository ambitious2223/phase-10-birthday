import React from 'react';
import { motion } from 'motion/react';
import type { Player } from '../../../engine/types';

interface PlayerBadgeProps {
  player: Player;
  isActive: boolean;
  isSkipped?: boolean;
  position: 'top-left' | 'top-right' | 'bottom-left';
}

export function PlayerBadge({ player, isActive, isSkipped, position }: PlayerBadgeProps) {
  return (
    <motion.div
      className={`player-badge player-badge-${position} ${isActive ? 'player-badge-active' : ''} ${isSkipped ? 'player-badge-skipped' : ''}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className={`badge-avatar ${isActive ? 'badge-avatar-active' : ''}`}>
        {player.name[0]}
      </div>
      <div className="badge-info">
        <span className="badge-name">
          {player.name}
          {position === 'bottom-left' && ' 👑'}
        </span>
        <span className="badge-phase">Phase {player.currentPhase}</span>
      </div>
      <div className="badge-card-pill">
        🂠 {player.hand.length}
      </div>
    </motion.div>
  );
}
