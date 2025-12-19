import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { useGameState } from './hooks/useGameState';
import { useScreenSize } from './hooks/useScreenSize';
import { SetupScreen } from './components/SetupScreen';
import { GameBoard } from './components/GameBoard';
import { GameOverModal } from './components/GameOverModal';
import { ResumeGameModal } from './components/ResumeGameModal';
import { ScreenSizeWarning } from './components/ScreenSizeWarning';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorTest } from './components/ErrorBoundary/ErrorTest';
import { Toaster } from 'react-hot-toast';
import { TOAST_CONFIG } from './constants';

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
          duration: TOAST_CONFIG.DURATION,
          style: TOAST_CONFIG.STYLE,
          success: {
            iconTheme: TOAST_CONFIG.SUCCESS_ICON_THEME,
          },
        }}
      />
      {gameState === 'setup' && (
        <ErrorBoundary componentName="Setup Screen" onReset={returnToSetup}>
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
        </ErrorBoundary>
      )}

      {(gameState === 'playing' || gameState === 'round-end') && (
        <ErrorBoundary componentName="Game Board" onReset={returnToSetup}>
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
        </ErrorBoundary>
      )}

      {gameState === 'game-over' && (
        <ErrorBoundary componentName="Game Over Screen" onReset={returnToSetup}>
          <GameOverModal
            gameEngine={gameEngine}
            onNewGame={returnToSetup}
          />
        </ErrorBoundary>
      )}

      {showResumeModal && (
        <ResumeGameModal
          onResume={handleResumeGame}
          onStartNew={handleStartNew}
        />
      )}

      {/* Error Boundary Test Button - REMOVE IN PRODUCTION */}
      {process.env.NODE_ENV === 'development' && (
        <ErrorBoundary componentName="Error Test">
          <ErrorTest />
        </ErrorBoundary>
      )}
    </div>
  );
}

export default App;
