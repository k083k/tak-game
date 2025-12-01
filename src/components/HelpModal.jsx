import { motion } from 'framer-motion';

/**
 * Help modal displaying game rules and instructions
 */
export const HelpModal = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 rounded-2xl border border-white/20 shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-800/50">
          <h2 className="text-2xl font-black text-white">How to Play</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-6 space-y-6">
          {/* Objective */}
          <section>
            <h3 className="text-xl font-bold text-white mb-2">🎯 Objective</h3>
            <p className="text-white/70 leading-relaxed">
              Be the player with the <span className="text-white font-semibold">lowest total score</span> after 13 rounds. Score points are bad - aim for zero!
            </p>
          </section>

          {/* Setup */}
          <section>
            <h3 className="text-xl font-bold text-white mb-2">📋 Game Setup</h3>
            <ul className="text-white/70 space-y-2 leading-relaxed">
              <li>• <span className="text-white font-semibold">13 rounds</span> total</li>
              <li>• Each round, players receive cards equal to the <span className="text-white font-semibold">round number + 2</span></li>
              <li className="ml-4 text-sm text-white/50">Round 1: 3 cards | Round 2: 4 cards | ... | Round 13: 15 cards</li>
            </ul>
          </section>

          {/* Wild Cards */}
          <section>
            <h3 className="text-xl font-bold text-white mb-2">🃏 Wild Cards</h3>
            <p className="text-white/70 leading-relaxed mb-3">
              Each round has a different wild card rank that can substitute for any card:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                <span className="text-white/50">Round 1:</span> <span className="text-white font-semibold">3s</span>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                <span className="text-white/50">Round 2:</span> <span className="text-white font-semibold">4s</span>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                <span className="text-white/50">Round 3:</span> <span className="text-white font-semibold">5s</span>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                <span className="text-white/50">Round 4:</span> <span className="text-white font-semibold">6s</span>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                <span className="text-white/50">Round 5:</span> <span className="text-white font-semibold">7s</span>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                <span className="text-white/50">Round 6:</span> <span className="text-white font-semibold">8s</span>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                <span className="text-white/50">Round 7:</span> <span className="text-white font-semibold">9s</span>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                <span className="text-white/50">Round 8:</span> <span className="text-white font-semibold">10s</span>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                <span className="text-white/50">Round 9:</span> <span className="text-white font-semibold">Jacks</span>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                <span className="text-white/50">Round 10:</span> <span className="text-white font-semibold">Queens</span>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                <span className="text-white/50">Round 11:</span> <span className="text-white font-semibold">Kings</span>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                <span className="text-white/50">Round 12:</span> <span className="text-white font-semibold">Aces</span>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10 col-span-2">
                <span className="text-white/50">Round 13:</span> <span className="text-white font-semibold">2s</span>
              </div>
            </div>
          </section>

          {/* How to Play */}
          <section>
            <h3 className="text-xl font-bold text-white mb-2">🎮 Turn Structure</h3>
            <ol className="text-white/70 space-y-3 leading-relaxed">
              <li>
                <span className="text-white font-semibold">1. Draw a card</span> - Choose from:
                <ul className="ml-4 mt-1 space-y-1 text-sm">
                  <li>• The face-down deck (unknown card)</li>
                  <li>• The discard pile (visible top card)</li>
                </ul>
              </li>
              <li>
                <span className="text-white font-semibold">2. Discard a card</span> - After drawing, you must discard one card from your hand to the discard pile
              </li>
              <li>
                <span className="text-white font-semibold">3. Knock Window</span> - After discarding, you have a few seconds to decide whether to knock
              </li>
            </ol>
          </section>

          {/* Combinations */}
          <section>
            <h3 className="text-xl font-bold text-white mb-2">🎴 Valid Combinations</h3>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="text-white font-semibold mb-2">Sets (3+ cards of the same rank)</h4>
                <p className="text-white/60 text-sm">
                  Example: 7♠ 7♥ 7♦ or 5♣ 5♦ 3♠ (with wild)
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="text-white font-semibold mb-2">Runs (3+ consecutive cards of same suit)</h4>
                <p className="text-white/60 text-sm">
                  Example: 4♥ 5♥ 6♥ or 9♠ 10♠ J♠
                </p>
              </div>
              <p className="text-white/60 text-sm italic">
                Note: You don't need to arrange combinations during play. The game automatically calculates your best possible score.
              </p>
            </div>
          </section>

          {/* Knocking */}
          <section>
            <h3 className="text-xl font-bold text-white mb-2">👊 Knocking</h3>
            <p className="text-white/70 leading-relaxed mb-3">
              When your hand score reaches <span className="text-white font-semibold">0 points</span> (all cards in valid combinations), you can knock:
            </p>
            <ul className="text-white/70 space-y-2 leading-relaxed">
              <li>• After you discard, a knock window appears</li>
              <li>• Click "KNOCK" to end the round</li>
              <li>• Your opponent gets ONE final turn</li>
              <li>• The round ends and scores are calculated</li>
            </ul>
            <p className="text-amber-400/80 text-sm mt-3 bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
              <span className="font-semibold">Strategic Note:</span> You should only knock when your score is 0. Knocking with a higher score is risky because your opponent might have a lower score and win the round!
            </p>
          </section>

          {/* Scoring */}
          <section>
            <h3 className="text-xl font-bold text-white mb-2">📊 Scoring</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-white font-semibold mb-2">Card Values:</h4>
                <ul className="text-white/70 space-y-1 text-sm">
                  <li>• Number cards (2-10): Face value</li>
                  <li>• Face cards (J, Q, K): 10 points each</li>
                  <li>• Aces: <span className="text-white font-semibold">15 points</span></li>
                  <li>• Joker: <span className="text-red-400 font-semibold">50 points</span></li>
                </ul>
                <p className="text-white/60 text-xs mt-2 italic">
                  Note: Wild cards that are not used in combinations are worth their face value (e.g., a wild 3 = 3 points, wild King = 10 points)
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="text-white font-semibold mb-2">Round Scoring:</h4>
                <p className="text-white/60 text-sm">
                  The game finds your best possible combinations. Any remaining cards that don't fit = your round score. This score is added to your total score.
                </p>
              </div>
              <p className="text-white/70">
                After 13 rounds, the player with the <span className="text-white font-semibold">lowest total score wins!</span>
              </p>
            </div>
          </section>

          {/* Difficulty Modes */}
          <section>
            <h3 className="text-xl font-bold text-white mb-2">⚙️ Difficulty Modes</h3>
            <div className="space-y-2">
              <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                <h4 className="text-green-400 font-semibold mb-1">Easy Mode</h4>
                <p className="text-white/60 text-sm">
                  Score is displayed • 3-second knock window
                </p>
              </div>
              <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                <h4 className="text-red-400 font-semibold mb-1">Hard Mode</h4>
                <p className="text-white/60 text-sm">
                  Score is hidden (calculate manually) • 1-second knock window
                </p>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-xl font-bold text-white mb-2">💡 Strategy Tips</h3>
            <ul className="text-white/70 space-y-2 leading-relaxed text-sm">
              <li>• <span className="text-white font-semibold">Wild cards are powerful</span> - They're worth 25 points if unused, so always try to include them in combinations!</li>
              <li>• <span className="text-white font-semibold">Watch the discard pile</span> - Pay attention to what your opponent discards</li>
              <li>• <span className="text-white font-semibold">Don't rush to knock</span> - Make sure your score is truly 0</li>
              <li>• <span className="text-white font-semibold">Card management</span> - Hold cards that could form multiple different combinations</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-slate-800/50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-white/90 transition-colors"
          >
            Got it!
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
