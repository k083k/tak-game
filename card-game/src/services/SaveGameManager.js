/**
 * Manager for saving and loading game state to localStorage
 */
export class SaveGameManager {
  static SAVE_KEY = 'card_game_save';

  /**
   * Save current game state
   */
  static saveGame(gameState) {
    try {
      const saveData = {
        timestamp: Date.now(),
        gameMode: gameState.gameMode,
        difficulty: gameState.difficulty,
        playerName: gameState.playerName,
        playerAvatar: gameState.playerAvatar,
        gameEngine: this.serializeGameEngine(gameState.gameEngine),
        gamePhase: gameState.gameState,
        selectedCardIndex: gameState.selectedCardIndex,
        hasDrawn: gameState.hasDrawn,
        roundResult: gameState.roundResult,
      };

      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }

  /**
   * Load saved game state
   */
  static loadGame() {
    try {
      const savedData = localStorage.getItem(this.SAVE_KEY);
      if (!savedData) return null;

      const data = JSON.parse(savedData);
      return data;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * Check if a saved game exists
   */
  static hasSavedGame() {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  /**
   * Clear saved game
   */
  static clearSave() {
    localStorage.removeItem(this.SAVE_KEY);
  }

  /**
   * Serialize GameEngine instance to plain object
   */
  static serializeGameEngine(engine) {
    if (!engine) return null;

    return {
      player1: {
        name: engine.player1.name,
        avatar: engine.player1.avatar,
        hand: engine.player1.getHand().map(card => ({
          suit: card.suit,
          rank: card.rank
        })),
        roundScores: engine.player1.roundScores,
        isHuman: engine.player1.isHuman
      },
      player2: {
        name: engine.player2.name,
        avatar: engine.player2.avatar,
        hand: engine.player2.getHand().map(card => ({
          suit: card.suit,
          rank: card.rank
        })),
        roundScores: engine.player2.roundScores,
        isHuman: engine.player2.isHuman
      },
      deck: engine.deck.cards.map(card => ({
        suit: card.suit,
        rank: card.rank
      })),
      discardPile: engine.discardPile.map(card => ({
        suit: card.suit,
        rank: card.rank
      })),
      currentRound: engine.currentRound,
      currentPlayerIndex: engine.currentPlayerIndex,
      knockedPlayerIndex: engine.knockedPlayerIndex,
      wildRank: engine.wildRank
    };
  }

  /**
   * Deserialize saved data back to game objects
   * This will be used in useGameState to reconstruct the game
   */
  static deserializeGameEngine(data) {
    // Return the serialized data - useGameState will handle reconstruction
    return data;
  }
}
