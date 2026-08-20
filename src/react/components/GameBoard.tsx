import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Card } from '../../engine/types';
import { useGame } from '../context/GameContext';
import { PlayerHand } from './PlayerHand';
import { GameControls } from './GameControls';
import { Scoreboard } from './Scoreboard';
import { OpponentsArea } from './OpponentsArea';
import { GameLog } from './GameLog';
import { CenterPlayMat } from './board/CenterPlayMat';
import { PlayerBadge } from './board/PlayerBadge';
import { SkipTargetPicker } from '../../components/effects/SkipOverlay';
import { PHASES } from '../../engine/constants';
import { fireWinConfetti, fireMeldComplete, fireBirthdayBurst } from '../utils/confetti';
import { useTutorial } from '../tutorial/useTutorial';
import { TutorialModal } from '../tutorial/TutorialModal';
import { BirthdayModal, hasSeenBirthdayCard, markBirthdayCardSeen } from '../birthday/BirthdayModal';
import { getEligibleSkipTargets } from '../../utils/specialCardRules';
import { playCardDraw, playCardDiscard, playPhaseLay, playSkipSlam } from '../utils/soundEffects';

export function GameBoard() {
  const { state, dispatch, isHumanTurn } = useGame();
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [hitMode, setHitMode] = useState(false);
  const [phaseSlotA, setPhaseSlotA] = useState<string[]>([]);
  const [phaseSlotB, setPhaseSlotB] = useState<string[]>([]);
  const [showSkipPicker, setShowSkipPicker] = useState(false);
  const [pendingSkipCardId, setPendingSkipCardId] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const prevRoundOver = useRef(state.roundOver);
  const prevPhase = useRef<number | null>(null);
  const playerTrayRef = useRef<HTMLDivElement>(null);
  const tutorial = useTutorial();
  const [birthdayOpen, setBirthdayOpen] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [zooming, setZooming] = useState(false);

  const humanPlayer = state.players.find(p => p.type === 'human');
  const currentPlayer = state.players[state.currentPlayerIndex];
  const isMyTurn = currentPlayer?.type === 'human';

  useEffect(() => {
    if (!hasSeenBirthdayCard()) {
      const t = setTimeout(() => setBirthdayOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [state.gameLog]);

  useEffect(() => {
    setSelectedCards(new Set());
    setHitMode(false);
    setPhaseSlotA([]);
    setPhaseSlotB([]);
  }, [state.currentPlayerIndex, state.turnPhase]);

  useEffect(() => {
    if (state.roundOver && !prevRoundOver.current) {
      const kimberlyWon = state.players.find(p => p.id === humanPlayer?.id && p.hand.length === 0);
      if (kimberlyWon) {
        fireBirthdayBurst();
      } else {
        fireWinConfetti();
      }
    }
    prevRoundOver.current = state.roundOver;
  }, [state.roundOver, humanPlayer?.id]);

  useEffect(() => {
    if (humanPlayer && prevPhase.current !== null && humanPlayer.currentPhase > prevPhase.current) {
      fireMeldComplete();
    }
    if (humanPlayer) {
      prevPhase.current = humanPlayer.currentPhase;
    }
  }, [humanPlayer?.currentPhase]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (hitMode) setHitMode(false);
        else setSelectedCards(new Set());
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [hitMode]);

  const handleCardClick = useCallback((card: Card) => {
    if (!isMyTurn) return;
    setSelectedCards(prev => {
      const next = new Set(prev);
      if (next.has(card.id)) next.delete(card.id);
      else next.add(card.id);
      return next;
    });
  }, [isMyTurn]);

  const handleReorder = useCallback((cardIds: string[]) => {
    if (!humanPlayer) return;
    dispatch({ type: 'REORDER_HAND', playerId: humanPlayer.id, cardIds });
  }, [dispatch, humanPlayer]);

  const handleAddToSlot = useCallback((slot: 'A' | 'B', cardId: string) => {
    if (slot === 'A') setPhaseSlotA(prev => prev.includes(cardId) ? prev : [...prev, cardId]);
    else setPhaseSlotB(prev => prev.includes(cardId) ? prev : [...prev, cardId]);
    setSelectedCards(prev => { const next = new Set(prev); next.delete(cardId); return next; });
  }, []);

  const handleRemoveFromSlot = useCallback((slot: 'A' | 'B', cardId: string) => {
    if (slot === 'A') setPhaseSlotA(prev => prev.filter(id => id !== cardId));
    else setPhaseSlotB(prev => prev.filter(id => id !== cardId));
  }, []);

  const handleClearSlots = useCallback(() => { setPhaseSlotA([]); setPhaseSlotB([]); }, []);

  const handleDraw = useCallback(() => {
    if (!humanPlayer) return;
    playCardDraw();
    dispatch({ type: 'DRAW_CARD', playerId: humanPlayer.id });
  }, [dispatch, humanPlayer]);

  const handleDrawFromDiscard = useCallback(() => {
    if (!humanPlayer) return;
    playCardDraw();
    dispatch({ type: 'DRAW_FROM_DISCARD', playerId: humanPlayer.id });
  }, [dispatch, humanPlayer]);

  const handleMeld = useCallback(() => {
    if (!humanPlayer) return;

    const slotACards = humanPlayer.hand.filter(c => phaseSlotA.includes(c.id));
    const slotBCards = humanPlayer.hand.filter(c => phaseSlotB.includes(c.id));

    if (slotACards.length > 0 || slotBCards.length > 0) {
      const allSlotCards = [...slotACards, ...slotBCards];
      const phaseReq = PHASES[humanPlayer.currentPhase - 1];

      if (phaseReq && phaseReq.requirements.length === 2 && slotACards.length > 0 && slotBCards.length > 0) {
        playPhaseLay();
        setZooming(true);
        setTimeout(() => setZooming(false), 1200);
        dispatch({
          type: 'MELD',
          playerId: humanPlayer.id,
          melds: [
            { id: 'pending', type: phaseReq.requirements[0].type === 'color' ? 'color' : phaseReq.requirements[0].type, cards: slotACards, ownerId: humanPlayer.id },
            { id: 'pending', type: phaseReq.requirements[1].type === 'color' ? 'color' : phaseReq.requirements[1].type, cards: slotBCards, ownerId: humanPlayer.id },
          ],
        });
      } else {
        dispatch({
          type: 'MELD',
          playerId: humanPlayer.id,
          melds: allSlotCards.map(c => ({
            id: 'pending',
            type: 'set' as const,
            cards: [c],
            ownerId: humanPlayer.id,
          })),
        });
      }

      setPhaseSlotA([]);
      setPhaseSlotB([]);
      setSelectedCards(new Set());
      return;
    }

    const selectedCardObjects = humanPlayer.hand.filter(c => selectedCards.has(c.id));
    if (selectedCardObjects.length === 0) return;
    dispatch({
      type: 'MELD',
      playerId: humanPlayer.id,
      melds: selectedCardObjects.map(c => ({
        id: 'pending',
        type: 'set' as const,
        cards: [c],
        ownerId: humanPlayer.id,
      })),
    });
    setSelectedCards(new Set());
  }, [dispatch, humanPlayer, selectedCards, phaseSlotA, phaseSlotB]);

  const handleHit = useCallback((meldId: string) => {
    if (!humanPlayer) return;
    const selectedCardObjects = humanPlayer.hand.filter(c => selectedCards.has(c.id));
    if (selectedCardObjects.length === 0) return;
    dispatch({
      type: 'HIT',
      playerId: humanPlayer.id,
      meldId,
      cards: selectedCardObjects,
    });
    setSelectedCards(new Set());
    setHitMode(false);
  }, [dispatch, humanPlayer, selectedCards]);

  const handleDiscard = useCallback(() => {
    if (!humanPlayer) return;
    const selectedCardObjects = humanPlayer.hand.filter(c => selectedCards.has(c.id));
    if (selectedCardObjects.length !== 1) return;
    playCardDiscard();
    dispatch({
      type: 'DISCARD',
      playerId: humanPlayer.id,
      card: selectedCardObjects[0],
    });
    setSelectedCards(new Set());
  }, [dispatch, humanPlayer, selectedCards]);

  const handleSkip = useCallback(() => {
    if (!humanPlayer) return;
    const skipCard = humanPlayer.hand.find(c => c.type === 'skip' && selectedCards.has(c.id));
    if (!skipCard) return;
    const eligibleTargets = getEligibleSkipTargets(humanPlayer.id, state.players, state.skippedPlayerIds);
    if (eligibleTargets.length === 0) return;
    if (eligibleTargets.length === 1) {
      playSkipSlam();
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      dispatch({
        type: 'USE_SKIP',
        playerId: humanPlayer.id,
        targetId: eligibleTargets[0].id,
        cards: [skipCard],
      });
      setSelectedCards(new Set());
      return;
    }
    setPendingSkipCardId(skipCard.id);
    setShowSkipPicker(true);
  }, [dispatch, humanPlayer, state.players, state.skippedPlayerIds, selectedCards]);

  const handleMeldAreaClick = useCallback((meldId: string) => {
    if (hitMode) handleHit(meldId);
  }, [hitMode, handleHit]);

  const handleSkipTargetSelect = useCallback((targetId: string) => {
    if (!humanPlayer || !pendingSkipCardId) return;
    const skipCard = humanPlayer.hand.find(c => c.id === pendingSkipCardId);
    if (!skipCard) return;
    playSkipSlam();
    dispatch({
      type: 'USE_SKIP',
      playerId: humanPlayer.id,
      targetId,
      cards: [skipCard],
    });
    setSelectedCards(new Set());
    setShowSkipPicker(false);
    setPendingSkipCardId(null);
  }, [dispatch, humanPlayer, pendingSkipCardId]);

  const handleSkipPickerCancel = useCallback(() => {
    setShowSkipPicker(false);
    setPendingSkipCardId(null);
  }, []);

  const canMeld = isMyTurn && state.turnPhase === 'meld' && humanPlayer && !humanPlayer.completedPhaseThisRound;
  const canDiscard = isMyTurn && (state.turnPhase === 'meld' || state.turnPhase === 'hit');
  const canHit = isMyTurn && (state.turnPhase === 'hit' || state.turnPhase === 'meld') && humanPlayer?.completedPhaseThisRound;

  const turnLabel = isMyTurn
    ? state.turnPhase === 'draw'
      ? 'Your Turn — Draw or Meld'
      : state.turnPhase === 'meld'
      ? 'Your Turn — Meld or Discard'
      : 'Your Turn — Hit or Discard'
    : `${currentPlayer?.name ?? ''}'s Turn`;

  const phaseReq = humanPlayer ? PHASES[humanPlayer.currentPhase - 1] : null;
  const isSkipped = state.skippedPlayerIds.includes(humanPlayer?.id ?? '');
  const reqLabel = (r: { type: string; count: number }) =>
    r.type === 'set' ? `${r.count} of a kind` : r.type === 'run' ? `Run of ${r.count}` : `${r.count} same color`;

  if (state.players.length === 0) return null;

  return (
    <div className={`game-board table-tilt ${shaking ? 'shake' : ''} ${zooming ? 'cinematic-zoom' : ''}`}>
      <AnimatePresence>
        {state.roundOver && (
          <Scoreboard
            players={state.players}
            onNewRound={() => dispatch({ type: 'NEW_ROUND' })}
            gameWinner={state.players.find(p => p.currentPhase > 10)?.id ?? null}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="game-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1>Phase 10</h1>
        <motion.div className="round-info" key={state.round} initial={{ scale: 1.2 }} animate={{ scale: 1 }}>
          Round {state.round}
        </motion.div>
        <motion.div
          className={`turn-info ${isMyTurn ? 'turn-info-active' : ''}`}
          key={`${currentPlayer?.id}-${state.turnPhase}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {turnLabel}
        </motion.div>
        <button className="tutorial-help-btn" onClick={tutorial.open} title="How to Play">?</button>
        <button className="birthday-cake-btn" onClick={() => { markBirthdayCardSeen(); setBirthdayOpen(true); }} title="Birthday Card">
          🎂
        </button>
      </motion.div>
      <OpponentsArea
        players={state.players}
        activePlayerIdx={state.currentPlayerIndex}
        skippedPlayerIds={state.skippedPlayerIds}
        lastAction={state.lastAction}
      />
      <CenterPlayMat
        drawPile={state.drawPile}
        discardPile={state.discardPile}
        canDraw={isMyTurn && state.turnPhase === 'draw'}
        canDrawFromDiscard={isMyTurn && state.turnPhase === 'draw' && state.discardPile.length > 0 && state.discardPile[state.discardPile.length - 1].type !== 'skip'}
        onDraw={handleDraw}
        onDrawFromDiscard={handleDrawFromDiscard}
        players={state.players}
        humanPlayerId={humanPlayer?.id ?? ''}
        hitMode={hitMode}
        onMeldClick={handleMeldAreaClick}
        showPhaseSlots={isMyTurn && !humanPlayer?.completedPhaseThisRound && !!phaseReq}
        phaseLabelA={phaseReq ? `Phase Slot 1: ${reqLabel(phaseReq.requirements[0])}` : ''}
        phaseLabelB={phaseReq?.requirements[1] ? `Phase Slot 2: ${reqLabel(phaseReq.requirements[1])}` : ''}
        phaseSlotA={phaseSlotA}
        phaseSlotB={phaseSlotB}
        humanHand={humanPlayer?.hand ?? []}
        phaseRequirements={phaseReq?.requirements ?? []}
        onRemoveSlotA={(id) => handleRemoveFromSlot('A', id)}
        onRemoveSlotB={(id) => handleRemoveFromSlot('B', id)}
        onDropSlotA={(id) => handleAddToSlot('A', id)}
        onDropSlotB={(id) => handleAddToSlot('B', id)}
        onClearSlots={handleClearSlots}
        hasSlotContent={phaseSlotA.length > 0 || phaseSlotB.length > 0}
      />
      {isMyTurn && (
        <div className="action-bar" ref={playerTrayRef}>
          <GameControls
            turnPhase={state.turnPhase}
            canMeld={!!canMeld}
            canDiscard={!!canDiscard}
            canHit={!!canHit}
            selectedCards={Array.from(selectedCards)}
            playerPhase={humanPlayer?.currentPhase ?? 1}
            hasSkipCard={!!humanPlayer?.hand.some(c => c.type === 'skip' && selectedCards.has(c.id))}
            onDraw={handleDraw}
            onDrawFromDiscard={handleDrawFromDiscard}
            onMeld={handleMeld}
            onHit={() => setHitMode(true)}
            onDiscard={handleDiscard}
            onSkip={handleSkip}
            onEndTurn={() => {}}
          />
        </div>
      )}
      {humanPlayer && (
        <PlayerHand
          cards={humanPlayer.hand}
          selectedCards={selectedCards}
          onCardClick={handleCardClick}
          onReorder={handleReorder}
          isActive={isMyTurn}
          tutorialTarget="player-hand"
        />
      )}
      {humanPlayer && (
        <PlayerBadge player={humanPlayer} isActive={isMyTurn} isSkipped={isSkipped} position="bottom-left" />
      )}
      <GameLog ref={logRef} messages={state.gameLog} round={state.round} />
      <TutorialModal
        isOpen={tutorial.isOpen}
        currentStep={tutorial.currentStep}
        totalSteps={tutorial.totalSteps}
        step={tutorial.step}
        onNext={tutorial.next}
        onPrev={tutorial.prev}
        onSkip={tutorial.skip}
      />
      <BirthdayModal isOpen={birthdayOpen} onClose={() => { markBirthdayCardSeen(); setBirthdayOpen(false); }} />
      <AnimatePresence>
        {showSkipPicker && humanPlayer && (
          <SkipTargetPicker
            eligibleTargets={getEligibleSkipTargets(humanPlayer.id, state.players, state.skippedPlayerIds)}
            onSelect={handleSkipTargetSelect}
            onCancel={handleSkipPickerCancel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
