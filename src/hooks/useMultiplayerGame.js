import { useState, useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Player } from '../models/Player';
import { GameEngine } from '../services/GameEngine';
import { Card } from '../models/Card';
import { MultiplayerService } from '../services/MultiplayerService';

// ─── Serialization ─────────────────────────────────────────────────────────

function serializeRoundResult(rr) {
  if (!rr) return null;
  const serializePlayerResult = (pr) => ({
    ...pr,
    combinations: pr.combinations.map(combo => ({
      ...combo,
      cards: combo.cards.map(c => ({ suit: c.suit, rank: c.rank }))
    })),
    remaining: pr.remaining.map(c => ({ suit: c.suit, rank: c.rank }))
  });
  return { ...rr, player1: serializePlayerResult(rr.player1), player2: serializePlayerResult(rr.player2) };
}

function deserializeRoundResult(rr) {
  if (!rr) return null;
  const deserializePlayerResult = (pr) => ({
    ...pr,
    combinations: pr.combinations.map(combo => ({
      ...combo,
      cards: combo.cards.map(c => new Card(c.suit, c.rank))
    })),
    remaining: pr.remaining.map(c => new Card(c.suit, c.rank))
  });
  return { ...rr, player1: deserializePlayerResult(rr.player1), player2: deserializePlayerResult(rr.player2) };
}

// Serialize from canonical form (seat0=player1, seat1=player2)
function serialize(engine, hasDrawn, gameState, roundResult, knockWindowEndsAt = null) {
  return {
    currentRound: engine.currentRound,
    currentPlayerIndex: engine.currentPlayerIndex,
    knockedPlayerIndex: engine.knockedPlayerIndex,
    gameOver: engine.gameOver,
    player1: {
      name: engine.player1.name,
      avatar: engine.player1.avatar,
      hand: engine.player1.getHand().map(c => ({ suit: c.suit, rank: c.rank })),
      roundScores: [...engine.player1.roundScores],
      totalScore: engine.player1.totalScore,
    },
    player2: {
      name: engine.player2.name,
      avatar: engine.player2.avatar,
      hand: engine.player2.getHand().map(c => ({ suit: c.suit, rank: c.rank })),
      roundScores: [...engine.player2.roundScores],
      totalScore: engine.player2.totalScore,
    },
    deck: engine.deck.cards.map(c => ({ suit: c.suit, rank: c.rank })),
    discardPile: engine.discardPile.map(c => ({ suit: c.suit, rank: c.rank })),
    hasDrawn,
    gameState,
    roundResult: serializeRoundResult(roundResult),
    knockWindowEndsAt,
  };
}

