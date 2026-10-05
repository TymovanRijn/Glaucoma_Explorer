/**
 * GLAUCOMA EXPLORER — application entry point.
 *
 * Wires together: the 3D stage, the procedural eye, the fluid simulation, the pressure
 * model, the camera rig and all interface panels. Read this file top to bottom to see how
 * one frame of the app works (see `frame()`).
 */
import './styles/main.css';
import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

import { Stage } from './scene/Stage.js';
import { SectionCaps } from './scene/SectionCaps.js';
import { EyeModel, L2W } from './eye/EyeModel.js';
import { makeGlowSprite, makeFlakeSprite } from './eye/textures.js';
import { AqueousFlow, FlowRiders } from './sim/AqueousFlow.js';
import { PressureModel, SCENARIOS } from './sim/PressureModel.js';
import { CameraRig } from './controls/CameraRig.js';
import { VIEWS } from './config/views.js';
import * as A from './config/anatomy.js';
import { PARTS, REGION_ENTRY } from './content/anatomy.js';
import { TYPES } from './content/glaucoma.js';

import { buildShell } from './ui/Shell.js';
import { $, toast } from './ui/dom.js';
import { ChatEngine } from './ui/Chat.js';
import { InfoPanel } from './ui/InfoPanel.js';
import { Lab } from './ui/Lab.js';
import { Clinic } from './ui/Clinic.js';
import { Tours } from './ui/Tours.js';
import { Library } from './ui/Library.js';
import { Minimap } from './ui/Minimap.js';
import { fieldFor, visionMaskDataUrl } from './ui/fieldViz.js';

// Fast raycasting (bounding-volume hierarchy) for pointing at things
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

const REGION_NAMES = {
  outside: 'Outside the eye',
  cornea: 'Inside the cornea',
  sclera: 'Inside the wall (sclera)',
  'ciliary-body': 'Inside the ciliary body',
  lens: 'Inside the lens',
  iris: 'Inside the iris',
  choroid: 'Inside the choroid',
  retina: 'Inside the retina',
  'anterior-chamber': 'In the anterior chamber',
  'drainage-angle': 'In the drainage angle',
  'posterior-chamber': 'In the posterior chamber',
  vitreous: 'In the vitreous',
  'optic-nerve': 'Inside the optic nerve',
};

// fog colour & density for each place you can be
const FOG = {
  outside: ['#040a14', 0],
  'anterior-chamber': ['#06202c', 0.05],
  'drainage-angle': ['#06202c', 0.07],
  'posterior-chamber': ['#121a22', 0.12],
  vitreous: ['#0a1824', 0.03],
  lens: ['#3a3218', 0.35],
  cornea: ['#8fb3c6', 0.6],
  iris: ['#2a1a10', 1.4],
  'ciliary-body': ['#2a120c', 1.4],
  sclera: ['#d8d0c4', 1.1],
  choroid: ['#3a0e0a', 1.4],
  retina: ['#6a2a18', 1.2],
  'optic-nerve': ['#bfae8c', 0.7],
};

const LABELS = [
  ['cornea', [0, 3.2, 12.4]],
  ['iris', [0, -3.4, 9.0]],
  ['lens', [0, 0.6, 5.2]],
  ['ciliary-body', [0, 7.4, 7.1]],
  ['drainage-angle', [0, -5.5, 9.3]],
  ['vitreous', [0, -2, -2]],
  ['retina', [0, 7.6, -7.4]],
  ['macula', [-1.5, -0.3, -10.3]],
  ['optic-disc', [2.96, 0.15, -9.99]],
  ['optic-nerve', [6.4, 0.2, -22.5]],
  ['sclera', [0, -9.5, -6.6]],
];

