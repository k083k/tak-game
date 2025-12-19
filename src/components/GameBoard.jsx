import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ScoreCalculator } from '../services/ScoreCalculator';
import { ExitConfirmModal } from './ExitConfirmModal';
import { PauseMenu } from './PauseMenu';
import { HelpModal } from './HelpModal';
import { OpponentHand } from './GameBoard/OpponentHand';
import { PlayerHand } from './GameBoard/PlayerHand';
import { GameTable } from './GameBoard/GameTable';
import { RoundInfoBar } from './GameBoard/RoundInfoBar';
import { RoundResultsView } from './GameBoard/RoundResultsView';

/**
 * Main game board component - orchestrates all game UI elements
 */
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
  showRoundResults = false
}) => {
  const [showExitModal, setShowExitModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [cardToMove, setCardToMove] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  // Clear cardToMove when player draws a card
  useEffect(() => {
    if (hasDrawn && cardToMove !== null) {
      setCardToMove(null);
    }
  }, [hasDrawn, cardToMove]);

  if (!gameEngine) return null;

  const player1 = gameEngine.player1;
  const player2 = gameEngine.player2;
  const wildRank = gameEngine.getWildRank();
  const isPlayerTurn = gameEngine.currentPlayerIndex === 0;
  const topDiscard = gameEngine.peekDiscard();
  const secondDiscard = gameEngine.discardPile.length >= 2 ? gameEngine.discardPile[gameEngine.discardPile.length - 2] : null;
  const hasKnocked = gameEngine.knockedPlayerIndex !== null;
  const deckHasCards = gameEngine.deck.hasCards();

  const canDraw = isPlayerTurn && !hasDrawn && !gameEngine.isRoundOver() && !isPaused;
  const canDrawFromDeck = canDraw && deckHasCards;
  const canDrawFromDiscard = canDraw && topDiscard !== null;
  const playerScore = ScoreCalculator.calculateScore(player1.getHand(), wildRank).score;
  const canKnock = isPlayerTurn && !hasKnocked && !gameEngine.isRoundOver() && knockCountdown !== null && !isPaused;

  const handleCardClick = (index) => {
    if (gameEngine.isRoundOver() || !isPlayerTurn || isPaused) return;

    // If player has drawn a card, this is for discarding
    if (hasDrawn) {
      setSelectedCardIndex(index);
      return;
    }

    // If no card drawn yet, this is for rearranging
    if (cardToMove === null) {
      // First click - select card to move
      setCardToMove(index);
    } else if (cardToMove === index) {
      // Clicked same card - deselect
      setCardToMove(null);
    } else {
      // Second click - move card to this position
      onReorderHand(cardToMove, index);
      setCardToMove(null);
    }
  };

  const handleCardDoubleClick = (index) => {
    if (gameEngine.isRoundOver() || !isPlayerTurn || isPaused) return;

    // Double-click to discard (only works after drawing)
    if (hasDrawn) {
      onDiscardCard(index);
    }
  };

  const handleDiscardClick = () => {
    if (selectedCardIndex !== null && hasDrawn && !isPaused) {
      onDiscardCard(selectedCardIndex);
    }
  };

  const getTurnMessage = () => {
    if (gameEngine.isRoundOver()) return 'Round ending...';
    if (!isPlayerTurn) return gameMode === 'pvc' ? 'Computer playing...' : "Opponent's turn";
    if (hasDrawn) return 'Select card to discard';
    if (hasKnocked && gameEngine.knockedPlayerIndex === 1) return 'Final turn!';
    return 'Draw a card';
  };

  // Drag and drop handlers
  const handleDragStart = (e, index, isDraggable) => {
    if (!isDraggable) {
      e.preventDefault();
      return;
    }
    setDraggedCard(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index, isDraggable) => {
    if (!isDraggable || draggedCard === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedCard !== index) {
      setDropTarget(index);
    }
  };

  const handleDragEnter = (e, index, isDraggable) => {
    if (!isDraggable || draggedCard === null) return;
    e.preventDefault();
    if (draggedCard !== index) {
      setDropTarget(index);
    }
  };

  const handleDragLeave = (e, index) => {
    if (dropTarget === index) {
      setDropTarget(null);
    }
  };

  const handleDrop = (e, index, isDraggable) => {
    if (!isDraggable) return;
    e.preventDefault();
    if (draggedCard !== null && dropTarget !== null && draggedCard !== dropTarget) {
      onReorderHand(draggedCard, dropTarget);
    }
    setDraggedCard(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDropTarget(null);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex flex-row">
      {/* Left Side - Opponent Hand */}
      <OpponentHand
        player={player2}
        wildRank={wildRank}
        gameMode={gameMode}
        showRoundResults={showRoundResults}
      />

      {/* Center - Game Area */}
      <div className="flex-1 flex flex-col">
        {/* Round Info Bar */}
        <RoundInfoBar
          currentRound={gameEngine.currentRound}
          wildRank={wildRank}
          onShowHelp={() => setShowHelp(true)}
          onPause={() => setIsPaused(true)}
          onShowExit={() => setShowExitModal(true)}
        />

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col justify-center p-2 md:p-6 relative">
          {showRoundResults ? (
            <RoundResultsView
              gameEngine={gameEngine}
              player1={player1}
              player2={player2}
              wildRank={wildRank}
              hasKnocked={hasKnocked}
              knockedPlayerIndex={gameEngine.knockedPlayerIndex}
              onNextRound={onNextRound}
            />
          ) : (
            <GameTable
              deckHasCards={deckHasCards}
              deckCount={gameEngine.deck.getCardCount()}
              topDiscard={topDiscard}
              secondDiscard={secondDiscard}
              wildRank={wildRank}
              canDrawFromDeck={canDrawFromDeck}
              canDrawFromDiscard={canDrawFromDiscard}
              hasDrawn={hasDrawn}
              selectedCardIndex={selectedCardIndex}
              knockCountdown={knockCountdown}
              turnMessage={getTurnMessage()}
              playerScore={playerScore}
              isPlayerTurn={isPlayerTurn}
              hasKnocked={hasKnocked}
              onDrawFromDeck={() => onDrawCard(false)}
              onDrawFromDiscard={() => onDrawCard(true)}
              onDiscardClick={handleDiscardClick}
            />
          )}
        </div>
      </div>

      {/* Right Side - Player Hand */}
      <PlayerHand
        player={player1}
        wildRank={wildRank}
        difficulty={difficulty}
        selectedCardIndex={selectedCardIndex}
        cardToMove={cardToMove}
        hasDrawn={hasDrawn}
        isPlayerTurn={isPlayerTurn}
        isRoundOver={gameEngine.isRoundOver()}
        isPaused={isPaused}
        playerScore={playerScore}
        canKnock={canKnock}
        draggedCard={draggedCard}
        dropTarget={dropTarget}
        onCardClick={handleCardClick}
        onCardDoubleClick={handleCardDoubleClick}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
        onKnock={onKnock}
      />

      {/* Modals */}
      <AnimatePresence>
        {showHelp && (
          <HelpModal onClose={() => setShowHelp(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPaused && (
          <PauseMenu
            onResume={() => setIsPaused(false)}
            onExit={() => {
              setIsPaused(false);
              setShowExitModal(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExitModal && (
          <ExitConfirmModal
            onConfirm={() => {
              setShowExitModal(false);
              onExit();
            }}
            onCancel={() => setShowExitModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
