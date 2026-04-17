import { Card } from '../models/Card';
import { CardValidator } from './CardValidator';

/**
 * Service for calculating scores and finding optimal card combinations
 */
export class ScoreCalculator {
  // Updated algorithm to use minimum wilds per set
  /**
   * Find the best combination of sets and runs to minimize score
   * Uses exhaustive search to find optimal solution
   */
  static findBestCombination(hand, wildRank) {
    // Generate all possible sets and runs
    const allPossibleSets = this.generateAllPossibleSets(hand, wildRank);
    const allPossibleRuns = this.generateAllPossibleRuns(hand, wildRank);
    const allCombinations = [...allPossibleSets, ...allPossibleRuns];

    // Find the best non-overlapping combination
    const bestSolution = this.findOptimalCombination(hand, allCombinations, wildRank);

    return bestSolution;
  }

  /**
   * Find optimal non-overlapping combination using backtracking
   */
  static findOptimalCombination(hand, allCombinations, wildRank) {
    let bestScore = Infinity;
    let bestCombinations = [];
    let bestRemaining = [...hand];

    const tryCombo = (usedCardCounts, currentCombos, startIdx) => {
      // Calculate remaining cards properly
      const actualRemaining = [];
      for (const card of hand) {
        const cardKey = `${card.suit}-${card.rank}`;
        const usedCount = usedCardCounts.get(cardKey) || 0;
        const totalCount = hand.filter(c => c.suit === card.suit && c.rank === card.rank).length;

        // Only include if not all instances are used
        let instancesAdded = actualRemaining.filter(c => c.suit === card.suit && c.rank === card.rank).length;
        if (instancesAdded + usedCount < totalCount) {
          actualRemaining.push(card);
        }
      }

      const score = this.calculateRemainingScore(actualRemaining, wildRank);

      if (score < bestScore) {
        bestScore = score;
        bestCombinations = [...currentCombos];
        bestRemaining = [...actualRemaining];
      }

      // Try adding more combinations
      for (let i = startIdx; i < allCombinations.length; i++) {
        const combo = allCombinations[i];

        // Check if this combination overlaps with used cards
        let canUse = true;
        const comboCardCounts = new Map();

        for (const card of combo.cards) {
          const cardKey = `${card.suit}-${card.rank}`;
          comboCardCounts.set(cardKey, (comboCardCounts.get(cardKey) || 0) + 1);
        }

        for (const [cardKey, comboCount] of comboCardCounts) {
          const usedCount = usedCardCounts.get(cardKey) || 0;
          const totalInHand = hand.filter(c => `${c.suit}-${c.rank}` === cardKey).length;

          if (usedCount + comboCount > totalInHand) {
            canUse = false;
            break;
          }
        }

        if (canUse) {
          // Add this combination's cards to used counts
          const newUsedCardCounts = new Map(usedCardCounts);
          for (const card of combo.cards) {
            const cardKey = `${card.suit}-${card.rank}`;
            newUsedCardCounts.set(cardKey, (newUsedCardCounts.get(cardKey) || 0) + 1);
          }

          tryCombo(newUsedCardCounts, [...currentCombos, combo], i + 1);
        }
      }
    };

    tryCombo(new Map(), [], 0);

    return { combinations: bestCombinations, remaining: bestRemaining };
  }

  /**
   * Calculate score of remaining cards
   */
  static calculateRemainingScore(remaining, _wildRank) {
    let score = 0;
    for (const card of remaining) {
      if (card.rank === 0) {
        score += 50; // Joker
      } else {
        score += card.getScoreValue();
      }
    }
    return score;
  }

  /**
   * Generate all possible valid sets from the hand
   */
  static generateAllPossibleSets(hand, wildRank) {
    const possibleSets = [];
    const wilds = hand.filter(c => c.rank === Card.RANKS.JOKER || c.rank === wildRank);

    for (let rank = Card.RANKS.ACE; rank <= Card.RANKS.KING; rank++) {
      const regularOfRank = hand.filter(c =>
        c.rank === rank && c.rank !== wildRank && c.rank !== Card.RANKS.JOKER
      );

      if (regularOfRank.length === 0) continue;

      // Try different subset sizes of regular cards (from 0 to all available)
      for (let numRegular = 0; numRegular <= regularOfRank.length; numRegular++) {
        // Try different numbers of wilds (0 to all available)
        for (let numWilds = 0; numWilds <= wilds.length; numWilds++) {
          if (numRegular + numWilds >= 3) {
            // Try different combinations of which wilds to use
            for (let wildStart = 0; wildStart <= wilds.length - numWilds; wildStart++) {
              const setCards = [];

              // Add the specified number of regular cards
              for (let i = 0; i < numRegular; i++) {
                setCards.push(regularOfRank[i]);
              }

              // Add the specified number of wilds starting from wildStart
              for (let i = 0; i < numWilds; i++) {
                setCards.push(wilds[wildStart + i]);
              }

              if (setCards.length >= 3 && CardValidator.isValidSet(setCards, wildRank)) {
                possibleSets.push({ type: 'set', cards: setCards });
              }
            }
          }
        }
      }
    }

    return possibleSets;
  }

  /**
   * Generate all possible valid runs from the hand
   */
  static generateAllPossibleRuns(hand, wildRank) {
    const possibleRuns = [];
    const suits = Object.values(Card.SUITS).filter(s => s !== '' && s !== 'JR' && s !== 'JB');

    for (const suit of suits) {
      const cardsOfSuit = hand.filter(c =>
        c.suit === suit && c.rank !== wildRank && c.rank !== Card.RANKS.JOKER
      );

      if (cardsOfSuit.length === 0) continue;

      const wilds = hand.filter(c => c.rank === Card.RANKS.JOKER || c.rank === wildRank);
      const sorted = cardsOfSuit.sort((a, b) => a.rank - b.rank);

      // Try all possible run combinations
      for (let start = 0; start < sorted.length; start++) {
        for (let end = start; end < sorted.length; end++) {
          const runCards = sorted.slice(start, end + 1);

          // Try adding different numbers of wilds
          for (let numWilds = 0; numWilds <= wilds.length; numWilds++) {
            if (runCards.length + numWilds >= 3) {
              // Try different combinations of which wilds to use
              for (let wildStart = 0; wildStart <= wilds.length - numWilds; wildStart++) {
                const testRun = [...runCards];

                for (let i = 0; i < numWilds; i++) {
                  testRun.push(wilds[wildStart + i]);
                }

                if (CardValidator.isValidRun(testRun, wildRank)) {
                  possibleRuns.push({ type: 'run', cards: testRun });
                }
              }
            }
          }
        }
      }
    }

    return possibleRuns;
  }

  /**
   * Calculate score for a hand
   */
  static calculateScore(hand, wildRank) {
    const { combinations, remaining } = this.findBestCombination(hand, wildRank);

    let score = 0;
    for (const card of remaining) {
      // Unused wild cards still count their face value
      // Jokers count as 50 if unused
      if (card.rank === 0) {
        score += 50; // Joker
      } else {
        score += card.getScoreValue();
      }
    }

    return { score, combinations, remaining };
  }

  /**
   * Calculate total value of cards (useful for AI decision making)
   */
  static calculateHandValue(cards) {
    return cards.reduce((sum, card) => sum + card.getScoreValue(), 0);
  }

  /**
   * Estimate potential score reduction if a card is added
   */
  static estimateValueOfCard(card, hand, wildRank) {
    const currentResult = this.calculateScore(hand, wildRank);
    const testHand = [...hand, card];
    const newResult = this.calculateScore(testHand, wildRank);

    return currentResult.score - newResult.score;
  }
}
