import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import type { Card } from '../../engine/types';

interface CardComponentProps {
  card: Card;
  onClick?: () => void;
  selected?: boolean;
  faceDown?: boolean;
  small?: boolean;
  isDragging?: boolean;
  showWildGlow?: boolean;
}

const COLOR_MAP: Record<string, string> = {
  red: '#dc2626',
  blue: '#2563eb',
  green: '#16a34a',
  yellow: '#eab308',
  wild: '#7c3aed',
};

const COLOR_BG_MAP: Record<string, string> = {
  red: '#fef2f2',
  blue: '#eff6ff',
  green: '#f0fdf4',
  yellow: '#fefce8',
  wild: '#f5f3ff',
};

const WILD_GLOW_COLORS = ['#ff4d4d', '#ffd700', '#4da6ff', '#ff69b4'];

const springFlight = { type: 'spring' as const, stiffness: 260, damping: 20 };

export function CardComponent({
  card,
  onClick,
  selected,
  faceDown,
  small,
  isDragging,
  showWildGlow,
}: CardComponentProps) {
  const [isFlipped, setIsFlipped] = useState(!!faceDown);
  const [glowIdx, setGlowIdx] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const accent = COLOR_MAP[card.color] ?? '#6b7280';
  const bgColor = COLOR_BG_MAP[card.color] ?? '#f9fafb';

  React.useEffect(() => {
    if (!faceDown && isFlipped) {
      const t = setTimeout(() => setIsFlipped(false), 50);
      return () => clearTimeout(t);
    }
    if (faceDown && !isFlipped) {
      setIsFlipped(true);
    }
  }, [faceDown]);

  React.useEffect(() => {
    if (!showWildGlow || card.type !== 'wild') return;
    const interval = setInterval(() => {
      setGlowIdx(prev => (prev + 1) % WILD_GLOW_COLORS.length);
    }, 600);
    return () => clearInterval(interval);
  }, [showWildGlow, card.type]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (faceDown || small || isDragging) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -15, y: x * 15 });
  }, [faceDown, small, isDragging]);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  const isWild = card.type === 'wild';
  const isSkip = card.type === 'skip';
  const wildGlowColor = WILD_GLOW_COLORS[glowIdx];

  return (
    <motion.div
      ref={cardRef}
      className={`card-wrapper ${small ? 'card-wrapper-small' : ''}`}
      transition={springFlight}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={!faceDown && !isDragging ? { y: -15, scale: 1.05 } : undefined}
      whileTap={!faceDown ? { scale: 0.95 } : undefined}
      animate={
        selected
          ? { y: -12, scale: 1.05, rotateX: 0, rotateY: 0, boxShadow: `0 8px 20px ${accent}66` }
          : isDragging
          ? { scale: 1.1, rotate: 2, zIndex: 50, rotateX: 0, rotateY: 0 }
          : { y: 0, scale: 1, rotateX: tilt.x, rotateY: tilt.y, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }
      }
      style={{
        perspective: 800,
        cursor: faceDown ? 'default' : 'pointer',
        filter: isWild && showWildGlow ? `drop-shadow(0 0 8px ${wildGlowColor})` : undefined,
        transition: 'filter 0.6s ease',
      }}
    >
      <motion.div
        className={`card-inner ${isWild ? 'card-wild' : ''} ${isSkip ? 'card-skip' : ''} ${selected ? 'card-selected-inner' : ''}`}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%' }}
      >
        <div
          className="card-face card-front"
          style={{ '--accent': accent, '--card-bg': bgColor } as React.CSSProperties}
        >
          {card.type === 'number' && (
            <>
              <div className="corner corner-tl">
                <span className="corner-number">{card.value}</span>
              </div>
              <div className="card-center">
                <span className="center-number">{card.value}</span>
              </div>
              <div className="corner corner-br">
                <span className="corner-number">{card.value}</span>
              </div>
            </>
          )}
          {isWild && (
            <>
              <div className="corner corner-tl">
                <span className="corner-letter">W</span>
              </div>
              <div className="card-center">
                {showWildGlow && <span className="wild-cake">&#x1F382;</span>}
                <span className="center-text wild-text">WILD</span>
              </div>
              <div className="corner corner-br">
                <span className="corner-letter">W</span>
              </div>
            </>
          )}
          {isSkip && (
            <>
              <div className="corner corner-tl">
                <span className="corner-letter">S</span>
              </div>
              <div className="card-center">
                <span className="center-text skip-text">SKIP</span>
              </div>
              <div className="corner corner-br">
                <span className="corner-letter">S</span>
              </div>
            </>
          )}
        </div>

        <div className="card-face card-back-face">
          <div className="card-back-inner">
            <div className="card-back-logo">P10</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
