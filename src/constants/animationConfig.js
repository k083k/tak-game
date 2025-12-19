/**
 * Animation configuration constants
 * Durations, delays, and animation settings
 */

// Animation Durations (in milliseconds)
export const ANIMATION_DURATION = {
  CARD_DRAW: 600,
  CARD_DISCARD: 600,
  CARD_FLIP: 300,
  CARD_DEAL: 300,
  MODAL_ENTER: 300,
  MODAL_EXIT: 200,
  TOAST: 3000,
  BUTTON_HOVER: 200,
  CAROUSEL_AUTO: 3000,
  KNOCK_PULSE: 1000,
};

// Animation Delays (in milliseconds)
export const ANIMATION_DELAY = {
  CARD_STAGGER: 50,  // Delay between each card in sequence
  AI_THINKING: 500,
  AI_START_TURN: 1000,
  AI_AFTER_PLAYER_DISCARD: 300,
  ROUND_TRANSITION: 500,
};

// Framer Motion Variants
export const MOTION_VARIANTS = {
  // Card animations
  cardDeal: {
    initial: { scale: 0, rotateY: 180 },
    animate: { scale: 1, rotateY: 0 },
  },
  cardFlip: {
    initial: { rotateY: 180 },
    animate: { rotateY: 0 },
  },
  cardDiscard: {
    initial: { x: 100, y: 50, opacity: 0, scale: 0.8 },
    animate: { x: 0, y: 0, opacity: 1, scale: 1 },
    exit: { x: 100, y: 50, opacity: 0, scale: 0.8 },
  },
  cardHover: {
    hover: { x: 6, scale: 1.05 },
  },

  // Modal animations
  modalBackdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  modalContent: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
  },

  // Button animations
  buttonTap: {
    tap: { scale: 0.95 },
  },
  buttonHover: {
    hover: { scale: 1.05 },
  },

  // Countdown animations
  countdownPulse: {
    animate: { scale: [1, 1.2, 1] },
  },
};

// Spring Animation Settings
export const SPRING_CONFIG = {
  default: {
    type: 'spring',
    stiffness: 300,
    damping: 25,
  },
  gentle: {
    type: 'spring',
    stiffness: 200,
    damping: 30,
  },
  bouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 20,
  },
};

// Transition Settings
export const TRANSITION = {
  smooth: {
    duration: 0.3,
    ease: 'easeInOut',
  },
  fast: {
    duration: 0.2,
    ease: 'easeOut',
  },
  slow: {
    duration: 0.5,
    ease: 'easeInOut',
  },
};

// Easing Functions
export const EASING = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
};
