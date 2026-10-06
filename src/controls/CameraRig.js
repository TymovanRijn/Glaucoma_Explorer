/**
 * CAMERA RIG — three ways to move:
 *   orbit : circle around a point of interest (drag to rotate, scroll / pinch to zoom)
 *   swim  : first-person, like a tiny diver inside the eye (WASD + mouse, or touch joystick)
 *   fly   : smooth automatic flights used by tours and "Fly here" buttons
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class CameraRig {
  constructor(camera, dom, { isTouch = false } = {}) {
    this.camera = camera;
    this.dom = dom;
    this.isTouch = isTouch;
    this.mode = 'orbit';
    this.orbit = new OrbitControls(camera, dom);
    this.orbit.enableDamping = true;
    this.orbit.dampingFactor = 0.08;
    this.orbit.minDistance = 0.25;
    this.orbit.maxDistance = 95;
    this.orbit.zoomSpeed = 0.9;
    this.orbit.rotateSpeed = 0.7;
    this.orbit.target.set(0, 0, 1);

    this.yaw = 0;
    this.pitch = 0;
    this.vel = new THREE.Vector3();
    this.keys = new Set();
    this.speedMul = 1;
    this.aheadDistance = 10;
    this.locked = false;
    this.flight = null;
    this.joy = { x: 0, y: 0, active: false };
    this.vertical = 0;
    this.onModeChange = null;
    this.onLockChange = null;
    this.bound = 75;

    this._bindKeys();
    this._bindPointer();
  }

  // ---------------------------------------------------------------------------------------
  setMode(mode) {
    if (mode === this.mode) return;
    this.mode = mode;
    if (mode === 'orbit') {
      this.exitLock();
      // orbit around whatever is in front of us
      const dir = new THREE.Vector3();
      this.camera.getWorldDirection(dir);
      this.orbit.target.copy(this.camera.position).addScaledVector(dir, Math.min(12, Math.max(1, this.aheadDistance * 0.7)));
      this.orbit.enabled = true;
      this.orbit.update();
    } else if (mode === 'swim') {
      this.orbit.enabled = false;
      this._syncAnglesFromCamera();
      this.vel.set(0, 0, 0);
    }
    this.onModeChange?.(mode);
  }

  _syncAnglesFromCamera() {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    this.yaw = Math.atan2(-dir.x, -dir.z);
    this.pitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
  }

  /** Fly smoothly to a position, looking at a target. */
  flyTo(pos, target, { duration = 2.2, then = null, onDone = null } = {}) {
    const fromPos = this.camera.position.clone();
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    const fromTarget = this.mode === 'orbit' ? this.orbit.target.clone() : fromPos.clone().addScaledVector(dir, Math.max(1, fromPos.distanceTo(target)));
    const dist = fromPos.distanceTo(pos);
    // quick hops for short distances, slower for long journeys
    const d = Math.min(duration, 0.8 + dist * 0.06);
    this.flight = { fromPos, fromTarget, toPos: pos.clone(), toTarget: target.clone(), t: 0, d: Math.max(0.6, d), then, onDone };
    this.orbit.enabled = false;
    this.exitLock();
  }

  get flying() {
    return !!this.flight;
  }

  cancelFlight() {
    this.flight = null;
    if (this.mode === 'orbit') this.orbit.enabled = true;
  }

  // ---------------------------------------------------------------------------------------
  update(dt) {
    if (this.flight) {
      const f = this.flight;
      f.t += dt / f.d;
      const k = ease(Math.min(1, f.t));
      // arc slightly so the camera does not cut straight through tissue at the start
      this.camera.position.lerpVectors(f.fromPos, f.toPos, k);
      const tgt = new THREE.Vector3().lerpVectors(f.fromTarget, f.toTarget, Math.min(1, k * 1.15));
      this.camera.lookAt(tgt);
      if (f.t >= 1) {
        this.flight = null;
        const mode = f.then || this.mode;
        if (mode === 'orbit') {
          this.mode = 'orbit';
          this.orbit.target.copy(f.toTarget);
          this.orbit.enabled = true;
          this.orbit.update();
        } else {
          this.mode = 'swim';
          this.orbit.enabled = false;
          this._syncAnglesFromCamera();
        }
        this.onModeChange?.(this.mode);
        f.onDone?.();
      }
      return;
    }
    if (this.mode === 'orbit') {
      this.orbit.update();
      // scale zoom/pan speed to how close we are
      const d = this.camera.position.distanceTo(this.orbit.target);
      this.orbit.panSpeed = Math.min(1, 0.2 + d * 0.03);
      return;
    }
    // ----- swim -----
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
    this.camera.quaternion.copy(q);
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
    const up = new THREE.Vector3(0, 1, 0);
    const want = new THREE.Vector3();
    const k = this.keys;
    if (k.has('KeyW') || k.has('ArrowUp')) want.add(fwd);
    if (k.has('KeyS') || k.has('ArrowDown')) want.sub(fwd);
    if (k.has('KeyD') || k.has('ArrowRight')) want.add(right);
    if (k.has('KeyA') || k.has('ArrowLeft')) want.sub(right);
    if (k.has('KeyE') || k.has('Space')) want.add(up);
    if (k.has('KeyQ')) want.sub(up);
    if (this.joy.active) {
      want.addScaledVector(fwd, -this.joy.y);
      want.addScaledVector(right, this.joy.x);
    }
    if (this.vertical) want.addScaledVector(up, this.vertical);
    if (want.lengthSq() > 1) want.normalize();
    // adaptive speed: slow near walls, fast in open space (like Google Earth)
    const base = Math.min(9, Math.max(0.22, this.aheadDistance * 0.55));
    const boost = k.has('ShiftLeft') || k.has('ShiftRight') ? 3 : 1;
    want.multiplyScalar(base * boost * this.speedMul);
    this.vel.lerp(want, 1 - Math.exp(-dt * 6));
    this.camera.position.addScaledVector(this.vel, dt);
    if (this.camera.position.length() > this.bound) this.camera.position.setLength(this.bound);
  }

  // ---------------------------------------------------------------------------------------
  _bindKeys() {
    window.addEventListener('keydown', (e) => {
      if (e.target.closest('input, textarea, select, [contenteditable]')) return;
      this.keys.add(e.code);
      if (this.mode === 'swim' && ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
  }

  requestLock() {
    if (this.isTouch || this.mode !== 'swim') return;
    try {
      const p = this.dom.requestPointerLock?.();
      if (p && p.catch) p.catch(() => {});
    } catch {
      /* pointer lock not available: drag-to-look still works */
    }
  }

  exitLock() {
    if (document.pointerLockElement === this.dom) document.exitPointerLock?.();
  }

  _bindPointer() {
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === this.dom;
      this.onLockChange?.(this.locked);
    });
    document.addEventListener('mousemove', (e) => {
      if (this.mode !== 'swim' || this.flight) return;
      if (this.locked) this._look(e.movementX, e.movementY, 0.0022);
    });
    // drag-to-look fallback (and touch look on the right half of the screen)
    let drag = null;
    this.dom.addEventListener('pointerdown', (e) => {
      if (this.mode !== 'swim' || this.locked) return;
      if (e.pointerType === 'touch' && e.clientX < window.innerWidth * 0.45) return; // joystick side
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
    });
    window.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      this._look(dx, dy, e.pointerType === 'touch' ? 0.005 : 0.004);
    });
    window.addEventListener('pointerup', (e) => {
      if (drag && e.pointerId === drag.id) drag = null;
    });
    this.dom.addEventListener(
      'wheel',
      (e) => {
        if (this.mode !== 'swim') return;
        e.preventDefault();
        this.speedMul = Math.min(4, Math.max(0.25, this.speedMul * (e.deltaY > 0 ? 0.88 : 1.14)));
      },
      { passive: false },
    );
  }

  _look(dx, dy, s) {
    this.yaw -= dx * s;
    this.pitch = Math.max(-1.55, Math.min(1.55, this.pitch - dy * s));
  }

  /** Attach an on-screen joystick element (touch devices). */
  attachJoystick(base, knob) {
    let id = null;
    let cx = 0;
    let cy = 0;
    const R = 46;
    const move = (e) => {
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const l = Math.min(R, Math.hypot(dx, dy));
      const a = Math.atan2(dy, dx);
      const x = Math.cos(a) * l;
      const y = Math.sin(a) * l;
      knob.style.transform = `translate(${x}px, ${y}px)`;
      this.joy.x = x / R;
      this.joy.y = y / R;
    };
    base.addEventListener('pointerdown', (e) => {
      id = e.pointerId;
      const r = base.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
      this.joy.active = true;
      base.setPointerCapture(id);
      move(e);
    });
    base.addEventListener('pointermove', (e) => {
      if (e.pointerId === id) move(e);
    });
    const end = (e) => {
      if (e.pointerId !== id) return;
      id = null;
      this.joy.active = false;
      this.joy.x = this.joy.y = 0;
      knob.style.transform = '';
    };
    base.addEventListener('pointerup', end);
    base.addEventListener('pointercancel', end);
  }
}
