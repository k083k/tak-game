import { useState, useCallback } from 'react';
import { Player } from '../models/Player';
import { GameEngine } from '../services/GameEngine';
import { AIFactory } from '../ai/AIFactory';

/**
 * Hook for managing core game engine state
 * Handles game initialization, player setup, and game lifecycle
 */
export const useGameEngine = () => {
  const [gameMode, setGameMode] = useState('pvc'); // 'pvc' or 'pvp'
  const [difficulty, setDifficulty] = useState('easy'); // 'easy' or 'hard'
  const [playerName, setPlayerName] = useState('');
  const [playerAvatar, setPlayerAvatar] = useState('👤');
  const [gameEngine, setGameEngine] = useState(null);
  const [ai, setAI] = useState(null);
  const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'round-end', 'game-over'

  /**
   * Initialize a new game with current settings
   */
  const initializeGame = useCallback(() => {
    const finalPlayerName = playerName.trim() || 'Player 1';
    const player1 = new Player(finalPlayerName, true);
    player1.avatar = playerAvatar;

    const player2 = new Player(
      gameMode === 'pvc' ? 'Computer' : 'Player 2',
      gameMode === 'pvp'
    );
    player2.avatar = gameMode === 'pvc' ? '🤖' : '👥';

    const engine = new GameEngine(player1, player2);
    const aiInstance = gameMode === 'pvc' ? AIFactory.createAI() : null;

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
