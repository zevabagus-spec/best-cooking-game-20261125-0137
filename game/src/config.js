// Warung Rush — shared constants: stage size, layout rectangles, timing and palette.
// Everything the other modules agree on lives here so the scene has one source of truth.

export const STAGE = { width: 1280, height: 800 };

/** The day length in seconds; the rush bar across the top counts it down. */
export const DAY_SECONDS = 150;

/** How many unhappy customers end the day early. */
export const MAX_STRIKES = 3;

/** Orders are never allowed to crowd the board past this many tickets. */
export const MAX_OPEN_ORDERS = 4;

/** Grill slots: satay skewers and fried eggs cook here, two at a time. */
export const GRILL_SLOTS = 2;

/** Seconds an item may sit finished on the grill before it burns. */
export const BURN_GRACE_SECONDS = 6;

// Layout rectangles (x, y, width, height) in stage coordinates.
export const LAYOUT = {
  header: { x: 0, y: 0, width: 1280, height: 64 },
  board: { x: 24, y: 84, width: 1232, height: 196 },
  counter: { x: 24, y: 300, width: 792, height: 220 },
  grill: { x: 24, y: 540, width: 384, height: 236 },
  assembly: { x: 432, y: 540, width: 384, height: 236 },
  pass: { x: 840, y: 300, width: 416, height: 476 },
};

/** One order ticket's size on the board. */
export const TICKET = { width: 292, height: 148, gap: 16 };

/** Ingredient bins sit in a row on the counter, this size each. */
export const BIN = { width: 84, height: 96, gap: 12 };

export const PALETTE = {
  wallTop: '#f7e3bd',
  wallBottom: '#eec98f',
  woodDark: '#7a4a21',
  wood: '#a06a35',
  woodLight: '#c08b4d',
  counterTop: '#8a5a2e',
  paper: '#fff8ea',
  paperEdge: '#e5d3ac',
  ink: '#3a2a18',
  inkSoft: '#6b543a',
  accent: '#d9481c',
  accentDark: '#a93312',
  leaf: '#3e7d32',
  leafLight: '#5da24a',
  gold: '#f2b234',
  cream: '#fff3d6',
  red: '#c62f1d',
  teal: '#1f7a72',
};
