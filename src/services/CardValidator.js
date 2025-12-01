import { Card } from '../models/Card';

/**
 * Service for validating card combinations (sets and runs)
 */
export class CardValidator {
  /**
   * Check if cards form a valid set (3+ cards of same rank)
   */
  static isValidSet(cards, wildRank = null) {
    if (!cards || cards.length < 3) {
      return false;
    }

    // Separate wild cards and regular cards
    const wilds = cards.filter(c =>
      c.rank === Card.RANKS.JOKER ||
      (wildRank !== null && c.rank === wildRank)
    );

    const regular = cards.filter(c =>
      c.rank !== Card.RANKS.JOKER &&
      (wildRank === null || c.rank !== wildRank)
    );

    // All wilds case
    if (regular.length === 0) {
      return wilds.length >= 3;
    }

    // All regular cards must have same rank
    const targetRank = regular[0].rank;
    return regular.every(c => c.rank === targetRank);
  }

  /**
   * Check if cards form a valid run (3+ consecutive same suit)
   */
  static isValidRun(cards, wildRank = null) {
    if (!cards || cards.length < 3) {
      return false;
    }

    // Separate wild cards and regular cards
    const wilds = cards.filter(c =>
      c.rank === Card.RANKS.JOKER ||
      (wildRank !== null && c.rank === wildRank)
    );

    const regular = cards.filter(c =>
      c.rank !== Card.RANKS.JOKER &&
      (wildRank === null || c.rank !== wildRank)
    );

    // Can't have run of only wilds
    if (regular.length === 0) {
      return false;
    }

    // All regular cards must be same suit
    const suit = regular[0].suit;
    if (!regular.every(c => c.suit === suit)) {
      return false;
    }

    // Sort regular cards by rank
    const sortedRegular = [...regular].sort((a, b) => a.rank - b.rank);

    // Check for duplicates
    for (let i = 0; i < sortedRegular.length - 1; i++) {
      if (sortedRegular[i].rank === sortedRegular[i + 1].rank) {
        return false;
      }
    }

    // Calculate gaps that need to be filled with wilds
    let gapsNeeded = 0;
    for (let i = 0; i < sortedRegular.length - 1; i++) {
      const gap = sortedRegular[i + 1].rank - sortedRegular[i].rank - 1;
      gapsNeeded += gap;
    }

    // Check if we have enough wilds to fill gaps
    return gapsNeeded <= wilds.length;
  }

  /**
   * Check if a card is wild for the current round
   */
  static isWildCard(card, wildRank) {
    return card.rank === Card.RANKS.JOKER || card.rank === wildRank;
  }

  /**
   * Validate multiple combinations in a hand
   */
  static validateCombinations(combinations, wildRank) {
    return combinations.every(combo => {
      if (combo.type === 'set') {
        return CardValidator.isValidSet(combo.cards, wildRank);
      } else if (combo.type === 'run') {
        return CardValidator.isValidRun(combo.cards, wildRank);
      }
      return false;
    });
  }

  /**
   * Check if combinations use cards more than once
   */
  static hasNoDuplicateCards(combinations) {
    const usedCards = new Set();

    for (const combo of combinations) {
      for (const card of combo.cards) {
        const cardKey = `${card.suit}-${card.rank}`;
        if (usedCards.has(cardKey)) {
          return false;
        }
        usedCards.add(cardKey);
      }
    }

    return true;
  }
}
