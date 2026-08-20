import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TUTORIAL_STEPS } from './useTutorial';

interface TutorialModalProps {
  isOpen: boolean;
  currentStep: number;
  totalSteps: number;
  step: (typeof TUTORIAL_STEPS)[number];
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

const springModal = { type: 'spring' as const, stiffness: 300, damping: 25 };

export function TutorialModal({
  isOpen,
  currentStep,
  totalSteps,
  step,
  onNext,
  onPrev,
  onSkip,
}: TutorialModalProps) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="tutorial-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="tutorial-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onSkip}
          />

          <motion.div
            className="tutorial-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={springModal}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="tutorial-skip" onClick={onSkip}>
              Skip Tutorial
            </button>

            <div className="tutorial-progress">
              {TUTORIAL_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`tutorial-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'done' : ''}`}
                />
              ))}
            </div>

            <div className="tutorial-step-badge">
              Step {currentStep + 1} of {totalSteps}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                className="tutorial-content"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="tutorial-title">{step.title}</h2>
                <p className="tutorial-message">{step.message}</p>

                {step.id === 'specials' && (
                  <div className="tutorial-card-demo">
                    <div className="demo-card demo-wild">
                      <div className="demo-card-inner">
                        <span className="demo-letter">W</span>
                        <span className="demo-label">WILD</span>
                      </div>
                    </div>
                    <div className="demo-card demo-skip">
                      <div className="demo-card-inner">
                        <span className="demo-letter">S</span>
                        <span className="demo-label">SKIP</span>
                      </div>
                    </div>
                  </div>
                )}

                {step.id === 'turns' && (
                  <div className="tutorial-flow">
                    <span className="flow-step">Draw</span>
                    <span className="flow-arrow">→</span>
                    <span className="flow-step">Meld</span>
                    <span className="flow-arrow">→</span>
                    <span className="flow-step">Discard</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="tutorial-nav">
              <button
                className="btn btn-secondary tutorial-btn"
                onClick={onPrev}
                disabled={isFirst}
              >
                Back
              </button>
              <button
                className="btn btn-primary tutorial-btn"
                onClick={onNext}
              >
                {isLast ? 'Get Started' : 'Next'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
