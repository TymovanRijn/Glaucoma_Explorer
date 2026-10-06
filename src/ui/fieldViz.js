/**
 * Visual-field drawing: the grey-scale map an eye doctor gets from a perimetry test,
 * and the mask used to show "what the patient sees" on top of the 3D view.
 */
import { computeField } from '../eye/fundusData.js';

let cache = { damage: -1, field: null };
export function fieldFor(fibres, damage) {
  if (Math.abs(cache.damage - damage) > 0.004 || !cache.field) {
    cache = { damage, field: computeField(fibres, damage, 48, 54) };
  }
  return cache.field;
}

/** Sample the field (0..1 sensitivity) at visual angle (x, y) degrees, bilinear. */
export function sampleField(field, x, y) {
  const { size, extent, data } = field;
  const fx = ((x / extent + 1) / 2) * size - 0.5;
  const fy = ((1 - y / extent) / 2) * size - 0.5;
  const ix = Math.max(0, Math.min(size - 2, Math.floor(fx)));
  const iy = Math.max(0, Math.min(size - 2, Math.floor(fy)));
  const tx = Math.max(0, Math.min(1, fx - ix));
  const ty = Math.max(0, Math.min(1, fy - iy));
  const a = data[iy * size + ix];
  const b = data[iy * size + ix + 1];
  const c = data[(iy + 1) * size + ix];
  const d = data[(iy + 1) * size + ix + 1];
  return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
}

/** Humphrey 24-2 style test locations (right eye), in degrees. */
export function points242() {
  const pts = [];
  for (let y = -21; y <= 21; y += 6) {
    for (let x = -27; x <= 27; x += 6) {
      const ax = Math.abs(x);
      const ay = Math.abs(y);
      // the 24-2 grid is roughly circular, with two extra nasal points
      const r = Math.hypot(x, y);
      if (r > 26 && !(x === -27 && ay === 3)) continue;
      if (ax === 27 && ay !== 3) continue;
      pts.push([x, y]);
    }
  }
  return pts;
}

/**
 * Draw a grey-scale perimetry printout. Dark = not seen.
 * Includes the physiological blind spot (15° temporal) as on real printouts.
 */
export function drawFieldMap(ctx, field, size, { grid = true, labels = false } = {}) {
  const ext = 30;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  const cell = size / 16;
  const pts = points242();
  for (const [x, y] of pts) {
    let s = sampleField(field, x, y);
    // blind spot (the optic disc) sits ~15° temporal, slightly below the horizontal
    if (Math.hypot(x - 15, (y + 1.5) * 0.8) < 4) s = 0;
    const px = size / 2 + (x / ext) * (size / 2);
    const py = size / 2 - (y / ext) * (size / 2);
    drawSymbol(ctx, px, py, cell * 1.9, s);
  }
  if (grid) {
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size / 2, 4);
    ctx.lineTo(size / 2, size - 4);
    ctx.moveTo(4, size / 2);
    ctx.lineTo(size - 4, size / 2);
    ctx.stroke();
  }
  if (labels) {
    ctx.fillStyle = '#333';
    ctx.font = `${Math.round(size / 26)}px IBM Plex Sans, sans-serif`;
    ctx.fillText('nasal', 6, size / 2 - 6);
    ctx.textAlign = 'right';
    ctx.fillText('temporal', size - 6, size / 2 - 6);
    ctx.textAlign = 'left';
  }
}

/** Grey-scale symbols like a Humphrey printout: denser pattern = less sensitive. */
function drawSymbol(ctx, x, y, w, s) {
  const level = Math.max(0, Math.min(1, s));
  const g = Math.round(255 * Math.pow(level, 0.9));
  ctx.fillStyle = `rgb(${g},${g},${g})`;
  ctx.fillRect(x - w / 2, y - w / 2, w, w);
  if (level > 0.15 && level < 0.9) {
    // dither texture for intermediate values
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    const n = Math.round((1 - level) * 10);
    for (let i = 0; i < n; i++) {
      const ox = ((i * 7) % 5) / 5 - 0.4;
      const oy = ((i * 3) % 5) / 5 - 0.4;
      ctx.fillRect(x + ox * w, y + oy * w, w * 0.12, w * 0.12);
    }
  }
}

/** Summary indices (simplified): mean deviation (dB) and visual field index (%). */
export function fieldIndices(field) {
  const pts = points242().filter(([x, y]) => !(Math.hypot(x - 15, (y + 1.5) * 0.8) < 4));
  let loss = 0;
  let vfi = 0;
  for (const [x, y] of pts) {
    const s = sampleField(field, x, y);
    loss += (1 - s) * 30;
    // central points are weighted more in VFI
    const w = Math.hypot(x, y) < 12 ? 1.6 : 1;
    vfi += s * w;
  }
  const wsum = pts.reduce((a, [x, y]) => a + (Math.hypot(x, y) < 12 ? 1.6 : 1), 0);
  return { md: -(loss / pts.length), vfi: (vfi / wsum) * 100 };
}

/**
 * Build a CSS mask image (white = affected) for the vision overlay, matched to the
 * camera's field of view so each screen pixel corresponds to a real viewing angle.
 */
export function visionMaskDataUrl(field, fovDeg, aspect, { strength = 1 } = {}) {
  const w = 160;
  const h = Math.round(160 / aspect);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  const img = g.createImageData(w, h);
  const tanV = Math.tan(((fovDeg / 2) * Math.PI) / 180);
  const tanH = tanV * aspect;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const nx = (i + 0.5) / w * 2 - 1;
      const ny = 1 - (j + 0.5) / h * 2;
      const ax = (Math.atan(nx * tanH) * 180) / Math.PI;
      const ay = (Math.atan(ny * tanV) * 180) / Math.PI;
      const s = sampleField(field, ax, ay);
      const a = Math.max(0, Math.min(1, (1 - s) * strength));
      const o = (j * w + i) * 4;
      img.data[o] = img.data[o + 1] = img.data[o + 2] = 255;
      img.data[o + 3] = Math.round(a * 255);
    }
  }
  g.putImageData(img, 0, 0);
  return c.toDataURL();
}
