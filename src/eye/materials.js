import * as THREE from 'three';
import { DIMS, fundusToLathe } from '../config/anatomy.js';

/**
 * The optic nerve leaves the eye through a hole in the retina, choroid and sclera.
 * Instead of cutting real holes in the round shells we "punch" them in the shader:
 * any pixel within the disc radius (seen from the eye centre) is discarded.
 */
const discCenter = fundusToLathe(DIMS.disc.u, DIMS.disc.v, 1);
const discDir = new THREE.Vector3(...discCenter).normalize();
export const discHoleUniforms = {
  uDiscDir: { value: discDir },
  uDiscCos: { value: Math.cos((DIMS.disc.radius - 0.01) / DIMS.retinaInnerR) },
};

export function addDiscHole(material, maxRadius = 11.3) {
  const prev = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    if (prev) prev(shader, renderer);
    shader.uniforms.uDiscDir = discHoleUniforms.uDiscDir;
    shader.uniforms.uDiscCos = discHoleUniforms.uDiscCos;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLathePos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLathePos = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLathePos;\nuniform vec3 uDiscDir;\nuniform float uDiscCos;')
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
         if (length(vLathePos) < ${maxRadius.toFixed(2)} && dot(normalize(vLathePos), uDiscDir) > uDiscCos) discard;`,
      );
  };
  material.customProgramCacheKey = () => `dischole-${maxRadius}`;
  return material;
}

const fogChunk = /* glsl */ `
#ifdef USE_FOG
  #ifdef FOG_EXP2
    float fogF = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
  #else
    float fogF = smoothstep( fogNear, fogFar, vFogDepth );
  #endif
  gl_FragColor.rgb *= 1.0 - fogF;
#endif
`;

/**
 * Glowing nerve-fibre lines. Each vertex knows:
 *   aDeath – the damage level at which its fibre dies
 *   aAlong – 0 at the ganglion cell, 1 at the optic disc (used for travelling "signal" pulses)
 */
export function makeFibreMaterial(color = '#ffd99a', opacity = 0.42) {
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uDamage: { value: 0 },
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: opacity },
        uHighlight: { value: 0 },
        uPulse: { value: 1 },
      },
    ]),
    vertexShader: /* glsl */ `
      attribute float aDeath;
      attribute float aAlong;
      varying float vDeath;
      varying float vAlong;
      #include <common>
      #include <fog_pars_vertex>
      #include <logdepthbuf_pars_vertex>
      #include <clipping_planes_pars_vertex>
      void main() {
        vDeath = aDeath;
        vAlong = aAlong;
        #include <begin_vertex>
        #include <project_vertex>
        #include <logdepthbuf_vertex>
        #include <clipping_planes_vertex>
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform float uDamage;
      uniform float uTime;
      uniform float uOpacity;
      uniform float uHighlight;
      uniform float uPulse;
      uniform vec3 uColor;
      varying float vDeath;
      varying float vAlong;
      #include <common>
      #include <fog_pars_fragment>
      #include <logdepthbuf_pars_fragment>
      #include <clipping_planes_pars_fragment>
      void main() {
        #include <clipping_planes_fragment>
        #include <logdepthbuf_fragment>
        float life = smoothstep(uDamage, uDamage + 0.03, vDeath);
        if (life <= 0.002) discard;
        float dying = (1.0 - smoothstep(0.0, 0.05, vDeath - uDamage)) * step(0.002, uDamage);
        float pulse = smoothstep(0.86, 1.0, fract(vAlong * 5.0 - uTime * 0.45 + vDeath * 17.0)) * uPulse;
        vec3 col = mix(uColor, vec3(1.0, 0.22, 0.16), dying);
        col = col * (0.5 + 1.6 * pulse) + uHighlight * vec3(0.15, 0.6, 1.0);
        // thousands of fibres converge on the small disc: dim them there so the disc stays visible
        float crowd = 1.0 - 0.92 * smoothstep(0.66, 0.86, vAlong);
        gl_FragColor = vec4(col * uOpacity * life * crowd, 1.0);
        ${fogChunk}
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: true,
    clipping: true,
  });
}

/** Particle material with per-particle colour and size, additive glow. */
export function makeParticleMaterial(sprite, { additive = true, opacity = 1, sizeScale = 1 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uMap: { value: sprite },
        uOpacity: { value: opacity },
        uScale: { value: 400 },
        uSizeScale: { value: sizeScale },
      },
    ]),
    vertexShader: /* glsl */ `
      attribute float aSize;
      attribute vec4 aColor;
      uniform float uScale;
      uniform float uSizeScale;
      varying vec4 vColor;
      #include <common>
      #include <fog_pars_vertex>
      #include <logdepthbuf_pars_vertex>
      #include <clipping_planes_pars_vertex>
      void main() {
        vColor = aColor;
        #include <begin_vertex>
        #include <project_vertex>
        gl_PointSize = aSize * uSizeScale * uScale / max(0.0001, -mvPosition.z);
        gl_PointSize = min(gl_PointSize, 64.0);
        #include <logdepthbuf_vertex>
        #include <clipping_planes_vertex>
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uOpacity;
      varying vec4 vColor;
      #include <common>
      #include <fog_pars_fragment>
      #include <logdepthbuf_pars_fragment>
      #include <clipping_planes_pars_fragment>
      void main() {
        #include <clipping_planes_fragment>
        #include <logdepthbuf_fragment>
        float a = texture2D(uMap, gl_PointCoord).r * vColor.a * uOpacity;
        if (a < 0.003) discard;
        ${additive ? 'gl_FragColor = vec4(vColor.rgb * a, 1.0);' : 'gl_FragColor = vec4(vColor.rgb, a);'}
        ${additive ? fogChunk : '#include <fog_fragment>'}
      }`,
    transparent: true,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    fog: true,
    clipping: true,
  });
}
