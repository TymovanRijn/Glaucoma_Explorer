/**
 * THE 3D EYE
 *
 * Builds every anatomical structure from the profiles in config/anatomy.js and keeps a
 * registry of "parts" so that the user can point at anything and learn about it.
 * The simulator changes the eye through `applyState()` (iris bowing, clogged drain,
 * optic nerve cupping, nerve fibre loss, redness, corneal haze ...).
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as A from '../config/anatomy.js';
import { generateVessels, generateFibres, cupShape } from './fundusData.js';
import { paintFundus, RETINA_BASE } from './fundusPainter.js';
import * as T from './textures.js';
import { lathe, variableTube, ribbon, resample } from './geometryUtils.js';
import { addDiscHole, makeFibreMaterial } from './materials.js';

const { DIMS } = A;

/** Lathe space -> world space (the eye's optical axis points along world +Z). */
export const L2W = (x, y, z) => new THREE.Vector3(x, -z, y);

const lp = (r, y, phi) => new THREE.Vector3(r * Math.sin(phi), y, r * Math.cos(phi));

const smooth01 = (t) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};
const approach = (cur, target, dt, rate) => cur + (target - cur) * (1 - Math.exp(-dt * rate));

export class EyeModel {
  constructor({ quality = 'high', clippingPlanes = [], eyeColor = 'hazel' } = {}) {
    this.quality = quality;
    this.clippingPlanes = clippingPlanes;
    this.segments = quality === 'low' ? 72 : 128;
    this.group = new THREE.Group();
    this.eye = new THREE.Group();
    this.eye.rotation.x = Math.PI / 2; // lathe +y (front of the eye) -> world +z
    this.group.add(this.eye);
    this.parts = new Map();
    this.pickables = [];
    this.highlightColor = new THREE.Color('#58d7ff');
    this.bump = T.makeBumpTexture(4, 256, 8);

    // live, smoothly-animated visual state
    this.vis = {
      pupil: DIMS.pupilRadius,
      bow: 0,
      closure: 0,
      tmClog: 0,
      tmTint: new THREE.Color('#c49a78'),
      pigment: 0,
      pxf: 0,
      neovasc: 0,
      edema: 0,
      redness: 0,
      inflammation: 0,
      damage: 0,
      globeScale: 1,
    };
    this.target = { ...this.vis, tmTint: this.vis.tmTint.clone() };
    this._builtIris = null;
    this._builtCupDamage = -1;

    this.vessels = generateVessels(7);
    this.fibres = generateFibres(quality === 'low' ? 800 : 1400, 11);

    this.buildCoats();
    this.buildCornea();
    this.buildIris(eyeColor);
    this.buildLens();
    this.buildCiliary();
    this.buildDrainage();
    this.buildRetina();
    this.buildPosteriorPole();
    this.buildOpticNerve();
    this.buildMuscles();
    this.buildVitreous();
    this.rebuildCup(0);
  }

  // -------------------------------------------------------------------------------------------
  // helpers
  // -------------------------------------------------------------------------------------------
  mat(params, kind = 'standard') {
    const M = kind === 'physical' ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial;
    const m = new M({ side: THREE.DoubleSide, clippingPlanes: this.clippingPlanes, ...params });
    m.userData.baseEmissive = (params.emissive ? new THREE.Color(params.emissive) : new THREE.Color(0)).clone();
    m.userData.baseEmissiveIntensity = params.emissiveIntensity ?? 1;
    return m;
  }

  add(obj, partId, pick = true) {
    this.eye.add(obj);
    if (partId) this.register(partId, obj, pick);
    return obj;
  }

