import { useEffect, useCallback } from 'react';
import { SaveGameManager } from '../services/SaveGameManager';
import { Player } from '../models/Player';
import { GameEngine } from '../services/GameEngine';
import { Card } from '../models/Card';
import { AIFactory } from '../ai/AIFactory';

/**
 * Hook for managing game persistence (save/load)
 * Handles auto-save and game state restoration
 */
export const useGamePersistence = () => {
  /**
   * Auto-save game state whenever it changes
   */
  const autoSaveGame = useCallback((saveData) => {
    const { gameState, gameMode, difficulty, playerName, playerAvatar, gameEngine, selectedCardIndex, hasDrawn, roundResult } = saveData;

    // Only save if we're in an active game (not setup or transitioning)
    if (gameState === 'playing' || gameState === 'round-end') {
      SaveGameManager.saveGame({
        gameMode,
        difficulty,
        playerName,
        playerAvatar,
        gameEngine,
        gameState,
        selectedCardIndex,
        hasDrawn,
        roundResult
      });
    }
  }, []);

  /**
   * Load a saved game from localStorage
   * Returns reconstructed game state or null if load fails
   */
  const loadSavedGame = useCallback(() => {
    const savedData = SaveGameManager.loadGame();
    if (!savedData) return null;

    try {
      // Reconstruct game engine
      const engineData = savedData.gameEngine;

      // Recreate players
      const player1 = new Player(engineData.player1.name, engineData.player1.isHuman);
      player1.avatar = engineData.player1.avatar;
      player1.roundScores = engineData.player1.roundScores;
      player1.totalScore = engineData.player1.totalScore;
      player1.setHand(engineData.player1.hand.map(c => new Card(c.suit, c.rank)));

      const player2 = new Player(engineData.player2.name, engineData.player2.isHuman);
      player2.avatar = engineData.player2.avatar;
      player2.roundScores = engineData.player2.roundScores;
      player2.totalScore = engineData.player2.totalScore;
      player2.setHand(engineData.player2.hand.map(c => new Card(c.suit, c.rank)));

      // Recreate game engine
      const engine = new GameEngine(player1, player2);
      engine.currentRound = engineData.currentRound;
      engine.currentPlayerIndex = engineData.currentPlayerIndex;
      engine.knockedPlayerIndex = engineData.knockedPlayerIndex;
      engine.wildRank = engineData.wildRank;

      // Restore deck
      engine.deck.cards = engineData.deck.map(c => new Card(c.suit, c.rank));

      // Restore discard pile
      engine.discardPile = engineData.discardPile.map(c => new Card(c.suit, c.rank));

      // Recreate AI if needed
      const ai = savedData.gameMode === 'pvc' ? AIFactory.createAI() : null;

      // Reconstruct roundResult if it exists
      let roundResult = null;
      if (savedData.roundResult) {
        const reconstructRoundResult = (playerResult) => {
          return {
            ...playerResult,
            combinations: playerResult.combinations.map(combo => ({
              ...combo,
              cards: combo.cards.map(c => new Card(c.suit, c.rank))
            })),
            remaining: playerResult.remaining.map(c => new Card(c.suit, c.rank))
          };
        };

        roundResult = {
          ...savedData.roundResult,
          player1: reconstructRoundResult(savedData.roundResult.player1),
          player2: reconstructRoundResult(savedData.roundResult.player2)
        };
      }

      return {
        gameMode: savedData.gameMode,
        difficulty: savedData.difficulty,
        playerName: savedData.playerName,
        playerAvatar: savedData.playerAvatar,
        engine,
        ai,
        gamePhase: savedData.gamePhase,
        selectedCardIndex: savedData.selectedCardIndex,
        hasDrawn: savedData.hasDrawn,
        roundResult
      };
    } catch (error) {
      console.error('Failed to load saved game:', error);
      SaveGameManager.clearSave();
      return null;
    }
  }, []);

  /**
   * Check if a saved game exists
   */
  const hasSavedGame = useCallback(() => {
    return SaveGameManager.hasSavedGame();
  }, []);

  /**
   * Clear saved game data
   */
  const clearSavedGame = useCallback(() => {
    SaveGameManager.clearSave();
  }, []);

  return {
    autoSaveGame,
    loadSavedGame,
    hasSavedGame,
    clearSavedGame,
  };
};
