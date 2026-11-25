# best-cooking-game-20261125-0137

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/zevabagus-spec/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/zevabagus-spec/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Warung Rush — Nasi Campur Kitchen**: a complete, original cooking game about running an Indonesian warung stall through one 150-second lunch service. Order tickets land on the board, each asking for a named nasi campur bowl — Nasi Campur Komplit, Nasi Sate Madura, Nasi Rendang Spesial and more — and the same pantry combines differently in every recipe. Six ingredients scoop straight from the counter bins onto the bowl, but sate skewers and fried eggs must cook on the two-slot grill first (and burn if left too long), so a good cook starts the grill early and assembles around it. Serve a bowl that matches a ticket exactly to earn its price plus a speed tip and a growing combo bonus; let a customer's patience bar empty and they walk away — three walk-aways, or the day clock, ends the service.

Everything is drawn in code on one canvas — kitchen, tickets, food and all — and every sound is synthesized with WebAudio, so the game is fully offline with no assets to load. Play it with the mouse (click bins, grill slots and SERVE) or the keyboard (1–8 add ingredients, Enter or Space serves, Backspace undoes, X trashes the bowl, M mutes). The screenshots in `screenshots/` are real frames of this code, staged deterministically through the game's own `?shot=` scenes in `game/src/shots.js`.

The source is split by job: `recipes.js` (the food and the dishes), `state.js` (the day and its pressure curve), `cooking.js` (actions and the clock), `render.js` (all drawing, plus the geometry input clicks against), `input.js`, `audio.js`, `random.js` (seeded, so scenes replay exactly), `config.js` and `main.js` (boot and frame loop). `main.ts` at the root hands the entry in: it copies `game/` and `screenshots/` to the output directory and writes the dossier with the vendored make.fun library.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Then play the game itself with `node serve.ts` and open http://localhost:8080.

---

<sub>Entered on [make.fun](https://make.fun/?ref=pkrtjm47&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
