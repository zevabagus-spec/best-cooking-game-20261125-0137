// Warung Rush — turning clicks and keys into cooking actions. The canvas is letterboxed
// into the window, so pointer positions are converted back into stage coordinates here;
// the rectangles come from render.js so a click lands exactly where things are drawn.

import { STAGE } from './config.js';
import { INGREDIENTS, INGREDIENT_ORDER } from './recipes.js';
import { addInstant, serveBowl, startGrill, trashBowl, undoBowl, useGrillSlot } from './cooking.js';
import { binRect, grillSlotRect, serveButtonRect, trashButtonRect, undoButtonRect } from './render.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './state.js';
import { setMuted } from './audio.js';

let isMuted = false;

function inside(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

/** Convert a pointer event into stage coordinates, honouring the letterboxed canvas. */
export function toStageCoordinates(canvas, event) {
  const box = canvas.getBoundingClientRect();
  const scale = Math.min(box.width / STAGE.width, box.height / STAGE.height);
  const drawnWidth = STAGE.width * scale;
  const drawnHeight = STAGE.height * scale;
  const offsetX = box.left + (box.width - drawnWidth) / 2;
  const offsetY = box.top + (box.height - drawnHeight) / 2;
  return {
    x: (event.clientX - offsetX) / scale,
    y: (event.clientY - offsetY) / scale,
  };
}

/** Use an ingredient from its counter bin: instant food scoops on, grilled food starts cooking. */
export function useIngredient(state, ingredientId) {
  const ingredient = INGREDIENTS[ingredientId];
  if (!ingredient) return 'error';
  return ingredient.kind === 'grilled' ? startGrill(state, ingredientId) : addInstant(state, ingredientId);
}

/** Handle one click in stage coordinates. Returns the action's event word. */
export function handleClick(state, point) {
  if (state.screen === SCREEN_TITLE || state.screen === SCREEN_OVER) return 'start';
  if (state.screen !== SCREEN_PLAY) return 'none';
  if (inside(point, serveButtonRect())) return serveBowl(state);
  if (inside(point, undoButtonRect())) return undoBowl(state);
  if (inside(point, trashButtonRect())) return trashBowl(state);
  for (let i = 0; i < state.grill.length; i += 1) {
    if (inside(point, grillSlotRect(i))) return useGrillSlot(state, i);
  }
  for (let i = 0; i < INGREDIENT_ORDER.length; i += 1) {
    if (inside(point, binRect(i))) return useIngredient(state, INGREDIENT_ORDER[i]);
  }
  return 'none';
}

/** Handle one key. Returns 'start' on the title/over screens, else the action's event word. */
export function handleKey(state, key) {
  if (key === 'm' || key === 'M') {
    isMuted = !isMuted;
    setMuted(isMuted);
    return 'mute';
  }
  if (state.screen === SCREEN_TITLE || state.screen === SCREEN_OVER) {
    return key === 'Enter' ? 'start' : 'none';
  }
  if (state.screen !== SCREEN_PLAY) return 'none';
  if (key === 'Enter' || key === ' ') return serveBowl(state);
  if (key === 'Backspace') return undoBowl(state);
  if (key === 'x' || key === 'X') return trashBowl(state);
  const byHotkey = INGREDIENT_ORDER.find((id) => INGREDIENTS[id].hotkey === key);
  if (byHotkey) return useIngredient(state, byHotkey);
  return 'none';
}
