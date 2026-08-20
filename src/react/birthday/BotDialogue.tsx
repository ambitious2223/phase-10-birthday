import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { birthdayConfig } from './birthdayConfig';
import type { GameAction } from '../../engine/types';

interface BotDialogueProps {
  lastAction: GameAction | null;
  playerName: string;
}

type QuipCategory = 'draw' | 'discard' | 'skip' | 'hit' | 'win';

function getQuipCategory(action: GameAction): QuipCategory | null {
  switch (action.type) {
    case 'DRAW_CARD':
    case 'DRAW_FROM_DISCARD':
      return 'draw';
    case 'DISCARD':
      return 'discard';
    case 'USE_SKIP':
      return 'skip';
    case 'HIT':
      return 'hit';
    case 'MELD':
      return 'win';
    default:
      return null;
  }
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const VOICE_PITCH: Record<string, number> = {
  Christopher: 1.2,
  Ahmad: 0.75,
};

function speak(text: string, playerName: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.pitch = VOICE_PITCH[playerName] ?? 1;
  utter.rate = 1.1;
  utter.volume = 0.7;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.lang.startsWith('en'));
  if (preferred) utter.voice = preferred;
  window.speechSynthesis.speak(utter);
}

export function BotDialogue({ lastAction, playerName }: BotDialogueProps) {
  const [quip, setQuip] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!lastAction) return;

    const category = getQuipCategory(lastAction);
    if (!category) return;

    const quips = birthdayConfig.botQuips[category];
    const chosen = pickRandom(quips);
    setQuip(chosen);
    setKey(k => k + 1);
    speak(chosen, playerName);

    const t = setTimeout(() => setQuip(null), 3000);
    return () => clearTimeout(t);
  }, [lastAction, playerName]);

  return (
    <div className="bot-dialogue-container">
      <AnimatePresence>
        {quip && (
          <motion.div
            key={key}
            className="bot-speech-bubble"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <span className="bubble-name">{playerName}</span>
            <span className="bubble-text">{quip}</span>
            <div className="bubble-tail" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