// Deserialize to canonical engine (seat0=player1, seat1=player2)
function deserialize(data) {
  const p1 = new Player(data.player1.name, true, data.player1.avatar);
  p1.roundScores = data.player1.roundScores;
  p1.totalScore = data.player1.totalScore;
  p1.setHand(data.player1.hand.map(c => new Card(c.suit, c.rank)));

  const p2 = new Player(data.player2.name, true, data.player2.avatar);
  p2.roundScores = data.player2.roundScores;
  p2.totalScore = data.player2.totalScore;
  p2.setHand(data.player2.hand.map(c => new Card(c.suit, c.rank)));

  const engine = new GameEngine(p1, p2);
  engine.currentRound = data.currentRound;
  engine.currentPlayerIndex = data.currentPlayerIndex;
  engine.knockedPlayerIndex = data.knockedPlayerIndex ?? null;
  engine.gameOver = data.gameOver ?? false;
  engine.deck.cards = data.deck.map(c => new Card(c.suit, c.rank));
  engine.discardPile = data.discardPile.map(c => new Card(c.suit, c.rank));

  return {
    engine,
    hasDrawn: data.hasDrawn ?? false,
    gameState: data.gameState ?? 'playing',
    roundResult: deserializeRoundResult(data.roundResult),
    knockWindowEndsAt: data.knockWindowEndsAt ?? null,
  };
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export const useMultiplayerGame = () => {
  const [onlinePhase, setOnlinePhase] = useState('idle'); // 'idle' | 'lobby' | 'playing'
  const [gameId, setGameId] = useState(null);
  const [gameCode, setGameCode] = useState(null);
  const [mySeat, setMySeat] = useState(null); // 0 or 1
  const [isHost, setIsHost] = useState(false);
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [playerId] = useState(() => MultiplayerService.getOrCreatePlayerId());

  // Game state (same shape as useGameState for GameBoard compatibility)
  const [gameEngine, setGameEngine] = useState(null);
  const [gameState, setGameState] = useState('playing');
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [knockCountdown, setKnockCountdown] = useState(null);
  const [, forceUpdate] = useState(0);

  const unsubPlayersRef = useRef(null);
  const unsubStateRef = useRef(null);
  const knockTimerRef = useRef(null);
  const knockIntervalRef = useRef(null);

  // Refs so callbacks always see latest values without stale closures
  const mySeatRef = useRef(null);
  const isHostRef = useRef(false);
  const gameIdRef = useRef(null);

  useEffect(() => { mySeatRef.current = mySeat; }, [mySeat]);
  useEffect(() => { isHostRef.current = isHost; }, [isHost]);
  useEffect(() => { gameIdRef.current = gameId; }, [gameId]);

  const refresh = useCallback(() => forceUpdate(p => p + 1), []);

  // Is it my turn? (uses canonical currentPlayerIndex compared to my seat)
  const isMyTurn = gameEngine != null && gameEngine.currentPlayerIndex === mySeat;

  // ── Push state to DB (always serialize in canonical form: seat0=player1) ──
  const pushState = useCallback(async (engine, hDrawn, gState, rResult, knockWindowEndsAt = null) => {
    const id = gameIdRef.current;
    if (!id) return;
    const seat = mySeatRef.current;
    let canonical = engine;
    let canonicalRoundResult = rResult;

    // Seat1 player has player1=them in local engine — swap back to canonical before pushing
    if (seat === 1) {
      const temp = engine.player1;
      engine.player1 = engine.player2;
      engine.player2 = temp;
      const ci = engine.currentPlayerIndex;
      engine.currentPlayerIndex = ci === 0 ? 1 : 0;
      if (engine.knockedPlayerIndex !== null) {
        engine.knockedPlayerIndex = engine.knockedPlayerIndex === 0 ? 1 : 0;
      }
      // Swap roundResult player1/player2
      if (rResult) {
        canonicalRoundResult = { ...rResult, player1: rResult.player2, player2: rResult.player1 };
      }
      canonical = engine;
    }

    await MultiplayerService.pushGameState(id, serialize(canonical, hDrawn, gState, canonicalRoundResult, knockWindowEndsAt));

    // Swap local engine back to my perspective after pushing
    if (seat === 1) {
      const temp = engine.player1;
      engine.player1 = engine.player2;
      engine.player2 = temp;
      const ci = engine.currentPlayerIndex;
      engine.currentPlayerIndex = ci === 0 ? 1 : 0;
      if (engine.knockedPlayerIndex !== null) {
        engine.knockedPlayerIndex = engine.knockedPlayerIndex === 0 ? 1 : 0;
      }
    }
  }, []);

  // ── Handle incoming state from Supabase ──
  const handleRemoteState = useCallback((data) => {
    if (!data) return;

    // Clear any local knock timers
    if (knockTimerRef.current) clearTimeout(knockTimerRef.current);
    if (knockIntervalRef.current) clearInterval(knockIntervalRef.current);

    const { engine, hasDrawn: hDrawn, gameState: gState, roundResult: rResult, knockWindowEndsAt } = deserialize(data);

    const seat = mySeatRef.current;

    // Orient engine from my perspective: player1 = me, player2 = opponent
    if (seat === 1) {
      const temp = engine.player1;
      engine.player1 = engine.player2;
      engine.player2 = temp;
      const ci = engine.currentPlayerIndex;
      engine.currentPlayerIndex = ci === 0 ? 1 : 0;
      if (engine.knockedPlayerIndex !== null) {
        engine.knockedPlayerIndex = engine.knockedPlayerIndex === 0 ? 1 : 0;
      }
    }

    // Orient roundResult from my perspective
    let orientedRoundResult = rResult;
    if (seat === 1 && rResult) {
      orientedRoundResult = { ...rResult, player1: rResult.player2, player2: rResult.player1 };
    }

    setGameEngine(engine);
    setHasDrawn(hDrawn);
    setGameState(gState);
    setRoundResult(orientedRoundResult);
    setSelectedCardIndex(null);
    setOnlinePhase('playing');

    // Show knock countdown for the opponent's discard window
    if (knockWindowEndsAt && Date.now() < knockWindowEndsAt) {
      const remaining = Math.ceil((knockWindowEndsAt - Date.now()) / 1000);
      setKnockCountdown(remaining);
      knockIntervalRef.current = setInterval(() => {
        setKnockCountdown(prev => {
          if (prev == null || prev <= 1) { clearInterval(knockIntervalRef.current); return null; }
          return prev - 1;
        });
      }, 1000);
    } else {
      setKnockCountdown(null);
    }

    refresh();
  }, [refresh]);

  // ── Create Game ──
  const createGame = useCallback(async (playerName, avatar) => {
    try {
      const result = await MultiplayerService.createGame(playerName, avatar);
      setGameId(result.gameId);
      setGameCode(result.code);
      setMySeat(result.seat);
      setIsHost(true);
      gameIdRef.current = result.gameId;
      mySeatRef.current = result.seat;
      isHostRef.current = true;

      const players = await MultiplayerService.getPlayers(result.gameId);
      setLobbyPlayers(players);
      setOnlinePhase('lobby');

      unsubPlayersRef.current = MultiplayerService.subscribeToPlayers(result.gameId, async () => {
        const updated = await MultiplayerService.getPlayers(result.gameId);
        setLobbyPlayers(updated);
      });

      unsubStateRef.current = MultiplayerService.subscribeToGameState(result.gameId, handleRemoteState);
    } catch (err) {
      toast.error(err.message ?? 'Failed to create game');
    }
  }, [handleRemoteState]);

  // ── Join Game ──
  const joinGame = useCallback(async (code, playerName, avatar) => {
    try {
      const result = await MultiplayerService.joinGame(code, playerName, avatar);
      setGameId(result.gameId);
      setGameCode(result.code);
      setMySeat(result.seat);
      setIsHost(false);
      gameIdRef.current = result.gameId;
      mySeatRef.current = result.seat;
      isHostRef.current = false;

      const players = await MultiplayerService.getPlayers(result.gameId);
      setLobbyPlayers(players);
      setOnlinePhase('lobby');

      unsubPlayersRef.current = MultiplayerService.subscribeToPlayers(result.gameId, async () => {
        const updated = await MultiplayerService.getPlayers(result.gameId);
        setLobbyPlayers(updated);
      });

      unsubStateRef.current = MultiplayerService.subscribeToGameState(result.gameId, handleRemoteState);
    } catch (err) {
      toast.error(err.message ?? 'Failed to join game');
    }
  }, [handleRemoteState]);

  // ── Start Game (host only) ──
  const startGame = useCallback(async () => {
    if (!isHost || !gameId || lobbyPlayers.length < 2) return;
    try {
      await MultiplayerService.startGame(gameId);

      const p0 = lobbyPlayers.find(p => p.seat === 0);
      const p1 = lobbyPlayers.find(p => p.seat === 1);

      const player1 = new Player(p0.player_name, true, p0.avatar);
      const player2 = new Player(p1.player_name, true, p1.avatar);
      const engine = new GameEngine(player1, player2);
      engine.startRound();

      // Host is seat0 → player1 is already "me", no perspective swap needed
      setGameEngine(engine);
      setHasDrawn(false);
      setGameState('playing');
      setSelectedCardIndex(null);
      setOnlinePhase('playing');

      await pushState(engine, false, 'playing', null);
    } catch (err) {
      toast.error(err.message ?? 'Failed to start game');
    }
  }, [isHost, gameId, lobbyPlayers, pushState]);

  // ── Draw Card ──
  const drawCard = useCallback((fromDiscard) => {
    if (!gameEngine || !isMyTurn || hasDrawn || gameEngine.isRoundOver()) return;

    const currentPlayer = gameEngine.getCurrentPlayer();
    const card = gameEngine.drawCard(fromDiscard);

    if (card) {
      currentPlayer.addCard(card);
      setHasDrawn(true);
      refresh();
      pushState(gameEngine, true, gameState, roundResult);
    } else {
      const result = gameEngine.endRound();
      const oriented = result;
      setRoundResult(oriented);
      setGameState('round-end');
      refresh();
      pushState(gameEngine, false, 'round-end', oriented);
    }
  }, [gameEngine, isMyTurn, hasDrawn, gameState, roundResult, refresh, pushState]);

  // ── Discard Card ──
  const discardCard = useCallback((cardIndex) => {
    if (!gameEngine || !isMyTurn || !hasDrawn) return;

    const currentPlayer = gameEngine.getCurrentPlayer();
    const card = currentPlayer.removeCard(cardIndex);
    gameEngine.discardCard(card);
    setSelectedCardIndex(null);
    setHasDrawn(false);
    refresh();

    const KNOCK_WINDOW = 3;
    const knockWindowEndsAt = Date.now() + KNOCK_WINDOW * 1000;
    setKnockCountdown(KNOCK_WINDOW);

    // Push immediately so opponent sees the discard + knows knock window is active
    pushState(gameEngine, false, gameState, roundResult, knockWindowEndsAt);

    knockIntervalRef.current = setInterval(() => {
      setKnockCountdown(prev => {
        if (prev == null || prev <= 1) { clearInterval(knockIntervalRef.current); return null; }
        return prev - 1;
      });
    }, 1000);

    knockTimerRef.current = setTimeout(() => {
      setKnockCountdown(null);
      gameEngine.switchPlayer();

      if (gameEngine.isRoundOver()) {
        const result = gameEngine.endRound();
        setRoundResult(result);
        setGameState('round-end');
        refresh();
        pushState(gameEngine, false, 'round-end', result);
        return;
      }

      refresh();
      pushState(gameEngine, false, gameState, roundResult);
    }, KNOCK_WINDOW * 1000);
  }, [gameEngine, isMyTurn, hasDrawn, gameState, roundResult, refresh, pushState]);

  // ── Knock ──
  const knock = useCallback(() => {
    if (!gameEngine || !isMyTurn || gameEngine.knockedPlayerIndex !== null) return;

    if (knockTimerRef.current) clearTimeout(knockTimerRef.current);
    if (knockIntervalRef.current) clearInterval(knockIntervalRef.current);
    setKnockCountdown(null);

    gameEngine.knock(gameEngine.currentPlayerIndex);
    toast.success('You knocked! Opponent gets one final turn.', { icon: '👊', duration: 2500 });
    gameEngine.switchPlayer();
    refresh();

    pushState(gameEngine, false, gameState, roundResult);
  }, [gameEngine, isMyTurn, gameState, roundResult, refresh, pushState]);

  // ── Start Next Round (host only advances — prevents desync from two random deals) ──
  const startNextRound = useCallback(() => {
    if (!gameEngine) return;

    if (!isHost) {
      toast('Waiting for opponent to start next round...', { icon: '⏳', duration: 2000 });
      return;
    }

    if (gameEngine.isGameOver()) {
      setGameState('game-over');
      pushState(gameEngine, false, 'game-over', null);
      return;
    }

    gameEngine.currentRound++;
    gameEngine.startRound();
    setGameState('playing');
    setSelectedCardIndex(null);
    setHasDrawn(false);
    setKnockCountdown(null);
    setRoundResult(null);
    refresh();

    pushState(gameEngine, false, 'playing', null);
  }, [gameEngine, isHost, refresh, pushState]);

  // ── Reorder Hand (local only — cosmetic) ──
  const reorderHand = useCallback((fromIndex, toIndex) => {
    if (!gameEngine) return;

    const myPlayer = gameEngine.player1;
    const hand = myPlayer.getHand();
    const newHand = [...hand];
    const [moved] = newHand.splice(fromIndex, 1);
    newHand.splice(toIndex, 0, moved);
    myPlayer.setHand(newHand);

    if (selectedCardIndex === fromIndex) setSelectedCardIndex(toIndex);
    else if (fromIndex < selectedCardIndex && toIndex >= selectedCardIndex) setSelectedCardIndex(selectedCardIndex - 1);
    else if (fromIndex > selectedCardIndex && toIndex <= selectedCardIndex) setSelectedCardIndex(selectedCardIndex + 1);

    refresh();
  }, [gameEngine, selectedCardIndex, refresh]);

  // ── Return to Setup ──
  const returnToSetup = useCallback(() => {
    if (unsubPlayersRef.current) unsubPlayersRef.current();
    if (unsubStateRef.current) unsubStateRef.current();
    if (knockTimerRef.current) clearTimeout(knockTimerRef.current);
    if (knockIntervalRef.current) clearInterval(knockIntervalRef.current);

    setOnlinePhase('idle');
    setGameId(null);
    setGameCode(null);
    setMySeat(null);
    setIsHost(false);
    setLobbyPlayers([]);
    setGameEngine(null);
    setGameState('playing');
    setHasDrawn(false);
    setRoundResult(null);
    setSelectedCardIndex(null);
    setKnockCountdown(null);

    gameIdRef.current = null;
    mySeatRef.current = null;
    isHostRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      if (unsubPlayersRef.current) unsubPlayersRef.current();
      if (unsubStateRef.current) unsubStateRef.current();
      if (knockTimerRef.current) clearTimeout(knockTimerRef.current);
      if (knockIntervalRef.current) clearInterval(knockIntervalRef.current);
    };
  }, []);

  return {
    // Online-specific
    onlinePhase,
    gameCode,
    mySeat,
    isHost,
    lobbyPlayers,
    playerId,
    isMyTurn,
    createGame,
    joinGame,
    startGame,

    // Game state (GameBoard-compatible)
    gameEngine,
    gameState,
    selectedCardIndex,
    setSelectedCardIndex,
    hasDrawn,
    roundResult,
    knockCountdown,
    drawCard,
    discardCard,
    knock,
    startNextRound,
    reorderHand,
    returnToSetup,
    refresh,
  };
};
