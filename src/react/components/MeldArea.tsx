import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Meld, Player } from '../../engine/types';
import { CardComponent } from './CardComponent';

interface MeldAreaProps {
  players: Player[];
  humanPlayerId: string;
  hitMode?: boolean;
  onMeldClick?: (meldId: string) => void;
}

const springMeld = { type: 'spring' as const, stiffness: 260, damping: 20 };

export function MeldArea({ players, humanPlayerId, hitMode, onMeldClick }: MeldAreaProps) {
  const humanPlayer = players.find(p => p.id === humanPlayerId);
  const otherPlayers = players.filter(p => p.id !== humanPlayerId);

  return (
    <div className="meld-area">
      <AnimatePresence>
        {humanPlayer && humanPlayer.melds.length > 0 && (
          <motion.div
            className="meld-section meld-section-human"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="meld-section-label">Your Melds</div>
            <div className="melds-row">
              {humanPlayer.melds.map((meld, meldIdx) => (
                <MeldGroup
                  key={meld.id}
                  meld={meld}
                  hitMode={hitMode}
                  onClick={() => onMeldClick?.(meld.id)}
                  index={meldIdx}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {otherPlayers.map(player =>
          player.melds.length > 0 ? (
            <motion.div
              key={player.id}
              className="meld-section meld-section-opponent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="meld-section-label">{player.name}'s Melds</div>
              <div className="melds-row">
                {player.melds.map((meld, meldIdx) => (
                  <MeldGroup
                    key={meld.id}
                    meld={meld}
                    hitMode={hitMode}
                    onClick={() => onMeldClick?.(meld.id)}
                    index={meldIdx}
                  />
                ))}
              </div>
            </motion.div>
          ) : null
        )}
      </AnimatePresence>
    </div>
  );
}

function MeldGroup({ meld, hitMode, onClick, index }: { meld: Meld; hitMode?: boolean; onClick?: () => void; index: number }) {
  return (
    <motion.div
      className={`meld-group meld-${meld.type} ${hitMode ? 'meld-hit-target' : ''}`}
      onClick={hitMode ? onClick : undefined}
      initial={{ opacity: 0, scale: 0.7, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.08, ...springMeld }}
      whileHover={hitMode ? { scale: 1.05, boxShadow: '0 0 16px rgba(251,191,36,0.4)' } : { scale: 1.02 }}
    >
      <div className="meld-label">
        {meld.type === 'set' && 'Set'}
        {meld.type === 'run' && 'Run'}
        {meld.type === 'color' && 'Color'}
      </div>
      <div className="meld-cards">
        <AnimatePresence>
          {meld.cards.map((card, cardIdx) => (
            <motion.div
              key={card.id}
              layoutId={`card-${card.id}`}
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: cardIdx * 0.06, ...springMeld }}
            >
              <CardComponent card={card} small />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
