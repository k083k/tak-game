import { motion, AnimatePresence } from 'framer-motion';
import { CardComponent } from './CardComponent';
import { CardValidator } from '../services/CardValidator';

export const PlayerPanel = ({
  player,
  wildRank,
  hasDrawn,
  selectedCardIndex,
  cardToMove,
  draggedCard,
  setDraggedCard,
  dropTarget,
  setDropTarget,
  isPlayerTurn,
  isPaused,
  isRoundOver,
  difficulty,
  playerScore,
  canKnock,
  onCardClick,
  onCardDoubleClick,
  onReorderHand,
  onKnock,
}) => {
  const hand = player.getHand();

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
  const isDraggable = !hasDrawn && !isRoundOver && isPlayerTurn && !isPaused;

  return (
    <div className={`w-80 h-full flex flex-col items-center justify-center bg-black/20 border-l border-white/10 p-2 gap-3 transition-all duration-300 relative ${
      isPlayerTurn ? 'bg-black/10' : ''
    }`}>
      {/* Active turn indicator — top edge glow */}
      {isPlayerTurn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
        />
      )}

      <div className="flex flex-col items-center gap-2 mb-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
          isPlayerTurn
            ? 'bg-emerald-500/20 border-2 border-emerald-400/60 shadow-lg shadow-emerald-500/20'
            : 'bg-white/10 border-2 border-white/20'
        }`}>
          {player.avatar}
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <div className="text-white/40 text-[10px] uppercase tracking-wider text-center">
            {player.name}
          </div>
          {isPlayerTurn && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-emerald-400 text-[10px] uppercase tracking-wider"
            >
              Your turn
            </motion.div>
          )}
        </div>
        <div className="text-xl font-bold text-white">{player.getTotalScore()}</div>
      </div>

      <div className="flex flex-col gap-1 items-center flex-1 justify-center overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="popLayout">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((card, cardIndex) => {
                const globalIndex = rows.slice(0, rowIndex).reduce((sum, r) => sum + r.length, 0) + cardIndex;
                const isSelectedForDiscard = hasDrawn && selectedCardIndex === globalIndex;
                const isSelectedForMove = !hasDrawn && cardToMove === globalIndex;
                const isAnyCardSelected = isSelectedForDiscard || isSelectedForMove;

                return (
                  <motion.div
                    key={`${card.suit}-${card.rank}-${globalIndex}`}
                    layout
                    draggable={isDraggable}
                    onDragStart={(e) => {
                      if (!isDraggable) { e.preventDefault(); return; }
                      setDraggedCard(globalIndex);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      if (!isDraggable || draggedCard === null) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (draggedCard !== globalIndex) setDropTarget(globalIndex);
                    }}
                    onDragEnter={(e) => {
                      if (!isDraggable || draggedCard === null) return;
                      e.preventDefault();
                      if (draggedCard !== globalIndex) setDropTarget(globalIndex);
                    }}
                    onDragLeave={() => {
                      if (!isDraggable) return;
                      if (dropTarget === globalIndex) setDropTarget(null);
                    }}
                    onDrop={(e) => {
                      if (!isDraggable) return;
                      e.preventDefault();
                      if (draggedCard !== null && dropTarget !== null && draggedCard !== dropTarget) {
                        onReorderHand(draggedCard, dropTarget);
                      }
                      setDraggedCard(null);
                      setDropTarget(null);
                    }}
                    onDragEnd={() => {
                      setDraggedCard(null);
                      setDropTarget(null);
                    }}
                    initial={{ x: -100, y: -50, opacity: 0, rotateY: 180, scale: 0.8 }}
                    animate={{
                      x: isAnyCardSelected ? 10 : 0,
                      opacity: draggedCard === globalIndex ? 0.5 : 1,
                      rotateY: 0,
                      scale: isAnyCardSelected ? 1.15 : dropTarget === globalIndex ? 1.1 : 1,
                    }}
                    exit={{ x: -100, y: -50, opacity: 0, scale: 0.8 }}
                    transition={{
                      layout: { duration: 0.3, ease: 'easeInOut' },
                      default: { delay: globalIndex * 0.05, duration: 0.3 },
                    }}
                    whileHover={{ x: 6, scale: 1.05 }}
                    onClick={() => onCardClick(globalIndex)}
                    onDoubleClick={() => onCardDoubleClick(globalIndex)}
                    className={`cursor-pointer relative ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    style={{
                      marginLeft: cardIndex === 0 ? '0' : '-16px',
                      zIndex: draggedCard === globalIndex ? 50 : dropTarget === globalIndex ? 10 : 1,
                    }}
                  >
                    {isSelectedForMove && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10">
                        <span className="text-white text-[10px] font-bold" style={{ lineHeight: 0 }}>⊕</span>
                      </div>
                    )}
                    {dropTarget === globalIndex && draggedCard !== null && draggedCard !== globalIndex && (
                      <div className="absolute inset-0 border-2 border-blue-400 rounded-lg pointer-events-none" />
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
          animate={canKnock ? {
            boxShadow: [
              '0 0 0px rgba(255,255,255,0)',
              '0 0 18px rgba(255,255,255,0.5)',
              '0 0 0px rgba(255,255,255,0)',
            ],
          } : {}}
          transition={canKnock ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' } : {}}
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
