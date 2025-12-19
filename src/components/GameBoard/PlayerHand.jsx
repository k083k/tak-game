import { motion, AnimatePresence } from 'framer-motion';
import { CardComponent } from '../CardComponent';
import { CardValidator } from '../../services/CardValidator';

/**
 * Player's hand display (vertical layout on right side)
 */
export const PlayerHand = ({
  player,
  wildRank,
  difficulty,
  selectedCardIndex,
  cardToMove,
  hasDrawn,
  isPlayerTurn,
  isRoundOver,
  isPaused,
  playerScore,
  canKnock,
  draggedCard,
  dropTarget,
  onCardClick,
  onCardDoubleClick,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragEnd,
  onKnock
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

  const playerRows = splitIntoRows(player.getHand());

  return (
    <div className="w-80 h-full flex flex-col items-center justify-center bg-black/20 border-l border-white/10 p-2 gap-3">
      {/* Player info header */}
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl">
          {player.avatar || '👤'}
        </div>
        <div className="text-white/40 text-[10px] uppercase tracking-wider text-center">
          {player.name}
        </div>
        <div className="text-xl font-bold text-white">
          {player.getTotalScore()}
        </div>
      </div>

      {/* Player Hand - Multi-row Layout with Overlapping Cards */}
      <div className="flex flex-col gap-1 items-center flex-1 justify-center overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="popLayout">
          {playerRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((card, cardIndex) => {
                const globalIndex = playerRows.slice(0, rowIndex).reduce((sum, r) => sum + r.length, 0) + cardIndex;
                const isSelectedForDiscard = hasDrawn && selectedCardIndex === globalIndex;
                const isSelectedForMove = !hasDrawn && cardToMove === globalIndex;
                const isAnyCardSelected = isSelectedForDiscard || isSelectedForMove;

                const isDraggable = !hasDrawn && !isRoundOver && isPlayerTurn && !isPaused;

                return (
                  <motion.div
                    key={`${card.suit}-${card.rank}-${globalIndex}`}
                    layout
                    draggable={isDraggable}
                    onDragStart={(e) => onDragStart(e, globalIndex, isDraggable)}
                    onDragOver={(e) => onDragOver(e, globalIndex, isDraggable)}
                    onDragEnter={(e) => onDragEnter(e, globalIndex, isDraggable)}
                    onDragLeave={(e) => onDragLeave(e, globalIndex)}
                    onDrop={(e) => onDrop(e, globalIndex, isDraggable)}
                    onDragEnd={onDragEnd}
                    initial={{ x: -100, y: -50, opacity: 0, rotateY: 180, scale: 0.8 }}
                    animate={{
                      x: isAnyCardSelected ? 10 : 0,
                      opacity: draggedCard === globalIndex ? 0.5 : 1,
                      rotateY: 0,
                      scale: isAnyCardSelected ? 1.15 : dropTarget === globalIndex ? 1.1 : 1
                    }}
                    exit={{ x: -100, y: -50, opacity: 0, scale: 0.8 }}
                    transition={{
                      layout: { duration: 0.3, ease: "easeInOut" },
                      default: { delay: globalIndex * 0.05, duration: 0.3 }
                    }}
                    whileHover={{ x: 6, scale: 1.05 }}
                    onClick={() => onCardClick(globalIndex)}
                    onDoubleClick={() => onCardDoubleClick(globalIndex)}
                    className={`cursor-pointer relative ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    style={{
                      marginLeft: cardIndex === 0 ? '0' : '-16px',
                      zIndex: draggedCard === globalIndex ? 50 : dropTarget === globalIndex ? 10 : 1
                    }}
                  >
                    {isSelectedForMove && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10">
                        <span className="text-white text-[10px] font-bold" style={{ lineHeight: 0 }}>⊕</span>
                      </div>
                    )}
                    {dropTarget === globalIndex && draggedCard !== null && draggedCard !== globalIndex && (
                      <div className="absolute inset-0 border-2 border-blue-400 rounded-lg pointer-events-none"></div>
                    )}
                    <CardComponent
                      card={card}
                      isWild={CardValidator.isWildCard(card, wildRank)}
                      isSelected={isSelectedForDiscard}
                      size="sm"
                    />
                  </motion.div>
                );
              })}
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Action Buttons - Bottom of sidebar */}
      <div className="flex flex-col items-center gap-2 mt-2">
        {difficulty === 'easy' && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-white/50 text-[10px]">Score</span>
            <span className={`text-base font-bold px-2 py-0.5 rounded-lg ${
              playerScore === 0 ? 'bg-white/10 text-white' : 'bg-white/5 text-white/80'
            }`}>
              {playerScore}
            </span>
          </div>
        )}

        <motion.button
          whileHover={{ scale: canKnock ? 1.05 : 1 }}
          whileTap={{ scale: canKnock ? 0.95 : 1 }}
          onClick={onKnock}
          disabled={!canKnock}
          className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all ${
            canKnock
              ? 'bg-white text-slate-900 shadow-lg cursor-pointer hover:shadow-xl'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-40'
          }`}
        >
          KNOCK
        </motion.button>
      </div>
    </div>
  );
};
