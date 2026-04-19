import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../models/Card';
import { CardComponent } from './CardComponent';

// ─── Mini card helper ──────────────────────────────────────────────────────────
const c = (suit, rank) => new Card(suit, rank);

// ─── Section wrapper ────────────────────────────────────────────────────────────
const Section = ({ id, children }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5 }}
    className="max-w-3xl mx-auto px-4 py-16"
  >
    {children}
  </motion.section>
);

const SectionTitle = ({ icon, title, subtitle }) => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-2">
      <span className="text-3xl">{icon}</span>
      <h2 className="text-2xl md:text-3xl font-black text-white">{title}</h2>
    </div>
    {subtitle && <p className="text-white/50 text-sm ml-12">{subtitle}</p>}
  </div>
);

// ─── Interactive Sets Demo ─────────────────────────────────────────────────────
const SetsDemo = () => {
  const DEMO_CARDS = [
    c('♠', 7), c('♥', 7), c('♦', 7), c('♠', 12), c('♥', 1),
  ];
  const [selected, setSelected] = useState(new Set());
  const [feedback, setFeedback] = useState(null); // null | 'valid' | 'invalid'

  const toggle = (i) => {
    setFeedback(null);
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const check = () => {
    const cards = [...selected].map(i => DEMO_CARDS[i]);
    if (cards.length < 3) { setFeedback('need3'); return; }
    const rank = cards[0].rank;
    const isSet = cards.every(card => card.rank === rank);
    setFeedback(isSet ? 'valid' : 'invalid');
  };

  const reset = () => { setSelected(new Set()); setFeedback(null); };

  const feedbackMsg = {
    valid: { text: 'Valid Set! All same rank.', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    invalid: { text: 'Not a set — cards must all share the same rank.', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
    need3: { text: 'Select at least 3 cards first.', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  };

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <p className="text-white/60 text-sm mb-5">Click cards to select, then hit Check.</p>
      <div className="flex gap-3 mb-5 flex-wrap">
        {DEMO_CARDS.map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggle(i)}
            animate={{ y: selected.has(i) ? -8 : 0, scale: selected.has(i) ? 1.08 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="cursor-pointer"
          >
            <CardComponent
              card={card}
              size="md"
              isSelected={selected.has(i)}
            />
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={check}
          className="px-5 py-2 bg-white text-slate-900 rounded-lg font-bold text-sm"
        >
          Check
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={reset}
          className="px-5 py-2 bg-white/10 text-white rounded-lg font-semibold text-sm border border-white/20"
        >
          Reset
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {feedback && (
          <motion.div
            key={feedback}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`px-4 py-3 rounded-xl border text-sm font-semibold ${feedbackMsg[feedback].bg} ${feedbackMsg[feedback].color}`}
          >
            {feedbackMsg[feedback].text}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-white/30 text-xs mt-4">Hint: try the three 7s.</p>
    </div>
  );
};

// ─── Interactive Runs Demo ─────────────────────────────────────────────────────
const RunsDemo = () => {
  const DEMO_CARDS = [
    c('♥', 4), c('♥', 5), c('♥', 6), c('♥', 7), c('♠', 13),
  ];
  const [selected, setSelected] = useState(new Set());
  const [feedback, setFeedback] = useState(null);

  const toggle = (i) => { setFeedback(null); setSelected(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; }); };

  const check = () => {
    const cards = [...selected].map(i => DEMO_CARDS[i]);
    if (cards.length < 3) { setFeedback('need3'); return; }
    const suit = cards[0].suit;
    const sameSuit = cards.every(card => card.suit === suit);
    if (!sameSuit) { setFeedback('invalid-suit'); return; }
    const sorted = [...cards].sort((a, b) => a.rank - b.rank);
    let consecutive = true;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].rank !== sorted[i - 1].rank + 1) { consecutive = false; break; }
    }
    setFeedback(consecutive ? 'valid' : 'invalid-consec');
  };

  const reset = () => { setSelected(new Set()); setFeedback(null); };

  const feedbackMsg = {
    valid: { text: 'Valid Run! Consecutive cards, same suit.', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    'invalid-suit': { text: 'Not a run — all cards must be the same suit.', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
    'invalid-consec': { text: 'Not a run — cards must be consecutive (no gaps).', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
    need3: { text: 'Select at least 3 cards first.', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  };

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <p className="text-white/60 text-sm mb-5">Click cards to select, then hit Check.</p>
      <div className="flex gap-3 mb-5 flex-wrap">
        {DEMO_CARDS.map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggle(i)}
            animate={{ y: selected.has(i) ? -8 : 0, scale: selected.has(i) ? 1.08 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="cursor-pointer"
          >
            <CardComponent card={card} size="md" isSelected={selected.has(i)} />
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={check} className="px-5 py-2 bg-white text-slate-900 rounded-lg font-bold text-sm">Check</motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={reset} className="px-5 py-2 bg-white/10 text-white rounded-lg font-semibold text-sm border border-white/20">Reset</motion.button>
      </div>

      <AnimatePresence mode="wait">
        {feedback && (
          <motion.div key={feedback} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`px-4 py-3 rounded-xl border text-sm font-semibold ${feedbackMsg[feedback].bg} ${feedbackMsg[feedback].color}`}>
            {feedbackMsg[feedback].text}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-white/30 text-xs mt-4">Hint: try the four hearts. Try including the King of Spades too.</p>
    </div>
  );
};

// ─── Wild Card Stepper ─────────────────────────────────────────────────────────
const WildStepper = () => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      label: 'You have two spades in a row',
      cards: [c('♠', 8), c('♠', 9)],
      highlight: [],
      note: '8♠ and 9♠ — one card away from a run, but missing 7♠ or 10♠.',
    },
    {
      label: 'This round, 8s are wild',
      cards: [c('♠', 8), c('♠', 9), c('♥', 8)],
      highlight: [2],
      wildRank: 8,
      note: 'You pick up 8♥ from the discard pile. Because 8s are wild, it can stand in for any card.',
    },
    {
      label: 'Wild fills the gap → valid run!',
      cards: [c('♥', 8), c('♠', 8), c('♠', 9)],
      highlight: [0],
      wildRank: 8,
      note: '8♥ stands in as 7♠. The run 7♠(W) — 8♠ — 9♠ is valid. Zero points for these cards!',
      valid: true,
    },
  ];

  const current = steps[step];

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="flex gap-1.5 mb-6">
        {steps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-white' : 'bg-white/20'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
          <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Step {step + 1} of {steps.length}</p>
          <h4 className="text-white font-bold text-lg mb-5">{current.label}</h4>

          <div className="flex gap-3 mb-5 flex-wrap items-end">
            {current.cards.map((card, i) => (
              <div key={i} className="relative">
                {current.highlight?.includes(i) && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -inset-1 rounded-xl bg-orange-500/30 blur-sm"
                  />
                )}
                {current.valid && (
                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -inset-1 rounded-xl bg-green-500/30 blur-sm"
                  />
                )}
                <CardComponent
                  card={card}
                  size="md"
                  isWild={current.wildRank !== undefined && card.rank === current.wildRank}
                />
              </div>
            ))}
            {current.valid && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                className="text-green-400 text-2xl font-black ml-2">✓</motion.div>
            )}
          </div>

          <p className="text-white/60 text-sm leading-relaxed">{current.note}</p>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 mt-6">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="px-5 py-2 bg-white/10 text-white rounded-lg font-semibold text-sm border border-white/20 disabled:opacity-30"
        >← Prev</motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
          disabled={step === steps.length - 1}
          className="px-5 py-2 bg-white text-slate-900 rounded-lg font-bold text-sm disabled:opacity-30"
        >Next →</motion.button>
        {step === steps.length - 1 && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setStep(0)}
            className="px-5 py-2 bg-white/5 text-white/60 rounded-lg text-sm border border-white/10"
          >Restart</motion.button>
        )}
      </div>
    </div>
  );
};

// ─── Knock Mechanic Demo ───────────────────────────────────────────────────────
const KnockDemo = () => {
  const [phase, setPhase] = useState('idle'); // idle | decision | knocked | passed

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <p className="text-white/60 text-sm mb-6">After you discard with a score of 0, a choice appears. Knock to end the round, or pass to keep playing.</p>

      <div className="flex flex-col items-center gap-4 py-4">
        {phase === 'idle' && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setPhase('decision')}
            className="px-8 py-3 bg-white/10 text-white rounded-xl font-bold border border-white/20 hover:bg-white/20 transition-colors"
          >
            Simulate discard →
          </motion.button>
        )}

        {phase === 'decision' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 w-48">
            <p className="text-white/60 text-sm text-center mb-1">Your score is 0!</p>
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPhase('knocked')}
              animate={{ boxShadow: ['0 0 0px rgba(251,191,36,0)', '0 0 16px 3px rgba(251,191,36,0.35)', '0 0 0px rgba(251,191,36,0)'] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="py-2.5 rounded-xl font-black text-xs tracking-widest text-slate-900"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              👊 KNOCK
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setPhase('passed')}
              className="py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white/70 font-semibold text-xs tracking-wide transition-all"
            >
              Pass turn
            </motion.button>
          </motion.div>
        )}

        {phase === 'knocked' && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <div className="text-4xl mb-2">👊</div>
            <p className="text-green-400 font-bold text-lg">You knocked!</p>
            <p className="text-white/50 text-sm mt-1">Opponent gets one final turn.</p>
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => setPhase('idle')} className="mt-4 px-5 py-2 bg-white/10 text-white rounded-lg text-sm border border-white/20">Try again</motion.button>
          </motion.div>
        )}

        {phase === 'passed' && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <div className="text-4xl mb-2">➡️</div>
            <p className="text-amber-400 font-bold text-lg">Turn passed</p>
            <p className="text-white/50 text-sm mt-1">Play continues to your opponent.</p>
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => setPhase('idle')} className="mt-4 px-5 py-2 bg-white/10 text-white rounded-lg text-sm border border-white/20">Try again</motion.button>
          </motion.div>
        )}
      </div>

      <p className="text-white/30 text-xs text-center mt-2">You can only knock when your score is 0 after discarding.</p>
    </div>
  );
};

