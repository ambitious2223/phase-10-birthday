import React from 'react';
import type { Player, GameAction } from '../../engine/types';
import { PlayerBadge } from './board/PlayerBadge';
import { BotDialogue } from '../birthday/BotDialogue';

interface OpponentsAreaProps {
  players: Player[];
  activePlayerIdx: number;
  skippedPlayerIds?: string[];
  lastAction: GameAction | null;
}

export function OpponentsArea({ players, activePlayerIdx, skippedPlayerIds = [], lastAction }: OpponentsAreaProps) {
  const bots = players.filter(p => p.type === 'bot');

  const getPosition = (index: number): 'top-left' | 'top-right' => {
    if (bots.length === 1) return 'top-left';
    return index === 0 ? 'top-left' : 'top-right';
  };

  return (
    <>
      {bots.map((player, idx) => {
        const pIdx = players.indexOf(player);
        const isActiveBot = pIdx === activePlayerIdx;
        const isSkipped = skippedPlayerIds.includes(player.id);

        return (
          <React.Fragment key={player.id}>
            <PlayerBadge
              player={player}
              isActive={isActiveBot}
              isSkipped={isSkipped}
              position={getPosition(idx)}
            />
            <BotDialogue
              lastAction={lastAction}
              playerName={player.name}
            />
          </React.Fragment>
        );
      })}
    </>
  );
}
