import { useState, useCallback, useEffect } from 'react';
import { useGameEngine } from './useGameEngine';
import { useTurnManagement } from './useTurnManagement';
import { useAIPlayer } from './useAIPlayer';
import { useGamePersistence } from './useGamePersistence';

/**
 * Main orchestrator hook for game state management
 * Composes specialized hooks and coordinates game flow
 */
export const useGameState = () => {
  // Compose specialized hooks
  const gameEngine = useGameEngine();
  const turnManagement = useTurnManagement(gameEngine.difficulty);
  const aiPlayer = useAIPlayer(gameEngine.difficulty);
  const persistence = useGamePersistence();

  // Additional UI state
  const [roundResult, setRoundResult] = useState(null);
  const [, forceUpdate] = useState(0);

  /**
   * Force a re-render
   */
  const refresh = useCallback(() => {
    forceUpdate(prev => prev + 1);
  }, []);

  /**
   * Auto-save game state whenever it changes
   */
  useEffect(() => {
    persistence.autoSaveGame({
      gameState: gameEngine.gameState,
      gameMode: gameEngine.gameMode,
      difficulty: gameEngine.difficulty,
      playerName: gameEngine.playerName,
      playerAvatar: gameEngine.playerAvatar,
      gameEngine: gameEngine.gameEngine,
      selectedCardIndex: turnManagement.selectedCardIndex,
      hasDrawn: turnManagement.hasDrawn,
      roundResult
    });
  }, [
    gameEngine.gameState,
    gameEngine.gameEngine,
    gameEngine.gameMode,
    gameEngine.difficulty,
    gameEngine.playerName,
    gameEngine.playerAvatar,
    turnManagement.selectedCardIndex,
    turnManagement.hasDrawn,
    roundResult,
    persistence
  ]);

  /**
   * Handle round end
   */
  const handleRoundEnd = useCallback((result) => {
    setRoundResult(result);
    gameEngine.endRound();
    refresh();
  }, [gameEngine, refresh]);

  /**
   * Execute AI turn
   */
  const playAITurn = useCallback(() => {
    if (!gameEngine.gameEngine || !gameEngine.ai) return;

    aiPlayer.executeAITurn(
      gameEngine.gameEngine,
      gameEngine.ai,
      refresh, // onDrawCard
      refresh, // onDiscardCard
      refresh, // onKnock
      (knockWindowDuration) => {
        // onTurnComplete
        turnManagement.setKnockCountdown(knockWindowDuration);

        const countdownInterval = setInterval(() => {
          turnManagement.setKnockCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(countdownInterval);
              return null;
            }
            return prev - 1;
          });
        }, 1000);

        refresh();
      },
      handleRoundEnd // onRoundEnd
    );
  }, [gameEngine.gameEngine, gameEngine.ai, aiPlayer, refresh, handleRoundEnd, turnManagement]);

  /**
   * Start a new game
   */
  const startNewGame = useCallback(() => {
    const { engine, aiInstance } = gameEngine.initializeGame();
    turnManagement.resetTurnState();
    refresh();

    // If computer starts first, let it play
    if (gameEngine.gameMode === 'pvc' && engine.currentPlayerIndex === 1 && aiInstance) {
      setTimeout(() => {
        playAITurn();
      }, 1000);
    }
  }, [gameEngine, turnManagement, refresh, playAITurn]);

  /**
   * Start next round
   */
  const startNextRound = useCallback(() => {
    if (!gameEngine.gameEngine) return;

    const hasNextRound = gameEngine.advanceRound();
    if (!hasNextRound) {
      // Game is over
      persistence.clearSavedGame();
      return;
    }

    turnManagement.resetTurnState();
    setRoundResult(null);
    refresh();

    // If computer starts this round, let it play
    if (gameEngine.gameMode === 'pvc' && gameEngine.gameEngine.currentPlayerIndex === 1) {
      setTimeout(() => {
        playAITurn();
      }, 1000);
    }
  }, [gameEngine, turnManagement, refresh, playAITurn, persistence]);

  /**
   * Player draws a card
   */
  const drawCard = useCallback((fromDiscard) => {
    turnManagement.drawCard(
      gameEngine.gameEngine,
      fromDiscard,
      handleRoundEnd,
      refresh
    );
  }, [gameEngine.gameEngine, turnManagement, handleRoundEnd, refresh]);

  /**
   * Player discards a card
   */
  const discardCard = useCallback((cardIndex) => {
    turnManagement.discardCard(
      gameEngine.gameEngine,
      cardIndex,
      () => {
        // onTurnComplete - if AI's turn, let it play
        if (gameEngine.gameMode === 'pvc' && gameEngine.gameEngine.currentPlayerIndex === 1) {
          setTimeout(() => {
            playAITurn();
          }, 300);
        } else {
          // PvP mode - refresh now since no AI turn
          refresh();
        }
      },
      handleRoundEnd,
      refresh
    );
  }, [gameEngine.gameEngine, gameEngine.gameMode, turnManagement, playAITurn, handleRoundEnd, refresh]);

  /**
   * Player knocks
   */
  const knock = useCallback(() => {
    turnManagement.knock(
      gameEngine.gameEngine,
      () => {
        // onKnockComplete
        refresh();

        // If playing against AI, let it take final turn
        if (gameEngine.gameMode === 'pvc' && gameEngine.gameEngine.currentPlayerIndex === 1) {
          setTimeout(() => {
            playAITurn();
          }, 1000);
        } else {
          refresh();
        }
      }
    );
  }, [gameEngine.gameEngine, gameEngine.gameMode, turnManagement, playAITurn, refresh]);

  /**
   * Return to setup screen
   */
  const returnToSetup = useCallback(() => {
    persistence.clearSavedGame();
    gameEngine.resetGame();
    setRoundResult(null);
    turnManagement.resetTurnState();
  }, [gameEngine, turnManagement, persistence]);

  /**
   * Reorder cards in player's hand
   */
  const reorderHand = useCallback((fromIndex, toIndex) => {
    turnManagement.reorderHand(
      gameEngine.gameEngine,
      fromIndex,
      toIndex,
      refresh
    );
  }, [gameEngine.gameEngine, turnManagement, refresh]);

  /**
   * Load a saved game
   */
  const loadSavedGame = useCallback(() => {
    const savedState = persistence.loadSavedGame();
    if (!savedState) return false;

    // Restore all state
    gameEngine.restoreGameState(savedState);
    turnManagement.setSelectedCardIndex(savedState.selectedCardIndex);
    // Note: hasDrawn and knockCountdown are not restored as they are transient
    setRoundResult(savedState.roundResult);

    return true;
  }, [persistence, gameEngine, turnManagement]);

  /**
   * Check if saved game exists
   */
  const hasSavedGame = useCallback(() => {
    return persistence.hasSavedGame();
  }, [persistence]);

  return {
    // Game configuration
    gameMode: gameEngine.gameMode,
    setGameMode: gameEngine.setGameMode,
    difficulty: gameEngine.difficulty,
    setDifficulty: gameEngine.setDifficulty,
    playerName: gameEngine.playerName,
    setPlayerName: gameEngine.setPlayerName,
    playerAvatar: gameEngine.playerAvatar,
    setPlayerAvatar: gameEngine.setPlayerAvatar,

    // Game state
    gameEngine: gameEngine.gameEngine,
    gameState: gameEngine.gameState,
    roundResult,

    // Turn state
    selectedCardIndex: turnManagement.selectedCardIndex,
    setSelectedCardIndex: turnManagement.setSelectedCardIndex,
    hasDrawn: turnManagement.hasDrawn,
    knockCountdown: turnManagement.knockCountdown,

    // Game actions
    startNewGame,
    startNextRound,
    drawCard,
    discardCard,
    knock,
    returnToSetup,
    reorderHand,
    refresh,

    // Persistence
    loadSavedGame,
    hasSavedGame,
    clearSavedGame: persistence.clearSavedGame,
  };
};
