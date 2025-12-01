import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Player } from '../models/Player';
import { GameEngine } from '../services/GameEngine';
import { AIFactory } from '../ai/AIFactory';
import { ScoreCalculator } from '../services/ScoreCalculator';
import { SaveGameManager } from '../services/SaveGameManager';
import { Card } from '../models/Card';

/**
 * Custom hook for managing game state
 */
export const useGameState = () => {
  const [gameMode, setGameMode] = useState('pvc'); // 'pvc' or 'pvp'
  const [difficulty, setDifficulty] = useState('easy'); // 'easy' or 'hard'
  const [playerName, setPlayerName] = useState('');
  const [playerAvatar, setPlayerAvatar] = useState('👤');
  const [gameEngine, setGameEngine] = useState(null);
  const [ai, setAI] = useState(null);
  const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'round-end', 'game-over'
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [knockCountdown, setKnockCountdown] = useState(null);
  const [transitCard, setTransitCard] = useState(null); // { card, from, to, isHidden }
  const [, forceUpdate] = useState(0);

  /**
   * Force a re-render
   */
  const refresh = useCallback(() => {
    forceUpdate(prev => prev + 1);
  }, []);

  /**
   * Auto-save game state whenever it changes
   */
  useEffect(() => {
    // Only save if we're in an active game (not setup or transitioning)
    if (gameState === 'playing' || gameState === 'round-end') {
      SaveGameManager.saveGame({
        gameMode,
        difficulty,
        playerName,
        playerAvatar,
        gameEngine,
        gameState,
        selectedCardIndex,
        hasDrawn,
        roundResult
      });
    }
  }, [gameState, gameEngine, selectedCardIndex, hasDrawn, roundResult, gameMode, difficulty, playerName, playerAvatar]);

  /**
   * Load a saved game
   */
  const loadSavedGame = useCallback(() => {
    const savedData = SaveGameManager.loadGame();
    if (!savedData) return false;

    try {
      // Restore settings
      setGameMode(savedData.gameMode);
      setDifficulty(savedData.difficulty);
      setPlayerName(savedData.playerName);
      setPlayerAvatar(savedData.playerAvatar);

      // Reconstruct game engine
      const engineData = savedData.gameEngine;

      // Recreate players
      const player1 = new Player(engineData.player1.name, engineData.player1.isHuman);
      player1.avatar = engineData.player1.avatar;
      player1.roundScores = engineData.player1.roundScores;
      player1.setHand(engineData.player1.hand.map(c => new Card(c.suit, c.rank)));

      const player2 = new Player(engineData.player2.name, engineData.player2.isHuman);
      player2.avatar = engineData.player2.avatar;
      player2.roundScores = engineData.player2.roundScores;
      player2.setHand(engineData.player2.hand.map(c => new Card(c.suit, c.rank)));

      // Recreate game engine
      const engine = new GameEngine(player1, player2);
      engine.currentRound = engineData.currentRound;
      engine.currentPlayerIndex = engineData.currentPlayerIndex;
      engine.knockedPlayerIndex = engineData.knockedPlayerIndex;
      engine.wildRank = engineData.wildRank;

      // Restore deck
      engine.deck.cards = engineData.deck.map(c => new Card(c.suit, c.rank));

      // Restore discard pile
      engine.discardPile = engineData.discardPile.map(c => new Card(c.suit, c.rank));

      setGameEngine(engine);

      // Recreate AI if needed
      if (savedData.gameMode === 'pvc') {
        setAI(AIFactory.createAI());
      }

      // Restore game state
      setGameState(savedData.gamePhase);
      setSelectedCardIndex(savedData.selectedCardIndex);
      setHasDrawn(savedData.hasDrawn);

      // Reconstruct roundResult if it exists
      if (savedData.roundResult) {
        const reconstructRoundResult = (playerResult) => {
          return {
            ...playerResult,
            combinations: playerResult.combinations.map(combo => ({
              ...combo,
              cards: combo.cards.map(c => new Card(c.suit, c.rank))
            })),
            remaining: playerResult.remaining.map(c => new Card(c.suit, c.rank))
          };
        };

        setRoundResult({
          ...savedData.roundResult,
          player1: reconstructRoundResult(savedData.roundResult.player1),
          player2: reconstructRoundResult(savedData.roundResult.player2)
        });
      } else {
        setRoundResult(null);
      }

      return true;
    } catch (error) {
      console.error('Failed to load saved game:', error);
      SaveGameManager.clearSave();
      return false;
    }
  }, []);

  /**
   * Check if saved game exists
   */
  const hasSavedGame = useCallback(() => {
    return SaveGameManager.hasSavedGame();
  }, []);

  /**
   * AI plays its turn (helper that can use passed or state values)
   */
  const playAITurnImpl = useCallback((engine, aiPlayer) => {
    if (!engine || !aiPlayer || engine.isRoundOver()) return;

    const aiPlayerObj = engine.player2;
    const move = aiPlayer.makeMove(engine, aiPlayerObj.getHand());

    // Draw card
    const drawnCard = engine.drawCard(move.drawFrom === 'discard');
    if (!drawnCard) {
      // No card available - deck is empty, end round immediately
      const result = engine.endRound();
      setRoundResult(result);
      setGameState('round-end');
      refresh();
      return;
    }

    // Show card in transit to AI hand
    setTransitCard({
      card: drawnCard,
      from: move.drawFrom === 'discard' ? 'discard' : 'deck',
      to: 'opponentHand',
      isHidden: true // Hidden during transit
    });

    // After draw animation completes, add to AI hand
    setTimeout(() => {
      aiPlayerObj.addCard(drawnCard);
      setTransitCard(null);
      refresh();

      // Brief delay to simulate AI thinking, then discard
      setTimeout(() => {
        // Discard card
        const discardedCard = aiPlayerObj.removeCard(move.discardIndex);

        // Show card in transit to discard pile
        setTransitCard({
          card: discardedCard,
          from: 'opponentHand',
          to: 'discard',
          isHidden: false // Show face when discarding
        });

        // After discard animation completes
        setTimeout(() => {
          engine.discardCard(discardedCard);
          setTransitCard(null);
          refresh();

          // Check if AI should knock AFTER drawing and discarding
          const finalScore = ScoreCalculator.calculateScore(aiPlayerObj.getHand(), engine.getWildRank()).score;
          const shouldKnock = finalScore === 0;

          if (shouldKnock && engine.knockedPlayerIndex === null) {
            engine.knock(1);
            toast.success('Computer has knocked! This is your final turn.', {
              icon: '🔔',
              duration: 3500,
            });

            // AI knocked, switch back to player immediately for final turn
            engine.switchPlayer();
            refresh();
            return;
          }

          // AI didn't knock - start 3-second countdown (same as player)
          setKnockCountdown(3);

          const countdownInterval = setInterval(() => {
            setKnockCountdown(prev => {
              if (prev === null || prev <= 1) {
                clearInterval(countdownInterval);
                return null;
              }
              return prev - 1;
            });
          }, 1000);

          // After 3 seconds, switch back to player
          setTimeout(() => {
            setKnockCountdown(null);
            engine.switchPlayer();

            // Check if round is over AFTER switching
            if (engine.isRoundOver()) {
              const result = engine.endRound();
              setRoundResult(result);
              setGameState('round-end');
              refresh();
              return;
            }

            refresh();
          }, 3000);
        }, 600); // After discard animation
      }, 300); // AI thinking delay
    }, 600); // After draw animation
  }, [refresh]);

  /**
   * Start a new game
   */
  const startNewGame = useCallback(() => {
    const finalPlayerName = playerName.trim() || 'Player 1';
    const player1 = new Player(finalPlayerName, true);
    player1.avatar = playerAvatar;

    const player2 = new Player(
      gameMode === 'pvc' ? 'Computer' : 'Player 2',
      gameMode === 'pvp'
    );
    player2.avatar = gameMode === 'pvc' ? '🤖' : '👥';

    const engine = new GameEngine(player1, player2);
    const aiInstance = gameMode === 'pvc' ? AIFactory.createAI() : null;

    setGameEngine(engine);
    setAI(aiInstance);
    setGameState('playing');
    setSelectedCardIndex(null);
    setHasDrawn(false);

    engine.startRound();
    refresh();

    // If computer starts first, let it play
    if (gameMode === 'pvc' && engine.currentPlayerIndex === 1 && aiInstance) {
      setTimeout(() => {
        playAITurnImpl(engine, aiInstance);
      }, 1000);
    }
  }, [gameMode, playerName, playerAvatar, playAITurnImpl, refresh]);

  /**
   * AI plays its turn (using state values)
   */
  const playAITurn = useCallback(() => {
    if (!gameEngine || !ai) return;
    playAITurnImpl(gameEngine, ai);
  }, [gameEngine, ai, playAITurnImpl]);

  /**
   * Start next round
   */
  const startNextRound = useCallback(() => {
    if (!gameEngine) return;

    if (gameEngine.isGameOver()) {
      // Clear saved game when game ends
      SaveGameManager.clearSave();
      setGameState('game-over');
      return;
    }

    gameEngine.startRound();
    setGameState('playing');
    setSelectedCardIndex(null);
    setHasDrawn(false);
    setKnockCountdown(null);
    refresh();

    // If computer starts this round, let it play
    if (gameMode === 'pvc' && gameEngine.currentPlayerIndex === 1) {
      setTimeout(() => {
        playAITurn();
      }, 1000);
    }
  }, [gameEngine, gameMode, playAITurn, refresh]);

  /**
   * Player draws a card
   */
  const drawCard = useCallback((fromDiscard) => {
    if (!gameEngine || hasDrawn || gameEngine.isRoundOver()) return;

    const currentPlayer = gameEngine.getCurrentPlayer();
    const card = gameEngine.drawCard(fromDiscard);

    if (card) {
      // Show card in transit animation
      setTransitCard({
        card,
        from: fromDiscard ? 'discard' : 'deck',
        to: 'playerHand',
        isHidden: false
      });

      // After animation completes, add to hand
      setTimeout(() => {
        currentPlayer.addCard(card);
        setHasDrawn(true);
        setTransitCard(null);
        refresh();
      }, 600); // Match animation duration
    } else {
      // No card available - deck is empty and can't draw
      // End the round immediately
      const result = gameEngine.endRound();
      setRoundResult(result);
      setGameState('round-end');
      refresh();
    }
  }, [gameEngine, hasDrawn, refresh]);

  /**
   * Player discards a card
   */
  const discardCard = useCallback((cardIndex) => {
    if (!gameEngine || !hasDrawn) return;

    const currentPlayer = gameEngine.getCurrentPlayer();
    const card = currentPlayer.removeCard(cardIndex);

    // Show card in transit animation
    setTransitCard({
      card,
      from: 'playerHand',
      to: 'discard',
      isHidden: false
    });

    // After animation, add to discard pile
    setTimeout(() => {
      gameEngine.discardCard(card);
      setTransitCard(null);
      setSelectedCardIndex(null);
      setHasDrawn(false);
      refresh();

      // Start 3-second countdown for knock window
      setKnockCountdown(3);

      const countdownInterval = setInterval(() => {
        setKnockCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      // After 3 seconds, automatically switch to next player
      setTimeout(() => {
        // Clear countdown first
        setKnockCountdown(null);

        // Player didn't knock, switch to next player
        gameEngine.switchPlayer();

        // Check if round is over AFTER switching
        if (gameEngine.isRoundOver()) {
          const result = gameEngine.endRound();
          setRoundResult(result);
          setGameState('round-end');
          refresh();
          return;
        }

        // If AI's turn, let it play
        if (gameMode === 'pvc' && gameEngine.currentPlayerIndex === 1) {
          setTimeout(() => {
            playAITurn();
          }, 300);
        } else {
          // PvP mode - refresh now since no AI turn
          refresh();
        }
      }, 3000);
    }, 600); // Match animation duration
  }, [gameEngine, hasDrawn, gameMode, playAITurn, refresh]);

  /**
   * Player knocks
   */
  const knock = useCallback(() => {
    if (!gameEngine || gameEngine.knockedPlayerIndex !== null) return;

    // Clear the countdown timer
    setKnockCountdown(null);

    // No validation - player can knock anytime (even with score > 0)
    // This allows for strategic mistakes and requires player attention
    gameEngine.knock(gameEngine.currentPlayerIndex);

    toast.success('You knocked! Opponent gets one final turn.', {
      icon: '👊',
      duration: 2500,
    });

    refresh();

    // If playing against AI, let it take final turn
    if (gameMode === 'pvc' && gameEngine.currentPlayerIndex === 0) {
      gameEngine.switchPlayer();
      setTimeout(() => {
        playAITurn();
      }, 1000);
    } else {
      gameEngine.switchPlayer();
      refresh();
    }
  }, [gameEngine, gameMode, playAITurn, refresh]);

  /**
   * Return to setup screen
   */
  const returnToSetup = useCallback(() => {
    // Clear saved game when returning to setup
    SaveGameManager.clearSave();
    setGameState('setup');
    setGameEngine(null);
    setAI(null);
    setRoundResult(null);
    setSelectedCardIndex(null);
    setHasDrawn(false);
  }, []);

  /**
   * Reorder cards in player's hand
   */
  const reorderHand = useCallback((fromIndex, toIndex) => {
    if (!gameEngine) return;

    const currentPlayer = gameEngine.getCurrentPlayer();
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

    refresh();
  }, [gameEngine, selectedCardIndex, refresh]);

  return {
    gameMode,
    setGameMode,
    difficulty,
    setDifficulty,
    playerName,
    setPlayerName,
    playerAvatar,
    setPlayerAvatar,
    gameEngine,
    gameState,
    selectedCardIndex,
    setSelectedCardIndex,
    hasDrawn,
    roundResult,
    knockCountdown,
    transitCard,
    startNewGame,
    startNextRound,
    drawCard,
    discardCard,
    knock,
    returnToSetup,
    reorderHand,
    refresh,
    loadSavedGame,
    hasSavedGame
  };
};
