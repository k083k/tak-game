import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScoreCalculator } from '../services/ScoreCalculator';
import { OpponentPanel } from './OpponentPanel';
import { PlayerPanel } from './PlayerPanel';
import { CenterTable } from './CenterTable';
import { RoundResultsView } from './RoundResultsView';
import { ExitConfirmModal } from './ExitConfirmModal';
import { PauseMenu } from './PauseMenu';

export const GameBoard = ({
  gameEngine,
  selectedCardIndex,
  setSelectedCardIndex,
  hasDrawn,
  knockCountdown,
  onDrawCard,
  onDiscardCard,
  onKnock,
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
}) => {
  const [showExitModal, setShowExitModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cardToMove, setCardToMove] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  // When drawing, clear any pending card move selection
  const effectiveCardToMove = hasDrawn ? null : cardToMove;

  if (!gameEngine) return null;

  // myPlayerIndex: which engine seat is "me" (0 or 1). player1 = right panel (me), player2 = left panel (opponent).
  const myPlayer = myPlayerIndex === 0 ? gameEngine.player1 : gameEngine.player2;
  const opponentPlayer = myPlayerIndex === 0 ? gameEngine.player2 : gameEngine.player1;
  const player1 = myPlayer;
  const player2 = opponentPlayer;
  const wildRank = gameEngine.getWildRank();
  const isPlayerTurn = gameEngine.currentPlayerIndex === myPlayerIndex;
  const topDiscard = gameEngine.peekDiscard();
  const secondDiscard = gameEngine.discardPile.length >= 2
    ? gameEngine.discardPile[gameEngine.discardPile.length - 2]
    : null;
  const hasKnocked = gameEngine.knockedPlayerIndex !== null;
  const deckHasCards = gameEngine.deck.hasCards();
  const playerScore = ScoreCalculator.calculateScore(player1.getHand(), wildRank).score;

  const myTurnActive = isOnline ? isMyTurn : isPlayerTurn;
  const canDraw = myTurnActive && isPlayerTurn && !hasDrawn && !gameEngine.isRoundOver() && !isPaused;
  const canDrawFromDeck = canDraw && deckHasCards;
  const canDrawFromDiscard = canDraw && topDiscard !== null;
  const canKnock = myTurnActive && isPlayerTurn && !hasKnocked && !gameEngine.isRoundOver() && knockCountdown !== null && !isPaused;

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
      if (isOnline) return `${opponentPlayer.name}'s turn...`;
      return "Opponent's turn";
    }
    if (isOnline && !isMyTurn) return 'Waiting for opponent...';
    if (hasDrawn) return 'Select card to discard';
    if (hasKnocked && gameEngine.knockedPlayerIndex === myPlayerIndex) return 'Final turn!';
    return 'Draw a card';
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex flex-row">
      <OpponentPanel
        player={player2}
        wildRank={wildRank}
        gameMode={gameMode}
        showRoundResults={showRoundResults}
        isOpponentTurn={!isPlayerTurn}
      />

      {/* Center */}
      <div className="flex-1 flex flex-col">
        {/* Round Info Bar */}
        <div className="px-4 py-3 bg-black/20 border-b border-white/10 text-center relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-black text-sm tracking-widest uppercase select-none">
            TAC
          </div>
          <div className="text-white/90 text-sm font-medium tracking-wide">
            Round <span className="font-bold">{gameEngine.currentRound}</span> of 11
            <span className="mx-3 text-white/30">•</span>
            Wild <span className="text-orange-400 font-black">{getWildDisplay()}</span>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onShowHowToPlay}
              className="h-8 px-2.5 rounded-lg bg-white/8 hover:bg-white/15 border border-white/12 hover:border-white/25 flex items-center justify-center text-white/50 hover:text-white/90 transition-all text-sm font-bold"
              title="How to Play"
            >?</motion.button>
            {!isOnline && (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setIsPaused(true)}
                className="h-8 px-2.5 rounded-lg bg-white/8 hover:bg-white/15 border border-white/12 hover:border-white/25 flex items-center justify-center text-white/50 hover:text-white/90 transition-all text-sm"
                title="Pause"
              >⏸</motion.button>
            )}
            <div className="w-px h-5 bg-white/15" />
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowExitModal(true)}
              className="h-8 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 flex items-center gap-1.5 text-red-400/70 hover:text-red-400 transition-all text-xs font-semibold tracking-wide"
            >
              <span>✕</span><span>EXIT</span>
            </motion.button>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col justify-center p-2 md:p-6 relative">
          {showRoundResults ? (
            <RoundResultsView
              player1={player1}
              player2={player2}
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
            />
          )}
        </div>
      </div>

      <PlayerPanel
        player={player1}
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
        knockCountdown={knockCountdown}
        onCardClick={handleCardClick}
        onCardDoubleClick={handleCardDoubleClick}
        onReorderHand={onReorderHand}
        onKnock={onKnock}
      />

      <AnimatePresence>
        {isPaused && (
          <PauseMenu
            onResume={() => setIsPaused(false)}
            onExit={() => { setIsPaused(false); setShowExitModal(true); }}
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
