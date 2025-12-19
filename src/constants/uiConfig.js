/**
 * UI configuration constants
 * Card sizes, colors, layouts, and visual settings
 */

// Card Dimensions
export const CARD_SIZES = {
  xs: {
    width: 'w-14',
    height: 'h-20',
    wild: 'w-4 h-4 text-[8px]',
  },
  sm: {
    width: 'w-16',
    height: 'h-24',
    wild: 'w-4 h-4 text-[9px]',
  },
  md: {
    width: 'w-20',
    height: 'h-28',
    wild: 'w-5 h-5 text-[10px]',
  },
  lg: {
    width: 'w-24',
    height: 'h-32',
    wild: 'w-6 h-6 text-xs',
  },
};

// Card Layout - Hand Distribution by Size
export const HAND_LAYOUTS = {
  1: [1],
  2: [2],
  3: [3],
  4: [2, 2],
  5: [3, 2],
  6: [3, 3],
  7: [4, 3],
  8: [3, 3, 2],
  9: [3, 3, 3],
  10: [3, 3, 2, 2],
  11: [3, 3, 3, 2],
  12: [3, 3, 3, 3],
  13: [4, 4, 3, 2],
  14: [4, 4, 4, 2], // Max hand size after drawing
};

// Card Overlap (in pixels)
export const CARD_OVERLAP = {
  HORIZONTAL: -16, // Cards overlap by 16px horizontally
  VERTICAL: -12,   // Cards overlap by 12px vertically (if needed)
};

// Card Rank Display Mapping
export const RANK_DISPLAY = {
  1: 'A',
  11: 'J',
  12: 'Q',
  13: 'K',
};

// Suit Mappings
export const SUIT_SYMBOLS = {
  SPADES: '♠',
  HEARTS: '♥',
  DIAMONDS: '♦',
  CLUBS: '♣',
};

export const SUIT_NAMES = {
  '♠': 'spade',
  '♥': 'heart',
  '♦': 'diamond',
  '♣': 'club',
};

// Toast Notification Settings
export const TOAST_CONFIG = {
  DURATION: 3000,
  STYLE: {
    background: '#363636',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    padding: '16px',
    borderRadius: '12px',
  },
  SUCCESS_ICON_THEME: {
    primary: '#10b981',
    secondary: '#fff',
  },
};

// Screen Size Requirements
export const SCREEN_SIZE = {
  MIN_WIDTH: 768,  // Minimum width in pixels
  MIN_HEIGHT: 600, // Minimum height in pixels
};

// Component Dimensions
export const COMPONENT_SIZES = {
  SIDEBAR_WIDTH: 'w-80',
  DECK_WIDTH: 'w-20',
  DECK_HEIGHT: 'h-28',
  DISCARD_WIDTH: 'w-20',
  DISCARD_HEIGHT: 'h-28',
  AVATAR_SIZE: 'w-12 h-12',
  BUTTON_HEIGHT: 'h-9',
};

// Z-Index Layers
export const Z_INDEX = {
  CARD_BASE: 1,
  CARD_HOVERED: 10,
  CARD_DRAGGED: 50,
  CARD_COUNT_BADGE: 5,
  MODAL_BACKDROP: 40,
  MODAL_CONTENT: 50,
};

// Color Palette (Tailwind classes)
export const COLORS = {
  BACKGROUND: 'from-slate-900 to-slate-800',
  CARD_SELECTED: 'ring-4 ring-green-500',
  CARD_WILD: 'ring-2 ring-orange-400',
  CARD_MOVE_SELECTED: 'bg-blue-500',
  DROP_TARGET: 'border-2 border-blue-400',
  SUCCESS: 'text-green-500',
  ERROR: 'text-red-500',
  WARNING: 'text-amber-400',
};

// Spacing
export const SPACING = {
  GAP_CARDS: 'gap-1',
  GAP_ROWS: 'gap-2',
  GAP_BUTTONS: 'gap-4',
  PADDING_SIDEBAR: 'p-2',
  PADDING_CARD: 'p-4',
};
