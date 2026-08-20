import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'phase10_tutorial_completed';

export interface TutorialStep {
  id: string;
  title: string;
  message: string;
  spotlight: string | null;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Phase 10!',
    message: 'Your objective is to complete 10 specific card combinations (Phases) across 10 rounds before your opponents. First player to finish Phase 10 wins!',
    spotlight: null,
  },
  {
    id: 'turns',
    title: 'Turn Structure',
    message: 'Every turn follows 3 steps: 1. Draw a card from the Draw Pile or Discard Pile. 2. Lay down your Phase if ready. 3. Discard one card to end your turn.',
    spotlight: 'draw-pile',
  },
  {
    id: 'phases',
    title: 'Phases & Sets',
    message: 'Phase 1 requires 2 sets of 3 cards of the same number. Select matching cards from your hand and click "Lay Down" to place them on the board.',
    spotlight: 'phase-tracker',
  },
  {
    id: 'specials',
    title: 'Special Cards',
    message: 'Wild cards (W) can replace any number or color in a Phase. Skip cards (S) force another player to lose their turn — play them when you discard!',
    spotlight: null,
  },
  {
    id: 'reorder',
    title: 'Hand Organization',
    message: 'Drag cards horizontally to reorder your hand, or tap two cards to swap their positions. You have full control over your card arrangement.',
    spotlight: 'player-hand',
  },
  {
    id: 'winning',
    title: 'Going Out & Winning',
    message: 'After laying down your Phase, clear the remaining cards in your hand by hitting on existing melds or discarding. First to complete Phase 10 wins!',
    spotlight: 'discard-pile',
  },
];

export function useTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    if (!hasSeenTutorial) {
      const t = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, [hasSeenTutorial]);

  const complete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setHasSeenTutorial(true);
    setIsOpen(false);
    setCurrentStep(0);
  }, []);

  const skip = useCallback(() => {
    complete();
  }, [complete]);

  const open = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  const next = useCallback(() => {
    setCurrentStep(prev => {
      if (prev >= TUTORIAL_STEPS.length - 1) {
        complete();
        return prev;
      }
      return prev + 1;
    });
  }, [complete]);

  const prev = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const step = TUTORIAL_STEPS[currentStep];

  return {
    isOpen,
    currentStep,
    totalSteps: TUTORIAL_STEPS.length,
    step,
    hasSeenTutorial,
    complete,
    skip,
    open,
    next,
    prev,
  };
}
