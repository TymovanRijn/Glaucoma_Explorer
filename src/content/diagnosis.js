/**
 * HOW GLAUCOMA IS FOUND
 */

export const DIAGNOSIS_INTRO = `
<p>Glaucoma is usually painless and invisible to the person who has it until a lot of nerve has been lost. It is caught by <strong>looking for it</strong> — in a comprehensive eye examination that combines several tests, because no single test is enough:</p>
<ul>
  <li><strong>Pressure</strong> is a risk factor, not a diagnosis (normal-tension glaucoma exists; high pressure doesn't always cause damage).</li>
  <li><strong>Structure</strong> — the optic disc and nerve fibre layer — shows damage, often before vision is affected.</li>
  <li><strong>Function</strong> — the visual field — shows what the damage costs the patient.</li>
  <li><strong>The angle</strong> decides which kind of glaucoma it is and therefore how to treat it.</li>
</ul>
<p>Finally, glaucoma is confirmed and monitored by <strong>change over time</strong>: repeated scans and fields show whether the nerve is stable or getting worse.</p>`;

export const TESTS = {
  tonometry: {
    name: 'Tonometry',
    sub: 'Measuring eye pressure',
    icon: 'gauge',
    what: `<p>Tonometry estimates eye pressure by measuring how much force it takes to flatten or indent the cornea.</p>
      <ul><li><strong>Goldmann applanation</strong> (the reference standard): after numbing drops and a yellow dye, a small prism gently flattens a 3.06&nbsp;mm circle of the cornea at the slit lamp.</li>
      <li><strong>Non-contact ("air puff")</strong>: a puff of air flattens the cornea; quick, good for screening.</li>
      <li><strong>Rebound tonometry</strong>: a tiny, light probe bounces off the cornea — no numbing needed, great for children and even home monitoring.</li></ul>`,
    shows: `<p>A number in mmHg. The statistical normal range is about <strong>10–21&nbsp;mmHg</strong>. Pressure varies through the day (often highest early in the morning or at night), so a single reading can miss peaks.</p>`,
    limits: `<p>Readings depend on corneal thickness and stiffness. And most importantly: <strong>a normal pressure does not rule out glaucoma</strong>, and a high pressure does not prove it. Pressure screening alone misses many cases.</p>`,
    think: 'If a test misses everyone with normal-tension glaucoma, can it be the only screening test? What else would you add?',
  },
  pachymetry: {
    name: 'Pachymetry',
    sub: 'Measuring corneal thickness',
    icon: 'ruler',
    what: `<p>An ultrasound probe or an optical scanner measures the thickness of the cornea, painlessly, in seconds.</p>`,
    shows: `<p>Average central corneal thickness is around <strong>540–550&nbsp;µm</strong>. A thin cornea makes pressure readings come out too low and is itself a risk factor for glaucoma; a thick cornea makes readings too high.</p>`,
    limits: `<p>There is no perfect correction formula — doctors use thickness to interpret the pressure, not to "fix" the number exactly.</p>`,
    think: 'Two people both measure 19 mmHg. One has a thin cornea, one a thick cornea. Who is more worrying, and why?',
  },
  ophthalmoscopy: {
    name: 'Optic disc examination',
    sub: 'Looking at the nerve head',
    icon: 'eye',
    what: `<p>With a bright light and a lens (at the slit lamp, with an ophthalmoscope, or in a fundus photograph), the doctor looks through the pupil at the optic disc — often after dilating drops.</p>`,
    shows: `<p>Signs of glaucoma: a large or <strong>vertically elongated cup</strong>, a thin or notched <strong>neuroretinal rim</strong> (breaking the ISNT pattern), a difference between the two eyes, small <strong>disc haemorrhages</strong>, vessels bending sharply over the rim, visible lamina pores, and atrophy around the disc. Photographs allow comparison over the years.</p>`,
    limits: `<p>Disc size varies a lot between people, and judging cups is subjective — experts often disagree. That is why imaging and fields are added.</p>`,
    think: 'A large cup can be normal in a large disc. What would convince you that a cup is actually glaucomatous?',
  },
  oct: {
    name: 'OCT scan',
    sub: 'Optical coherence tomography',
    icon: 'layers',
    what: `<p>OCT is like an ultrasound scan, but with near-infrared light. In a few seconds and without touching the eye, it makes cross-section images of the retina with a resolution of a few micrometres.</p>`,
    shows: `<p>It measures the <strong>retinal nerve fibre layer</strong> around the optic disc (shown as a "TSNIT" curve: Temporal–Superior–Nasal–Inferior–Temporal), the <strong>ganglion cell layer</strong> in the macula, and the shape of the optic disc rim — and compares each with healthy people of the same age, coloured green, yellow or red. Repeated scans detect thinning over time.</p>`,
    limits: `<p>"Red" does not always mean disease (for example in very short-sighted eyes), and in advanced glaucoma the layer stops getting thinner because supporting tissue remains (a "floor effect"), so visual fields become more useful.</p>`,
    think: 'OCT can show nerve fibre loss before any vision is lost. Why might that be so valuable for a disease whose damage is permanent?',
  },
  perimetry: {
    name: 'Visual field test',
    sub: 'Perimetry',
    icon: 'target',
    what: `<p>You look at a central target inside a bowl and press a button whenever you notice a faint flash of light somewhere in your side vision. Each eye is tested separately; the machine varies brightness to find your threshold at dozens of points.</p>`,
    shows: `<p>A map of sensitivity. Typical glaucoma patterns are an <strong>arcuate</strong> (arch-shaped) defect, a <strong>nasal step</strong> (a defect with a sharp horizontal edge on the nose side) and <strong>paracentral</strong> spots, progressing to tunnel vision. Summary numbers include the mean deviation (MD) and the visual field index (VFI).</p>`,
    limits: `<p>It is subjective, has a learning effect, and results vary from test to test — so several tests are needed to confirm a defect or a change. A large share of ganglion cells can be lost before standard fields show a defect.</p>`,
    think: 'Why is the defect pattern arch-shaped and why does it stop sharply at the horizontal line? (Hint: look at how the nerve fibres run in the 3D retina.)',
  },
  gonioscopy: {
    name: 'Gonioscopy',
    sub: 'Inspecting the drainage angle',
    icon: 'mirror',
    what: `<p>The drainage angle is hidden by total internal reflection in the cornea. A small contact lens with mirrors, placed on the numbed eye, lets the doctor look into the angle at the slit lamp. Pressing gently shows whether a closed angle can still be opened.</p>`,
    shows: `<p>Whether the angle is <strong>open or closed</strong> and which structures are visible: from the iris root, the ciliary body band, the scleral spur, the pigmented trabecular meshwork to Schwalbe's line. It also reveals adhesions, heavy pigment, exfoliation material, new vessels or an injury.</p>`,
    limits: `<p>It takes skill. Anterior-segment OCT is a non-contact alternative that images the angle in cross-section, but it doesn't show colour details like pigment or vessels.</p>`,
    think: 'Why does it matter so much to know whether the angle is open or closed before choosing a treatment?',
  },
};

