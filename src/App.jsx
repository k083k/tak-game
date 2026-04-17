import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { useGameState } from './hooks/useGameState';
import { useMultiplayerGame } from './hooks/useMultiplayerGame';
import { useScreenSize } from './hooks/useScreenSize';
import { SetupScreen } from './components/SetupScreen';
import { GameBoard } from './components/GameBoard';
import { GameOverModal } from './components/GameOverModal';
import { ResumeGameModal } from './components/ResumeGameModal';
import { ScreenSizeWarning } from './components/ScreenSizeWarning';
import { HowToPlay } from './components/HowToPlay';
import { OnlineLobby } from './components/OnlineLobby';
import { Toaster } from 'react-hot-toast';

function App() {
  const local = useGameState();
  const online = useMultiplayerGame();
  const isLargeEnough = useScreenSize();

  const [showResumeModal, setShowResumeModal] = useState(() => local.hasSavedGame());
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [howToPlayFromSetup, setHowToPlayFromSetup] = useState(false);
  const [inOnlineFlow, setInOnlineFlow] = useState(false);

  const openHowToPlay = (fromSetup = false) => {
    setHowToPlayFromSetup(fromSetup);
    setShowHowToPlay(true);
  };

  const handleResumeGame = () => {
    const success = local.loadSavedGame();
    if (success) setShowResumeModal(false);
  };

  const handleGoOnline = () => setInOnlineFlow(true);

  const handleLeaveOnline = () => {
    setInOnlineFlow(false);
    online.returnToSetup();
    local.setGameMode('pvc');
  };

  if (!isLargeEnough) return <ScreenSizeWarning />;

  const toastOptions = {
    duration: 3000,
    style: { background: '#363636', color: '#fff', fontSize: '16px', fontWeight: '600', padding: '16px', borderRadius: '12px' },
    success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
  };

  // ── Online lobby / create / join ──
  if (inOnlineFlow && online.onlinePhase !== 'playing') {
    return (
      <div className="min-h-screen">
        <Analytics />
        <Toaster position="top-center" toastOptions={toastOptions} />
        <OnlineLobby
          onlinePhase={online.onlinePhase}
          gameCode={online.gameCode}
          lobbyPlayers={online.lobbyPlayers}
          isHost={online.isHost}
          mySeat={online.mySeat}
          onCreateGame={online.createGame}
          onJoinGame={online.joinGame}
          onStartGame={online.startGame}
          onBack={handleLeaveOnline}
        />
      </div>
    );
  }

  // Active game is online or local
  const isOnlinePlaying = inOnlineFlow && online.onlinePhase === 'playing';
  const game = isOnlinePlaying ? online : local;

  return (
    <div className="min-h-screen">
      <Analytics />
      <Toaster position="top-center" toastOptions={toastOptions} />

      {/* Setup */}
      {!isOnlinePlaying && local.gameState === 'setup' && (
        <SetupScreen
          gameMode={local.gameMode}
          setGameMode={local.setGameMode}
          difficulty={local.difficulty}
          setDifficulty={local.setDifficulty}
          playerName={local.playerName}
          setPlayerName={local.setPlayerName}
          playerAvatar={local.playerAvatar}
          setPlayerAvatar={local.setPlayerAvatar}
          onStartGame={local.startNewGame}
          onShowHowToPlay={() => openHowToPlay(true)}
          onGoOnline={handleGoOnline}
        />
      )}

      {/* Game Board (local or online) */}
      {(game.gameState === 'playing' || game.gameState === 'round-end') && game.gameEngine && (
        <GameBoard
          gameEngine={game.gameEngine}
          selectedCardIndex={game.selectedCardIndex}
          setSelectedCardIndex={game.setSelectedCardIndex}
          hasDrawn={game.hasDrawn}
          knockCountdown={game.knockCountdown}
          onDrawCard={game.drawCard}
          onDiscardCard={game.discardCard}
          onKnock={game.knock}
          onReorderHand={game.reorderHand}
          onExit={isOnlinePlaying ? handleLeaveOnline : game.returnToSetup}
          onNextRound={game.startNextRound}
          gameMode={isOnlinePlaying ? 'online' : local.gameMode}
          difficulty={local.difficulty}
          showRoundResults={game.gameState === 'round-end'}
          onShowHowToPlay={() => openHowToPlay(false)}
          myPlayerIndex={0}
          isOnline={isOnlinePlaying}
          isMyTurn={isOnlinePlaying ? online.isMyTurn : true}
        />
      )}

      {game.gameState === 'game-over' && (
        <GameOverModal
          gameEngine={game.gameEngine}
          onNewGame={isOnlinePlaying ? handleLeaveOnline : game.returnToSetup}
        />
      )}

      {!isOnlinePlaying && showResumeModal && (
        <ResumeGameModal
          onResume={handleResumeGame}
          onStartNew={() => setShowResumeModal(false)}
        />
      )}

      <AnimatePresence>
        {showHowToPlay && (
          <HowToPlay
            onBack={() => setShowHowToPlay(false)}
            onPlayNow={howToPlayFromSetup ? () => { setShowHowToPlay(false); local.startNewGame(); } : null}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