// ─── Main HowToPlay Component ──────────────────────────────────────────────────
const SECTIONS = [
  { id: 'goal', label: 'Goal' },
  { id: 'rounds', label: 'Rounds' },
  { id: 'combinations', label: 'Sets & Runs' },
  { id: 'wilds', label: 'Wild Cards' },
  { id: 'knocking', label: 'Knocking' },
  { id: 'scoring', label: 'Scoring' },
];

export const HowToPlay = ({ onBack, onPlayNow }) => {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-gradient-to-br from-slate-950 to-slate-900 overflow-y-auto z-50"
    >
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.12, 0.08] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-3xl" />
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.1, 0.06] }} transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-violet-500 rounded-full blur-3xl" />
      </div>

      {/* Sticky Nav */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium shrink-0"
          >
            ← Back
          </motion.button>

          <div className="hidden md:flex items-center gap-1 flex-1 overflow-x-auto">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => scrollTo(s.id)}
                className="px-3 py-1.5 text-xs text-white/50 hover:text-white font-medium rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                {s.label}
              </button>
            ))}
          </div>

          {onPlayNow && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onPlayNow}
              className="ml-auto shrink-0 px-4 py-1.5 bg-white text-slate-900 rounded-lg font-bold text-sm"
            >
              Play Now
            </motion.button>
          )}
        </div>
      </div>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="max-w-3xl mx-auto px-4 pt-16 pb-8 text-center"
      >
        <div className="text-5xl mb-4">🎴</div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">How to Play</h1>
        <p className="text-white/50 text-base max-w-md mx-auto">
          A 2-player rummy-style game. Form combinations, manage your hand, and knock at the right moment.
        </p>
      </motion.div>

      {/* ── Section 1: Goal ──────────────────────────────────────────────────── */}
      <Section id="goal">
        <SectionTitle icon="🎯" title="The Goal" subtitle="Lowest total score after 11 rounds wins." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '🃏', title: '11 Rounds', body: 'Each round your hand grows. Round 1 starts with 3 cards, Round 11 ends with 13.' },
            { icon: '♣', title: 'Form Combos', body: 'Group your cards into sets and runs to score zero on those cards.' },
            { icon: '📉', title: 'Low Score Wins', body: 'Cards NOT in a valid combination count against you. After 11 rounds, lowest total wins.' },
          ].map(item => (
            <div key={item.title} className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-white font-bold mb-2">{item.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Section 2: Round Structure ───────────────────────────────────────── */}
      <Section id="rounds">
        <SectionTitle icon="🔄" title="Round Structure" subtitle="Each turn: draw → discard → knock?" />

        <div className="space-y-4 mb-8">
          {[
            { num: '1', label: 'Draw a card', body: 'Pick from the face-down deck (mystery) or the visible top of the discard pile.', color: 'bg-blue-500/10 border-blue-500/20' },
            { num: '2', label: 'Discard a card', body: 'Remove one card from your hand and place it on the discard pile.', color: 'bg-purple-500/10 border-purple-500/20' },
            { num: '3', label: 'Knock or pass', body: 'If your score is 0 and nobody has knocked yet, choose to knock and end the round — or pass and keep playing.', color: 'bg-amber-500/10 border-amber-500/20' },
          ].map(step => (
            <div key={step.num} className={`flex gap-4 p-4 rounded-xl border ${step.color}`}>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-black shrink-0">{step.num}</div>
              <div>
                <div className="text-white font-bold text-sm mb-1">{step.label}</div>
                <div className="text-white/50 text-sm">{step.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <h3 className="text-white font-bold mb-4">Hand sizes by round</h3>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {Array.from({ length: 11 }, (_, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
                <div className="text-white/40 text-[10px]">R{i + 1}</div>
                <div className="text-white font-bold text-sm">{i + 3}</div>
                <div className="text-white/30 text-[10px]">cards</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Section 3: Sets & Runs ───────────────────────────────────────────── */}
      <Section id="combinations">
        <SectionTitle icon="🃏" title="Sets & Runs" subtitle="Cards in valid combinations score zero points." />

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <h3 className="text-white font-bold mb-1">Set</h3>
            <p className="text-white/50 text-sm mb-3">3 or more cards of the same rank.</p>
            <div className="flex gap-2">
              {[c('♠', 7), c('♥', 7), c('♦', 7)].map((card, i) => (
                <CardComponent key={i} card={card} size="sm" />
              ))}
            </div>
            <p className="text-green-400 text-xs mt-3 font-semibold">✓ Three 7s — valid set</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <h3 className="text-white font-bold mb-1">Run</h3>
            <p className="text-white/50 text-sm mb-3">3 or more consecutive cards of the same suit.</p>
            <div className="flex gap-2">
              {[c('♥', 4), c('♥', 5), c('♥', 6)].map((card, i) => (
                <CardComponent key={i} card={card} size="sm" />
              ))}
            </div>
            <p className="text-green-400 text-xs mt-3 font-semibold">✓ 4-5-6 of Hearts — valid run</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-white font-bold text-lg mb-3">Try it yourself — Sets</h3>
          <SetsDemo />
        </div>

        <div>
          <h3 className="text-white font-bold text-lg mb-3">Try it yourself — Runs</h3>
          <RunsDemo />
        </div>
      </Section>

      {/* ── Section 4: Wild Cards ────────────────────────────────────────────── */}
      <Section id="wilds">
        <SectionTitle icon="✨" title="Wild Cards" subtitle="Each round a different rank is wild — it can stand in for any card." />

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 mb-6">
          <h3 className="text-white font-bold mb-4">Wild rotation</h3>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {['3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', 'Jacks', 'Queens', 'Kings'].map((wild, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
                <div className="text-white/40 text-[10px]">R{i + 1}</div>
                <div className="text-orange-400 font-bold text-xs">{wild}</div>
              </div>
            ))}
          </div>
          <p className="text-white/40 text-xs mt-3">Jokers are always wild in every round. Unused wilds carry penalty points — always try to use them!</p>
        </div>

        <div>
          <h3 className="text-white font-bold text-lg mb-3">See how it works</h3>
          <WildStepper />
        </div>
      </Section>

      {/* ── Section 5: Knocking ──────────────────────────────────────────────── */}
      <Section id="knocking">
        <SectionTitle icon="👊" title="Knocking" subtitle="End the round early when your score hits zero." />

        <div className="space-y-3 mb-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex gap-3">
            <span className="text-xl">1️⃣</span>
            <p className="text-white/70 text-sm">After discarding, if your score is 0 — all cards are in valid combinations — a <span className="text-white font-semibold">Knock / Pass</span> choice appears.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex gap-3">
            <span className="text-xl">2️⃣</span>
            <p className="text-white/70 text-sm">Hit <span className="text-white font-semibold">KNOCK</span> to end the round, or <span className="text-white font-semibold">Pass turn</span> to keep playing without knocking.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex gap-3">
            <span className="text-xl">3️⃣</span>
            <p className="text-white/70 text-sm">If you knock, your opponent gets <span className="text-white font-semibold">one final turn</span>, then the round ends and scores are tallied.</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-white font-bold text-lg mb-3">Try the knock window</h3>
          <KnockDemo />
        </div>

        <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
          <p className="text-amber-300 text-sm"><span className="font-bold">Strategy tip:</span> Sometimes it's worth passing even when you can knock — your opponent might knock on their next turn at a worse moment for them. Use the pass option to stay in control.</p>
        </div>
      </Section>

      {/* ── Section 6: Scoring ───────────────────────────────────────────────── */}
      <Section id="scoring">
        <SectionTitle icon="📊" title="Scoring" subtitle="Cards NOT in a valid combination add to your score. Lower is better." />

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <h3 className="text-white font-bold mb-4">Card values</h3>
            <div className="space-y-2 text-sm">
              {[
                { label: '2 – 10', value: 'Face value', sub: '(e.g. 7 = 7 pts)' },
                { label: 'J, Q, K', value: '10 points', sub: 'each' },
                { label: 'Ace', value: '15 points', sub: 'highest penalty' },
                { label: 'Joker', value: '50 points', sub: 'if unused' },
                { label: 'Wild card', value: 'Face value', sub: 'if unused' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-white/70">{row.label}</span>
                  <span className="text-white font-semibold">{row.value} <span className="text-white/40 font-normal text-xs">{row.sub}</span></span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <h3 className="text-white font-bold mb-4">Round example</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2 items-center">
                {[c('♠', 7), c('♥', 7), c('♦', 7)].map((card, i) => <CardComponent key={i} card={card} size="xs" />)}
                <span className="text-green-400 font-semibold ml-1">0 pts</span>
              </div>
              <div className="flex gap-2 items-center">
                {[c('♥', 4), c('♥', 5), c('♥', 6)].map((card, i) => <CardComponent key={i} card={card} size="xs" />)}
                <span className="text-green-400 font-semibold ml-1">0 pts</span>
              </div>
              <div className="flex gap-2 items-center">
                {[c('♠', 1)].map((card, i) => <CardComponent key={i} card={card} size="xs" />)}
                <span className="text-red-400 font-semibold ml-1">15 pts</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between">
                <span className="text-white/50">Round score</span>
                <span className="text-white font-black">15 pts</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center">
          <p className="text-white/60 text-sm mb-1">After 11 rounds…</p>
          <p className="text-white font-bold text-xl">Lowest total score wins 🏆</p>
        </div>
      </Section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
          <h2 className="text-2xl font-black text-white mb-2">Ready to play?</h2>
          <p className="text-white/40 text-sm mb-6">You can always tap ? during the game to come back here.</p>
          {onPlayNow ? (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={onPlayNow}
              className="px-10 py-3.5 bg-white text-slate-900 rounded-xl font-black text-lg shadow-xl hover:shadow-2xl transition-shadow"
            >
              Start Playing
            </motion.button>
          ) : (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={onBack}
              className="px-10 py-3.5 bg-white text-slate-900 rounded-xl font-black text-lg shadow-xl hover:shadow-2xl transition-shadow"
            >
              Back to Game
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
