import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Card, Player, Meld } from '../../../engine/types';
import { DrawPile } from '../DrawPile';
import { MeldArea } from '../MeldArea';
import { PhaseSlot } from '../PhaseSlot';

interface CenterPlayMatProps {
  drawPile: Card[];
  discardPile: Card[];
  canDraw: boolean;
  canDrawFromDiscard: boolean;
  onDraw: () => void;
  onDrawFromDiscard: () => void;
  players: Player[];
  humanPlayerId: string;
  hitMode: boolean;
  onMeldClick: (meldId: string) => void;
  showPhaseSlots: boolean;
  phaseLabelA: string;
  phaseLabelB: string;
  phaseSlotA: string[];
  phaseSlotB: string[];
  humanHand: Card[];
  phaseRequirements: { type: 'set' | 'run' | 'color'; count: number }[];
  onRemoveSlotA: (id: string) => void;
  onRemoveSlotB: (id: string) => void;
  onDropSlotA: (id: string) => void;
  onDropSlotB: (id: string) => void;
  onClearSlots: () => void;
  hasSlotContent: boolean;
}

export function CenterPlayMat({
  drawPile,
  discardPile,
  canDraw,
  canDrawFromDiscard,
  onDraw,
  onDrawFromDiscard,
  players,
  humanPlayerId,
  hitMode,
  onMeldClick,
  showPhaseSlots,
  phaseLabelA,
  phaseLabelB,
  phaseSlotA,
  phaseSlotB,
  humanHand,
  phaseRequirements,
  onRemoveSlotA,
  onRemoveSlotB,
  onDropSlotA,
  onDropSlotB,
  onClearSlots,
  hasSlotContent,
}: CenterPlayMatProps) {
  return (
    <div className="center-play-mat" data-tutorial="draw-pile">
      <DrawPile
        drawPile={drawPile}
        discardPile={discardPile}
        canDraw={canDraw}
        canDrawFromDiscard={canDrawFromDiscard}
        onDraw={onDraw}
        onDrawFromDiscard={onDrawFromDiscard}
      />

      <AnimatePresence>
        {showPhaseSlots && phaseRequirements.length === 2 && (
          <motion.div
            className="mat-phase-slots"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mat-phase-slot-row">
              <PhaseSlot
                label={phaseLabelA}
                cardIds={phaseSlotA}
                hand={humanHand}
                onRemove={onRemoveSlotA}
                onDrop={onDropSlotA}
                requirement={phaseRequirements[0]}
              />
              <div className="mat-phase-slot-divider">+</div>
              <PhaseSlot
                label={phaseLabelB}
                cardIds={phaseSlotB}
                hand={humanHand}
                onRemove={onRemoveSlotB}
                onDrop={onDropSlotB}
                requirement={phaseRequirements[1]}
              />
            </div>
            {hasSlotContent && (
              <motion.button
                className="btn btn-secondary btn-sm"
                onClick={onClearSlots}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear Slots
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <MeldArea
        players={players}
        humanPlayerId={humanPlayerId}
        hitMode={hitMode}
        onMeldClick={onMeldClick}
      />

      <AnimatePresence>
        {hitMode && (
          <motion.div
            className="hit-overlay"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="hit-message">
              Select cards, then click a meld to hit — or press Esc to cancel
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
