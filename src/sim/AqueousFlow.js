/**
 * AQUEOUS HUMOUR FLOW
 *
 * Thousands of glowing droplets follow the real route of the eye's internal fluid:
 *   ciliary processes (the "tap") -> posterior chamber -> through the pupil ->
 *   anterior chamber -> trabecular meshwork (the "drain") -> Schlemm's canal ->
 *   collector channels -> episcleral veins (back into the bloodstream).
 * A smaller share leaves through the "back door": the uveoscleral pathway.
 *
 * Blockages (a clogged meshwork, a closed angle, a blocked pupil) make droplets queue up
 * and turn amber — you can literally watch the pressure build.
 */
import * as THREE from 'three';
import { DIMS, pol } from '../config/anatomy.js';
import { makeParticleMaterial } from '../eye/materials.js';

// control points [r, y, width] in lathe space
const TRAB = [
  [5.18, 7.35, 0.16], // tip of a ciliary process
  [4.95, 7.85, 0.18],
  [4.0, 8.33, 0.14],
  [3.0, 8.58, 0.06],
  [2.15, 8.71, 0.025], // narrow gap between iris and lens
  [1.55, 8.93, 0.06], // through the pupil
  [1.75, 9.5, 0.35],
  [2.8, 10.55, 0.55],
  [4.2, 10.2, 0.25], // sinking along the cool back of the cornea
  [4.95, 9.55, 0.1], // into the drainage angle
  [5.3, 9.22, 0.05], // face of the trabecular meshwork
  [5.43, 9.39, 0.03], // through the meshwork
  [...pol(DIMS.schlemmR, DIMS.schlemmDeg), 0.02], // Schlemm's canal
];
const TRAB_OUT = [
  [...pol(DIMS.schlemmR, DIMS.schlemmDeg), 0.02],
  [...pol(11.33, DIMS.schlemmDeg - 0.3), 0.015], // collector channel
  [...pol(11.56, DIMS.schlemmDeg - 1.0), 0.015],
  [...pol(11.56, DIMS.schlemmDeg - 4.5), 0.02], // episcleral vein
  [...pol(11.56, DIMS.schlemmDeg - 9.5), 0.02],
];
const UVEO = [
  ...TRAB.slice(0, 10),
  [5.62, 8.95, 0.05], // angle recess
  [5.95, 8.72, 0.04], // ciliary body face
  [...pol(10.6, 53), 0.06], // between ciliary muscle fibres
  [...pol(10.82, 47.5), 0.03], // suprachoroidal space
  [...pol(10.82, 38), 0.03],
  [...pol(10.82, 27), 0.03],
  [...pol(10.82, 14), 0.03],
];

const CHANNEL_PHI = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2 + 0.13);

