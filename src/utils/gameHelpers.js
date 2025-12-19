/**
 * Utility functions for game logic and calculations
 */

/**
 * Determine round winner based on scores
 * @param {number} player1Score - Player 1's score
 * @param {number} player2Score - Player 2's score
 * @param {string} player1Name - Player 1's name
 * @param {string} player2Name - Player 2's name
 * @returns {string} Winner message
 */
export const getRoundWinner = (player1Score, player2Score, player1Name, player2Name) => {
  if (player1Score < player2Score) {
    return `${player1Name} 🎉`;
  }
  if (player2Score < player1Score) {
    return `${player2Name} 🎉`;
  }
  return "It's a Tie! 🤝";
};

/**
 * Determine game winner
 * @param {object} player1 - Player 1 object
 * @param {object} player2 - Player 2 object
 * @returns {object|null} Winner object or null for tie
 */
export const getGameWinner = (player1, player2) => {
  const p1Score = player1.getTotalScore();
  const p2Score = player2.getTotalScore();

  if (p1Score < p2Score) return player1;
  if (p2Score < p1Score) return player2;
  return null; // Tie
};

/**
 * Format player name for display
 * @param {string} name - Player name
 * @param {string} defaultName - Default name if empty
 * @returns {string} Formatted name
 */
export const formatPlayerName = (name, defaultName = 'Player') => {
  return (name || '').trim() || defaultName;
};

/**
 * Calculate wild rank for a given round
 * @param {number} round - Current round number (1-11)
 * @returns {number} Wild rank for the round
 */
export const getWildRankForRound = (round) => {
  return round + 2; // Round 1 = 3, Round 2 = 4, ..., Round 11 = 13 (K)
};

/**
 * Calculate number of cards to deal for a round
 * @param {number} round - Current round number
 * @param {number} startingCards - Starting cards for round 1
 * @returns {number} Number of cards to deal
 */
export const getCardsPerRound = (round, startingCards = 3) => {
  return startingCards + (round - 1);
};

/**
 * Check if it's the final round
 * @param {number} currentRound - Current round number
 * @param {number} maxRounds - Maximum rounds in game
 * @returns {boolean} True if final round
 */
export const isFinalRound = (currentRound, maxRounds = 11) => {
  return currentRound >= maxRounds;
};

/**
 * Get turn message based on game state
 * @param {boolean} isRoundOver - Is round over
 * @param {boolean} isPlayerTurn - Is it player's turn
 * @param {boolean} hasDrawn - Has player drawn a card
 * @param {boolean} hasKnocked - Has someone knocked
 * @param {boolean} isOpponentKnocker - Did opponent knock
 * @param {string} gameMode - Game mode ('pvc' or 'pvp')
 * @returns {string} Turn message
 */
export const getTurnMessage = (
  isRoundOver,
  isPlayerTurn,
  hasDrawn,
  hasKnocked,
  isOpponentKnocker,
  gameMode
) => {
  if (isRoundOver) return 'Round ending...';
  if (!isPlayerTurn) {
    return gameMode === 'pvc' ? 'Computer playing...' : "Opponent's turn";
  }
  if (hasDrawn) return 'Select card to discard';
  if (hasKnocked && isOpponentKnocker) return 'Final turn!';
  return 'Draw a card';
};

/**
 * Calculate progress through the game
 * @param {number} currentRound - Current round
 * @param {number} maxRounds - Maximum rounds
 * @returns {number} Progress percentage (0-100)
 */
export const getGameProgress = (currentRound, maxRounds = 11) => {
  return Math.round((currentRound / maxRounds) * 100);
};

/**
 * Check if player can perform an action
 * @param {boolean} isPlayerTurn - Is it player's turn
 * @param {boolean} isRoundOver - Is round over
 * @param {boolean} isPaused - Is game paused
 * @returns {boolean} Can perform action
 */
export const canPerformAction = (isPlayerTurn, isRoundOver, isPaused) => {
  return isPlayerTurn && !isRoundOver && !isPaused;
};

/**
 * Validate player name
 * @param {string} name - Player name to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {object} Validation result {isValid, error}
 */
export const validatePlayerName = (name, minLength = 1, maxLength = 20) => {
  const trimmed = (name || '').trim();

  if (trimmed.length < minLength) {
    return { isValid: false, error: 'Name is required' };
  }

  if (trimmed.length > maxLength) {
    return { isValid: false, error: `Name must be ${maxLength} characters or less` };
  }

  return { isValid: true, error: null };
};
