/**
 * Card component for displaying a playing card with improved aesthetics
 */
export const CardComponent = ({
  card,
  isHidden = false,
  isWild = false,
  isSelected = false,
  onClick = null,
  index = 0
}) => {
  const getCardColor = () => {
    if (isHidden) return '';
    if (!card) return '';
    return card.isRed() ? 'text-red-600' : 'text-gray-900';
  };

  // Generate pip positions for number cards
  const getPipPositions = (rank) => {
    const positions = {
      1: ['center'],
      2: ['top-center', 'bottom-center'],
      3: ['top-center', 'center', 'bottom-center'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
      7: ['top-left', 'top-right', 'middle-left', 'middle-right', 'top-center-mid', 'bottom-left', 'bottom-right'],
      8: ['top-left', 'top-right', 'middle-left', 'middle-right', 'top-center-mid', 'bottom-center-mid', 'bottom-left', 'bottom-right'],
      9: ['top-left', 'top-right', 'middle-left', 'middle-right', 'center', 'top-quarter-left', 'top-quarter-right', 'bottom-quarter-left', 'bottom-quarter-right'],
      10: ['top-left', 'top-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center', 'top-quarter-left', 'top-quarter-right', 'bottom-quarter-left', 'bottom-quarter-right']
    };
    return positions[rank] || [];
  };

  const getPipStyle = (position) => {
    const styles = {
      'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      'top-center': 'top-2 left-1/2 -translate-x-1/2',
      'bottom-center': 'bottom-2 left-1/2 -translate-x-1/2 rotate-180',
      'top-left': 'top-2 left-3',
      'top-right': 'top-2 right-3',
      'bottom-left': 'bottom-2 left-3 rotate-180',
      'bottom-right': 'bottom-2 right-3 rotate-180',
      'middle-left': 'top-1/2 -translate-y-1/2 left-3',
      'middle-right': 'top-1/2 -translate-y-1/2 right-3',
      'top-center-mid': 'top-1/3 left-1/2 -translate-x-1/2',
      'bottom-center-mid': 'bottom-1/3 left-1/2 -translate-x-1/2 rotate-180',
      'top-quarter-left': 'top-1/4 left-3',
      'top-quarter-right': 'top-1/4 right-3',
      'bottom-quarter-left': 'bottom-1/4 left-3 rotate-180',
      'bottom-quarter-right': 'bottom-1/4 right-3 rotate-180'
    };
    return styles[position] || '';
  };

  const cardClasses = `
    relative w-20 h-28 rounded-lg
    flex flex-col items-center justify-center
    font-bold transition-all duration-300 ease-out
    ${isHidden
      ? 'bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 border-2 border-purple-900'
      : 'bg-white border-2 border-gray-300'
    }
    ${isSelected ? 'ring-4 ring-green-500 border-green-500 -translate-y-3 shadow-2xl scale-105' : 'shadow-md'}
    ${isWild && !isHidden ? 'ring-2 ring-orange-400 border-orange-400' : ''}
    ${onClick ? 'cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:scale-[1.02]' : ''}
    ${getCardColor()}
    transform
  `;

  const animationDelay = `${index * 50}ms`;

  if (isHidden) {
    return (
      <div
        className={cardClasses}
        style={{
          animationDelay,
          animation: 'slideIn 0.3s ease-out forwards',
        }}
      >
        {/* Decorative pattern for card back */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          {/* Outer border pattern */}
          <div className="absolute inset-2 border-2 border-white/30 rounded-md"></div>
          <div className="absolute inset-3 border border-white/20 rounded-md"></div>

          {/* Center decorative design */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-12 h-12">
              {/* Diamond pattern */}
              <div className="absolute inset-0 rotate-45 border-2 border-white/40 rounded-lg"></div>
              <div className="absolute inset-2 rotate-45 border border-white/30 rounded-md"></div>

              {/* Center ornament */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white/20 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/40 rounded-full"></div>
            </div>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-white/30"></div>
          <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-white/30"></div>
          <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-white/30"></div>
          <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-white/30"></div>

          {/* Subtle pattern lines */}
          <div className="absolute top-1/4 left-4 right-4 h-px bg-white/10"></div>
          <div className="absolute bottom-1/4 left-4 right-4 h-px bg-white/10"></div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="w-20 h-28 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center opacity-50">
        <span className="text-gray-400 text-xs">Empty</span>
      </div>
    );
  }

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      style={{
        animationDelay,
        animation: 'slideIn 0.3s ease-out forwards',
      }}
    >
      {/* Card shine effect */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-50"></div>
      </div>

      {/* Wild card indicator */}
      {isWild && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
          <span className="text-white text-[10px] font-bold">W</span>
        </div>
      )}

      {/* Card content */}
      <div className="relative w-full h-full">
        {card.isJoker() ? (
          <>
            {/* Joker corner indices */}
            <div className="absolute top-1 left-1.5 flex flex-col items-center text-[10px] leading-tight">
              <span className="text-purple-600 font-bold">JKR</span>
            </div>
            <div className="absolute bottom-1 right-1.5 flex flex-col items-center text-[10px] leading-tight rotate-180">
              <span className="text-purple-600 font-bold">JKR</span>
            </div>
            {/* Joker center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <span className="text-3xl">🃏</span>
            </div>
          </>
        ) : card.rank >= 11 && card.rank <= 13 ? (
          // Face cards (J, Q, K)
          <>
            {/* Corner indices */}
            <div className="absolute top-1 left-1.5 flex flex-col items-center text-[10px] leading-tight">
              <span className="font-bold">{card.getDisplayRank()}</span>
              <span className="text-sm">{card.suit}</span>
            </div>
            <div className="absolute bottom-1 right-1.5 flex flex-col items-center text-[10px] leading-tight rotate-180">
              <span className="font-bold">{card.getDisplayRank()}</span>
              <span className="text-sm">{card.suit}</span>
            </div>
            {/* Large letter in center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="text-5xl font-bold opacity-20">{card.getDisplayRank()}</span>
            </div>
          </>
        ) : (
          // Number cards with pip layout
          <>
            {/* Corner indices */}
            <div className="absolute top-1 left-1.5 flex flex-col items-center text-[10px] leading-tight">
              <span className="font-bold">{card.getDisplayRank()}</span>
              <span className="text-sm">{card.suit}</span>
            </div>
            <div className="absolute bottom-1 right-1.5 flex flex-col items-center text-[10px] leading-tight rotate-180">
              <span className="font-bold">{card.getDisplayRank()}</span>
              <span className="text-sm">{card.suit}</span>
            </div>
            {/* Pips */}
            {getPipPositions(card.rank).map((position, idx) => (
              <div
                key={idx}
                className={`absolute text-lg ${getPipStyle(position)}`}
              >
                {card.suit}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
