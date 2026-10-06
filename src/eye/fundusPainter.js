/**
 * Paints the back of the eye (the "fundus") onto a 2D canvas.
 * Used for the texture on the 3D retina AND for the fundus photograph in the clinic.
 */
import { DIMS } from '../config/anatomy.js';
import { makeFbm } from './random.js';
import { cupShape } from './fundusData.js';

export const RETINA_BASE = '#c9603a';

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} o
 *   size      canvas size in px
 *   range     half-width of the painted area in mm
 *   center    [u, v] mm at the canvas centre (default [0,0])
 *   vessels   vessel polylines from generateVessels()
 *   fibres    fibres from generateFibres() (to draw the RNFL sheen)
 *   damage    glaucoma damage 0..1 (fibre loss, cup)
 *   drawDisc  paint the optic disc (the 3D model uses a real 3D disc instead)
 *   photo     add photographic vignette & flash glare
 *   haemorrhage draw a splinter (Drance) haemorrhage at the disc margin
 */
export function paintFundus(ctx, o) {
  const size = o.size;
  const range = o.range;
  const [cu, cv] = o.center || [0, 0];
  const s = size / (2 * range);
  const X = (u) => size / 2 + (u - cu) * s;
  const Y = (v) => size / 2 - (v - cv) * s;
  const F = DIMS.fovea;
  const D = DIMS.disc;
  const damage = o.damage || 0;

  ctx.save();
  ctx.fillStyle = RETINA_BASE;
  ctx.fillRect(0, 0, size, size);

  // Choroidal background: warm, slightly mottled (the "tigroid" pattern of choroidal vessels).
  // Computed at low resolution and scaled up (smooth & fast).
  ctx.drawImage(backgroundCanvas(range, cu, cv), 0, 0, size, size);

  // Retinal nerve fibre layer sheen (bright striations, densest above and below the disc).
  // In glaucoma these disappear in wedge shapes — a key sign on photographs.
  if (o.fibres) {
    // draw on a separate layer, then fade it out with distance from the disc
    const layer = document.createElement('canvas');
    layer.width = layer.height = size;
    const lg = layer.getContext('2d');
    lg.lineCap = 'round';
    lg.lineWidth = Math.max(0.6, s * 0.035);
    lg.strokeStyle = 'rgba(255, 236, 214, 0.05)';
    for (const f of o.fibres) {
      if (f.death <= damage) continue;
      const pts = f.pts;
      lg.beginPath();
      let started = false;
      for (let i = 0; i < pts.length; i++) {
        const [u, v] = pts[i];
        if (Math.hypot(u - D.u, v - D.v) > 9) continue;
        if (!started) {
          lg.moveTo(X(u), Y(v));
          started = true;
        } else lg.lineTo(X(u), Y(v));
      }
      lg.stroke();
    }
    lg.globalCompositeOperation = 'destination-in';
    const mg = lg.createRadialGradient(X(D.u), Y(D.v), D.radius * s, X(D.u), Y(D.v), 8.5 * s);
    mg.addColorStop(0, 'rgba(0,0,0,1)');
    mg.addColorStop(0.45, 'rgba(0,0,0,0.6)');
    mg.addColorStop(1, 'rgba(0,0,0,0)');
    lg.fillStyle = mg;
    lg.fillRect(0, 0, size, size);
    ctx.drawImage(layer, 0, 0);
  }

  // Foveal reflex: the tiny bright dot at the bottom of the foveal pit
  const fg = ctx.createRadialGradient(X(F.u), Y(F.v), 0, X(F.u), Y(F.v), 0.12 * s);
  fg.addColorStop(0, 'rgba(255,250,220,0.8)');
  fg.addColorStop(1, 'rgba(255,250,220,0)');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.arc(X(F.u), Y(F.v), 0.12 * s, 0, Math.PI * 2);
  ctx.fill();

  // Peripapillary halo (and atrophy that grows with glaucoma)
  const ppa = 1.12 + damage * 0.35;
  const hg = ctx.createRadialGradient(X(D.u), Y(D.v), D.radius * s * 0.9, X(D.u), Y(D.v), D.radius * ppa * s);
  hg.addColorStop(0, `rgba(235, 205, 170, ${0.35 + damage * 0.3})`);
  hg.addColorStop(1, 'rgba(235, 205, 170, 0)');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.arc(X(D.u), Y(D.v), D.radius * ppa * s, 0, Math.PI * 2);
  ctx.fill();

  // Optic disc + cup (photo only)
  if (o.drawDisc) paintDisc(ctx, X, Y, s, damage, o.baseCdr);

  // Vessels: veins darker and wider, arteries brighter with a central light reflex
  if (o.vessels) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const order = [...o.vessels].sort((a, b) => (a.kind === b.kind ? b.order - a.order : a.kind === 'vein' ? -1 : 1));
    for (const vs of order) {
      const col = vs.kind === 'vein' ? [110, 22, 26] : [176, 40, 34];
      const pts = vs.pts;
      for (let i = 1; i < pts.length; i++) {
        const w = Math.max(0.5, vs.w[i] * s);
        ctx.strokeStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(X(pts[i - 1][0]), Y(pts[i - 1][1]));
        ctx.lineTo(X(pts[i][0]), Y(pts[i][1]));
        ctx.stroke();
      }
      if (vs.kind === 'artery' && vs.order < 2 && s > 20) {
        ctx.strokeStyle = 'rgba(255,200,170,0.45)';
        for (let i = 1; i < pts.length; i++) {
          ctx.lineWidth = Math.max(0.4, vs.w[i] * s * 0.25);
          ctx.beginPath();
          ctx.moveTo(X(pts[i - 1][0]), Y(pts[i - 1][1]));
          ctx.lineTo(X(pts[i][0]), Y(pts[i][1]));
          ctx.stroke();
        }
      }
    }
  }

  if (o.haemorrhage) {
    // splinter haemorrhage at the inferotemporal disc margin
    ctx.save();
    ctx.translate(X(D.u - 0.45), Y(D.v - 0.85));
    ctx.rotate(-0.9);
    ctx.fillStyle = 'rgba(150, 10, 12, 0.9)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 0.42 * s, 0.07 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (o.photo) {
    // camera vignette: fundus photos are circular with dark corners
    const vg = ctx.createRadialGradient(size / 2, size / 2, size * 0.32, size / 2, size / 2, size * 0.5);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(0.85, 'rgba(0,0,0,0.55)');
    vg.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.49, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}

