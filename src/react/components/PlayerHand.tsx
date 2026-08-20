import React, { useState, useCallback } from 'react';
import { Reorder, AnimatePresence, motion } from 'motion/react';
import type { Card } from '../../engine/types';
import { CardComponent } from './CardComponent';

interface PlayerHandProps {
  cards: Card[];
  selectedCards: Set<string>;
  onCardClick: (card: Card) => void;
  onReorder?: (cardIds: string[]) => void;
  isActive: boolean;
  faceDown?: boolean;
  cardCount?: number;
  tutorialTarget?: string;
}

const springCard = { type: 'spring' as const, stiffness: 260, damping: 20 };

export function PlayerHand({ cards, selectedCards, onCardClick, onReorder, isActive, faceDown, cardCount, tutorialTarget }: PlayerHandProps) {
  const [swapIndex, setSwapIndex] = useState<number | null>(null);

  const handleSwapClick = useCallback((card: Card, index: number) => {
    if (swapIndex === null) {
      setSwapIndex(index);
    } else if (swapIndex === index) {
      setSwapIndex(null);
    } else {
      const newCards = [...cards];
      const temp = newCards[swapIndex];
      newCards[swapIndex] = newCards[index];
      newCards[index] = temp;
      onReorder?.(newCards.map(c => c.id));
      setSwapIndex(null);
    }
  }, [swapIndex, cards, onReorder]);

  if (faceDown) {
    const count = cardCount ?? cards.length;
    return (
      <div className={`player-hand ${isActive ? 'hand-active' : ''}`}>
        <div className="hand-cards face-down">
          {Array.from({ length: Math.min(count, 10) }).map((_, i) => (
            <motion.div
              key={`back-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, ...springCard }}
            >
              <CardComponent
                card={{ id: `back-${i}`, type: 'number', color: 'red', value: 0 }}
                faceDown
                small
              />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  const centerIndex = (cards.length - 1) / 2;

  return (
    <div className={`player-hand ${isActive ? 'hand-active' : ''}`} data-tutorial={tutorialTarget}>
      <Reorder.Group
        axis="x"
        values={cards}
        onReorder={(newOrder) => onReorder?.(newOrder.map(c => c.id))}
        className="hand-cards hand-cards-fan"
        as="div"
      >
        <AnimatePresence>
          {cards.map((card, index) => {
            const rotation = (index - centerIndex) * 2.5;
            const yOffset = Math.abs(index - centerIndex) * 3;
            const isSelected = selectedCards.has(card.id);
            const isSwapping = swapIndex === index;

            return (
              <Reorder.Item
                key={card.id}
                value={card}
                as="div"
                className={`reorder-item ${isSwapping ? 'swap-selected' : ''}`}
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                animate={{
                  opacity: 1,
                  scale: isSelected ? 1.08 : 1,
                  y: isSelected ? -36 : yOffset,
                  rotate: 0,
                  zIndex: isSelected ? 40 : index,
                }}
                exit={{ opacity: 0, scale: 0.8, y: 40 }}
                transition={springCard}
                whileHover={{
                  y: -24,
                  scale: 1.06,
                  rotate: 0,
                  zIndex: 50,
                  transition: { duration: 0.15 },
                }}
                whileDrag={{
                  scale: 1.12,
                  zIndex: 60,
                  boxShadow: '0 16px 32px rgba(0,0,0,0.5)',
                  transition: { type: 'spring', stiffness: 300, damping: 25 },
                }}
                dragElastic={0.15}
                dragTransition={{
                  bounceStiffness: 300,
                  bounceDamping: 25,
                }}
                style={{ rotate: rotation }}
              >
                <CardComponent
                  card={card}
                  onClick={() => {
                    onCardClick(card);
                    handleSwapClick(card, index);
                  }}
                  selected={isSelected}
                />
              </Reorder.Item>
            );
          })}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
}
