import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modal to ask user if they want to resume a saved game
 */
export const ResumeGameModal = ({ onResume, onStartNew }) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl"
        >
          {/* Icon */}
          <div className="text-6xl text-center mb-4">💾</div>

          {/* Title */}
          <h2 className="text-3xl font-black text-white text-center mb-3">
            Game Found
          </h2>

          {/* Message */}
          <p className="text-white/70 text-center mb-8">
            You have a saved game in progress. Would you like to continue where you left off?
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onResume}
              className="w-full py-3.5 bg-white text-slate-900 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl transition-shadow"
            >
              RESUME GAME
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartNew}
              className="w-full py-3.5 bg-white/10 text-white border border-white/20 rounded-xl font-semibold text-base hover:bg-white/15 transition-colors"
            >
              Start New Game
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
