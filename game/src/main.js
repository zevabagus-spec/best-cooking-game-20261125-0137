// Warung Rush — boot and the frame loop. Owns the canvas, the clock and the screen flow
// (title → play → over → title …); the rules live in cooking.js, the drawing in render.js.
// With ?shot=<scene>&seed=<n> it instead stages one frozen scene from shots.js and draws
// exactly one frame of it — that is how the screenshots in screenshots/ were taken.

import { STAGE } from './config.js';
import { createDay, SCREEN_PLAY } from './state.js';
import { tickDay } from './cooking.js';
import { drawScene } from './render.js';
import { handleClick, handleKey, toStageCoordinates } from './input.js';
import { SHOT_TIME, buildShotScene } from './shots.js';
import { makeRandom } from './random.js';
import { setMuted } from './audio.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') ?? '1') || 1;

function announce(message) {
  if (status) status.textContent = message;
}

function fitCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = STAGE.width * dpr;
  canvas.height = STAGE.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

if (shotName) {
  // Screenshot mode: one staged frame, no clock, no sound (staging ticks the grill,
  // which would otherwise chirp through a context no gesture ever unlocked).
  setMuted(true);
  fitCanvas();
  const state = buildShotScene(shotName, seed);
  drawScene(ctx, state, SHOT_TIME[shotName] ?? 1);
  announce(`Warung Rush screenshot scene: ${shotName}`);
} else {
  let state = createDay(makeRandom((Date.now() % 2147483647) + 1));
  let lastTimestamp = performance.now();

  function startDay() {
    state = createDay(makeRandom((Date.now() % 2147483647) + 1));
    state.screen = SCREEN_PLAY;
    announce('Service started. First orders are coming in.');
  }

  canvas.addEventListener('pointerdown', (event) => {
    const point = toStageCoordinates(canvas, event);
    if (handleClick(state, point) === 'start') startDay();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Backspace') event.preventDefault();
    if (handleKey(state, event.key) === 'start') startDay();
  });

  document.addEventListener('visibilitychange', () => {
    lastTimestamp = performance.now();
  });

  fitCanvas();
  window.addEventListener('resize', fitCanvas);

  function frame(timestamp) {
    const dt = Math.min(0.05, Math.max(0, (timestamp - lastTimestamp) / 1000));
    lastTimestamp = timestamp;
    if (state.screen === SCREEN_PLAY) tickDay(state, dt);
    drawScene(ctx, state, timestamp / 1000);
    window.requestAnimationFrame(frame);
  }
  window.requestAnimationFrame(frame);
  announce('Warung Rush. Press Enter or click to open the stall.');
}
