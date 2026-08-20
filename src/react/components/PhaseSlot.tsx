import { motion } from 'motion/react';
import type { Card } from '../../engine/types';

interface PhaseSlotProps {
  label: string;
  cardIds: string[];
  hand: Card[];
  onRemove: (id: string) => void;
  onDrop: (id: string) => void;
  requirement: { type: 'set' | 'run' | 'color'; count: number };
}

export function PhaseSlot({ label, cardIds, hand, onRemove, onDrop, requirement }: PhaseSlotProps) {
  const slotCards = cardIds.map(id => hand.find(c => c.id === id)).filter((c): c is Card => c !== undefined);

  return (
    <motion.div
      className={`phase-slot ${slotCards.length > 0 ? 'phase-slot-filled' : ''}`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="phase-slot-label">{label}</div>
      <div className="phase-slot-cards">
        {slotCards.map(card => (
          <motion.div
            key={card.id}
            className="phase-slot-card"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => onRemove(card.id)}
            whileHover={{ scale: 1.1 }}
          >
            <span className="phase-slot-card-value">
              {card.type === 'wild' ? 'W' : card.type === 'skip' ? 'S' : card.value}
            </span>
            <span className="phase-slot-card-remove">&times;</span>
          </motion.div>
        ))}
        {slotCards.length === 0 && (
          <div className="phase-slot-empty">
            Select cards to add
          </div>
        )}
      </div>
    </motion.div>
  );
}
