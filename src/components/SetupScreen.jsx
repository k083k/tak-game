import { motion, AnimatePresence } from 'framer-motion';

const AVATARS = ['😎', '🎮', '👨', '👩', '🧑', '🤓', '😊', '🦊'];

const SUIT_DECO = [
  { suit: '♠', top: '6%',  left: '4%',   size: '7rem',  opacity: 0.045, dur: 13, rot: 12  },
  { suit: '♥', top: '12%', right: '6%',  size: '5rem',  opacity: 0.055, dur: 9,  rot: -8, red: true },
  { suit: '♦', top: '52%', left: '2%',   size: '6rem',  opacity: 0.04,  dur: 11, rot: 6,  red: true },
  { suit: '♣', top: '60%', right: '3%',  size: '8rem',  opacity: 0.035, dur: 15, rot: -14 },
  { suit: '♠', top: '30%', right: '1%',  size: '3.5rem',opacity: 0.03,  dur: 8,  rot: 20  },
  { suit: '♥', top: '80%', left: '8%',   size: '4rem',  opacity: 0.04,  dur: 10, rot: -5, red: true },
];

const FloatingSuits = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden select-none">
    {SUIT_DECO.map((d, i) => (
      <motion.div
        key={i}
        className="absolute font-serif leading-none"
        style={{
          top: d.top, left: d.left, right: d.right,
          fontSize: d.size,
          opacity: d.opacity,
          color: d.red ? '#ef4444' : '#ffffff',
          rotate: d.rot,
        }}
        animate={{ y: [-12, 12, -12], rotate: [d.rot - 4, d.rot + 4, d.rot - 4] }}
        transition={{ duration: d.dur, repeat: Infinity, ease: 'easeInOut' }}
      >
        {d.suit}
      </motion.div>
    ))}
  </div>
);

const AvatarPicker = ({ value, onChange, avatars }) => (
  <div className="grid grid-cols-8 gap-1.5">
    {avatars.map((avatar) => (
      <motion.button
        key={avatar}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.85 }}
        onClick={() => onChange(avatar)}
        className={`aspect-square rounded-lg flex items-center justify-center text-base transition-all duration-150 ${
          value === avatar
            ? 'bg-emerald-500/25 border-2 border-emerald-400/70 scale-110'
            : 'bg-white/5 border border-white/10 hover:bg-white/10'
        }`}
      >
        {avatar}
      </motion.button>
    ))}
  </div>
);

const PlayerCard = ({ label, name, setName, avatar, setAvatar, avatars }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 space-y-3"
  >
    <p className="text-white/35 text-[10px] uppercase tracking-[0.15em] font-bold">{label}</p>
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 shrink-0 rounded-full flex items-center justify-center text-2xl ring-2 ring-emerald-400/60 bg-emerald-500/10 shadow-[0_0_20px_rgba(52,211,153,0.2)] transition-all duration-300">
        {avatar}
      </div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={20}
        className="flex-1 px-3 py-2.5 bg-white/8 border border-white/12 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/35 focus:bg-white/10 transition-all"
        placeholder="Enter name…"
      />
    </div>
    <AvatarPicker value={avatar} onChange={setAvatar} avatars={avatars} />
  </motion.div>
);

