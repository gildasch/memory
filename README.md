# Memory

A small browser memory game with a minimalist white interface and one grid-safe flip animation based on the earlier Snap Turn study.

## Running

Open [index.html](./index.html) in a browser.

## Features

- Real playable memory board with shuffled pairs.
- Theme selector with roughly 20 fronts per set and a random subset per new game.
- Pair-count control that is clamped to the active theme capacity.
- Compact game HUD for moves, pairs left, and time.
- White framed cards with a subtle 3D feel and restrained shadows.
- Slight left or right flip variation on each turn without drifting outside the card slot.
- Wikipedia/Wikimedia image sources tracked in `assets/wikimedia-sources.json`.

## Files

- `index.html` renders the game shell and board.
- `styles.css` defines the minimalist layout and card design.
- `theme-data.js` contains the themed image manifest used on the cards.
- `assets/wikimedia-sources.json` records the Wikipedia pages and thumbnail URLs used for each theme.
- `script.js` handles setup controls, shuffle, game state, timing, and card flipping.
