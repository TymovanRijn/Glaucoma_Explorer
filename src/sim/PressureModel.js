/**
 * THE PRESSURE MODEL
 *
 * Eye pressure (intraocular pressure, IOP) follows the Goldmann equation:
 *
 *        IOP = (F − U) / C + EVP
 *
 *   F   aqueous production by the ciliary body (µL/min)            ~2.5
 *   U   "uveoscleral" outflow through the back door (µL/min)       ~0.4
 *   C   ease of outflow through the trabecular meshwork (µL/min/mmHg) ~0.28
 *   EVP pressure in the episcleral veins the drain empties into (mmHg) ~9
 *
 * Every type of glaucoma and every treatment changes one or more of these numbers.
 * Optic-nerve damage accumulates when IOP stays above what *that* nerve can tolerate.
 *
 * NOTE: this is a teaching model with simplified numbers — not a medical calculator.
 */
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export const NORMAL = { F: 2.5, U: 0.4, C: 0.28, EVP: 9 };

/**
 * Scenario parameters. `progress(t)` = disease severity (0..1) at time t.
 * `apply(s, p, t)` changes the physiology and appearance for severity p.
 */
export const SCENARIOS = {
  healthy: {
    unit: 'years',
    duration: 20,
    age: 45,
    tolerance: 24,
    damageK: 0.004,
    progress: () => 0,
    apply() {},
    treatments: [],
    view: 'overview',
  },
  oht: {
    unit: 'years',
    duration: 20,
    age: 50,
    tolerance: 31, // this nerve copes with higher pressure
    damageK: 0.004,
    progress: (t) => smooth(0, 4, t),
    apply(s, p) {
      s.C *= lerp(1, 0.5, p);
      s.tmClog = 0.25 * p;
      s.tmTint = '#b6957a';
    },
    treatments: ['prostaglandin', 'betablocker', 'slt'],
    view: 'angle',
  },
  poag: {
    unit: 'years',
    duration: 20,
    age: 55,
    tolerance: 21,
    damageK: 0.0052,
    progress: (t) => smooth(0, 10, t),
    apply(s, p) {
      s.C *= lerp(1, 0.37, p);
      s.tmClog = 0.7 * p;
      s.tmTint = mixHex('#c49a78', '#8d7b69', p);
    },
    treatments: ['prostaglandin', 'betablocker', 'cai', 'alpha', 'rock', 'slt', 'migs', 'trabeculectomy', 'tube'],
    view: 'angle',
  },
  ntg: {
    unit: 'years',
    duration: 20,
    age: 60,
    tolerance: 12.5, // a fragile nerve: damaged even at "normal" pressure
    damageK: 0.0062,
    progress: (t) => smooth(0, 6, t),
    apply(s, p) {
      s.C *= lerp(1, 0.92, p);
      s.tmClog = 0.08 * p;
      s.discHaemorrhage = p > 0.3;
    },
    treatments: ['prostaglandin', 'betablocker', 'alpha', 'slt', 'trabeculectomy'],
    view: 'disc',
  },
  acute: {
    unit: 'hours',
    duration: 48,
    age: 65,
    tolerance: 21,
    damageK: 0.00032,
    // the attack starts after 2 hours (e.g. in a dark cinema the pupil widens)
    progress: (t) => smooth(1.5, 3.5, t),
    apply(s, p, t, tr) {
      const relieved = tr.has('iridotomy') || tr.has('lensExtraction');
      const piloHelp = tr.has('pilocarpine') ? 0.55 : 0;
      const block = relieved ? 0 : p * (1 - piloHelp);
      s.pupil = relieved ? 1.6 : lerp(1.8, tr.has('pilocarpine') ? 1.0 : 2.7, p);
      s.pupilPass = 1 - 0.95 * block;
      s.bow = 0.45 * block;
      s.closure = block;
      s.anglePass = 1 - 0.96 * block;
      // the sudden pressure spike swells the cornea and inflames the eye
      s.edemaBase = 0.85 * block;
      s.redness = 0.9 * block + (p > 0.5 ? 0.15 : 0);
    },
    treatments: ['acetazolamide', 'pilocarpine', 'iridotomy', 'lensExtraction'],
    view: 'angle',
  },
  chronicClosure: {
    unit: 'years',
    duration: 20,
    age: 62,
    tolerance: 21,
    damageK: 0.0052,
    progress: (t) => smooth(0, 12, t),
    apply(s, p, t, tr) {
      // scars (synechiae) slowly zip the angle shut; laser iridotomy / lens surgery stop progression
      const tFix = tr.get('iridotomy') ?? tr.get('lensExtraction');
      const relieved = tFix !== undefined;
      const syn = relieved ? Math.min(p, SCENARIOS.chronicClosure.progress(tFix)) : p;
      s.bow = relieved ? 0.05 : 0.22;
      s.closure = 0.75 * syn;
      s.anglePass = 1 - 0.6 * syn;
      s.tmClog = 0.3 * syn;
      s.tmTint = '#8a6a52';
      s.pupilPass = relieved ? 1 : 0.8;
    },
    treatments: ['iridotomy', 'lensExtraction', 'prostaglandin', 'betablocker', 'trabeculectomy'],
    view: 'angle',
  },
  pigmentary: {
    unit: 'years',
    duration: 20,
    age: 32,
    tolerance: 21,
    damageK: 0.005,
    progress: (t) => smooth(0, 9, t),
    apply(s, p) {
      s.bow = -0.22; // the iris bows backwards and rubs against the zonules
      s.pigment = Math.min(1, 0.3 + p);
      s.C *= lerp(1, 0.4, p);
      s.tmClog = 0.65 * p;
      s.tmTint = mixHex('#c49a78', '#3f2618', Math.min(1, p * 1.3));
    },
    treatments: ['prostaglandin', 'betablocker', 'slt', 'iridotomy', 'trabeculectomy'],
    view: 'angle',
  },
  pxf: {
    unit: 'years',
    duration: 20,
    age: 70,
    tolerance: 21,
    damageK: 0.006,
    progress: (t) => smooth(0, 8, t),
    apply(s, p, t) {
      s.pxf = Math.min(1, 0.35 + p);
      s.C *= lerp(1, 0.33, p);
      s.tmClog = 0.75 * p;
      s.tmTint = mixHex('#c49a78', '#6b5444', p);
      // pressure in exfoliation glaucoma tends to swing up and down
      s.EVP += Math.sin(t * 6.3) * 1.6 * p;
    },
    treatments: ['prostaglandin', 'betablocker', 'cai', 'slt', 'trabeculectomy', 'tube'],
    view: 'angle',
  },
  neovascular: {
    unit: 'years',
    duration: 4,
    age: 58,
    tolerance: 21,
    damageK: 0.02,
    progress: (t) => smooth(0, 1.6, t),
    apply(s, p, t, tr) {
      const vegfOff = tr.has('antivegf');
      const v = vegfOff ? p * 0.25 : p;
      s.neovasc = v;
      s.C *= lerp(1, 0.25, v);
      // the fibrovascular membrane contracts and zips the angle shut
      const zip = smooth(0.5, 1, p) * (vegfOff ? 0.5 : 1);
      s.closure = 0.6 * zip;
      s.anglePass = 1 - 0.7 * zip;
      s.tmClog = 0.6 * v;
      s.tmTint = mixHex('#c49a78', '#a3352c', v);
      s.redness = 0.5 * v;
      s.edemaBase = 0.3 * v;
    },
    treatments: ['antivegf', 'cai', 'betablocker', 'tube', 'cyclo'],
    view: 'angle',
  },
  uveitic: {
    unit: 'years',
    duration: 6,
    age: 40,
    tolerance: 21,
    damageK: 0.012,
    progress: (t) => smooth(0, 1.2, t),
    apply(s, p, t, tr) {
      const calm = tr.has('antiinflammatory') ? 0.2 : 1;
      s.inflammation = p * calm;
      s.C *= lerp(1, 0.45, p * calm);
      s.tmClog = 0.5 * p * calm;
      s.tmTint = '#d8cbb4';
      s.redness = 0.45 * p * calm;
      s.pupil = lerp(1.8, 1.3, p * calm);
    },
    treatments: ['antiinflammatory', 'betablocker', 'cai', 'tube'],
    view: 'angle',
  },
  steroid: {
    unit: 'years',
    duration: 6,
    age: 35,
    tolerance: 21,
    damageK: 0.012,
    progress: (t) => smooth(0.05, 0.8, t),
    apply(s, p, t, tr) {
      // stopping the steroid lets the meshwork recover (often over weeks to months)
      const off = tr.has('steroidStop') ? Math.max(0, 1 - (t - (tr.get('steroidStop') ?? t)) / 0.5) : 1;
      const q = p * off;
      s.C *= lerp(1, 0.4, q);
      s.tmClog = 0.6 * q;
      s.tmTint = '#d6ccb6';
    },
    treatments: ['steroidStop', 'prostaglandin', 'betablocker', 'slt'],
    view: 'angle',
  },
  congenital: {
    unit: 'years',
    duration: 6,
    age: 0,
    tolerance: 19,
    damageK: 0.01,
    progress: (t) => smooth(0, 1, t),
    apply(s, p, t, tr) {
      const fixed = tr.has('goniotomy');
      s.C *= fixed ? 0.85 : lerp(0.55, 0.32, p);
      s.tmClog = fixed ? 0.15 : 0.8;
      s.tmTint = '#d9cdbd';
      // a baby's eye is stretchy: high pressure enlarges it ("buphthalmos") and clouds the cornea
      s.globeScale = 1 + (fixed ? 0.08 : 0.14) * Math.max(p, 0.6);
      s.edemaBase = fixed ? 0.1 : 0.5;
    },
    treatments: ['goniotomy', 'betablocker', 'cai'],
    view: 'overview',
  },
};

