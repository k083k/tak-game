/**
 * Represents a playing card
 */
export class Card {
  static SUITS = {
    SPADES: '♠',
    HEARTS: '♥',
    DIAMONDS: '♦',
    CLUBS: '♣',
    JOKER_RED: 'JR',
    JOKER_BLACK: 'JB'
  };

  static RANKS = {
    ACE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
    SIX: 6,
    SEVEN: 7,
    EIGHT: 8,
    NINE: 9,
    TEN: 10,
    JACK: 11,
    QUEEN: 12,
    KING: 13,
    JOKER: 0
  };

  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
  }

  /**
   * Check if this is a Joker
   */
  isJoker() {
    return this.rank === Card.RANKS.JOKER || this.suit === Card.SUITS.JOKER_RED || this.suit === Card.SUITS.JOKER_BLACK;
  }

  /**
   * Get display rank (A, 2-10, J, Q, K)
   */
  getDisplayRank() {
    if (this.isJoker()) return 'JOKER';

    const rankMap = {
      1: 'A',
      11: 'J',
      12: 'Q',
      13: 'K'
    };

    return rankMap[this.rank] || this.rank.toString();
  }

  /**
   * Get numeric value for sequences (Ace = 1)
   */
  getSequenceValue() {
    return this.rank;
  }

  /**
   * Get score value (if card is not in a set/run)
   */
  getScoreValue() {
    if (this.isJoker()) return 0;
    if (this.rank === Card.RANKS.ACE) return 15;
    if (this.rank >= Card.RANKS.JACK && this.rank <= Card.RANKS.KING) return 10;
    return this.rank;
  }

  /**
   * Check if card is red
   */
  isRed() {
    return this.suit === Card.SUITS.HEARTS || this.suit === Card.SUITS.DIAMONDS;
  }

  /**
   * Check if card is black
   */
  isBlack() {
    return this.suit === Card.SUITS.SPADES || this.suit === Card.SUITS.CLUBS;
  }

  /**
   * Get string representation
   */
  toString() {
    if (this.isJoker()) return 'JOKER';
    return `${this.getDisplayRank()}${this.suit}`;
  }

  /**
   * Create a copy of this card
   */
  clone() {
    return new Card(this.suit, this.rank);
  }

  /**
   * Check if two cards are equal
   */
  equals(other) {
    return this.suit === other.suit && this.rank === other.rank;
  }
}
