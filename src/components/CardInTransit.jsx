import { motion } from 'framer-motion';
import { CardComponent } from './CardComponent';

/**
 * Component for animating cards moving between locations
 */
export const CardInTransit = ({ card, from, to, onComplete, isHidden = false }) => {
  // Define source and destination positions
  const positions = {
    deck: { x: '0vw', y: '0vh' },
    discard: { x: '20vw', y: '0vh' },
    playerHand: { x: '0vw', y: '30vh' },
    opponentHand: { x: '0vw', y: '-30vh' }
  };

  return (
    <motion.div
      className="fixed z-50 pointer-events-none"
      initial={positions[from]}
      animate={positions[to]}
      transition={{
        duration: 0.6,
        ease: [0.43, 0.13, 0.23, 0.96]
      }}
      onAnimationComplete={onComplete}
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}
    >
      <motion.div
        initial={{ scale: 1, rotateY: isHidden ? 0 : 180 }}
        animate={{ scale: 1.1, rotateY: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CardComponent card={card} isHidden={isHidden} />
      </motion.div>
    </motion.div>
  );
};
