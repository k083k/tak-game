import { motion } from 'framer-motion';

/**
 * Turn status indicator with knock countdown
 */
export const TurnIndicator = ({
  message,
  knockCountdown,
  playerScore,
  isPlayerTurn,
  hasKnocked
}) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="px-6 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
        <div className="text-white/80 text-center font-medium">{message}</div>
      </div>

      {knockCountdown !== null && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-6xl font-black text-white"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {knockCountdown}
          </motion.div>
        </motion.div>
      )}

      {playerScore === 0 && isPlayerTurn && !hasKnocked && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white/70 text-sm font-medium"
        >
          Perfect Hand
        </motion.div>
      )}
    </div>
  );
};
