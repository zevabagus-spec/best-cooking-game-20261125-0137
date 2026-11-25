// A tiny seeded random number generator (mulberry32), so screenshot scenes and tests can
// replay the exact same day: same seed, same orders, same frames. The live game seeds it
// from the clock instead, so no two real services run alike.

export function makeRandom(seed) {
  let state = seed >>> 0;
  return function nextRandom() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick one element of a non-empty array with the given generator. */
export function pickRandom(random, list) {
  return list[Math.floor(random() * list.length)];
}

/** A random number between min and max (inclusive of min, exclusive of max). */
export function randomBetween(random, min, max) {
  return min + random() * (max - min);
}
