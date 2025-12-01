import { motion } from 'framer-motion';

/**
 * Pause menu overlay
 */
export const PauseMenu = ({ onResume, onExit }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/10"
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⏸️</div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Game Paused
          </h2>
          <p className="text-white/60 text-sm">
            Take a break. Your game is safe.
          </p>
        </div>

        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onResume}
            className="w-full py-3 bg-white text-slate-900 rounded-xl font-semibold text-base hover:shadow-xl transition-shadow"
          >
            Resume Game
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExit}
            className="w-full py-3 bg-white/10 text-white rounded-xl font-semibold text-base hover:bg-white/20 transition-colors border border-white/20"
          >
            Exit to Menu
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
