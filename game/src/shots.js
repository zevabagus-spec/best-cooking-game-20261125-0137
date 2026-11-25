// Warung Rush — the screenshot scenes behind ?shot=title|play|serve|end&seed=N.
// Each scene builds a real day with the game's own state and cooking functions, plays it
// forward in fixed steps to a moment worth photographing, and freezes there: the frames
// are the game itself, staged — the same seed always gives the same frame.

import { SCREEN_OVER, SCREEN_PLAY, createDay, spawnOrder } from './state.js';
import { addInstant, startGrill, tickDay, useGrillSlot } from './cooking.js';
import { makeRandom } from './random.js';

export const SHOT_NAMES = ['title', 'play', 'serve', 'end'];

/** Fixed animation clock per scene, so steam and coals sit still the same way every run. */
export const SHOT_TIME = { title: 1.2, play: 2.4, serve: 3.1, end: 0.8 };

function step(state, seconds) {
  const dt = 1 / 30;
  for (let t = 0; t < seconds; t += dt) tickDay(state, dt);
}

/** Open the stall and let the first customers arrive. */
function openDay(seed) {
  const state = createDay(makeRandom(seed));
  state.screen = SCREEN_PLAY;
  state.nextOrderIn = 0;
  step(state, 1.2);
  return state;
}

/** Mid-service: two tickets up, satay on the grill, a bowl half built for the first order. */
function playScene(seed) {
  const state = openDay(seed);
  spawnOrder(state);
  const first = state.orders[0];
  startGrill(state, 'satay');
  startGrill(state, 'egg');
  for (const id of first.recipe.items.slice(0, 3)) {
    if (id !== 'satay' && id !== 'egg') addInstant(state, id);
  }
  state.orders.forEach((order, i) => { order.patienceLeft = order.patience * (i === 0 ? 0.62 : 0.85); });
  step(state, 2.2);
  return state;
}

/** The money moment: a finished dish steaming on the pass, the next bowl already started. */
function serveScene(seed) {
  const state = openDay(seed);
  spawnOrder(state);
  const first = state.orders[0];
  for (const id of first.recipe.items) {
    if (id === 'satay' || id === 'egg') {
      startGrill(state, id);
      step(state, 8);
      const slot = state.grill.findIndex((entry) => entry && entry.ingredientId === id);
      if (slot !== -1) useGrillSlot(state, slot);
    } else {
      addInstant(state, id);
    }
  }
  state.coins = 47;
  state.served = 2;
  state.combo = 2;
  state.lastServe = { name: 'Nasi Anak Kos', earned: 15, time: 1.2 };
  return state;
}

/** The end of a good day: results over a kitchen that has clearly been worked. */
function endScene(seed) {
  const state = serveScene(seed);
  state.screen = SCREEN_OVER;
  state.coins = 286;
  state.served = 13;
  state.bestCombo = 6;
  state.combo = 0;
  state.strikes = 1;
  state.timeLeft = 0;
  state.elapsed = 150;
  state.lastServe = null;
  return state;
}

/** Build the frozen state for one named scene. */
export function buildShotScene(name, seed) {
  if (name === 'play') return playScene(seed);
  if (name === 'serve') return serveScene(seed);
  if (name === 'end') return endScene(seed);
  const state = createDay(makeRandom(seed));
  return state;
}
