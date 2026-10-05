/**
 * Canvas drawings for the Diagnosis Clinic. All of them read the same patient state as
 * the 3D eye, so the photo, the scan and the field always agree with each other.
 */
import { DIMS } from '../config/anatomy.js';
import { paintFundus } from '../eye/fundusPainter.js';
import { rnflProfile } from '../eye/fundusData.js';

/** Fundus photograph centred on the optic disc. */
export function drawDiscPhoto(canvas, { vessels, fibres, damage, haemorrhage = false, range = 2.7 }) {
  const g = canvas.getContext('2d');
  paintFundus(g, {
    size: canvas.width,
    range,
    center: [DIMS.disc.u - 0.2, DIMS.disc.v],
    vessels,
    fibres,
    damage,
    drawDisc: true,
    photo: true,
    haemorrhage,
  });
}

/** Wide-field fundus photograph (disc + macula + arcades). */
export function drawWideFundus(canvas, { vessels, fibres, damage, haemorrhage = false }) {
  const g = canvas.getContext('2d');
  paintFundus(g, { size: canvas.width, range: 9.5, center: [0.6, 0], vessels, fibres, damage, drawDisc: true, photo: true, haemorrhage });
}

/**
 * OCT peripapillary RNFL: TSNIT thickness curve against the normal range,
 * plus a clock-sector summary.
 */
export function drawOCT(canvas, fibres, damage) {
  const g = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  g.fillStyle = '#0b1420';
  g.fillRect(0, 0, W, H);
  const { normal, measured } = rnflProfile(fibres, damage, 96);
  const padL = 56;
  const padR = 16;
  const padT = 26;
  const padB = 46;
  const x = (i) => padL + (i / (normal.length - 1)) * (W - padL - padR);
  const y = (v) => H - padB - (v / 200) * (H - padT - padB);
  // normative bands: red < 1st percentile, yellow 1–5th, green 5–95th, white > 95th
  const band = (lo, hi, col) => {
    g.fillStyle = col;
    g.beginPath();
    for (let i = 0; i < normal.length; i++) g.lineTo(x(i), y(normal[i] * hi));
    for (let i = normal.length - 1; i >= 0; i--) g.lineTo(x(i), y(normal[i] * lo));
    g.closePath();
    g.fill();
  };
  band(0, 0.62, 'rgba(255, 93, 108, 0.32)');
  band(0.62, 0.76, 'rgba(255, 189, 74, 0.35)');
  band(0.76, 1.26, 'rgba(73, 227, 160, 0.3)');
  band(1.26, 1.5, 'rgba(255, 255, 255, 0.12)');
  // axes
  g.strokeStyle = 'rgba(255,255,255,0.15)';
  g.lineWidth = 1;
  g.font = '20px Inter, sans-serif';
  g.fillStyle = 'rgba(220,235,250,0.7)';
  for (const v of [0, 50, 100, 150, 200]) {
    g.beginPath();
    g.moveTo(padL, y(v));
    g.lineTo(W - padR, y(v));
    g.stroke();
    g.fillText(String(v), 8, y(v) + 6);
  }
  const lab = ['T', 'S', 'N', 'I', 'T'];
  lab.forEach((l, i) => g.fillText(l, x((i / 4) * (normal.length - 1)) - 6, H - 14));
  g.save();
  g.translate(18, H / 2 + 40);
  g.rotate(-Math.PI / 2);
  g.fillText('µm', 0, 0);
  g.restore();
  // measured curve
  g.strokeStyle = '#ffffff';
  g.lineWidth = 3.5;
  g.beginPath();
  for (let i = 0; i < measured.length; i++) i ? g.lineTo(x(i), y(measured[i])) : g.moveTo(x(i), y(measured[i]));
  g.stroke();
  const avg = measured.reduce((a, b) => a + b, 0) / measured.length;
  const avgN = normal.reduce((a, b) => a + b, 0) / normal.length;
  // sector classification
  const sectors = { T: [], S: [], N: [], I: [] };
  for (let i = 0; i < measured.length; i++) {
    const a = i / measured.length;
    const k = a < 0.125 || a >= 0.875 ? 'T' : a < 0.375 ? 'S' : a < 0.625 ? 'N' : 'I';
    sectors[k].push(measured[i] / normal[i]);
  }
  const cls = (r) => (r < 0.62 ? 'red' : r < 0.76 ? 'yellow' : 'green');
  const out = {};
  for (const [k, arr] of Object.entries(sectors)) {
    const r = arr.reduce((a, b) => a + b, 0) / arr.length;
    out[k] = { ratio: r, cls: cls(r) };
  }
  return { avg, avgNormal: avgN, sectors: out, cls: cls(avg / avgN) };
}

