/**
 * Camera viewpoints in world coordinates (mm).
 * World axes: +z = front of the eye (cornea), +x = towards the nose, +y = up.
 * cut: open the eye with a cross-section; cutOffset: where the cut sits (0 = through the centre).
 */
const DISC = [2.956, 0.148, -9.99];
const FOVEA = [-1.496, -0.299, -10.307];
const toward = (p, f) => p.map((v) => v * f);

export const VIEWS = {
  overview: { pos: [-33, 12, 23], target: [0, 0, 1], cut: true, cutOffset: 2 },
  front: { pos: [0, 1.5, 40], target: [0, 0, 6], cut: false },
  outside: { pos: [-30, 13, 26], target: [0, 0, 0], cut: false },
  section: { pos: [-30, 2, 4], target: [0, 0, 2], cut: true, cutOffset: 0 },

  cornea: { pos: [-15, 5, 25], target: [0, 0.5, 11], cut: false },
  sclera: { pos: [-25, 15, 12], target: [0, 0, 0], cut: false },
  conjunctiva: { pos: [-13, 9, 21], target: [-3, 3, 9], cut: false },
  'episcleral-veins': { pos: [-8.5, 9, 15.5], target: [-3.6, 4.6, 9.6], cut: false },
  iris: { pos: [-4.5, 3, 21], target: [0, 0, 9], cut: false },
  pupil: { pos: [0, 0.6, 19], target: [0, 0, 9], cut: false },
  lens: { pos: [-12.5, 3, 12], target: [0, 0, 7], cut: true, cutOffset: 0 },
  zonules: { pos: [-4.2, 4.6, 5.6], target: [0, 4.9, 7.4], cut: true, cutOffset: 0 },
  'ciliary-body': { pos: [-7, 7, 4.5], target: [0, 6.2, 7.2], cut: true, cutOffset: 0 },
  'ciliary-processes': { pos: [0.6, -0.8, -1.5], target: [0, 0, 7.5], cut: false },
  'trabecular-meshwork': { pos: [-3.1, 6.0, 9.7], target: [0, 5.45, 9.25], cut: true, cutOffset: 0 },
  'schlemms-canal': { pos: [-2.6, 6.2, 10.1], target: [0, 5.75, 9.5], cut: true, cutOffset: 0 },
  'scleral-spur': { pos: [-2.8, 6.1, 9.4], target: [0, 5.9, 9.0], cut: true, cutOffset: 0 },
  'drainage-angle': { pos: [-5.2, 6.4, 9.6], target: [0, 5.3, 9.0], cut: true, cutOffset: 0 },
  'anterior-chamber': { pos: [-9.5, 1.5, 12.5], target: [0, 0, 10], cut: true, cutOffset: 0 },
  'posterior-chamber': { pos: [-4.5, 5.9, 7.2], target: [0, 4.6, 8.1], cut: true, cutOffset: 0 },
  'aqueous-humor': { pos: [-9.5, 3.5, 11], target: [0, 2.5, 9.3], cut: true, cutOffset: 0 },
  'uveoscleral-pathway': { pos: [-7.5, 8, 6.5], target: [0, 6.5, 7.6], cut: true, cutOffset: 0 },
  vitreous: { pos: [0.5, 0.8, 3], target: [0, 0, -8], cut: false },
  'hyaloid-canal': { pos: [-10, 3.5, -0.5], target: [1, 0, -2], cut: true, cutOffset: 2 },
  retina: { pos: [-2, 2.5, -1.5], target: [0.5, 0, -10], cut: false },
  macula: { pos: toward(FOVEA, 0.66), target: FOVEA, cut: false },
  rnfl: { pos: [0.7, 1.6, -6.2], target: [2.2, 0.1, -9.9], cut: false },
  'ganglion-cells': { pos: [0.7, 1.6, -6.2], target: [2.2, 0.1, -9.9], cut: false },
  'ora-serrata': { pos: [0, -1, -1.5], target: [0, 9.6, 4.3], cut: false },
  'optic-disc': { pos: toward(DISC, 0.76), target: DISC, cut: false },
  'optic-cup': { pos: toward(DISC, 0.86), target: DISC, cut: false },
  'lamina-cribrosa': { pos: toward(DISC, 0.9), target: toward(DISC, 1.05), cut: false },
  'retinal-vessels': { pos: [1.3, 1.7, -6.3], target: [1.6, 1.1, -10], cut: false },
  choroid: { pos: [-14, -3, -7], target: [0, -2.5, -5.5], cut: true, cutOffset: 2 },
  'optic-nerve': { pos: [15, 9, -27], target: [4.5, 0, -16], cut: false },
  'extraocular-muscles': { pos: [-31, 19, 2], target: [0, 0, -5], cut: false, muscles: true },
};

export function getView(id) {
  return VIEWS[id] || null;
}