export const TREATMENTS = {
  prostaglandin: (s) => {
    s.U *= 2.8;
  },
  betablocker: (s) => {
    s.F *= 0.73;
  },
  cai: (s) => {
    s.F *= 0.8;
  },
  alpha: (s) => {
    s.F *= 0.86;
    s.U *= 1.3;
  },
  rock: (s) => {
    s.C *= 1.3;
    s.EVP -= 1.5;
  },
  pilocarpine: (s) => {
    s.C *= 1.2;
  },
  slt: (s) => {
    s.C *= 1.45;
  },
  migs: (s) => {
    s.C *= 1.6;
  },
  trabeculectomy: (s) => {
    s.Cbypass += 0.3;
  },
  tube: (s) => {
    s.Cbypass += 0.24;
  },
  cyclo: (s) => {
    s.F *= 0.55;
  },
  acetazolamide: (s) => {
    s.F *= 0.55;
  },
  iridotomy: () => {},
  lensExtraction: (s) => {
    s.C *= 1.1;
  },
  antivegf: () => {},
  antiinflammatory: () => {},
  steroidStop: () => {},
  goniotomy: () => {},
};

export class PressureModel {
  constructor() {
    this.reset('healthy');
  }

  reset(id) {
    this.id = id;
    this.sc = SCENARIOS[id];
    this.t = 0;
    this.damage = id === 'healthy' ? 0 : 0;
    this.treatments = new Map(); // id -> time started
    this.history = [];
    this.peakIOP = 0;
    this.compute();
  }