/** Optic disc for the 2D photograph: orange-pink neuroretinal rim, pale cup. */
function paintDisc(ctx, X, Y, s, damage, baseCdr = 0.3) {
  const D = DIMS.disc;
  const cup = cupShape(damage, baseCdr);
  const cx = X(D.u);
  const cy = Y(D.v);
  const R = D.radius * s;
  // vertically oval disc, as in real eyes
  const ry = R * 1.08;
  const rx = R * 0.95;
  const pallor = cup.pallor;
  // rim
  const rimColor = mix([238, 150, 112], [236, 214, 190], pallor * 0.8);
  const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
  rg.addColorStop(0, `rgb(${rimColor.join(',')})`);
  rg.addColorStop(0.92, `rgb(${mix(rimColor, [220, 120, 90], 0.3).join(',')})`);
  rg.addColorStop(1, 'rgb(205, 110, 80)');
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  // cup: outline traced from the per-angle cup/disc ratio (photo: +v up => screen -y)
  ctx.beginPath();
  for (let i = 0; i <= 72; i++) {
    const raw = (i / 72) * Math.PI * 2; // 0 = nasal (+u)
    let clock = Math.PI - raw;
    if (clock > Math.PI) clock -= Math.PI * 2;
    const c = cup.cdrAt(clock);
    const x = cx + Math.cos(raw) * rx * c;
    const y = cy - Math.sin(raw) * ry * c;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
  cg.addColorStop(0, 'rgba(255, 248, 232, 1)');
  cg.addColorStop(0.6, 'rgba(250, 232, 205, 0.95)');
  cg.addColorStop(1, 'rgba(240, 210, 180, 0.85)');
  ctx.fillStyle = cg;
  ctx.fill();
  // lamina cribrosa pores become visible when the cup is deep
  if (damage > 0.45) {
    ctx.fillStyle = `rgba(150, 140, 130, ${(damage - 0.45) * 0.9})`;
    for (let i = 0; i < 26; i++) {
      const a = i * 2.39996;
      const rr = Math.sqrt(i / 26) * R * 0.45;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, R * 0.04, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

const _bgCache = new Map();
function backgroundCanvas(range, cu, cv) {
  const key = `${range}|${cu}|${cv}`;
  if (_bgCache.has(key)) return _bgCache.get(key);
  const n = 256;
  const c = document.createElement('canvas');
  c.width = c.height = n;
  const g = c.getContext('2d');
  const img = g.createImageData(n, n);
  const px = img.data;
  const fbm = makeFbm(5, 16, 16, 4);
  const F = DIMS.fovea;
  const s = n / (2 * range);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const u = cu + (x + 0.5 - n / 2) / s;
      const v = cv - (y + 0.5 - n / 2) / s;
      const nn = fbm(u * 0.35 + 50, v * 0.35 + 50);
      const n2 = fbm(u * 1.4 + 9, v * 1.4 + 3);
      const fd = Math.hypot(u - F.u, v - F.v);
      // darker macula (more pigment), lighter periphery
      const mac = Math.exp(-(fd * fd) / (2 * 2.2 * 2.2));
      const fov = Math.exp(-(fd * fd) / (2 * 0.55 * 0.55));
      const i = (y * n + x) * 4;
      px[i] = 201 - mac * 55 - fov * 35 + (nn - 0.5) * 30 + (n2 - 0.5) * 12;
      px[i + 1] = 96 - mac * 38 - fov * 22 + (nn - 0.5) * 16 + (n2 - 0.5) * 8;
      px[i + 2] = 58 - mac * 22 - fov * 12 + (nn - 0.5) * 10;
      px[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  _bgCache.set(key, c);
  return c;
}

function mix(a, b, t) {
  return a.map((x, i) => Math.round(x + (b[i] - x) * t));
}
