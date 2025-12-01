import { useState, useEffect } from 'react';

/**
 * Hook to detect screen size and determine if it's large enough for the game
 * Returns true if screen width is >= 768px AND height is >= 600px
 */
export const useScreenSize = () => {
  const [isLargeEnough, setIsLargeEnough] = useState(true);

  useEffect(() => {
    // Check screen size on mount and window resize
    const checkScreenSize = () => {
      const minWidth = 768; // Tailwind's md breakpoint
      const minHeight = 600; // Minimum height for game UI
      setIsLargeEnough(
        window.innerWidth >= minWidth && window.innerHeight >= minHeight
      );
    };

    // Initial check
    checkScreenSize();

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return isLargeEnough;
};