function spline(points, samplesPerSeg = 14) {
  const out = [];
  const p = [points[0], ...points, points[points.length - 1]];
  for (let i = 1; i < p.length - 2; i++) {
    for (let k = 0; k < samplesPerSeg; k++) {
      const t = k / samplesPerSeg;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (j) => 0.5 * (2 * p[i][j] + (-p[i - 1][j] + p[i + 1][j]) * t + (2 * p[i - 1][j] - 5 * p[i][j] + 4 * p[i + 1][j] - p[i + 2][j]) * t2 + (-p[i - 1][j] + 3 * p[i][j] - 3 * p[i + 1][j] + p[i + 2][j]) * t3);
      out.push([f(0), f(1), Math.max(0.005, f(2))]);
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

/**
 * Build an arc-length lookup table. `dwell` adds a stretch at the canal where droplets
 * travel around the ring of Schlemm's canal to the nearest collector channel.
 */
function buildPath(partA, partB = null, dwell = 0) {
  const pts = [];
  const a = spline(partA);
  for (const q of a) pts.push({ r: q[0], y: q[1], w: q[2], blend: 0 });
  const marks = {};
  if (partB) {
    const last = pts[pts.length - 1];
    marks.canal = pts.length - 1;
    const nd = 12;
    for (let i = 1; i <= nd; i++) pts.push({ ...last, blend: i / nd, virtual: dwell / nd });
    const b = spline(partB).slice(1);
    for (const q of b) pts.push({ r: q[0], y: q[1], w: q[2], blend: 1 });
  }
  // cumulative length
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    const d = pts[i].virtual ?? Math.hypot(pts[i].r - pts[i - 1].r, pts[i].y - pts[i - 1].y);
    cum.push(cum[i - 1] + d);
  }
  const L = cum[cum.length - 1];
  const N = 600;
  const table = new Float32Array(N * 6); // r, y, nx, ny, w, blend
  let j = 0;
  for (let i = 0; i < N; i++) {
    const s = (i / (N - 1)) * L;
    while (j < cum.length - 2 && cum[j + 1] < s) j++;
    const seg = Math.max(1e-6, cum[j + 1] - cum[j]);
    const f = Math.min(1, (s - cum[j]) / seg);
    const p0 = pts[j];
    const p1 = pts[j + 1];
    const r = p0.r + (p1.r - p0.r) * f;
    const y = p0.y + (p1.y - p0.y) * f;
    let tx = p1.r - p0.r;
    let ty = p1.y - p0.y;
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    table.set([r, y, -ty, tx, p0.w + (p1.w - p0.w) * f, p0.blend + (p1.blend - p0.blend) * f], i * 6);
  }
  // s-position (0..1) of each control point, for barriers
  const sAt = (idx) => cum[idx * 14] / L;
  return { table, N, L, sAt, marks: { canal: marks.canal !== undefined ? cum[marks.canal] / L : 1 } };
}

const tmpColor = new THREE.Color();

export class AqueousFlow {
  constructor(parent, sprite, { count = 1200, clippingPlanes = [] } = {}) {
    this.trab = buildPath(TRAB, TRAB_OUT, 1.6);
    this.uveo = buildPath(UVEO);
    this.paths = [this.trab, this.uveo];
    // barrier positions along each path
    this.trab.barriers = {
      pupil: this.trab.sAt(4) + 0.004,
      angle: this.trab.sAt(9),
      tm: this.trab.sAt(10),
    };
    this.uveo.barriers = { pupil: this.uveo.sAt(4) + 0.004, angle: this.uveo.sAt(9), tm: 2 };

    this.count = count;
    this.p = [];
    for (let i = 0; i < count; i++) this.p.push(this.spawn({}, true));

    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(count * 3);
    this.col = new Float32Array(count * 4);
    this.size = new Float32Array(count);
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(this.col, 4));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
    this.material = makeParticleMaterial(sprite, { additive: true });
    this.material.clippingPlanes = clippingPlanes;
    this.points = new THREE.Points(g, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 7;
    parent.add(this.points);

    // live parameters (set by the pressure model)
    this.params = { flow: 1, uveoFraction: 0.15, tmPass: 1, anglePass: 1, pupilPass: 1, speed: 1 };
    this.normal = new THREE.Color('#62e6ff');
    this.waiting = new THREE.Color('#ffb547');
    this.stuckCount = 0;
  }

  spawn(pt, scatter = false) {
    const uveo = Math.random() < (this.params?.uveoFraction ?? 0.15);
    pt.path = uveo ? 1 : 0;
    pt.s = scatter ? Math.random() * 0.98 : 0;
    pt.phi = Math.random() * Math.PI * 2;
    pt.j = (Math.random() * 2 - 1) * 0.9;
    pt.k = Math.random();
    pt.q = Math.random();
    pt.speed = 0.75 + Math.random() * 0.5;
    pt.wait = 0;
    pt.channel = CHANNEL_PHI.reduce((best, c) => (angDist(c, pt.phi) < angDist(best, pt.phi) ? c : best), CHANNEL_PHI[0]);
    pt.size = 0.04 + Math.random() * 0.03;
    return pt;
  }

  setParams(p) {
    Object.assign(this.params, p);
  }

  update(dt, visible = true) {
    this.points.visible = visible;
    if (!visible) return;
    const P = this.params;
    let stuck = 0;
    for (let i = 0; i < this.count; i++) {
      const pt = this.p[i];
      const path = this.paths[pt.path];
      const T = path.table;
      const idx = Math.min(path.N - 1, Math.max(0, Math.round(pt.s * (path.N - 1))));
      const w = T[idx * 6 + 4];
      // narrow passages flow faster, the wide anterior chamber slowly (same volume per second)
      const local = Math.min(3, Math.max(0.3, 0.12 / (w + 0.03)));
      let ds = (0.45 * P.flow * P.speed * pt.speed * local * dt) / path.L;
      let next = pt.s + ds;

      // barriers ahead of this droplet
      const B = path.barriers;
      let blocked = false;
      for (const [name, pass] of [
        ['pupil', P.pupilPass],
        ['angle', P.anglePass],
        ['tm', P.tmPass],
      ]) {
        const bs = B[name];
        if (pass >= 0.995 || pt.s > bs) continue;
        const spread = name === 'pupil' ? 0.12 : name === 'angle' ? 0.06 : 0.035;
        const queueAt = bs - pt.q * spread;
        if (next >= queueAt) {
          // waiting in the queue: occasionally squeeze through, more often if passability is high
          if (Math.random() < pass * pass * dt * 3.5) {
            next = bs + 0.002;
          } else {
            next = Math.min(Math.max(pt.s, queueAt - 0.004), queueAt);
            blocked = true;
          }
        }
        break;
      }
      pt.wait = blocked ? Math.min(1, pt.wait + dt * 0.8) : Math.max(0, pt.wait - dt * 2);
      if (blocked) stuck++;
      pt.s = next;
      if (pt.s >= 1) {
        this.spawn(pt);
        continue;
      }
      // position
      const id2 = Math.min(path.N - 1, Math.max(0, Math.round(pt.s * (path.N - 1))));
      const o = id2 * 6;
      const jitter = pt.j * T[o + 4] + (blocked ? Math.sin(performance.now() * 0.004 + i) * 0.01 : 0);
      const r = T[o] + T[o + 2] * jitter;
      const y = T[o + 1] + T[o + 3] * jitter;
      const blend = T[o + 5];
      const phi = pt.phi + angDiff(pt.channel, pt.phi) * blend;
      this.pos[i * 3] = r * Math.sin(phi);
      this.pos[i * 3 + 1] = y;
      this.pos[i * 3 + 2] = r * Math.cos(phi);
      tmpColor.copy(this.normal).lerp(this.waiting, pt.wait);
      // fade out as droplets reach the end of the route
      const fade = Math.min(1, (1 - pt.s) * 12) * Math.min(1, pt.s * 40);
      this.col[i * 4] = tmpColor.r;
      this.col[i * 4 + 1] = tmpColor.g;
      this.col[i * 4 + 2] = tmpColor.b;
      this.col[i * 4 + 3] = 0.8 * fade;
      this.size[i] = pt.size * (1 + pt.wait * 0.3);
    }
    this.stuckCount = stuck;
    const g = this.points.geometry;
    g.attributes.position.needsUpdate = true;
    g.attributes.aColor.needsUpdate = true;
    g.attributes.aSize.needsUpdate = true;
  }

  /** Fraction of droplets currently queued behind a blockage (drives the "pressure" glow). */
  get congestion() {
    return this.stuckCount / this.count;
  }
}

/**
 * Debris that rides the aqueous current and gets trapped in the meshwork:
 * pigment granules, exfoliation flakes, inflammatory cells...
 */
export class FlowRiders {
  constructor(parent, sprite, flow, { count = 260, color = '#3b2312', size = 0.05, additive = false, startCP = 2, speed = 0.6, stick = 0.8, jitter = 1, clippingPlanes = [] } = {}) {
    this.flow = flow;
    this.path = flow.trab;
    this.count = count;
    this.startS = this.path.sAt(startCP);
    this.tmS = this.path.barriers.tm - 0.004;
    this.speed = speed;
    this.stick = stick;
    this.jit = jitter;
    this.amount = 0;
    this.p = [];
    for (let i = 0; i < count; i++) this.p.push(this.spawn({}, true));
    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(count * 3);
    this.col = new Float32Array(count * 4);
    this.sizeArr = new Float32Array(count);
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(this.col, 4));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.sizeArr, 1));
    this.color = new THREE.Color(color);
    this.baseSize = size;
    this.material = makeParticleMaterial(sprite, { additive });
    this.material.clippingPlanes = clippingPlanes;
    this.points = new THREE.Points(g, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 8;
    this.points.visible = false;
    parent.add(this.points);
  }

  spawn(pt, scatter = false) {
    pt.s = this.startS + (scatter ? Math.random() * (this.tmS - this.startS) : 0);
    pt.phi = Math.random() * Math.PI * 2;
    pt.j = (Math.random() * 2 - 1) * this.jit;
    pt.stuck = scatter && Math.random() < 0.4;
    if (pt.stuck) pt.s = this.tmS - Math.random() * 0.01;
    pt.life = 6 + Math.random() * 14;
    pt.v = 0.6 + Math.random() * 0.8;
    pt.active = Math.random();
    return pt;
  }

  /** amount 0..1 sets how much debris is visible */
  update(dt, amount) {
    this.amount += (amount - this.amount) * (1 - Math.exp(-dt * 1.5));
    this.points.visible = this.amount > 0.01;
    if (!this.points.visible) return;
    const T = this.path.table;
    const N = this.path.N;
    for (let i = 0; i < this.count; i++) {
      const pt = this.p[i];
      if (pt.stuck) {
        pt.life -= dt;
        if (pt.life <= 0) this.spawn(pt);
      } else {
        pt.s += (0.45 * this.speed * pt.v * dt) / this.path.L;
        if (pt.s >= this.tmS) {
          if (Math.random() < this.stick) {
            pt.stuck = true;
            pt.s = this.tmS - Math.random() * 0.01;
          } else this.spawn(pt);
        }
      }
      const idx = Math.min(N - 1, Math.round(pt.s * (N - 1)));
      const o = idx * 6;
      const jit = pt.j * T[o + 4];
      const r = T[o] + T[o + 2] * jit;
      const y = T[o + 1] + T[o + 3] * jit;
      this.pos[i * 3] = r * Math.sin(pt.phi);
      this.pos[i * 3 + 1] = y;
      this.pos[i * 3 + 2] = r * Math.cos(pt.phi);
      const visible = pt.active < this.amount ? 1 : 0;
      this.col[i * 4] = this.color.r;
      this.col[i * 4 + 1] = this.color.g;
      this.col[i * 4 + 2] = this.color.b;
      this.col[i * 4 + 3] = visible * 0.95;
      this.sizeArr[i] = this.baseSize * (0.7 + (i % 7) * 0.08);
    }
    const g = this.points.geometry;
    g.attributes.position.needsUpdate = true;
    g.attributes.aColor.needsUpdate = true;
    g.attributes.aSize.needsUpdate = true;
  }
}

function angDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
function angDist(a, b) {
  return Math.abs(angDiff(a, b));
}
