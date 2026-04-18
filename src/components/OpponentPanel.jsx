import { motion } from 'framer-motion';
import { CardComponent } from './CardComponent';
import { CardValidator } from '../services/CardValidator';

const ThinkingDots = () => (
  <div className="flex gap-1 items-center">
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-blue-400"
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

const getOverlap = (count) => {
  if (count <= 5) return 6;
  if (count <= 8) return 18;
  if (count <= 11) return 26;
  return 34;
};

export const OpponentPanel = ({ player, wildRank, gameMode, showRoundResults, isOpponentTurn }) => {
  const hand = player.getHand();
  const isAiThinking = isOpponentTurn && gameMode === 'pvc';
  const overlap = getOverlap(hand.length);

  return (
    <div className={`shrink-0 relative flex items-center gap-5 px-6 py-3 border-b border-white/[0.07] transition-colors duration-300 ${
      isOpponentTurn ? 'bg-blue-950/20' : 'bg-black/15'
    }`}>
      {/* Active turn glow — top edge */}
      {isOpponentTurn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
        />
      )}

      {/* Player info */}
      <div className="shrink-0 flex items-center gap-3 w-44">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 transition-all duration-300 ${
          isOpponentTurn
            ? 'bg-blue-500/20 border-2 border-blue-400/60 shadow-lg shadow-blue-500/20'
            : 'bg-white/8 border border-white/15'
        }`}>
          {player.avatar}
        </div>
        <div className="min-w-0">
          <div className="text-white/40 text-[11px] uppercase tracking-wider truncate">{player.name}</div>
          {isOpponentTurn && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5 mt-0.5">
              {isAiThinking ? (
                <>
                  <span className="text-blue-400 text-[11px]">Thinking</span>
                  <ThinkingDots />
                </>
              ) : (
                <span className="text-blue-400 text-[11px]">Their turn</span>
              )}
            </motion.div>
          )}
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-white font-bold text-base">{player.getTotalScore()}</span>
            <span className="text-white/25 text-[10px] uppercase tracking-wider">total</span>
          </div>
        </div>
      </div>

      {/* Card fan */}
      <div className="flex-1 flex justify-center overflow-hidden py-1">
        {hand.length === 0 ? (
          <div className="text-white/20 text-sm italic">No cards</div>
        ) : (
          <div className="flex items-center">
            {hand.map((card, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                style={{ marginLeft: i === 0 ? 0 : `-${overlap}px`, zIndex: i }}
                className="relative"
              >
                <CardComponent
                  card={card}
                  isHidden={(gameMode === 'pvc' || gameMode === 'online') && !showRoundResults}
                  isWild={CardValidator.isWildCard(card, wildRank)}
                  size="sm"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Card count badge */}
      <div className="shrink-0 w-10 text-center">
        <div className="text-white/25 text-[10px] uppercase tracking-wider">Cards</div>
        <div className="text-white/60 font-bold text-sm">{hand.length}</div>
      </div>
    </div>
  );
};
