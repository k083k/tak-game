/**
 * Represents a player in the game
 */
export class Player {
  constructor(name, isHuman = true) {
    this.name = name;
    this.isHuman = isHuman;
    this.hand = [];
    this.totalScore = 0;
    this.roundScores = [];
  }

  /**
   * Add a card to the player's hand
   */
  addCard(card) {
    this.hand.push(card);
  }

  /**
   * Remove a card from the player's hand
   */
  removeCard(cardIndex) {
    if (cardIndex < 0 || cardIndex >= this.hand.length) {
      throw new Error('Invalid card index');
    }
    return this.hand.splice(cardIndex, 1)[0];
  }

  /**
   * Get the player's current hand
   */
  getHand() {
    return [...this.hand];
  }

  /**
   * Set the player's hand (for reordering)
   */
  setHand(newHand) {
    this.hand = [...newHand];
  }

  /**
   * Clear the player's hand
   */
  clearHand() {
    this.hand = [];
  }

  /**
   * Get number of cards in hand
   */
  getHandSize() {
    return this.hand.length;
  }

  /**
   * Add score for the current round
   */
  addRoundScore(score) {
    this.roundScores.push(score);
    this.totalScore += score;
  }

  /**
   * Get total score across all rounds
   */
  getTotalScore() {
    return this.totalScore;
  }

  /**
   * Get scores for all rounds
   */
  getRoundScores() {
    return [...this.roundScores];
  }

  /**
   * Reset player for new game
   */
  reset() {
    this.hand = [];
    this.totalScore = 0;
    this.roundScores = [];
  }

  /**
   * Check if player has a specific card
   */
  hasCard(card) {
    return this.hand.some(c => c.equals(card));
  }

  /**
   * Find card index in hand
   */
  findCardIndex(card) {
    return this.hand.findIndex(c => c.equals(card));
  }
}
