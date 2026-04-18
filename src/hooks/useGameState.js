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
  const [player2Name, setPlayer2Name] = useState('');
  const [player2Avatar, setPlayer2Avatar] = useState('👥');
  const [gameEngine, setGameEngine] = useState(null);
  const [ai, setAI] = useState(null);
  const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'round-end', 'game-over'
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [knockCountdown, setKnockCountdown] = useState(null);
  const [canKnockAfterDiscard, setCanKnockAfterDiscard] = useState(false);
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
      const player1 = new Player(engineData.player1.name, engineData.player1.isHuman, engineData.player1.avatar);
      player1.roundScores = engineData.player1.roundScores;
      player1.totalScore = engineData.player1.totalScore;
      player1.setHand(engineData.player1.hand.map(c => new Card(c.suit, c.rank)));

      const player2 = new Player(engineData.player2.name, engineData.player2.isHuman, engineData.player2.avatar);
      player2.roundScores = engineData.player2.roundScores;
      player2.totalScore = engineData.player2.totalScore;
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

    // Add card instantly to AI hand
    aiPlayerObj.addCard(drawnCard);
    refresh();

    // Brief delay to simulate AI thinking, then discard
    setTimeout(() => {
      // Discard card
      const discardedCard = aiPlayerObj.removeCard(move.discardIndex);
      engine.discardCard(discardedCard);
      refresh();

      // Check if AI should knock AFTER drawing and discarding
      const finalScore = ScoreCalculator.calculateScore(aiPlayerObj.getHand(), engine.getWildRank()).score;
      const shouldKnock = finalScore === 0;

      if (shouldKnock && engine.knockedPlayerIndex === null) {
        engine.knock(1);
      }

      engine.switchPlayer();

      if (engine.isRoundOver()) {
        const result = engine.endRound();
        setRoundResult(result);
        setGameState('round-end');
        refresh();
        return;
      }

      refresh();
    }, 500);
  }, [refresh, difficulty]);

  /**
   * Start a new game
   */
  const startNewGame = useCallback(() => {
    const finalPlayerName = playerName.trim() || 'Player 1';
    const player1 = new Player(finalPlayerName, true, playerAvatar);
    const finalPlayer2Name = gameMode === 'pvp' ? (player2Name.trim() || 'Player 2') : 'Computer';
    const finalPlayer2Avatar = gameMode === 'pvp' ? player2Avatar : '🤖';
    const player2 = new Player(finalPlayer2Name, gameMode === 'pvp', finalPlayer2Avatar);

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
  }, [gameMode, playerName, playerAvatar, player2Name, player2Avatar, playAITurnImpl, refresh]);

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

    // eslint-disable-next-line react-hooks/immutability
    gameEngine.currentRound++;
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
      // Add card instantly to hand
      currentPlayer.addCard(card);
      setHasDrawn(true);
      refresh();
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

    gameEngine.discardCard(card);
    setSelectedCardIndex(null);
    setHasDrawn(false);
    refresh();

    // Check score after discard — if 0 and nobody has knocked, hold the turn for knock decision
    const score = ScoreCalculator.calculateScore(currentPlayer.getHand(), gameEngine.getWildRank()).score;
    if (score === 0 && gameEngine.knockedPlayerIndex === null) {
      setCanKnockAfterDiscard(true);
      return;
    }

    // Score > 0: switch immediately
    _switchAfterDiscard();
  }, [gameEngine, hasDrawn, gameMode, playAITurn, refresh]);

  const _switchAfterDiscard = useCallback(() => {
    setCanKnockAfterDiscard(false);
    gameEngine.switchPlayer();

    if (gameEngine.isRoundOver()) {
      const result = gameEngine.endRound();
      setRoundResult(result);
      setGameState('round-end');
      refresh();
      return;
    }

    if (gameMode === 'pvc' && gameEngine.currentPlayerIndex === 1) {
      refresh();
      setTimeout(() => playAITurn(), 400);
    } else {
      refresh();
    }
  }, [gameEngine, gameMode, playAITurn, refresh]);

  /**
   * Player knocks
   */
  // Called after discard when score = 0 — player chose to knock
  const knock = useCallback(() => {
    if (!gameEngine || !canKnockAfterDiscard || gameEngine.knockedPlayerIndex !== null) return;

    setCanKnockAfterDiscard(false);
    gameEngine.knock(gameEngine.currentPlayerIndex);

    gameEngine.switchPlayer();

    if (gameEngine.isRoundOver()) {
      const result = gameEngine.endRound();
      setRoundResult(result);
      setGameState('round-end');
      refresh();
      return;
    }

    if (gameMode === 'pvc' && gameEngine.currentPlayerIndex === 1) {
      refresh();
      setTimeout(() => playAITurn(), 800);
    } else {
      refresh();
    }
  }, [gameEngine, canKnockAfterDiscard, gameMode, playAITurn, refresh]);

  // Called after discard when score = 0 — player chose to pass (not knock)
  const passKnock = useCallback(() => {
    if (!gameEngine || !canKnockAfterDiscard) return;
    _switchAfterDiscard();
  }, [gameEngine, canKnockAfterDiscard, _switchAfterDiscard]);

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
    player2Name,
    setPlayer2Name,
    player2Avatar,
    setPlayer2Avatar,
    gameEngine,
    gameState,
    selectedCardIndex,
    setSelectedCardIndex,
    hasDrawn,
    roundResult,
    knockCountdown,
    canKnockAfterDiscard,
    startNewGame,
    startNextRound,
    drawCard,
    discardCard,
    knock,
    passKnock,
    returnToSetup,
    reorderHand,
    refresh,
    loadSavedGame,
    hasSavedGame
  };
};
