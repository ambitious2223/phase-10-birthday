import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Player } from '../../engine/types';

interface SkipOverlayProps {
  skippedPlayerIds: string[];
  players: Player[];
  targetPlayerId?: string | null;
  showTargetReticle?: boolean;
}

export function SkipOverlay({ skippedPlayerIds, players, targetPlayerId, showTargetReticle }: SkipOverlayProps) {
  return (
    <>
      <AnimatePresence>
        {skippedPlayerIds.map(playerId => {
          const player = players.find(p => p.id === playerId);
          if (!player) return null;

          return (
            <motion.div
              key={`skip-overlay-${playerId}`}
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
          );
        })}
      </AnimatePresence>

      <AnimatePresence>
        {showTargetReticle && targetPlayerId && (
          <motion.div
            className="skip-target-reticle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <motion.div
              className="reticle-ring"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="reticle-crosshair" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface SkipTargetPickerProps {
  eligibleTargets: Player[];
  onSelect: (playerId: string) => void;
  onCancel: () => void;
}

export function SkipTargetPicker({ eligibleTargets, onSelect, onCancel }: SkipTargetPickerProps) {
  return (
    <motion.div
      className="skip-target-picker-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="skip-target-picker"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <h3 className="skip-picker-title">Choose a target to skip</h3>
        <div className="skip-targets">
          {eligibleTargets.map(target => (
            <motion.button
              key={target.id}
              className="skip-target-btn"
              onClick={() => onSelect(target.id)}
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(220, 38, 38, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <div className="skip-target-avatar">{target.name[0]}</div>
              <span className="skip-target-name">{target.name}</span>
              <span className="skip-target-phase">Phase {target.currentPhase}</span>
            </motion.button>
          ))}
        </div>
        <motion.button
          className="btn btn-secondary skip-cancel-btn"
          onClick={onCancel}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Cancel
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
