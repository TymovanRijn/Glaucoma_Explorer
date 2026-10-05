/**
 * ANATOMY DIMENSIONS — the single source of truth for the shape of the eye.
 *
 * Units: 1 unit = 1 millimetre. The eye is ~24 mm long, so you are exploring at true scale.
 *
 * "Lathe space": most of the eye is rotationally symmetric around its optical axis, so we
 * describe each structure as a 2D outline (a "profile") of points [r, y] where
 *   y = position along the optical axis (cornea at +y, back of the eye at -y)
 *   r = distance from the axis.
 * Spinning a profile around the axis (like a potter's wheel / lathe) creates the 3D part.
 * The same profiles are used for: the 3D meshes, the minimap, and "where am I?" detection.
 *
 * Very small structures (Schlemm's canal, the trabecular meshwork, retinal vessels) are
 * drawn slightly larger than life so that they can actually be seen and explored.
 */

export const DEG = Math.PI / 180;

/** Polar helper: radius R from the eye centre at latitude `deg` -> [r, y]. */
export const pol = (R, deg) => [R * Math.cos(deg * DEG), R * Math.sin(deg * DEG)];

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export const DIMS = {
  // Coats of the eyeball (radii from the eye centre)
  conjunctivaR: 11.56,
  scleraOuterR: 11.5,
  scleraInnerR: 10.85,
  choroidOuterR: 10.83,
  choroidInnerR: 10.64,
  retinaOuterR: 10.62,
  retinaInnerR: 10.42,

  // Cornea: a dome with a tighter curvature than the sclera
  corneaApexY: 12.5,
  corneaOuterRadius: 7.8,
  corneaThickness: 0.55,
  corneaInnerRadius: 6.6,

  // Crystalline lens
  lens: { frontY: 8.85, equatorY: 7.35, backY: 4.85, equatorR: 4.6 },

  // Landmarks on the inner wall (latitude in degrees from the equator plane)
  spurDeg: 56.4, // scleral spur
  oraDeg: 26, // ora serrata: where the light-sensing retina ends

  // Iris
  irisRootFront: [5.97, 8.66],
  irisRootBack: [5.93, 8.34],
  pupilRadius: 1.8,

  // Schlemm's canal (a ring-shaped drain inside the wall)
  schlemmDeg: 58.6,
  schlemmR: 11.12,
  schlemmTube: 0.13,

  // Back of the eye, in "fundus coordinates" (mm across the retina surface,
  // measured from the posterior pole: u = towards the nose, v = upwards).
  fovea: { u: -1.5, v: -0.3 },
  disc: { u: 3.0, v: 0.15, radius: 0.9 },
  maculaRadius: 2.75,
  fundusPatchRadius: 15.5,
};

// ---- Derived corneal geometry ------------------------------------------------------------
DIMS.corneaOuterCenterY = DIMS.corneaApexY - DIMS.corneaOuterRadius;
DIMS.corneaInnerCenterY = DIMS.corneaApexY - DIMS.corneaThickness - DIMS.corneaInnerRadius;

/** Intersection of a sphere centred at the origin (radius Rs) and one centred on the axis at c (radius Rc). */
function sphereIntersect(Rs, c, Rc) {
  const y = (Rs * Rs - Rc * Rc + c * c) / (2 * c);
  return [Math.sqrt(Rs * Rs - y * y), y];
}
// Limbus = where the clear cornea meets the white sclera (outside surface)
DIMS.limbusOuter = sphereIntersect(DIMS.scleraOuterR, DIMS.corneaOuterCenterY, DIMS.corneaOuterRadius);
// Schwalbe's line = inner edge of the cornea, the front border of the drainage angle
DIMS.limbusInner = sphereIntersect(DIMS.scleraInnerR, DIMS.corneaInnerCenterY, DIMS.corneaInnerRadius);
DIMS.schwalbeDeg = Math.atan2(DIMS.limbusInner[1], DIMS.limbusInner[0]) / DEG;
DIMS.limbusOuterDeg = Math.atan2(DIMS.limbusOuter[1], DIMS.limbusOuter[0]) / DEG;

export const corneaOuterY = (r) => DIMS.corneaOuterCenterY + Math.sqrt(Math.max(0, DIMS.corneaOuterRadius ** 2 - r * r));
export const corneaInnerY = (r) => DIMS.corneaInnerCenterY + Math.sqrt(Math.max(0, DIMS.corneaInnerRadius ** 2 - r * r));
export const scleraInnerY = (r) => Math.sqrt(Math.max(0, DIMS.scleraInnerR ** 2 - r * r));