class App {
  constructor() {
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    const saved = safeGet('ge-quality') || 'auto';
    this.qualityPref = saved;
    this.quality = saved === 'auto' ? (this.isTouch || Math.min(window.innerWidth, window.innerHeight) < 600 ? 'low' : 'high') : saved;
    this.settings = { flow: true, fibres: true, labels: true, muscles: false, cut: true, cutOffset: 2 };
    this.mode = 'explore';
    this.region = 'outside';
    this.hover = null;
    this.mouse = new THREE.Vector2();
    this.mouseMoved = false;
    this.timer = new THREE.Timer();
    this.time = 0;
    this.frameNo = 0;
    this.visionOn = false;
    this.visionMode = 'real';
  }

  init() {
    const appEl = $('#app');
    try {
      this.stage = new Stage(appEl, { quality: this.quality });
    } catch (err) {
      console.error(err);
      return this.noWebGL();
    }
    const { scene, camera, renderer } = this.stage;
    this.eye = new EyeModel({ quality: this.quality, clippingPlanes: this.stage.clippingPlanes, eyeColor: safeGet('ge-eye') || 'hazel' });
    scene.add(this.eye.group);
    this.caps = new SectionCaps(scene, this.stage.clipPlane);
    this.eye.buildCaps(this.caps);
    this.eye.setLayer('muscles', this.settings.muscles);
    this.buildBVH();

    // fluid & debris
    const glow = makeGlowSprite();
    const flake = makeFlakeSprite();
    this.flow = new AqueousFlow(this.eye.eye, glow, { count: this.quality === 'low' ? 650 : 1300, clippingPlanes: this.stage.clippingPlanes });
    this.pigment = new FlowRiders(this.eye.eye, flake, this.flow, { count: 260, color: '#3a210f', size: 0.06, startCP: 2, speed: 0.55, stick: 0.85, clippingPlanes: this.stage.clippingPlanes });
    this.flakes = new FlowRiders(this.eye.eye, flake, this.flow, { count: 200, color: '#f4f2ea', size: 0.07, startCP: 4, speed: 0.5, stick: 0.8, clippingPlanes: this.stage.clippingPlanes });
    this.cells = new FlowRiders(this.eye.eye, flake, this.flow, { count: 220, color: '#ffffff', size: 0.085, startCP: 5, speed: 0.35, stick: 0.5, jitter: 1.6, clippingPlanes: this.stage.clippingPlanes });

    this.model = new PressureModel();
    this.rig = new CameraRig(camera, renderer.domElement, { isTouch: this.isTouch });
    this.raycaster = new THREE.Raycaster();
    this.raycaster.firstHitOnly = false;

    // labels
    this.labelRenderer = new CSS2DRenderer({ element: $('#labels') });
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.labels = LABELS.map(([id, p]) => {
      const div = document.createElement('div');
      div.className = 'label3d';
      div.textContent = PARTS[id].name.replace(' (nerve head)', '');
      div.addEventListener('click', () => this.select(id, { fly: true }));
      const o = new CSS2DObject(div);
      o.position.set(...p);
      o.userData.id = id;
      scene.add(o);
      return o;
    });

    this.buildUI();
    this.bindEvents();
    this.applyView(VIEWS.overview, { instant: true });
    this.applySimToEye(true);
    window.addEventListener('resize', () => this.onResize());
    this.onResize();

    // hide the loading screen and show the intro
    requestAnimationFrame(() => {
      const ld = $('#loading');
      ld.style.opacity = '0';
      setTimeout(() => ld.remove(), 650);
      this.showIntro(true);
    });
    renderer.setAnimationLoop(() => this.frame());
  }

  /** While the intro is visible the eye slowly turns on the right side of the screen. */
  showIntro(on) {
    this.introOn = on;
    document.body.classList.toggle('intro', on);
    this.ui.intro.classList.toggle('hidden', !on);
    const cam = this.stage.camera;
    const wide = window.innerWidth > 900;
    if (on && wide) cam.setViewOffset(window.innerWidth, window.innerHeight, -window.innerWidth * 0.2, 0, window.innerWidth, window.innerHeight);
    else if (on) cam.setViewOffset(window.innerWidth, window.innerHeight, 0, window.innerHeight * 0.18, window.innerWidth, window.innerHeight);
    else cam.clearViewOffset();
    this.rig.orbit.autoRotate = on;
    this.rig.orbit.autoRotateSpeed = 0.6;
  }

