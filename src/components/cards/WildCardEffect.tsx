import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface WildCardEffectProps {
  isActive: boolean;
  onSparkleComplete?: () => void;
}

const RAINBOW_COLORS = ['#ff4d4d', '#ffd700', '#4da6ff', '#ff69b4', '#7c3aed'];

export function WildCardEffect({ isActive, onSparkleComplete }: WildCardEffectProps) {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  useEffect(() => {
    if (!isActive) {
      setSparkles([]);
      return;
    }

    const interval = setInterval(() => {
      const newSparkle = {
        id: Date.now() + Math.random(),
        x: Math.random() * 60 - 30,
        y: Math.random() * 60 - 30,
        color: RAINBOW_COLORS[Math.floor(Math.random() * RAINBOW_COLORS.length)],
      };
      setSparkles(prev => [...prev.slice(-8), newSparkle]);
    }, 200);

    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (isActive && onSparkleComplete) {
      const timer = setTimeout(onSparkleComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [isActive, onSparkleComplete]);

  if (!isActive) return null;

  return (
    <div className="wild-card-effect">
      <AnimatePresence>
        {sparkles.map(sparkle => (
          <motion.div
            key={sparkle.id}
            className="wild-sparkle"
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 1.5, x: sparkle.x, y: sparkle.y }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: sparkle.color,
              boxShadow: `0 0 6px ${sparkle.color}`,
              pointerEvents: 'none',
              top: '50%',
              left: '50%',
              zIndex: 10,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export function WildMeldSlam({ onDone }: { onDone?: () => void }) {
  return (
    <motion.div
      className="wild-meld-slam"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: [0.5, 1.25, 1], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 0.8, times: [0, 0.3, 0.6, 1] }}
      onAnimationComplete={onDone}
      style={{
        position: 'absolute',
        inset: '-8px',
        borderRadius: '16px',
        border: '3px solid #7c3aed',
        boxShadow: '0 0 20px rgba(124, 58, 237, 0.6), 0 0 40px rgba(124, 58, 237, 0.3)',
        pointerEvents: 'none',
        zIndex: 20,
      }}
    />
  );
}
