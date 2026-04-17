import { motion, AnimatePresence } from 'framer-motion';
import { CardComponent } from './CardComponent';
import { CardValidator } from '../services/CardValidator';

export const CenterTable = ({
  topDiscard,
  secondDiscard,
  wildRank,
  deckCardCount,
  deckHasCards,
  canDrawFromDeck,
  canDrawFromDiscard,
  hasDrawn,
  selectedCardIndex,
  knockCountdown,
  playerScore,
  isPlayerTurn,
  hasKnocked,
  turnMessage,
  onDrawCard,
  onDiscardClick,
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
          <div className="relative w-20 h-28" onClick={() => canDrawFromDeck && onDrawCard(false)}>
            <div className="absolute w-20 h-28 rounded-lg shadow-lg"
              style={{ transform: 'translateY(-6px) translateX(-3px) rotateX(2deg)', zIndex: 1 }}>
              <img src="/cards/back-black.png" alt="Card back" className="w-full h-full object-cover rounded-lg" draggable="false" />
            </div>
            <div className="absolute w-20 h-28 rounded-lg shadow-lg"
              style={{ transform: 'translateY(-4px) translateX(-2px) rotateX(1deg)', zIndex: 2 }}>
              <img src="/cards/back-black.png" alt="Card back" className="w-full h-full object-cover rounded-lg" draggable="false" />
            </div>
            <div className="absolute w-20 h-28 rounded-lg shadow-lg"
              style={{ transform: 'translateY(-2px) translateX(-1px)', zIndex: 3 }}>
              <img src="/cards/back-black.png" alt="Card back" className="w-full h-full object-cover rounded-lg" draggable="false" />
            </div>
            <div className="absolute w-20 h-28 rounded-lg shadow-xl cursor-pointer" style={{ zIndex: 4 }}>
              <img src="/cards/back-black.png" alt="Card back" className="w-full h-full object-cover rounded-lg" draggable="false" />
            </div>
            {deckHasCards && (
              <div className="absolute -top-2 -right-2 bg-white text-slate-900 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-lg" style={{ zIndex: 5 }}>
                {deckCardCount}
              </div>
            )}
          </div>
        </motion.div>
        {canDrawFromDeck && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/60 text-sm">
            Click to draw
          </motion.div>
        )}
      </div>

      {/* Turn Status */}
      <div className="flex flex-col items-center gap-3">
        <div className="px-6 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
          <div className="text-white/80 text-center font-medium">{turnMessage}</div>
        </div>

        {knockCountdown !== null && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl font-black text-white">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
              {knockCountdown}
            </motion.div>
          </motion.div>
        )}

        {playerScore === 0 && isPlayerTurn && !hasKnocked && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-white/70 text-sm font-medium">
            Perfect Hand
          </motion.div>
        )}
      </div>

      {/* Discard Pile */}
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className={`relative ${canDrawFromDiscard || (hasDrawn && selectedCardIndex !== null) ? 'cursor-pointer' : ''}`}
          whileHover={{ scale: (hasDrawn && selectedCardIndex !== null) || canDrawFromDiscard ? 1.05 : 1 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            if (canDrawFromDiscard) onDrawCard(true);
            else if (hasDrawn && selectedCardIndex !== null) onDiscardClick();
          }}
        >
          {secondDiscard && (
            <div className="absolute top-1 left-1 opacity-70">
              <CardComponent card={secondDiscard} isWild={CardValidator.isWildCard(secondDiscard, wildRank)} size="md" />
            </div>
          )}
          <AnimatePresence mode="wait">
            {topDiscard ? (
              <motion.div
                key={`${topDiscard.suit}-${topDiscard.rank}`}
                initial={{ x: 100, y: 50, opacity: 0, scale: 0.8 }}
                animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                exit={{ x: 100, y: 50, opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.4 }}
                className="relative z-10"
              >
                <CardComponent card={topDiscard} isWild={CardValidator.isWildCard(topDiscard, wildRank)} size="md" />
              </motion.div>
            ) : (
              <div className="w-20 h-28 rounded-xl border-4 border-dashed border-white/20 bg-white/5 flex items-center justify-center">
                <span className="text-white/40 text-xs font-semibold">DISCARD</span>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
        {canDrawFromDiscard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/60 text-sm">
            Click to draw
          </motion.div>
        )}
      </div>
    </div>
  );
};