  /** Accelerate raycasting on every pickable mesh. */
  buildBVH() {
    for (const o of this.eye.pickables) {
      if (o.isMesh && o.geometry && !o.geometry.boundsTree && o.geometry.index !== null) {
        try {
          o.geometry.computeBoundsTree();
        } catch {
          /* fall back to normal raycasting */
        }
      }
    }
  }

  // -----------------------------------------------------------------------------------------
  buildUI() {
    const root = $('#ui');
    this.ui = buildShell(root, { isTouch: this.isTouch });
    this.chat = new ChatEngine();
    this.info = new InfoPanel(root, {
      chat: this.chat,
      onFly: (id) => this.flyToPart(id),
      onSelect: (id, o) => this.select(id, o),
      onClose: () => this.eye.setHighlight(null, false),
    });
    this.lab = new Lab(root, {
      model: this.model,
      fibres: this.eye.fibres,
      getCup: () => this.eye.cup,
      onScenario: (id) => this.onScenario(id),
      onView: (v) => this.labView(v),
      onVision: (on) => this.setVision(on),
    });
    this.lab.onClose = () => this.setNav(this.tours.active ? 'tours' : 'explore');
    this.clinic = new Clinic(root, { model: this.model, fibres: this.eye.fibres, vessels: this.eye.vessels, onOpenLab: () => this.openLab() });
    this.clinic.onClose = () => this.setNav(this.lab.isOpen ? 'lab' : 'explore');
    this.library = new Library(root, { onPart: (id) => this.select(id, { fly: true }) });
    this.library.onClose = () => this.setNav(this.lab.isOpen ? 'lab' : 'explore');
    this.tours = new Tours(root, { onStep: (s) => this.tourStep(s), onEnd: () => this.endTour() });
    const nerveWorld = this.eye.nerveSamples.map((p) => L2W(p.x, p.y, p.z));
    this.minimap = new Minimap(this.ui.minimap.querySelector('canvas'), nerveWorld);
    if (this.isTouch) this.rig.attachJoystick($('#joystick'), $('#joystick .knob'));
    this.updateHint();
    this.syncSettingsUI();
  }

