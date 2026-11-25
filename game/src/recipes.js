// Warung Rush — the food: ingredient definitions and the nasi campur recipes orders ask for.
// An ingredient is either instant (scooped straight onto the bowl) or grilled (it must spend
// time on the grill first, and it can burn). A recipe is a named combination of ingredients;
// orders always name one recipe, and recipes combine the same pantry in different ways.

/** Ingredient ids in counter order, left to right. */
export const INGREDIENT_ORDER = [
  'rice',
  'rendang',
  'ayam',
  'satay',
  'egg',
  'sambal',
  'cucumber',
  'kerupuk',
];

export const INGREDIENTS = {
  rice: {
    id: 'rice',
    name: 'Nasi Putih',
    short: 'Nasi',
    hotkey: '1',
    kind: 'instant',
    colors: { main: '#fdf6e3', shade: '#e8dcc0', top: '#fffdf4' },
    blurb: 'Steamed white rice, the base of every bowl.',
  },
  rendang: {
    id: 'rendang',
    name: 'Rendang Sapi',
    short: 'Rendang',
    hotkey: '2',
    kind: 'instant',
    colors: { main: '#7a3b1e', shade: '#5d2c14', top: '#96603a' },
    blurb: 'Beef slow-braised in coconut and chilli.',
  },
  ayam: {
    id: 'ayam',
    name: 'Ayam Goreng',
    short: 'Ayam',
    hotkey: '3',
    kind: 'instant',
    colors: { main: '#d98a2b', shade: '#b06c1c', top: '#eda845' },
    blurb: 'Turmeric fried chicken, crisp and golden.',
  },
  satay: {
    id: 'satay',
    name: 'Sate Ayam',
    short: 'Sate',
    hotkey: '4',
    kind: 'grilled',
    cookSeconds: 7,
    colors: { main: '#a34d1f', shade: '#7d3a14', top: '#c97a3d' },
    blurb: 'Chicken skewers that must kiss the coals first.',
  },
  egg: {
    id: 'egg',
    name: 'Telur Ceplok',
    short: 'Telur',
    hotkey: '5',
    kind: 'grilled',
    cookSeconds: 5,
    colors: { main: '#fdfdf8', shade: '#e6e2d2', top: '#f7b731' },
    blurb: 'A sunny fried egg, fried to order on the grill plate.',
  },
  sambal: {
    id: 'sambal',
    name: 'Sambal Terasi',
    short: 'Sambal',
    hotkey: '6',
    kind: 'instant',
    colors: { main: '#c62f1d', shade: '#9c2313', top: '#e05236' },
    blurb: 'Pounding-hot shrimp-paste chilli sambal.',
  },
  cucumber: {
    id: 'cucumber',
    name: 'Lalapan',
    short: 'Lalapan',
    hotkey: '7',
    kind: 'instant',
    colors: { main: '#5da24a', shade: '#3e7d32', top: '#8fce7d' },
    blurb: 'Cool cucumber slices and basil, the fresh crunch.',
  },
  kerupuk: {
    id: 'kerupuk',
    name: 'Kerupuk',
    short: 'Kerupuk',
    hotkey: '8',
    kind: 'instant',
    colors: { main: '#f3e2c7', shade: '#dec49c', top: '#fbf0da' },
    blurb: 'Prawn crackers, the loud finish on top.',
  },
};

/**
 * A recipe: the dish name customers ask for and the exact bowl it needs. Prices roughly
 * track the work in the bowl — grilled items and double portions cost the customer more,
 * because they cost the cook more time. Two recipes ask for the same grilled item twice,
 * which fills both grill slots: start them before anything else.
 */
export const RECIPES = [
  {
    id: 'komplit',
    name: 'Nasi Campur Komplit',
    price: 24,
    items: ['rice', 'rendang', 'ayam', 'egg', 'sambal', 'cucumber'],
  },
  {
    id: 'sate',
    name: 'Nasi Sate Madura',
    price: 21,
    items: ['rice', 'satay', 'satay', 'sambal', 'cucumber', 'kerupuk'],
  },
  {
    id: 'rendang',
    name: 'Nasi Rendang Spesial',
    price: 20,
    items: ['rice', 'rendang', 'rendang', 'egg', 'sambal'],
  },
  {
    id: 'ayam',
    name: 'Nasi Ayam Rempah',
    price: 18,
    items: ['rice', 'ayam', 'ayam', 'cucumber', 'kerupuk'],
  },
  {
    id: 'telur',
    name: 'Nasi Telur Balado',
    price: 15,
    items: ['rice', 'egg', 'egg', 'sambal', 'sambal'],
  },
  {
    id: 'anak',
    name: 'Nasi Anak Kos',
    price: 12,
    items: ['rice', 'egg', 'kerupuk', 'sambal'],
  },
];

/** Count how many of each ingredient a list of ids holds, as a Map in recipe order. */
export function countItems(ids) {
  const counts = new Map();
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  return counts;
}

/** True when the bowl on the pass holds exactly what the recipe asks for, no more, no less. */
export function bowlMatchesRecipe(bowlIds, recipe) {
  const bowl = countItems(bowlIds);
  const want = countItems(recipe.items);
  if (bowl.size !== want.size) return false;
  for (const [id, n] of want) if (bowl.get(id) !== n) return false;
  return true;
}