/** The inner front wall of the eye (cornea, then the corneoscleral wall with the drain). */
export function innerWallY(r) {
  return r <= DIMS.limbusInner[0] ? corneaInnerY(r) : scleraInnerY(r);
}

export function lensFrontY(r) {
  const L = DIMS.lens;
  const t = clamp(r / L.equatorR, 0, 1);
  return L.equatorY + (L.frontY - L.equatorY) * Math.sqrt(1 - t * t);
}
export function lensBackY(r) {
  const L = DIMS.lens;
  const t = clamp(r / L.equatorR, 0, 1);
  return L.equatorY - (L.equatorY - L.backY) * Math.sqrt(1 - t * t);
}

// ---- Profiles ------------------------------------------------------------------------------
function arc(R, fromDeg, toDeg, steps) {
  const pts = [];
  for (let i = 0; i <= steps; i++) pts.push(pol(R, lerp(fromDeg, toDeg, i / steps)));
  return pts;
}

/** Sclera: closed outline (outer surface -> limbus -> inner surface). */
export function scleraProfile() {
  const outer = arc(DIMS.scleraOuterR, -90, DIMS.limbusOuterDeg, 90);
  const inner = arc(DIMS.scleraInnerR, DIMS.schwalbeDeg, -90, 90);
  return [...outer, ...inner];
}

export function scleraOuterProfile() {
  return arc(DIMS.scleraOuterR, -90, DIMS.limbusOuterDeg, 100);
}
export function scleraInnerProfile() {
  return arc(DIMS.scleraInnerR, DIMS.schwalbeDeg, -90, 100);
}

/** Cornea: closed outline from the apex, along the front, round the limbus and back along the inside. */
export function corneaProfile() {
  const pts = [];
  const n = 40;
  const rOut = DIMS.limbusOuter[0];
  const rIn = DIMS.limbusInner[0];
  for (let i = 0; i <= n; i++) {
    const r = rOut * Math.sin((i / n) * Math.PI / 2);
    pts.push([r, corneaOuterY(r)]);
  }
  for (let i = n; i >= 0; i--) {
    const r = rIn * Math.sin((i / n) * Math.PI / 2);
    pts.push([r, corneaInnerY(r)]);
  }
  return pts;
}

export function corneaOuterProfile() {
  const pts = [];
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const r = DIMS.limbusOuter[0] * Math.sin((i / n) * Math.PI / 2);
    pts.push([r, corneaOuterY(r)]);
  }
  return pts;
}
export function corneaInnerProfile() {
  const pts = [];
  const n = 48;
  for (let i = n; i >= 0; i--) {
    const r = DIMS.limbusInner[0] * Math.sin((i / n) * Math.PI / 2);
    pts.push([r, corneaInnerY(r)]);
  }
  return pts;
}

/** Crystalline lens: closed outline (front pole -> equator -> back pole). */
export function lensProfile(scale = 1) {
  const L = DIMS.lens;
  const pts = [];
  const n = 36;
  const cy = L.equatorY;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI / 2;
    pts.push([L.equatorR * Math.sin(a) * scale, cy + (L.frontY - cy) * Math.cos(a) * scale]);
  }
  for (let i = 1; i <= n; i++) {
    const a = (i / n) * Math.PI / 2;
    pts.push([L.equatorR * Math.cos(a) * scale, cy - (cy - L.backY) * Math.sin(a) * scale]);
  }
  return pts;
}

/**
 * Iris outline. Parameters let the simulator deform it:
 *   pupil   – pupil radius in mm
 *   bow     – forward bowing of the mid-iris (iris bombé, + forward / − backward)
 *   closure – 0..1 how far the peripheral iris is pressed against the drain (angle closure)
 *   thick   – thickness multiplier
 */
