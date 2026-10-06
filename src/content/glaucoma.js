/**
 * TYPES OF GLAUCOMA
 * Each simulated scenario (ids match sim/PressureModel.js) plus other forms for the library.
 */

export const GLAUCOMA_INTRO = `
<p><strong>Glaucoma</strong> is not one disease but a family of eye diseases that share one outcome: progressive damage to the <strong>optic nerve</strong>, with a characteristic loss of the nerve's fibres, cupping of the optic disc and a matching loss of visual field.</p>
<p>The single most important modifiable risk factor is <strong>eye pressure</strong> (intraocular pressure, IOP), but glaucoma can occur at normal pressure and high pressure does not always cause it. Lost vision cannot be restored — but with early detection and treatment, most people keep useful sight for life.</p>
<p>Glaucoma is the leading cause of irreversible blindness worldwide, affecting roughly <strong>3–4% of people aged 40–80</strong> — tens of millions of people, with numbers rising as populations age. Because it is painless and starts at the edges of vision, a large share of people who have it don't know.</p>`;

export const TYPES = {
  healthy: {
    name: 'Healthy eye',
    kind: 'Baseline',
    short: 'Balanced fluid production and drainage, a pink healthy nerve rim.',
    summary: `<p>Fluid production and drainage are in balance at about <strong>15–16&nbsp;mmHg</strong>. The drainage angle is open, the meshwork filters freely, and the optic disc shows a thick pink rim with a small cup.</p>`,
    watch: 'Watch the droplets flow freely from the ciliary processes, through the pupil, and out through the meshwork into Schlemm’s canal.',
  },

  oht: {
    name: 'Ocular hypertension',
    kind: 'Not glaucoma (yet)',
    short: 'High eye pressure without any nerve damage — a risk factor to watch.',
    summary: `<p>The pressure is above the usual range (typically above 21&nbsp;mmHg), but the optic nerve and visual field are healthy. It is <strong>not glaucoma</strong> — but it is the biggest risk factor for developing it.</p>`,
    mechanism: `<p>The drain is mildly less efficient, so pressure settles higher. This particular nerve tolerates it — at least for now.</p>`,
    who: `<p>Common: several percent of people over 40. Risk of progressing to glaucoma is higher with higher pressure, thinner corneas, older age, larger cups and a family history.</p>`,
    symptoms: `<p>None.</p>`,
    detection: `<p>Pressure measurement (tonometry) with normal optic nerve, OCT and visual fields; corneal thickness helps interpret the reading.</p>`,
    treatment: `<p>Not everyone needs treatment. In a large trial (the Ocular Hypertension Treatment Study), about 1 in 10 untreated people developed glaucoma within 5 years, and pressure-lowering drops roughly halved that risk. Doctors weigh each person's risk; many are simply monitored.</p>`,
    watch: 'Pressure is high but the nerve fibres keep glowing — this nerve copes. Not every high pressure means glaucoma.',
    fact: 'Many people with ocular hypertension never develop glaucoma — and many people with glaucoma never had high pressure.',
  },

  poag: {
    name: 'Primary open-angle glaucoma',
    kind: 'Open-angle',
    short: 'The most common type: the drain slowly clogs while the angle stays open.',
    summary: `<p>The most common form of glaucoma in most of the world. The drainage angle is wide <strong>open</strong>, but the trabecular meshwork slowly becomes less permeable — like a coffee filter clogging. Pressure creeps up over years and slowly damages the optic nerve.</p>`,
    mechanism: `<p>Changes in the meshwork cells and the material around them (especially in the tissue next to Schlemm's canal) raise outflow resistance. With the tap still running, pressure rises. The nerve fibres entering the top and bottom of the optic disc are usually lost first, creating arch-shaped blind areas in the side vision.</p>`,
    who: `<ul><li>Age — risk rises steeply after 60</li><li>Family history — a close relative with glaucoma raises your risk several-fold</li><li>African or Afro-Caribbean ancestry — more common, earlier and often more severe; also higher in people of Hispanic/Latino heritage</li><li>High eye pressure, thin corneas, short-sightedness (myopia), diabetes</li></ul>`,
    symptoms: `<p><strong>None for years.</strong> No pain, no redness, and central vision stays sharp. Side vision is lost so gradually — and filled in by the brain — that most people notice only when damage is advanced. This is why it is called the <em>silent thief of sight</em>.</p>`,
    detection: `<p>Regular comprehensive eye exams: pressure measurement, examination of the optic disc, OCT scans of the nerve fibre layer and visual-field tests, with gonioscopy to confirm the angle is open.</p>`,
    treatment: `<p>Lower the pressure to a personal "target": eye drops (prostaglandin analogues are usually first), laser trabeculoplasty (SLT — sometimes as a first treatment), or surgery: micro-stents (MIGS), trabeculectomy or tube shunts. In a landmark trial, every 1&nbsp;mmHg of pressure lowering reduced the risk of progression by roughly 10%.</p>`,
    watch: 'Press play. The meshwork darkens and droplets queue up turning amber, pressure climbs, and years later the nerve fibres above and below the disc start to die. Then try starting treatment early versus late.',
    fact: 'People with advanced open-angle glaucoma can often still read the smallest line on an eye chart.',
  },

  ntg: {
    name: 'Normal-tension glaucoma',
    kind: 'Open-angle',
    short: 'Glaucoma damage even though the eye pressure is in the normal range.',
    summary: `<p>The optic nerve is damaged in a typical glaucoma pattern, but the pressure has never been measured above the normal range. The nerve is simply more vulnerable than average.</p>`,
    mechanism: `<p>Not fully understood. Likely contributors: poor blood flow to the optic nerve (low blood pressure, especially at night; blood-vessel spasm, as in migraine or cold hands), a weaker lamina cribrosa, and possibly low cerebrospinal fluid pressure behind the eye. Pressure still matters: lowering it further slows damage.</p>`,
    who: `<p>More common in women, people of East Asian (especially Japanese) ancestry, and people with migraine, low blood pressure or sleep apnoea. In some populations most open-angle glaucoma occurs at normal pressure.</p>`,
    symptoms: `<p>None until late — just like other open-angle glaucoma. Defects are often closer to the centre of vision.</p>`,
    detection: `<p>This is why <strong>pressure alone is not a screening test</strong>: normal-tension glaucoma is found by looking at the optic disc (often with small <em>disc haemorrhages</em>), OCT and visual fields. Doctors may also check blood pressure and exclude other causes (sometimes with a brain scan).</p>`,
    treatment: `<p>Lowering pressure by about 30% from its starting point significantly slowed progression in a major trial. Doctors also look at night-time low blood pressure.</p>`,
    watch: 'The pressure gauge stays green — yet the nerve fibres still die. Then lower the pressure further and watch the damage slow.',
    fact: 'In a large Japanese population study, the large majority of people with open-angle glaucoma had normal pressure.',
  },

  acute: {
    name: 'Acute angle-closure crisis',
    kind: 'Angle-closure',
    emergency: true,
    short: 'The iris suddenly blocks the drain — an eye emergency.',
    summary: `<p>An <strong>emergency</strong>. In an eye with a crowded front part, the pupil widens (for example in a dark room), fluid gets trapped behind the iris, the iris bulges forward and suddenly <strong>seals the drainage angle</strong>. Pressure can shoot from 15 to 50–70&nbsp;mmHg within hours.</p>`,
    mechanism: `<p><em>Pupillary block:</em> the iris presses against the lens, so fluid cannot pass through the pupil. It accumulates in the posterior chamber, pushing the iris forward like a sail (<em>iris bombé</em>) until it touches the trabecular meshwork. With the drain sealed and the tap still running, pressure skyrockets.</p>`,
    who: `<p>People with small, far-sighted eyes; older age (the lens thickens); women; East Asian and Inuit ancestry; a family history of angle closure. Triggers include dim light, stress, and medicines that widen the pupil (some decongestants, antihistamines, anti-nausea drugs, antidepressants, and dilating eye drops).</p>`,
    symptoms: `<ul><li>Sudden severe eye pain and headache</li><li>Red eye</li><li>Blurred vision with <strong>rainbow halos</strong> around lights</li><li>Nausea and vomiting (it is sometimes mistaken for a stomach bug or migraine)</li><li>A hazy cornea and a fixed, mid-dilated pupil</li></ul>`,
    detection: `<p>Very high pressure, a closed angle on gonioscopy, a shallow anterior chamber, and a swollen cornea.</p>`,
    treatment: `<p>Urgent pressure-lowering medicines (drops, tablets or a drip, such as acetazolamide), then <strong>laser peripheral iridotomy</strong> — a tiny hole in the iris that lets fluid bypass the blocked pupil. The other eye is usually treated too, as it is at high risk. Lens (cataract) surgery is another definitive option.</p>
      <p><strong>If you ever have sudden eye pain with redness, blurred vision or halos, seek emergency care immediately.</strong></p>`,
    watch: 'Press play: after 2 hours the pupil widens, the iris bulges forward and seals the drain — droplets pile up behind the iris and the pressure explodes. Try the emergency treatments in order.',
    fact: 'Damage can occur within hours, so this is one of the true emergencies in ophthalmology.',
  },

  chronicClosure: {
    name: 'Chronic angle-closure glaucoma',
    kind: 'Angle-closure',
    short: 'The angle closes slowly, scar by scar — usually without symptoms.',
    summary: `<p>The angle narrows and closes <strong>gradually</strong>. Areas where the iris touches the meshwork scar together (<em>peripheral anterior synechiae</em>), zipping the drain shut over months or years.</p>`,
    mechanism: `<p>Repeated or constant contact between the peripheral iris and the meshwork — from pupillary block, a thick lens, or an unusual iris shape (plateau iris) — causes adhesions that permanently block drainage.</p>`,
    who: `<p>Especially common in East Asia — angle closure is a major cause of glaucoma blindness worldwide. Risk factors are the same as for acute angle closure.</p>`,
    symptoms: `<p>Usually none; some people have occasional mild headaches or halos.</p>`,
    detection: `<p><strong>Gonioscopy</strong> (seeing the closed areas and adhesions) or anterior-segment OCT, plus the usual nerve and field tests.</p>`,
    treatment: `<p>Laser iridotomy to stop further closure, lens extraction (which deepens the front of the eye — often very effective), pressure-lowering drops, and drainage surgery if needed.</p>`,
    watch: 'Over years the iris creeps against the drain and the opening shrinks. A laser iridotomy freezes the process — but cannot undo scars that already formed.',
    fact: 'Removing a clear lens was shown in a large trial to be more effective than laser for some people with angle closure.',
  },

  pigmentary: {
    name: 'Pigmentary glaucoma',
    kind: 'Secondary open-angle',
    short: 'Pigment rubbed off the iris clogs the drain — often in young adults.',
    summary: `<p>Pigment granules rubbed off the back of the iris float to the meshwork and clog it. The earlier stage, before nerve damage, is called <em>pigment dispersion syndrome</em>.</p>`,
    mechanism: `<p>The iris bows <strong>backwards</strong> and rubs against the zonule fibres of the lens, like a bow on violin strings, releasing pigment with every movement. Convection currents also lay pigment in a vertical spindle on the back of the cornea (<em>Krukenberg spindle</em>). Exercise can shake loose "pigment storms" with pressure spikes.</p>`,
    who: `<p>Typically young (20s–40s), short-sighted adults, more often men. Only a minority of people with pigment dispersion go on to develop glaucoma.</p>`,
    symptoms: `<p>Usually none; sometimes blurred vision or halos after intense exercise.</p>`,
    detection: `<p>A slit-lamp exam shows the Krukenberg spindle and spoke-like gaps in the iris pigment when light shines through it; gonioscopy shows a densely pigmented meshwork.</p>`,
    treatment: `<p>Drops, laser trabeculoplasty (which works well on pigmented meshwork, at lower energy), and surgery if needed. A laser iridotomy is sometimes used to flatten the iris.</p>`,
    watch: 'Look for the dark pigment granules drifting from behind the iris to the drain, the darkening meshwork, and the brown spindle on the back of the cornea.',
    fact: 'Pigment dispersion often becomes less active with age, as the lens thickens and the iris no longer rubs as much.',
  },

  pxf: {
    name: 'Pseudoexfoliation glaucoma',
    kind: 'Secondary open-angle',
    short: 'Dandruff-like flakes from an ageing-related disorder clog the drain.',
    summary: `<p>A white, flaky protein material builds up on the lens, the pupil edge and the meshwork. It is the most common identifiable cause of open-angle glaucoma worldwide.</p>`,
    mechanism: `<p>Pseudoexfoliation syndrome is an age-related disorder of connective tissue (strongly linked to variants in the <em>LOXL1</em> gene). The material rubs off the lens as the pupil moves, clogs the meshwork, and weakens the zonules. Pressure tends to be higher and to swing more than in ordinary open-angle glaucoma.</p>`,
    who: `<p>Older adults (usually over 60–70); especially common in some populations such as people from Scandinavia and other parts of northern Europe, but it occurs worldwide.</p>`,
    symptoms: `<p>None until late.</p>`,
    detection: `<p>The characteristic target-like pattern of flakes on the lens is seen at the slit lamp, often only after the pupil is dilated.</p>`,
    treatment: `<p>Drops, SLT laser and surgery. It tends to progress faster, so closer follow-up is needed. Cataract surgery requires extra care because of weak zonules.</p>`,
    watch: 'Notice the white target pattern on the lens behind the pupil and white flakes drifting to the drain. The pressure swings up and down.',
    fact: 'The material is not limited to the eye — it has been found in the skin, heart, lungs and other organs.',
  },

  neovascular: {
    name: 'Neovascular glaucoma',
    kind: 'Secondary (open → closed)',
    short: 'Abnormal new vessels grow over the drain after the retina is starved of oxygen.',
    summary: `<p>A severe secondary glaucoma. When the retina lacks oxygen, it releases growth signals that make fragile new blood vessels grow on the iris (<em>rubeosis</em>) and across the drainage angle, first blocking and then zipping it shut.</p>`,
    mechanism: `<p>Retinal ischaemia — from proliferative diabetic retinopathy, a central retinal vein occlusion or poor blood supply to the eye — releases <strong>VEGF</strong> (vascular endothelial growth factor). A fibrovascular membrane grows over the meshwork and contracts, pulling the angle closed.</p>`,
    who: `<p>People with diabetes, retinal vein occlusions or carotid artery disease.</p>`,
    symptoms: `<p>Often painful, with a red eye, high pressure and reduced vision.</p>`,
    detection: `<p>New vessels on the iris and angle seen at the slit lamp and with gonioscopy; retinal imaging shows the underlying disease.</p>`,
    treatment: `<p>Treat the cause: <strong>anti-VEGF injections</strong> make the vessels regress quickly, and laser to the retina (panretinal photocoagulation) reduces the oxygen demand long-term. Pressure is lowered with medicines, and often a tube shunt or laser to the ciliary body is needed.</p>`,
    watch: 'Red vessels spread over the iris and the meshwork turns into a red membrane; the angle zips shut. Anti-VEGF makes the vessels regress — but scarring that has already closed the angle stays.',
    fact: 'It was once called "100-day glaucoma" because it often appeared about three months after a central retinal vein occlusion.',
  },

  uveitic: {
    name: 'Uveitic (inflammatory) glaucoma',
    kind: 'Secondary',
    short: 'Inflammation inside the eye clogs and scars the drain.',
    summary: `<p>Inflammation inside the eye (<em>uveitis</em>) can raise pressure: inflammatory cells and proteins clog the meshwork, the meshwork itself becomes inflamed, and adhesions can block the pupil or the angle.</p>`,
    mechanism: `<p>White blood cells and protein debris obstruct outflow; inflammation of the meshwork (trabeculitis) and scarring add to it. The steroid drops used to treat uveitis can also raise pressure, which makes management delicate.</p>`,
    who: `<p>People with uveitis — linked to autoimmune diseases (such as ankylosing spondylitis, sarcoidosis, juvenile idiopathic arthritis), infections (such as herpes) or unknown causes.</p>`,
    symptoms: `<p>Red, painful, light-sensitive eye with blurred vision during flares — although some types are quiet.</p>`,
    detection: `<p>Cells and "flare" floating in the anterior chamber at the slit lamp, high pressure, gonioscopy to look for adhesions.</p>`,
    treatment: `<p>Control the inflammation, lower the pressure with drops (some, like pilocarpine, are avoided), and surgery when needed.</p>`,
    watch: 'White inflammatory cells drift through the anterior chamber and get trapped in the meshwork. Calm the inflammation and watch the pressure fall.',
    fact: 'A herpes virus infection can cause bouts of inflammation with very high pressure in one eye.',
  },

  steroid: {
    name: 'Steroid-induced glaucoma',
    kind: 'Secondary open-angle',
    short: 'Corticosteroid medicines make the drain less permeable in "steroid responders".',
    summary: `<p>Corticosteroids — eye drops especially, but also injections, inhalers, tablets and skin creams near the eyes — can raise eye pressure in susceptible people.</p>`,
    mechanism: `<p>Steroids change the meshwork cells so that extracellular material builds up and outflow resistance rises. Usually the pressure returns to normal within weeks to months after stopping — but undetected, it can cause permanent damage.</p>`,
    who: `<p>A sizeable minority of people show some pressure rise with steroid eye drops, and a smaller group a large rise. Risk is higher in people with glaucoma or a family history, children, and people with high myopia.</p>`,
    symptoms: `<p>None.</p>`,
    detection: `<p>Pressure checks during steroid treatment — especially with long-term eye drops or injections.</p>`,
    treatment: `<p>Stop or switch the steroid when possible (never stop on your own — some steroids must be tapered), use pressure-lowering drops, laser or surgery if needed.</p>`,
    watch: 'The meshwork fills with pale material and pressure rises. Stop the steroid and watch the drain slowly recover — but any nerve damage already done stays.',
    fact: 'Steroid creams used around the eyelids can be enough to raise eye pressure in susceptible people.',
  },

  congenital: {
    name: 'Primary congenital glaucoma',
    kind: 'Childhood',
    short: 'A baby is born with an underdeveloped drain — the eye enlarges.',
    summary: `<p>A rare glaucoma present at birth or in the first years of life, caused by abnormal development of the drainage angle.</p>`,
    mechanism: `<p>The trabecular meshwork and angle don't form properly (<em>trabeculodysgenesis</em>; often linked to the <em>CYP1B1</em> gene). Because a baby's eye wall is stretchy, high pressure <strong>enlarges the whole eye</strong> (<em>buphthalmos</em>, "ox eye") and stretches the cornea, causing cloudiness and splits in its inner layer.</p>`,
    who: `<p>Roughly 1 in 10,000 births in many countries, more common where parents are related. Often both eyes.</p>`,
    symptoms: `<ul><li>Excessive tearing</li><li>Sensitivity to light</li><li>Squeezing the eyelids shut</li><li>Large and/or cloudy corneas — eyes that look unusually big or bluish-grey</li></ul>`,
    detection: `<p>Examination by a paediatric ophthalmologist, often under anaesthesia: pressure, corneal size, gonioscopy and the optic nerve.</p>`,
    treatment: `<p>Mainly <strong>surgery</strong> to open the drain: goniotomy or trabeculotomy. Medicines help temporarily. Early surgery gives many children good vision; lifelong follow-up is needed.</p>`,
    watch: 'The whole eye is enlarged and the cornea hazy. Surgery to open the drain (goniotomy) brings the pressure down.',
    fact: 'Unlike adults, children can sometimes show partial reversal of optic disc cupping after the pressure is lowered — their tissues are more elastic.',
  },
};