  toggleTreatment(tid) {
    if (this.treatments.has(tid)) this.treatments.delete(tid);
    else this.treatments.set(tid, this.t);
    this.compute();
  }

  /** Recompute physiology for the current time and treatments. */
  compute() {
    const s = {
      F: NORMAL.F,
      U: NORMAL.U,
      C: NORMAL.C,
      EVP: NORMAL.EVP,
      Cbypass: 0,
      pupil: 1.8,
      pupilPass: 1,
      anglePass: 1,
      bow: 0,
      closure: 0,
      tmClog: 0,
      tmTint: '#c49a78',
      pigment: 0,
      pxf: 0,
      neovasc: 0,
      inflammation: 0,
      edemaBase: 0,
      redness: 0,
      globeScale: 1,
      discHaemorrhage: false,
    };
    const p = this.sc.progress(this.t);
    this.progress = p;
    this.sc.apply(s, p, this.t, this.treatments);
    const C0 = s.C; // disease-modified facility before drugs/lasers
    for (const tid of this.treatments.keys()) TREATMENTS[tid]?.(s);
    // Outflow: meshwork route only works if fluid can reach it (open pupil, open angle)
    const reach = s.pupilPass;
    const Ceff = s.C * s.anglePass * (0.08 + 0.92 * reach) + s.Cbypass;
    const Ueff = s.U * Math.min(s.anglePass, 0.4 + 0.6 * reach);
    let iop = (s.F - Ueff) / Math.max(0.045, Ceff) + s.EVP;
    iop = clamp(iop, 6, 72);
    s.IOP = iop;
    s.Ceff = Ceff;
    s.Ueff = Ueff;
    // what the droplets in the 3D view should do
    s.tmPass = clamp((s.C / NORMAL.C) * 0.9, 0.04, 1) * (s.tmClog > 0.05 ? 1 : 1);
    if (s.Cbypass > 0) s.tmPass = Math.max(s.tmPass, 0.8);
    s.flow = s.F / NORMAL.F;
    s.uveoFraction = clamp(Ueff / s.F, 0.03, 0.6);
    // corneal swelling follows sudden very high pressure
    s.edema = clamp(s.edemaBase * smooth(28, 50, iop) + (this.id === 'congenital' ? s.edemaBase : 0), 0, 1);
    s.C0 = C0;
    this.state = s;
    return s;
  }