export function irisProfile({ pupil = DIMS.pupilRadius, bow = 0, closure = 0, thick = 1 } = {}) {
  const [rootFR, rootFY] = DIMS.irisRootFront;
  const [rootBR, rootBY] = DIMS.irisRootBack;
  const rp = clamp(pupil, 0.7, 3.6);
  const y0 = lensFrontY(rp) + 0.025;
  const n = 34;
  const front = [];
  const back = [];
  // A more dilated pupil bunches the iris up and makes it thicker
  const bunch = 1 + smoothstep(1.8, 3.6, rp) * 0.6;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const rB = lerp(rp, rootBR, t);
    const rF = lerp(rp, rootFR, t);
    let yB = lerp(y0, rootBY, Math.pow(t, 1.3));
    // Never sink into the lens
    yB = Math.max(yB, lensFrontY(rB) + 0.02);
    // Thickness: thin at the pupil margin, thickest at the collarette, thinning to the root
    const collarette = Math.exp(-((t - 0.3) ** 2) / 0.02) * 0.14;
    const thickness = (0.12 + 0.27 * Math.sin(Math.PI * Math.pow(t, 0.62)) * (1 - 0.3 * t) + collarette) * thick * bunch;
    let yF = yB + thickness;
    // Bowing (iris bombé when positive, concave iris in pigment dispersion when negative)
    const b = bow * Math.sin(Math.PI * Math.pow(t, 1.5));
    yB += b;
    yF += b;
    // Angle closure: the peripheral iris is pushed up against the trabecular meshwork
    if (closure > 0) {
      const w = closure * smoothstep(0.58, 0.93, t) * (1 - smoothstep(0.975, 1.0, t));
      const target = innerWallY(rF) - 0.03;
      const dy = Math.max(0, target - yF) * w;
      yF += dy;
      yB += dy;
    }
    // Never pass through the cornea / outer wall
    const wall = innerWallY(rF) - 0.02;
    if (yF > wall) {
      yB -= yF - wall;
      yF = wall;
    }
    front.push([rF, yF]);
    back.push([rB, yB]);
  }
  // pupil margin rounding
  const loop = [...front.slice().reverse(), ...back];
  return { front, back, loop };
}

/** Ciliary body: the muscular ring behind the iris that produces aqueous humour and focuses the lens. */
export function ciliaryProfile() {
  return [
    pol(10.84, 56.2),
    pol(10.84, 48),
    pol(10.84, 40),
    pol(10.84, 33),
    pol(10.84, DIMS.oraDeg),
    pol(10.63, DIMS.oraDeg),
    pol(10.6, 33),
    pol(10.55, 40),
    pol(10.25, 44),
    pol(9.7, 47.5),
    pol(9.55, 50.5),
    pol(9.8, 53.2),
    pol(10.25, 54.8),
    pol(10.42, 55.2),
    pol(10.6, 55.6),
  ];
}

/** Trabecular meshwork: a thin spongy band on the inner wall between Schwalbe's line and the scleral spur. */
export function trabecularProfile() {
  const a0 = DIMS.schwalbeDeg - 0.15;
  const a1 = DIMS.spurDeg;
  const outer = arc(DIMS.scleraInnerR + 0.01, a0, a1, 10);
  const inner = arc(DIMS.scleraInnerR - 0.17, a1 + 0.3, a0 - 0.2, 10);
  return [...outer, ...inner];
}

/** Scleral spur: a small inward ridge of sclera (anchor of the ciliary muscle). */
export function spurProfile() {
  const a = DIMS.spurDeg;
  return [pol(10.86, a + 0.35), pol(10.86, a - 0.6), pol(10.6, a - 0.25), pol(10.66, a + 0.15)];
}

function shell(R0, R1, fromDeg, toDeg, steps = 90) {
  return [...arc(R0, fromDeg, toDeg, steps), ...arc(R1, toDeg, fromDeg, steps)];
}

export function choroidProfile() {
  return shell(DIMS.choroidOuterR, DIMS.choroidInnerR, -90, DIMS.oraDeg + 0.5);
}
export function retinaProfile() {
  return shell(DIMS.retinaOuterR, DIMS.retinaInnerR, -90, DIMS.oraDeg);
}
export function retinaInnerProfile() {
  return arc(DIMS.retinaInnerR, -90, DIMS.oraDeg, 110);
}
export function conjunctivaProfile() {
  return arc(DIMS.conjunctivaR, DIMS.limbusOuterDeg - 0.4, 8, 50).reverse();
}

// ---- Fundus mapping (azimuthal-equidistant around the posterior pole) ----------------------
/**
 * Convert fundus coordinates (u nasal, v superior, in mm along the retina) to a point in
 * lathe space on a sphere of radius R. Lathe axes: +x = nasal, -z = superior, -y = back.
 */
