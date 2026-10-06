/**
 * FUNDUS DATA — the 2D "map" of the back of the eye.
 *
 * Everything here lives in fundus coordinates (millimetres across the retina, u = towards
 * the nose, v = upwards). The same data drives:
 *   - the 3D retina (vessel tubes and glowing nerve fibres),
 *   - the 2D fundus photograph and OCT scan in the Diagnosis Clinic,
 *   - the visual-field map (which part of your vision each nerve fibre carries).
 * Because every view reads the same data, the views always agree with each other.
 */
import { DIMS } from '../config/anatomy.js';
import { makeRng } from './random.js';

const F = DIMS.fovea;
const D = DIMS.disc;

// ---------------------------------------------------------------------------------------------
// Retinal blood vessels
// ---------------------------------------------------------------------------------------------

function catmull(points, step = 0.18) {
  const out = [];
  const p = [points[0], ...points, points[points.length - 1]];
  for (let i = 1; i < p.length - 2; i++) {
    const [p0, p1, p2, p3] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
    const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const n = Math.max(2, Math.ceil(len / step));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

const TRUNKS = {
  // waypoints in fundus mm; the disc centre is prepended automatically
  superotemporal: [[2.7, 1.1], [1.2, 2.6], [-1.5, 3.2], [-4.5, 3.1], [-8, 2.4], [-12.5, 1.4]],
  inferotemporal: [[2.7, -0.9], [1.2, -3.0], [-1.5, -3.8], [-4.5, -3.7], [-8, -2.9], [-12.5, -1.9]],
  superonasal: [[3.4, 1.1], [5.0, 2.6], [8.0, 4.6], [11.8, 7.2]],
  inferonasal: [[3.4, -0.8], [5.0, -2.7], [8.0, -4.8], [11.8, -7.4]],
  nasal: [[4.1, 0.3], [6.5, 0.7], [10, 0.9], [13.5, 1.6]],
};

/**
 * Generate the vessel network. Returns an array of polylines:
 * { kind: 'artery'|'vein', pts: [[u,v]...], w: [diameter mm per point], order }
 */
export function generateVessels(seed = 7) {
  const rng = makeRng(seed);
  const vessels = [];
  const limit = DIMS.fundusPatchRadius - 0.8;

  function grow(kind, start, dir, width, order, length) {
    const pts = [start];
    const w = [width];
    let [x, y] = start;
    let a = Math.atan2(dir[1], dir[0]);
    const step = 0.16;
    const n = Math.floor(length / step);
    let curl = (rng() - 0.5) * 0.05;
    for (let i = 0; i < n; i++) {
      a += curl + (rng() - 0.5) * 0.045;
      curl = curl * 0.96 + (rng() - 0.5) * 0.006;
      // steer away from the fovea (the centre of sharp vision has no vessels)
      const fx = x - F.u;
      const fy = y - F.v;
      const fd = Math.hypot(fx, fy);
      if (fd < 1.6) {
        const away = Math.atan2(fy, fx);
        let diff = away - a;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        a += diff * 0.12;
      }
      x += Math.cos(a) * step;
      y += Math.sin(a) * step;
      if (Math.hypot(x - F.u, y - F.v) < 0.55) break; // foveal avascular zone
      if (Math.hypot(x, y) > limit) break;
      pts.push([x, y]);
      w.push(width * (1 - (0.55 * i) / n));
    }
    if (pts.length > 2) vessels.push({ kind, pts, w, order });
    // occasional sub-branches
    if (order < 3 && pts.length > 12) {
      const count = order === 1 ? 2 : 1;
      for (let b = 0; b < count; b++) {
        const k = Math.floor(pts.length * (0.25 + rng() * 0.6));
        const [px, py] = pts[k];
        const [qx, qy] = pts[Math.min(pts.length - 1, k + 1)];
        const base = Math.atan2(qy - py, qx - px);
        const side = rng() < 0.5 ? -1 : 1;
        const ang = base + side * (0.45 + rng() * 0.5);
        grow(kind, [px, py], [Math.cos(ang), Math.sin(ang)], w[k] * 0.66, order + 1, length * (0.4 + rng() * 0.3));
      }
    }
  }

  for (const kind of ['vein', 'artery']) {
    const offset = kind === 'vein' ? 0.16 : -0.16;
    for (const [name, wps] of Object.entries(TRUNKS)) {
      const isNasalSmall = name === 'nasal';
      const shifted = wps.map(([u, v], i) => {
        // run arteries and veins side by side: shift perpendicular-ish
        const s = i === 0 ? 0.4 : 1;
        return [u + offset * 0.4 * s, v + offset * s * (v >= 0 ? 1 : -1)];
      });
      const path = catmull([[D.u, D.v], ...shifted]);
      const width0 = (kind === 'vein' ? 0.15 : 0.11) * (isNasalSmall ? 0.6 : 1);
      const w = path.map((_, i) => width0 * (1 - (0.6 * i) / path.length));
      vessels.push({ kind, pts: path, w, order: 0 });
      // side branches from the trunk
      const nb = isNasalSmall ? 2 : 5;
      for (let b = 0; b < nb; b++) {
        const k = Math.floor(path.length * (0.18 + (b / nb) * 0.75 + rng() * 0.05));
        if (k >= path.length - 2) continue;
        const [px, py] = path[k];
        const [qx, qy] = path[k + 1];
        const base = Math.atan2(qy - py, qx - px);
        // temporal arcade branches alternate towards the macula and towards the periphery
        const side = b % 2 === 0 ? 1 : -1;
        const ang = base + side * (0.55 + rng() * 0.5);
        grow(kind, [px, py], [Math.cos(ang), Math.sin(ang)], w[k] * 0.6, 1, 3 + rng() * 4);
      }
    }
    // small macular branches heading towards the fovea from the disc side
    for (let i = 0; i < 3; i++) {
      const sy = (i - 1) * 0.5;
      grow(kind, [D.u - D.radius - 0.05, D.v + sy * 0.6], [-1, sy * 0.4 + (rng() - 0.5) * 0.3], 0.04, 2, 3.0);
    }
  }
  return vessels;
}

// ---------------------------------------------------------------------------------------------
// Retinal nerve fibre layer (RNFL)
// ---------------------------------------------------------------------------------------------

/**
 * Direction a nerve fibre travels at point (u, v): towards the optic disc, but swirling
 * around the fovea and never crossing the horizontal "raphe" temporal to the fovea.
 */
function fibreDirection(u, v, hemi) {
  let ax = D.u - u;
  let ay = D.v - v;
  const ad = Math.hypot(ax, ay) || 1;
  ax /= ad;
  ay /= ad;
  const rx = u - F.u;
  const ry = v - F.v;
  const rl = Math.hypot(rx, ry) || 1e-3;
  // swirl around the fovea: over the top for the superior hemiretina, under for inferior
  let sx;
  let sy;
  if (hemi > 0) {
    sx = ry / rl;
    sy = -rx / rl;
  } else {
    sx = -ry / rl;
    sy = rx / rl;
  }
  // tangential component only matters temporal to the disc and near the macula
  const temporal = Math.min(1, Math.max(0, (D.u - 0.5 - u) / 4));
  const ws = 1.35 * temporal * Math.exp(-rl / 9);
  // keep fibres out of the fovea
  const wr = 0.9 / (rl * rl + 0.35);
  // keep fibres in their own hemifield near the raphe (temporal to the fovea)
  const raphe = u < F.u ? hemi * 0.6 * Math.exp(-Math.abs(v - F.v) / 0.7) * Math.min(1, (F.u - u) / 2) : 0;
  let dx = ax + ws * sx + (wr * rx) / rl;
  let dy = ay + ws * sy + (wr * ry) / rl + raphe;
  const dl = Math.hypot(dx, dy) || 1;
  return [dx / dl, dy / dl];
}

/**
 * Trace `count` nerve fibres from ganglion cells spread over the retina to the optic disc.
 * Each fibre stores: its path, where its ganglion cell sits (origin), the angle at which it
 * enters the disc, and a "death threshold" — the glaucoma damage level at which it dies.
 */
export function generateFibres(count = 1400, seed = 11) {
  const rng = makeRng(seed);
  const fibres = [];
  const maxR = DIMS.fundusPatchRadius - 1.2;
  let guard = 0;
  while (fibres.length < count && guard++ < count * 6) {
    // area-uniform sampling inside the patch
    const rr = maxR * Math.sqrt(rng());
    const th = rng() * Math.PI * 2;
    const u0 = F.u + rr * Math.cos(th) * 0.95;
    const v0 = F.v + rr * Math.sin(th);
    if (Math.hypot(u0 - F.u, v0 - F.v) < 0.45) continue; // fovea itself has no fibres passing
    if (Math.hypot(u0 - D.u, v0 - D.v) < D.radius + 0.25) continue;
    if (Math.hypot(u0, v0) > maxR + 0.6) continue;
    const hemi = v0 >= F.v ? 1 : -1;
    const pts = [[u0, v0]];
    let u = u0;
    let v = v0;
    let entered = false;
    for (let i = 0; i < 400; i++) {
      const [dx, dy] = fibreDirection(u, v, hemi);
      const step = 0.12;
      u += dx * step;
      v += dy * step;
      const dd = Math.hypot(u - D.u, v - D.v);
      if (dd <= D.radius) {
        const a = Math.atan2(v - D.v, u - D.u);
        u = D.u + Math.cos(a) * D.radius;
        v = D.v + Math.sin(a) * D.radius;
        pts.push([u, v]);
        entered = true;
        break;
      }
      if (i % 2 === 0) pts.push([u, v]);
    }
    if (!entered) continue;
    // entry angle around the disc: 0 = temporal (towards the fovea) ... measured clinically
    const raw = Math.atan2(v - D.v, u - D.u); // 0 = nasal, PI = temporal
    let clock = Math.PI - raw; // 0 = temporal, +PI/2 = superior, PI = nasal, -PI/2 = inferior
    if (clock > Math.PI) clock -= Math.PI * 2;
    if (clock < -Math.PI) clock += Math.PI * 2;
    fibres.push({ pts, origin: [u0, v0], entry: raw, clock, death: 0 });
  }
  assignVulnerability(fibres, rng);
  return fibres;
}

/**
 * In glaucoma the nerve fibres entering the top and (especially) the bottom of the optic disc
 * die first — the support tissue there (lamina cribrosa) has larger, weaker pores. Fibres
 * from the central "papillomacular bundle" and the nasal side survive the longest.
 */
export function vulnerabilityAt(clock) {
  const deg = (clock * 180) / Math.PI; // 0 temporal, 90 superior, ±180 nasal, -90 inferior
  const g = (x, mu, s) => Math.exp(-((x - mu) ** 2) / (2 * s * s));
  const inferior = g(deg, -78, 26);
  const superior = 0.82 * g(deg, 80, 26);
  const temporalSparing = g(deg, 0, 22);
  return Math.min(1, Math.max(inferior, superior, 0.32) - 0.25 * temporalSparing);
}

function assignVulnerability(fibres, rng) {
  for (const f of fibres) {
    const vul = vulnerabilityAt(f.clock);
    // high vulnerability -> dies at low damage. Add patchiness so loss looks natural.
    f.death = Math.min(0.995, Math.max(0.02, 1.02 - vul * 0.88 + (rng() - 0.5) * 0.22));
  }
}

/**
 * Convert a retina position (fundus mm) to a visual-field position (degrees).
 * The image on the retina is upside-down and mirrored, and the right eye's nasal retina
 * sees the temporal (right-hand) world. Returns [x, y] with +x = to the patient's right.
 */
export function retinaToField(u, v) {
  const MM_PER_DEG = 0.29;
  return [(u - F.u) / MM_PER_DEG, -(v - F.v) / MM_PER_DEG];
}
export function fieldToRetina(x, y) {
  const MM_PER_DEG = 0.29;
  return [F.u + x * MM_PER_DEG, F.v - y * MM_PER_DEG];
}

/**
 * Visual-field sensitivity map derived from which fibres are still alive.
 * Returns { size, extent, data: Float32Array 0..1 (1 = seeing normally) }.
 */
export function computeField(fibres, damage, size = 48, extent = 54) {
  const data = new Float32Array(size * size);
  const cell = 0.9; // mm; bucket size
  const buckets = new Map();
  for (const f of fibres) {
    const [u, v] = f.origin;
    const key = `${Math.floor(u / cell)},${Math.floor(v / cell)}`;
    let b = buckets.get(key);
    if (!b) buckets.set(key, (b = []));
    b.push(f);
  }
  const sigma = 1.05;
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const x = ((i + 0.5) / size - 0.5) * 2 * extent;
      const y = (0.5 - (j + 0.5) / size) * 2 * extent;
      let [u, v] = fieldToRetina(x, y);
      // beyond the modelled patch, sample its edge (the far periphery behaves like the edge)
      const rr = Math.hypot(u, v);
      const lim = DIMS.fundusPatchRadius - 1.6;
      if (rr > lim) {
        u *= lim / rr;
        v *= lim / rr;
      }
      const bu = Math.floor(u / cell);
      const bv = Math.floor(v / cell);
      let wsum = 0;
      let alive = 0;
      for (let du = -2; du <= 2; du++) {
        for (let dv = -2; dv <= 2; dv++) {
          const b = buckets.get(`${bu + du},${bv + dv}`);
          if (!b) continue;
          for (const f of b) {
            const d2 = (f.origin[0] - u) ** 2 + (f.origin[1] - v) ** 2;
            const w = Math.exp(-d2 / (2 * sigma * sigma));
            wsum += w;
            if (f.death > damage) alive += w;
          }
        }
      }
      let s = wsum > 1e-4 ? alive / wsum : 1;
      // A healthy nerve has spare capacity: tests only show loss after many fibres are gone.
      s = Math.min(1, Math.max(0, (s - 0.25) / 0.6));
      data[j * size + i] = s;
    }
  }
  return { size, extent, data };
}

