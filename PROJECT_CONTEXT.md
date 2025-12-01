# Project Context - Card Game

## 📌 Project Overview
A multiplayer Rummy-style card game built with React. Players compete over 13 rounds to achieve the lowest score by forming sets and runs. Features include AI opponent, game persistence, and mobile-responsive design.

## 🛠 Technology Stack
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Notifications:** React Hot Toast
- **Build Tool:** Vite
- **Storage:** LocalStorage for game persistence

## 📁 Project Structure

```
card-game/
├── src/
│   ├── ai/
│   │   ├── AIFactory.js          # Creates AI instances
│   │   └── ComputerAI.js         # AI logic for computer opponent
│   ├── components/
│   │   ├── Card.jsx              # Card display component
│   │   ├── GameBoard.jsx         # Main gameplay screen
│   │   ├── GameOverModal.jsx     # End of game results
│   │   ├── RoundEndModal.jsx     # Round completion results
│   │   ├── ResumeGameModal.jsx   # Load saved game prompt
│   │   └── SetupScreen.jsx       # Game setup and configuration
│   ├── hooks/
│   │   └── useGameState.js       # Main game state management hook
│   ├── models/
│   │   ├── Card.js               # Card class (suit, rank)
│   │   ├── Deck.js               # Deck management
│   │   └── Player.js             # Player data (hand, scores)
│   ├── services/
│   │   ├── CombinationFinder.js  # Finds valid sets and runs
│   │   ├── GameEngine.js         # Core game logic
│   │   ├── SaveGameManager.js    # LocalStorage operations
│   │   └── ScoreCalculator.js    # Score calculation logic
│   ├── App.jsx                   # Root component
│   └── main.jsx                  # Entry point
├── GAME_INSTRUCTIONS.md          # Player-facing game rules
└── PROJECT_CONTEXT.md            # This file (developer context)
```

## 🎮 Game Features Implemented

### Core Gameplay
- ✅ 13-round structure with increasing hand sizes
- ✅ Wild card rotation (3s in Round 1, 4s in Round 2, etc.)
- ✅ Set and run combinations
- ✅ Knocking mechanism (3-second window after discard)
- ✅ Draw from deck or discard pile
- ✅ Automatic combination detection and scoring
- ✅ Turn-based gameplay with player switching

### Game Modes
- ✅ Player vs Computer (PvC)
- ✅ Player vs Player (PvP) - local multiplayer
- ✅ Easy mode (score visible, 3-second knock window)
- ✅ Hard mode (score hidden, 1-second knock window)

### AI Opponent
- ✅ Computer AI with decision-making logic
- ✅ Draw/discard strategy
- ✅ Automatic knocking when score = 0
- ✅ 3-second delay animations for realistic gameplay

### User Experience
- ✅ Player customization (name, avatar)
- ✅ Card animations (draw, discard, transit effects)
- ✅ Drag-and-drop card reordering
- ✅ Visual feedback (hover, selection states)
- ✅ Toast notifications for game events
- ✅ Knock countdown timer
- ✅ Round and game completion modals

### Persistence
- ✅ Auto-save game state on every action
- ✅ Resume game modal on reload
- ✅ Single save slot
- ✅ Auto-clear on game end or decline resume

### Responsive Design
- ✅ Mobile-responsive layout (work in progress)
- ✅ Modals optimized for small screens
- ✅ Touch-friendly UI elements
- 🔄 Card sizing for small screens (in progress)
- 🔄 Card overlap for larger hands (in progress)

## 🔧 Key Classes and Systems

### Card (`src/models/Card.js`)
```javascript
class Card {
  constructor(suit, rank)
  toString()        // "A♠", "K♥", etc.
  getValue()        // Numeric value for scoring
  equals(other)     // Card comparison
}
```

### Player (`src/models/Player.js`)
```javascript
class Player {
  name, isHuman, avatar
  hand              // Array of Card objects
  totalScore        // Cumulative score across rounds
  roundScores       // Array of scores per round

  addCard(card)
  removeCard(index)
  getHand()
  getTotalScore()
  addRoundScore(score)
}
```

### GameEngine (`src/services/GameEngine.js`)
Core game logic coordinator:
- Manages players, deck, discard pile
- Tracks current round, turn, wild card
- Handles knocking state
- Starts rounds, switches players
- Determines game winner

### CombinationFinder (`src/services/CombinationFinder.js`)
Algorithms to find optimal card combinations:
- `findAllSets()` - Finds all valid sets
- `findAllRuns()` - Finds all valid runs
- `findBestCombination()` - Dynamic programming to find minimum score

### ScoreCalculator (`src/services/ScoreCalculator.js`)
```javascript
calculateScore(hand, wildRank)
// Returns: { score, combinations, remaining }
```

### SaveGameManager (`src/services/SaveGameManager.js`)
```javascript
saveGame(gameState)       // Serialize and save to localStorage
loadGame()                // Deserialize from localStorage
hasSavedGame()            // Check if save exists
clearSave()               // Remove saved game
serializeGameEngine()     // Convert classes to plain objects
```

## 🎯 Current State

### Recently Completed
1. **Game Persistence System**
   - Auto-save on every state change
   - Resume modal on app load
   - Proper serialization of Card and Player objects
   - Fixed bug: Total score now persists correctly

2. **Difficulty System**
   - Easy mode: Score displayed, 3-second knock window
   - Hard mode: Score hidden (player must calculate manually), 1-second knock window for faster gameplay

3. **Mobile Responsiveness (Partial)**
   - Layout switches from horizontal to vertical on mobile
   - Player scoreboards become horizontal bars
   - Modals are scrollable and responsive
   - Text and spacing scales down on small screens

