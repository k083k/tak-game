import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { useGameState } from './hooks/useGameState';
import { useScreenSize } from './hooks/useScreenSize';
import { SetupScreen } from './components/SetupScreen';
import { GameBoard } from './components/GameBoard';
import { GameOverModal } from './components/GameOverModal';
import { ResumeGameModal } from './components/ResumeGameModal';
import { ScreenSizeWarning } from './components/ScreenSizeWarning';
import { Toaster } from 'react-hot-toast';

/**
 * Main application component
 */
function App() {
  const {
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
    knockCountdown,
    startNewGame,
    startNextRound,
    drawCard,
    discardCard,
    knock,
    returnToSetup,
    reorderHand,
    loadSavedGame,
    hasSavedGame,
    clearSavedGame
  } = useGameState();

  const [showResumeModal, setShowResumeModal] = useState(false);
  const [hasCheckedForSave, setHasCheckedForSave] = useState(false);
  const isLargeEnough = useScreenSize();

  // Check for saved game on mount (only once)
  useEffect(() => {
    if (!hasCheckedForSave && hasSavedGame()) {
      setShowResumeModal(true);
    }
    setHasCheckedForSave(true);
  }, []); // Empty deps - run only once on mount

  // Handle resume game
  const handleResumeGame = () => {
    const success = loadSavedGame();
    if (success) {
      setShowResumeModal(false);
    }
  };

  // Handle start new game (discard saved game)
  const handleStartNew = () => {
    // Clear the saved game from localStorage
    clearSavedGame();
    setShowResumeModal(false);
  };

  // Show warning if screen is too small
  if (!isLargeEnough) {
    return <ScreenSizeWarning />;
  }

  return (
    <div className="min-h-screen">
      <Analytics />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            padding: '16px',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
        }}
      />
      {gameState === 'setup' && (
        <SetupScreen
          gameMode={gameMode}
          setGameMode={setGameMode}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          playerName={playerName}
          setPlayerName={setPlayerName}
          playerAvatar={playerAvatar}
          setPlayerAvatar={setPlayerAvatar}
          onStartGame={startNewGame}
        />
      )}

      {(gameState === 'playing' || gameState === 'round-end') && (
        <GameBoard
          gameEngine={gameEngine}
          selectedCardIndex={selectedCardIndex}
          setSelectedCardIndex={setSelectedCardIndex}
          hasDrawn={hasDrawn}
          knockCountdown={knockCountdown}
          onDrawCard={drawCard}
          onDiscardCard={discardCard}
          onKnock={knock}
          onReorderHand={reorderHand}
          onExit={returnToSetup}
          onNextRound={startNextRound}
          gameMode={gameMode}
          difficulty={difficulty}
          showRoundResults={gameState === 'round-end'}
        />
      )}

      {gameState === 'game-over' && (
        <GameOverModal
          gameEngine={gameEngine}
          onNewGame={returnToSetup}
        />
      )}

      {showResumeModal && (
        <ResumeGameModal
          onResume={handleResumeGame}
          onStartNew={handleStartNew}
        />
      )}
    </div>
  );
}

export default App;
