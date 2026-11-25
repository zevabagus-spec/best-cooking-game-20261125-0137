// Warung Rush — the cooking itself: what each player action does, and how one tick of the
// clock moves the grill, the customers' patience and the day. Actions return a short event
// word ('scoop', 'serve', 'error', ...) so main.js can answer with the right sound at once.

import { BURN_GRACE_SECONDS, MAX_STRIKES } from './config.js';
import { INGREDIENTS, bowlMatchesRecipe } from './recipes.js';
import { SCREEN_OVER, activeOrder, orderGapFor, spawnOrder } from './state.js';
import { sounds } from './audio.js';

export const GRILL_COOKING = 'cooking';
export const GRILL_READY = 'ready';
export const GRILL_BURNT = 'burnt';

/** Add an instant ingredient straight to the bowl. Grilled food refuses: it needs the grill. */
export function addInstant(state, ingredientId) {
  const ingredient = INGREDIENTS[ingredientId];
  if (!ingredient || ingredient.kind !== 'instant') return 'error';
  state.bowl.push(ingredientId);
  sounds.scoop();
  return 'scoop';
}

/** Start a grilled ingredient on a free grill slot. Returns 'error' when the grill is full. */
export function startGrill(state, ingredientId) {
  const ingredient = INGREDIENTS[ingredientId];
  if (!ingredient || ingredient.kind !== 'grilled') return 'error';
  const slot = state.grill.findIndex((entry) => entry === null);
  if (slot === -1) {
    sounds.error();
    return 'error';
  }
  state.grill[slot] = { ingredientId, stage: GRILL_COOKING, timeLeft: ingredient.cookSeconds, burnLeft: 0 };
  sounds.grillStart();
  return 'grill';
}

/**
 * Click a grill slot: a ready item moves onto the bowl, a burnt one is thrown away,
 * and a slot still cooking just reminds the cook to wait.
 */
export function useGrillSlot(state, slotIndex) {
  const slot = state.grill[slotIndex];
  if (!slot) return 'none';
  if (slot.stage === GRILL_READY) {
    state.bowl.push(slot.ingredientId);
    state.grill[slotIndex] = null;
    sounds.place();
    return 'place';
  }
  if (slot.stage === GRILL_BURNT) {
    state.grill[slotIndex] = null;
    sounds.trash();
    return 'trash';
  }
  return 'wait';
}

/** Take the last thing off the bowl (the cook's undo). */
export function undoBowl(state) {
  if (state.bowl.length === 0) return 'none';
  state.bowl.pop();
  sounds.trash();
  return 'undo';
}

/** Throw the whole bowl away and start the dish again. */
export function trashBowl(state) {
  if (state.bowl.length === 0) return 'none';
  state.bowl = [];
  sounds.trash();
  return 'trash';
}

/**
 * Serve the bowl at the pass. It must match one open order exactly; the earliest such
 * order is served, paid with a speed tip, and the combo grows. No match: the pass
 * shakes and nothing is scored — the bowl stays as it is.
 */
export function serveBowl(state) {
  const match = state.orders.find((order) => bowlMatchesRecipe(state.bowl, order.recipe));
  if (!match) {
    state.shake = 0.35;
    sounds.error();
    return 'error';
  }
  const patienceRatio = match.patienceLeft / match.patience;
  const tip = Math.round(match.recipe.price * 0.5 * patienceRatio);
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  const comboBonus = Math.min(10, (state.combo - 1) * 2);
  const earned = match.recipe.price + tip + comboBonus;
  state.coins += earned;
  state.served += 1;
  state.lastServe = { name: match.recipe.name, earned, time: 1.6 };
  state.orders = state.orders.filter((order) => order !== match);
  state.bowl = [];
  sounds.serve();
  sounds.coin();
  return 'serve';
}

/** One grill slot's clock: cooking counts down, ready counts down to burnt. */
function tickGrillSlot(state, slot, dt) {
  if (!slot) return;
  if (slot.stage === GRILL_COOKING) {
    slot.timeLeft -= dt;
    if (slot.timeLeft <= 0) {
      slot.stage = GRILL_READY;
      slot.burnLeft = BURN_GRACE_SECONDS;
      sounds.grillReady();
    }
  } else if (slot.stage === GRILL_READY) {
    slot.burnLeft -= dt;
    if (slot.burnLeft <= 0) slot.stage = GRILL_BURNT;
  }
}

/** A customer whose patience ran out: the ticket leaves, the combo breaks, a strike lands. */
function expireOrder(state, order) {
  state.orders = state.orders.filter((entry) => entry !== order);
  state.combo = 0;
  state.strikes += 1;
  state.flash = `${order.recipe.name} walked away!`;
  state.flashTime = 2.2;
  sounds.strike();
}

/** Advance the whole day by dt seconds. Called only while the screen is play. */
export function tickDay(state, dt) {
  state.elapsed += dt;
  state.timeLeft -= dt;
  state.shake = Math.max(0, state.shake - dt);
  state.flashTime = Math.max(0, state.flashTime - dt);
  if (state.lastServe) {
    state.lastServe.time -= dt;
    if (state.lastServe.time <= 0) state.lastServe = null;
  }

  state.nextOrderIn -= dt;
  if (state.nextOrderIn <= 0) {
    spawnOrder(state);
    state.nextOrderIn = orderGapFor(state.random, state.elapsed);
  }

  for (const slot of state.grill) tickGrillSlot(state, slot, dt);

  for (const order of [...state.orders]) {
    order.age += dt;
    order.patienceLeft -= dt;
    if (order.patienceLeft <= 0) expireOrder(state, order);
  }

  if (state.strikes >= MAX_STRIKES || state.timeLeft <= 0) {
    state.screen = SCREEN_OVER;
    state.timeLeft = Math.max(0, state.timeLeft);
    sounds.dayEnd();
  }
  return state.screen;
}
