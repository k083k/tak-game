import { useState, useCallback } from 'react';
import { Player } from '../models/Player';
import { GameEngine } from '../services/GameEngine';
import { AIFactory } from '../ai/AIFactory';
import { PLAYER_CONFIG, GAME_MODES } from '../constants';

/**
 * Hook for managing core game engine state
 * Handles game initialization, player setup, and game lifecycle
 */
export const useGameEngine = () => {
  const [gameMode, setGameMode] = useState(GAME_MODES.PLAYER_VS_COMPUTER);
  const [difficulty, setDifficulty] = useState('easy');
  const [playerName, setPlayerName] = useState('');
  const [playerAvatar, setPlayerAvatar] = useState(PLAYER_CONFIG.DEFAULT_AVATAR);
  const [gameEngine, setGameEngine] = useState(null);
  const [ai, setAI] = useState(null);
  const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'round-end', 'game-over'

  /**
   * Initialize a new game with current settings
   */
  const initializeGame = useCallback(() => {
    const finalPlayerName = playerName.trim() || PLAYER_CONFIG.DEFAULT_NAME;
    const player1 = new Player(finalPlayerName, true);
    player1.avatar = playerAvatar;

    const player2 = new Player(
      gameMode === GAME_MODES.PLAYER_VS_COMPUTER ? PLAYER_CONFIG.COMPUTER_NAME : PLAYER_CONFIG.PLAYER_2_NAME,
      gameMode === GAME_MODES.PLAYER_VS_PLAYER
    );
    player2.avatar = gameMode === GAME_MODES.PLAYER_VS_COMPUTER ? PLAYER_CONFIG.COMPUTER_AVATAR : PLAYER_CONFIG.PLAYER_2_AVATAR;

    const engine = new GameEngine(player1, player2);
    const aiInstance = gameMode === GAME_MODES.PLAYER_VS_COMPUTER ? AIFactory.createAI() : null;

    setGameEngine(engine);
    setAI(aiInstance);
    setGameState('playing');

    engine.startRound();

    return { engine, aiInstance };
  }, [gameMode, playerName, playerAvatar]);

  /**
   * Start next round or end game
   */
  const advanceRound = useCallback(() => {
    if (!gameEngine) return false;

    if (gameEngine.isGameOver()) {
      setGameState('game-over');
      return false;
    }

    // Increment round before starting next round
    gameEngine.currentRound++;
    gameEngine.startRound();
    setGameState('playing');

    return true;
  }, [gameEngine]);

  /**
   * Reset game to setup screen
   */
  const resetGame = useCallback(() => {
    setGameState('setup');
    setGameEngine(null);
    setAI(null);
  }, []);

  /**
   * Set game state to round-end
   */
  const endRound = useCallback(() => {
    setGameState('round-end');
  }, []);

  /**
   * Restore game state from saved data
   */
  const restoreGameState = useCallback((state) => {
    setGameMode(state.gameMode);
    setDifficulty(state.difficulty);
    setPlayerName(state.playerName);
    setPlayerAvatar(state.playerAvatar);
    setGameEngine(state.engine);
    setAI(state.ai);
    setGameState(state.gamePhase);
  }, []);

  return {
    // State
    gameMode,
    difficulty,
    playerName,
    playerAvatar,
    gameEngine,
    ai,
    gameState,

    // Setters
    setGameMode,
    setDifficulty,
    setPlayerName,
    setPlayerAvatar,

    // Actions
    initializeGame,
    advanceRound,
    resetGame,
    endRound,
    restoreGameState,
  };
};
