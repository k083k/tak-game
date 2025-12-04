import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpModal } from './HelpModal';

/**
 * Setup screen - clean minimalist design
 */
export const SetupScreen = ({
  gameMode,
  setGameMode,
  playerName,
  setPlayerName,
  playerAvatar,
  setPlayerAvatar,
  difficulty,
  setDifficulty,
  onStartGame
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const avatars = ['👤', '😎', '🎮', '👨', '👩', '🧑', '🤓', '😊'];

  return (
    <div className="min-h-screen w-screen overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full my-8"
      >
        {/* Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className="text-5xl md:text-6xl mb-2 md:mb-3"
          >
            🎴
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-1 md:mb-2">Card Game</h1>
          <p className="text-white/50 text-sm md:text-base">11 Rounds of Strategy</p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Left Column - Player Customization */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10"
          >
            <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">Customize Your Profile</h3>

            {/* Name Input */}
            <div className="mb-4">
              <label className="text-white/60 text-xs uppercase tracking-wide mb-2 block">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
                placeholder="Enter your name (optional)"
              />
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="text-white/60 text-xs uppercase tracking-wide mb-2 block">Choose Avatar</label>
              <div className="grid grid-cols-4 gap-2">
                {avatars.map((avatar) => (
                  <motion.button
                    key={avatar}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setPlayerAvatar(avatar)}
                    className={`w-full aspect-square rounded-xl flex items-center justify-center text-xl transition-all ${
                      playerAvatar === avatar
                        ? 'bg-white/20 border-2 border-white/40 scale-110'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {avatar}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Game Settings */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10"
          >
            <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">Game Settings</h3>

            {/* Game Mode */}
            <div className="mb-4">
              <label className="text-white/60 text-xs uppercase tracking-wide mb-2 block">Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setGameMode('pvc')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    gameMode === 'pvc'
                      ? 'bg-white/10 border-white/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-3xl mb-1">🤖</div>
                  <div className="text-white font-bold text-sm">vs Computer</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setGameMode('pvp')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    gameMode === 'pvp'
                      ? 'bg-white/10 border-white/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-3xl mb-1">👥</div>
                  <div className="text-white font-bold text-sm">vs Player</div>
                </motion.button>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-white/60 text-xs uppercase tracking-wide mb-2 block">Difficulty</label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDifficulty('easy')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    difficulty === 'easy'
                      ? 'bg-white/10 border-white/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-3xl mb-1">😊</div>
                  <div className="text-white font-bold text-sm">Easy</div>
                  <div className="text-white/60 text-xs mt-0.5">Score shown • 3s knock</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDifficulty('hard')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    difficulty === 'hard'
                      ? 'bg-white/10 border-white/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-3xl mb-1">🔥</div>
                  <div className="text-white font-bold text-sm">Hard</div>
                  <div className="text-white/60 text-xs mt-0.5">Score hidden • 1s knock</div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* How to Play Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setShowHelp(true)}
          className="w-full bg-white/5 backdrop-blur-sm rounded-2xl p-4 mb-5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">📖</span>
            <div className="text-left">
              <div className="text-white font-semibold text-sm">How to Play</div>
              <div className="text-white/60 text-xs">View complete game rules and instructions</div>
            </div>
          </div>
        </motion.button>

        {/* Start Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onStartGame}
          className="w-full py-3.5 bg-white text-slate-900 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl transition-shadow"
        >
          START GAME
        </motion.button>
      </motion.div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <HelpModal onClose={() => setShowHelp(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};
