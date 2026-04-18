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
  isOnline = false,
}) => {
  const showKnockCountdown = !isOnline && knockCountdown !== null;

  return (
    <div className="flex items-center justify-center gap-10 md:gap-20">

      {/* Deck */}
      <div className="flex flex-col items-center gap-3">
        <motion.div
          whileHover={{ scale: canDrawFromDeck ? 1.04 : 1, y: canDrawFromDeck ? -4 : 0 }}
          transition={{ duration: 0.15 }}
          className={`relative cursor-pointer ${!canDrawFromDeck ? 'pointer-events-none' : ''}`}
          onClick={() => canDrawFromDeck && onDrawCard(false)}
        >
          {/* Stacked depth effect */}
          {[3, 2, 1].map((layer) => (
            <div
              key={layer}
              className="absolute w-20 h-28 rounded-xl overflow-hidden shadow"
              style={{
                transform: `translateY(${-layer * 2}px) translateX(${-layer * 1.5}px)`,
                zIndex: layer,
                opacity: 0.6 + layer * 0.1,
              }}
            >
              <img src="/cards/back-black.png" alt="" className="w-full h-full object-cover" draggable="false" />
            </div>
          ))}
          <div className="relative w-20 h-28 rounded-xl overflow-hidden shadow-xl" style={{ zIndex: 4 }}>
            <img src="/cards/back-black.png" alt="Deck" className="w-full h-full object-cover" draggable="false" />
          </div>
          {deckHasCards && (
            <div className="absolute -top-2 -right-2 bg-white text-slate-900 w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shadow-lg" style={{ zIndex: 5 }}>
              {deckCardCount}
            </div>
          )}
          {canDrawFromDeck && (
            <motion.div
              className="absolute inset-0 rounded-xl ring-2 ring-emerald-400/60 ring-offset-2 ring-offset-transparent"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              style={{ zIndex: 5 }}
            />
          )}
        </motion.div>
        <span className="text-white/25 text-[11px] uppercase tracking-widest">Deck</span>
      </div>

      {/* Center status */}
      <div className="flex flex-col items-center gap-4 min-w-[140px]">
        <motion.div
          key={turnMessage}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 py-2.5 rounded-full bg-white/6 backdrop-blur border border-white/10 text-white/75 text-sm font-medium text-center whitespace-nowrap"
        >
          {turnMessage}
        </motion.div>

        {showKnockCountdown && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex flex-col items-center gap-1"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-5xl font-black text-white leading-none"
            >
              {knockCountdown}
            </motion.div>
            <div className="text-white/30 text-[10px] uppercase tracking-widest">knock window</div>
          </motion.div>
        )}

      </div>

      {/* Discard pile */}
      <div className="flex flex-col items-center gap-3">
        <motion.div
          className="relative cursor-pointer"
          whileHover={{ scale: (canDrawFromDiscard || (hasDrawn && selectedCardIndex !== null)) ? 1.04 : 1, y: -4 }}
          transition={{ duration: 0.15 }}
          onClick={() => {
            if (canDrawFromDiscard) onDrawCard(true);
            else if (hasDrawn && selectedCardIndex !== null) onDiscardClick();
          }}
        >
          {secondDiscard && (
            <div className="absolute top-1.5 left-1.5 opacity-60 rounded-xl overflow-hidden" style={{ zIndex: 1 }}>
              <CardComponent card={secondDiscard} isWild={CardValidator.isWildCard(secondDiscard, wildRank)} size="md" />
            </div>
          )}
          <AnimatePresence mode="wait">
            {topDiscard ? (
              <motion.div
                key={`${topDiscard.suit}-${topDiscard.rank}`}
                initial={{ x: 60, y: -30, opacity: 0, rotate: -6, scale: 0.85 }}
                animate={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
                exit={{ x: 60, y: -30, opacity: 0, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className="relative"
                style={{ zIndex: 2 }}
              >
                <CardComponent card={topDiscard} isWild={CardValidator.isWildCard(topDiscard, wildRank)} size="md" />
              </motion.div>
            ) : (
              <div className="w-20 h-28 rounded-xl border-2 border-dashed border-white/15 bg-white/3 flex items-center justify-center" style={{ zIndex: 2 }}>
                <span className="text-white/25 text-[10px] font-semibold tracking-widest">EMPTY</span>
              </div>
            )}
          </AnimatePresence>

          {(canDrawFromDiscard || (hasDrawn && selectedCardIndex !== null)) && (
            <motion.div
              className="absolute inset-0 rounded-xl ring-2 ring-emerald-400/60 ring-offset-2 ring-offset-transparent"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              style={{ zIndex: 3 }}
            />
          )}
        </motion.div>
        <span className="text-white/25 text-[11px] uppercase tracking-widest">Discard</span>
      </div>
    </div>
  );
};
