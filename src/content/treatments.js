/**
 * TREATMENTS — ids match sim/PressureModel.js TREATMENTS.
 * `term` tells which part of the Goldmann equation the treatment changes.
 */

export const TREATMENT_INTRO = `
<p>All proven glaucoma treatments work by <strong>lowering eye pressure</strong> — even in normal-tension glaucoma. Doctors set a personal <em>target pressure</em> low enough to stop or slow further damage. Treatment cannot bring back lost vision, which is why early detection matters so much.</p>
<p>Every treatment changes one part of the pressure equation: <strong>IOP = (F − U) / C + EVP</strong>. Turn down production (F), open the back door (U), open the main drain (C), lower the venous pressure (EVP) — or build a new drain altogether.</p>`;

export const TREATMENT_INFO = {
  prostaglandin: {
    name: 'Prostaglandin analogue drops',
    kind: 'Eye drop',
    examples: 'latanoprost, travoprost, bimatoprost, tafluprost',
    term: 'U ↑ opens the back door',
    how: 'Remodels the tissue between the ciliary muscle fibres so more fluid escapes through the uveoscleral route. Usually the first choice: one drop at night, often lowering pressure by about 25–30%.',
    side: 'Red eyes, longer and darker eyelashes, permanent darkening of a light iris, darker eyelid skin, and loss of fat around the eye with long-term use.',
  },
  betablocker: {
    name: 'Beta-blocker drops',
    kind: 'Eye drop',
    examples: 'timolol',
    term: 'F ↓ turns down the tap',
    how: 'Reduces fluid production by the ciliary body.',
    side: 'Can be absorbed into the body: may slow the heart and worsen asthma or COPD — doctors check before prescribing.',
  },
  cai: {
    name: 'Carbonic anhydrase inhibitor',
    kind: 'Eye drop / tablet',
    examples: 'dorzolamide, brinzolamide (drops); acetazolamide (tablets)',
    term: 'F ↓ turns down the tap',
    how: 'Blocks carbonic anhydrase, an enzyme the ciliary processes need to secrete fluid.',
    side: 'Drops may sting or leave a bitter taste; tablets can cause tingling, tiredness and kidney stones.',
  },
  alpha: {
    name: 'Alpha-agonist drops',
    kind: 'Eye drop',
    examples: 'brimonidine',
    term: 'F ↓ and U ↑',
    how: 'Reduces fluid production and slightly increases uveoscleral outflow.',
    side: 'Allergic red, itchy eyes; tiredness and dry mouth. Not used in young children.',
  },
  rock: {
    name: 'Rho-kinase inhibitor drops',
    kind: 'Eye drop',
    examples: 'netarsudil (ripasudil in some countries)',
    term: 'C ↑ and EVP ↓',
    how: 'Relaxes the cells of the trabecular meshwork so the main drain flows more easily, and lowers episcleral venous pressure.',
    side: 'Red eyes, small bleeds on the white of the eye, and harmless deposits on the cornea.',
  },
  pilocarpine: {
    name: 'Pilocarpine',
    kind: 'Eye drop',
    examples: 'pilocarpine',
    term: 'C ↑ pulls the drain open',
    how: 'Contracts the ciliary muscle, which pulls on the scleral spur and opens the meshwork; it also shrinks the pupil, pulling the iris away from the angle (useful in angle closure).',
    side: 'Brow ache, dim and blurry vision (especially at night), short-sightedness; rarely retinal detachment.',
  },
  acetazolamide: {
    name: 'Emergency pressure-lowering medicines',
    kind: 'Tablet / drip',
    examples: 'acetazolamide by mouth or into a vein, sometimes mannitol',
    term: 'F ↓ fast',
    how: 'Rapidly reduces fluid production (and mannitol draws water out of the eye) to bring a dangerously high pressure down while definitive treatment is arranged.',
    side: 'Tingling, frequent urination, tiredness; mannitol is used with care in heart or kidney disease.',
  },
  slt: {
    name: 'Selective laser trabeculoplasty (SLT)',
    kind: 'Laser',
    examples: 'SLT',
    term: 'C ↑ rejuvenates the drain',
    how: 'Very short, low-energy laser pulses aimed at the meshwork trigger a biological clean-up that improves outflow — typically lowering pressure by 20–30%. In a large trial, SLT used as the first treatment controlled pressure as well as drops, and many patients needed no drops for years. The effect can wear off, and it can be repeated.',
    side: 'Brief irritation and occasionally a temporary pressure rise.',
  },
  iridotomy: {
    name: 'Laser peripheral iridotomy',
    kind: 'Laser',
    examples: 'YAG laser iridotomy',
    term: 'reopens the angle',
    how: 'Makes a tiny hole near the edge of the iris. Fluid trapped behind the iris flows through it, the iris flattens back, and the drainage angle reopens. The standard treatment for angle closure — usually in both eyes.',
    side: 'Brief pressure spike, inflammation; occasionally glare or a line of light if the hole is not covered by the eyelid.',
  },
  cyclo: {
    name: 'Cyclophotocoagulation',
    kind: 'Laser',
    examples: 'transscleral or micropulse laser',
    term: 'F ↓ reduces the factory',
    how: 'Laser energy treats part of the ciliary body so it produces less fluid. Often used when other treatments are not possible or have failed.',
    side: 'Inflammation, pain; sometimes the pressure drops too much.',
  },
  migs: {
    name: 'Minimally invasive glaucoma surgery (MIGS)',
    kind: 'Surgery',
    examples: 'trabecular micro-bypass stents (e.g. iStent, Hydrus), goniotomy',
    term: 'C ↑ bypasses the meshwork',
    how: 'Tiny devices (some smaller than a grain of rice) or small incisions create a direct path from the front of the eye into Schlemm’s canal. Often done together with cataract surgery; safer but with a more modest pressure reduction than traditional surgery.',
    side: 'Generally low risk: small bleeds, stent malposition.',
  },
  trabeculectomy: {
    name: 'Trabeculectomy',
    kind: 'Surgery',
    examples: 'trabeculectomy with mitomycin C',
    term: 'a new drain',
    how: 'The surgeon creates a small, protected trapdoor in the sclera so fluid can escape into a blister (a "bleb") under the conjunctiva, where it is absorbed. A medicine (mitomycin C) is used to stop scarring. Can achieve low pressures.',
    side: 'Infection of the bleb, too low pressure, cataract, need for close follow-up.',
  },
  tube: {
    name: 'Glaucoma drainage device (tube shunt)',
    kind: 'Surgery',
    examples: 'Ahmed, Baerveldt, Paul implants',
    term: 'a new drain',
    how: 'A thin silicone tube carries fluid from inside the eye to a plate stitched to the sclera under the conjunctiva, far back on the eye. Used for complex cases such as neovascular or uveitic glaucoma or after a failed trabeculectomy.',
    side: 'Double vision, tube exposure, corneal problems, too low or too high pressure.',
  },
  lensExtraction: {
    name: 'Lens (cataract) surgery',
    kind: 'Surgery',
    examples: 'phacoemulsification with lens implant',
    term: 'deepens the front of the eye',
    how: 'Replacing the thick natural lens with a thin artificial lens creates more space at the front of the eye, opening a crowded drainage angle. Effective for many people with angle closure.',
    side: 'The usual risks of cataract surgery (rare infection, retinal detachment, swelling).',
  },
  antivegf: {
    name: 'Anti-VEGF injection + retinal laser',
    kind: 'Injection',
    examples: 'bevacizumab, ranibizumab, aflibercept; panretinal photocoagulation',
    term: 'treats the cause',
    how: 'Blocks the VEGF growth signal so abnormal vessels on the iris and angle regress within days. Laser to the oxygen-starved retina (panretinal photocoagulation) reduces the signal long-term.',
    side: 'Injection risks are small (rare infection); repeated injections may be needed.',
  },
  antiinflammatory: {
    name: 'Anti-inflammatory treatment',
    kind: 'Drops / medicine',
    examples: 'steroid drops (carefully monitored), immunosuppressive medicines',
    term: 'treats the cause',
    how: 'Calms the inflammation that clogs and inflames the drain.',
    side: 'Steroids themselves can raise pressure in some people — a balancing act.',
  },
  steroidStop: {
    name: 'Stop or switch the steroid',
    kind: 'Change of medicine',
    examples: 'with the prescribing doctor — never stop steroids abruptly on your own',
    term: 'treats the cause',
    how: 'In most people the meshwork recovers within weeks to months after the steroid is stopped or replaced, and the pressure returns to normal.',
    side: 'The original condition may flare; some steroids must be tapered slowly.',
  },
  goniotomy: {
    name: 'Goniotomy / trabeculotomy',
    kind: 'Surgery (children)',
    examples: 'goniotomy, 360° trabeculotomy',
    term: 'C ↑ opens the malformed drain',
    how: 'The surgeon opens the abnormal tissue covering the drain (from inside the eye or through Schlemm’s canal) so fluid can reach the outflow channels. The main treatment for congenital glaucoma.',
    side: 'Bleeding in the eye; sometimes repeat surgery is needed.',
  },
};

export const DROP_TIPS = `
<ul>
  <li>Wash your hands, tilt your head back and pull down the lower lid to form a pocket.</li>
  <li>One drop is enough — the eye can only hold a fraction of a drop.</li>
  <li>Close your eye and press gently on the inner corner for 1–2 minutes: this keeps the drop in the eye and reduces absorption into the body.</li>
  <li>Wait about 5 minutes between different drops.</li>
  <li>Use them every day, even when your eyes feel fine — glaucoma has no symptoms to remind you.</li>
</ul>`;

export const FUTURE = `
<ul>
  <li><strong>Sustained-release implants</strong> that slowly release medicine inside the eye for months, so patients don't need daily drops.</li>
  <li><strong>Neuroprotection</strong>: treatments that make ganglion cells more resilient — for example, high-dose nicotinamide (vitamin B3) is being tested in clinical trials.</li>
  <li><strong>Regeneration</strong>: gene therapies and stem cells aiming to regrow optic nerve fibres (still in the laboratory and early research).</li>
  <li><strong>AI screening</strong> of fundus photographs and OCT scans to catch glaucoma earlier in more people.</li>
  <li><strong>Home tonometry</strong> to track pressure across the day and night.</li>
</ul>`;
