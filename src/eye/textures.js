/**
 * Procedural textures: every surface pattern is drawn by code at start-up, so the site
 * needs no image files and loads fast.
 */
import * as THREE from 'three';
import { makeRng, makeFbm } from './random.js';

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function toTexture(c, { repeatX = false, srgb = true, flipY = false } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.flipY = flipY;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeatX) t.wrapS = THREE.RepeatWrapping;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

/** Draw something that wraps around horizontally (for textures that go all the way round). */
function wrapStroke(g, W, drawFn, x = null, margin = 40) {
  drawFn(0);
  if (x === null || x < margin) drawFn(W);
  if (x === null || x > W - margin) drawFn(-W);
}

export const IRIS_COLORS = {
  hazel: { pupil: [120, 72, 30], mid: [116, 120, 60], outer: [70, 96, 70], fibre: [214, 180, 120], ring: [40, 50, 40] },
  blue: { pupil: [96, 110, 120], mid: [92, 140, 190], outer: [60, 100, 160], fibre: [200, 225, 245], ring: [25, 40, 70] },
  green: { pupil: [130, 110, 50], mid: [90, 140, 90], outer: [60, 110, 80], fibre: [200, 230, 180], ring: [25, 50, 35] },
  brown: { pupil: [70, 38, 18], mid: [104, 60, 28], outer: [84, 48, 24], fibre: [170, 110, 60], ring: [35, 20, 10] },
};

/**
 * Iris texture. x = around the iris, y = from the pupil margin (top) to the root (bottom).
 */
