import { motion } from 'framer-motion';

/**
 * Modal displaying game over results - clean minimalist design
 */
export const GameOverModal = ({ gameEngine, onNewGame }) => {
  if (!gameEngine || !gameEngine.isGameOver()) return null;

  const winner = gameEngine.getWinner();
  const player1 = gameEngine.player1;
  const player2 = gameEngine.player2;

  const getWinnerText = () => {
    if (!winner) return "It's a Tie!";
    return `${winner.name} Wins!`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full p-4 md:p-10 border border-white/10 max-h-[90vh] overflow-y-auto"
      >
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-6 md:mb-10"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-6xl md:text-9xl mb-3 md:mb-4"
          >
            {winner ? '🏆' : '🤝'}
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-2 md:mb-3">
            Game Over
          </h2>
          <p className="text-2xl md:text-4xl font-bold text-white">
            {getWinnerText()}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-10"
        >
          <div className={`p-4 md:p-6 rounded-2xl text-center border-2 ${
            winner === player1
              ? 'bg-white/10 border-white/30'
              : 'bg-white/5 border-white/10'
          }`}>
            <div className="text-3xl md:text-4xl mb-2 md:mb-3">
              {winner === player1 ? '👑' : '👤'}
            </div>
            <h4 className="text-base md:text-lg font-semibold text-white/70 mb-2 md:mb-3">{player1.name}</h4>
            <p className="text-3xl md:text-5xl font-black text-white mb-2">{player1.getTotalScore()}</p>
            <p className="text-xs text-white/50">FINAL SCORE</p>
          </div>

          <div className={`p-4 md:p-6 rounded-2xl text-center border-2 ${
            winner === player2
              ? 'bg-white/10 border-white/30'
              : 'bg-white/5 border-white/10'
          }`}>
            <div className="text-3xl md:text-4xl mb-2 md:mb-3">
              {winner === player2 ? '👑' : '🤖'}
            </div>
            <h4 className="text-base md:text-lg font-semibold text-white/70 mb-2 md:mb-3">{player2.name}</h4>
            <p className="text-3xl md:text-5xl font-black text-white mb-2">{player2.getTotalScore()}</p>
            <p className="text-xs text-white/50">FINAL SCORE</p>
          </div>
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onNewGame}
          className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl transition-shadow"
        >
          PLAY AGAIN
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