export function fundusToLathe(u, v, R = DIMS.retinaInnerR, out = [0, 0, 0]) {
  const d = Math.hypot(u, v);
  const th = d / DIMS.retinaInnerR;
  const s = Math.sin(th);
  if (d < 1e-9) {
    out[0] = 0;
    out[1] = -R;
    out[2] = 0;
    return out;
  }
  out[0] = (R * s * u) / d;
  out[1] = -R * Math.cos(th);
  out[2] = (-R * s * v) / d;
  return out;
}

/** Inverse of fundusToLathe (ignores radius). Returns [u, v]. */
export function latheToFundus(x, y, z) {
  const R = Math.hypot(x, y, z) || 1;
  const th = Math.acos(clamp(-y / R, -1, 1));
  const h = Math.hypot(x, z);
  if (h < 1e-9) return [0, 0];
  const d = th * DIMS.retinaInnerR;
  return [(d * x) / h, (d * -z) / h];
}

// ---- Region detection ("Where am I?") ------------------------------------------------------
export function pointInPolygon(r, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ri, yi] = poly[i];
    const [rj, yj] = poly[j];
    if (yi > y !== yj > y && r < ((rj - ri) * (y - yi)) / (yj - yi) + ri) inside = !inside;
  }
  return inside;
}

const _cil = ciliaryProfile();
const _lens = lensProfile();

/**
 * Which anatomical region contains the lathe-space point (x, y, z)?
 * `iris` is the current iris outline (it moves in angle-closure), `nerve` an optional test.
 */
export function regionAt(x, y, z, iris, nerveTest) {
  const r = Math.hypot(x, z);
  const d = Math.hypot(r, y);
  if (nerveTest && nerveTest(x, y, z)) return 'optic-nerve';

  const inCorneaOuter = Math.hypot(r, y - DIMS.corneaOuterCenterY) < DIMS.corneaOuterRadius;
  const inCorneaInner = Math.hypot(r, y - DIMS.corneaInnerCenterY) < DIMS.corneaInnerRadius;
  const frontZone = y > DIMS.limbusInner[1] - 0.2;

  if (d > DIMS.scleraOuterR && !(inCorneaOuter && y > DIMS.limbusOuter[1] - 0.3)) return 'outside';
  if (frontZone && inCorneaOuter && !inCorneaInner && r < DIMS.limbusOuter[0] + 0.1) return 'cornea';
  if (d > DIMS.scleraInnerR && !(frontZone && inCorneaInner)) return 'sclera';
  if (pointInPolygon(r, y, _cil)) return 'ciliary-body';
  if (pointInPolygon(r, y, _lens)) return 'lens';
  if (iris && pointInPolygon(r, y, iris.loop)) return 'iris';

  const latitude = Math.atan2(y, r) / DEG;
  if (latitude < DIMS.oraDeg) {
    if (d > DIMS.choroidInnerR) return 'choroid';
    if (d > DIMS.retinaInnerR) return 'retina';
  }

  // In front of the iris / lens -> anterior chamber
  if (iris) {
    const fr = iris.front;
    const rp = fr[0][0];
    const rootR = fr[fr.length - 1][0];
    if (r <= rp) {
      if (y > lensFrontY(r) && y > fr[0][1] - 0.05) return 'anterior-chamber';
    } else if (r <= rootR) {
      const t = (r - rp) / (rootR - rp);
      const k = Math.min(fr.length - 2, Math.floor(t * (fr.length - 1)));
      const f = t * (fr.length - 1) - k;
      const yF = lerp(fr[k][1], fr[k + 1][1], f);
      const bk = iris.back;
      const yB = lerp(bk[k][1], bk[k + 1][1], f);
      if (y > yF) return 'anterior-chamber';
      if (y < yB && y > DIMS.lens.equatorY - 0.6 && r > lensFrontRadiusAt(y)) return 'posterior-chamber';
      if (y < yB && y > lensFrontY(r)) return 'posterior-chamber';
    } else if (y > 8.4) {
      return 'anterior-chamber';
    }
  }
  if (y > DIMS.lens.equatorY - 0.7 && r > DIMS.lens.equatorR - 0.4 && r < 6.4 && y < 8.7) return 'posterior-chamber';
  return 'vitreous';
}

function lensFrontRadiusAt(y) {
  const L = DIMS.lens;
  if (y <= L.equatorY) return L.equatorR;
  const t = clamp((y - L.equatorY) / (L.frontY - L.equatorY), 0, 1);
  return L.equatorR * Math.sqrt(1 - t * t);
}

export { clamp, lerp, smoothstep };