  bindEvents() {
    const ui = this.ui;
    const canvas = this.stage.renderer.domElement;
    ui.topbar.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.nav) this.navigate(b.dataset.nav);
      if (b.dataset.act === 'settings') ui.settings.classList.toggle('hidden');
      if (b.dataset.act === 'help') ui.help.classList.remove('hidden');
    });
    ui.help.addEventListener('click', (e) => {
      if (e.target === ui.help || e.target.closest('[data-act="close"]')) ui.help.classList.add('hidden');
    });
    ui.intro.addEventListener('click', (e) => {
      const b = e.target.closest('[data-start]');
      if (!b) return;
      this.showIntro(false);
      if (b.dataset.start === 'tour') this.tours.start('drop');
      if (b.dataset.start === 'explore') {
        this.navigate('explore');
        toast(this.isTouch ? 'Tap any part to learn about it. Switch to <strong>Swim</strong> to go inside.' : 'Click any part to learn about it. Press <span class="kbd">V</span> to swim inside.', 4200);
      }
      if (b.dataset.start === 'lab') this.navigate('lab');
    });
    ui.location.addEventListener('click', (e) => {
      if (e.target.closest('[data-act="where"]')) this.select(REGION_ENTRY[this.region] || 'outside');
    });
    ui.modeSwitch.addEventListener('click', (e) => {
      const b = e.target.closest('[data-mode]');
      if (b) this.setCamMode(b.dataset.mode);
    });
    ui.viewTools.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.act === 'cut') this.setCut(!this.stage.cutawayOn);
      if (b.dataset.act === 'home') this.applyView(VIEWS.overview);
    });
    ui.visionBadge.addEventListener('click', (e) => {
      const b = e.target.closest('[data-vmode]');
      if (!b) return;
      this.visionMode = b.dataset.vmode;
      for (const x of ui.visionBadge.querySelectorAll('[data-vmode]')) x.classList.toggle('active', x === b);
      this.refreshVision(true);
    });
    ui.settings.addEventListener('input', (e) => {
      const k = e.target.dataset.set;
      if (!k) return;
      const v = e.target.type === 'checkbox' ? e.target.checked : +e.target.value;
      this.settings[k] = v;
      if (k === 'muscles') this.eye.setLayer('muscles', v);
      if (k === 'fibres') this.eye.setLayer('fibres', v);
      if (k === 'cut') this.setCut(v);
      if (k === 'cutOffset') {
        this.stage.cutOffset = v;
        if (this.stage.cutawayOn) this.stage.setCutaway(true);
      }
    });
    ui.settings.addEventListener('click', (e) => {
      const c = e.target.closest('[data-eyecolor]');
      if (c) {
        this.eye.setEyeColor(c.dataset.eyecolor);
        safeSet('ge-eye', c.dataset.eyecolor);
        this.syncSettingsUI();
      }
      const q = e.target.closest('[data-q]');
      if (q) {
        safeSet('ge-quality', q.dataset.q);
        toast('Reloading with the new quality…');
        setTimeout(() => location.reload(), 600);
      }
    });
    document.addEventListener('pointerdown', (e) => {
      if (!ui.settings.classList.contains('hidden') && !e.target.closest('#settings, [data-act="settings"]')) ui.settings.classList.add('hidden');
    });

    // pointing & selecting
    let down = null;
    canvas.addEventListener('pointerdown', (e) => {
      down = { x: e.clientX, y: e.clientY, t: performance.now() };
    });
    canvas.addEventListener('pointermove', (e) => {
      this.mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      this.mouseClient = { x: e.clientX, y: e.clientY };
      this.mouseMoved = true;
    });
    canvas.addEventListener('pointerleave', () => {
      this.mouseClient = null;
      this.setHover(null);
    });
    canvas.addEventListener('pointerup', (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const quick = performance.now() - down.t < 450;
      down = null;
      if (moved > 6 || !quick || this.rig.flying) return;
      if (this.rig.mode === 'swim') {
        if (!this.isTouch && !this.rig.locked) {
          this.rig.requestLock();
          return;
        }
        this.inspectCenter();
        return;
      }
      this.mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      const hit = this.pickAt(this.mouse);
      if (hit) this.select(hit.id);
    });
    this.rig.onModeChange = (m) => this.onCamMode(m);
    this.rig.onLockChange = () => this.updateHint();

    // touch buttons
    const tb = $('#touch-buttons');
    if (tb) {
      const press = (e, on) => {
        const b = e.target.closest('[data-touch]');
        if (!b) return;
        if (b.dataset.touch === 'up') this.rig.vertical = on ? 1 : 0;
        if (b.dataset.touch === 'down') this.rig.vertical = on ? -1 : 0;
        if (b.dataset.touch === 'inspect' && on) this.inspectCenter();
      };
      tb.addEventListener('pointerdown', (e) => press(e, true));
      tb.addEventListener('pointerup', (e) => press(e, false));
      tb.addEventListener('pointercancel', (e) => press(e, false));
    }

    window.addEventListener('keydown', (e) => {
      if (e.target.closest('input, textarea, select')) return;
      if (e.code === 'KeyV') this.setCamMode(this.rig.mode === 'orbit' ? 'swim' : 'orbit');
      if (e.code === 'KeyC') this.setCut(!this.stage.cutawayOn);
      if (e.code === 'KeyL') this.navigate('library');
      if (e.code === 'KeyH') this.ui.help.classList.toggle('hidden');
      if (e.code === 'KeyF' && this.rig.mode === 'swim') this.inspectCenter();
      if (e.code === 'Escape') this.closeTop();
    });
  }

  // -----------------------------------------------------------------------------------------
  // navigation between the main sections
  setNav(id) {
    for (const b of this.ui.topbar.querySelectorAll('[data-nav]')) b.classList.toggle('active', b.dataset.nav === id);
  }

  navigate(id) {
    if (this.introOn) this.showIntro(false);
    if (id === 'explore') {
      this.clinic.close();
      this.library.close();
      if (this.tours.active) this.tours.end();
      this.lab.close();
      this.setNav('explore');
    } else if (id === 'tours') {
      this.tours.openPicker();
      this.setNav('tours');
    } else if (id === 'lab') {
      if (this.lab.isOpen) {
        this.lab.close();
      } else this.openLab();
    } else if (id === 'clinic') {
      this.clinic.open();
      this.setNav('clinic');
    } else if (id === 'library') {
      this.library.open();
      this.setNav('library');
    }
  }

  openLab() {
    if (this.tours.active) this.tours.end();
    this.info.close();
    this.lab.open();
    if (this.model.id !== 'healthy' && this.lab.body.querySelector('.scenario-grid') === null) this.lab.update(true);
    this.setNav('lab');
  }

  closeTop() {
    if (!this.ui.help.classList.contains('hidden')) return this.ui.help.classList.add('hidden');
    if (!this.ui.settings.classList.contains('hidden')) return this.ui.settings.classList.add('hidden');
    if (this.clinic.isOpen) return this.clinic.close();
    if (this.library.isOpen) return this.library.close();
    if (!this.tours.picker.classList.contains('hidden')) return this.tours.closePicker();
    if (this.info.isOpen) return this.info.close();
  }

  // -----------------------------------------------------------------------------------------
  // selecting parts
  select(id, { fly = false } = {}) {
    if (!PARTS[id]) return;
    this.info.show(id);
    this.eye.setHighlight(id, true);
    if (fly) this.flyToPart(id);
    this.rig.exitLock();
  }

  flyToPart(id) {
    const v = VIEWS[id];
    if (v) this.applyView(v);
  }

  applyView(v, { instant = false } = {}) {
    if (!v) return;
    const pos = new THREE.Vector3(...v.pos);
    const target = new THREE.Vector3(...v.target);
    const scale = this.eye.vis.globeScale;
    pos.multiplyScalar(scale);
    target.multiplyScalar(scale);
    if (v.cut !== undefined) {
      if (v.cutOffset !== undefined) {
        this.stage.cutOffset = v.cutOffset;
        this.settings.cutOffset = v.cutOffset;
      }
      this.setCut(v.cut);
    }
    if (v.muscles) {
      this.settings.muscles = true;
      this.eye.setLayer('muscles', true);
      this.syncSettingsUI();
    }
    if (instant) {
      this.stage.camera.position.copy(pos);
      this.stage.camera.lookAt(target);
      this.rig.orbit.target.copy(target);
      this.rig.orbit.update();
      return;
    }
    this.rig.flyTo(pos, target, { then: 'orbit' });
  }

  inspectCenter() {
    const hit = this.pickAt(new THREE.Vector2(0, 0));
    if (hit) this.select(hit.id);
    else toast('Point the crosshair at something to inspect it.');
  }

  pickAt(ndc) {
    this.raycaster.setFromCamera(ndc, this.stage.camera);
    return this.eye.pick(this.raycaster, this.stage.clipPlane, this.stage.cutawayOn);
  }

  setHover(hit) {
    const tt = this.ui.tooltip;
    const id = hit?.id || null;
    if (id !== this.hover?.id) {
      if (!this.info.isOpen) this.eye.setHighlight(id, !!id);
    }
    this.hover = hit;
    if (!hit || !PARTS[hit.id]) {
      tt.classList.add('hidden');
      this.ui.crosshair.classList.remove('hit');
      return;
    }
    const p = PARTS[hit.id];
    tt.querySelector('.tt-name').textContent = p.name;
    tt.querySelector('.tt-sub').textContent = p.tagline + (hit.through ? ` · seen through the ${PARTS[hit.through]?.name.toLowerCase()}` : '');
    tt.querySelector('.tt-hint').textContent = this.rig.mode === 'swim' ? (this.isTouch ? 'Tap Inspect to learn more' : 'Click or press F to learn more') : 'Click to learn more & ask questions';
    tt.classList.remove('hidden');
    this.ui.crosshair.classList.add('hit');
    if (this.rig.mode === 'swim' || !this.mouseClient) {
      tt.classList.add('center');
    } else {
      tt.classList.remove('center');
      tt.style.left = `${Math.min(window.innerWidth - 300, this.mouseClient.x)}px`;
      tt.style.top = `${Math.min(window.innerHeight - 90, this.mouseClient.y)}px`;
    }
  }

  // -----------------------------------------------------------------------------------------
  // camera modes
  setCamMode(m) {
    if (m === 'swim' && this.stage.cutawayOn) this.setCut(false);
    this.rig.cancelFlight();
    this.rig.setMode(m);
  }

  onCamMode(m) {
    for (const b of this.ui.modeSwitch.querySelectorAll('[data-mode]')) b.classList.toggle('active', b.dataset.mode === m);
    this.ui.crosshair.classList.toggle('hidden', m !== 'swim');
    this.ui.touch.classList.toggle('hidden', !(this.isTouch && m === 'swim'));
    if (m === 'swim' && this.rig.mode === 'swim') {
      if (!this.isTouch) toast('Click the view to steer with your mouse · <span class="kbd">W A S D</span> to swim · <span class="kbd">Esc</span> to release', 4200);
    }
    this.updateHint();
  }

  setCut(on) {
    this.stage.setCutaway(on);
    this.caps.setVisible(on);
    this.settings.cut = on;
    this.ui.viewTools.querySelector('[data-act="cut"]').classList.toggle('on', on);
    this.syncSettingsUI();
  }

  updateHint() {
    const h = this.ui.hint;
    if (this.isTouch) return;
    if (this.rig?.mode === 'swim') {
      h.innerHTML = this.rig.locked
        ? `<span><span class="kbd">W</span><span class="kbd">A</span><span class="kbd">S</span><span class="kbd">D</span> swim</span><span><span class="kbd">E</span>/<span class="kbd">Q</span> up/down</span><span><span class="kbd">Shift</span> fast</span><span><span class="kbd">Click</span> inspect</span><span><span class="kbd">Esc</span> release mouse</span>`
        : `<span>Click the view to steer with the mouse</span><span><span class="kbd">W</span><span class="kbd">A</span><span class="kbd">S</span><span class="kbd">D</span> swim</span><span><span class="kbd">V</span> back to orbit</span>`;
    } else {
      h.innerHTML = `<span><span class="kbd">Drag</span> rotate</span><span><span class="kbd">Scroll</span> zoom</span><span><span class="kbd">Click</span> a part to learn</span><span><span class="kbd">V</span> swim inside</span><span><span class="kbd">C</span> cut open</span>`;
    }
  }

  syncSettingsUI() {
    const s = this.ui.settings;
    for (const inp of s.querySelectorAll('[data-set]')) {
      const k = inp.dataset.set;
      if (inp.type === 'checkbox') inp.checked = !!this.settings[k];
      else inp.value = this.settings[k];
    }
    const eye = safeGet('ge-eye') || 'hazel';
    for (const b of s.querySelectorAll('[data-eyecolor]')) b.classList.toggle('active', b.dataset.eyecolor === eye);
    for (const b of s.querySelectorAll('[data-q]')) b.classList.toggle('active', b.dataset.q === this.qualityPref);
  }

  // -----------------------------------------------------------------------------------------
  // simulation hooks
  onScenario(id) {
    this.applySimToEye(true);
    const view = SCENARIOS[id].view;
    this.labView(view);
    if (this.visionOn) this.refreshVision(true);
  }

  labView(v) {
    if (v === 'angle') this.applyView(VIEWS['drainage-angle']);
    else if (v === 'disc') this.applyView(VIEWS['optic-disc']);
    else this.applyView(VIEWS.overview);
  }

  applySimToEye(force = false) {
    this.eye.applyState(this.model.visual());
    this.flow.setParams(this.model.flowParams());
    if (force) this.lab?.update(true);
  }

  setVision(on) {
    this.visionOn = on;
    $('#vision').classList.toggle('hidden', !on);
    this.ui.visionBadge.classList.toggle('hidden', !on);
    this.refreshVision(true);
  }

  refreshVision(force = false) {
    if (!this.visionOn) return;
    const dmg = this.eye.vis.damage;
    if (!force && Math.abs((this._visionDamage ?? -1) - dmg) < 0.01) return;
    this._visionDamage = dmg;
    const field = fieldFor(this.eye.fibres, dmg);
    const cam = this.stage.camera;
    const url = visionMaskDataUrl(field, cam.fov, cam.aspect, { strength: this.visionMode === 'dark' ? 1.15 : 1 });
    const v = $('#vision');
    v.classList.toggle('dark', this.visionMode === 'dark');
    v.style.maskImage = `url(${url})`;
    v.style.webkitMaskImage = `url(${url})`;
    v.style.maskSize = '100% 100%';
    v.style.webkitMaskSize = '100% 100%';
  }

  // -----------------------------------------------------------------------------------------
  // tours
  tourStep(step) {
    this.setNav('tours');
    this.lab.close();
    this.info.close();
    if (step.sim) {
      this.model.reset(step.sim);
      this.lab.render?.call(this.lab);
    }
    if (step.simTime !== undefined) {
      this.model.t = step.simTime;
      this.model.compute();
    }
    if (step.treat) {
      for (const t of step.treat) if (!this.model.treatments.has(t)) this.model.treatments.set(t, this.model.t);
      this.model.compute();
    }
    if (step.damage !== undefined) this.model.damage = step.damage;
    this.applySimToEye();
    if (step.flow !== undefined) this.settings.flow = step.flow || this.settings.flow;
    const v = step.view ? { ...VIEWS[step.view] } : null;
    if (v && step.cut !== undefined) v.cut = step.cut;
    if (v) this.applyView(v);
    this.eye.setHighlight(step.highlight || null, !!step.highlight);
    if (step.vision !== undefined) this.setVision(step.vision);
  }

  endTour() {
    this.eye.setHighlight(null, false);
    if (this.visionOn) this.setVision(false);
    this.setNav('explore');
  }

  // -----------------------------------------------------------------------------------------
  onResize() {
    this.labelRenderer?.setSize(window.innerWidth, window.innerHeight);
    if (this.introOn) this.showIntro(true);
    this.refreshVision(true);
  }

  updateRegion() {
    const cam = this.stage.camera.position;
    const local = this.eye.eye.worldToLocal(cam.clone());
    let reg = A.regionAt(local.x, local.y, local.z, this.eye.irisProfileNow, (x, y, z) => this.eye.insideNerve(x, y, z));
    if (reg === 'anterior-chamber') {
      const r = Math.hypot(local.x, local.z);
      if (r > 4.9 && local.y < 9.75) reg = 'drainage-angle';
    }
    // when the eye is cut open and we are on the removed side, we are effectively outside
    if (this.stage.cutawayOn && this.stage.clipPlane.distanceToPoint(cam) < 0 && reg !== 'outside') reg = 'outside';
    if (reg !== this.region) {
      this.region = reg;
      this.ui.location.querySelector('[data-k="loc"]').textContent = REGION_NAMES[reg] || reg;
    }
    const inside = reg === 'outside' ? Math.max(0, 1 - (cam.length() - 12) / 6) * 0.3 : 1;
    this.insideTarget = inside;
  }

  // -----------------------------------------------------------------------------------------
  /** One animation frame. */
  frame() {
    this.timer.update();
    const dt = Math.min(0.05, this.timer.getDelta());
    this.time += dt;
    this.frameNo++;
    const f = this.frameNo;

    // 1. simulation
    this.lab.tick(dt);
    if (this.lab.playing || f % 15 === 0) this.applySimToEye();
    if (this.lab.isOpen && f % 6 === 0) this.lab.update();
    if (this.visionOn && f % 20 === 0) this.refreshVision();

    // 2. camera & where am I
    this.rig.update(dt);
    if (f % 6 === 0) this.updateRegion();
    const inside = this.insideTarget ?? 0;
    this.stage.setInside(this.stage.insideAmount + (inside - this.stage.insideAmount) * Math.min(1, dt * 3));
    const [fc, fd] = FOG[this.region] || FOG.outside;
    const fog = this.stage.scene.fog;
    fog.color.lerp(new THREE.Color(fc), Math.min(1, dt * 3));
    fog.density += (fd - fog.density) * Math.min(1, dt * 3);

    // 3. the eye and its fluids
    const st = this.model.state;
    this.eye.update(dt, this.time);
    this.eye.setProductionGlow(this.settings.flow ? st.flow : 0, this.time);
    const flowVisible = this.settings.flow;
    this.flow.update(dt, flowVisible);
    this.pigment.update(dt, flowVisible ? st.pigment : 0);
    this.flakes.update(dt, flowVisible ? st.pxf : 0);
    this.cells.update(dt, flowVisible ? st.inflammation : 0);
    const h = this.stage.renderer.getDrawingBufferSize(new THREE.Vector2()).y;
    const scale = h / (2 * Math.tan((this.stage.camera.fov * Math.PI) / 360));
    for (const m of [this.flow.material, this.pigment.material, this.flakes.material, this.cells.material]) m.uniforms.uScale.value = scale;

    // 4. pointing
    if (!this.rig.flying && f % 3 === 0) {
      let hit = null;
      if (this.rig.mode === 'swim') hit = this.pickAt(new THREE.Vector2(0, 0));
      else if (this.mouseClient && (this.mouseMoved || f % 15 === 0) && !this.isTouch) hit = this.pickAt(this.mouse);
      else hit = this.hover;
      this.mouseMoved = false;
      this.setHover(hit);
      if (this.rig.mode === 'swim') this.rig.aheadDistance = hit ? hit.distance : 8;
    }

    // 5. HUD
    if (f % 4 === 0) {
      const dir = new THREE.Vector3();
      this.stage.camera.getWorldDirection(dir);
      this.minimap.draw(this.stage.camera.position, dir, this.eye.vis.globeScale);
      const showPressure = this.model.id !== 'healthy' || this.lab.isOpen;
      this.ui.pressure.classList.toggle('hidden', !showPressure);
      if (showPressure) {
        const iop = st.IOP;
        const v = this.ui.pressure.querySelector('[data-k="iop"]');
        v.textContent = `${iop.toFixed(0)} mmHg`;
        v.style.color = iop > 30 ? 'var(--bad)' : iop > 21 ? 'var(--warn)' : 'var(--good)';
        this.ui.pressure.querySelector('[data-k="sc"]').textContent = TYPES[this.model.id].name;
      }
      const showLabels = this.settings.labels && this.rig.mode === 'orbit' && this.stage.camera.position.length() > 24 && !this.tours.active;
      for (const l of this.labels) {
        const clipped = this.stage.cutawayOn && l.position.x < -this.stage.cutOffset;
        l.visible = showLabels && !clipped;
      }
    }

    // 6. draw
    this.caps.update();
    this.stage.render();
    this.labelRenderer.render(this.stage.scene, this.stage.camera);
  }

  noWebGL() {
    $('#loading')?.remove();
    const root = $('#ui');
    this.ui = buildShell(root, { isTouch: this.isTouch });
    const lib = new Library(root, { onPart: () => {} });
    lib.open('anatomy');
    toast('3D graphics (WebGL) are not available on this device — showing the library instead.', 8000);
  }
}

function safeGet(k) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function safeSet(k, v) {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* storage unavailable */
  }
}

const app = new App();
app.init();
window.__app = app;
