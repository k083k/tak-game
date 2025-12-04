import { motion } from 'framer-motion';

/**
 * Warning component shown on screens too small to play the game
 */
export const ScreenSizeWarning = () => {
  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center"
      >
        {/* Icon */}
        <motion.div
          animate={{
            rotate: [0, -10, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="text-6xl mb-4"
        >
          📱
        </motion.div>

        {/* Title */}
        <h2 className="text-2xl font-black text-white mb-4">
          Screen Too Small
        </h2>

        {/* Message */}
        <p className="text-white/70 text-base mb-6 leading-relaxed">
          This game requires a larger screen to play. Please use a tablet or desktop device for the best experience.
        </p>

        {/* Minimum Size Info */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2">
          <p className="text-white/60 text-sm">
            <span className="font-semibold text-white/80">Minimum screen width:</span> 1080px
          </p>
          <p className="text-white/60 text-sm">
            <span className="font-semibold text-white/80">Minimum screen height:</span> 600px
          </p>
        </div>

        {/* Decorative Element */}
        <div className="mt-6 flex items-center justify-center gap-2 text-white/40 text-xs">
          <span>Rotate device</span>
          <span>•</span>
          <span>Use larger screen</span>
        </div>
      </motion.div>
    </div>
  );
};
