# How to Play - Card Game

## 🎯 Objective
Be the player with the **lowest total score** after 13 rounds. Score points are bad - aim for zero!

## 📋 Game Overview
This is a Rummy-style card game where players form combinations of cards (sets and runs) to reduce their hand score to zero, then "knock" to end the round.

## 🎴 Setup
- **Players:** 2 players (Player vs Computer or Player vs Player)
- **Rounds:** 13 rounds total
- **Starting Hand:** Each round, players receive cards equal to the round number + 2
  - Round 1: 3 cards
  - Round 2: 4 cards
  - Round 3: 5 cards
  - ...and so on up to Round 13: 15 cards

## 🃏 Wild Cards
Each round has a different **wild card rank**:
- Round 1: 3s are wild
- Round 2: 4s are wild
- Round 3: 5s are wild
- Round 4: 6s are wild
- Round 5: 7s are wild
- Round 6: 8s are wild
- Round 7: 9s are wild
- Round 8: 10s are wild
- Round 9: Jacks are wild
- Round 10: Queens are wild
- Round 11: Kings are wild
- Round 12: Aces are wild
- Round 13: 2s are wild

**Wild cards can substitute for any card to complete a set or run!**

## 🎮 How to Play

### Turn Structure
1. **Draw a card** - Choose to draw from:
   - The face-down deck (unknown card)
   - The discard pile (visible top card)

2. **Discard a card** - After drawing, you must discard one card from your hand to the discard pile

3. **Knock Window** - After discarding, you have 3 seconds to decide whether to knock

### Forming Combinations
To reduce your score, form these combinations:

#### **Sets** (3+ cards of the same rank)
- Example: 7♠ 7♥ 7♦
- Example with wild: 5♣ 5♦ 3♠ (in Round 1 where 3s are wild)

#### **Runs** (3+ consecutive cards of the same suit)
- Example: 4♥ 5♥ 6♥
- Example with wild: 9♠ 10♠ J♠ (Jack is not wild in Round 9+)
- Example with wild: 4♦ 5♦ 7♦ (where 6s are wild in Round 4)

**Important:** You don't need to physically arrange or declare combinations during play. The game automatically calculates your best possible score based on all valid combinations.

## 👊 Knocking
When your hand score reaches **0 points** (all cards in valid combinations), you can **knock**:
1. After you discard, a 3-second knock window appears
2. Click the "KNOCK" button to end the round
3. Your opponent gets ONE final turn
4. The round ends and scores are calculated

**Strategic Note:** You can knock even with a score above 0, but it's risky! Your opponent might end up with a lower score and you'll lose points.

## 📊 Scoring

### Card Values
- **Number cards (2-10):** Face value (2 = 2 points, 10 = 10 points)
- **Face cards (J, Q, K):** 10 points each
- **Aces:** 1 point
- **Wild cards:** 25 points (if not used in a combination!)

### Round Scoring
After each round:
1. The game finds your best possible combinations (sets and runs)
2. Any remaining cards that don't fit = your round score
3. This score is added to your total score

**Example:**
- Your hand: 3♠ 3♥ 3♦ 5♣ 9♦ (Round 1, 3s are wild)
- Best combination: Set of 3♠ 3♥ 3♦ (counts as 0 since they form a set)
- Remaining cards: 5♣ (5 points) + 9♦ (9 points)
- Your round score: **14 points**

### Game Winner
After 13 rounds, the player with the **lowest total score wins!**

## 💡 Strategy Tips

1. **Wild Cards are Powerful** - They're worth 25 points if unused, so always try to include them in combinations!

2. **Watch the Discard Pile** - Pay attention to what your opponent discards. It tells you what they don't need.

3. **Don't Rush to Knock** - Make sure your score is truly 0 before knocking. The game shows your current score in Easy mode.

4. **Card Management** - Sometimes it's better to hold cards that could form multiple different combinations.

5. **Final Turn Advantage** - If your opponent knocks, use your final turn wisely to minimize your score.

6. **Difficulty Modes:**
   - **Easy Mode:** Score is displayed, 3-second knock window - you know exactly when you can knock and have more time to decide
   - **Hard Mode:** Score is hidden, 1-second knock window - you must calculate it yourself AND react quickly!

## 🎯 Quick Reference

### Valid Combinations
✅ **Set:** 3+ cards of same rank (e.g., 8♠ 8♥ 8♦)
✅ **Run:** 3+ consecutive cards of same suit (e.g., 4♣ 5♣ 6♣)
✅ **Wild cards can replace any card**

### Invalid Combinations
❌ Only 2 cards (need at least 3)
❌ Mixed suits in a run (e.g., 4♣ 5♥ 6♣)
❌ Non-consecutive ranks in a run (e.g., 4♣ 5♣ 7♣)

## 🎲 Example Round

**Round 3** (5 cards, 5s are wild)

**Your starting hand:** 7♠ 7♥ 5♦ 9♣ K♦

**Current score:** 36 points (no combinations yet)

**Turn 1:**
- Draw: 7♦ from deck
- Now have: 7♠ 7♥ 7♦ 5♦ 9♣ K♦
- Combination found: Set of 7s (7♠ 7♥ 7♦)
- Remaining: 5♦ 9♣ K♦ = 44 points (5 is wild = 25, 9 = 9, K = 10)
- Discard: K♦

**Turn 2:**
- Draw: 8♣ from discard pile
- Now have: 7♠ 7♥ 7♦ 5♦ 9♣ 8♣
- Combinations: Set of 7s + Run 8♣ 9♣ (using 5♦ as wild for 10♣? No, different suit!)
- Still 34 points remaining
- Discard: 8♣

**Turn 3:**
- Draw: 9♠
- Now have: 7♠ 7♥ 7♦ 5♦ 9♣ 9♠
- Combinations: Set of 7s + Set of 9s using wild (9♣ 9♠ 5♦)
- **Score: 0 points!**
- Discard: 9♠
- **KNOCK!** ✊

Your opponent gets one final turn, then scores are calculated!

---

**Good luck and have fun!** 🎴
