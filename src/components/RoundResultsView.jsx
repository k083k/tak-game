import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardComponent } from './CardComponent';
import { CardValidator } from '../services/CardValidator';
import { ScoreCalculator } from '../services/ScoreCalculator';

const PlayerResultCard = ({ player, wildRank, hasKnocked, knockedPlayerIndex, playerIndex, carouselIndex }) => {
  const result = ScoreCalculator.calculateScore(player.getHand(), wildRank);
  const groups = [...result.combinations];
  if (result.remaining.length > 0) groups.push({ type: 'unmatched', cards: result.remaining });

  if (groups.length === 0) {
    return (
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">{player.avatar}</div>
            <div className="text-white font-semibold text-sm">{player.name}</div>
          </div>
          <div className="text-xl font-bold text-white">{player.roundScores[player.roundScores.length - 1] || 0} pts</div>
        </div>
        <div className="flex-1 flex items-center justify-center text-white/60">Perfect hand!</div>
      </div>
    );
  }

  const safeIndex = Math.min(carouselIndex, groups.length - 1);
  const currentGroup = groups[safeIndex];
  const isUnmatched = currentGroup?.type === 'unmatched';

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-2xl">{player.avatar}</div>
          <div>
            <div className="text-white font-semibold text-sm">
              {player.name}
              {hasKnocked && knockedPlayerIndex === playerIndex && (
                <span className="text-xs text-amber-400 ml-1">👊</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-2xl font-bold text-white">{player.roundScores[player.roundScores.length - 1] || 0} pts</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <div className={`text-lg ${isUnmatched ? 'text-red-500' : 'text-green-500'}`}>
          {isUnmatched ? '✗' : '✓'}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={safeIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex gap-1"
          >
            {currentGroup.cards.map((card, cardIdx) => (
              <div key={cardIdx} className="w-8 h-11 shrink-0">
                <CardComponent card={card} size="xs" isWild={CardValidator.isWildCard(card, wildRank)} />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-1.5">
        {groups.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-colors ${idx === safeIndex ? 'bg-white' : 'bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
};

const RoundResultsViewInner = ({ player1, player2, wildRank, currentRound, hasKnocked, knockedPlayerIndex, onNextRound }) => {
  const [p1Index, setP1Index] = useState(0);
  const [p2Index, setP2Index] = useState(0);

  useEffect(() => {
    const p1Groups = ScoreCalculator.calculateScore(player1.getHand(), wildRank);
    const p1Len = p1Groups.combinations.length + (p1Groups.remaining.length > 0 ? 1 : 0);
    const p2Groups = ScoreCalculator.calculateScore(player2.getHand(), wildRank);
    const p2Len = p2Groups.combinations.length + (p2Groups.remaining.length > 0 ? 1 : 0);

    const interval = setInterval(() => {
      setP1Index((prev) => (prev + 1) % Math.max(1, p1Len));
      setP2Index((prev) => (prev + 1) % Math.max(1, p2Len));
    }, 3000);
    return () => clearInterval(interval);
  }, [player1, player2, wildRank]);

  const p1RoundScore = player1.roundScores[player1.roundScores.length - 1] || 0;
  const p2RoundScore = player2.roundScores[player2.roundScores.length - 1] || 0;

  const roundWinner = p1RoundScore < p2RoundScore
    ? `${player1.name} 🎉`
    : p2RoundScore < p1RoundScore
    ? `${player2.name} 🎉`
    : "It's a Tie! 🤝";

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center"
    >
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-full max-w-[90vw]">
        <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-6">
          Round {currentRound} Complete
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 min-h-[280px]">
            <PlayerResultCard
              player={player2}
              wildRank={wildRank}
              hasKnocked={hasKnocked}
              knockedPlayerIndex={knockedPlayerIndex}
              playerIndex={1}
              carouselIndex={p2Index}
            />
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 min-h-[280px]">
            <PlayerResultCard
              player={player1}
              wildRank={wildRank}
              hasKnocked={hasKnocked}
              knockedPlayerIndex={knockedPlayerIndex}
              playerIndex={0}
              carouselIndex={p1Index}
            />
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="text-white/60 text-sm mb-2">Round Winner</div>
          <div className="text-2xl font-bold text-white">{roundWinner}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-center">
          <div>
            <div className="text-white/60 text-xs mb-1">Total Score</div>
            <div className="text-xl font-bold text-white">{player2.getTotalScore()}</div>
          </div>
          <div>
            <div className="text-white/60 text-xs mb-1">Total Score</div>
            <div className="text-xl font-bold text-white">{player1.getTotalScore()}</div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNextRound}
          className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-white/90 transition-colors"
        >
          {currentRound < 11 ? 'NEXT ROUND' : 'VIEW FINAL RESULTS'}
        </motion.button>
      </div>
    </motion.div>
  );
};

// key={currentRound} resets carousel indices automatically on round change
export const RoundResultsView = (props) => (
  <RoundResultsViewInner key={props.currentRound} {...props} />
);
