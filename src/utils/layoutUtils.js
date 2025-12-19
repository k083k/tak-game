import { HAND_LAYOUTS, CARD_OVERLAP } from '../constants';

/**
 * Utility functions for UI layout calculations
 */

/**
 * Get row distribution for hand layout
 * @param {number} handSize - Number of cards in hand
 * @returns {array} Array of numbers representing cards per row
 */
export const getHandRowDistribution = (handSize) => {
  return HAND_LAYOUTS[handSize] || [handSize];
};

/**
 * Split cards into rows based on hand size
 * @param {array} cards - Array of cards
 * @returns {array} Array of card arrays (rows)
 */
export const splitCardsIntoRows = (cards) => {
  const distribution = getHandRowDistribution(cards.length);
  const rows = [];
  let startIndex = 0;

  for (const rowSize of distribution) {
    rows.push(cards.slice(startIndex, startIndex + rowSize));
    startIndex += rowSize;
  }

  return rows;
};

/**
 * Calculate global index from row and card indices
 * @param {number} rowIndex - Row index
 * @param {number} cardIndex - Card index within row
 * @param {array} rows - Array of card rows
 * @returns {number} Global card index
 */
export const getGlobalCardIndex = (rowIndex, cardIndex, rows) => {
  return rows.slice(0, rowIndex).reduce((sum, r) => sum + r.length, 0) + cardIndex;
};

/**
 * Get card overlap style
 * @param {number} cardIndex - Index of card in row
 * @param {string} direction - 'horizontal' or 'vertical'
 * @returns {object} Style object with marginLeft or marginTop
 */
export const getCardOverlapStyle = (cardIndex, direction = 'horizontal') => {
  if (cardIndex === 0) {
    return direction === 'horizontal' ? { marginLeft: '0' } : { marginTop: '0' };
  }

  const overlap = direction === 'horizontal'
    ? CARD_OVERLAP.HORIZONTAL
    : CARD_OVERLAP.VERTICAL;

  return direction === 'horizontal'
    ? { marginLeft: `${overlap}px` }
    : { marginTop: `${overlap}px` };
};

/**
 * Calculate container dimensions for card grid
 * @param {number} handSize - Number of cards
 * @param {object} cardDimensions - Card dimensions object
 * @returns {object} Container dimensions {width, height}
 */
export const calculateContainerDimensions = (handSize, cardDimensions) => {
  const rows = getHandRowDistribution(handSize);
  const maxCardsInRow = Math.max(...rows);

  // Parse Tailwind classes to get numeric values
  // This is simplified - in production you'd want more robust parsing
  const cardWidth = 80; // Approximate width in pixels for 'w-20'
  const cardHeight = 112; // Approximate height in pixels for 'h-28'

  const width = (maxCardsInRow * cardWidth) + ((maxCardsInRow - 1) * Math.abs(CARD_OVERLAP.HORIZONTAL));
  const height = (rows.length * cardHeight) + ((rows.length - 1) * Math.abs(CARD_OVERLAP.VERTICAL));

  return { width, height };
};

/**
 * Check if screen meets minimum requirements
 * @param {number} width - Screen width
 * @param {number} height - Screen height
 * @param {number} minWidth - Minimum width requirement
 * @param {number} minHeight - Minimum height requirement
 * @returns {boolean} True if screen is large enough
 */
export const isScreenLargeEnough = (width, height, minWidth = 768, minHeight = 600) => {
  return width >= minWidth && height >= minHeight;
};

/**
 * Get responsive card size based on screen width
 * @param {number} screenWidth - Screen width in pixels
 * @returns {string} Card size key ('xs', 'sm', 'md', 'lg')
 */
export const getResponsiveCardSize = (screenWidth) => {
  if (screenWidth < 640) return 'xs';
  if (screenWidth < 768) return 'sm';
  if (screenWidth < 1024) return 'md';
  return 'lg';
};

/**
 * Calculate stagger delay for animations
 * @param {number} index - Item index
 * @param {number} delayMs - Base delay in milliseconds
 * @returns {number} Stagger delay in milliseconds
 */
export const getStaggerDelay = (index, delayMs = 50) => {
  return index * delayMs;
};

/**
 * Generate grid layout classes based on item count
 * @param {number} itemCount - Number of items
 * @returns {string} Tailwind grid classes
 */
export const getGridClasses = (itemCount) => {
  if (itemCount === 1) return 'grid-cols-1';
  if (itemCount === 2) return 'grid-cols-2';
  if (itemCount === 3) return 'grid-cols-3';
  if (itemCount === 4) return 'grid-cols-2 md:grid-cols-4';
  return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
};