/**
 * Gonioscopy view: looking into the drainage angle through a mirror lens.
 * From bottom to top: iris, ciliary body band, scleral spur, trabecular meshwork
 * (pigmented band), Schwalbe's line, cornea.
 */
export function drawGonio(canvas, v) {
  const g = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  // circular mirror view
  g.save();
  g.fillStyle = '#000';
  g.fillRect(0, 0, W, H);
  g.beginPath();
  g.arc(W / 2, H / 2, W * 0.48, 0, Math.PI * 2);
  g.clip();
  // structures as horizontal bands (heights in px)
  const bandH = H * 0.11;
  let yy = H * 0.18;
  const draw = (h, fill) => {
    g.fillStyle = fill;
    g.fillRect(0, yy, W, h);
    yy += h;
    return yy;
  };
  // cornea (bluish), Schwalbe's line, TM, spur, CBB, iris
  g.fillStyle = '#1d2c3a';
  g.fillRect(0, 0, W, yy);
  const ySchwalbe = draw(bandH * 0.12, '#f3efe6');
  const tmTop = yy;
  const pig = Math.min(1, v.pigment + v.tmClog * 0.3);
  const tmColor = mix([196, 160, 128], [70, 40, 25], pig);
  draw(bandH * 1.3, `rgb(${tmColor})`);
  const tmBottom = yy;
  const ySpur = draw(bandH * 0.35, '#f7f3ea');
  const cbbTop = yy;
  draw(bandH * (0.9 + (v.recession || 0)), '#4a3a35');
  const irisTop = yy;
  // iris surface with radial texture
  g.fillStyle = '#6b4a2f';
  g.fillRect(0, irisTop, W, H - irisTop);
  g.strokeStyle = 'rgba(30,18,10,0.35)';
  for (let i = 0; i < 60; i++) {
    const x = (i / 60) * W;
    g.beginPath();
    g.moveTo(x, irisTop);
    g.lineTo(x + 8, H);
    g.stroke();
  }
  // pigmentary: Sampaolesi line at Schwalbe's
  if (v.pigment > 0.2) {
    g.strokeStyle = `rgba(50,28,15,${v.pigment})`;
    g.lineWidth = 4;
    g.beginPath();
    for (let x = 0; x <= W; x += 10) g.lineTo(x, ySchwalbe - 2 + Math.sin(x * 0.05) * 3);
    g.stroke();
  }
  // exfoliation flecks
  if (v.pxf > 0.1) {
    g.fillStyle = 'rgba(250,250,245,0.85)';
    for (let i = 0; i < 120 * v.pxf; i++) {
      const x = (i * 97) % W;
      const y = tmTop + ((i * 37) % 100) / 100 * (irisTop - tmTop + 20);
      g.beginPath();
      g.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
      g.fill();
    }
  }
  // new vessels crossing the spur and branching on the meshwork
  if (v.neovasc > 0.1) {
    g.strokeStyle = `rgba(220,40,40,${0.5 + 0.5 * v.neovasc})`;
    g.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      let x = ((i + 0.5) / 14) * W;
      let y = irisTop + 20;
      g.beginPath();
      g.moveTo(x, y);
      for (let k = 0; k < 9; k++) {
        x += Math.sin(i * 3 + k) * 12;
        y -= (irisTop - tmTop) / 7;
        g.lineTo(x, y);
      }
      g.stroke();
    }
  }
  // inflammatory precipitates
  if (v.inflammation > 0.1) {
    g.fillStyle = 'rgba(240,240,230,0.8)';
    for (let i = 0; i < 50 * v.inflammation; i++) {
      g.beginPath();
      g.arc((i * 61) % W, tmTop + ((i * 29) % 60), 3, 0, Math.PI * 2);
      g.fill();
    }
  }
  // closure: the iris rises and hides structures (appositional / synechial)
  const closure = Math.min(1, v.closure);
  if (closure > 0.01) {
    const riseTo = irisTop - closure * (irisTop - ySchwalbe + 6);
    g.fillStyle = '#6b4a2f';
    g.beginPath();
    g.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) {
      // synechiae look like tents
      const tent = Math.max(0, Math.sin(x * 0.035) * 0.4 + 0.6);
      g.lineTo(x, irisTop - (irisTop - riseTo) * (0.65 + 0.35 * tent));
    }
    g.lineTo(W, H);
    g.closePath();
    g.fill();
  }
  g.restore();
  // ring
  g.strokeStyle = 'rgba(255,255,255,0.25)';
  g.lineWidth = 3;
  g.beginPath();
  g.arc(W / 2, H / 2, W * 0.48, 0, Math.PI * 2);
  g.stroke();
  // labels on the left
  const labels = [
    ['Cornea', H * 0.1],
    ["Schwalbe's line", ySchwalbe - 4],
    ['Trabecular meshwork', (tmTop + tmBottom) / 2],
    ['Scleral spur', ySpur - bandH * 0.18],
    ['Ciliary body band', (cbbTop + irisTop) / 2],
    ['Iris', irisTop + 40],
  ];
  // label the bands that are still visible
  const covered = closure > 0.01 ? irisTop - closure * (irisTop - ySchwalbe + 6) * 0.82 : H;
  g.font = `600 ${Math.round(W / 34)}px Inter, sans-serif`;
  g.textAlign = 'right';
  for (const [text, yy2] of labels) {
    if (yy2 > covered && text !== 'Iris') continue;
    const ly = text === 'Iris' ? Math.max(covered + 30, yy2) : yy2;
    g.fillStyle = 'rgba(0,0,0,0.55)';
    const tw = g.measureText(text).width;
    g.fillRect(W * 0.86 - tw - 8, ly - W / 34, tw + 16, W / 34 + 10);
    g.fillStyle = '#fff';
    g.fillText(text, W * 0.86, ly + 2);
  }
  g.textAlign = 'left';
  // Shaffer grade from how much is visible
  const visible = closure < 0.15 ? 4 : closure < 0.4 ? 3 : closure < 0.65 ? 2 : closure < 0.9 ? 1 : 0;
  return { labels, grade: visible };
}

