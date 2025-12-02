/**
 * Card component for displaying a playing card with SVG images
 */
export const CardComponent = ({
  card,
  isHidden = false,
  isWild = false,
  isSelected = false,
  onClick = null,
  index = 0,
  size = 'md' // 'sm', 'md', 'lg'
}) => {
  // Get card dimensions based on size prop
  const getCardDimensions = () => {
    const sizes = {
      'xs': { width: 'w-14', height: 'h-20', wild: 'w-4 h-4 text-[8px]' },
      'sm': { width: 'w-16', height: 'h-24', wild: 'w-4 h-4 text-[9px]' },
      'md': { width: 'w-20', height: 'h-28', wild: 'w-5 h-5 text-[10px]' },
      'lg': { width: 'w-24', height: 'h-32', wild: 'w-6 h-6 text-xs' }
    };
    return sizes[size] || sizes['md'];
  };

  const dimensions = getCardDimensions();

  // Get image path for the card
  const getCardImagePath = (card) => {
    if (!card || card.isJoker()) {
      return '/cards/joker_red.png';
    }

    // Map suit symbol to suit name
    const suitMap = {
      '♠': 'spade',
      '♥': 'heart',
      '♦': 'diamond',
      '♣': 'club'
    };

    const suitName = suitMap[card.suit];

    // Map rank to file name
    let rankName;
    if (card.rank >= 2 && card.rank <= 10) {
      rankName = card.rank.toString();
    } else if (card.rank === 1) {
      rankName = '1'; // Ace
    } else if (card.rank === 11) {
      rankName = 'jack';
    } else if (card.rank === 12) {
      rankName = 'queen';
    } else if (card.rank === 13) {
      rankName = 'king';
    }

    return `/cards/${suitName}_${rankName}.png`;
  };

  const cardClasses = `
    relative ${dimensions.width} ${dimensions.height} rounded-lg
    transition-all duration-300 ease-out
    ${isSelected ? 'ring-4 ring-green-500 -translate-y-3 shadow-2xl scale-105' : 'shadow-md'}
    ${isWild && !isHidden ? 'ring-2 ring-orange-400' : ''}
    ${onClick ? 'cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:scale-[1.02]' : ''}
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
        <img
          src="/cards/back-black.png"
          alt="Card back"
          className="w-full h-full object-cover rounded-lg"
          draggable="false"
        />
      </div>
    );
  }

  if (!card) {
    return (
      <div className={`${dimensions.width} ${dimensions.height} rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center opacity-50`}>
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
      {/* Wild card indicator */}
      {isWild && (
        <div className={`absolute -top-1 -right-1 ${dimensions.wild.split(' ')[0]} ${dimensions.wild.split(' ')[1]} bg-orange-500 rounded-full flex items-center justify-center shadow-md z-10`}>
          <span className={`text-white ${dimensions.wild.split(' ')[2]} font-bold`}>W</span>
        </div>
      )}

      {/* Card image */}
      <img
        src={getCardImagePath(card)}
        alt={card.toString()}
        className="w-full h-full object-cover rounded-lg"
        draggable="false"
      />
    </div>
  );
};
