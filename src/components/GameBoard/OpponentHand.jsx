import { motion } from 'framer-motion';
import { CardComponent } from '../CardComponent';
import { CardValidator } from '../../services/CardValidator';

/**
 * Opponent's hand display (vertical layout on left side)
 */
export const OpponentHand = ({
  player,
  wildRank,
  gameMode,
  showRoundResults
}) => {
  // Calculate how to split cards into rows
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
    if (handSize >= 14) return [4, 4, 4, 2];
    return [handSize];
  };

  const splitIntoRows = (hand) => {
    const distribution = getRowDistribution(hand.length);
    const rows = [];
    let startIndex = 0;

    for (const rowSize of distribution) {
      rows.push(hand.slice(startIndex, startIndex + rowSize));
      startIndex += rowSize;
    }

    return rows;
  };

  const opponentRows = splitIntoRows(player.getHand());

  return (
    <div className="w-80 h-full flex flex-col items-center justify-center bg-black/20 border-r border-white/10 p-2 gap-3">
      {/* Opponent info header */}
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl">
          {player.avatar || '🤖'}
        </div>
        <div className="text-white/40 text-[10px] uppercase tracking-wider text-center">
          {player.name}
        </div>
        <div className="text-xl font-bold text-white">
          {player.getTotalScore()}
        </div>
      </div>

      {/* Opponent Hand - Multi-row Layout with Overlapping Cards */}
      <div className="flex flex-col gap-2 items-center flex-1 justify-center overflow-y-auto overflow-x-hidden">
        {opponentRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((card, cardIndex) => {
              const globalIndex = opponentRows.slice(0, rowIndex).reduce((sum, r) => sum + r.length, 0) + cardIndex;
              return (
                <motion.div
                  key={globalIndex}
                  initial={{ scale: 0, rotateY: showRoundResults ? 180 : 0 }}
                  animate={{
                    scale: 1,
                    rotateY: 0
                  }}
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
