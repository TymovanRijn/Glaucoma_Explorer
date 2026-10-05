import * as THREE from 'three';

/** Build a LatheGeometry from [[r, y], ...] points. */
export function lathe(points, segments = 128) {
  const v = points.map(([r, y]) => new THREE.Vector2(Math.max(0, r), y));
  return new THREE.LatheGeometry(v, segments);
}

/**
 * A tube with a different radius at every point. `up(p)` gives a reference "up" direction
 * at a point (for vessels on the retina we use the direction to the eye centre) so the
 * tube never twists.
 */
export function variableTube(points, radii, radial = 6, up = null) {
  const n = points.length;
  const pos = new Float32Array(n * (radial + 1) * 3);
  const nor = new Float32Array(n * (radial + 1) * 3);
  const uv = new Float32Array(n * (radial + 1) * 2);
  const idx = [];
  const T = new THREE.Vector3();
  const N = new THREE.Vector3();
  const B = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  let prevN = null;
  for (let i = 0; i < n; i++) {
    const p = points[i];
    const a = points[Math.max(0, i - 1)];
    const b = points[Math.min(n - 1, i + 1)];
    T.subVectors(b, a).normalize();
    if (up) {
      N.copy(up(p));
    } else if (prevN) {
      N.copy(prevN);
    } else {
      N.set(0, 1, 0);
      if (Math.abs(T.dot(N)) > 0.9) N.set(1, 0, 0);
    }
    B.crossVectors(T, N).normalize();
    N.crossVectors(B, T).normalize();
    prevN = N.clone();
    for (let k = 0; k <= radial; k++) {
      const ang = (k / radial) * Math.PI * 2;
      tmp.copy(N).multiplyScalar(Math.cos(ang)).addScaledVector(B, Math.sin(ang));
      const o = (i * (radial + 1) + k) * 3;
      pos[o] = p.x + tmp.x * radii[i];
      pos[o + 1] = p.y + tmp.y * radii[i];
      pos[o + 2] = p.z + tmp.z * radii[i];
      nor[o] = tmp.x;
      nor[o + 1] = tmp.y;
      nor[o + 2] = tmp.z;
      const u = (i * (radial + 1) + k) * 2;
      uv[u] = i / (n - 1);
      uv[u + 1] = k / radial;
    }
  }
  for (let i = 0; i < n - 1; i++) {
    for (let k = 0; k < radial; k++) {
      const a = i * (radial + 1) + k;
      const b = a + radial + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

/**
 * Sweep a flattened ellipse along a path (used for the eye muscles).
 * widths/thick: per-point half-width and half-thickness. normalFn(p, i) -> "up" vector.
 */
export function ribbon(points, widths, thick, normalFn, radial = 16) {
  const n = points.length;
  const pos = [];
  const nor = [];
  const uv = [];
  const idx = [];
  const T = new THREE.Vector3();
  const N = new THREE.Vector3();
  const B = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const p = points[i];
    const a = points[Math.max(0, i - 1)];
    const b = points[Math.min(n - 1, i + 1)];
    T.subVectors(b, a).normalize();
    N.copy(normalFn(p, i));
    B.crossVectors(T, N).normalize();
    N.crossVectors(B, T).normalize();
    for (let k = 0; k <= radial; k++) {
      const ang = (k / radial) * Math.PI * 2;
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      pos.push(p.x + B.x * c * widths[i] + N.x * s * thick[i], p.y + B.y * c * widths[i] + N.y * s * thick[i], p.z + B.z * c * widths[i] + N.z * s * thick[i]);
      const nn = new THREE.Vector3().addScaledVector(B, c / Math.max(0.01, widths[i])).addScaledVector(N, s / Math.max(0.01, thick[i])).normalize();
      nor.push(nn.x, nn.y, nn.z);
      uv.push(k / radial, i / (n - 1));
    }
  }
  for (let i = 0; i < n - 1; i++) {
    for (let k = 0; k < radial; k++) {
      const a = i * (radial + 1) + k;
      const b2 = a + radial + 1;
      idx.push(a, b2, a + 1, b2, b2 + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

/** Simple polyline resampling to roughly even spacing. */
export function resample(points2d, spacing) {
  const out = [points2d[0]];
  let acc = 0;
  for (let i = 1; i < points2d.length; i++) {
    const d = Math.hypot(points2d[i][0] - points2d[i - 1][0], points2d[i][1] - points2d[i - 1][1]);
    acc += d;
    if (acc >= spacing || i === points2d.length - 1) {
      out.push(points2d[i]);
      acc = 0;
    }
  }
  return out;
}
