import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardComponent } from './CardComponent';
import { CardInTransit } from './CardInTransit';
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
  transitCard,
  onDrawCard,
  onDiscardCard,
  onKnock,
  onReorderHand,
  onExit,
  gameMode,
  difficulty
}) => {
  const [showExitModal, setShowExitModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [cardToMove, setCardToMove] = useState(null);

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

  // Calculate responsive card sizing based on hand size and screen
  const getHandStyle = (handSize) => {
    // Base card size depends on screen width (will use CSS responsive classes)
    // Size hierarchy: xs (smallest), sm, md (default), lg (largest)
    let cardSize = 'md';
    let gap = 'gap-1.5';
    let scale = 1;

    // Adjust based on hand size - larger hands need smaller or overlapping cards
    if (handSize <= 5) {
      cardSize = 'md'; // Standard size for small hands
      gap = 'gap-2';
      scale = 1;
    } else if (handSize <= 7) {
      cardSize = 'md';
      gap = 'gap-1.5';
      scale = 1;
    } else if (handSize <= 10) {
      cardSize = 'sm'; // Slightly smaller
      gap = 'gap-1';
      scale = 0.95;
    } else if (handSize <= 13) {
      cardSize = 'sm';
      gap = 'gap-0.5';
      scale = 0.9;
    } else {
      cardSize = 'xs'; // Smallest for very large hands
      gap = 'gap-0';
      scale = 0.85;
    }

    return { cardSize, scale, gap, gapPx: gap === 'gap-2' ? 8 : gap === 'gap-1.5' ? 6 : gap === 'gap-1' ? 4 : gap === 'gap-0.5' ? 2 : 0 };
  };

  const playerHandStyle = getHandStyle(player1.getHand().length);
  const opponentHandStyle = getHandStyle(player2.getHand().length);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col md:flex-row">
      {/* Left Side - Player 1 - Desktop: Sidebar, Mobile: Compact Header - Hidden on smallest screens */}
      <div className="hidden min-h-[700px]:flex md:w-48 w-full md:h-full h-auto md:flex-col flex-row items-center justify-between md:justify-center bg-black/20 md:border-r border-b md:border-b-0 border-white/10 p-3 md:p-6">
        <div className="flex md:flex-col flex-row items-center md:text-center gap-3 md:gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl md:text-4xl">
            {player1.avatar || '👤'}
          </div>

          {/* Name */}
          <div className="text-white/40 text-xs uppercase tracking-widest font-semibold">
            {player1.name}
          </div>
        </div>

        {/* Score - More compact on mobile */}
        <div className="md:mt-0">
          <div className="text-white/50 text-[10px] uppercase tracking-wider mb-1 hidden md:block">Score</div>
          <div className="text-3xl md:text-6xl font-light tabular-nums text-white">
            {player1.getTotalScore()}
          </div>
        </div>
      </div>

      {/* Center - Game Area */}
      <div className="flex-1 flex flex-col">
        {/* Round Info Bar */}
        <div className="px-3 md:px-8 py-3 md:py-4 bg-black/20 border-b border-white/10 text-center relative">
          <div className="text-white/90 text-xs md:text-sm font-medium tracking-wide">
            Round <span className="font-bold">{gameEngine.currentRound}</span> of 13
            <span className="mx-2 md:mx-3 text-white/30">•</span>
            Wild <span className="text-white/70 font-semibold">{getWildDisplay()}</span>
          </div>

          {/* Help, Pause & Exit Buttons */}
          <div className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 flex gap-1 md:gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHelp(true)}
              className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/60 hover:text-white/90 transition-colors text-base"
              title="Help"
            >
              ?
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPaused(true)}
              className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/60 hover:text-white/90 transition-colors text-base"
              title="Pause Game"
            >
              ⏸
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExitModal(true)}
              className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/60 hover:text-white/90 transition-colors"
              title="Exit Game"
            >
              ✕
            </motion.button>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col justify-between p-2 md:p-6 relative">
        {/* Opponent's Hand - Compact at Top */}
        <div className="flex justify-center">
          <motion.div
            className={`flex ${opponentHandStyle.gap}`}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {player2.getHand().map((card, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, rotateY: 180 }}
                animate={{ scale: opponentHandStyle.scale, rotateY: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <CardComponent
                  card={card}
                  isHidden={gameMode === 'pvc' && !gameEngine.isRoundOver()}
                  isWild={CardValidator.isWildCard(card, wildRank)}
                  size={opponentHandStyle.cardSize}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Center Table - Deck & Discard */}
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
                <div className="absolute w-20 h-28 rounded-xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 border-2 border-purple-900 shadow-lg"
                  style={{ transform: 'translateY(-6px) translateX(-3px) rotateX(2deg)', zIndex: 1 }}
                ></div>
                <div className="absolute w-20 h-28 rounded-xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 border-2 border-purple-900 shadow-lg"
                  style={{ transform: 'translateY(-4px) translateX(-2px) rotateX(1deg)', zIndex: 2 }}
                ></div>
                <div className="absolute w-20 h-28 rounded-xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 border-2 border-purple-900 shadow-lg"
                  style={{ transform: 'translateY(-2px) translateX(-1px)', zIndex: 3 }}
                ></div>

                {/* Top card with design */}
                <div className="absolute w-20 h-28 rounded-xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 border-2 border-purple-900 shadow-xl cursor-pointer"
                  style={{ zIndex: 4 }}
                >
                  {/* Decorative pattern matching card backs */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    <div className="absolute inset-2 border-2 border-white/30 rounded-md"></div>
                    <div className="absolute inset-3 border border-white/20 rounded-md"></div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rotate-45 border-2 border-white/40 rounded-lg"></div>
                        <div className="absolute inset-2 rotate-45 border border-white/30 rounded-md"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white/20 rounded-full"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/40 rounded-full"></div>
                      </div>
                    </div>

                    <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-white/30"></div>
                    <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-white/30"></div>
                    <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-white/30"></div>
                    <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-white/30"></div>
                  </div>

                  {/* Card count badge */}
                  {deckHasCards && (
                    <div className="absolute -top-2 -right-2 bg-white text-slate-900 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-lg" style={{ zIndex: 5 }}>
                      {gameEngine.deck.getCardCount()}
                    </div>
                  )}
                </div>
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
              <AnimatePresence mode="wait">
                {topDiscard ? (
                  <motion.div
                    key={`${topDiscard.suit}-${topDiscard.rank}`}
                    initial={{ rotateY: 90, scale: 0.8 }}
                    animate={{ rotateY: 0, scale: 1 }}
                    exit={{ rotateY: -90, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
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

        {/* Player's Hand - Bottom */}
        <div className="flex flex-col items-center gap-4">
          <div className={`flex ${playerHandStyle.gap} justify-center relative`}>
            <AnimatePresence mode="popLayout">
              {player1.getHand().map((card, index) => {
                const isSelectedForDiscard = hasDrawn && selectedCardIndex === index;
                const isSelectedForMove = !hasDrawn && cardToMove === index;
                const isAnyCardSelected = isSelectedForDiscard || isSelectedForMove;

                return (
                  <motion.div
                    key={`${card.suit}-${card.rank}`}
                    layout
                    initial={{ y: 100, opacity: 0, rotateY: 180 }}
                    animate={{
                      y: isAnyCardSelected ? -20 : 0,
                      opacity: 1,
                      rotateY: 0,
                      scale: isAnyCardSelected ? playerHandStyle.scale * 1.1 : playerHandStyle.scale
                    }}
                    exit={{ y: -100, opacity: 0, scale: 0.8 }}
                    transition={{
                      layout: { duration: 0.3, ease: "easeInOut" },
                      default: { delay: index * 0.05, duration: 0.3 }
                    }}
                    whileHover={{ y: -8 }}
                    onClick={() => handleCardClick(index)}
                    onDoubleClick={() => handleCardDoubleClick(index)}
                    className="cursor-pointer relative"
                  >
                    {isSelectedForMove && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10">
                        <span className="text-white text-sm font-bold" style={{ lineHeight: 0 }}>↔</span>
                      </div>
                    )}
                    <CardComponent
                      card={card}
                      isWild={CardValidator.isWildCard(card, wildRank)}
                      isSelected={isSelectedForDiscard}
                      size={playerHandStyle.cardSize}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center gap-6 px-8 py-4 rounded-2xl bg-black/20 backdrop-blur-md border border-white/5">
            {difficulty === 'easy' && (
              <div className="flex items-center gap-3">
                <span className="text-white/50 text-sm">Score:</span>
                <span className={`text-2xl font-bold px-4 py-1 rounded-lg ${
                  playerScore === 0 ? 'bg-white/10 text-white' : 'bg-white/5 text-white/80'
                }`}>
                  {playerScore}
                </span>
              </div>
            )}

            <motion.button
              whileHover={{ scale: canKnock ? 1.02 : 1 }}
              whileTap={{ scale: canKnock ? 0.98 : 1 }}
              onClick={onKnock}
              disabled={!canKnock}
              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                canKnock
                  ? 'bg-white text-slate-900 shadow-lg cursor-pointer hover:shadow-xl'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-40'
              }`}
            >
              KNOCK
            </motion.button>
          </div>
        </div>
        </div>
      </div>

      {/* Right Side - Player 2 - Desktop: Sidebar, Mobile: Compact Footer - Hidden on smallest screens */}
      <div className="hidden min-h-[700px]:flex md:w-48 w-full md:h-full h-auto md:flex-col flex-row items-center justify-between md:justify-center bg-black/20 md:border-l border-t md:border-t-0 border-white/10 p-3 md:p-6">
        <div className="flex md:flex-col flex-row items-center md:text-center gap-3 md:gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl md:text-4xl">
            {player2.avatar || '🤖'}
          </div>

          {/* Name */}
          <div className="text-white/40 text-xs uppercase tracking-widest font-semibold">
            {player2.name}
          </div>
        </div>

        {/* Score - More compact on mobile */}
        <div className="md:mt-0">
          <div className="text-white/50 text-[10px] uppercase tracking-wider mb-1 hidden md:block">Score</div>
          <div className="text-3xl md:text-6xl font-light tabular-nums text-white">
            {player2.getTotalScore()}
          </div>
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

      {/* Card In Transit Animation */}
      {transitCard && (
        <CardInTransit
          card={transitCard.card}
          from={transitCard.from}
          to={transitCard.to}
          isHidden={transitCard.isHidden}
          onComplete={() => {
            // Animation completed - handled by useGameState
          }}
        />
      )}
    </div>
  );
};
