import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const KnockAnnouncement = ({ knockerName, isMyKnock, isVisible, onDone }) => {
  useEffect(() => {
    if (!isVisible) return;
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, [isVisible, onDone]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
        >
          {/* Radial burst */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            className="absolute w-64 h-64 rounded-full bg-amber-400/20"
          />

          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 340, damping: 22 }}
            className="flex flex-col items-center gap-3 select-none"
          >
            {/* Fist icon */}
            <motion.div
              animate={{ rotate: [0, -12, 8, -6, 4, 0], y: [0, -8, 0, -4, 0] }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-7xl leading-none"
            >
              👊
            </motion.div>

            {/* Text */}
            <div className="flex flex-col items-center gap-1">
              <motion.div
                initial={{ opacity: 0, letterSpacing: '0.3em' }}
                animate={{ opacity: 1, letterSpacing: '0.15em' }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-amber-300 text-xs font-black uppercase tracking-[0.15em]"
              >
                {knockerName}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, type: 'spring', stiffness: 300 }}
                className="text-white font-black text-3xl tracking-tight leading-none"
              >
                Knocked!
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/40 text-xs font-medium tracking-wide"
              >
                {isMyKnock ? 'Opponent gets one final turn' : 'You get one final turn'}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