export const SetupScreen = ({
  gameMode,
  setGameMode,
  playerName,
  setPlayerName,
  playerAvatar,
  setPlayerAvatar,
  difficulty,
  setDifficulty,
  onStartGame,
  onShowHowToPlay,
  onGoOnline,
}) => {
  const isOnline = gameMode === 'online';

  return (
    <div className="min-h-screen w-screen overflow-y-auto flex items-start justify-center p-4 relative"
         style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 0%, #0e1f18 0%, #080c12 60%, #08080f 100%)' }}>

      <FloatingSuits />

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-600/8 blur-[80px] rounded-full" />
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-purple-600/6 blur-[80px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-lg my-10 space-y-4">

        {/* ── Hero Title ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center pb-4"
        >
          <div className="relative inline-flex items-end justify-center mb-5 h-16">
            {['-18deg', '-7deg', '3deg', '14deg'].map((r, i) => (
              <motion.img
                key={i}
                src="/cards/back-black.png"
                alt=""
                className="absolute w-10 h-14 rounded-md shadow-xl object-cover"
                style={{ rotate: r, left: `${i * 18 - 27}px`, bottom: 0, opacity: 0.55 + i * 0.1, zIndex: i }}
                animate={{ y: [0, -3 + i, 0] }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
              />
            ))}
          </div>

          <h1
            className="text-8xl font-black text-white tracking-tighter leading-none"
            style={{ textShadow: '0 0 80px rgba(52,211,153,0.45), 0 0 160px rgba(52,211,153,0.2)' }}
          >
            TAK
          </h1>
          <p className="text-emerald-400/60 text-xs tracking-[0.25em] uppercase mt-2 font-medium">
            Rummy Card Game · 11 Rounds
          </p>
        </motion.div>

        {/* ── Mode Selection ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-white/25 text-[10px] uppercase tracking-[0.18em] font-bold mb-2.5 pl-1">Game Mode</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'pvc',    icon: '🤖', label: 'vs Computer', sub: 'Solo · AI opponent' },
              { id: 'online', icon: '👥', label: 'vs Player',   sub: 'Online · 2 devices' },
            ].map(({ id, icon, label, sub }) => {
              const active = gameMode === id;
              return (
                <motion.button
                  key={id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setGameMode(id)}
                  className={`relative overflow-hidden p-5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all duration-300 ${
                    active
                      ? 'bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 border-emerald-400/50'
                      : 'bg-white/4 border-white/10 hover:bg-white/7 hover:border-white/20'
                  }`}
                  style={active ? { boxShadow: '0 0 32px rgba(52,211,153,0.18), inset 0 1px 0 rgba(52,211,153,0.1)' } : {}}
                >
                  {active && (
                    <motion.div
                      layoutId="mode-glow"
                      className="absolute inset-0 bg-gradient-to-b from-emerald-400/8 to-transparent pointer-events-none"
                    />
                  )}
                  <span className="text-4xl">{icon}</span>
                  <span className={`font-bold text-sm ${active ? 'text-white' : 'text-white/55'}`}>{label}</span>
                  <span className="text-white/30 text-[10px]">{sub}</span>
                  {active && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center"
                    >
                      <span className="text-slate-900 text-[10px] font-black">✓</span>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Player Profile (pvc only — online handled in lobby) ── */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: 0.15 }}
            >
              <p className="text-white/25 text-[10px] uppercase tracking-[0.18em] font-bold mb-2.5 pl-1">Your Profile</p>
              <PlayerCard
                label="Your Profile"
                name={playerName} setName={setPlayerName}
                avatar={playerAvatar} setAvatar={setPlayerAvatar}
                avatars={AVATARS}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Difficulty (pvc only) ── */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <p className="text-white/25 text-[10px] uppercase tracking-[0.18em] font-bold mb-2.5 pl-1">Difficulty</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'easy', icon: '😊', label: 'Easy', desc: 'Score shown · 3s to knock' },
                  { id: 'hard', icon: '🔥', label: 'Hard', desc: 'Score hidden · 1s to knock' },
                ].map(({ id, icon, label, desc }) => {
                  const active = difficulty === id;
                  return (
                    <motion.button
                      key={id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setDifficulty(id)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 text-left ${
                        active
                          ? 'bg-white/10 border-white/30'
                          : 'bg-white/4 border-white/8 hover:bg-white/7 hover:border-white/18'
                      }`}
                    >
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <div className={`text-sm font-bold ${active ? 'text-white' : 'text-white/45'}`}>{label}</div>
                        <div className="text-white/25 text-[10px]">{desc}</div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="pt-2 space-y-2"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={isOnline ? onGoOnline : onStartGame}
            className="w-full py-4 rounded-2xl font-black text-base tracking-widest text-slate-900 relative overflow-hidden"
            style={{
              background: isOnline
                ? 'linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #10b981 100%)'
                : 'linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #10b981 100%)',
              boxShadow: '0 0 40px rgba(52,211,153,0.35), 0 4px 24px rgba(0,0,0,0.4)',
            }}
          >
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: '-100%', skewX: '-15deg' }}
              whileHover={{ x: '200%' }}
              transition={{ duration: 0.5 }}
            />
            {isOnline ? 'FIND A MATCH' : 'PLAY vs COMPUTER'}
          </motion.button>

          <button
            onClick={onShowHowToPlay}
            className="w-full text-center text-white/20 hover:text-white/50 transition-colors text-sm py-1.5"
          >
            How to Play →
          </button>
        </motion.div>

      </div>
    </div>
  );
};
