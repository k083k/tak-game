import { supabase } from '../lib/supabase';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

function getOrCreatePlayerId() {
  let id = localStorage.getItem('tak_player_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('tak_player_id', id);
  }
  return id;
}

export const MultiplayerService = {
  getOrCreatePlayerId,

  async createGame(playerName, avatar) {
    const playerId = getOrCreatePlayerId();

    let code;
    for (let attempt = 0; attempt < 5; attempt++) {
      code = generateCode();
      const { data } = await supabase.from('tak_games').select('id').eq('code', code).maybeSingle();
      if (!data) break;
    }

    const { data: game, error: gameError } = await supabase
      .from('tak_games')
      .insert({ code, host_id: playerId, status: 'waiting' })
      .select()
      .single();

    if (gameError) throw gameError;

    const { error: playerError } = await supabase
      .from('tak_game_players')
      .insert({ game_id: game.id, player_id: playerId, player_name: playerName, avatar, seat: 0, is_host: true });

    if (playerError) throw playerError;

    return { gameId: game.id, code: game.code, playerId, seat: 0 };
  },

  async joinGame(code, playerName, avatar) {
    const playerId = getOrCreatePlayerId();
    const normalized = code.trim().toUpperCase().replace(/\s/g, '');

    const { data: game, error } = await supabase
      .from('tak_games')
      .select('*')
      .eq('code', normalized)
      .maybeSingle();

    if (error || !game) throw new Error('Game not found. Check your code and try again.');
    if (game.status !== 'waiting') throw new Error('This game has already started.');

    const { data: existingPlayers } = await supabase
      .from('tak_game_players')
      .select('player_id, seat')
      .eq('game_id', game.id);

    // Allow rejoin
    const existing = existingPlayers?.find(p => p.player_id === playerId);
    if (existing) {
      return { gameId: game.id, code: game.code, playerId, seat: existing.seat, hostId: game.host_id };
    }

    if ((existingPlayers?.length ?? 0) >= 2) throw new Error('This game is already full.');

    const { error: playerError } = await supabase
      .from('tak_game_players')
      .insert({ game_id: game.id, player_id: playerId, player_name: playerName, avatar, seat: 1, is_host: false });

    if (playerError) throw playerError;

    return { gameId: game.id, code: game.code, playerId, seat: 1, hostId: game.host_id };
  },

  async getPlayers(gameId) {
    const { data } = await supabase
      .from('tak_game_players')
      .select('*')
      .eq('game_id', gameId)
      .order('seat');
    return data ?? [];
  },

  async startGame(gameId) {
    const { error } = await supabase
      .from('tak_games')
      .update({ status: 'playing' })
      .eq('id', gameId);
    if (error) throw error;
  },

  async pushGameState(gameId, state) {
    const { error } = await supabase
      .from('tak_game_state')
      .upsert({ game_id: gameId, state, updated_at: new Date().toISOString() });
    if (error) throw error;
  },

  subscribeToPlayers(gameId, callback) {
    const channel = supabase
      .channel(`tak_players:${gameId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tak_game_players', filter: `game_id=eq.${gameId}` }, callback)
      .subscribe();
    return () => supabase.removeChannel(channel);
  },

  subscribeToGameState(gameId, callback) {
    const channel = supabase
      .channel(`tak_state:${gameId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tak_game_state', filter: `game_id=eq.${gameId}` },
        (payload) => callback(payload.new.state))
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
};
