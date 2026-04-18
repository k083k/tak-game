import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PlayerCard = ({ player, isWinner }) => (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: isWinner ? 0.5 : 0.6, type: 'spring' }}
      className={`relative p-6 rounded-2xl text-center border-2 overflow-hidden ${
        isWinner
          ? 'bg-white/10 border-white/40'
          : 'bg-white/5 border-white/10'
      }`}
    >
      {isWinner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"
        />
      )}
      <div className="relative">
        <div className="relative inline-block mb-3">
          <div className="text-4xl">{player.avatar}</div>
          {isWinner && (
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.9, type: 'spring', stiffness: 300 }}
              className="absolute -top-2 -right-2 text-lg"
            >
              👑
            </motion.div>
          )}
        </div>
        <h4 className="text-white/70 font-semibold text-sm mb-3">{player.name}</h4>
        <div className={`text-5xl font-black mb-1 ${isWinner ? 'text-white' : 'text-white/60'}`}>
          {player.getTotalScore()}
        </div>
        <p className="text-white/30 text-xs uppercase tracking-widest">Total Points</p>
        {isWinner && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-3 text-xs font-bold text-emerald-400 uppercase tracking-wider"
          >
            Winner
          </motion.div>
        )}
      </div>
    </motion.div>
  );

export const GameOverModal = ({ gameEngine, onNewGame, isOnline = false }) => {
  const [countdown, setCountdown] = useState(isOnline ? 10 : null);

  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); onNewGame(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOnline, onNewGame]);

  if (!gameEngine || !gameEngine.isGameOver()) return null;

  const winner = gameEngine.getWinner();
  const player1 = gameEngine.player1;
  const player2 = gameEngine.player2;
  const isTie = !winner;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-white/10 max-h-[90vh] overflow-y-auto"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-7xl mb-4"
          >
            {isTie ? '🤝' : '🏆'}
          </motion.div>
          <h2 className="text-4xl font-black text-white mb-2">Game Over</h2>
          <p className="text-xl font-bold text-white/70">
            {isTie ? "It's a Tie!" : `${winner.name} Wins!`}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <PlayerCard player={player1} isWinner={winner === player1} />
          <PlayerCard player={player2} isWinner={winner === player2} />
        </div>

        <motion.button
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewGame}
          className="w-full py-3.5 bg-white text-slate-900 rounded-xl font-black text-base shadow-xl hover:shadow-2xl transition-shadow"
        >
          {isOnline ? `BACK TO LOBBY${countdown ? ` (${countdown})` : ''}` : 'PLAY AGAIN'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
