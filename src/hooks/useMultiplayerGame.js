import { useState, useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Player } from '../models/Player';
import { GameEngine } from '../services/GameEngine';
import { Card } from '../models/Card';
import { MultiplayerService } from '../services/MultiplayerService';
import { ScoreCalculator } from '../services/ScoreCalculator';

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

function serialize(engine, hasDrawn, gameState, roundResult, knockWindowEndsAt = null, paused = false, pausedBySeat = null) {
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
    paused,
    pausedBySeat,
  };
}

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
    paused: data.paused ?? false,
    pausedBySeat: data.pausedBySeat ?? null,
  };
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export const useMultiplayerGame = () => {
  const [onlinePhase, setOnlinePhase] = useState('idle');
  const [gameId, setGameId] = useState(null);
  const [gameCode, setGameCode] = useState(null);
  const [mySeat, setMySeat] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [playerId] = useState(() => MultiplayerService.getOrCreatePlayerId());

  const [gameEngine, setGameEngine] = useState(null);
  const [gameState, setGameState] = useState('playing');
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [knockCountdown, setKnockCountdown] = useState(null);
  const [canKnockAfterDiscard, setCanKnockAfterDiscard] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedBySeat, setPausedBySeat] = useState(null);
  const [, forceUpdate] = useState(0);

  const unsubPlayersRef = useRef(null);
  const unsubStateRef = useRef(null);
  const knockTimerRef = useRef(null);
  const knockIntervalRef = useRef(null);

  const mySeatRef = useRef(null);
  const isHostRef = useRef(false);
  const gameIdRef = useRef(null);
  const isPausedRef = useRef(false);
  const pausedBySeatRef = useRef(null);

  useEffect(() => { mySeatRef.current = mySeat; }, [mySeat]);
  useEffect(() => { isHostRef.current = isHost; }, [isHost]);
  useEffect(() => { gameIdRef.current = gameId; }, [gameId]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { pausedBySeatRef.current = pausedBySeat; }, [pausedBySeat]);

  const refresh = useCallback(() => forceUpdate(p => p + 1), []);

  const isMyTurn = gameEngine != null && gameEngine.currentPlayerIndex === 0;

  // ── Return to Setup (defined early so handleRemoteState can use it) ──
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
    setIsPaused(false);
    setPausedBySeat(null);

    gameIdRef.current = null;
    mySeatRef.current = null;
    isHostRef.current = false;
    isPausedRef.current = false;
    pausedBySeatRef.current = null;
  }, []);

  // ── Push state to DB ──
  const pushState = useCallback(async (engine, hDrawn, gState, rResult, knockWindowEndsAt = null, pauseOverride = null) => {
    const id = gameIdRef.current;
    if (!id) return;
    const seat = mySeatRef.current;

    const pausedVal = pauseOverride !== null ? pauseOverride.paused : isPausedRef.current;
    const pausedBySeatVal = pauseOverride !== null ? pauseOverride.pausedBySeat : pausedBySeatRef.current;

    let canonical = engine;
    let canonicalRoundResult = rResult;

    if (seat === 1) {
      const temp = engine.player1;
      engine.player1 = engine.player2;
      engine.player2 = temp;
      const ci = engine.currentPlayerIndex;
      engine.currentPlayerIndex = ci === 0 ? 1 : 0;
      if (engine.knockedPlayerIndex !== null) {
        engine.knockedPlayerIndex = engine.knockedPlayerIndex === 0 ? 1 : 0;
      }
      if (rResult) {
        canonicalRoundResult = { ...rResult, player1: rResult.player2, player2: rResult.player1 };
      }
      canonical = engine;
    }

    await MultiplayerService.pushGameState(id, serialize(canonical, hDrawn, gState, canonicalRoundResult, knockWindowEndsAt, pausedVal, pausedBySeatVal));

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

    // Opponent left the game
    if (data.abandoned) {
      toast('Opponent left the game.', { icon: '👋', duration: 4000 });
      returnToSetup();
      return;
    }

    const { engine, hasDrawn: hDrawn, gameState: gState, roundResult: rResult, knockWindowEndsAt, paused: incomingPaused, pausedBySeat: incomingPausedBySeat } = deserialize(data);
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

    // Sync pause state
    setIsPaused(incomingPaused);
    setPausedBySeat(incomingPausedBySeat);
    isPausedRef.current = incomingPaused;
    pausedBySeatRef.current = incomingPausedBySeat;

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

    setKnockCountdown(null);

    refresh();
  }, [refresh, returnToSetup]);

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
    if (!gameEngine || !isMyTurn || hasDrawn || gameEngine.isRoundOver() || isPausedRef.current) return;

    const currentPlayer = gameEngine.getCurrentPlayer();
    const card = gameEngine.drawCard(fromDiscard);

    if (card) {
      currentPlayer.addCard(card);
      setHasDrawn(true);
      refresh();
      pushState(gameEngine, true, gameState, roundResult);
    } else {
      const result = gameEngine.endRound();
      setRoundResult(result);
      setGameState('round-end');
      refresh();
      pushState(gameEngine, false, 'round-end', result);
    }
  }, [gameEngine, isMyTurn, hasDrawn, gameState, roundResult, refresh, pushState]);

  // ── Discard Card ──
  const discardCard = useCallback((cardIndex) => {
    if (!gameEngine || !isMyTurn || !hasDrawn || isPausedRef.current) return;

    const currentPlayer = gameEngine.getCurrentPlayer();
    const card = currentPlayer.removeCard(cardIndex);
    gameEngine.discardCard(card);
    setSelectedCardIndex(null);
    setHasDrawn(false);
    refresh();

    // Check score after discard — if 0 and nobody knocked, hold turn for knock decision
    const myPlayer = gameEngine.player1; // always "me" after perspective swap
    const score = ScoreCalculator.calculateScore(myPlayer.getHand(), gameEngine.getWildRank()).score;
    if (score === 0 && gameEngine.knockedPlayerIndex === null) {
      setCanKnockAfterDiscard(true);
      // Push state so opponent sees the discard, but it's still "my turn" pending knock decision
      pushState(gameEngine, false, gameState, roundResult);
      return;
    }

    _mpSwitchAfterDiscard();
  }, [gameEngine, isMyTurn, hasDrawn, gameState, roundResult, refresh, pushState]);

  const _mpSwitchAfterDiscard = useCallback(() => {
    setCanKnockAfterDiscard(false);
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
  }, [gameEngine, gameState, roundResult, refresh, pushState]);

  // ── Knock (after discard, when score = 0) ──
  const knock = useCallback(() => {
    if (!gameEngine || !isMyTurn || !canKnockAfterDiscard || gameEngine.knockedPlayerIndex !== null || isPausedRef.current) return;

    setCanKnockAfterDiscard(false);
    gameEngine.knock(gameEngine.currentPlayerIndex);
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
  }, [gameEngine, isMyTurn, canKnockAfterDiscard, gameState, roundResult, refresh, pushState]);

  // ── Pass Knock (after discard, score = 0, player chose not to knock) ──
  const passKnock = useCallback(() => {
    if (!gameEngine || !canKnockAfterDiscard) return;
    _mpSwitchAfterDiscard();
  }, [gameEngine, canKnockAfterDiscard, _mpSwitchAfterDiscard]);

  // ── Start Next Round (host only) ──
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

  // ── Reorder Hand (local only) ──
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

  // ── Pause Game ──
  const pauseGame = useCallback(async () => {
    if (!gameEngine) return;
    const seat = mySeatRef.current;
    setIsPaused(true);
    setPausedBySeat(seat);
    isPausedRef.current = true;
    pausedBySeatRef.current = seat;
    await pushState(gameEngine, hasDrawn, gameState, roundResult, null, { paused: true, pausedBySeat: seat });
  }, [gameEngine, hasDrawn, gameState, roundResult, pushState]);

  // ── Resume Game ──
  const resumeGame = useCallback(async () => {
    if (!gameEngine) return;
    setIsPaused(false);
    setPausedBySeat(null);
    isPausedRef.current = false;
    pausedBySeatRef.current = null;
    await pushState(gameEngine, hasDrawn, gameState, roundResult, null, { paused: false, pausedBySeat: null });
  }, [gameEngine, hasDrawn, gameState, roundResult, pushState]);

  // ── Abandon Game ──
  const abandonGame = useCallback(async () => {
    const id = gameIdRef.current;
    if (id) {
      try {
        await MultiplayerService.pushGameState(id, { abandoned: true });
      } catch (_) {}
    }
    returnToSetup();
  }, [returnToSetup]);

  useEffect(() => {
    return () => {
      if (unsubPlayersRef.current) unsubPlayersRef.current();
      if (unsubStateRef.current) unsubStateRef.current();
      if (knockTimerRef.current) clearTimeout(knockTimerRef.current);
      if (knockIntervalRef.current) clearInterval(knockIntervalRef.current);
    };
  }, []);

  return {
    onlinePhase,
    gameCode,
    mySeat,
    isHost,
    lobbyPlayers,
    playerId,
    isMyTurn,
    isPaused,
    pausedBySeat,
    createGame,
    joinGame,
    startGame,
    pauseGame,
    resumeGame,
    abandonGame,

    gameEngine,
    gameState,
    selectedCardIndex,
    setSelectedCardIndex,
    hasDrawn,
    roundResult,
    knockCountdown,
    canKnockAfterDiscard,
    drawCard,
    discardCard,
    knock,
    passKnock,
    startNextRound,
    reorderHand,
    returnToSetup,
    refresh,
  };
};