  register(partId, obj, pick = true) {
    let p = this.parts.get(partId);
    if (!p) {
      p = { id: partId, objects: [], materials: new Set(), highlight: 0, targetHighlight: 0, pick: {}, resolve: null };
      this.parts.set(partId, p);
    }
    obj.userData.partId = partId;
    p.objects.push(obj);
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const m of mats) if (m) p.materials.add(m);
    if (pick) this.pickables.push(obj);
    return p;
  }

  part(id) {
    return this.parts.get(id);
  }

  // -------------------------------------------------------------------------------------------
  // Outer coats: sclera, conjunctiva, choroid, retina
  // -------------------------------------------------------------------------------------------
  buildCoats() {
    const seg = this.segments;
    this.scleraMat = this.mat({ color: '#efe8df', roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.35, bumpMap: this.bump, bumpScale: 0.6 }, 'physical');
    const scleraOuter = new THREE.Mesh(lathe(A.scleraOuterProfile(), seg), this.scleraMat);
    addDiscHole(this.scleraMat, 11.45);
    this.add(scleraOuter, 'sclera');

    const innerMat = addDiscHole(this.mat({ color: '#8c6a57', roughness: 0.8 }));
    this.add(new THREE.Mesh(lathe(A.scleraInnerProfile(), seg), innerMat), 'sclera');

    this.conjMat = this.mat({
      map: T.makeConjunctivaTexture(9),
      transparent: true,
      depthWrite: false,
      roughness: 0.25,
      opacity: 0.75,
    });
    const conj = new THREE.Mesh(lathe(A.conjunctivaProfile(), seg), this.conjMat);
    conj.renderOrder = 2;
    this.add(conj, 'conjunctiva');
    this.part('conjunctiva').pick = { low: true };

    const choroidMat = addDiscHole(this.mat({ color: '#5c1a14', roughness: 0.75, bumpMap: this.bump, bumpScale: 0.4 }));
    this.add(new THREE.Mesh(lathe(A.choroidProfile(), seg), choroidMat), 'choroid');

    this.retinaMat = addDiscHole(this.mat({ color: RETINA_BASE, roughness: 0.62, bumpMap: this.bump, bumpScale: 0.15 }));
    const retina = new THREE.Mesh(lathe(A.retinaProfile(), seg), this.retinaMat);
    this.add(retina, 'retina');
    this.part('retina').resolve = (p) => this.resolveRetina(p);
  }

  // -------------------------------------------------------------------------------------------
  // Cornea
  // -------------------------------------------------------------------------------------------
  buildCornea() {
    this.corneaMat = this.mat(
      {
        color: '#e3f6ff',
        transparent: true,
        opacity: 0.16,
        roughness: 0.03,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        envMapIntensity: 1.6,
        depthWrite: false,
      },
      'physical',
    );
    const cornea = new THREE.Mesh(lathe(A.corneaProfile(), this.segments), this.corneaMat);
    cornea.renderOrder = 5;
    this.add(cornea, 'cornea');
    this.part('cornea').pick = { low: true };

    // Krukenberg spindle: pigment dusting on the back of the cornea (pigment dispersion)
    const n = 900;
    const pos = new Float32Array(n * 3);
    let k = 0;
    for (let i = 0; i < n; i++) {
      // vertical spindle shape, centred slightly below the centre (convection currents)
      const t = Math.random() * 2 - 1;
      const v = t * 3.2 - 0.6;
      const width = 0.75 * Math.sqrt(1 - t * t);
      const u = (Math.random() * 2 - 1) * width;
      const r = Math.hypot(u, v);
      const y = A.corneaInnerY(r) - 0.015;
      // lathe: world +y (up) = lathe -z ; world x = lathe x
      pos[k++] = u;
      pos[k++] = y;
      pos[k++] = -v;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.krukMat = new THREE.PointsMaterial({
      color: '#4a2a14',
      size: 0.05,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      clippingPlanes: this.clippingPlanes,
    });
    this.krukenberg = new THREE.Points(g, this.krukMat);
    this.krukenberg.visible = false;
    this.eye.add(this.krukenberg);
  }

  // -------------------------------------------------------------------------------------------
  // Iris & pupil
  // -------------------------------------------------------------------------------------------
  buildIris(color) {
    this.irisFrontMat = this.mat({ map: T.makeIrisTexture(color), roughness: 0.72, bumpMap: this.bump, bumpScale: 0.9 });
    this.irisBackMat = this.mat({ color: '#24140c', roughness: 0.85 });
    this.rubeosisMat = this.mat({ map: T.makeRubeosisTexture(), transparent: true, opacity: 0, depthWrite: false, roughness: 0.5 });
    this.irisFront = new THREE.Mesh(new THREE.BufferGeometry(), this.irisFrontMat);
    this.irisBack = new THREE.Mesh(new THREE.BufferGeometry(), this.irisBackMat);
    this.rubeosis = new THREE.Mesh(new THREE.BufferGeometry(), this.rubeosisMat);
    this.rubeosis.renderOrder = 3;
    this.add(this.irisFront, 'iris');
    this.add(this.irisBack, 'iris');
    this.eye.add(this.rubeosis);
    this.register('iris', this.rubeosis, false);

    // invisible disc filling the pupil, so you can point at "the pupil" from outside
    this.pupilProxy = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }));
    this.pupilProxy.rotation.x = -Math.PI / 2;
    this.add(this.pupilProxy, 'pupil');
    this.part('pupil').pick = { minCameraDist: 7 };
    this.rebuildIris();
  }

  /** Solid cross-sections for the cutaway view (see scene/SectionCaps.js). */
  buildCaps(caps) {
    this.caps = caps;
    const seg = this.segments;
    const close = (pts) => [...pts, pts[0]];
    const e = this.eye;
    caps.add(e, lathe(A.scleraProfile(), seg), '#ebe3d8', { partId: 'sclera' });
    caps.add(e, lathe(A.corneaProfile(), seg), '#cfe8f3', { partId: 'cornea' });
    caps.add(e, lathe(A.lensProfile(), seg), '#f1dfa8', { partId: 'lens' });
    caps.add(e, lathe(close(A.ciliaryProfile()), seg), '#6c3022', { partId: 'ciliary-body' });
    caps.add(e, lathe(close(A.trabecularProfile()), seg * 2), '#c09070', { partId: 'trabecular-meshwork' });
    caps.add(e, lathe(close(A.spurProfile()), seg * 2), '#fbf8f2', { partId: 'scleral-spur' });
    caps.add(e, lathe(A.choroidProfile(), seg), '#5e1a13', { partId: 'choroid' });
    caps.add(e, lathe(A.retinaProfile(), seg), '#e08a6c', { partId: 'retina' });
    this.irisCap = caps.add(e, lathe(close(this.irisProfileNow.loop), seg), '#6b4b34', { partId: 'iris' });
  }

  setEyeColor(color) {
    const old = this.irisFrontMat.map;
    this.irisFrontMat.map = T.makeIrisTexture(color);
    this.irisFrontMat.needsUpdate = true;
    old?.dispose();
  }

  rebuildIris() {
    const v = this.vis;
    const prof = A.irisProfile({ pupil: v.pupil, bow: v.bow, closure: v.closure });
    this.irisProfileNow = prof;
    const seg = this.segments;
    const back = [...prof.back].reverse(); // root -> pupil
    const margin = [prof.front[0]];
    this.irisFront.geometry.dispose();
    this.irisBack.geometry.dispose();
    this.rubeosis.geometry.dispose();
    this.irisFront.geometry = lathe(prof.front, seg);
    this.irisBack.geometry = lathe([...back, ...margin], seg);
    this.rubeosis.geometry = lathe(
      prof.front.map(([r, y]) => [r, y + 0.012]),
      seg,
    );
    if (this.irisCap) {
      this.irisCap.m0.geometry.dispose();
      this.caps.setGeometry(this.irisCap, lathe([...prof.loop, prof.loop[0]], seg));
    }
    const rp = prof.front[0][0];
    this.pupilProxy.scale.setScalar(rp);
    this.pupilProxy.position.y = (prof.front[0][1] + prof.back[0][1]) / 2;
    this._builtIris = { pupil: v.pupil, bow: v.bow, closure: v.closure };
  }

  // -------------------------------------------------------------------------------------------
  // Lens & zonules
  // -------------------------------------------------------------------------------------------
  buildLens() {
    const seg = this.segments;
    this.lensMat = this.mat(
      { color: '#fff4d6', transparent: true, opacity: 0.3, roughness: 0.08, clearcoat: 0.8, clearcoatRoughness: 0.05, depthWrite: false, envMapIntensity: 1.2 },
      'physical',
    );
    const lens = new THREE.Mesh(lathe(A.lensProfile(), seg), this.lensMat);
    lens.renderOrder = 4;
    this.add(lens, 'lens');
    // nucleus: the older, denser core of the lens
    const L = DIMS.lens;
    const nucleusProf = A.lensProfile().map(([r, y]) => [r * 0.62, L.equatorY - 0.25 + (y - L.equatorY) * 0.62]);
    const nucleusMat = this.mat({ color: '#ffe6a6', transparent: true, opacity: 0.18, roughness: 0.3, depthWrite: false });
    const nucleus = new THREE.Mesh(lathe(nucleusProf, seg), nucleusMat);
    nucleus.renderOrder = 4;
    this.add(nucleus, 'lens');
    this.part('lens').pick = { low: true };

    // pseudoexfoliation "target" pattern on the front of the lens
    const W = 512;
    const H = 128;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d');
    for (let i = 0; i < 4000; i++) {
      const v = Math.random();
      let a = 0;
      if (v < 0.33) a = 0.55;
      else if (v > 0.55 && v < 0.92) a = 0.75;
      if (!a) continue;
      g.fillStyle = `rgba(245,245,240,${a * (0.4 + Math.random() * 0.6)})`;
      g.beginPath();
      g.arc(Math.random() * W, v * H, 1 + Math.random() * 2.5, 0, Math.PI * 2);
      g.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.flipY = false;
    tex.wrapS = THREE.RepeatWrapping;
    const decal = [];
    for (let i = 0; i <= 30; i++) {
      const r = (i / 30) * 4.1;
      decal.push([r, A.lensFrontY(r) + 0.014]);
    }
    this.pxfMat = this.mat({ map: tex, transparent: true, opacity: 0, depthWrite: false, roughness: 0.7 });
    this.pxfDecal = new THREE.Mesh(lathe(decal, seg), this.pxfMat);
    this.pxfDecal.renderOrder = 4;
    this.pxfDecal.visible = false;
    this.eye.add(this.pxfDecal);
    this.register('lens', this.pxfDecal, false);

    // zonules: hundreds of fine fibres suspending the lens from the ciliary body
    const zp = [];
    const nz = this.quality === 'low' ? 90 : 160;
    for (let i = 0; i < nz; i++) {
      const phi = (i / nz) * Math.PI * 2;
      const j = (k) => phi + (Math.random() - 0.5) * 0.04 * k;
      const fibres = [
        [[5.2, 7.05], [4.3, 7.86]],
        [[5.18, 7.6], [4.45, 7.65]],
        [[5.22, 7.25], [4.62, 7.35]],
        [[5.2, 7.7], [4.35, 6.72]],
        [[5.3, 6.85], [4.2, 6.6]],
      ];
      for (const [[r0, y0], [r1, y1]] of fibres) {
        const a = lp(r0, y0, j(1));
        const b = lp(r1, y1, j(2));
        zp.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    const zg = new THREE.BufferGeometry();
    zg.setAttribute('position', new THREE.Float32BufferAttribute(zp, 3));
    const zMat = new THREE.LineBasicMaterial({ color: '#efe6cf', transparent: true, opacity: 0.6, clippingPlanes: this.clippingPlanes });
    zMat.userData.baseEmissive = new THREE.Color(0);
    const zonules = new THREE.LineSegments(zg, zMat);
    this.add(zonules, 'zonules', false);
    // pick proxy: a thin invisible ring spanning the zonule zone
    const proxy = new THREE.Mesh(
      lathe([[4.62, 7.35], [5.15, 7.35]], 64),
      new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }),
    );
    this.add(proxy, 'zonules');
  }

  // -------------------------------------------------------------------------------------------
  // Ciliary body & processes (the "tap" that makes aqueous humour)
  // -------------------------------------------------------------------------------------------
  buildCiliary() {
    const mat = this.mat({ color: '#5b2c1d', roughness: 0.7, bumpMap: this.bump, bumpScale: 0.8 });
    this.add(new THREE.Mesh(lathe(A.ciliaryProfile(), this.segments), mat), 'ciliary-body');

    this.processMat = this.mat({ color: '#8a3b2c', roughness: 0.55, emissive: '#1ac8ff', emissiveIntensity: 0 });
    const n = 72;
    const geo = new THREE.SphereGeometry(1, 14, 10);
    const inst = new THREE.InstancedMesh(geo, this.processMat, n);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      const phi = (i / n) * Math.PI * 2;
      const major = i % 2 === 0;
      const r = major ? 5.62 : 5.75;
      const y = 7.4 + (major ? 0 : 0.05);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), phi);
      s.set(major ? 0.1 : 0.07, major ? 0.78 : 0.6, major ? 0.52 : 0.38);
      m.compose(lp(r, y, phi), q, s);
      inst.setMatrixAt(i, m);
    }
    inst.instanceMatrix.needsUpdate = true;
    this.add(inst, 'ciliary-processes');
  }

  // -------------------------------------------------------------------------------------------
  // The drainage system: trabecular meshwork, Schlemm's canal, collector channels, veins
  // -------------------------------------------------------------------------------------------
  buildDrainage() {
    const seg = this.segments * 2;
    this.tmMat = this.mat({
      color: '#c49a78',
      alphaMap: T.makeMeshworkTexture(13),
      alphaTest: 0.5,
      roughness: 0.6,
      emissive: '#000000',
    });
    this.tmMat.alphaMap.repeat.set(1, 1);
    this.add(new THREE.Mesh(lathe(A.trabecularProfile(), seg), this.tmMat), 'trabecular-meshwork');

    const spurMat = this.mat({ color: '#f4efe6', roughness: 0.5 });
    this.add(new THREE.Mesh(lathe(A.spurProfile(), seg), spurMat), 'scleral-spur');

    const [cr, cy] = A.pol(DIMS.schlemmR, DIMS.schlemmDeg);
    this.schlemmMat = this.mat({
      color: '#7fd8ff',
      transparent: true,
      opacity: 0.55,
      roughness: 0.2,
      emissive: '#1a88aa',
      emissiveIntensity: 0.6,
      depthWrite: false,
    });
    const torus = new THREE.Mesh(new THREE.TorusGeometry(cr, DIMS.schlemmTube, 12, 256), this.schlemmMat);
    torus.rotation.x = Math.PI / 2;
    torus.position.y = cy;
    torus.renderOrder = 3;
    this.add(torus, 'schlemms-canal');

    // collector channels -> aqueous veins -> episcleral veins on the surface
    const veinGeos = [];
    const nCh = 12;
    const up = (p) => p.clone().normalize();
    for (let i = 0; i < nCh; i++) {
      const phi = (i / nCh) * Math.PI * 2 + 0.13;
      const pts = [];
      const radii = [];
      const lat0 = DIMS.schlemmDeg;
      // radially outwards through the sclera
      for (let k = 0; k <= 4; k++) {
        const R = DIMS.schlemmR + ((DIMS.scleraOuterR + 0.06 - DIMS.schlemmR) * k) / 4;
        const [r, y] = A.pol(R, lat0 - k * 0.3);
        pts.push(lp(r, y, phi));
        radii.push(0.028 + k * 0.003);
      }
      // then backwards over the surface of the eye, wiggling
      let ph = phi;
      for (let k = 1; k <= 10; k++) {
        ph += Math.sin(k * 1.7 + i) * 0.012;
        const [r, y] = A.pol(DIMS.scleraOuterR + 0.05, lat0 - 1.0 - k * 0.9);
        pts.push(lp(r, y, ph));
        radii.push(0.035 + k * 0.002);
      }
      veinGeos.push(variableTube(pts, radii, 6, up));
    }
    const veinMat = this.mat({ color: '#a33a4e', roughness: 0.45, transparent: true, opacity: 0.75 });
    this.add(new THREE.Mesh(mergeGeometries(veinGeos), veinMat), 'episcleral-veins');
  }

  // -------------------------------------------------------------------------------------------
  // Posterior pole: fundus patch, vessels, optic disc, nerve fibres
  // -------------------------------------------------------------------------------------------
  buildRetina() {
    // detailed fundus texture painted onto a cap at the back of the eye
    const size = this.quality === 'low' ? 1024 : 2048;
    const range = DIMS.fundusPatchRadius;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    paintFundus(g, { size, range, vessels: this.vessels, fibres: null, damage: 0, drawDisc: false });
    // fade the edge into the plain retina colour so there is no seam
    const s = size / (2 * range);
    const grad = g.createRadialGradient(size / 2, size / 2, (range - 3) * s, size / 2, size / 2, range * s);
    grad.addColorStop(0, 'rgba(201,96,58,0)');
    grad.addColorStop(1, RETINA_BASE);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;
    tex.anisotropy = 8;

    const nr = 48;
    const na = this.quality === 'low' ? 72 : 120;
    const pos = [];
    const uv = [];
    const idx = [];
    const tmp = [0, 0, 0];
    for (let j = 0; j <= nr; j++) {
      const rho = (j / nr) * range;
      for (let k = 0; k <= na; k++) {
        const a = (k / na) * Math.PI * 2;
        const u = rho * Math.cos(a);
        const v = rho * Math.sin(a);
        A.fundusToLathe(u, v, DIMS.retinaInnerR - 0.004, tmp);
        pos.push(tmp[0], tmp[1], tmp[2]);
        uv.push(0.5 + u / (2 * range), 0.5 - v / (2 * range));
      }
    }
    for (let j = 0; j < nr; j++) {
      for (let k = 0; k < na; k++) {
        const a = j * (na + 1) + k;
        const b = a + na + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    this.patchMat = addDiscHole(this.mat({ map: tex, roughness: 0.6 }));
    const patch = new THREE.Mesh(geo, this.patchMat);
    this.add(patch, 'retina');
  }

  /** Which sub-structure of the retina did the user point at? */
  resolveRetina(p) {
    const [u, v] = A.latheToFundus(p.x, p.y, p.z);
    const F = DIMS.fovea;
    const D = DIMS.disc;
    const fd = Math.hypot(u - F.u, v - F.v);
    const dd = Math.hypot(u - D.u, v - D.v);
    if (fd < DIMS.maculaRadius) return 'macula';
    if (dd < D.radius + 1.6) return 'rnfl';
    // close to the front edge of the retina
    const lat = Math.atan2(p.y, Math.hypot(p.x, p.z)) / A.DEG;
    if (lat > DIMS.oraDeg - 3) return 'ora-serrata';
    return 'retina';
  }

  buildPosteriorPole() {
    this.discMat = this.mat({ vertexColors: true, roughness: 0.55 });
    this.disc = new THREE.Mesh(new THREE.BufferGeometry(), this.discMat);
    this.add(this.disc, 'optic-disc');
    this.part('optic-disc').resolve = (p) => this.resolveDisc(p);

    this.laminaMat = this.mat({ map: T.makeLaminaTexture(17), transparent: true, opacity: 0.0, roughness: 0.7, depthWrite: false });
    this.lamina = new THREE.Mesh(new THREE.BufferGeometry(), this.laminaMat);
    this.lamina.renderOrder = 1;
    this.add(this.lamina, 'lamina-cribrosa');

    const wallMat = this.mat({ color: '#e6d6ba', roughness: 0.7 });
    this.canalWall = new THREE.Mesh(new THREE.BufferGeometry(), wallMat);
    this.add(this.canalWall, 'optic-disc', false);

    this.arteryMat = this.mat({ color: '#d43a2c', roughness: 0.5, envMapIntensity: 0.15, emissive: '#5a0c08', emissiveIntensity: 0.6 });
    this.veinMat = this.mat({ color: '#8e1d24', roughness: 0.55, envMapIntensity: 0.15, emissive: '#3a0508', emissiveIntensity: 0.6 });
    this.arteries = new THREE.Mesh(new THREE.BufferGeometry(), this.arteryMat);
    this.veins = new THREE.Mesh(new THREE.BufferGeometry(), this.veinMat);
    this.add(this.arteries, 'retinal-vessels');
    this.add(this.veins, 'retinal-vessels');

    this.buildFibres();
  }

  /** depth below the retinal surface (mm, + = deeper / away from the eye centre) inside the disc */
  discDepth(rho, clock, cup) {
    const R = DIMS.disc.radius;
    const cr = cup.cdrAt(clock) * R;
    const floorR = cr * 0.5;
    if (rho >= R) return 0;
    if (rho >= cr) {
      const t = (rho - cr) / Math.max(1e-3, R - cr);
      const rimH = 0.06 * (1 - cup.pallor * 0.7) * Math.min(1, (R - cr) / 0.3);
      return -rimH * Math.sin(Math.PI * Math.min(1, t));
    }
    if (rho <= floorR) return cup.depth;
    return cup.depth * smooth01((cr - rho) / (cr - floorR));
  }

  discPoint(rho, raw, depth, out = new THREE.Vector3()) {
    const D = DIMS.disc;
    const t = A.fundusToLathe(D.u + rho * Math.cos(raw), D.v + rho * Math.sin(raw), DIMS.retinaInnerR + depth);
    return out.set(t[0], t[1], t[2]);
  }

  resolveDisc(p) {
    const [u, v] = A.latheToFundus(p.x, p.y, p.z);
    const D = DIMS.disc;
    const rho = Math.hypot(u - D.u, v - D.v);
    const raw = Math.atan2(v - D.v, u - D.u);
    let clock = Math.PI - raw;
    if (clock > Math.PI) clock -= Math.PI * 2;
    return rho < this.cup.cdrAt(clock) * D.radius ? 'optic-cup' : 'optic-disc';
  }

  rebuildCup(damage) {
    const cup = cupShape(damage);
    this.cup = cup;
    const D = DIMS.disc;
    const NR = 30;
    const NA = 96;
    const pos = [];
    const col = [];
    const idx = [];
    const p = new THREE.Vector3();
    const rim = new THREE.Color().setRGB(0.86, 0.47, 0.34, THREE.SRGBColorSpace);
    const pale = new THREE.Color().setRGB(0.88, 0.8, 0.7, THREE.SRGBColorSpace);
    const cupCol = new THREE.Color().setRGB(0.93, 0.87, 0.75, THREE.SRGBColorSpace);
    const floorCol = new THREE.Color().setRGB(0.78, 0.74, 0.68, THREE.SRGBColorSpace);
    const rimNow = rim.clone().lerp(pale, cup.pallor * 0.85);
    const c = new THREE.Color();
    for (let j = 0; j <= NR; j++) {
      const rho = (j / NR) * D.radius;
      for (let k = 0; k <= NA; k++) {
        const raw = (k / NA) * Math.PI * 2;
        let clock = Math.PI - raw;
        if (clock > Math.PI) clock -= Math.PI * 2;
        const depth = this.discDepth(rho, clock, cup);
        this.discPoint(rho, raw, depth - 0.002, p);
        pos.push(p.x, p.y, p.z);
        const cr = cup.cdrAt(clock) * D.radius;
        const inCup = smooth01((cr - rho) / 0.06 + 0.5);
        c.copy(rimNow).lerp(cupCol, inCup);
        if (rho < cr * 0.55) c.lerp(floorCol, 0.5);
        // slightly darker at the very edge of the disc
        if (rho > D.radius * 0.92) c.multiplyScalar(0.88);
        col.push(c.r, c.g, c.b);
      }
    }
    for (let j = 0; j < NR; j++) {
      for (let k = 0; k < NA; k++) {
        const a = j * (NA + 1) + k;
        const b = a + NA + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    this.disc.geometry.dispose();
    this.disc.geometry = geo;

    // lamina cribrosa at the floor of the cup
    {
      const lp2 = [];
      const luv = [];
      const lidx = [];
      const NL = 10;
      for (let j = 0; j <= NL; j++) {
        for (let k = 0; k <= NA; k++) {
          const raw = (k / NA) * Math.PI * 2;
          let clock = Math.PI - raw;
          if (clock > Math.PI) clock -= Math.PI * 2;
          const fr = cup.cdrAt(clock) * D.radius * 0.5;
          const rho = (j / NL) * fr;
          this.discPoint(rho, raw, cup.depth - 0.006, p);
          lp2.push(p.x, p.y, p.z);
          luv.push(0.5 + (Math.cos(raw) * rho) / (2 * D.radius * 0.5), 0.5 + (Math.sin(raw) * rho) / (2 * D.radius * 0.5));
        }
      }
      for (let j = 0; j < NL; j++) {
        for (let k = 0; k < NA; k++) {
          const a = j * (NA + 1) + k;
          const b = a + NA + 1;
          lidx.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
      const lg = new THREE.BufferGeometry();
      lg.setAttribute('position', new THREE.Float32BufferAttribute(lp2, 3));
      lg.setAttribute('uv', new THREE.Float32BufferAttribute(luv, 2));
      lg.setIndex(lidx);
      lg.computeVertexNormals();
      this.lamina.geometry.dispose();
      this.lamina.geometry = lg;
    }

    // wall of the scleral canal (hidden behind the disc, prevents see-through gaps)
    {
      const wp = [];
      const widx = [];
      for (let k = 0; k <= NA; k++) {
        const raw = (k / NA) * Math.PI * 2;
        this.discPoint(D.radius, raw, -0.01, p);
        wp.push(p.x, p.y, p.z);
        this.discPoint(D.radius, raw, 1.15, p);
        wp.push(p.x, p.y, p.z);
      }
      for (let k = 0; k < NA; k++) {
        const a = k * 2;
        widx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
      const wg = new THREE.BufferGeometry();
      wg.setAttribute('position', new THREE.Float32BufferAttribute(wp, 3));
      wg.setIndex(widx);
      wg.computeVertexNormals();
      this.canalWall.geometry.dispose();
      this.canalWall.geometry = wg;
    }

    this.rebuildVessels(cup);
    this.updateFibreDiscPositions(cup);
    this._builtCupDamage = damage;
  }

  /** Map a fundus point to 3D, following the disc surface (vessels dive into the cup). */
  surfacePoint(u, v, lift, cup, out = new THREE.Vector3()) {
    const D = DIMS.disc;
    const rho = Math.hypot(u - D.u, v - D.v);
    let depth = 0;
    if (rho < D.radius) {
      const raw = Math.atan2(v - D.v, u - D.u);
      let clock = Math.PI - raw;
      if (clock > Math.PI) clock -= Math.PI * 2;
      depth = this.discDepth(rho, clock, cup);
    }
    const t = A.fundusToLathe(u, v, DIMS.retinaInnerR + depth - lift);
    return out.set(t[0], t[1], t[2]);
  }

  rebuildVessels(cup) {
    const art = [];
    const vei = [];
    const up = (p) => p.clone().normalize().negate();
    for (const vs of this.vessels) {
      if (!vs._tube) {
        const meanW = vs.w.reduce((a, b) => a + b, 0) / vs.w.length;
        const pts2 = resample(vs.pts, 0.22);
        const idxMap = pts2.map((p) => vs.pts.indexOf(p));
        vs._tube = {
          skip: meanW < 0.028 && vs.order > 1,
          pts2,
          radii: idxMap.map((i) => Math.max(0.012, (vs.w[Math.max(0, i)] / 2) * 1.25)),
        };
      }
      const { skip, pts2, radii } = vs._tube;
      if (skip) continue;
      const pts3 = pts2.map(([u, v], i) => this.surfacePoint(u, v, radii[i] + 0.004, cup));
      if (pts3.length < 2) continue;
      (vs.kind === 'artery' ? art : vei).push(variableTube(pts3, radii, this.quality === 'low' ? 4 : 6, up));
    }
    this.arteries.geometry.dispose();
    this.veins.geometry.dispose();
    this.arteries.geometry = mergeGeometries(art);
    this.veins.geometry = mergeGeometries(vei);
  }

  buildFibres() {
    const fibres = this.fibres;
    const DISC_PTS = 7;
    let total = 0;
    const plans = fibres.map((f) => {
      const pts = resample(f.pts, 0.45);
      const n = pts.length + DISC_PTS;
      const start = total;
      total += n;
      return { f, pts, start, n };
    });
    const pos = new Float32Array(total * 3);
    const death = new Float32Array(total);
    const along = new Float32Array(total);
    const index = [];
    const tmp = [0, 0, 0];
    for (const pl of plans) {
      const { f, pts, start, n } = pl;
      for (let i = 0; i < pts.length; i++) {
        A.fundusToLathe(pts[i][0], pts[i][1], DIMS.retinaInnerR - 0.014, tmp);
        const o = (start + i) * 3;
        pos[o] = tmp[0];
        pos[o + 1] = tmp[1];
        pos[o + 2] = tmp[2];
        along[start + i] = (i / pts.length) * 0.85;
      }
      for (let i = 0; i < DISC_PTS; i++) along[start + pts.length + i] = 0.85 + (0.15 * (i + 1)) / DISC_PTS;
      for (let i = 0; i < n; i++) death[start + i] = f.death;
      for (let i = 0; i < n - 1; i++) index.push(start + i, start + i + 1);
      pl.discStart = start + pts.length;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aDeath', new THREE.BufferAttribute(death, 1));
    geo.setAttribute('aAlong', new THREE.BufferAttribute(along, 1));
    geo.setIndex(index);
    this.fibreMat = makeFibreMaterial('#ffd79a', 0.2);
    this.fibreMat.clippingPlanes = this.clippingPlanes;
    this.fibreLines = new THREE.LineSegments(geo, this.fibreMat);
    this.fibreLines.frustumCulled = false;
    this.fibreLines.renderOrder = 6;
    this.add(this.fibreLines, 'rnfl', false);
    this.fibrePlans = plans;
    this.DISC_PTS = DISC_PTS;
  }

  /** Re-route the part of each fibre inside the disc over the (changing) rim and down the cup. */
  updateFibreDiscPositions(cup) {
    if (!this.fibreLines) return;
    const pos = this.fibreLines.geometry.attributes.position;
    const D = DIMS.disc;
    const p = new THREE.Vector3();
    for (const pl of this.fibrePlans) {
      const raw = pl.f.entry;
      let clock = Math.PI - raw;
      if (clock > Math.PI) clock -= Math.PI * 2;
      const cr = Math.max(0.05, cup.cdrAt(clock) * D.radius);
      const floor = cr * 0.5;
      for (let i = 0; i < this.DISC_PTS; i++) {
        const t = (i + 1) / this.DISC_PTS;
        let rho;
        if (t <= 0.5) rho = D.radius + (cr - D.radius) * (t / 0.5);
        else rho = cr + (floor - cr) * ((t - 0.5) / 0.5);
        const depth = this.discDepth(rho, clock, cup) - 0.014;
        this.discPoint(rho, raw, depth, p);
        pos.setXYZ(pl.discStart + i, p.x, p.y, p.z);
      }
    }
    pos.needsUpdate = true;
  }

  // -------------------------------------------------------------------------------------------
  // Optic nerve
  // -------------------------------------------------------------------------------------------
  buildOpticNerve() {
    const dir = new THREE.Vector3(...A.fundusToLathe(DIMS.disc.u, DIMS.disc.v, 1)).normalize();
    const pts = [
      dir.clone().multiplyScalar(11.0),
      dir.clone().multiplyScalar(13.2),
      new THREE.Vector3(4.6, -16.5, 0.3),
      new THREE.Vector3(6.4, -22.5, -0.2),
      new THREE.Vector3(8.2, -30, -0.6),
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    this.nerveCurve = curve;
    this.nerveRadius = 1.55;
    const sheathMat = this.mat({ color: '#eadcc0', roughness: 0.55, clearcoat: 0.3 }, 'physical');
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, this.nerveRadius, 28, false), sheathMat);
    this.add(tube, 'optic-nerve');
    // cut end, showing bundles of axons
    const endPt = curve.getPoint(1);
    const endTan = curve.getTangent(1);
    const cap = new THREE.Mesh(new THREE.CircleGeometry(this.nerveRadius, 32), this.mat({ color: '#f3e7cf', roughness: 0.8 }));
    cap.position.copy(endPt);
    cap.lookAt(endPt.clone().add(endTan));
    this.add(cap, 'optic-nerve');
    // central retinal artery & vein entering the nerve
    const vesselStub = (offset, color) => {
      const p2 = [0.0, 0.25, 0.55, 0.8].map((t) => {
        const c = curve.getPoint(t * 0.55);
        return c.add(offset.clone().multiplyScalar(1 - t * 0.6));
      });
      const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p2), 30, 0.14, 8, false);
      return new THREE.Mesh(g, this.mat({ color, roughness: 0.4 }));
    };
    this.add(vesselStub(new THREE.Vector3(0, 0, 1.75), '#b8302a'), 'optic-nerve');
    this.add(vesselStub(new THREE.Vector3(0.3, 0, 1.85), '#6c1820'), 'optic-nerve');

    // axon bundles inside the nerve (visible if you swim inside)
    const n = this.quality === 'low' ? 70 : 140;
    const pos = [];
    const death = [];
    const along = [];
    const index = [];
    const frames = curve.computeFrenetFrames(40, false);
    let v = 0;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const rr = Math.sqrt(Math.random()) * this.nerveRadius * 0.85;
      // fibres from the top & bottom of the disc run in the top & bottom of the nerve
      const clock = a > Math.PI ? a - Math.PI * 2 : a;
      const vul = Math.max(Math.exp(-((clock + Math.PI / 2) ** 2) / 0.4), 0.82 * Math.exp(-((clock - Math.PI / 2) ** 2) / 0.4), 0.3);
      const d = Math.min(0.99, 1.02 - vul * 0.88 + (Math.random() - 0.5) * 0.2);
      for (let k = 0; k <= 40; k++) {
        const t = k / 40;
        const c = curve.getPoint(t);
        const N = frames.normals[k];
        const B = frames.binormals[k];
        const o = c.clone().addScaledVector(N, Math.cos(a) * rr).addScaledVector(B, Math.sin(a) * rr);
        pos.push(o.x, o.y, o.z);
        death.push(d);
        along.push(t);
        if (k > 0) index.push(v + k - 1, v + k);
      }
      v += 41;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aDeath', new THREE.Float32BufferAttribute(death, 1));
    g.setAttribute('aAlong', new THREE.Float32BufferAttribute(along, 1));
    g.setIndex(index);
    this.axonMat = makeFibreMaterial('#ffe9b8', 0.55);
    this.axonMat.clippingPlanes = this.clippingPlanes;
    const axons = new THREE.LineSegments(g, this.axonMat);
    axons.frustumCulled = false;
    this.add(axons, 'optic-nerve', false);

    // samples for "am I inside the nerve?"
    this.nerveSamples = curve.getSpacedPoints(60);
  }

  insideNerve(x, y, z) {
    const r2 = this.nerveRadius * this.nerveRadius;
    for (const s of this.nerveSamples) {
      const dx = s.x - x;
      const dy = s.y - y;
      const dz = s.z - z;
      if (dx * dx + dy * dy + dz * dz < r2) return Math.hypot(x, y, z) > DIMS.scleraOuterR - 0.2;
    }
    return false;
  }

  // -------------------------------------------------------------------------------------------
  // Extraocular muscles
  // -------------------------------------------------------------------------------------------
  buildMuscles() {
    const tex = T.makeMuscleTexture(31);
    const mat = this.mat({ map: tex, roughness: 0.65, bumpMap: this.bump, bumpScale: 0.5 });
    const geos = [];
    const apex = new THREE.Vector3(3.5, -34, 0);
    // [name, angle around axis (lathe phi), insertion latitude]
    // phi: lathe x = r sin(phi) (nasal +), lathe z = r cos(phi) (inferior +)
    const recti = [
      ['medial', Math.PI / 2, 32.5],
      ['inferior', 0, 27.5],
      ['lateral', -Math.PI / 2, 25.5],
      ['superior', Math.PI, 21.5],
    ];
    for (const [, phi, lat] of recti) {
      const pts = [];
      const widths = [];
      const thick = [];
      const nGlobe = 14;
      for (let i = 0; i <= nGlobe; i++) {
        const la = lat - (i / nGlobe) * (lat + 30);
        const [r, y] = A.pol(DIMS.scleraOuterR + 0.55, la);
        pts.push(lp(r, y, phi));
        const t = i / nGlobe;
        widths.push(4.8 - t * 0.6);
        thick.push(0.25 + t * 0.9);
      }
      const last = pts[pts.length - 1];
      for (let i = 1; i <= 8; i++) {
        const t = i / 8;
        pts.push(last.clone().lerp(apex, t * 0.92));
        widths.push(4.2 - t * 2.6);
        thick.push(1.15 + Math.sin(t * Math.PI) * 0.3 - t * 0.5);
      }
      geos.push(ribbon(pts, widths, thick, (p) => p.clone().normalize(), 16));
    }
    // superior oblique (tendon from the trochlea, inserting on the upper-outer back of the eye)
    {
      const pts = [];
      const w = [];
      const th = [];
      const ins = 0.6;
      for (let i = 0; i <= 10; i++) {
        const la = 12 - i * 1.8;
        const ph = Math.PI + ins - i * 0.12;
        const [r, y] = A.pol(DIMS.scleraOuterR + 0.95, la);
        pts.push(lp(r, y, ph));
        w.push(3.2 - i * 0.18);
        th.push(0.25);
      }
      pts.reverse();
      w.reverse();
      const trochlea = new THREE.Vector3(9, 9, -12.5);
      const s = pts[pts.length - 1];
      for (let i = 1; i <= 5; i++) {
        pts.push(s.clone().lerp(trochlea, i / 5));
        w.push(1.4 - i * 0.12);
        th.push(0.45);
      }
      geos.push(ribbon(pts, w, th, (p) => p.clone().normalize(), 12));
    }
    // inferior oblique
    {
      const pts = [];
      const w = [];
      const th = [];
      for (let i = 0; i <= 12; i++) {
        const la = -10 + i * 2.3;
        const ph = -0.95 + i * 0.14;
        const [r, y] = A.pol(DIMS.scleraOuterR + 0.7, la);
        pts.push(lp(r, y, ph));
        w.push(3.4);
        th.push(0.6);
      }
      const origin = new THREE.Vector3(8.5, 7, 13.5);
      const s = pts[pts.length - 1];
      for (let i = 1; i <= 4; i++) {
        pts.push(s.clone().lerp(origin, i / 4));
        w.push(3.0 - i * 0.3);
        th.push(0.7);
      }
      geos.push(ribbon(pts, w, th, (p) => p.clone().normalize(), 12));
    }
    this.muscles = new THREE.Mesh(mergeGeometries(geos), mat);
    this.add(this.muscles, 'extraocular-muscles');
  }

  // -------------------------------------------------------------------------------------------
  // Vitreous: hyaloid canal and drifting floaters
  // -------------------------------------------------------------------------------------------
  buildVitreous() {
    const disc = new THREE.Vector3(...A.fundusToLathe(DIMS.disc.u, DIMS.disc.v, DIMS.retinaInnerR - 0.3));
    const curve = new THREE.CatmullRomCurve3([disc, new THREE.Vector3(2.0, -5, 0), new THREE.Vector3(0.6, 0.5, 0), new THREE.Vector3(0, 4.7, 0)]);
    const mat = this.mat({ color: '#bfe6ff', transparent: true, opacity: 0.07, depthWrite: false, roughness: 0.2 });
    const canal = new THREE.Mesh(new THREE.TubeGeometry(curve, 60, 0.55, 16, false), mat);
    canal.renderOrder = 2;
    this.add(canal, 'hyaloid-canal');
    this.part('hyaloid-canal').pick = { low: true };

    const n = this.quality === 'low' ? 160 : 320;
    const pos = new Float32Array(n * 3);
    this.floaterSeeds = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      let x;
      let y;
      let z;
      do {
        x = (Math.random() * 2 - 1) * 9.5;
        y = (Math.random() * 2 - 1) * 9.5;
        z = (Math.random() * 2 - 1) * 9.5;
      } while (Math.hypot(x, y, z) > 9.6 || y > 4.2);
      pos.set([x, y, z], i * 3);
      this.floaterSeeds.set([x, y, z], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.floaters = new THREE.Points(
      g,
      new THREE.PointsMaterial({
        color: '#dff3ff',
        size: 0.045,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        clippingPlanes: this.clippingPlanes,
      }),
    );
    this.floaters.frustumCulled = false;
    this.eye.add(this.floaters);
  }

  // -------------------------------------------------------------------------------------------
  // Picking
  // -------------------------------------------------------------------------------------------
  /**
   * Find the part under a ray. Transparent "see-through" parts (cornea, lens...) yield to an
   * opaque part just behind them so you can point *through* the cornea at the iris.
   */
  pick(raycaster, clipPlane, cutawayOn) {
    const hits = raycaster.intersectObjects(this.pickables, false);
    const valid = hits.filter((h) => {
      if (cutawayOn && clipPlane.distanceToPoint(h.point) < 0) return false;
      let o = h.object;
      while (o) {
        if (!o.visible) return false;
        o = o.parent;
      }
      return true;
    });
    let through = null;
    for (let i = 0; i < valid.length; i++) {
      const h = valid[i];
      const part = this.parts.get(h.object.userData.partId);
      const opts = part.pick || {};
      if (opts.minCameraDist && h.distance < opts.minCameraDist) continue;
      if (opts.low) {
        const behind = valid.find((h2, j) => j > i && h2.distance - h.distance < 3.6 && !this.parts.get(h2.object.userData.partId).pick?.low);
        if (behind) {
          through = through || part.id;
          continue;
        }
      }
      const local = this.eye.worldToLocal(h.point.clone());
      const id = part.resolve ? part.resolve(local) : part.id;
      return { id, partId: part.id, point: h.point.clone(), distance: h.distance, through };
    }
    return null;
  }

  setHighlight(id, on) {
    // resolved sub-parts highlight their parent mesh
    const map = { 'optic-cup': 'optic-disc', macula: 'retina', rnfl: 'retina', 'ora-serrata': 'retina' };
    const pid = this.parts.has(id) ? id : map[id];
    for (const p of this.parts.values()) p.targetHighlight = p.id === pid && on ? 1 : 0;
    if (id === 'rnfl' && on) this.parts.get('rnfl').targetHighlight = 1;
  }

  // -------------------------------------------------------------------------------------------
  // Simulation-driven appearance
  // -------------------------------------------------------------------------------------------
  /** Set target visual parameters (they are approached smoothly in update()). */
  applyState(s) {
    const t = this.target;
    for (const k of ['pupil', 'bow', 'closure', 'tmClog', 'pigment', 'pxf', 'neovasc', 'edema', 'redness', 'inflammation', 'damage', 'globeScale']) {
      if (s[k] !== undefined) t[k] = s[k];
    }
    if (s.tmTint) t.tmTint.set(s.tmTint);
  }

  update(dt, time) {
    const v = this.vis;
    const t = this.target;
    const r = 2.2;
    for (const k of ['pupil', 'bow', 'closure', 'tmClog', 'pigment', 'pxf', 'neovasc', 'edema', 'redness', 'inflammation', 'globeScale']) {
      v[k] = approach(v[k], t[k], dt, r);
    }
    v.damage = approach(v.damage, t.damage, dt, 3.5);
    v.tmTint.lerp(t.tmTint, 1 - Math.exp(-dt * r));

    const b = this._builtIris;
    if (Math.abs(b.pupil - v.pupil) > 0.004 || Math.abs(b.bow - v.bow) > 0.003 || Math.abs(b.closure - v.closure) > 0.003) this.rebuildIris();

    // drainage meshwork appearance: clogging fills the pores, tint shows what is clogging it
    this.tmMat.color.copy(v.tmTint);
    this.tmMat.alphaTest = 0.5 - v.tmClog * 0.42;

    // cornea: swollen & hazy when the pressure spikes suddenly (or in congenital glaucoma)
    this.corneaMat.opacity = 0.16 + v.edema * 0.5;
    this.corneaMat.roughness = 0.03 + v.edema * 0.5;
    this.corneaMat.color.setRGB(0.89 - v.edema * 0.08, 0.96 - v.edema * 0.08, 1.0 - v.edema * 0.1);

    // red eye
    this.conjMat.opacity = 0.7 + v.redness * 0.3;
    this.scleraMat.color.setRGB(0.937, 0.91 - v.redness * 0.2, 0.875 - v.redness * 0.24);

    this.rubeosisMat.opacity = v.neovasc;
    this.rubeosis.visible = v.neovasc > 0.01;
    this.pxfMat.opacity = v.pxf;
    this.pxfDecal.visible = v.pxf > 0.01;
    this.krukMat.opacity = v.pigment * 0.9;
    this.krukenberg.visible = v.pigment > 0.01;

    this.eye.scale.setScalar(v.globeScale);

    // optic nerve: fibres die and the cup deepens with damage
    this.fibreMat.uniforms.uDamage.value = v.damage;
    this.axonMat.uniforms.uDamage.value = v.damage;
    this.fibreMat.uniforms.uTime.value = time;
    this.axonMat.uniforms.uTime.value = time;
    if (Math.abs(this._builtCupDamage - v.damage) > 0.012) this.rebuildCup(v.damage);
    this.laminaMat.opacity = smooth01((v.damage - 0.3) / 0.45) * 0.85;

    // floaters drift lazily
    const fp = this.floaters.geometry.attributes.position;
    const sd = this.floaterSeeds;
    for (let i = 0; i < fp.count; i++) {
      const o = i * 3;
      fp.array[o] = sd[o] + Math.sin(time * 0.11 + i) * 0.35;
      fp.array[o + 1] = sd[o + 1] + Math.sin(time * 0.07 + i * 1.3) * 0.5;
      fp.array[o + 2] = sd[o + 2] + Math.cos(time * 0.09 + i * 0.7) * 0.35;
    }
    fp.needsUpdate = true;

    // highlight glow
    for (const p of this.parts.values()) {
      p.highlight = approach(p.highlight, p.targetHighlight, dt, 10);
      const h = p.highlight * (0.75 + 0.25 * Math.sin(time * 5));
      for (const m of p.materials) {
        if (m.isShaderMaterial) {
          if (m.uniforms.uHighlight) m.uniforms.uHighlight.value = h;
          continue;
        }
        if (!m.emissive) continue;
        const base = m.userData.baseEmissive || new THREE.Color(0);
        m.emissive.copy(base).lerp(this.highlightColor, Math.min(1, h * 0.5));
        m.emissiveIntensity = (m.userData.baseEmissiveIntensity ?? 1) * (1 - h) + h * 0.32;
      }
    }
  }

  setLayer(name, on) {
    if (name === 'muscles') this.muscles.visible = on;
    if (name === 'fibres') this.fibreLines.visible = on;
    if (name === 'vessels') this.arteries.visible = this.veins.visible = on;
  }

  /** Make the ciliary processes glow while they "pump" aqueous humour. */
  setProductionGlow(level, time) {
    const base = this.processMat.userData;
    base.baseEmissiveIntensity = level * (0.35 + 0.25 * Math.sin(time * 2.4));
  }
}
