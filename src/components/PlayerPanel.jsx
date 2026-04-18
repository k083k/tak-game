import { motion, AnimatePresence } from 'framer-motion';
import { CardComponent } from './CardComponent';
import { CardValidator } from '../services/CardValidator';

const getOverlap = (count) => {
  if (count <= 5) return 4;
  if (count <= 8) return 16;
  if (count <= 11) return 24;
  return 32;
};

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
  canKnockAfterDiscard,
  knockCountdown,
  onCardClick,
  onCardDoubleClick,
  onReorderHand,
  onKnock,
  onPassKnock,
}) => {
  const hand = player.getHand();
  const isDraggable = !hasDrawn && !isRoundOver && isPlayerTurn && !isPaused;
  const overlap = getOverlap(hand.length);

  return (
    <div className={`shrink-0 relative flex items-center gap-5 px-6 py-3 border-t border-white/[0.07] transition-colors duration-300 ${
      isPlayerTurn ? 'bg-emerald-950/15' : 'bg-black/15'
    }`}>
      {/* Active turn glow — bottom edge */}
      {isPlayerTurn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
        />
      )}

      {/* Player info + knock */}
      <div className="shrink-0 flex flex-col items-center gap-2 w-32">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
          isPlayerTurn
            ? 'bg-emerald-500/20 border-2 border-emerald-400/60 shadow-lg shadow-emerald-500/20'
            : 'bg-white/8 border border-white/15'
        }`}>
          {player.avatar}
        </div>

        <div className="text-center">
          <div className="text-white/40 text-[11px] uppercase tracking-wider truncate max-w-[7rem]">{player.name}</div>
          {isPlayerTurn && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-emerald-400 text-[11px] mt-0.5">
              Your turn
            </motion.div>
          )}
        </div>

        {/* Score pills */}
        <div className="flex flex-col items-center gap-1 w-full">
          <div className="flex items-baseline gap-1">
            <span className="text-white font-bold text-base">{player.getTotalScore()}</span>
            <span className="text-white/25 text-[10px] uppercase tracking-wider">total</span>
          </div>
          <div className={`flex items-baseline gap-1 px-2 py-0.5 rounded-md transition-colors ${
            playerScore === 0 ? 'bg-emerald-500/15 border border-emerald-400/25' : 'bg-white/5'
          }`}>
            <span className={`font-semibold text-sm ${playerScore === 0 ? 'text-emerald-300' : 'text-white/50'}`}>
              {playerScore}
            </span>
            <span className="text-white/20 text-[10px] uppercase tracking-wider">hand</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {canKnockAfterDiscard ? (
            <motion.div
              key="knock-decision"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="flex flex-col gap-2 w-full"
            >
              {/* Knock button */}
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 0 0px 0px rgba(251,191,36,0)',
                    '0 0 16px 3px rgba(251,191,36,0.35)',
                    '0 0 0px 0px rgba(251,191,36,0)',
                  ]
                }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                onClick={onKnock}
                className="relative w-full py-2.5 rounded-xl overflow-hidden cursor-pointer group"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-150 rounded-xl" />
                <div className="relative flex items-center justify-center gap-1.5">
                  <span className="text-sm leading-none">👊</span>
                  <span className="text-slate-900 font-black text-xs tracking-widest">KNOCK</span>
                </div>
              </motion.button>

              {/* Pass button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onPassKnock}
                className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/40 hover:text-white/70 font-semibold text-xs tracking-wide transition-all cursor-pointer"
              >
                Pass turn
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="knock-idle"
              className="w-full py-2 rounded-xl bg-white/4 border border-white/8 text-white/18 font-bold text-xs tracking-widest text-center cursor-not-allowed select-none"
            >
              KNOCK
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card fan */}
      <div className="flex-1 flex justify-center items-center overflow-hidden">
        <AnimatePresence mode="popLayout">
          {hand.map((card, i) => {
            const isSelectedForDiscard = hasDrawn && selectedCardIndex === i;
            const isSelectedForMove = !hasDrawn && cardToMove === i;
            const isAnySelected = isSelectedForDiscard || isSelectedForMove;

            return (
              <motion.div
                key={`${card.suit}-${card.rank}-${i}`}
                layout
                draggable={isDraggable}
                onDragStart={(e) => {
                  if (!isDraggable) { e.preventDefault(); return; }
                  setDraggedCard(i);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  if (!isDraggable || draggedCard === null) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (draggedCard !== i) setDropTarget(i);
                }}
                onDragEnter={(e) => {
                  if (!isDraggable || draggedCard === null) return;
                  e.preventDefault();
                  if (draggedCard !== i) setDropTarget(i);
                }}
                onDragLeave={() => {
                  if (!isDraggable) return;
                  if (dropTarget === i) setDropTarget(null);
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
                initial={{ y: 40, opacity: 0, rotateY: 90 }}
                animate={{
                  y: isAnySelected ? -14 : 0,
                  opacity: draggedCard === i ? 0.4 : 1,
                  rotateY: 0,
                  scale: isAnySelected ? 1.12 : dropTarget === i ? 1.08 : 1,
                }}
                exit={{ y: 40, opacity: 0, scale: 0.8 }}
                transition={{
                  layout: { duration: 0.25, ease: 'easeInOut' },
                  default: { delay: i * 0.04, duration: 0.25 },
                }}
                whileHover={!isAnySelected ? { y: -8, scale: 1.06 } : {}}
                onClick={() => onCardClick(i)}
                onDoubleClick={() => onCardDoubleClick(i)}
                className={`relative ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
                style={{
                  marginLeft: i === 0 ? 0 : `-${overlap}px`,
                  zIndex: isAnySelected || draggedCard === i ? 50 : dropTarget === i ? 10 : i,
                }}
              >
                {isSelectedForMove && (
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10">
                    <span className="text-white text-[9px] font-bold">✕</span>
                  </div>
                )}
                {dropTarget === i && draggedCard !== null && draggedCard !== i && (
                  <div className="absolute inset-0 border-2 border-blue-400 rounded-lg pointer-events-none z-20" />
                )}
                <CardComponent
                  card={card}
                  isWild={CardValidator.isWildCard(card, wildRank)}
                  isSelected={isSelectedForDiscard}
                  size="md"
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Knock countdown + hint */}
      <div className="shrink-0 w-16 flex flex-col items-center gap-1">
        {knockCountdown !== null ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-3xl font-black text-white leading-none"
            >
              {knockCountdown}
            </motion.div>
            <div className="text-white/30 text-[9px] uppercase tracking-wider mt-0.5">knock</div>
          </motion.div>
        ) : (
          hasDrawn && (
            <div className="text-white/25 text-[10px] text-center leading-tight">
              double-tap<br/>to discard
            </div>
          )
        )}
      </div>
    </div>
  );
};
