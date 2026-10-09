/**
 * Mulberry32 Deterministic Seeded Pseudo-Random Number Generator
 * Allows 100% reproducible problem sets, test keys, and verifiable random generation.
 */

export function createPRNG(seed = Date.now()) {
  let s = (Math.trunc(seed) ^ 0xdeadbeef) >>> 0;

  function next() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function nextInt(min, max) {
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    return Math.floor(next() * (hi - lo + 1)) + lo;
  }

  function choice(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(next() * array.length)];
  }

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  return {
    next,
    nextInt,
    choice,
    shuffle,
    getSeed: () => seed,
  };
}
