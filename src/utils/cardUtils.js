import { RANK_DISPLAY, SUIT_NAMES, CARD_SIZES } from '../constants';

/**
 * Utility functions for card-related operations
 */

/**
 * Get display string for card rank (e.g., 1 → 'A', 11 → 'J')
 * @param {number} rank - Card rank (1-13)
 * @returns {string} Display string for rank
 */
export const getCardRankDisplay = (rank) => {
  return RANK_DISPLAY[rank] || rank.toString();
};

/**
 * Get wild rank display for current round
 * @param {number} wildRank - Wild rank for the round
 * @returns {string} Display string for wild rank
 */
export const getWildRankDisplay = (wildRank) => {
  return getCardRankDisplay(wildRank);
};

/**
 * Get card dimensions based on size
 * @param {string} size - Size key ('xs', 'sm', 'md', 'lg')
 * @returns {object} Card dimensions object
 */
export const getCardDimensions = (size = 'md') => {
  return CARD_SIZES[size] || CARD_SIZES.md;
};

/**
 * Get image path for a card
 * @param {object} card - Card object with suit and rank
 * @returns {string} Path to card image
 */
export const getCardImagePath = (card) => {
  if (!card) {
    return '/cards/joker_red.png';
  }

  // Handle jokers
  if (card.isJoker()) {
    if (card.suit === 'JB') {
      return '/cards/joker_black.png';
    }
    return '/cards/joker_red.png';
  }

  const suitName = SUIT_NAMES[card.suit];

  // Map rank to file name
  let rankName;
  if (card.rank >= 2 && card.rank <= 10) {
    rankName = card.rank.toString();
  } else if (card.rank === 1) {
    rankName = '1'; // Ace
  } else if (card.rank === 11) {
    rankName = 'jack';
  } else if (card.rank === 12) {
    rankName = 'queen';
  } else if (card.rank === 13) {
    rankName = 'king';
  }

  return `/cards/${suitName}_${rankName}.png`;
};

/**
 * Format card for display (e.g., "A♠", "K♥")
 * @param {object} card - Card object
 * @returns {string} Formatted card string
 */
export const formatCard = (card) => {
  if (!card) return '';
  if (card.isJoker()) return 'Joker';
  return `${getCardRankDisplay(card.rank)}${card.suit}`;
};

/**
 * Check if two cards are equal
 * @param {object} card1 - First card
 * @param {object} card2 - Second card
 * @returns {boolean} True if cards are equal
 */
export const areCardsEqual = (card1, card2) => {
  if (!card1 || !card2) return false;
  return card1.suit === card2.suit && card1.rank === card2.rank;
};

/**
 * Sort cards by rank, then by suit
 * @param {array} cards - Array of cards
 * @returns {array} Sorted array of cards
 */
export const sortCards = (cards) => {
  return [...cards].sort((a, b) => {
    if (a.rank !== b.rank) {
      return a.rank - b.rank;
    }
    return a.suit.localeCompare(b.suit);
  });
};

/**
 * Group cards by rank
 * @param {array} cards - Array of cards
 * @returns {object} Object with ranks as keys and arrays of cards as values
 */
export const groupCardsByRank = (cards) => {
  return cards.reduce((groups, card) => {
    const rank = card.rank;
    if (!groups[rank]) {
      groups[rank] = [];
    }
    groups[rank].push(card);
    return groups;
  }, {});
};

/**
 * Group cards by suit
 * @param {array} cards - Array of cards
 * @returns {object} Object with suits as keys and arrays of cards as values
 */
export const groupCardsBySuit = (cards) => {
  return cards.reduce((groups, card) => {
    const suit = card.suit;
    if (!groups[suit]) {
      groups[suit] = [];
    }
    groups[suit].push(card);
    return groups;
  }, {});
};
