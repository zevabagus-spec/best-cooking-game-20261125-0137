// Warung Rush — the state of one day's service and how new orders arrive.
// A day is a list of open order tickets (each with its own patience timer), two grill
// slots, one bowl being assembled on the pass, and the day's takings. The pressure
// curve lives here: as the day wears on, orders arrive faster and patience runs shorter.

import { DAY_SECONDS, GRILL_SLOTS, MAX_OPEN_ORDERS } from './config.js';
import { RECIPES } from './recipes.js';
import { pickRandom, randomBetween } from './random.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

let nextOrderId = 1;

/** A fresh day, untouched: title screen up, clock full, nothing cooking yet. */
export function createDay(random) {
  return {
    screen: SCREEN_TITLE,
    random,
    timeLeft: DAY_SECONDS,
    elapsed: 0,
    orders: [],
    grill: Array.from({ length: GRILL_SLOTS }, () => null),
    bowl: [],
    coins: 0,
    served: 0,
    strikes: 0,
    combo: 0,
    bestCombo: 0,
    nextOrderIn: 0.9,
    shake: 0,
    flash: '',
    flashTime: 0,
    lastServe: null,
  };
}

/** How long a new customer will wait, shrinking as the day's rush builds. */
export function patienceFor(random, elapsed) {
  const rush = Math.min(1, elapsed / DAY_SECONDS);
  const base = 46 - rush * 16;
  return randomBetween(random, base - 5, base + 7);
}

/** The gap before the next order arrives, shrinking as the day's rush builds. */
export function orderGapFor(random, elapsed) {
  const rush = Math.min(1, elapsed / DAY_SECONDS);
  return randomBetween(random, 7.5 - rush * 3.4, 12 - rush * 4.5);
}

/** Put a fresh ticket on the board, if there is room for one. */
export function spawnOrder(state) {
  if (state.orders.length >= MAX_OPEN_ORDERS) return null;
  const recipe = pickRandom(state.random, RECIPES);
  const patience = patienceFor(state.random, state.elapsed);
  const order = {
    id: nextOrderId,
    recipe,
    patience,
    patienceLeft: patience,
    age: 0,
  };
  nextOrderId += 1;
  state.orders.push(order);
  return order;
}

/** The order the bowl is being built for: the oldest open ticket, the one waiting longest. */
export function activeOrder(state) {
  return state.orders.length > 0 ? state.orders[0] : null;
}
