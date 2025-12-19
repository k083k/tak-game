import { motion } from 'framer-motion';
import { useState } from 'react';

/**
 * Error fallback UI displayed when an error boundary catches an error
 */
export const ErrorFallback = ({ error, errorInfo, onReset, componentName }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full border border-white/20 shadow-2xl"
      >
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
            <span className="text-5xl">⚠️</span>
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-3xl font-black text-white text-center mb-4">
          Oops! Something went wrong
        </h1>

        {/* Error Message */}
        <p className="text-white/80 text-center mb-6">
          {componentName ? (
            <>The <span className="font-semibold text-white">{componentName}</span> component encountered an error.</>
          ) : (
            <>An unexpected error occurred in the application.</>
          )}
        </p>

        {/* Error Details Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/90 font-medium transition-colors text-sm"
          >
            {showDetails ? '▼ Hide Details' : '▶ Show Details'}
          </button>

          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 p-4 bg-black/30 rounded-lg overflow-auto max-h-64"
            >
              <div className="text-red-300 font-mono text-xs mb-4">
                <div className="font-bold mb-2">Error Message:</div>
                <div className="whitespace-pre-wrap break-words">
                  {error?.toString()}
                </div>
              </div>

              {errorInfo && (
                <div className="text-white/60 font-mono text-xs">
                  <div className="font-bold mb-2">Component Stack:</div>
                  <div className="whitespace-pre-wrap break-words">
                    {errorInfo.componentStack}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            className="flex-1 py-3 bg-white text-red-900 rounded-xl font-bold hover:bg-white/90 transition-colors"
          >
            Try Again
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.reload()}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
          >
            Reload Page
          </motion.button>
        </div>

        {/* Help Text */}
        <p className="text-white/50 text-center text-sm mt-6">
          If this error persists, please try refreshing the page or clearing your browser cache.
        </p>
      </motion.div>
    </div>
  );
};
