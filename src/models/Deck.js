import { Card } from './Card';

/**
 * Represents a deck of playing cards
 */
export class Deck {
  constructor() {
    this.cards = [];
    this.initialize();
  }

  /**
   * Initialize a standard 52-card deck plus 2 jokers
   */
  initialize() {
    this.cards = [];
    const suits = Object.values(Card.SUITS).filter(s => s !== 'JR' && s !== 'JB');

    // Add regular cards (Ace through King for each suit)
    for (const suit of suits) {
      for (let rank = Card.RANKS.ACE; rank <= Card.RANKS.KING; rank++) {
        this.cards.push(new Card(suit, rank));
      }
    }

    // Add 2 Jokers (one red, one black)
    this.cards.push(new Card(Card.SUITS.JOKER_RED, Card.RANKS.JOKER));
    this.cards.push(new Card(Card.SUITS.JOKER_BLACK, Card.RANKS.JOKER));
  }

  /**
   * Shuffle the deck using Fisher-Yates algorithm
   */
  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  /**
   * Draw a card from the top of the deck
   */
  draw() {
    if (this.cards.length === 0) {
      throw new Error('Cannot draw from empty deck');
    }
    return this.cards.pop();
  }

  /**
   * Check if deck has cards remaining
   */
  hasCards() {
    return this.cards.length > 0;
  }

  /**
   * Get number of cards remaining
   */
  getCardCount() {
    return this.cards.length;
  }

  /**
   * Peek at the top card without removing it
   */
  peek() {
    if (this.cards.length === 0) {
      return null;
    }
    return this.cards[this.cards.length - 1];
  }

  /**
   * Reset and reshuffle the deck
   */
  reset() {
    this.initialize();
    this.shuffle();
  }
}