/** Other forms, described in the library only. */
export const OTHER_TYPES = [
  { name: 'Juvenile open-angle glaucoma', text: 'Open-angle glaucoma starting between about 4 and 35 years of age, often with very high pressure and a strong family history (frequently linked to the MYOC gene).' },
  { name: 'Traumatic / angle-recession glaucoma', text: 'A blunt injury can tear the drainage angle or cause bleeding in the anterior chamber (hyphema). Pressure may rise soon after the injury or years later, so injured eyes need long-term check-ups.' },
  { name: 'Plateau iris', text: 'An unusual position of the ciliary body pushes the peripheral iris forward, so the angle can stay narrow or close even after a laser iridotomy. Treated with laser iridoplasty, lens surgery or drops.' },
  { name: 'Aqueous misdirection ("malignant glaucoma")', text: 'A rare complication, usually after eye surgery, in which fluid flows backwards into the vitreous and pushes the lens and iris forward, closing the angle.' },
  { name: 'Lens-induced glaucoma', text: 'A swollen cataract can push the iris forward and close the angle (phacomorphic), or a very mature cataract can leak proteins that clog the drain (phacolytic). Removing the lens is the cure.' },
  { name: 'Iridocorneal endothelial (ICE) syndrome', text: 'Abnormal corneal cells migrate over the drainage angle and iris, usually in one eye of a young-to-middle-aged woman, closing the angle.' },
  { name: 'Glaucoma with raised venous pressure', text: 'When the pressure in the veins around the eye is high — for example in Sturge-Weber syndrome, thyroid eye disease or an abnormal artery-vein connection — fluid cannot drain away, so eye pressure rises.' },
  { name: 'Childhood glaucoma after cataract surgery', text: 'Children who have cataract surgery early in life have a lifelong risk of glaucoma and need regular pressure checks.' },
];

/** Symptoms the user should never ignore. */
export const EMERGENCY = `If you have <strong>sudden eye pain, a red eye, blurred vision, rainbow halos around lights, headache, or nausea</strong>, seek emergency eye care immediately — this could be acute angle closure.`;
