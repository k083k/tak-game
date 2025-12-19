import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { ScoreCalculator } from '../services/ScoreCalculator';
import { ANIMATION_DELAY, KNOCK_WINDOW } from '../constants';

/**
 * Hook for managing AI player turns
 * Handles AI decision-making and turn execution
 */
export const useAIPlayer = (difficulty) => {
  /**
   * Execute AI turn with proper timing and animations
   *
   * @param {GameEngine} engine - The game engine instance
   * @param {AI} aiPlayer - The AI strategy instance
   * @param {Function} onDrawCard - Callback when AI draws a card
   * @param {Function} onDiscardCard - Callback when AI discards a card
   * @param {Function} onKnock - Callback when AI knocks
   * @param {Function} onTurnComplete - Callback when AI turn is complete
   * @param {Function} onRoundEnd - Callback when round ends after AI turn
   */
  const executeAITurn = useCallback((
    engine,
    aiPlayer,
    onDrawCard,
    onDiscardCard,
    onKnock,
    onTurnComplete,
    onRoundEnd
  ) => {
    if (!engine || !aiPlayer || engine.isRoundOver()) return;

    const aiPlayerObj = engine.player2;
    const move = aiPlayer.makeMove(engine, aiPlayerObj.getHand());

    // Draw card
    const drawnCard = engine.drawCard(move.drawFrom === 'discard');
    if (!drawnCard) {
      // No card available - deck is empty, end round immediately
      const result = engine.endRound();
      onRoundEnd(result);
      return;
    }

    // Add card instantly to AI hand
    aiPlayerObj.addCard(drawnCard);
    onDrawCard();

    // Brief delay to simulate AI thinking, then discard
    setTimeout(() => {
      // Discard card
      const discardedCard = aiPlayerObj.removeCard(move.discardIndex);
      engine.discardCard(discardedCard);
      onDiscardCard();

      // Check if AI should knock AFTER drawing and discarding
      const finalScore = ScoreCalculator.calculateScore(
        aiPlayerObj.getHand(),
        engine.getWildRank()
      ).score;
      const shouldKnock = finalScore === 0;

      if (shouldKnock && engine.knockedPlayerIndex === null) {
        engine.knock(1);
        toast.success('Computer has knocked! This is your final turn.', {
          icon: '🔔',
          duration: 3500,
        });

        // AI knocked, switch back to player immediately for final turn
        engine.switchPlayer();
        onKnock();
        return;
      }

      // AI didn't knock - start countdown and switch after delay
      const knockWindowDuration = difficulty === 'hard' ? KNOCK_WINDOW.HARD : KNOCK_WINDOW.EASY;

      // After countdown duration, switch back to player
      setTimeout(() => {
        engine.switchPlayer();

        // Check if round is over AFTER switching
        if (engine.isRoundOver()) {
          const result = engine.endRound();
          onRoundEnd(result);
          return;
        }

        onTurnComplete(knockWindowDuration);
      }, knockWindowDuration * 1000);
    }, ANIMATION_DELAY.AI_THINKING);
  }, [difficulty]);

  return {
    executeAITurn,
  };
};
