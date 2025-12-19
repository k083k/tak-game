import { motion, AnimatePresence } from 'framer-motion';
import { CardComponent } from '../CardComponent';
import { CardValidator } from '../../services/CardValidator';
import { TurnIndicator } from './TurnIndicator';

/**
 * Game table with deck, discard pile, and turn indicator
 */
export const GameTable = ({
  deckHasCards,
  deckCount,
  topDiscard,
  secondDiscard,
  wildRank,
  canDrawFromDeck,
  canDrawFromDiscard,
  hasDrawn,
  selectedCardIndex,
  knockCountdown,
  turnMessage,
  playerScore,
  isPlayerTurn,
  hasKnocked,
  onDrawFromDeck,
  onDrawFromDiscard,
  onDiscardClick
}) => {
  return (
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
          <div className="relative w-20 h-28" onClick={() => canDrawFromDeck && onDrawFromDeck()}>
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

            {/* Card count badge */}
            {deckHasCards && (
              <div className="absolute -top-2 -right-2 bg-white text-slate-900 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-lg" style={{ zIndex: 5 }}>
                {deckCount}
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
      <TurnIndicator
        message={turnMessage}
        knockCountdown={knockCountdown}
        playerScore={playerScore}
        isPlayerTurn={isPlayerTurn}
        hasKnocked={hasKnocked}
      />

      {/* Discard Pile */}
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className={`relative ${canDrawFromDiscard || (hasDrawn && selectedCardIndex !== null) ? 'cursor-pointer' : ''}`}
          whileHover={{ scale: (hasDrawn && selectedCardIndex !== null) || canDrawFromDiscard ? 1.05 : 1 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            if (canDrawFromDiscard) {
              onDrawFromDiscard();
            } else if (hasDrawn && selectedCardIndex !== null) {
              onDiscardClick();
            }
          }}
        >
          {/* Card underneath (second in pile) */}
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
  );
};
