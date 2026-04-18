import { motion, AnimatePresence } from 'framer-motion';

export const ResumeGameModal = ({ onResume, onStartNew }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-sm w-full border border-white/10 overflow-hidden"
        >
          {/* Accent strip */}
          <div className="h-1 bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600" />

          <div className="p-7">
            <div className="flex flex-col items-center text-center mb-7">
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4"
              >
                <span className="text-2xl">♻️</span>
              </motion.div>
              <h2 className="text-xl font-black text-white tracking-tight mb-1.5">Game in progress</h2>
              <p className="text-white/45 text-sm leading-relaxed max-w-[240px]">
                You have an unfinished game. Pick up where you left off?
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onResume}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-sm tracking-wide shadow-lg shadow-emerald-900/30 transition-colors"
              >
                RESUME
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onStartNew}
                className="w-full py-3 rounded-xl bg-white/6 hover:bg-white/10 border border-white/10 text-white/55 hover:text-white/80 font-semibold text-sm transition-colors"
              >
                Start fresh
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
