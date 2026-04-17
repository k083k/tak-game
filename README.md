# Tac — Card Game

A 2-player rummy-style card game built with React and Vite.

## How to Play

Play through 11 rounds. Each round the hand size grows (3 cards in round 1, up to 13 in round 11). Form **sets** (3+ cards of the same rank) and **runs** (3+ consecutive cards of the same suit) to reduce your score. The wild card rotates every round. After discarding, you have a short window to **knock** — ending the round and giving your opponent one final turn. Lowest total score after 11 rounds wins.

## Modes

- **vs Computer** — play solo against an AI opponent
- **vs Player** — local hot-seat multiplayer (pass the device)
- **Easy** — score visible, 3-second knock window
- **Hard** — score hidden, 1-second knock window

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
npm run lint     # run ESLint
```

## Stack

- React 19 + Vite
- Tailwind CSS v4
- Framer Motion
- Supabase (online multiplayer)
- Vercel Analytics
