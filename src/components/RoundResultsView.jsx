import { motion, AnimatePresence } from 'framer-motion';
import { CardComponent } from './CardComponent';
import { CardValidator } from '../services/CardValidator';
import { ScoreCalculator } from '../services/ScoreCalculator';

// ── Tiny card using scale transform ────────────────────────────────────────

const TinyCard = ({ card, wildRank }) => (
  <div className="shrink-0" style={{ width: '28px', height: '40px', overflow: 'hidden' }}>
    <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '56px', height: '80px' }}>
      <CardComponent card={card} size="xs" isWild={CardValidator.isWildCard(card, wildRank)} />
    </div>
  </div>
);

// ── Card group chip ─────────────────────────────────────────────────────────

const CardGroup = ({ group, wildRank, delay }) => {
  const isUnmatched = group.type === 'unmatched';
  const label = isUnmatched ? 'Dead' : group.type === 'set' ? 'Set' : 'Run';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      className={`inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg ${
        isUnmatched
          ? 'bg-red-500/10 border border-red-500/20'
          : 'bg-emerald-500/10 border border-emerald-500/20'
      }`}
    >
      <span className={`text-[9px] font-black uppercase tracking-wider shrink-0 ${
        isUnmatched ? 'text-red-400' : 'text-emerald-400'
      }`}>
        {label}
      </span>
      <div className="flex" style={{ gap: '2px' }}>
        {group.cards.map((card, i) => (
          <TinyCard key={i} card={card} wildRank={wildRank} />
        ))}
      </div>
    </motion.div>
  );
};

// ── Player result panel ─────────────────────────────────────────────────────

const PlayerResult = ({ player, wildRank, roundScore, isRoundWinner, knocked, delay }) => {
  const result = ScoreCalculator.calculateScore(player.getHand(), wildRank);
  const groups = [
    ...result.combinations,
    ...(result.remaining.length > 0 ? [{ type: 'unmatched', cards: result.remaining }] : []),
  ];
  const isPerfect = roundScore === 0 && result.remaining.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 24 }}
      className={`relative flex flex-col gap-3 p-4 rounded-2xl border ${
        isRoundWinner ? 'bg-white/8 border-white/20' : 'bg-white/3 border-white/8'
      }`}
    >
      {isRoundWinner && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      )}

      {/* Player header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base ${
            isRoundWinner ? 'bg-white/15 border border-white/25' : 'bg-white/8 border border-white/10'
          }`}>
            {player.avatar}
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">{player.name}</div>
            {knocked && <div className="text-amber-400 text-[10px]">knocked 👊</div>}
          </div>
        </div>
        {isRoundWinner && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.3, type: 'spring' }}
          >
            🏅
          </motion.span>
        )}
      </div>

      {/* Score */}
      <div className="flex items-baseline gap-1.5">
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.15, type: 'spring' }}
          className={`text-4xl font-black leading-none ${isRoundWinner ? 'text-white' : 'text-white/55'}`}
        >
          {roundScore}
        </motion.span>
        <div className="flex flex-col leading-tight">
          <span className="text-white/30 text-[10px] uppercase tracking-wider">this round</span>
          {isPerfect && <span className="text-emerald-400 text-[10px] font-bold">★ Perfect</span>}
        </div>
      </div>

      {/* Card groups */}
      <div className="flex flex-col gap-1.5">
        {groups.length === 0 ? (
          <div className="px-2 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold text-center">
            ★ Perfect hand
          </div>
        ) : (
          groups.map((group, i) => (
            <CardGroup key={i} group={group} wildRank={wildRank} delay={delay + 0.2 + i * 0.07} />
          ))
        )}
      </div>

      {/* Running total */}
      <div className="flex items-baseline gap-1 pt-2 border-t border-white/8">
        <span className="text-white/80 font-bold text-sm">{player.getTotalScore()}</span>
        <span className="text-white/25 text-[10px] uppercase tracking-wider">running total</span>
      </div>
    </motion.div>
  );
};

// ── Round progress ──────────────────────────────────────────────────────────

