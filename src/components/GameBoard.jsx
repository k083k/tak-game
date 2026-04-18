import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScoreCalculator } from '../services/ScoreCalculator';
import { OpponentPanel } from './OpponentPanel';
import { PlayerPanel } from './PlayerPanel';
import { CenterTable } from './CenterTable';
import { RoundResultsView } from './RoundResultsView';
import { ExitConfirmModal } from './ExitConfirmModal';
import { PauseMenu } from './PauseMenu';
import { KnockAnnouncement } from './KnockAnnouncement';

export const GameBoard = ({
  gameEngine,
  selectedCardIndex,
  setSelectedCardIndex,
  hasDrawn,
  knockCountdown,
  onDrawCard,
  onDiscardCard,
  onKnock,
  onPassKnock,
  canKnockAfterDiscard = false,
  onReorderHand,
  onExit,
  onNextRound,
  gameMode,
  difficulty,
  showRoundResults = false,
  onShowHowToPlay,
  myPlayerIndex = 0,
  isOnline = false,
  isMyTurn = true,
  externalIsPaused = false,
  canResumePause = true,
  onPauseGame = null,
  onResumeGame = null,
}) => {
  const [showExitModal, setShowExitModal] = useState(false);
  const [localIsPaused, setLocalIsPaused] = useState(false);
  const [knockAnnouncement, setKnockAnnouncement] = useState(null); // { name }
  const isPaused = isOnline ? externalIsPaused : localIsPaused;
  const [cardToMove, setCardToMove] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  const prevKnockedRef = useRef(null);
  useEffect(() => {
    if (!gameEngine) return;
    const ki = gameEngine.knockedPlayerIndex;
    if (ki !== null && prevKnockedRef.current === null) {
      const knockerName = ki === myPlayerIndex ? myPlayer.name : opponentPlayer.name;
      setKnockAnnouncement({ name: knockerName });
    }
    prevKnockedRef.current = ki;
  }, [gameEngine?.knockedPlayerIndex]);

  const handleKnock = () => {
    onKnock();
  };

  const handlePause = isOnline && onPauseGame ? onPauseGame : () => setLocalIsPaused(true);
  const handleResume = isOnline && onResumeGame ? onResumeGame : () => setLocalIsPaused(false);

  const effectiveCardToMove = hasDrawn ? null : cardToMove;

  if (!gameEngine) return null;

  const myPlayer = myPlayerIndex === 0 ? gameEngine.player1 : gameEngine.player2;
  const opponentPlayer = myPlayerIndex === 0 ? gameEngine.player2 : gameEngine.player1;
  const wildRank = gameEngine.getWildRank();
  const isPlayerTurn = gameEngine.currentPlayerIndex === myPlayerIndex;
  const topDiscard = gameEngine.peekDiscard();
  const secondDiscard = gameEngine.discardPile.length >= 2
    ? gameEngine.discardPile[gameEngine.discardPile.length - 2]
    : null;
  const hasKnocked = gameEngine.knockedPlayerIndex !== null;
  const deckHasCards = gameEngine.deck.hasCards();
  const playerScore = ScoreCalculator.calculateScore(myPlayer.getHand(), wildRank).score;

  const myTurnActive = isOnline ? isMyTurn : isPlayerTurn;
  const canDraw = myTurnActive && isPlayerTurn && !hasDrawn && !gameEngine.isRoundOver() && !isPaused;
  const canDrawFromDeck = canDraw && deckHasCards;
  const canDrawFromDiscard = canDraw && topDiscard !== null;

  // Knock requires score of 0
  const canKnock = myTurnActive && isPlayerTurn && !hasKnocked && !gameEngine.isRoundOver()
    && canKnockAfterDiscard && !isPaused;

  const handleCardClick = (index) => {
    if (gameEngine.isRoundOver() || !isPlayerTurn || !myTurnActive || isPaused) return;
    if (hasDrawn) { setSelectedCardIndex(index); return; }
    if (effectiveCardToMove === null) { setCardToMove(index); }
    else if (effectiveCardToMove === index) { setCardToMove(null); }
    else { onReorderHand(effectiveCardToMove, index); setCardToMove(null); }
  };

  const handleCardDoubleClick = (index) => {
    if (gameEngine.isRoundOver() || !isPlayerTurn || !myTurnActive || isPaused) return;
    if (hasDrawn) onDiscardCard(index);
  };

  const handleDiscardClick = () => {
    if (selectedCardIndex !== null && hasDrawn && !isPaused) onDiscardCard(selectedCardIndex);
  };

  const getWildDisplay = () => {
    const ranks = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
    return ranks[wildRank] || wildRank.toString();
  };

  const getTurnMessage = () => {
    if (gameEngine.isRoundOver()) return 'Round ending...';
    if (!isPlayerTurn) {
      if (gameMode === 'pvc') return 'Computer playing...';
      if (isOnline) return `${opponentPlayer.name}'s turn`;
      return "Opponent's turn";
    }
    if (isOnline && !isMyTurn) return 'Waiting for opponent...';
    if (hasDrawn) return 'Select card to discard';
    if (hasKnocked && gameEngine.knockedPlayerIndex === myPlayerIndex) return 'Final turn!';
    return 'Draw a card';
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex flex-col">

      {/* Opponent band — top */}
      <OpponentPanel
        player={opponentPlayer}
        wildRank={wildRank}
        gameMode={gameMode}
        showRoundResults={showRoundResults}
        isOpponentTurn={!isPlayerTurn}
      />

      {/* Top bar */}
      <div className="shrink-0 px-4 py-2 bg-black/25 border-b border-white/[0.06] flex items-center justify-between">
        <div className="text-white/20 font-black text-sm tracking-widest uppercase select-none">TAC</div>

        <div className="text-white/80 text-sm font-medium tracking-wide text-center">
          Round <span className="font-bold text-white">{gameEngine.currentRound}</span>
          <span className="mx-2 text-white/20">·</span>
          Wild <span className="text-orange-400 font-black">{getWildDisplay()}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onShowHowToPlay}
            className="h-7 w-7 rounded-lg bg-white/8 hover:bg-white/15 border border-white/10 hover:border-white/25 flex items-center justify-center text-white/45 hover:text-white/80 transition-all text-sm font-bold"
            title="How to Play"
          >?</motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handlePause}
            className="h-7 w-7 rounded-lg bg-white/8 hover:bg-white/15 border border-white/10 hover:border-white/25 flex items-center justify-center text-white/45 hover:text-white/80 transition-all text-sm"
            title="Pause"
          >⏸</motion.button>
          <div className="w-px h-4 bg-white/12" />
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowExitModal(true)}
            className="h-7 px-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 flex items-center gap-1 text-red-400/60 hover:text-red-400 transition-all text-xs font-semibold tracking-wide"
          >
            <span>✕</span><span>EXIT</span>
          </motion.button>
        </div>
      </div>

      {/* Main game area */}
      <div className="flex-1 flex flex-col justify-center px-4 py-2 md:py-4 min-h-0">
        {showRoundResults ? (
          <RoundResultsView
            player1={myPlayer}
            player2={opponentPlayer}
            wildRank={wildRank}
            currentRound={gameEngine.currentRound}
            hasKnocked={hasKnocked}
            knockedPlayerIndex={
              gameEngine.knockedPlayerIndex === null ? null
                : gameEngine.knockedPlayerIndex === myPlayerIndex ? 0 : 1
            }
            onNextRound={onNextRound}
          />
        ) : (
          <CenterTable
            topDiscard={topDiscard}
            secondDiscard={secondDiscard}
            wildRank={wildRank}
            deckCardCount={gameEngine.deck.getCardCount()}
            deckHasCards={deckHasCards}
            canDrawFromDeck={canDrawFromDeck}
            canDrawFromDiscard={canDrawFromDiscard}
            hasDrawn={hasDrawn}
            selectedCardIndex={selectedCardIndex}
            knockCountdown={knockCountdown}
            playerScore={playerScore}
            isPlayerTurn={isPlayerTurn}
            hasKnocked={hasKnocked}
            turnMessage={getTurnMessage()}
            onDrawCard={onDrawCard}
            onDiscardClick={handleDiscardClick}
            isOnline={isOnline}
          />
        )}
      </div>

      {/* Player band — bottom */}
      <PlayerPanel
        player={myPlayer}
        wildRank={wildRank}
        hasDrawn={hasDrawn}
        selectedCardIndex={selectedCardIndex}
        cardToMove={effectiveCardToMove}
        draggedCard={draggedCard}
        setDraggedCard={setDraggedCard}
        dropTarget={dropTarget}
        setDropTarget={setDropTarget}
        isPlayerTurn={isPlayerTurn}
        isPaused={isPaused}
        isRoundOver={gameEngine.isRoundOver()}
        difficulty={difficulty}
        playerScore={playerScore}
        canKnock={canKnock}
        canKnockAfterDiscard={canKnockAfterDiscard}
        knockCountdown={knockCountdown}
        onCardClick={handleCardClick}
        onCardDoubleClick={handleCardDoubleClick}
        onReorderHand={onReorderHand}
        onKnock={handleKnock}
        onPassKnock={onPassKnock}
      />

      <KnockAnnouncement
        knockerName={knockAnnouncement?.name}
        isVisible={knockAnnouncement !== null}
        onDone={() => setKnockAnnouncement(null)}
      />

      <AnimatePresence>
        {isPaused && (
          <PauseMenu
            onResume={handleResume}
            onExit={() => { handleResume(); setShowExitModal(true); }}
            canResume={isOnline ? canResumePause : true}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExitModal && (
          <ExitConfirmModal
            onConfirm={() => { setShowExitModal(false); onExit(); }}
            onCancel={() => setShowExitModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
