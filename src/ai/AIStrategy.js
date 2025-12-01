import { ScoreCalculator } from '../services/ScoreCalculator';

/**
 * Abstract base class for AI strategies
 */
export class AIStrategy {
  /**
   * Make a move (draw, discard, knock decision)
   * @param {GameEngine} gameEngine - Current game state
   * @param {Card[]} hand - AI's current hand
   * @returns {Object} Move decision {drawFrom: 'deck'|'discard', discardIndex: number, shouldKnock: boolean}
   */
  makeMove(gameEngine, hand) {
    throw new Error('makeMove() must be implemented by subclass');
  }

  /**
   * Evaluate usefulness of a card in the context of current hand
   */
  evaluateCardUsefulness(card, hand, wildRank) {
    let usefulness = 0;

    if (card.rank === 0 || card.rank === wildRank) {
      return 10; // Wild cards are very useful
    }

    // Check for potential sets (same rank)
    const sameRank = hand.filter(c =>
      c.rank === card.rank || c.rank === 0 || c.rank === wildRank
    ).length;

    if (sameRank >= 2) {
      usefulness += sameRank * 2;
    }

    // Check for potential runs (same suit, consecutive ranks)
    const sameSuit = hand.filter(c => c.suit === card.suit);
    for (const otherCard of sameSuit) {
      const diff = Math.abs(otherCard.rank - card.rank);
      if (diff <= 2 && diff > 0) {
        usefulness += 3 - diff; // Closer cards are more useful
      }
    }

    // Lower value cards are slightly more useful (less penalty if kept)
    usefulness += (15 - card.getScoreValue()) / 10;

    return usefulness;
  }

  /**
   * Find the best card to discard from hand
   */
  findBestDiscard(hand, gameEngine) {
    let bestIndex = 0;
    let bestScore = Infinity;
    const wildRank = gameEngine.getWildRank();

    for (let i = 0; i < hand.length; i++) {
      const testHand = [...hand];
      testHand.splice(i, 1);
      const result = ScoreCalculator.calculateScore(testHand, wildRank);

      if (result.score < bestScore) {
        bestScore = result.score;
        bestIndex = i;
      }
    }

    return { index: bestIndex, score: bestScore };
  }
}
