/**
 * The stage: renderer, camera, lights, background and the "cutaway" clipping plane.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export class Stage {
  constructor(container, { quality = 'high' } = {}) {
    this.container = container;
    this.quality = quality;
    const renderer = new THREE.WebGLRenderer({
      antialias: quality !== 'low',
      logarithmicDepthBuffer: true, // we fly from 60 mm away down to 0.01 mm details
      stencil: true, // needed for the solid cross-section caps
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'low' ? 1.25 : 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.localClippingEnabled = true;
    container.appendChild(renderer.domElement);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    this.bgColor = new THREE.Color('#040a14');
    scene.background = this.bgColor.clone();
    scene.fog = new THREE.FogExp2(this.bgColor.clone(), 0);
    this.scene = scene;

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.45;

    this.camera = new THREE.PerspectiveCamera(62, container.clientWidth / container.clientHeight, 0.004, 600);
    this.camera.position.set(-34, 12, 24);
    scene.add(this.camera);

    // Lights: soft sky/ground fill, a key light, a cool rim light, and a headlamp on the camera
    this.hemi = new THREE.HemisphereLight('#cfe3ff', '#3a2620', 0.7);
    scene.add(this.hemi);
    this.key = new THREE.DirectionalLight('#fff4e6', 2.0);
    this.key.position.set(-20, 30, 40);
    scene.add(this.key);
    this.rim = new THREE.DirectionalLight('#7fa8ff', 1.1);
    this.rim.position.set(25, -10, -30);
    scene.add(this.rim);
    this.headlamp = new THREE.PointLight('#fff1dc', 2.5, 0, 1.15);
    this.camera.add(this.headlamp);
    this.insideAmount = 0;

    // Cutaway: everything with x < -cut is clipped away (we keep the nasal half of the eye)
    this.clipPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 1e4);
    this.clippingPlanes = [this.clipPlane];
    this.cutawayOn = false;
    this.cutOffset = 2.0;

    this.buildBackdrop();
    window.addEventListener('resize', () => this.resize());
  }

  /**
   * Lighting changes when you swim inside: the outside "studio" lights would shine through
   * the walls and wash everything out, so inside we rely mostly on your headlamp.
   * t = 0 (outside) ... 1 (deep inside)
   */
  setInside(t) {
    this.insideAmount = t;
    this.key.intensity = 2.0 * (1 - t * 0.8);
    this.rim.intensity = 1.1 * (1 - t * 0.9);
    this.hemi.intensity = 0.7 - t * 0.35;
    this.hemi.color.set(t > 0.5 ? '#ffe9dc' : '#cfe3ff');
    this.headlamp.intensity = 2.5 + t * 1.5;
    this.scene.environmentIntensity = 0.45 - t * 0.25;
  }

  setCutaway(on) {
    this.cutawayOn = on;
    this.clipPlane.constant = on ? this.cutOffset : 1e4;
  }

  /** Soft drifting specks far away, so the space around the eye feels deep. */
  buildBackdrop() {
    const n = 900;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 90 + Math.random() * 220;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ color: '#5d8bbf', size: 1.1, sizeAttenuation: true, transparent: true, opacity: 0.55, depthWrite: false, fog: false });
    this.backdrop = new THREE.Points(g, m);
    this.scene.add(this.backdrop);
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
