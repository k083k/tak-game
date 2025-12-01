import { motion } from 'framer-motion';

/**
 * Modal displaying round end results - clean minimalist design
 */
export const RoundEndModal = ({ roundResult, onNextRound }) => {
  if (!roundResult) return null;

  const renderCombinations = (playerResult) => {
    if (playerResult.combinations.length === 0) {
      return <p className="text-white/60 italic text-sm">No sets or runs</p>;
    }

    return (
      <div className="space-y-1">
        {playerResult.combinations.map((combo, index) => (
          <div key={index} className="text-sm text-white/80">
            <span className="font-semibold capitalize">{combo.type}:</span>{' '}
            {combo.cards.map(c => c.toString()).join(', ')}
          </div>
        ))}
      </div>
    );
  };

  const renderRemaining = (playerResult) => {
    if (playerResult.remaining.length === 0) {
      return <p className="text-white/70 font-semibold text-sm">Perfect hand</p>;
    }

    return (
      <p className="text-white/60 text-sm">
        <span className="font-semibold">Remaining:</span>{' '}
        {playerResult.remaining.map(c => c.toString()).join(', ')}
      </p>
    );
  };

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
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full p-8 border border-white/10"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-3">🎯</div>
          <h2 className="text-4xl font-black text-white">
            Round {roundResult.round} Complete
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Player 1 Results */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-4">{roundResult.player1.name}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/50">Round:</span>
                <span className="text-3xl font-bold text-white">{roundResult.player1.score}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50">Total:</span>
                <span className="text-xl font-bold text-white">{roundResult.player1.totalScore}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                {renderCombinations(roundResult.player1)}
              </div>
              <div className="mt-3">
                {renderRemaining(roundResult.player1)}
              </div>
            </div>
          </motion.div>

          {/* Player 2 Results */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              {roundResult.player2.name || 'Player 2'}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/50">Round:</span>
                <span className="text-3xl font-bold text-white">{roundResult.player2.score}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50">Total:</span>
                <span className="text-xl font-bold text-white">{roundResult.player2.totalScore}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                {renderCombinations(roundResult.player2)}
              </div>
              <div className="mt-3">
                {renderRemaining(roundResult.player2)}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onNextRound}
          className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl transition-shadow"
        >
          NEXT ROUND →
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
