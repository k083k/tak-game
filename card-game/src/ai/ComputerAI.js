import { AIStrategy } from './AIStrategy';
import { ScoreCalculator } from '../services/ScoreCalculator';

/**
 * Computer AI - Makes strategic decisions for the computer opponent
 */
export class ComputerAI extends AIStrategy {
  makeMove(gameEngine, hand) {
    const topDiscard = gameEngine.peekDiscard();
    const wildRank = gameEngine.getWildRank();

    // Evaluate if discard card is useful
    let drawFrom = 'deck';
    if (topDiscard) {
      const usefulness = this.evaluateCardUsefulness(topDiscard, hand, wildRank);
      if (usefulness > 3) {
        drawFrom = 'discard';
      }
    }

    // Simulate drawing the card and find best discard
    const simulatedHand = [...hand];
    if (drawFrom === 'discard' && topDiscard) {
      simulatedHand.push(topDiscard);
    }

    // Find least useful card to discard
    let worstCardIndex = 0;
    let worstValue = Infinity;

    for (let i = 0; i < simulatedHand.length; i++) {
      const tempHand = [...simulatedHand];
      tempHand.splice(i, 1);
      const usefulness = this.evaluateCardUsefulness(
        simulatedHand[i],
        tempHand,
        wildRank
      );

      if (usefulness < worstValue) {
        worstValue = usefulness;
        worstCardIndex = i;
      }
    }

    // Only knock if score is zero (perfect hand)
    const currentResult = ScoreCalculator.calculateScore(hand, wildRank);
    const shouldKnock = currentResult.score === 0;

    return {
      drawFrom,
      discardIndex: worstCardIndex,
      shouldKnock
    };
  }
}
