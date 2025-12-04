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
  static calculateRemainingScore(remaining, wildRank) {
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
   * Old method - kept for compatibility but not used
   */
  static findSets(remaining, combinations, wildRank) {
    // First pass: Form sets that don't need wilds (3+ regular cards of same rank)
    for (let rank = Card.RANKS.ACE; rank <= Card.RANKS.KING; rank++) {
      const regularOfRank = remaining.filter(c =>
        c.rank === rank && c.rank !== wildRank && c.rank !== Card.RANKS.JOKER
      );

      if (regularOfRank.length >= 3) {
        // Already have 3+, form a set without wilds
        const setCards = [...regularOfRank];

        if (CardValidator.isValidSet(setCards, wildRank)) {
          combinations.push({ type: 'set', cards: setCards });

          // Remove used cards from remaining
          setCards.forEach(card => {
            const idx = remaining.findIndex(c => c === card);
            if (idx > -1) remaining.splice(idx, 1);
          });
        }
      }
    }

    // Second pass: Form sets that need wilds (distribute wilds to ranks with 1-2 cards)
    for (let rank = Card.RANKS.ACE; rank <= Card.RANKS.KING; rank++) {
      const regularOfRank = remaining.filter(c =>
        c.rank === rank && c.rank !== wildRank && c.rank !== Card.RANKS.JOKER
      );

      const wildsAvailable = remaining.filter(c =>
        c.rank === Card.RANKS.JOKER || c.rank === wildRank
      );

      if (regularOfRank.length > 0 && regularOfRank.length < 3 &&
          regularOfRank.length + wildsAvailable.length >= 3) {
        const setCards = [...regularOfRank];

        // Add minimum wilds needed to reach 3
        const needWilds = 3 - regularOfRank.length;
        for (let i = 0; i < needWilds && i < wildsAvailable.length; i++) {
          setCards.push(wildsAvailable[i]);
        }

        if (setCards.length >= 3 && CardValidator.isValidSet(setCards, wildRank)) {
          combinations.push({ type: 'set', cards: setCards });

          // Remove used cards from remaining
          setCards.forEach(card => {
            const idx = remaining.findIndex(c => c === card);
            if (idx > -1) remaining.splice(idx, 1);
          });
        }
      }
    }

    // Third pass: Add any leftover wilds to existing sets to minimize remaining cards
    const leftoverWilds = remaining.filter(c =>
      c.rank === Card.RANKS.JOKER || c.rank === wildRank
    );

    if (leftoverWilds.length > 0 && combinations.length > 0) {
      // Add leftover wilds to the first set found
      combinations[0].cards.push(...leftoverWilds);
      leftoverWilds.forEach(card => {
        const idx = remaining.findIndex(c => c === card);
        if (idx > -1) remaining.splice(idx, 1);
      });
    }
  }

  /**
   * Find all possible runs in the remaining cards
   */
  static findRuns(remaining, combinations, wildRank) {
    const suits = Object.values(Card.SUITS).filter(s => s !== '' && s !== 'JR' && s !== 'JB');

    for (const suit of suits) {
      const cardsOfSuit = remaining.filter(c =>
        c.suit === suit ||
        c.rank === Card.RANKS.JOKER ||
        c.rank === wildRank
      );

      if (cardsOfSuit.length < 3) continue;

      // Regular cards are those matching the suit but NOT wild cards
      const regular = cardsOfSuit
        .filter(c => c.suit === suit && c.rank !== wildRank && c.rank !== Card.RANKS.JOKER)
        .sort((a, b) => a.rank - b.rank);

      const wilds = cardsOfSuit.filter(c =>
        c.rank === Card.RANKS.JOKER || c.rank === wildRank
      );

      if (regular.length < 1) continue;

      // Try to build longest run starting from each card
      const longestRun = this.findLongestRun(regular, wilds, wildRank);

      if (longestRun && longestRun.length >= 3 &&
          CardValidator.isValidRun(longestRun, wildRank)) {
        combinations.push({ type: 'run', cards: longestRun });

        // Remove used cards from remaining
        longestRun.forEach(card => {
          const idx = remaining.findIndex(c => c === card);
          if (idx > -1) remaining.splice(idx, 1);
        });
      }
    }
  }

  /**
   * Find the longest possible run from a set of cards
   */
  static findLongestRun(regular, wilds, wildRank) {
    let longestRun = [];

    for (let start = 0; start < regular.length; start++) {
      const runCards = [regular[start]];
      const usedWilds = [];
      let expectedRank = regular[start].rank + 1;

      // Extend forwards filling gaps
      for (let i = start + 1; i < regular.length; i++) {
        const gap = regular[i].rank - expectedRank;

        if (gap === 0) {
          // Next card is consecutive
          runCards.push(regular[i]);
          expectedRank = regular[i].rank + 1;
        } else if (gap > 0 && usedWilds.length + gap <= wilds.length) {
          // Fill gap with wilds
          for (let j = 0; j < gap; j++) {
            const wildCard = wilds[usedWilds.length];
            runCards.push(wildCard);
            usedWilds.push(wildCard);
          }
          runCards.push(regular[i]);
          expectedRank = regular[i].rank + 1;
        } else {
          // Can't continue this run
          break;
        }
      }

      // Try to extend at the END with remaining wilds
      while (usedWilds.length < wilds.length && expectedRank <= Card.RANKS.KING) {
        runCards.push(wilds[usedWilds.length]);
        usedWilds.push(wilds[usedWilds.length]);
        expectedRank++;
      }

      // Try to extend at the BEGINNING with remaining wilds
      let startRank = regular[start].rank - 1;
      while (usedWilds.length < wilds.length && startRank >= Card.RANKS.ACE) {
        runCards.unshift(wilds[usedWilds.length]);
        usedWilds.push(wilds[usedWilds.length]);
        startRank--;
      }

      if (runCards.length > longestRun.length) {
        longestRun = runCards;
      }
    }

    return longestRun;
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
