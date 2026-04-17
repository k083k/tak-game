import { motion } from 'framer-motion';
import { CardComponent } from './CardComponent';
import { CardValidator } from '../services/CardValidator';

const ThinkingDots = () => (
  <div className="flex gap-1 items-center">
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-blue-400"
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

export const OpponentPanel = ({ player, wildRank, gameMode, showRoundResults, isOpponentTurn }) => {
  const hand = player.getHand();
  const isAiThinking = isOpponentTurn && gameMode === 'pvc';

  const getRowDistribution = (handSize) => {
    if (handSize <= 3) return [handSize];
    if (handSize === 4) return [2, 2];
    if (handSize === 5) return [3, 2];
    if (handSize === 6) return [3, 3];
    if (handSize === 7) return [4, 3];
    if (handSize === 8) return [3, 3, 2];
    if (handSize === 9) return [3, 3, 3];
    if (handSize === 10) return [3, 3, 2, 2];
    if (handSize === 11) return [3, 3, 3, 2];
    if (handSize === 12) return [3, 3, 3, 3];
    if (handSize === 13) return [4, 4, 3, 2];
    return [4, 4, 4, 2];
  };

  const splitIntoRows = (cards) => {
    const distribution = getRowDistribution(cards.length);
    const rows = [];
    let startIndex = 0;
    for (const rowSize of distribution) {
      rows.push(cards.slice(startIndex, startIndex + rowSize));
      startIndex += rowSize;
    }
    return rows;
  };

  const rows = splitIntoRows(hand);

  return (
    <div className={`w-80 h-full flex flex-col items-center justify-center bg-black/20 border-r border-white/10 p-2 gap-3 transition-all duration-300 relative ${
      isOpponentTurn ? 'bg-black/30' : ''
    }`}>
      {/* Active turn indicator — top edge glow */}
      {isOpponentTurn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
        />
      )}

      <div className="flex flex-col items-center gap-2 mb-4">
        {/* Avatar with active ring */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
          isOpponentTurn
            ? 'bg-blue-500/20 border-2 border-blue-400/60 shadow-lg shadow-blue-500/20'
            : 'bg-white/10 border-2 border-white/20'
        }`}>
          {player.avatar}
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="text-white/40 text-[10px] uppercase tracking-wider text-center">
            {player.name}
          </div>
          {isOpponentTurn && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5"
            >
              {isAiThinking ? (
                <>
                  <span className="text-blue-400 text-[10px] uppercase tracking-wider">Thinking</span>
                  <ThinkingDots />
                </>
              ) : (
                <span className="text-blue-400 text-[10px] uppercase tracking-wider">Their turn</span>
              )}
            </motion.div>
          )}
        </div>

        <div className="text-xl font-bold text-white">{player.getTotalScore()}</div>
      </div>

      <div className="flex flex-col gap-2 items-center flex-1 justify-center overflow-y-auto overflow-x-hidden">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((card, cardIndex) => {
              const globalIndex = rows.slice(0, rowIndex).reduce((sum, r) => sum + r.length, 0) + cardIndex;
              return (
                <motion.div
                  key={globalIndex}
                  initial={{ scale: 0, rotateY: showRoundResults ? 180 : 0 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ delay: globalIndex * 0.05, duration: 0.3 }}
                  style={{ marginLeft: cardIndex === 0 ? '0' : '-16px' }}
                >
                  <CardComponent
                    card={card}
                    isHidden={gameMode === 'pvc' && !showRoundResults}
                    isWild={CardValidator.isWildCard(card, wildRank)}
                    size="sm"
                  />
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