/** Animated air-puff tonometer: a cornea cross-section that flattens. */
export function drawTonometer(canvas, t, iop) {
  const g = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  g.fillStyle = '#0b1420';
  g.fillRect(0, 0, W, H);
  // puff timeline: 0..1 approach, flatten, recover
  const flat = Math.max(0, Math.sin(Math.min(1, Math.max(0, (t - 0.3) / 0.5)) * Math.PI));
  // higher pressure resists flattening a little longer — purely illustrative
  const cx = W * 0.62;
  const cy = H * 0.5;
  const R = H * 0.42;
  g.lineWidth = 10;
  g.strokeStyle = 'rgba(160,220,245,0.9)';
  g.beginPath();
  for (let a = -1.0; a <= 1.0; a += 0.02) {
    let x = cx - Math.cos(a) * R * 0.55;
    const y = cy + Math.sin(a) * R;
    // flatten the apex
    const apex = cx - R * 0.55;
    const flatX = apex + flat * R * 0.12;
    if (x < flatX) x = flatX;
    if (a === -1.0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.stroke();
  // iris & lens hint
  g.fillStyle = 'rgba(120,80,50,0.8)';
  g.fillRect(cx - 4, cy - R * 0.85, 10, R * 0.6);
  g.fillRect(cx - 4, cy + R * 0.25, 10, R * 0.6);
  g.fillStyle = 'rgba(245,225,160,0.4)';
  g.beginPath();
  g.ellipse(cx + 40, cy, 34, R * 0.45, 0, 0, Math.PI * 2);
  g.fill();
  // air puff
  if (t > 0.05 && t < 0.85) {
    const k = Math.min(1, (t - 0.05) / 0.3);
    for (let i = 0; i < 9; i++) {
      const yy = cy + (i - 4) * 9;
      g.strokeStyle = `rgba(255,255,255,${0.15 + 0.05 * (i % 3)})`;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(40, yy);
      g.lineTo(40 + k * (cx - R * 0.55 - 60), yy);
      g.stroke();
    }
  }
  // nozzle
  g.fillStyle = '#3b4a5c';
  g.fillRect(0, cy - 30, 44, 60);
  g.fillStyle = 'rgba(220,235,250,0.75)';
  g.font = '20px Inter, sans-serif';
  g.fillText('air', 6, cy + 54);
  if (t >= 0.85) {
    g.fillStyle = '#fff';
    g.font = 'bold 34px Space Grotesk, Inter, sans-serif';
    g.fillText(`${iop.toFixed(0)} mmHg`, W * 0.06, H * 0.18);
  }
}

function mix(a, b, t) {
  return a.map((x, i) => Math.round(x + (b[i] - x) * t)).join(',');
}
