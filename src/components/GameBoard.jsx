import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardComponent } from './CardComponent';
import { CardValidator } from '../services/CardValidator';
import { ScoreCalculator } from '../services/ScoreCalculator';
import { ExitConfirmModal } from './ExitConfirmModal';
import { PauseMenu } from './PauseMenu';
import { HelpModal } from './HelpModal';

/**
 * Main game board component - redesigned for single-page view
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
  const [player1CarouselIndex, setPlayer1CarouselIndex] = useState(0);
  const [player2CarouselIndex, setPlayer2CarouselIndex] = useState(0);
  const [draggedCard, setDraggedCard] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  // Clear cardToMove when player draws a card
  useEffect(() => {
    if (hasDrawn && cardToMove !== null) {
      setCardToMove(null);
    }
  }, [hasDrawn, cardToMove]);

  // Reset carousel indices when round results are shown
  useEffect(() => {
    if (showRoundResults) {
      setPlayer1CarouselIndex(0);
      setPlayer2CarouselIndex(0);
    }
  }, [showRoundResults]);

  // Auto-cycle carousel every 3 seconds when showing round results
  useEffect(() => {
    if (!showRoundResults) return;

    const interval = setInterval(() => {
      const player1Result = ScoreCalculator.calculateScore(player1.getHand(), wildRank);
      const player1Groups = [...player1Result.combinations];
      if (player1Result.remaining.length > 0) {
        player1Groups.push({ type: 'unmatched', cards: player1Result.remaining });
      }

      const player2Result = ScoreCalculator.calculateScore(player2.getHand(), wildRank);
      const player2Groups = [...player2Result.combinations];
      if (player2Result.remaining.length > 0) {
        player2Groups.push({ type: 'unmatched', cards: player2Result.remaining });
      }

      setPlayer1CarouselIndex((prev) => (prev + 1) % Math.max(1, player1Groups.length));
      setPlayer2CarouselIndex((prev) => (prev + 1) % Math.max(1, player2Groups.length));
    }, 3000);

    return () => clearInterval(interval);
  }, [showRoundResults, gameEngine]);

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

  const getWildDisplay = () => {
    const ranks = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
    return ranks[wildRank] || wildRank.toString();
  };

  const getTurnMessage = () => {
    if (gameEngine.isRoundOver()) return 'Round ending...';
    if (!isPlayerTurn) return gameMode === 'pvc' ? 'Computer playing...' : "Opponent's turn";
    if (hasDrawn) return 'Select card to discard';
    if (hasKnocked && gameEngine.knockedPlayerIndex === 1) return 'Final turn!';
    return 'Draw a card';
  };

  // Calculate how to split cards into rows for vertical layout (up to 4 rows)
  // Max 13 cards in hand (Round 11)
  const getRowDistribution = (handSize) => {
    if (handSize <= 3) return [handSize];
    if (handSize === 4) return [2, 2];
    if (handSize === 5) return [3, 2];
    if (handSize === 6) return [3, 3];
    if (handSize === 7) return [4, 3];
    if (handSize === 8) return [3, 3, 2];
    if (handSize === 9) return [3, 3, 3];
    if (handSize === 10) return [3, 3, 2, 2];
    if (handSize === 11) return [3, 3, 3, 2];
    if (handSize === 12) return [3, 3, 3, 3];
    if (handSize === 13) return [4, 4, 3, 2];
    if (handSize >= 14) return [4, 4, 4, 2]; // Max hand size (after drawing in Round 11)
    return [handSize];
  };

  // Split hand into rows based on distribution
  const splitIntoRows = (hand) => {
    const distribution = getRowDistribution(hand.length);
    const rows = [];
    let startIndex = 0;

    for (const rowSize of distribution) {
      rows.push(hand.slice(startIndex, startIndex + rowSize));
      startIndex += rowSize;
    }

    return rows;
  };

  const opponentRows = splitIntoRows(player2.getHand());
  const playerRows = splitIntoRows(player1.getHand());

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex flex-row">
      {/* Left Side - Opponent Hand (Vertical) */}
      <div className="w-80 h-full flex flex-col items-center justify-center bg-black/20 border-r border-white/10 p-2 gap-3">
        {/* Opponent info header */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl">
            {player2.avatar || '🤖'}
          </div>
          <div className="text-white/40 text-[10px] uppercase tracking-wider text-center">
            {player2.name}
          </div>
          <div className="text-xl font-bold text-white">
            {player2.getTotalScore()}
          </div>
        </div>

        {/* Opponent Hand - Multi-row Layout with Overlapping Cards */}
        <div className="flex flex-col gap-2 items-center flex-1 justify-center overflow-y-auto overflow-x-hidden">
          {opponentRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((card, cardIndex) => {
                const globalIndex = opponentRows.slice(0, rowIndex).reduce((sum, r) => sum + r.length, 0) + cardIndex;
                return (
                  <motion.div
                    key={globalIndex}
                    initial={{ scale: 0, rotateY: showRoundResults ? 180 : 0 }}
                    animate={{
                      scale: 1,
                      rotateY: 0
                    }}
                    transition={{ delay: globalIndex * 0.05, duration: 0.3 }}
                    style={{ marginLeft: cardIndex === 0 ? '0' : '-16px' }}
                  >
                    <CardComponent
                      card={card}
                      isHidden={gameMode === 'pvc' && !showRoundResults}
                      isWild={CardValidator.isWildCard(card, wildRank)}
                      size="sm"
                    />
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Center - Game Area */}
      <div className="flex-1 flex flex-col">
        {/* Round Info Bar */}
        <div className="px-4 py-3 bg-black/20 border-b border-white/10 text-center relative">
          <div className="text-white/90 text-sm font-medium tracking-wide">
            Round <span className="font-bold">{gameEngine.currentRound}</span> of 11
            <span className="mx-3 text-white/30">•</span>
            Wild <span className="text-white/70 font-semibold">{getWildDisplay()}</span>
          </div>

          {/* Help, Pause & Exit Buttons */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHelp(true)}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/60 hover:text-white/90 transition-colors text-base"
              title="Help"
            >
              ?
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPaused(true)}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/60 hover:text-white/90 transition-colors text-base"
              title="Pause Game"
            >
              ⏸
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExitModal(true)}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/60 hover:text-white/90 transition-colors"
              title="Exit Game"
            >
              ✕
            </motion.button>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col justify-center p-2 md:p-6 relative">
        {/* Center Table - Deck & Discard OR Round Results */}
        {showRoundResults ? (
          /* Round Results Display */
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-full max-w-[90vw]">
              {/* Round End Title */}
              <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-6">
                Round {gameEngine.currentRound} Complete
              </h2>

              {/* Player Scores */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Player 2 */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 min-h-[280px]">
                  {(() => {
                    const player2Result = ScoreCalculator.calculateScore(player2.getHand(), wildRank);
                    const player2Groups = [...player2Result.combinations];
                    if (player2Result.remaining.length > 0) {
                      player2Groups.push({ type: 'unmatched', cards: player2Result.remaining });
                    }

                    if (player2Groups.length === 0) {
                      return (
                        <div className="flex flex-col gap-4 h-full">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="text-2xl">{player2.avatar || '🤖'}</div>
                              <div className="text-white font-semibold text-sm">{player2.name}</div>
                            </div>
                            <div className="text-xl font-bold text-white">
                              {player2.roundScores[gameEngine.currentRound - 1] || 0} pts
                            </div>
                          </div>
                          <div className="flex-1 flex items-center justify-center text-white/60">Perfect hand!</div>
                        </div>
                      );
                    }

                    // Ensure carousel index is within bounds
                    const safePlayer2Index = Math.min(player2CarouselIndex, player2Groups.length - 1);
                    const currentGroup = player2Groups[safePlayer2Index];
                    const isUnmatched = currentGroup?.type === 'unmatched';

                    return (
                      <div className="flex flex-col gap-4 h-full">
                        {/* Row 1: Avatar+Name on left, Points on right */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-2xl">{player2.avatar || '🤖'}</div>
                            <div>
                              <div className="text-white font-semibold text-sm">{player2.name} {hasKnocked && gameEngine.knockedPlayerIndex === 1 && (
                                <span className="text-xs text-amber-400 ml-1">👊</span>
                              )}</div>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-white">
                            {player2.roundScores[gameEngine.currentRound - 1] || 0} pts
                          </div>
                        </div>

                        {/* Row 2: Icon + Cards centered */}
                        <div className="flex-1 flex flex-col items-center justify-center gap-2">
                          {/* Status Icon - Above Cards */}
                          <div className={`text-lg ${isUnmatched ? 'text-red-500' : 'text-green-500'}`}>
                            {isUnmatched ? '✗' : '✓'}
                          </div>

                          {/* Cards */}
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={safePlayer2Index}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.3 }}
                              className="flex gap-1"
                            >
                              {currentGroup.cards.map((card, cardIdx) => (
                                <div key={cardIdx} className="w-8 h-11 shrink-0">
                                  <CardComponent card={card} size="xs" isWild={CardValidator.isWildCard(card, wildRank)} />
                                </div>
                              ))}
                            </motion.div>
                          </AnimatePresence>
                        </div>

                        {/* Row 3: Indicator Dots centered */}
                        <div className="flex justify-center gap-1.5">
                          {player2Groups.map((_, idx) => (
                            <div
                              key={idx}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                idx === player2CarouselIndex ? 'bg-white' : 'bg-white/30'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                {/* Player 1 */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 min-h-[280px]">
                  {(() => {
                    const player1Result = ScoreCalculator.calculateScore(player1.getHand(), wildRank);
                    const player1Groups = [...player1Result.combinations];
                    if (player1Result.remaining.length > 0) {
                      player1Groups.push({ type: 'unmatched', cards: player1Result.remaining });
                    }

                    if (player1Groups.length === 0) {
                      return (
                        <div className="flex flex-col gap-4 h-full">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="text-2xl">{player1.avatar || '👤'}</div>
                              <div className="text-white font-semibold text-sm">{player1.name}</div>
                            </div>
                            <div className="text-xl font-bold text-white">
                              {player1.roundScores[gameEngine.currentRound - 1] || 0} pts
                            </div>
                          </div>
                          <div className="flex-1 flex items-center justify-center text-white/60">Perfect hand!</div>
                        </div>
                      );
                    }

                    // Ensure carousel index is within bounds
                    const safePlayer1Index = Math.min(player1CarouselIndex, player1Groups.length - 1);
                    const currentGroup = player1Groups[safePlayer1Index];
                    const isUnmatched = currentGroup?.type === 'unmatched';

                    return (
                      <div className="flex flex-col gap-4 h-full">
                        {/* Row 1: Avatar+Name on left, Points on right */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-2xl">{player1.avatar || '👤'}</div>
                            <div>
                              <div className="text-white font-semibold text-sm">{player1.name} {hasKnocked && gameEngine.knockedPlayerIndex === 0 && (
                                <span className="text-xs text-amber-400 ml-1">👊</span>
                              )}</div>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-white">
                            {player1.roundScores[gameEngine.currentRound - 1] || 0} pts
                          </div>
                        </div>

                        {/* Row 2: Icon + Cards centered */}
                        <div className="flex-1 flex flex-col items-center justify-center gap-2">
                          {/* Status Icon - Above Cards */}
                          <div className={`text-lg ${isUnmatched ? 'text-red-500' : 'text-green-500'}`}>
                            {isUnmatched ? '✗' : '✓'}
                          </div>

                          {/* Cards */}
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={safePlayer1Index}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.3 }}
                              className="flex gap-1"
                            >
                              {currentGroup.cards.map((card, cardIdx) => (
                                <div key={cardIdx} className="w-8 h-11 shrink-0">
                                  <CardComponent card={card} size="xs" isWild={CardValidator.isWildCard(card, wildRank)} />
                                </div>
                              ))}
                            </motion.div>
                          </AnimatePresence>
                        </div>

                        {/* Row 3: Indicator Dots centered */}
                        <div className="flex justify-center gap-1.5">
                          {player1Groups.map((_, idx) => (
                            <div
                              key={idx}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                idx === player1CarouselIndex ? 'bg-white' : 'bg-white/30'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Round Winner */}
              <div className="text-center mb-6">
                <div className="text-white/60 text-sm mb-2">Round Winner</div>
                <div className="text-2xl font-bold text-white">
                  {(() => {
                    const p1Score = player1.roundScores[gameEngine.currentRound - 1] || 0;
                    const p2Score = player2.roundScores[gameEngine.currentRound - 1] || 0;

                    if (p1Score < p2Score) return `${player1.name} 🎉`;
                    if (p2Score < p1Score) return `${player2.name} 🎉`;
                    // If scores are equal, it's a tie
                    return "It's a Tie! 🤝";
                  })()}
                </div>
              </div>

              {/* Total Scores */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                <div>
                  <div className="text-white/60 text-xs mb-1">Total Score</div>
                  <div className="text-xl font-bold text-white">{player2.getTotalScore()}</div>
                </div>
                <div>
                  <div className="text-white/60 text-xs mb-1">Total Score</div>
                  <div className="text-xl font-bold text-white">{player1.getTotalScore()}</div>
                </div>
                
              </div>

              {/* Next Round Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onNextRound}
                className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-white/90 transition-colors"
              >
                {gameEngine.currentRound < 11 ? 'NEXT ROUND' : 'VIEW FINAL RESULTS'}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* Normal Gameplay - Deck & Discard */
          <div className="flex items-center justify-center gap-16">
          {/* Deck */}
          <div className="flex flex-col items-center gap-4">
            <motion.div
              className="relative"
              whileHover={{ scale: canDrawFromDeck ? 1.02 : 1 }}
              transition={{ duration: 0.2 }}
              style={{ perspective: '1000px' }}
            >
              {/* 3D Stacked Cards Effect */}
              <div className="relative w-20 h-28" onClick={() => canDrawFromDeck && onDrawCard(false)}>
                {/* Back cards creating depth */}
                <div className="absolute w-20 h-28 rounded-lg shadow-lg"
                  style={{ transform: 'translateY(-6px) translateX(-3px) rotateX(2deg)', zIndex: 1 }}
                >
                  <img src="/cards/back-black.png" alt="Card back" className="w-full h-full object-cover rounded-lg" draggable="false" />
                </div>
                <div className="absolute w-20 h-28 rounded-lg shadow-lg"
                  style={{ transform: 'translateY(-4px) translateX(-2px) rotateX(1deg)', zIndex: 2 }}
                >
                  <img src="/cards/back-black.png" alt="Card back" className="w-full h-full object-cover rounded-lg" draggable="false" />
                </div>
                <div className="absolute w-20 h-28 rounded-lg shadow-lg"
                  style={{ transform: 'translateY(-2px) translateX(-1px)', zIndex: 3 }}
                >
                  <img src="/cards/back-black.png" alt="Card back" className="w-full h-full object-cover rounded-lg" draggable="false" />
                </div>

                {/* Top card */}
                <div className="absolute w-20 h-28 rounded-lg shadow-xl cursor-pointer"
                  style={{ zIndex: 4 }}
                >
                  <img src="/cards/back-black.png" alt="Card back" className="w-full h-full object-cover rounded-lg" draggable="false" />
                </div>

                {/* Card count badge - positioned outside the card div */}
                {deckHasCards && (
                  <div className="absolute -top-2 -right-2 bg-white text-slate-900 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-lg" style={{ zIndex: 5 }}>
                    {gameEngine.deck.getCardCount()}
                  </div>
                )}
              </div>
            </motion.div>
            {canDrawFromDeck && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/60 text-sm"
              >
                Click to draw
              </motion.div>
            )}
          </div>

          {/* Turn Status */}
          <div className="flex flex-col items-center gap-3">
            <div className="px-6 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
              <div className="text-white/80 text-center font-medium">{getTurnMessage()}</div>
            </div>

            {knockCountdown !== null && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-6xl font-black text-white"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {knockCountdown}
                </motion.div>
              </motion.div>
            )}

            {playerScore === 0 && isPlayerTurn && !hasKnocked && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white/70 text-sm font-medium"
              >
                Perfect Hand
              </motion.div>
            )}
          </div>

          {/* Discard Pile - Click to draw or discard */}
          <div className="flex flex-col items-center gap-4">
            <motion.div
              className={`relative ${canDrawFromDiscard || (hasDrawn && selectedCardIndex !== null) ? 'cursor-pointer' : ''}`}
              whileHover={{ scale: (hasDrawn && selectedCardIndex !== null) || canDrawFromDiscard ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                if (canDrawFromDiscard) {
                  onDrawCard(true);
                } else if (hasDrawn && selectedCardIndex !== null) {
                  handleDiscardClick();
                }
              }}
            >
              {/* Card underneath (second in pile) - shown slightly offset */}
              {secondDiscard && (
                <div className="absolute top-1 left-1 opacity-70">
                  <CardComponent
                    card={secondDiscard}
                    isWild={CardValidator.isWildCard(secondDiscard, wildRank)}
                    size="md"
                  />
                </div>
              )}

              {/* Top card with animation */}
              <AnimatePresence mode="wait">
                {topDiscard ? (
                  <motion.div
                    key={`${topDiscard.suit}-${topDiscard.rank}`}
                    initial={{ x: 100, y: 50, opacity: 0, scale: 0.8 }}
                    animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    exit={{ x: 100, y: 50, opacity: 0, scale: 0.8 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                      duration: 0.4
                    }}
                    className="relative z-10"
                  >
                    <CardComponent
                      card={topDiscard}
                      isWild={CardValidator.isWildCard(topDiscard, wildRank)}
                      size="md"
                    />
                  </motion.div>
                ) : (
                  <div className="w-20 h-28 rounded-xl border-4 border-dashed border-white/20 bg-white/5 flex items-center justify-center">
                    <span className="text-white/40 text-xs font-semibold">DISCARD</span>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
            {canDrawFromDiscard && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/60 text-sm"
              >
                Click to draw
              </motion.div>
            )}
          </div>
        </div>
        )}
        {/* End of Center Table conditional */}

        </div>
      </div>

      {/* Right Side - Player Hand (Vertical) */}
      <div className="w-80 h-full flex flex-col items-center justify-center bg-black/20 border-l border-white/10 p-2 gap-3">
        {/* Player info header */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl">
            {player1.avatar || '👤'}
          </div>
          <div className="text-white/40 text-[10px] uppercase tracking-wider text-center">
            {player1.name}
          </div>
          <div className="text-xl font-bold text-white">
            {player1.getTotalScore()}
          </div>
        </div>

        {/* Player Hand - Multi-row Layout with Overlapping Cards */}
        <div className="flex flex-col gap-1 items-center flex-1 justify-center overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="popLayout">
            {playerRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((card, cardIndex) => {
                  const globalIndex = playerRows.slice(0, rowIndex).reduce((sum, r) => sum + r.length, 0) + cardIndex;
                  const isSelectedForDiscard = hasDrawn && selectedCardIndex === globalIndex;
                  const isSelectedForMove = !hasDrawn && cardToMove === globalIndex;
                  const isAnyCardSelected = isSelectedForDiscard || isSelectedForMove;

                  const isDraggable = !hasDrawn && !gameEngine.isRoundOver() && isPlayerTurn && !isPaused;

                  return (
                    <motion.div
                      key={`${card.suit}-${card.rank}-${globalIndex}`}
                      layout
                      draggable={isDraggable}
                      onDragStart={(e) => {
                        if (!isDraggable) {
                          e.preventDefault();
                          return;
                        }
                        setDraggedCard(globalIndex);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        if (!isDraggable || draggedCard === null) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (draggedCard !== globalIndex) {
                          setDropTarget(globalIndex);
                        }
                      }}
                      onDragEnter={(e) => {
                        if (!isDraggable || draggedCard === null) return;
                        e.preventDefault();
                        if (draggedCard !== globalIndex) {
                          setDropTarget(globalIndex);
                        }
                      }}
                      onDragLeave={(e) => {
                        if (!isDraggable) return;
                        if (dropTarget === globalIndex) {
                          setDropTarget(null);
                        }
                      }}
                      onDrop={(e) => {
                        if (!isDraggable) return;
                        e.preventDefault();
                        if (draggedCard !== null && dropTarget !== null && draggedCard !== dropTarget) {
                          onReorderHand(draggedCard, dropTarget);
                        }
                        setDraggedCard(null);
                        setDropTarget(null);
                      }}
                      onDragEnd={() => {
                        setDraggedCard(null);
                        setDropTarget(null);
                      }}
                      initial={{ x: -100, y: -50, opacity: 0, rotateY: 180, scale: 0.8 }}
                      animate={{
                        x: isAnyCardSelected ? 10 : 0,
                        opacity: draggedCard === globalIndex ? 0.5 : 1,
                        rotateY: 0,
                        scale: isAnyCardSelected ? 1.15 : dropTarget === globalIndex ? 1.1 : 1
                      }}
                      exit={{ x: -100, y: -50, opacity: 0, scale: 0.8 }}
                      transition={{
                        layout: { duration: 0.3, ease: "easeInOut" },
                        default: { delay: globalIndex * 0.05, duration: 0.3 }
                      }}
                      whileHover={{ x: 6, scale: 1.05 }}
                      onClick={() => handleCardClick(globalIndex)}
                      onDoubleClick={() => handleCardDoubleClick(globalIndex)}
                      className={`cursor-pointer relative ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
                      style={{
                        marginLeft: cardIndex === 0 ? '0' : '-16px',
                        zIndex: draggedCard === globalIndex ? 50 : dropTarget === globalIndex ? 10 : 1
                      }}
                    >
                      {isSelectedForMove && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10">
                          <span className="text-white text-[10px] font-bold" style={{ lineHeight: 0 }}>⊕</span>
                        </div>
                      )}
                      {dropTarget === globalIndex && draggedCard !== null && draggedCard !== globalIndex && (
                        <div className="absolute inset-0 border-2 border-blue-400 rounded-lg pointer-events-none"></div>
                      )}
                      <CardComponent
                        card={card}
                        isWild={CardValidator.isWildCard(card, wildRank)}
                        isSelected={isSelectedForDiscard}
                        size="sm"
                      />
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </AnimatePresence>
        </div>

        {/* Action Buttons - Bottom of sidebar */}
        <div className="flex flex-col items-center gap-2 mt-2">
          {difficulty === 'easy' && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-white/50 text-[10px]">Score</span>
              <span className={`text-base font-bold px-2 py-0.5 rounded-lg ${
                playerScore === 0 ? 'bg-white/10 text-white' : 'bg-white/5 text-white/80'
              }`}>
                {playerScore}
              </span>
            </div>
          )}

          <motion.button
            whileHover={{ scale: canKnock ? 1.05 : 1 }}
            whileTap={{ scale: canKnock ? 0.95 : 1 }}
            onClick={onKnock}
            disabled={!canKnock}
            className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all ${
              canKnock
                ? 'bg-white text-slate-900 shadow-lg cursor-pointer hover:shadow-xl'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-40'
            }`}
          >
            KNOCK
          </motion.button>
        </div>
      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <HelpModal onClose={() => setShowHelp(false)} />
        )}
      </AnimatePresence>

      {/* Pause Menu */}
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

      {/* Exit Confirmation Modal */}
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