  /** Advance simulated time by dtUnits (years or hours) and accumulate nerve damage. */
  step(dtUnits) {
    if (this.t >= this.sc.duration) return false;
    this.t = Math.min(this.sc.duration, this.t + dtUnits);
    const s = this.compute();
    const excess = Math.max(0, s.IOP - this.sc.tolerance);
    const rate = this.sc.damageK * Math.pow(excess, 1.15);
    // damage is permanent: it can only go up
    this.damage = Math.min(1, this.damage + rate * dtUnits);
    this.peakIOP = Math.max(this.peakIOP, s.IOP);
    this.history.push({ t: this.t, iop: s.IOP, damage: this.damage });
    if (this.history.length > 600) this.history.shift();
    return true;
  }

  /** Visual parameters for the 3D eye. */
  visual() {
    const s = this.state;
    return {
      pupil: s.pupil,
      bow: s.bow,
      closure: s.closure,
      tmClog: s.tmClog,
      tmTint: s.tmTint,
      pigment: s.pigment,
      pxf: s.pxf,
      neovasc: s.neovasc,
      edema: s.edema,
      redness: s.redness,
      inflammation: s.inflammation,
      damage: this.damage,
      globeScale: s.globeScale,
    };
  }

  flowParams() {
    const s = this.state;
    return { flow: s.flow, uveoFraction: s.uveoFraction, tmPass: s.tmPass, anglePass: s.anglePass, pupilPass: s.pupilPass };
  }
}

export function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (x, sh) => (x >> sh) & 255;
  const m = (sh) => Math.round(ch(pa, sh) + (ch(pb, sh) - ch(pa, sh)) * clamp(t, 0, 1));
  return `#${((m(16) << 16) | (m(8) << 8) | m(0)).toString(16).padStart(6, '0')}`;
}
