import { Deck } from '../models/Deck';
import { ScoreCalculator } from './ScoreCalculator';

/**
 * Main game engine that manages game state and rules
 */
export class GameEngine {
  static MAX_ROUNDS = 13;
  static STARTING_CARDS_ROUND_1 = 3;

  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
    this.deck = new Deck();
    this.discardPile = [];
    this.currentRound = 1;
    this.currentPlayerIndex = 0; // 0 or 1
    this.knockedPlayerIndex = null;
    this.gameOver = false;
  }

  /**
   * Get the current player
   */
  getCurrentPlayer() {
    return this.currentPlayerIndex === 0 ? this.player1 : this.player2;
  }

  /**
   * Get the other player
   */
  getOtherPlayer() {
    return this.currentPlayerIndex === 0 ? this.player2 : this.player1;
  }

  /**
   * Get wild rank for current round
   * Wraps around: Round 1 = 3, Round 11 = 13(K), Round 12 = 1(A), Round 13 = 2
   */
  getWildRank() {
    const wildRank = this.currentRound + 2;
    // Wrap around after King (13) back to Ace (1)
    return wildRank > 13 ? wildRank - 13 : wildRank;
  }

  /**
   * Get number of cards to deal for current round
   */
  getCardsPerPlayer() {
    return GameEngine.STARTING_CARDS_ROUND_1 + (this.currentRound - 1);
  }

  /**
   * Start a new round
   */
  startRound() {
    // Reset deck and hands
    this.deck.reset();
    this.player1.clearHand();
    this.player2.clearHand();
    this.discardPile = [];
    this.knockedPlayerIndex = null;

    // Alternate starting player each round
    // Odd rounds (1, 3, 5, ...): Player 1 starts (index 0)
    // Even rounds (2, 4, 6, ...): Player 2 starts (index 1)
    this.currentPlayerIndex = (this.currentRound - 1) % 2;

    const cardsPerPlayer = this.getCardsPerPlayer();

    // Deal cards to both players
    for (let i = 0; i < cardsPerPlayer; i++) {
      this.player1.addCard(this.deck.draw());
      this.player2.addCard(this.deck.draw());
    }

    // Flip the top card to start discard pile
    if (this.deck.hasCards()) {
      this.discardPile.push(this.deck.draw());
    }
  }

  /**
   * Draw a card from deck or discard pile
   */
  drawCard(fromDiscard = false) {
    if (fromDiscard && this.discardPile.length > 0) {
      return this.discardPile.pop();
    }

    if (this.deck.hasCards()) {
      return this.deck.draw();
    }

    return null;
  }

  /**
   * Discard a card
   */
  discardCard(card) {
    this.discardPile.push(card);
  }

  /**
   * Get the top card of discard pile without removing it
   */
  peekDiscard() {
    if (this.discardPile.length === 0) return null;
    return this.discardPile[this.discardPile.length - 1];
  }

  /**
   * Player knocks
   */
  knock(playerIndex) {
    if (this.knockedPlayerIndex !== null) {
      throw new Error('Someone has already knocked');
    }
    this.knockedPlayerIndex = playerIndex;
  }

  /**
   * Switch to the other player
   */
  switchPlayer() {
    this.currentPlayerIndex = this.currentPlayerIndex === 0 ? 1 : 0;
  }

  /**
   * Check if the current round is over
   */
  isRoundOver() {
    return this.knockedPlayerIndex !== null &&
           this.currentPlayerIndex === this.knockedPlayerIndex;
  }

  /**
   * End the current round and calculate scores
   */
  endRound() {
    const wildRank = this.getWildRank();

    const p1Result = ScoreCalculator.calculateScore(
      this.player1.getHand(),
      wildRank
    );

    const p2Result = ScoreCalculator.calculateScore(
      this.player2.getHand(),
      wildRank
    );

    this.player1.addRoundScore(p1Result.score);
    this.player2.addRoundScore(p2Result.score);

    const roundResult = {
      round: this.currentRound,
      wildRank,
      player1: {
        ...p1Result,
        name: this.player1.name,
        totalScore: this.player1.getTotalScore()
      },
      player2: {
        ...p2Result,
        name: this.player2.name,
        totalScore: this.player2.getTotalScore()
      }
    };

    // Don't increment round here - let it happen when starting next round
    // Check if game will be over after this round
    if (this.currentRound >= GameEngine.MAX_ROUNDS) {
      this.gameOver = true;
    }

    return roundResult;
  }

  /**
   * Get the winner of the game
   */
  getWinner() {
    if (!this.gameOver) return null;

    const p1Score = this.player1.getTotalScore();
    const p2Score = this.player2.getTotalScore();

    if (p1Score < p2Score) return this.player1;
    if (p2Score < p1Score) return this.player2;
    return null; // Tie
  }

  /**
   * Check if game is over
   */
  isGameOver() {
    return this.gameOver;
  }

  /**
   * Reset the game for a new match
   */
  reset() {
    this.player1.reset();
    this.player2.reset();
    this.currentRound = 1;
    this.currentPlayerIndex = 0;
    this.knockedPlayerIndex = null;
    this.gameOver = false;
    this.discardPile = [];
    this.deck.reset();
  }

  /**
   * Get current game state snapshot
   */
  getGameState() {
    return {
      currentRound: this.currentRound,
      currentPlayer: this.getCurrentPlayer(),
      wildRank: this.getWildRank(),
      discardPileTop: this.peekDiscard(),
      deckSize: this.deck.getCardCount(),
      knockedPlayer: this.knockedPlayerIndex !== null
        ? (this.knockedPlayerIndex === 0 ? this.player1 : this.player2)
        : null,
      gameOver: this.gameOver,
      player1Score: this.player1.getTotalScore(),
      player2Score: this.player2.getTotalScore()
    };
  }
}