export const RISK_FACTORS = [
  { id: 'age', label: 'Aged 60 or over', detail: 'Risk rises steeply with age.' },
  { id: 'family', label: 'A parent, brother or sister with glaucoma', detail: 'Glaucoma runs in families — close relatives have a several-fold higher risk.' },
  { id: 'ancestry', label: 'African, Afro-Caribbean, Hispanic/Latino or East Asian ancestry', detail: 'Open-angle glaucoma is more common and earlier in people of African ancestry; angle closure in East Asian ancestry.' },
  { id: 'pressure', label: 'Told you have high eye pressure', detail: 'The strongest modifiable risk factor.' },
  { id: 'myopia', label: 'Strongly short-sighted (or very far-sighted)', detail: 'Myopia raises open-angle risk; far-sightedness raises angle-closure risk.' },
  { id: 'steroids', label: 'Long-term steroid use (drops, inhalers, tablets, creams)', detail: 'Steroids can raise eye pressure in susceptible people.' },
  { id: 'diabetes', label: 'Diabetes or high/low blood pressure', detail: 'Associated with glaucoma risk and with neovascular glaucoma.' },
  { id: 'injury', label: 'A past serious eye injury', detail: 'Can damage the drain, sometimes years later.' },
];

export const SCREENING = `
<p>Because glaucoma is silent, <strong>regular comprehensive eye examinations</strong> are the way it is caught early. A comprehensive exam looks at the optic nerve — not just your glasses prescription. Many eye-care organisations advise a baseline exam around age 40 and more frequent checks with age or if you have risk factors; your eye-care professional will advise what is right for you.</p>
<p>If glaucoma runs in your family, tell your relatives — they may benefit from earlier checks.</p>`;
