import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AVATARS = ['😎', '🎮', '👨', '👩', '🧑', '🤓', '😊', '🦊'];
const P2_AVATARS = ['😤', '🤠', '👨‍💻', '👩‍💻', '🧑‍🎤', '😈', '🤩', '🐺'];

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

const PlayerSlot = ({ player, label, empty = false }) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
    empty ? 'border-white/10 bg-white/3' : 'border-emerald-400/30 bg-emerald-500/10'
  }`}>
    <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl bg-white/10">
      {empty ? '?' : player.avatar}
    </div>
    <div>
      <div className={`text-sm font-bold ${empty ? 'text-white/25' : 'text-white'}`}>
        {empty ? 'Waiting for player...' : player.player_name}
      </div>
      <div className="text-white/30 text-xs">{label}</div>
    </div>
    {!empty && (
      <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
    )}
  </div>
);

export const OnlineLobby = ({ onlinePhase, gameCode, lobbyPlayers, isHost, mySeat, onCreateGame, onJoinGame, onStartGame, onBack }) => {
  const [view, setView] = useState('choice'); // 'choice' | 'create' | 'join'
  const [playerName, setPlayerName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);

  const avatarSet = mySeat === 1 ? P2_AVATARS : AVATARS;

  const handleCreate = async () => {
    if (!playerName.trim()) return;
    setLoading(true);
    await onCreateGame(playerName.trim(), avatar);
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !joinCode.trim()) return;
    setLoading(true);
    await onJoinGame(joinCode.trim(), playerName.trim(), avatar);
    setLoading(false);
  };

  const seat0 = lobbyPlayers.find(p => p.seat === 0);
  const seat1 = lobbyPlayers.find(p => p.seat === 1);
  const canStart = isHost && lobbyPlayers.length >= 2;

  // ── Lobby waiting room ──
  if (onlinePhase === 'lobby') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen w-screen flex items-center justify-center p-4"
        style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 0%, #0e1f18 0%, #080c12 60%, #08080f 100%)' }}
      >
        <div className="w-full max-w-sm space-y-5">
          <div className="text-center">
            <h1 className="text-4xl font-black text-white tracking-tight">Game Lobby</h1>
            <p className="text-white/40 text-sm mt-1">Share your code with a friend</p>
          </div>

          {/* Game Code */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center space-y-1">
            <p className="text-white/30 text-xs uppercase tracking-widest">Game Code</p>
            <p className="text-5xl font-black text-emerald-400 tracking-widest">{gameCode}</p>
            <p className="text-white/20 text-xs">Other player enters this to join</p>
          </div>

          {/* Players */}
          <div className="space-y-2">
            <p className="text-white/25 text-[10px] uppercase tracking-widest font-bold pl-1">Players</p>
            <PlayerSlot player={seat0} label="Host · Seat 1" empty={!seat0} />
            <PlayerSlot player={seat1} label="Guest · Seat 2" empty={!seat1} />
          </div>

          {/* Start / Waiting */}
          {isHost ? (
            <motion.button
              whileHover={{ scale: canStart ? 1.02 : 1 }}
              whileTap={{ scale: canStart ? 0.97 : 1 }}
              onClick={onStartGame}
              disabled={!canStart}
              className={`w-full py-4 rounded-2xl font-black text-base tracking-widest transition-all duration-300 ${
                canStart
                  ? 'text-slate-900 cursor-pointer'
                  : 'text-white/30 bg-white/5 border border-white/10 cursor-not-allowed'
              }`}
              style={canStart ? {
                background: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #10b981 100%)',
                boxShadow: '0 0 40px rgba(52,211,153,0.35)',
              } : {}}
            >
              {canStart ? 'START GAME' : 'WAITING FOR PLAYER...'}
            </motion.button>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-white/40 text-sm">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/20 border-t-emerald-400 rounded-full"
                />
                Waiting for host to start...
              </div>
            </div>
          )}

          <button onClick={onBack} className="w-full text-center text-white/20 hover:text-white/50 transition-colors text-sm py-1">
            ← Leave Lobby
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Create / Join forms ──
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen w-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 0%, #0e1f18 0%, #080c12 60%, #08080f 100%)' }}
    >
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <h1 className="text-4xl font-black text-white tracking-tight">Online</h1>
          <p className="text-white/40 text-sm mt-1">Play from separate devices</p>
        </div>

        <AnimatePresence mode="wait">
          {view === 'choice' && (
            <motion.div key="choice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setView('create')}
                className="w-full p-5 rounded-2xl border-2 border-emerald-400/40 bg-emerald-500/10 flex items-center gap-4 hover:bg-emerald-500/15 transition-all"
              >
                <span className="text-3xl">🏠</span>
                <div className="text-left">
                  <div className="text-white font-bold">Create Game</div>
                  <div className="text-white/40 text-xs">Get a code to share with a friend</div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setView('join')}
                className="w-full p-5 rounded-2xl border-2 border-blue-400/40 bg-blue-500/10 flex items-center gap-4 hover:bg-blue-500/15 transition-all"
              >
                <span className="text-3xl">🚪</span>
                <div className="text-left">
                  <div className="text-white font-bold">Join Game</div>
                  <div className="text-white/40 text-xs">Enter a code from your friend</div>
                </div>
              </motion.button>

              <button onClick={onBack} className="w-full text-center text-white/20 hover:text-white/50 transition-colors text-sm py-2">
                ← Back to Setup
              </button>
            </motion.div>
          )}

          {view === 'create' && (
            <motion.div key="create" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <p className="text-white/25 text-[10px] uppercase tracking-widest font-bold pl-1">Your Profile</p>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-2xl bg-emerald-500/20 border-2 border-emerald-400/60">
                    {avatar}
                  </div>
                  <input
                    type="text"
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value)}
                    maxLength={20}
                    placeholder="Your name…"
                    className="flex-1 px-3 py-2.5 bg-white/8 border border-white/12 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/35 focus:bg-white/10 transition-all"
                  />
                </div>
                <AvatarPicker value={avatar} onChange={setAvatar} avatars={AVATARS} />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleCreate}
                disabled={!playerName.trim() || loading}
                className="w-full py-4 rounded-2xl font-black text-base tracking-widest text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #10b981 100%)', boxShadow: '0 0 40px rgba(52,211,153,0.35)' }}
              >
                {loading ? 'CREATING...' : 'CREATE GAME'}
              </motion.button>

              <button onClick={() => setView('choice')} className="w-full text-center text-white/20 hover:text-white/50 transition-colors text-sm py-1">
                ← Back
              </button>
            </motion.div>
          )}

          {view === 'join' && (
            <motion.div key="join" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <p className="text-white/25 text-[10px] uppercase tracking-widest font-bold pl-1">Your Profile</p>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-2xl bg-blue-500/20 border-2 border-blue-400/60">
                    {avatar}
                  </div>
                  <input
                    type="text"
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value)}
                    maxLength={20}
                    placeholder="Your name…"
                    className="flex-1 px-3 py-2.5 bg-white/8 border border-white/12 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/35 focus:bg-white/10 transition-all"
                  />
                </div>
                <AvatarPicker value={avatar} onChange={setAvatar} avatars={P2_AVATARS} />
              </div>

              <div>
                <p className="text-white/25 text-[10px] uppercase tracking-widest font-bold pl-1 mb-2">Game Code</p>
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  maxLength={6}
                  placeholder="XXXXXX"
                  className="w-full px-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white text-center text-xl font-black tracking-widest placeholder-white/15 focus:outline-none focus:border-white/35 focus:bg-white/10 transition-all uppercase"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleJoin}
                disabled={!playerName.trim() || joinCode.length < 6 || loading}
                className="w-full py-4 rounded-2xl font-black text-base tracking-widest text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 50%, #3b82f6 100%)', boxShadow: '0 0 40px rgba(96,165,250,0.35)' }}
              >
                {loading ? 'JOINING...' : 'JOIN GAME'}
              </motion.button>

              <button onClick={() => setView('choice')} className="w-full text-center text-white/20 hover:text-white/50 transition-colors text-sm py-1">
                ← Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