### Current Work
- **Card Responsiveness:** Cards need to:
  - Scale down on smaller screens
  - Shrink or overlap as hand size increases in later rounds
  - Maintain readability and touch-friendliness

### Known Issues
- ✅ ~~Total score resets to 0 on reload~~ (FIXED)
- ✅ ~~Cards show "[object Object]" in round end modal~~ (FIXED)
- 🔄 Cards don't resize based on screen size or hand size
- 🔄 Large hands (Round 11-13) may overflow on mobile

## 🎨 Design System

### Colors
- Background: `slate-900` to `slate-800` gradient
- Cards: White with opacity overlays
- Borders: `white/10` to `white/30`
- Text: White with varying opacity levels
- Accents: Green for success, red for errors

### Responsive Breakpoints
- Mobile: Default (< 768px)
- Desktop: `md:` prefix (≥ 768px)
- Large: `lg:` prefix (≥ 1024px)

### Animation Strategy
- Framer Motion for component animations
- Card transit animations (600ms duration)
- Hover and tap feedback on interactive elements
- Modal entrance/exit animations

## 🚀 Next Steps

### Immediate (In Progress)
1. **Card Sizing Logic**
   - Implement dynamic card sizing based on viewport width
   - Add card overlap for hands with 10+ cards
   - Ensure cards remain readable on all screen sizes

2. **Help Page**
   - Create in-game help/tutorial screen
   - Access from setup screen or during gameplay
   - Show game rules, examples, strategy tips

### Future Enhancements
1. **Testing & Polish**
   - Thorough PvP mode testing
   - Edge case handling (empty deck, etc.)
   - Performance optimization

2. **Additional Features**
   - Sound effects and music
   - Game statistics tracking
   - Replay previous rounds
   - Multiple save slots
   - Undo last action
   - Hints system

3. **Deployment**
   - Build for production
   - Deploy to Vercel/Netlify
   - Set up custom domain

## 🐛 Debugging Tips

### Common Issues
1. **Game state not updating:** Check if `refresh()` is called after state changes
2. **Cards not animating:** Verify `transitCard` state is set before operations
3. **Save/load errors:** Check browser console for serialization errors
4. **AI not playing:** Ensure `gameEngine.currentPlayerIndex === 1` and AI exists

### LocalStorage Inspection
```javascript
// In browser console:
localStorage.getItem('card_game_save')
```

### Force Clear Save
```javascript
localStorage.removeItem('card_game_save')
```

## 📝 Code Style Conventions

### React Components
- Functional components with hooks
- Props destructuring in parameters
- Return early for null states
- Use `useCallback` for functions passed as props

### State Management
- Primary state in `useGameState` hook
- Local state for UI-only concerns
- Lift state up when needed across components

### Styling
- Tailwind utility classes
- Mobile-first responsive design (default styles for mobile, `md:` for desktop)
- Framer Motion for animations

### File Organization
- One component per file
- Services/models in separate directories
- Export at bottom of file

## 🔄 Development Workflow

### Running the Project
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
npm run preview
```

### Key Development Commands
- `npm run dev` - Start dev server (usually port 5173)
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally

## 📊 Game Logic Flow

### Round Start
1. `GameEngine.startRound()` called
2. Deck shuffled, wild card set
3. Players dealt cards (round# + 2)
4. One card placed in discard pile
5. Starting player determined

### Player Turn
1. Player draws card (deck or discard)
2. Card added to hand with animation
3. Player selects and discards card
4. Card removed from hand with animation
5. 3-second knock window begins
6. If no knock, switch to next player

### Knocking
1. Player clicks knock button
2. `GameEngine.knock(playerIndex)` called
3. Opponent gets final turn
4. `GameEngine.endRound()` called
5. Scores calculated for both players
6. RoundEndModal displayed
7. Next round starts or game ends

### Score Calculation
1. `ScoreCalculator.calculateScore()` called
2. `CombinationFinder.findBestCombination()` finds optimal groupings
3. Cards in combinations = 0 points
4. Remaining cards = their point values
5. Unused wild cards = 25 points each

## 🎓 Important Implementation Notes

### Card Serialization
Cards must be reconstructed when loading from localStorage:
```javascript
// ✅ Correct
engineData.player1.hand.map(c => new Card(c.suit, c.rank))

// ❌ Wrong - creates plain objects, not Card instances
engineData.player1.hand
```

### Player Score Restoration
Both `roundScores` AND `totalScore` must be restored:
```javascript
player1.roundScores = engineData.player1.roundScores;
player1.totalScore = engineData.player1.totalScore;  // Critical!
```

### Animation Timing
Match setTimeout durations to animation durations:
```javascript
setTransitCard({ card, from, to });
setTimeout(() => {
  // Complete the action
  setTransitCard(null);
}, 600);  // Must match Framer Motion duration
```

### Knock Window
3-second countdown must be cleared properly:
```javascript
const countdownInterval = setInterval(() => {
  setKnockCountdown(prev => {
    if (prev === null || prev <= 1) {
      clearInterval(countdownInterval);
      return null;
    }
    return prev - 1;
  });
}, 1000);
```

---

## 📌 Quick Start for Context Restoration

If you're an LLM starting fresh on this project:

1. **Read this file** for project overview
2. **Read `GAME_INSTRUCTIONS.md`** to understand game rules
3. **Check `src/hooks/useGameState.js`** for main state logic
4. **Check `src/services/GameEngine.js`** for core game flow
5. **Current task:** Implement card sizing/overlap responsiveness and create help page UI

**Last known state:** Game is functional with save/load, mobile responsive layout mostly complete. Working on making cards properly sized for different screen sizes and hand sizes.
