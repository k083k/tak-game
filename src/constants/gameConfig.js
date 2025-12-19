/**
 * Game configuration constants
 * All game-related rules, timings, and settings
 */

// Game Rules
export const GAME_RULES = {
  MAX_ROUNDS: 11,
  STARTING_CARDS_ROUND_1: 3,
  CARDS_IN_DECK: 54, // 52 + 2 jokers
};

// Knock Window Durations (in seconds)
export const KNOCK_WINDOW = {
  EASY: 3,
  HARD: 1,
};

// AI Behavior
export const AI_CONFIG = {
  THINKING_DELAY_MS: 500,
  MIN_USEFULNESS_TO_DRAW_DISCARD: 3,
  KNOCK_ONLY_ON_ZERO: true,
};

// Card Scoring Values
export const CARD_SCORES = {
  JOKER: 50,
  ACE: 15,
  FACE_CARD: 10, // J, Q, K
  UNUSED_WILD: 25,
};

// Card Ranks
export const CARD_RANKS = {
  ACE: 1,
  JACK: 11,
  QUEEN: 12,
  KING: 13,
  JOKER: 0,
};

// Combination Requirements
export const COMBINATION_RULES = {
  MIN_SET_SIZE: 3,
  MIN_RUN_SIZE: 3,
};

// Game Modes
export const GAME_MODES = {
  PLAYER_VS_COMPUTER: 'pvc',
  PLAYER_VS_PLAYER: 'pvp',
};

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  HARD: 'hard',
};

// Player Configuration
export const PLAYER_CONFIG = {
  DEFAULT_NAME: 'Player 1',
  DEFAULT_AVATAR: '👤',
  COMPUTER_NAME: 'Computer',
  COMPUTER_AVATAR: '🤖',
  PLAYER_2_NAME: 'Player 2',
  PLAYER_2_AVATAR: '👥',
};

// Wild Rank Calculation
// Round 1 = rank 3, Round 2 = rank 4, ..., Round 11 = rank 13 (King)
export const WILD_RANK_OFFSET = 2;

// Save/Load Keys
export const STORAGE_KEYS = {
  SAVED_GAME: 'card_game_save',
};
