import { motion } from 'framer-motion';

/**
 * Round information bar with help, pause, and exit buttons
 */
export const RoundInfoBar = ({
  currentRound,
  wildRank,
  onShowHelp,
  onPause,
  onShowExit
}) => {
  const getWildDisplay = () => {
    const ranks = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
    return ranks[wildRank] || wildRank.toString();
  };

  return (
    <div className="px-4 py-3 bg-black/20 border-b border-white/10 text-center relative">
      <div className="text-white/90 text-sm font-medium tracking-wide">
        Round <span className="font-bold">{currentRound}</span> of 11
        <span className="mx-3 text-white/30">•</span>
        Wild <span className="text-white/70 font-semibold">{getWildDisplay()}</span>
      </div>

      {/* Help, Pause & Exit Buttons */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShowHelp}
          className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/60 hover:text-white/90 transition-colors text-base"
          title="Help"
        >
          ?
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPause}
          className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/60 hover:text-white/90 transition-colors text-base"
          title="Pause Game"
        >
          ⏸
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShowExit}
          className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/60 hover:text-white/90 transition-colors"
          title="Exit Game"
        >
          ✕
        </motion.button>
      </div>
    </div>
  );
};
