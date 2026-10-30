# Memory Game

A two-player memory card game that runs in the browser. Players take turns flipping cards to find matching pairs, and whoever finds the most pairs wins.

**Play it here:** https://bxbritt.github.io/memory-game/

## Features

- Two-player turns with a live score for each player
- Cards shuffled with the Fisher-Yates algorithm, so every game is different
- Card data loaded from a JSON file, so new cards are easy to add
- Board locks while two cards are flipped to prevent extra clicks
- Winner popup at the end and a restart button

## Built With

- HTML
- CSS
- JavaScript
- Hosted on GitHub Pages

## How to Run

Play the live version at the link above, or run it locally.

1. Clone the repo.
2. Open the folder and start a local server, for example `python3 -m http.server`.
3. Go to `http://localhost:8000` in your browser.

A local server is needed because the game loads `cards.json` with `fetch`, which browsers block when you open `index.html` directly.

## Assets

All card illustrations were drawn by me.

## Credits

I used examples from w3schools.com and YouTube tutorials while learning how to implement some elements and functions in the HTML and JavaScript.
