import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScoreCalculator } from '../../services/ScoreCalculator';
import { PlayerScoreCard } from './PlayerScoreCard';

/**
 * Round results display with carousel
 */
export const RoundResultsView = ({
  gameEngine,
  player1,
  player2,
  wildRank,
  hasKnocked,
  knockedPlayerIndex,
  onNextRound
}) => {
  const [player1CarouselIndex, setPlayer1CarouselIndex] = useState(0);
  const [player2CarouselIndex, setPlayer2CarouselIndex] = useState(0);

  // Reset carousel indices when component mounts
  useEffect(() => {
    setPlayer1CarouselIndex(0);
    setPlayer2CarouselIndex(0);
  }, []);

  // Auto-cycle carousel every 3 seconds
  useEffect(() => {
    const player1Result = ScoreCalculator.calculateScore(player1.getHand(), wildRank);
    const player1Groups = [...player1Result.combinations];
    if (player1Result.remaining.length > 0) {
      player1Groups.push({ type: 'unmatched', cards: player1Result.remaining });
    }

    const player2Result = ScoreCalculator.calculateScore(player2.getHand(), wildRank);
    const player2Groups = [...player2Result.combinations];
    if (player2Result.remaining.length > 0) {
      player2Groups.push({ type: 'unmatched', cards: player2Result.remaining });
    }

    const interval = setInterval(() => {
      setPlayer1CarouselIndex((prev) => (prev + 1) % Math.max(1, player1Groups.length));
      setPlayer2CarouselIndex((prev) => (prev + 1) % Math.max(1, player2Groups.length));
    }, 3000);

    return () => clearInterval(interval);
  }, [player1, player2, wildRank]);

  const player1Result = ScoreCalculator.calculateScore(player1.getHand(), wildRank);
  const player1Groups = [...player1Result.combinations];
  if (player1Result.remaining.length > 0) {
    player1Groups.push({ type: 'unmatched', cards: player1Result.remaining });
  }

  const player2Result = ScoreCalculator.calculateScore(player2.getHand(), wildRank);
  const player2Groups = [...player2Result.combinations];
  if (player2Result.remaining.length > 0) {
    player2Groups.push({ type: 'unmatched', cards: player2Result.remaining });
  }

  const p1Score = player1.roundScores[gameEngine.currentRound - 1] || 0;
  const p2Score = player2.roundScores[gameEngine.currentRound - 1] || 0;

  const getRoundWinner = () => {
    if (p1Score < p2Score) return `${player1.name} 🎉`;
    if (p2Score < p1Score) return `${player2.name} 🎉`;
    return "It's a Tie! 🤝";
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center"
    >
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-full max-w-[90vw]">
        {/* Round End Title */}
        <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-6">
          Round {gameEngine.currentRound} Complete
        </h2>

        {/* Player Scores */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Player 2 */}
          <PlayerScoreCard
            player={player2}
            wildRank={wildRank}
            roundScore={p2Score}
            hasKnocked={hasKnocked}
            isKnocker={knockedPlayerIndex === 1}
            playerGroups={player2Groups}
            carouselIndex={player2CarouselIndex}
          />

          {/* Player 1 */}
          <PlayerScoreCard
            player={player1}
            wildRank={wildRank}
            roundScore={p1Score}
            hasKnocked={hasKnocked}
            isKnocker={knockedPlayerIndex === 0}
            playerGroups={player1Groups}
            carouselIndex={player1CarouselIndex}
          />
        </div>

        {/* Round Winner */}
        <div className="text-center mb-6">
          <div className="text-white/60 text-sm mb-2">Round Winner</div>
          <div className="text-2xl font-bold text-white">
            {getRoundWinner()}
          </div>
        </div>

        {/* Total Scores */}
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

        {/* Next Round Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNextRound}
          className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-white/90 transition-colors"
        >
          {gameEngine.currentRound < 11 ? 'NEXT ROUND' : 'VIEW FINAL RESULTS'}
        </motion.button>
      </div>
    </motion.div>
  );
};
