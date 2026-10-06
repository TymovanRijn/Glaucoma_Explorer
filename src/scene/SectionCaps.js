/**
 * SECTION CAPS
 *
 * When we slice the eye open ("cutaway"), WebGL simply stops drawing everything on one side
 * of the plane — which leaves hollow, see-through shells. Anatomy textbooks instead show
 * solid, colour-filled cross-sections. We do the same with the stencil buffer:
 *
 *  1. Draw the back faces of a closed tissue volume (count +1) and its front faces (count −1)
 *     without colour. Where the cut plane passes *through* the tissue, the count is not zero.
 *  2. Draw a flat plane on the cut, but only where the count is not zero, in the tissue colour.
 */
import * as THREE from 'three';

export class SectionCaps {
  constructor(scene, clipPlane) {
    this.scene = scene;
    this.clipPlane = clipPlane;
    this.items = [];
    this.order = 10;
    this.visible = false;
    this.planeGeo = new THREE.PlaneGeometry(34, 34); // just larger than the eye's cross-section
  }

  /**
   * @param parent    Object3D the volume belongs to (shares its transform)
   * @param geometry  a closed (watertight) BufferGeometry
   * @param color     cap colour
   */
  add(parent, geometry, color, { opacity = 1, partId = null } = {}) {
    const order = this.order;
    this.order += 1;
    const base = new THREE.MeshBasicMaterial({
      depthWrite: false,
      depthTest: false,
      colorWrite: false,
      stencilWrite: true,
      stencilFunc: THREE.AlwaysStencilFunc,
      clippingPlanes: [this.clipPlane],
    });
    const back = base.clone();
    back.side = THREE.BackSide;
    back.stencilFail = back.stencilZFail = back.stencilZPass = THREE.IncrementWrapStencilOp;
    const front = base.clone();
    front.side = THREE.FrontSide;
    front.stencilFail = front.stencilZFail = front.stencilZPass = THREE.DecrementWrapStencilOp;
    // Material.clone() deep-copies clipping planes; we need the *live* plane so the cut moves.
    back.clippingPlanes = [this.clipPlane];
    front.clippingPlanes = [this.clipPlane];
    const m0 = new THREE.Mesh(geometry, back);
    const m1 = new THREE.Mesh(geometry, front);
    m0.renderOrder = order;
    m1.renderOrder = order;
    m0.frustumCulled = m1.frustumCulled = false;
    parent.add(m0, m1);

    // unlit, flat colour: cheap to draw (it can cover the whole screen) and diagram-like
    const capMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(0.92),
      transparent: opacity < 1,
      opacity,
      stencilWrite: true,
      stencilRef: 0,
      stencilFunc: THREE.NotEqualStencilFunc,
      stencilFail: THREE.ReplaceStencilOp,
      stencilZFail: THREE.ReplaceStencilOp,
      stencilZPass: THREE.ReplaceStencilOp,
      side: THREE.DoubleSide,
      fog: false,
    });
    const cap = new THREE.Mesh(this.planeGeo, capMat);
    cap.renderOrder = order + 0.5;
    cap.onAfterRender = (renderer) => renderer.clearStencil();
    if (partId) cap.userData.partId = partId;
    this.scene.add(cap);
    const item = { m0, m1, cap, parent };
    this.items.push(item);
    this.setVisible(this.visible);
    return item;
  }

  /** Swap the geometry of a volume (e.g. when the iris changes shape). */
  setGeometry(item, geometry) {
    item.m0.geometry = geometry;
    item.m1.geometry = geometry;
  }

  setVisible(on) {
    this.visible = on;
    for (const it of this.items) {
      it.m0.visible = it.m1.visible = it.cap.visible = on;
    }
  }

  /** Keep the cap planes exactly on the clipping plane. */
  update() {
    if (!this.visible) return;
    const p = this.clipPlane;
    for (const it of this.items) {
      // plane: n·x + c = 0  ->  point = -c * n
      it.cap.position.copy(p.normal).multiplyScalar(-p.constant);
      it.cap.lookAt(it.cap.position.clone().sub(p.normal));
      it.cap.scale.setScalar(this.scale || 1);
    }
  }
}
