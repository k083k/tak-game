import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { KNOCK_WINDOW } from '../constants';

/**
 * Hook for managing player turns and actions
 * Handles draw, discard, knock, and hand reordering
 */
export const useTurnManagement = (difficulty) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [knockCountdown, setKnockCountdown] = useState(null);

  /**
   * Player draws a card from deck or discard pile
   */
  const drawCard = useCallback((engine, fromDiscard, onRoundEnd, onRefresh) => {
    if (!engine || hasDrawn || engine.isRoundOver()) return null;

    const currentPlayer = engine.getCurrentPlayer();
    const card = engine.drawCard(fromDiscard);

    if (card) {
      // Add card instantly to hand
      currentPlayer.addCard(card);
      setHasDrawn(true);
      onRefresh();
      return card;
    } else {
      // No card available - deck is empty and can't draw
      // End the round immediately
      const result = engine.endRound();
      onRoundEnd(result);
      return null;
    }
  }, [hasDrawn]);

  /**
   * Player discards a card
   */
  const discardCard = useCallback((
    engine,
    cardIndex,
    onTurnComplete,
    onRoundEnd,
    onRefresh
  ) => {
    if (!engine || !hasDrawn) return;

    const currentPlayer = engine.getCurrentPlayer();
    const card = currentPlayer.removeCard(cardIndex);

    // Add to discard pile instantly
    engine.discardCard(card);
    setSelectedCardIndex(null);
    setHasDrawn(false);
    onRefresh();

    // Start countdown for knock window
    const knockWindowDuration = difficulty === 'hard' ? KNOCK_WINDOW.HARD : KNOCK_WINDOW.EASY;
    setKnockCountdown(knockWindowDuration);

    const countdownInterval = setInterval(() => {
      setKnockCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    // After countdown duration, automatically switch to next player
    setTimeout(() => {
      // Clear countdown first
      setKnockCountdown(null);

      // Player didn't knock, switch to next player
      engine.switchPlayer();

      // Check if round is over AFTER switching
      if (engine.isRoundOver()) {
        const result = engine.endRound();
        onRoundEnd(result);
        return;
      }

      onTurnComplete();
    }, knockWindowDuration * 1000);
  }, [hasDrawn, difficulty]);

  /**
   * Player knocks
   */
  const knock = useCallback((engine, onKnockComplete) => {
    if (!engine || engine.knockedPlayerIndex !== null) return;

    // Clear the countdown timer
    setKnockCountdown(null);

    // No validation - player can knock anytime (even with score > 0)
    // This allows for strategic mistakes and requires player attention
    engine.knock(engine.currentPlayerIndex);

    toast.success('You knocked! Opponent gets one final turn.', {
      icon: '👊',
      duration: 2500,
    });

    engine.switchPlayer();
    onKnockComplete();
  }, []);

  /**
   * Reorder cards in player's hand
   */
  const reorderHand = useCallback((engine, fromIndex, toIndex, onRefresh) => {
    if (!engine) return;

    const currentPlayer = engine.getCurrentPlayer();
    const hand = currentPlayer.getHand();

    // Create new array with reordered cards
    const newHand = [...hand];
    const [movedCard] = newHand.splice(fromIndex, 1);
    newHand.splice(toIndex, 0, movedCard);

    // Update player's hand
    currentPlayer.setHand(newHand);

    // Update selected index if needed
    if (selectedCardIndex === fromIndex) {
      setSelectedCardIndex(toIndex);
    } else if (fromIndex < selectedCardIndex && toIndex >= selectedCardIndex) {
      setSelectedCardIndex(selectedCardIndex - 1);
    } else if (fromIndex > selectedCardIndex && toIndex <= selectedCardIndex) {
      setSelectedCardIndex(selectedCardIndex + 1);
    }

    onRefresh();
  }, [selectedCardIndex]);

  /**
   * Reset turn state for new round
   */
  const resetTurnState = useCallback(() => {
    setSelectedCardIndex(null);
    setHasDrawn(false);
    setKnockCountdown(null);
  }, []);

  return {
    // State
    selectedCardIndex,
    hasDrawn,
    knockCountdown,

    // Setters
    setSelectedCardIndex,
    setKnockCountdown,

    // Actions
    drawCard,
    discardCard,
    knock,
    reorderHand,
    resetTurnState,
  };
};
