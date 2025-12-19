import { motion, AnimatePresence } from 'framer-motion';
import { CardComponent } from '../CardComponent';
import { CardValidator } from '../../services/CardValidator';

/**
 * Player score card for round results
 */
export const PlayerScoreCard = ({
  player,
  wildRank,
  roundScore,
  hasKnocked,
  isKnocker,
  playerGroups,
  carouselIndex
}) => {
  if (playerGroups.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl p-6 border border-white/10 min-h-[280px]">
        <div className="flex flex-col gap-4 h-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-2xl">{player.avatar}</div>
              <div className="text-white font-semibold text-sm">{player.name}</div>
            </div>
            <div className="text-xl font-bold text-white">
              {roundScore} pts
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center text-white/60">Perfect hand!</div>
        </div>
      </div>
    );
  }

  const safeCarouselIndex = Math.min(carouselIndex, playerGroups.length - 1);
  const currentGroup = playerGroups[safeCarouselIndex];
  const isUnmatched = currentGroup?.type === 'unmatched';

  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10 min-h-[280px]">
      <div className="flex flex-col gap-4 h-full">
        {/* Row 1: Avatar+Name on left, Points on right */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">{player.avatar}</div>
            <div>
              <div className="text-white font-semibold text-sm">
                {player.name} {hasKnocked && isKnocker && (
                  <span className="text-xs text-amber-400 ml-1">👊</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {roundScore} pts
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
              key={safeCarouselIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex gap-1"
            >
              {currentGroup.cards.map((card, cardIdx) => (
                <div key={cardIdx} className="w-8 h-11 shrink-0">
                  <CardComponent
                    card={card}
                    size="xs"
                    isWild={CardValidator.isWildCard(card, wildRank)}
                  />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Row 3: Indicator Dots centered */}
        <div className="flex justify-center gap-1.5">
          {playerGroups.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === carouselIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
