import { motion } from 'framer-motion';

export const ExitConfirmModal = ({ onConfirm, onCancel }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-sm w-full border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Red accent strip */}
        <div className="h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600" />

        <div className="p-7">
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <span className="text-2xl">🚪</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight mb-1.5">Leave the game?</h2>
            <p className="text-white/45 text-sm leading-relaxed max-w-[240px]">
              Your progress will be saved and you can resume later.
            </p>
          </div>

          <div className="flex gap-2.5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 text-white/70 hover:text-white font-semibold text-sm transition-colors"
            >
              Stay
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl bg-red-500/90 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-900/30 transition-colors"
            >
              Leave
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
