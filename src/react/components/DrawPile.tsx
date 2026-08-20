import React from 'react';
import { motion } from 'motion/react';
import type { Card } from '../../engine/types';
import { CardComponent } from './CardComponent';

interface DrawPileProps {
  drawPile: Card[];
  discardPile: Card[];
  canDraw: boolean;
  canDrawFromDiscard: boolean;
  onDraw: () => void;
  onDrawFromDiscard: () => void;
}

const springPop = { type: 'spring' as const, stiffness: 400, damping: 25 };

export function DrawPile({ drawPile, discardPile, canDraw, canDrawFromDiscard, onDraw, onDrawFromDiscard }: DrawPileProps) {
  const topDiscard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;

  return (
    <div className="draw-pile-area">
      <div className="pile-group">
        <motion.div
          className={`pile draw-pile ${canDraw ? 'pile-clickable' : ''}`}
          onClick={canDraw ? onDraw : undefined}
          whileHover={canDraw ? { scale: 1.05, y: -4 } : undefined}
          whileTap={canDraw ? { scale: 0.95 } : undefined}
          animate={canDraw ? { boxShadow: '0 0 24px rgba(37,99,235,0.5)' } : { boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
        >
          {drawPile.length > 0 ? (
            <motion.div layoutId="draw-top" transition={springPop}>
              <CardComponent
                card={{ id: 'draw-back', type: 'number', color: 'red', value: 0 }}
                faceDown
              />
            </motion.div>
          ) : (
            <div className="pile-empty">Empty</div>
          )}
          <motion.div
            className="pile-count"
            key={drawPile.length}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={springPop}
          >
            {drawPile.length}
          </motion.div>
        </motion.div>
        {canDraw && (
          <motion.button
            className="pile-action-btn pile-action-draw"
            onClick={onDraw}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Draw
          </motion.button>
        )}
        <div className="pile-label">Draw Pile</div>
      </div>

      <div className="pile-group">
        <motion.div
          className={`pile discard-pile ${canDrawFromDiscard ? 'pile-clickable' : ''}`}
          onClick={canDrawFromDiscard ? onDrawFromDiscard : undefined}
          whileHover={canDrawFromDiscard ? { scale: 1.05, y: -4 } : undefined}
          whileTap={canDrawFromDiscard ? { scale: 0.95 } : undefined}
          animate={canDrawFromDiscard ? { boxShadow: '0 0 24px rgba(230,81,0,0.5)' } : { boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
        >
          {topDiscard ? (
            <motion.div layoutId={`card-${topDiscard.id}`} transition={springPop}>
              <CardComponent card={topDiscard} />
            </motion.div>
          ) : (
            <div className="pile-empty">Empty</div>
          )}
        </motion.div>
        {canDrawFromDiscard && (
          <motion.button
            className="pile-action-btn pile-action-take"
            onClick={onDrawFromDiscard}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Take
          </motion.button>
        )}
        <div className="pile-label">Discard Pile</div>
      </div>
    </div>
  );
}
