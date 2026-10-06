/** Small deterministic helpers so the procedural eye looks the same on every visit. */

export function makeRng(seed = 1) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Tileable value-noise (wraps in x with period `px` and in y with period `py`).
 * Returns a function noise(x, y) -> 0..1 where x, y are in grid cells.
 */
export function makeNoise(seed, px = 64, py = 64) {
  const rng = makeRng(seed);
  const grid = new Float32Array(px * py);
  for (let i = 0; i < grid.length; i++) grid[i] = rng();
  const fade = (t) => t * t * (3 - 2 * t);
  const at = (x, y) => grid[(((y % py) + py) % py) * px + (((x % px) + px) % px)];
  return function noise(x, y) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = fade(x - xi);
    const fy = fade(y - yi);
    const a = at(xi, yi);
    const b = at(xi + 1, yi);
    const c = at(xi, yi + 1);
    const d = at(xi + 1, yi + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
}

/** Fractal (multi-octave) noise built on top of a tileable noise. */
export function makeFbm(seed, px = 32, py = 32, octaves = 4) {
  const layers = [];
  for (let o = 0; o < octaves; o++) layers.push(makeNoise(seed + o * 101, px << o, py << o));
  return function fbm(x, y) {
    let sum = 0;
    let amp = 0.5;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      const f = 1 << o;
      sum += layers[o](x * f, y * f) * amp;
      norm += amp;
      amp *= 0.5;
    }
    return sum / norm;
  };
}
