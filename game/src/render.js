// Warung Rush — every pixel of the game is drawn here, on one canvas, from the state.
// No images: the kitchen, the food and the tickets are all canvas shapes, so the game is
// fully offline and the screenshots are renders of this very code. Geometry helpers are
// exported so input.js clicks land exactly where things are drawn.

import { BIN, BURN_GRACE_SECONDS, DAY_SECONDS, GRILL_SLOTS, LAYOUT, MAX_STRIKES, PALETTE, STAGE, TICKET } from './config.js';
import { INGREDIENTS, INGREDIENT_ORDER, countItems } from './recipes.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, activeOrder } from './state.js';
import { GRILL_BURNT, GRILL_COOKING, GRILL_READY } from './cooking.js';
import { bowlMatchesRecipe } from './recipes.js';

export { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE };

// ---------- geometry shared with input.js ----------

export function binRect(index) {
  const area = LAYOUT.counter;
  return {
    x: area.x + 18 + index * (BIN.width + BIN.gap),
    y: area.y + 62,
    width: BIN.width,
    height: BIN.height,
  };
}

export function grillSlotRect(index) {
  const area = LAYOUT.grill;
  return { x: area.x + 24 + index * 176, y: area.y + 56, width: 160, height: 128 };
}

export function serveButtonRect() {
  const area = LAYOUT.pass;
  return { x: area.x + 48, y: area.y + 356, width: area.width - 96, height: 64 };
}

export function undoButtonRect() {
  const area = LAYOUT.assembly;
  return { x: area.x + 24, y: area.y + 188, width: 104, height: 34 };
}

export function trashButtonRect() {
  const area = LAYOUT.assembly;
  return { x: area.x + 140, y: area.y + 188, width: 104, height: 34 };
}

export function ticketRect(index) {
  const area = LAYOUT.board;
  return {
    x: area.x + 14 + index * (TICKET.width + TICKET.gap),
    y: area.y + 42,
    width: TICKET.width,
    height: TICKET.height,
  };
}

// ---------- small drawing helpers ----------

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function panel(ctx, rect, label, labelColor = PALETTE.cream) {
  ctx.fillStyle = 'rgba(58, 36, 16, 0.16)';
  roundRect(ctx, rect.x + 3, rect.y + 5, rect.width, rect.height, 14);
  ctx.fill();
  ctx.fillStyle = PALETTE.wood;
  roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 14);
  ctx.fill();
  ctx.fillStyle = PALETTE.woodLight;
  roundRect(ctx, rect.x, rect.y, rect.width, 34, 14);
  ctx.fill();
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(rect.x, rect.y + 20, rect.width, 14);
  ctx.fillStyle = labelColor;
  ctx.font = 'bold 17px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, rect.x + 16, rect.y + 18);
}