export function makeIrisTexture(colorName = 'hazel', seed = 3) {
  const C = IRIS_COLORS[colorName] || IRIS_COLORS.hazel;
  const W = 1024;
  const H = 256;
  const c = canvas(W, H);
  const g = c.getContext('2d');
  const rng = makeRng(seed);
  const rgb = (a, al = 1) => `rgba(${a[0]},${a[1]},${a[2]},${al})`;

  // base radial colour bands
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, rgb(C.pupil));
  grad.addColorStop(0.28, rgb(C.pupil));
  grad.addColorStop(0.36, rgb(C.mid));
  grad.addColorStop(0.8, rgb(C.outer));
  grad.addColorStop(1, rgb(C.ring));
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);

  // radial fibres (stroma "trabeculae")
  for (let i = 0; i < 1100; i++) {
    const x = rng() * W;
    const y0 = rng() * H * 0.25;
    const y1 = H * (0.55 + rng() * 0.45);
    const light = rng() < 0.55;
    const al = 0.05 + rng() * 0.18;
    g.strokeStyle = light ? rgb(C.fibre, al) : `rgba(0,0,0,${al * 0.8})`;
    g.lineWidth = 0.6 + rng() * 2.2;
    const wob = (rng() - 0.5) * 10;
    wrapStroke(g, W, (off) => {
      g.beginPath();
      g.moveTo(x + off, y0);
      g.bezierCurveTo(x + off + wob, y0 + (y1 - y0) * 0.33, x + off - wob, y0 + (y1 - y0) * 0.66, x + off + wob * 0.5, y1);
      g.stroke();
    }, x, 16);
  }

  // crypts (Fuchs' crypts): dark lens-shaped hollows near the collarette
  for (let i = 0; i < 70; i++) {
    const x = rng() * W;
    const y = H * (0.3 + rng() * 0.35);
    const rx = 3 + rng() * 9;
    const ry = 8 + rng() * 22;
    wrapStroke(g, W, (off) => {
      g.fillStyle = `rgba(10,8,5,${0.25 + rng() * 0.3})`;
      g.beginPath();
      g.ellipse(x + off, y, rx, ry, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = rgb(C.fibre, 0.25);
      g.lineWidth = 1;
      g.stroke();
    }, x, 16);
  }

  // collarette: the wavy ridge that separates the pupillary and ciliary zones
  g.strokeStyle = rgb(C.fibre, 0.55);
  g.lineWidth = 4;
  g.beginPath();
  for (let x = 0; x <= W; x += 4) {
    const y = H * 0.3 + Math.sin((x / W) * Math.PI * 2 * 26) * 5 + Math.sin((x / W) * Math.PI * 2 * 7) * 4;
    if (x === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.stroke();

  // contraction furrows: faint circular folds in the outer iris
  for (const fy of [0.72, 0.81, 0.9]) {
    g.strokeStyle = 'rgba(0,0,0,0.18)';
    g.lineWidth = 2;
    g.beginPath();
    for (let x = 0; x <= W; x += 6) {
      const y = H * fy + Math.sin((x / W) * Math.PI * 2 * 11 + fy * 20) * 3;
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  }

  // pupillary ruff: the dark frill at the pupil edge (the pigment layer peeking round)
  g.fillStyle = 'rgba(25,14,8,0.95)';
  g.beginPath();
  g.moveTo(0, 0);
  for (let x = 0; x <= W; x += 3) g.lineTo(x, 6 + Math.sin(x * 0.9) * 1.5 + rng() * 2);
  g.lineTo(W, 0);
  g.closePath();
  g.fill();

  // fine noise
  const img = g.getImageData(0, 0, W, H);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rng() - 0.5) * 14;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  return toTexture(c, { repeatX: true });
}

/** Overlay of abnormal new blood vessels on the iris (neovascular glaucoma: "rubeosis"). */
export function makeRubeosisTexture(seed = 21) {
  const W = 1024;
  const H = 256;
  const c = canvas(W, H);
  const g = c.getContext('2d');
  const rng = makeRng(seed);
  g.lineCap = 'round';
  for (let i = 0; i < 180; i++) {
    let x = rng() * W;
    let y = rng() < 0.5 ? rng() * 20 : H * (0.75 + rng() * 0.25);
    let a = (rng() - 0.5) * Math.PI * 2;
    g.strokeStyle = `rgba(${200 + rng() * 40}, ${20 + rng() * 30}, ${30 + rng() * 20}, ${0.6 + rng() * 0.4})`;
    g.lineWidth = 0.8 + rng() * 1.6;
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 18; k++) {
      a += (rng() - 0.5) * 1.4;
      x += Math.cos(a) * 6;
      y += Math.sin(a) * 6;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  return toTexture(c, { repeatX: true });
}

/** Conjunctival / episcleral blood vessels, transparent elsewhere. y = back (top) to limbus (bottom). */
export function makeConjunctivaTexture(seed = 9) {
  const W = 2048;
  const H = 512;
  const c = canvas(W, H);
  const g = c.getContext('2d');
  const rng = makeRng(seed);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  function vessel(x, y, a, width, len, depth) {
    g.lineWidth = width;
    g.strokeStyle = `rgba(${150 + rng() * 40}, ${18 + rng() * 25}, ${28 + rng() * 20}, ${0.35 + rng() * 0.35})`;
    g.beginPath();
    g.moveTo(x, y);
    const pts = [];
    for (let i = 0; i < len; i++) {
      a += (rng() - 0.5) * 0.5;
      // vessels run roughly towards the limbus (downwards)
      a += (Math.PI / 2 - a) * 0.05;
      x += Math.cos(a) * 5;
      y += Math.sin(a) * 5;
      g.lineTo(x, y);
      pts.push([x, y, a]);
      if (y > H - 6) break;
    }
    g.stroke();
    if (depth < 3) {
      for (const [px, py, pa] of pts) {
        if (rng() < 0.06) vessel(px, py, pa + (rng() < 0.5 ? -1 : 1) * (0.5 + rng()), width * 0.65, len * 0.5, depth + 1);
      }
    }
  }
  for (let i = 0; i < 46; i++) vessel(rng() * W, rng() * H * 0.3, Math.PI / 2 + (rng() - 0.5), 1.5 + rng() * 2.5, 60 + rng() * 60, 0);
  // fine limbal arcades
  for (let i = 0; i < 260; i++) {
    const x = rng() * W;
    g.strokeStyle = `rgba(170,30,40,${0.15 + rng() * 0.2})`;
    g.lineWidth = 0.8;
    g.beginPath();
    g.moveTo(x, H - 2);
    g.quadraticCurveTo(x + (rng() - 0.5) * 20, H - 18, x + (rng() - 0.5) * 30, H - 30 - rng() * 30);
    g.stroke();
  }
  return toTexture(c, { repeatX: true });
}

/** Trabecular meshwork: a sieve of collagen beams with gaps between them. */
export function makeMeshworkTexture(seed = 13) {
  const W = 2048;
  const H = 128;
  const c = canvas(W, H);
  const g = c.getContext('2d');
  const rng = makeRng(seed);
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 2600; i++) {
    const x = rng() * W;
    const y = rng() * H;
    g.fillStyle = `rgba(0,0,0,${0.6 + rng() * 0.4})`;
    g.beginPath();
    g.ellipse(x, y, 2 + rng() * 5, 1.5 + rng() * 4, rng() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  g.globalCompositeOperation = 'source-over';
  // darker pigmented band (posterior, "filtering" part of the meshwork — near the spur)
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.55, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(60,30,15,0.5)');
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  return toTexture(c, { repeatX: true });
}

/** Lamina cribrosa: a sieve-like plate the nerve fibres pass through. */
export function makeLaminaTexture(seed = 17) {
  const N = 256;
  const c = canvas(N, N);
  const g = c.getContext('2d');
  const rng = makeRng(seed);
  g.fillStyle = '#f2e6cc';
  g.fillRect(0, 0, N, N);
  for (let i = 0; i < 160; i++) {
    const a = i * 2.39996;
    const r = Math.sqrt(i / 160) * N * 0.46;
    const x = N / 2 + Math.cos(a) * r;
    const y = N / 2 + Math.sin(a) * r;
    // pores are larger at the top and bottom (why those fibres are more vulnerable)
    const vert = Math.abs(Math.sin(a));
    g.fillStyle = `rgba(90,70,60,${0.45 + rng() * 0.3})`;
    g.beginPath();
    g.ellipse(x, y, 3 + vert * 3 + rng() * 2, 2.5 + vert * 4, a, 0, Math.PI * 2);
    g.fill();
  }
  return toTexture(c);
}

/** Soft round glow used for particles. */
export function makeGlowSprite() {
  const N = 64;
  const c = canvas(N, N);
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.8)');
  grad.addColorStop(0.6, 'rgba(255,255,255,0.18)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, N, N);
  return toTexture(c, { srgb: false });
}

/** A flake-like sprite (pigment granules, exfoliation flakes, cells). */
export function makeFlakeSprite() {
  const N = 64;
  const c = canvas(N, N);
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.9)');
  grad.addColorStop(0.75, 'rgba(255,255,255,0.3)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.beginPath();
  g.arc(N / 2, N / 2, N / 2, 0, Math.PI * 2);
  g.fill();
  return toTexture(c, { srgb: false });
}

/** Tileable greyscale noise used as a bump map to give tissues a soft organic surface. */
export function makeBumpTexture(seed = 4, size = 256, scale = 8) {
  const c = canvas(size, size);
  const g = c.getContext('2d');
  const img = g.createImageData(size, size);
  const fbm = makeFbm(seed, scale, scale, 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = fbm((x / size) * scale, (y / size) * scale) * 255;
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = toTexture(c, { srgb: false });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Striated muscle texture for the extraocular muscles. */
export function makeMuscleTexture(seed = 31) {
  const W = 256;
  const H = 512;
  const c = canvas(W, H);
  const g = c.getContext('2d');
  const rng = makeRng(seed);
  g.fillStyle = '#9b3a33';
  g.fillRect(0, 0, W, H);
  for (let i = 0; i < 220; i++) {
    const x = rng() * W;
    g.strokeStyle = rng() < 0.5 ? `rgba(255,170,150,${0.08 + rng() * 0.12})` : `rgba(60,10,10,${0.1 + rng() * 0.15})`;
    g.lineWidth = 1 + rng() * 3;
    g.beginPath();
    g.moveTo(x, 0);
    g.bezierCurveTo(x + (rng() - 0.5) * 12, H * 0.3, x + (rng() - 0.5) * 12, H * 0.6, x + (rng() - 0.5) * 8, H);
    g.stroke();
  }
  // white tendon at the insertion end (bottom)
  const grad = g.createLinearGradient(0, H * 0.8, 0, H);
  grad.addColorStop(0, 'rgba(240,230,220,0)');
  grad.addColorStop(1, 'rgba(240,230,220,0.95)');
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  const t = toTexture(c);
  return t;
}
