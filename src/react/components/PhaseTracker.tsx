import React from 'react';
import { PHASES } from '../../engine/constants';

interface PhaseTrackerProps {
  currentPhase: number;
  completedPhase: boolean;
  score: number;
  isCurrentPlayer: boolean;
  compact?: boolean;
}

export function PhaseTracker({ currentPhase, completedPhase, score, isCurrentPlayer, compact }: PhaseTrackerProps) {
  const phase = PHASES[currentPhase - 1];

  if (compact) {
    return (
      <div className={`phase-tracker phase-tracker-compact ${isCurrentPlayer ? 'phase-tracker-active' : ''}`}>
        <span className="phase-number">Phase {currentPhase}</span>
        {completedPhase && <span className="phase-complete-badge">✓</span>}
      </div>
    );
  }

  return (
    <div className={`phase-tracker ${isCurrentPlayer ? 'phase-tracker-active' : ''}`}>
      <div className="phase-info">
        <span className="phase-number">Phase {currentPhase}</span>
        <span className="phase-name">{phase?.name ?? 'Complete!'}</span>
      </div>
      <div className="phase-requirements">
        {phase?.requirements.map((req, i) => (
          <span key={i} className="phase-req">
            {req.type === 'set' && `${req.count} of a kind`}
            {req.type === 'run' && `Run of ${req.count}`}
            {req.type === 'color' && `${req.count} same color`}
          </span>
        ))}
      </div>
      {completedPhase && <div className="phase-complete-badge">✓ Done</div>}
      <div className="phase-score">Score: {score}</div>
    </div>
  );
}