/** Peripapillary RNFL thickness (micrometres) in `bins` sectors around the disc, as an OCT would measure. */
export function rnflProfile(fibres, damage, bins = 64) {
  const healthy = new Float32Array(bins);
  const alive = new Float32Array(bins);
  for (const f of fibres) {
    // TSNIT order: Temporal -> Superior -> Nasal -> Inferior -> Temporal
    let a = f.clock; // 0 T, +pi/2 S, pi N, -pi/2 I
    if (a < 0) a += Math.PI * 2; // 0..2pi : T(0) S(pi/2) N(pi) I(3pi/2)
    const k = Math.min(bins - 1, Math.floor((a / (Math.PI * 2)) * bins));
    healthy[k] += 1;
    if (f.death > damage) alive[k] += 1;
  }
  // smooth and scale so a healthy eye averages ~100 µm with the classic "double hump"
  const smooth = (arr) => {
    const out = new Float32Array(bins);
    for (let i = 0; i < bins; i++) {
      let s = 0;
      let w = 0;
      for (let k = -4; k <= 4; k++) {
        const ww = Math.exp(-(k * k) / 8);
        s += arr[(i + k + bins) % bins] * ww;
        w += ww;
      }
      out[i] = s / w;
    }
    return out;
  };
  const h = smooth(healthy);
  const a = smooth(alive);
  let mean = 0;
  for (let i = 0; i < bins; i++) mean += h[i];
  mean /= bins;
  const normal = new Float32Array(bins);
  const measured = new Float32Array(bins);
  for (let i = 0; i < bins; i++) {
    // ~45 µm of the measured thickness is glia & vessels that remain even when axons die
    normal[i] = 45 + (h[i] / mean) * 55;
    measured[i] = 45 + (a[i] / mean) * 55;
  }
  return { normal, measured };
}

/** Fraction of fibres still alive (overall), useful for summaries. */
export function aliveFraction(fibres, damage) {
  let n = 0;
  for (const f of fibres) if (f.death > damage) n++;
  return n / fibres.length;
}

/**
 * Shape of the optic cup for a given damage level.
 * Returns cupRadius(clock) as a fraction of the disc radius, plus depth (mm) and pallor.
 * The cup grows first vertically (inferior > superior), exactly where fibres are lost.
 */
export function cupShape(damage, baseCdr = 0.3) {
  const d = Math.max(0, Math.min(1, damage));
  return {
    cdrAt(clock) {
      const vul = vulnerabilityAt(clock);
      const grow = d * (0.42 + 0.5 * vul) + Math.max(0, d - 0.6) * 0.35;
      return Math.min(0.97, baseCdr + grow);
    },
    depth: 0.32 + d * 0.62,
    pallor: Math.max(0, d - 0.55) / 0.45,
    get verticalCdr() {
      return (this.cdrAt(Math.PI / 2) + this.cdrAt(-Math.PI / 2)) / 2;
    },
    get horizontalCdr() {
      return (this.cdrAt(0) + this.cdrAt(Math.PI)) / 2;
    },
  };
}
