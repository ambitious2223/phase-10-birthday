import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { birthdayConfig } from './birthdayConfig';

const STORAGE_KEY = 'phase10_birthday_card_seen';

interface BirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const springModal = { type: 'spring' as const, stiffness: 300, damping: 25 };

export function BirthdayModal({ isOpen, onClose }: BirthdayModalProps) {
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (isOpen) setHasStarted(false);
  }, [isOpen]);

  const handleStart = () => {
    setHasStarted(true);
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#d32f2f', '#1565c0', '#2e7d32', '#e65100', '#fbbf24', '#7c3aed'],
    });
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#d32f2f', '#fbbf24', '#e65100'],
      });
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#1565c0', '#2e7d32', '#7c3aed'],
      });
    }, 300);
    setTimeout(onClose, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="birthday-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="birthday-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="birthday-modal"
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={springModal}
          >
            <div className="birthday-cake-icon">
              <span className="cake-candle">|</span>
              <span className="cake-flame">~</span>
            </div>

            <motion.h1
              className="birthday-title"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {birthdayConfig.welcomeTitle}
            </motion.h1>

            <motion.p
              className="birthday-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {birthdayConfig.welcomeMessage}
            </motion.p>

            <motion.div
              className="birthday-players"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="birthday-player">
                <div className="avatar avatar-kim">{birthdayConfig.birthdayGirlName[0]}</div>
                <span>{birthdayConfig.birthdayGirlName} 👑</span>
              </div>
              <div className="birthday-vs">vs</div>
              <div className="birthday-player">
                <div className="avatar avatar-chris">{birthdayConfig.friend1Name[0]}</div>
                <span>{birthdayConfig.friend1Name}</span>
              </div>
              <div className="birthday-vs">vs</div>
              <div className="birthday-player">
                <div className="avatar avatar-bestie">{birthdayConfig.friend2Name[0]}</div>
                <span>{birthdayConfig.friend2Name}</span>
              </div>
            </motion.div>

            <motion.button
              className="btn btn-primary birthday-start-btn"
              onClick={handleStart}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Birthday Match!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function hasSeenBirthdayCard(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function markBirthdayCardSeen(): void {
  localStorage.setItem(STORAGE_KEY, 'true');
}