function text(ctx, value, x, y, font, color, align = 'left') {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

const FONT = '"Trebuchet MS", Verdana, sans-serif';

// ---------- the food itself ----------

/** Draw one ingredient's portrait centred at (cx, cy), about `size` px across. */
export function drawIngredientArt(ctx, id, cx, cy, size) {
  const c = INGREDIENTS[id].colors;
  const s = size / 100;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  if (id === 'rice') {
    ctx.fillStyle = c.shade;
    ctx.beginPath(); ctx.ellipse(0, 16, 40, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.main;
    ctx.beginPath(); ctx.ellipse(0, 6, 38, 20, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = c.shade;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(0, 6, 38, 20, 0, Math.PI, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = c.top;
    for (const [x, y] of [[-18, -2], [0, -8], [18, -2], [-8, 2], [10, 3]]) {
      ctx.beginPath(); ctx.ellipse(x, y, 8, 4, 0.4, 0, Math.PI * 2); ctx.fill();
    }
  } else if (id === 'rendang') {
    for (const [x, y, r] of [[-20, 4, 17], [4, -8, 19], [22, 8, 15], [-2, 14, 16]]) {
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.top;
      ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.35, r * 0.45, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = c.shade;
    ctx.beginPath(); ctx.ellipse(0, 22, 34, 7, 0, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'ayam') {
    ctx.fillStyle = c.main;
    ctx.beginPath(); ctx.ellipse(-4, -2, 30, 24, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.top;
    ctx.beginPath(); ctx.ellipse(-10, -10, 18, 12, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f7ead2';
    ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(16, 10); ctx.lineTo(34, 26); ctx.stroke();
    ctx.fillStyle = '#f7ead2';
    ctx.beginPath(); ctx.arc(36, 28, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(28, 32, 7, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'satay') {
    ctx.strokeStyle = '#d9b380';
    ctx.lineWidth = 5;
    for (const dx of [-20, 0, 20]) {
      ctx.beginPath(); ctx.moveTo(dx - 8, 34); ctx.lineTo(dx + 6, -30); ctx.stroke();
      for (const t of [-18, -2, 14]) {
        ctx.fillStyle = c.main;
        ctx.beginPath();
        ctx.arc(dx + 6 + (t + 30) * -0.22, t, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c.top;
        ctx.beginPath();
        ctx.arc(dx + 2 + (t + 30) * -0.22, t - 3, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (id === 'egg') {
    ctx.fillStyle = c.main;
    ctx.beginPath();
    ctx.moveTo(-34, 8);
    ctx.bezierCurveTo(-38, -16, -14, -26, 2, -22);
    ctx.bezierCurveTo(24, -28, 38, -8, 30, 8);
    ctx.bezierCurveTo(24, 24, -24, 26, -34, 8);
    ctx.fill();
    ctx.fillStyle = c.top;
    ctx.beginPath(); ctx.arc(2, 0, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd97a';
    ctx.beginPath(); ctx.arc(-3, -4, 6, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'sambal') {
    ctx.fillStyle = c.shade;
    ctx.beginPath(); ctx.ellipse(0, 14, 34, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.main;
    ctx.beginPath(); ctx.ellipse(0, 4, 32, 15, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.top;
    for (const [x, y] of [[-14, -2], [4, -7], [16, 0]]) {
      ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = PALETTE.leaf;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(6, -12); ctx.quadraticCurveTo(14, -22, 24, -20); ctx.stroke();
  } else if (id === 'cucumber') {
    for (const [x, y, a] of [[-18, 2, 0.3], [4, -8, -0.2], [20, 8, 0.5]]) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a);
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.ellipse(0, 0, 17, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#dff0d2';
      ctx.beginPath(); ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.top;
      ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = c.main;
    ctx.beginPath(); ctx.ellipse(-26, 16, 10, 6, 0.6, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'kerupuk') {
    for (const [x, y, r, a] of [[-16, 0, 19, 0.4], [14, -6, 21, -0.3], [2, 14, 17, 0.9]]) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a);
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.72, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = c.shade;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.66, r * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}

/** Draw the bowl with its layers stacked: rice at the bottom, toppings in serve order. */
export function drawBowl(ctx, bowlIds, cx, cy, radius) {
  ctx.save();
  ctx.translate(cx, cy);
  // shadow + bowl body
  ctx.fillStyle = 'rgba(40, 22, 6, 0.25)';
  ctx.beginPath(); ctx.ellipse(0, radius * 0.72, radius * 1.02, radius * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#274e7d';
  ctx.beginPath();
  ctx.moveTo(-radius, -radius * 0.25);
  ctx.quadraticCurveTo(0, radius * 1.05, radius, -radius * 0.25);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3a6ea8';
  ctx.beginPath(); ctx.ellipse(0, -radius * 0.25, radius, radius * 0.3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fdf6e3';
  ctx.beginPath(); ctx.ellipse(0, -radius * 0.28, radius * 0.88, radius * 0.24, 0, 0, Math.PI * 2); ctx.fill();
  // toppings: one portrait per item, arranged on the rice in the order they were added
  const spots = [
    [-0.42, -0.34], [0.4, -0.36], [0, -0.5], [-0.2, -0.16], [0.26, -0.14], [0, -0.3],
  ];
  bowlIds.slice(0, 12).forEach((id, i) => {
    const [fx, fy] = spots[i % spots.length];
    const layer = Math.floor(i / spots.length);
    drawIngredientArt(ctx, id, fx * radius, (fy - layer * 0.1) * radius, radius * 0.52);
  });
  if (bowlIds.length === 0) {
    ctx.fillStyle = 'rgba(107, 84, 58, 0.65)';
    ctx.font = `italic ${Math.round(radius * 0.24)}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('empty bowl', 0, radius * 0.42);
  }
  ctx.restore();
}

function drawSteam(ctx, cx, cy, time, scale = 1) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 252, 240, 0.55)';
  ctx.lineWidth = 4 * scale;
  ctx.lineCap = 'round';
  for (const dx of [-16, 0, 16]) {
    const wobble = Math.sin(time * 2.2 + dx) * 5;
    ctx.beginPath();
    ctx.moveTo(cx + dx * scale, cy);
    ctx.quadraticCurveTo(cx + (dx + wobble) * scale, cy - 16 * scale, cx + dx * scale, cy - 32 * scale);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- scene sections ----------

function drawBackdrop(ctx, state, time) {
  const grad = ctx.createLinearGradient(0, 0, 0, STAGE.height);
  grad.addColorStop(0, PALETTE.wallTop);
  grad.addColorStop(0.42, PALETTE.wallBottom);
  grad.addColorStop(0.421, '#b98b52');
  grad.addColorStop(1, '#96683a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  // hanging sign
  ctx.fillStyle = PALETTE.woodDark;
  roundRect(ctx, 468, 6, 344, 52, 10);
  ctx.fill();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2.5;
  roundRect(ctx, 474, 11, 332, 42, 8);
  ctx.stroke();
  text(ctx, 'WARUNG RUSH', 640, 33, `bold 27px ${FONT}`, PALETTE.gold, 'center');
  // string lights
  for (let i = 0; i < 12; i += 1) {
    const x = 40 + i * 108;
    const y = 76 + Math.sin(i * 1.4) * 4;
    ctx.fillStyle = i % 2 ? '#ffd97a' : '#ff9d5c';
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
  }
  void state; void time;
}

function drawHeader(ctx, state) {
  // day timer bar, left
  const barX = 24; const barY = 22; const barW = 300; const barH = 20;
  ctx.fillStyle = 'rgba(58,36,16,0.35)';
  roundRect(ctx, barX, barY, barW, barH, 10); ctx.fill();
  const ratio = Math.max(0, state.timeLeft / DAY_SECONDS);
  ctx.fillStyle = ratio > 0.35 ? PALETTE.leafLight : ratio > 0.15 ? PALETTE.gold : PALETTE.red;
  if (ratio > 0) { roundRect(ctx, barX, barY, barW * ratio, barH, 10); ctx.fill(); }
  const mm = Math.floor(Math.max(0, state.timeLeft) / 60);
  const ss = Math.floor(Math.max(0, state.timeLeft) % 60);
  text(ctx, `SERVICE ${mm}:${String(ss).padStart(2, '0')}`, barX, barY - 8 + 2, `bold 14px ${FONT}`, PALETTE.ink);
  // coins + served, right
  text(ctx, `Rp ${state.coins}`, 1256, 24, `bold 26px ${FONT}`, PALETTE.ink, 'right');
  text(ctx, `${state.served} served`, 1256, 50, `bold 14px ${FONT}`, PALETTE.inkSoft, 'right');
  // combo, under the day bar
  if (state.combo >= 2) {
    text(ctx, `COMBO x${state.combo}`, 24, 58, `bold 19px ${FONT}`, PALETTE.accent);
  }
  // strikes as chillies, right of the sign
  for (let i = 0; i < MAX_STRIKES; i += 1) {
    const x = 852 + i * 30;
    ctx.fillStyle = i < state.strikes ? PALETTE.red : 'rgba(58,36,16,0.25)';
    ctx.beginPath(); ctx.ellipse(x, 32, 7, 12, 0.6, 0, Math.PI * 2); ctx.fill();
  }
}

function drawTicket(ctx, order, index, time) {
  const rect = ticketRect(index);
  ctx.save();
  ctx.translate(rect.x, rect.y);
  ctx.fillStyle = 'rgba(40,22,6,0.28)';
  roundRect(ctx, 3, 5, rect.width, rect.height, 8); ctx.fill();
  ctx.fillStyle = PALETTE.paper;
  roundRect(ctx, 0, 0, rect.width, rect.height, 8); ctx.fill();
  ctx.fillStyle = PALETTE.accent;
  ctx.beginPath(); ctx.arc(rect.width / 2, 10, 6, 0, Math.PI * 2); ctx.fill();
  text(ctx, `#${order.id} ${order.recipe.name}`, 14, 28, `bold 17px ${FONT}`, PALETTE.ink);
  // ingredient chips with counts, one row: every recipe has at most six distinct items
  const counts = countItems(order.recipe.items);
  let cx = 14;
  const cy = 60;
  for (const [id, n] of counts) {
    drawIngredientArt(ctx, id, cx + 19, cy, 38);
    if (n > 1) {
      ctx.fillStyle = PALETTE.accent;
      ctx.beginPath(); ctx.arc(cx + 34, cy - 13, 10, 0, Math.PI * 2); ctx.fill();
      text(ctx, `${n}`, cx + 34, cy - 12, `bold 13px ${FONT}`, '#fff', 'center');
    }
    text(ctx, INGREDIENTS[id].short, cx + 19, cy + 28, `11px ${FONT}`, PALETTE.inkSoft, 'center');
    cx += 47;
  }
  // patience bar
  const ratio = Math.max(0, order.patienceLeft / order.patience);
  const urgent = ratio < 0.3;
  ctx.fillStyle = '#e8dcc0';
  roundRect(ctx, 14, rect.height - 24, rect.width - 28, 12, 6); ctx.fill();
  ctx.fillStyle = urgent ? PALETTE.red : ratio < 0.6 ? PALETTE.gold : PALETTE.leafLight;
  if (ratio > 0) { roundRect(ctx, 14, rect.height - 24, (rect.width - 28) * ratio, 12, 6); ctx.fill(); }
  if (urgent && Math.sin(time * 10) > 0) {
    text(ctx, 'HURRY!', rect.width - 16, rect.height - 38, `bold 13px ${FONT}`, PALETTE.red, 'right');
  }
  text(ctx, `Rp ${order.recipe.price}`, rect.width - 16, 28, `bold 16px ${FONT}`, PALETTE.teal, 'right');
  ctx.restore();
}

function drawBoard(ctx, state, time) {
  panel(ctx, LAYOUT.board, 'ORDER BOARD · PESANAN');
  if (state.orders.length === 0) {
    text(ctx, 'No orders yet — the lunch crowd is coming…', LAYOUT.board.x + 24, LAYOUT.board.y + 108, `italic 18px ${FONT}`, PALETTE.cream);
  }
  state.orders.forEach((order, i) => drawTicket(ctx, order, i, time));
}

function drawCounter(ctx, state) {
  panel(ctx, LAYOUT.counter, 'COUNTER · BAHAN — click or press 1–8');
  INGREDIENT_ORDER.forEach((id, i) => {
    const rect = binRect(i);
    const ingredient = INGREDIENTS[id];
    ctx.fillStyle = 'rgba(40,22,6,0.25)';
    roundRect(ctx, rect.x + 2, rect.y + 4, rect.width, rect.height, 10); ctx.fill();
    ctx.fillStyle = PALETTE.cream;
    roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 10); ctx.fill();
    ctx.strokeStyle = ingredient.kind === 'grilled' ? PALETTE.accent : PALETTE.paperEdge;
    ctx.lineWidth = 2;
    roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 10); ctx.stroke();
    drawIngredientArt(ctx, id, rect.x + rect.width / 2, rect.y + 38, 62);
    text(ctx, ingredient.short, rect.x + rect.width / 2, rect.y + 76, `bold 12px ${FONT}`, PALETTE.ink, 'center');
    // hotkey badge
    ctx.fillStyle = PALETTE.ink;
    ctx.beginPath(); ctx.arc(rect.x + 14, rect.y + 14, 10, 0, Math.PI * 2); ctx.fill();
    text(ctx, ingredient.hotkey, rect.x + 14, rect.y + 15, `bold 12px ${FONT}`, '#fff', 'center');
    if (ingredient.kind === 'grilled') {
      text(ctx, 'GRILL', rect.x + rect.width / 2, rect.y + 90, `bold 9px ${FONT}`, PALETTE.accent, 'center');
    }
  });
  text(ctx, 'Sate & telur cook on the grill first — start them early, then build the bowl!',
    LAYOUT.counter.x + 18, LAYOUT.counter.y + 190, `italic 14px ${FONT}`, PALETTE.cream);
  void state;
}

function drawGrill(ctx, state, time) {
  panel(ctx, LAYOUT.grill, 'GRILL · PANGGANGAN');
  for (let i = 0; i < GRILL_SLOTS; i += 1) {
    const rect = grillSlotRect(i);
    const slot = state.grill[i];
    ctx.fillStyle = '#2e2a26';
    roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 12); ctx.fill();
    // coals
    for (let c = 0; c < 7; c += 1) {
      const cx = rect.x + 22 + c * 20;
      const cy = rect.y + rect.height - 18 + (c % 2) * 5;
      const glow = slot && slot.stage !== 'burnt' ? 0.55 + Math.sin(time * 6 + c * 1.7) * 0.25 : 0.3;
      ctx.fillStyle = `rgba(255, ${Math.round(110 + glow * 90)}, 40, ${glow})`;
      ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
    }
    if (!slot) {
      text(ctx, 'empty slot', rect.x + rect.width / 2, rect.y + 52, `italic 14px ${FONT}`, '#b8a888', 'center');
      continue;
    }
    drawIngredientArt(ctx, slot.ingredientId, rect.x + rect.width / 2, rect.y + 46, 74);
    if (slot.stage === GRILL_COOKING) {
      const total = INGREDIENTS[slot.ingredientId].cookSeconds;
      const done = 1 - Math.max(0, slot.timeLeft) / total;
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(rect.x + rect.width / 2, rect.y + 46, 40, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = PALETTE.gold;
      ctx.beginPath(); ctx.arc(rect.x + rect.width / 2, rect.y + 46, 40, -Math.PI / 2, -Math.PI / 2 + done * Math.PI * 2); ctx.stroke();
      text(ctx, `${Math.ceil(slot.timeLeft)}s`, rect.x + rect.width / 2, rect.y + 97, `bold 15px ${FONT}`, '#ffd97a', 'center');
    } else if (slot.stage === GRILL_READY) {
      const pulse = 1 + Math.sin(time * 6) * 0.06;
      ctx.save();
      ctx.translate(rect.x + rect.width / 2, rect.y + 102);
      ctx.scale(pulse, pulse);
      ctx.fillStyle = PALETTE.leafLight;
      roundRect(ctx, -44, -13, 88, 26, 13); ctx.fill();
      text(ctx, 'READY!', 0, 1, `bold 15px ${FONT}`, '#fff', 'center');
      ctx.restore();
      // burn countdown sliver
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(rect.x + 14, rect.y + rect.height - 8, rect.width - 28, 4);
      ctx.fillStyle = PALETTE.red;
      ctx.fillRect(rect.x + 14, rect.y + rect.height - 8, (rect.width - 28) * Math.max(0, slot.burnLeft / BURN_GRACE_SECONDS), 4);
    } else if (slot.stage === GRILL_BURNT) {
      ctx.fillStyle = 'rgba(10,10,10,0.45)';
      roundRect(ctx, rect.x + 8, rect.y + 8, rect.width - 16, 84, 10); ctx.fill();
      text(ctx, 'BURNT!', rect.x + rect.width / 2, rect.y + 102, `bold 16px ${FONT}`, '#ff7a5c', 'center');
      text(ctx, 'click to toss', rect.x + rect.width / 2, rect.y + 120, `11px ${FONT}`, '#b8a888', 'center');
    }
  }
}

function drawAssembly(ctx, state) {
  panel(ctx, LAYOUT.assembly, 'ASSEMBLY · RACIK');
  const area = LAYOUT.assembly;
  drawBowl(ctx, state.bowl, area.x + 108, area.y + 108, 74);
  // checklist for the order being built
  const order = activeOrder(state);
  const x = area.x + 204;
  if (!order) {
    text(ctx, 'Waiting for', x, area.y + 74, `14px ${FONT}`, PALETTE.cream);
    text(ctx, 'an order…', x, area.y + 96, `14px ${FONT}`, PALETTE.cream);
  } else {
    text(ctx, `Building: #${order.id}`, x, area.y + 54, `bold 14px ${FONT}`, PALETTE.gold);
    const want = countItems(order.recipe.items);
    const have = countItems(state.bowl);
    let y = area.y + 76;
    for (const [id, n] of want) {
      const got = Math.min(n, have.get(id) ?? 0);
      const done = got >= n;
      drawIngredientArt(ctx, id, x + 10, y, 22);
      text(ctx, `${INGREDIENTS[id].short} ${got}/${n}`, x + 26, y + 1, `13px ${FONT}`, done ? '#a8e08a' : PALETTE.cream);
      if (done) text(ctx, '✓', x + 148, y + 1, `bold 14px ${FONT}`, '#a8e08a');
      y += 21;
    }
    const extra = state.bowl.filter((id) => !want.has(id)).length;
    if (extra > 0) text(ctx, `${extra} not in this order!`, area.x + 108, area.y + 172, `bold 12px ${FONT}`, '#ff9d5c', 'center');
  }
  // undo / trash buttons
  for (const [rect, label] of [[undoButtonRect(), 'Undo'], [trashButtonRect(), 'Trash']]) {
    ctx.fillStyle = PALETTE.woodDark;
    roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 8); ctx.fill();
    text(ctx, label, rect.x + rect.width / 2, rect.y + rect.height / 2 + 1, `bold 14px ${FONT}`, PALETTE.cream, 'center');
  }
}

function drawPass(ctx, state, time) {
  panel(ctx, LAYOUT.pass, 'PASS · SAJIKAN');
  const area = LAYOUT.pass;
  const cx = area.x + area.width / 2;
  const readyOrder = state.orders.find((order) => bowlMatchesRecipe(state.bowl, order.recipe));
  // the serving plate
  ctx.fillStyle = 'rgba(40,22,6,0.25)';
  ctx.beginPath(); ctx.ellipse(cx, 510, 150, 30, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f4ead2';
  ctx.beginPath(); ctx.ellipse(cx, 502, 148, 34, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff8ea';
  ctx.beginPath(); ctx.ellipse(cx, 498, 118, 26, 0, 0, Math.PI * 2); ctx.fill();
  if (readyOrder) {
    drawBowl(ctx, state.bowl, cx, 476, 92);
    drawSteam(ctx, cx, 420, time);
    text(ctx, 'PLATE READY TO SERVE!', cx, 352, `bold 21px ${FONT}`, '#a8e08a', 'center');
    text(ctx, `#${readyOrder.id} ${readyOrder.recipe.name} · Rp ${readyOrder.recipe.price}`, cx, 378, `15px ${FONT}`, PALETTE.cream, 'center');
  } else if (state.bowl.length > 0) {
    text(ctx, 'Not an order yet…', cx, 404, `italic 17px ${FONT}`, PALETTE.cream, 'center');
    text(ctx, 'match a ticket exactly,', cx, 428, `italic 15px ${FONT}`, PALETTE.cream, 'center');
    text(ctx, 'then serve it hot.', cx, 450, `italic 15px ${FONT}`, PALETTE.cream, 'center');
  } else {
    text(ctx, 'The pass is clear.', cx, 404, `italic 17px ${FONT}`, PALETTE.cream, 'center');
    text(ctx, 'Build a bowl to an order,', cx, 428, `italic 15px ${FONT}`, PALETTE.cream, 'center');
    text(ctx, 'and a steaming plate lands here.', cx, 450, `italic 15px ${FONT}`, PALETTE.cream, 'center');
  }
  // serve button
  const btn = serveButtonRect();
  const shakeX = state.shake > 0 ? Math.sin(time * 60) * 4 * state.shake : 0;
  ctx.save();
  ctx.translate(shakeX, 0);
  ctx.fillStyle = readyOrder ? PALETTE.accent : '#8a6a4a';
  roundRect(ctx, btn.x, btn.y, btn.width, btn.height, 12); ctx.fill();
  ctx.fillStyle = readyOrder ? PALETTE.accentDark : '#6f563d';
  roundRect(ctx, btn.x, btn.y + btn.height - 10, btn.width, 10, 5); ctx.fill();
  text(ctx, 'SERVE  ⏎', btn.x + btn.width / 2, btn.y + btn.height / 2, `bold 26px ${FONT}`, '#fff', 'center');
  ctx.restore();
  if (state.lastServe) {
    const rise = (1.6 - state.lastServe.time) * 22;
    text(ctx, `+Rp ${state.lastServe.earned}`, cx, 330 - rise, `bold 22px ${FONT}`, PALETTE.gold, 'center');
  }
  if (state.flashTime > 0) {
    text(ctx, state.flash, cx, area.y + 44, `bold 16px ${FONT}`, '#ff9d5c', 'center');
  }
}

function drawTitleOverlay(ctx, state, time) {
  ctx.fillStyle = 'rgba(43, 26, 10, 0.62)';
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  const cx = STAGE.width / 2;
  drawBowl(ctx, ['rice', 'rendang', 'egg', 'sambal', 'cucumber', 'kerupuk'], cx, 216, 52);
  drawSteam(ctx, cx, 168, time);
  text(ctx, 'WARUNG RUSH', cx, 292, `bold 64px ${FONT}`, PALETTE.gold, 'center');
  text(ctx, 'Nasi Campur Kitchen', cx, 338, `bold 26px ${FONT}`, PALETTE.cream, 'center');
  ctx.fillStyle = 'rgba(30, 18, 6, 0.55)';
  roundRect(ctx, cx - 430, 384, 860, 88, 12); ctx.fill();
  text(ctx, 'The lunch crowd is coming. Build each nasi campur bowl to its ticket:', cx, 402, `19px ${FONT}`, '#fff', 'center');
  text(ctx, 'sate and telur cook on the grill first, everything else scoops straight on.', cx, 428, `19px ${FONT}`, '#fff', 'center');
  text(ctx, 'Serve fast for tips and combos — three walk-aways end the day.', cx, 454, `19px ${FONT}`, '#fff', 'center');
  const pulse = 1 + Math.sin(time * 4) * 0.03;
  ctx.save();
  ctx.translate(cx, 528);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = PALETTE.accent;
  roundRect(ctx, -170, -30, 340, 60, 14); ctx.fill();
  text(ctx, 'CLICK OR PRESS ENTER TO OPEN', 0, 2, `bold 19px ${FONT}`, '#fff', 'center');
  ctx.restore();
  text(ctx, 'Mouse: click bins, grill and SERVE · Keys: 1–8 add, Enter serve, Bksp undo, X trash, M mute', cx, 606, `15px ${FONT}`, '#e8dcc0', 'center');
  void state;
}

function drawOverOverlay(ctx, state) {
  ctx.fillStyle = 'rgba(43, 26, 10, 0.66)';
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  const cx = STAGE.width / 2;
  text(ctx, 'SERVICE OVER', cx, 250, `bold 52px ${FONT}`, PALETTE.gold, 'center');
  const reason = state.strikes >= 3 ? 'Three customers walked away hungry.' : 'The day clock ran out.';
  text(ctx, reason, cx, 300, `19px ${FONT}`, '#fff', 'center');
  text(ctx, `Takings  Rp ${state.coins}`, cx, 368, `bold 30px ${FONT}`, PALETTE.cream, 'center');
  text(ctx, `${state.served} bowls served · best combo x${state.bestCombo}`, cx, 408, `20px ${FONT}`, PALETTE.cream, 'center');
  const rating = state.coins >= 320 ? '★ Warung legend!' : state.coins >= 220 ? '★ A beloved neighbourhood stall' : state.coins >= 120 ? '★ A solid day at the stall' : '★ Every cook starts somewhere';
  text(ctx, rating, cx, 452, `bold 22px ${FONT}`, PALETTE.gold, 'center');
  text(ctx, 'Press Enter or click to run another service', cx, 528, `17px ${FONT}`, '#e8dcc0', 'center');
}

/** Draw the whole scene for the state's screen. `time` drives only cosmetic animation. */
export function drawScene(ctx, state, time) {
  drawBackdrop(ctx, state, time);
  drawHeader(ctx, state);
  drawBoard(ctx, state, time);
  drawCounter(ctx, state);
  drawGrill(ctx, state, time);
  drawAssembly(ctx, state);
  drawPass(ctx, state, time);
  if (state.screen === SCREEN_TITLE) drawTitleOverlay(ctx, state, time);
  if (state.screen === SCREEN_OVER) drawOverOverlay(ctx, state);
}
