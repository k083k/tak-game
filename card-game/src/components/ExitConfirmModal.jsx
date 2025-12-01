import { motion } from 'framer-motion';

/**
 * Modal for confirming game exit
 */
export const ExitConfirmModal = ({ onConfirm, onCancel }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Exit Game?
          </h2>
          <p className="text-white/60 text-sm">
            Your current progress will be lost. Are you sure you want to exit?
          </p>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors border border-white/20"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            className="flex-1 py-3 bg-white text-slate-900 rounded-xl font-semibold text-sm hover:shadow-xl transition-shadow"
          >
            Exit Game
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
