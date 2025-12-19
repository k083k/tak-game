import { useState } from 'react';

/**
 * Test component to trigger errors and test Error Boundary
 * ONLY FOR DEVELOPMENT - Remove in production
 */
export const ErrorTest = () => {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    // Intentionally throw an error to test Error Boundary
    throw new Error('Test error: This is an intentional error to test the Error Boundary!');
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShouldError(true)}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg transition-colors"
      >
        🧪 Test Error Boundary
      </button>
    </div>
  );
};