const RoundProgress = ({ currentRound }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 11 }, (_, i) => (
      <motion.div
        key={i}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.05 + i * 0.03 }}
        className={`h-1 flex-1 rounded-full ${
          i < currentRound ? 'bg-white/50' : i === currentRound - 1 ? 'bg-white' : 'bg-white/12'
        }`}
      />
    ))}
  </div>
);

// ── Score bar ───────────────────────────────────────────────────────────────

const ScoreBar = ({ player1, player2 }) => {
  const s1 = player1.getTotalScore();
  const s2 = player2.getTotalScore();
  const total = s1 + s2 || 1;
  const p1Pct = Math.round((s1 / total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.95 }}
      className="space-y-1.5"
    >
      <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-wider">
        <span>{player1.name}</span>
        <span>Running totals</span>
        <span>{player2.name}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-white/10">
        <motion.div
          initial={{ width: '50%' }}
          animate={{ width: `${p1Pct}%` }}
          transition={{ delay: 1.05, duration: 0.6, ease: 'easeOut' }}
          className="bg-emerald-400"
        />
        <motion.div
          initial={{ width: '50%' }}
          animate={{ width: `${100 - p1Pct}%` }}
          transition={{ delay: 1.05, duration: 0.6, ease: 'easeOut' }}
          className="bg-blue-400"
        />
      </div>
      <div className="flex justify-between text-white font-bold text-sm">
        <span>{s1}</span>
        <span>{s2}</span>
      </div>
    </motion.div>
  );
};

// ── Main ────────────────────────────────────────────────────────────────────

const RoundResultsViewInner = ({ player1, player2, wildRank, currentRound, hasKnocked, knockedPlayerIndex, onNextRound }) => {
  const p1RoundScore = player1.roundScores[player1.roundScores.length - 1] ?? 0;
  const p2RoundScore = player2.roundScores[player2.roundScores.length - 1] ?? 0;

  const isTie = p1RoundScore === p2RoundScore;
  const p1Wins = p1RoundScore < p2RoundScore;
  const roundWinnerName = isTie ? null : p1Wins ? player1.name : player2.name;

  const p1Knocked = hasKnocked && knockedPlayerIndex === 0;
  const p2Knocked = hasKnocked && knockedPlayerIndex === 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center w-full h-full px-2 py-2"
    >
      <div className="w-full max-w-2xl flex flex-col gap-3">

        {/* Progress + header */}
        <div className="flex flex-col gap-2">
          <RoundProgress currentRound={currentRound} />
          <div className="flex items-center justify-between">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-white/30 text-xs uppercase tracking-widest font-semibold"
            >
              Round {currentRound} of 11
            </motion.span>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: 'spring' }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/8 border border-white/12"
            >
              <span className="text-sm">{isTie ? '🤝' : '🏅'}</span>
              <span className="text-white/80 font-bold text-xs">
                {isTie ? 'Tied round' : `${roundWinnerName} wins the round`}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Player panels */}
        <div className="grid grid-cols-2 gap-3">
          <PlayerResult
            player={player1}
            wildRank={wildRank}
            roundScore={p1RoundScore}
            isRoundWinner={!isTie && p1Wins}
            knocked={p1Knocked}
            delay={0.3}
          />
          <PlayerResult
            player={player2}
            wildRank={wildRank}
            roundScore={p2RoundScore}
            isRoundWinner={!isTie && !p1Wins}
            knocked={p2Knocked}
            delay={0.45}
          />
        </div>

        {/* Score bar */}
        <ScoreBar player1={player1} player2={player2} />

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNextRound}
          className="w-full py-3 bg-white text-slate-900 rounded-xl font-black text-sm tracking-wide shadow-xl"
        >
          {currentRound >= 11 ? 'VIEW FINAL RESULTS' : `START ROUND ${currentRound + 1}`}
        </motion.button>

      </div>
    </motion.div>
  );
};

export const RoundResultsView = (props) => (
  <RoundResultsViewInner key={props.currentRound} {...props} />
);
