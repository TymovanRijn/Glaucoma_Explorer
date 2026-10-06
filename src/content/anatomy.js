/**
 * ANATOMY KNOWLEDGE BASE
 * Every structure you can point at in 3D has an entry here. The `qa` list powers the
 * "Ask me" chat: each structure answers in the first person.
 *
 * Medical content is educational and simplified; it is not medical advice.
 */

export const GROUPS = {
  overview: 'The whole eye',
  front: 'Front of the eye',
  drainage: 'The drainage system',
  inside: 'Spaces & fluids',
  back: 'Back of the eye',
  nerve: 'Optic nerve',
  coats: 'Walls of the eye',
  around: 'Around the eye',
};

export const PARTS = {
  outside: {
    name: 'The eyeball',
    tagline: 'A living camera, 24 mm across',
    group: 'overview',
    hello: "Welcome! I'm a human eye — about the size of a large marble, weighing roughly 7 grams. Swim inside me and point at anything to learn what it does.",
    what: `<p>The eyeball is a fluid-filled sphere about <strong>24&nbsp;mm</strong> long. Light enters through the clear <em>cornea</em> at the front, passes the <em>pupil</em> and the <em>lens</em>, crosses the jelly-like <em>vitreous</em> and lands on the <em>retina</em> — a thin sheet of nerve tissue lining the back wall.</p>
      <p>The retina turns light into electrical signals that leave the eye through the <em>optic nerve</em>: a cable of about 1.2&nbsp;million nerve fibres connecting the eye to the brain.</p>`,
    role: `<p>The eye has two jobs: <strong>focus</strong> a sharp image (cornea + lens) and <strong>detect</strong> it (retina). To keep its shape — like air in a football — it is gently pressurised by a constantly renewed fluid, the <em>aqueous humour</em>.</p>`,
    glaucoma: `<p>Glaucoma is a disease of the <strong>optic nerve</strong>. Most often it is linked to that internal pressure: when the fluid can't drain properly, pressure rises and slowly damages the nerve fibres where they leave the eye. Lost fibres never grow back, which is why glaucoma is the world's leading cause of <em>irreversible</em> blindness.</p>`,
    fact: 'Your eye is pressurised to about 15 mmHg above the surrounding air — roughly the pressure in a balloon you have only just started blowing up.',
    qa: [
      { q: 'How big is the eye?', a: 'About 24 mm from front to back in an adult — a bit smaller than a ping-pong ball — and about 7–7.5 grams. A newborn\'s eye is about 16–17 mm and grows quickly in the first years.', k: 'size big large weight' },
      { q: 'Why is the eye under pressure?', a: 'Pressure keeps the eyeball firm and round so the optics stay precisely aligned — a floppy eye would give a blurry image. The pressure comes from the aqueous humour, which is produced and drained continuously.', k: 'pressure iop firm round why' },
      { q: 'What is glaucoma in one sentence?', a: 'Glaucoma is a group of eye diseases in which the optic nerve is slowly damaged — usually (but not always) because the pressure inside the eye is too high for that nerve — causing permanent, often unnoticed, loss of vision starting at the edges.', k: 'glaucoma definition what is' },
      { q: 'Where should I start exploring?', a: 'Try the guided tour “The journey of a drop” — it follows a droplet of fluid from where it is made to where it drains, which is the key to understanding glaucoma. Or swim to the drainage angle and the optic disc yourself.', k: 'start begin explore tour where' },
    ],
    related: ['cornea', 'aqueous-humor', 'optic-disc', 'trabecular-meshwork'],
  },

  cornea: {
    name: 'Cornea',
    tagline: 'The clear front window',
    group: 'front',
    hello: "Hi, I'm the cornea — the clear dome at the very front. I do most of the eye's focusing, and I'm one of the very few tissues in your body with no blood vessels at all.",
    what: `<p>A transparent dome about <strong>11.5&nbsp;mm</strong> wide and only about <strong>0.55&nbsp;mm</strong> thick in the centre (a bit thicker at the edge). It has five main layers: the <em>epithelium</em> (surface skin), <em>Bowman's layer</em>, the <em>stroma</em> (90% of the thickness, made of precisely stacked collagen), <em>Descemet's membrane</em> and the <em>endothelium</em>, a single layer of pump cells on the inside.</p>`,
    role: `<p>The cornea provides about <strong>two-thirds</strong> of the eye's focusing power. Because it has no blood vessels (they would scatter light), it gets oxygen from the air through the tear film and nutrients from the aqueous humour behind it. The endothelial cells constantly pump water out to keep it crystal clear.</p>`,
    glaucoma: `<ul>
      <li><strong>Pressure readings:</strong> eye pressure is measured by pressing on the cornea. A <em>thin</em> cornea gives falsely <em>low</em> readings; a thick one gives falsely high readings. That is why doctors measure corneal thickness (<em>pachymetry</em>). A thin cornea is also itself a risk factor for glaucoma.</li>
      <li><strong>Acute angle closure:</strong> a sudden pressure spike overwhelms the endothelial pumps — the cornea swells with water, turns hazy and people see <em>rainbow halos</em> around lights.</li>
      <li><strong>Babies:</strong> in congenital glaucoma a baby's soft cornea stretches, becoming large and cloudy.</li>
    </ul>`,
    fact: 'The cornea is one of the most densely innervated tissues in the body — hundreds of times more sensitive than skin. That is why a single eyelash feels enormous.',
    qa: [
      { q: 'Why are you transparent?', a: 'Three tricks: I have no blood vessels; my collagen fibres are extremely thin and spaced at a precise distance so scattered light cancels out; and my inner pump cells keep my water content just right. If the pumps fail, I swell and turn cloudy.', k: 'transparent clear see through' },
      { q: 'How do you get oxygen without blood?', a: 'Mostly from the air, dissolved in the tear film on my surface. My inner layers are fed by the aqueous humour. When your eyes are closed during sleep, oxygen comes from blood vessels in the eyelid lining.', k: 'oxygen blood breathe nutrients' },
      { q: 'What does my corneal thickness have to do with glaucoma?', a: 'Pressure is measured by flattening me. A thick cornea resists more, so the reading comes out too high; a thin cornea gives a reading that is too low and can hide high pressure. Large studies also found thin corneas to be an independent risk factor for developing glaucoma.', k: 'thickness pachymetry thin thick reading measurement cct' },
      { q: 'Why do people see halos in an angle-closure attack?', a: 'When pressure spikes suddenly (often above 40–50 mmHg), water is forced into my tissue faster than my pumps can remove it. I become swollen and hazy, and the swelling scatters light into coloured rings around lamps.', k: 'halos rainbow lights haze cloudy acute attack' },
      { q: 'Can you heal?', a: 'My surface epithelium heals remarkably fast — small scratches close within a day or two. But my inner endothelial cells do not multiply in adults; if too many are lost, a corneal transplant may be needed.', k: 'heal repair transplant scratch' },
    ],
    related: ['anterior-chamber', 'iris', 'lens', 'drainage-angle'],
  },

  sclera: {
    name: 'Sclera',
    tagline: 'The tough white wall',
    group: 'coats',
    hello: "I'm the sclera — the 'white of the eye'. I'm a tough coat of collagen that protects everything inside and keeps the eye's shape under pressure.",
    what: `<p>A strong, white layer of interwoven collagen fibres covering about <strong>five-sixths</strong> of the eyeball. It is about 0.3&nbsp;mm thin just behind the muscle attachments and up to about 1&nbsp;mm thick at the back, near the optic nerve. At the front it merges with the cornea at the <em>limbus</em>; at the back it continues into the sheath around the optic nerve.</p>`,
    role: `<p>The sclera is the eye's "pressure vessel": it gives the eyeball its shape, resists the internal pressure, and anchors the six muscles that move the eye. Where the optic nerve leaves, the sclera becomes a sieve-like plate — the <em>lamina cribrosa</em>.</p>`,
    glaucoma: `<p>The drain of the eye — the trabecular meshwork and Schlemm's canal — is built into the inner wall of the sclera at the limbus. At the back, the <em>lamina cribrosa</em> is the weak spot where pressure injures the nerve fibres. In babies the sclera is still stretchy, so high pressure enlarges the whole eye ("buphthalmos").</p>`,
    fact: 'Humans have an unusually large visible white sclera compared with other primates. One theory: it makes our gaze direction easy to read, helping us cooperate.',
    qa: [
      { q: 'Why are you white?', a: 'My collagen fibres are irregularly arranged and of different thicknesses, so I scatter all wavelengths of light equally — which looks white. The cornea uses the same collagen but arranges it in perfect order, which makes it transparent.', k: 'white colour color why' },
      { q: 'What role do you play in glaucoma?', a: 'Two places matter. At the front, the drain of the eye sits in my inner wall. At the back, where the optic nerve exits, I form the lamina cribrosa — a sieve the nerve fibres must pass through. That sieve is where pressure does its damage.', k: 'glaucoma role drain lamina' },
      { q: 'Can you stretch?', a: 'In babies and young children, yes — which is why untreated childhood glaucoma makes the eye grow large. In adults I am much stiffer. In strong short-sightedness (high myopia) I am stretched and thinner, which is one reason myopia increases glaucoma risk.', k: 'stretch myopia child baby buphthalmos' },
    ],
    related: ['conjunctiva', 'lamina-cribrosa', 'schlemms-canal', 'extraocular-muscles'],
  },

  conjunctiva: {
    name: 'Conjunctiva',
    tagline: 'The thin clear skin on the white of the eye',
    group: 'coats',
    hello: "I'm the conjunctiva — a thin, clear membrane over the white of your eye and the inside of your eyelids. Those little red blood vessels you can see? Most of them are mine.",
    what: `<p>A transparent mucous membrane covering the front of the sclera (but not the cornea) and folding back to line the inner eyelids. It contains small blood vessels and cells that produce mucus for the tear film.</p>`,
    role: `<p>It protects the eye surface, helps keep it moist, and is part of the eye's immune defence. When irritated or inflamed, its blood vessels widen — a "red eye".</p>`,
    glaucoma: `<ul><li>A <strong>red eye</strong> with pain and blurred vision can signal an acute angle-closure attack — an emergency.</li>
      <li>Some glaucoma drops (especially prostaglandin analogues) commonly make the conjunctiva look red.</li>
      <li>In <strong>trabeculectomy</strong> surgery, a new drain lets fluid collect under the conjunctiva in a small blister called a <em>bleb</em>, from where it is absorbed.</li></ul>`,
    fact: 'The conjunctiva is so thin and clear that doctors can watch individual red blood cells flowing in its vessels under a microscope.',
    qa: [
      { q: 'Why do my eyes go red?', a: 'My blood vessels widen when the eye is irritated, infected, inflamed, dry or tired. In glaucoma care, a red eye can be a harmless side effect of drops — but a red, painful eye with blurred vision and halos needs emergency care.', k: 'red bloodshot redness' },
      { q: 'What is a bleb?', a: 'After trabeculectomy surgery, aqueous humour drains through a new opening into a small pocket under me — the bleb. From there it is absorbed into the surrounding tissue, lowering eye pressure.', k: 'bleb trabeculectomy surgery pocket' },
    ],
    related: ['sclera', 'episcleral-veins', 'cornea'],
  },

  iris: {
    name: 'Iris',
    tagline: 'The coloured muscle that controls the light',
    group: 'front',
    hello: "Hi! I'm the iris — the coloured part of your eye. I'm actually a ring of muscle, and I'm involved in several kinds of glaucoma.",
    what: `<p>A thin, round curtain of tissue about 12&nbsp;mm across with the pupil in the middle. It contains two muscles: the <em>sphincter</em> (constricts the pupil) and the <em>dilator</em> (widens it). Its back surface is covered with a dark pigment layer; its front shows the fibres, crypts and folds that make every iris unique.</p>`,
    role: `<p>Like a camera's aperture, the iris controls how much light reaches the retina. Its colour comes from the pigment <em>melanin</em>: lots of it looks brown; little of it looks blue — not because of blue pigment, but because the tissue scatters blue light, much like the sky.</p>`,
    glaucoma: `<ul>
      <li><strong>Angle closure:</strong> if the iris bulges forward, its edge can press against the drain and block it.</li>
      <li><strong>Pigmentary glaucoma:</strong> a backward-bowing iris rubs against the lens fibres and sheds pigment that clogs the drain.</li>
      <li><strong>Neovascular glaucoma:</strong> abnormal new blood vessels grow on the iris and over the drain.</li>
      <li><strong>Treatment:</strong> laser iridotomy makes a tiny hole in the iris; prostaglandin drops can permanently darken a light-coloured iris.</li>
    </ul>`,
    fact: 'Your iris pattern is so unique — and so stable through life — that it is used for biometric identification. Even your left and right irises differ.',
    qa: [
      { q: 'Why is my eye the colour it is?', a: 'It depends on how much melanin is in my front layers. Brown eyes have a lot. Blue eyes have very little — the blue is created by light scattering in the tissue, like the blue sky. Green and hazel are in between, with some yellowish pigment and scattering combined.', k: 'colour color blue brown green hazel melanin' },
      { q: 'How can you cause glaucoma?', a: 'In angle closure, I bow forward and plug the drainage angle like a door slammed shut. In pigmentary glaucoma, I bow backward and rub against the zonule fibres, scraping off pigment that clogs the drain. And in neovascular glaucoma, fragile new vessels grow over me and into the drain.', k: 'cause glaucoma how angle closure pigment' },
      { q: 'What is an iridotomy?', a: 'A laser makes a tiny hole near my edge. Fluid trapped behind me can then flow straight through the hole instead of squeezing through the pupil, so I stop bulging forward and the drain opens again. It is the standard treatment for angle closure.', k: 'iridotomy laser hole lpi' },
      { q: 'Can eye drops change my colour?', a: 'Yes — prostaglandin analogue drops (like latanoprost) can slowly and permanently darken a green, hazel or light-brown iris by stimulating more melanin. They can also make eyelashes longer and darker.', k: 'drops change colour darken latanoprost' },
    ],
    related: ['pupil', 'drainage-angle', 'posterior-chamber', 'lens'],
  },

  pupil: {
    name: 'Pupil',
    tagline: 'The opening that lets light in',
    group: 'front',
    hello: "I'm the pupil — not a structure at all, but a hole! I look black because light goes in and very little comes back out.",
    what: `<p>The opening in the centre of the iris. It ranges from about <strong>2&nbsp;mm</strong> in bright light to <strong>8&nbsp;mm</strong> in darkness. All the aqueous humour made behind the iris must flow forward through the pupil.</p>`,
    role: `<p>The pupil controls how much light enters and improves depth of focus when small. Its size is set automatically by the nervous system — and also changes with emotion, focus distance and many medicines.</p>`,
    glaucoma: `<p>In people with a crowded front of the eye, a <strong>mid-dilated pupil</strong> (in dim light, or after some cold medicines, antidepressants or dilating drops) can trigger <em>pupillary block</em>: the iris presses on the lens, fluid gets trapped behind the iris, the iris bulges forward and blocks the drain. This is how an acute angle-closure attack starts. During an attack the pupil is often fixed, oval and mid-sized.</p>`,
    fact: 'Your pupils widen slightly when you think hard or find something interesting — psychologists use pupil size to measure mental effort.',
    qa: [
      { q: 'Why do you look black?', a: 'Light entering me is mostly absorbed by the pigmented layers inside the eye, and the little that reflects is aimed back at the light source. With a flash camera aimed straight at you, it comes back red — the famous red-eye effect from the blood-rich retina and choroid.', k: 'black dark red eye' },
      { q: 'What is pupillary block?', a: 'Fluid made behind the iris has to squeeze through the small gap where my edge touches the lens. If that gap is too tight, pressure builds behind the iris, which bows forward and can close the drainage angle. A laser iridotomy creates a bypass.', k: 'pupillary block bombe trapped' },
      { q: 'Can dilating drops trigger glaucoma?', a: 'Rarely, in people with narrow angles, dilating the pupil can trigger angle closure. Eye doctors check the angle first when there is a risk. For most people, dilation is completely safe.', k: 'dilating drops dilation trigger attack' },
    ],
    related: ['iris', 'lens', 'posterior-chamber', 'anterior-chamber'],
  },

  lens: {
    name: 'Lens',
    tagline: 'The adjustable focus',
    group: 'front',
    hello: "Hello, I'm the crystalline lens. I fine-tune your focus — and I keep growing your whole life, which matters for glaucoma.",
    what: `<p>A clear, flexible, biconvex disc about <strong>9–10&nbsp;mm</strong> wide and <strong>4&nbsp;mm</strong> thick, wrapped in an elastic capsule and hung in place by hundreds of fine <em>zonule</em> fibres. Like the cornea, it has no blood vessels and is fed by the aqueous humour.</p>`,
    role: `<p>By changing shape, the lens shifts focus from far to near (<em>accommodation</em>). With age it stiffens (so we need reading glasses after about 45) and may cloud over — a <em>cataract</em>.</p>`,
    glaucoma: `<ul>
      <li>The lens keeps adding layers, so it gets <strong>thicker with age</strong>. It pushes the iris forward and crowds the drainage angle — a major reason angle closure is more common in older people and in far-sighted (smaller) eyes.</li>
      <li>Replacing a thick lens with a thin artificial one (cataract or lens surgery) deepens the front of the eye and can <strong>treat angle closure</strong>.</li>
      <li>In <strong>pseudoexfoliation</strong>, flaky white material builds up on the front of the lens.</li>
    </ul>`,
    fact: 'The cells in the centre of your lens were formed before you were born — they are among the oldest cells in your body.',
    qa: [
      { q: 'How do you focus?', a: 'When the ciliary muscle contracts, the zonule fibres holding me relax and my elastic capsule makes me rounder — stronger focusing for near objects. When the muscle relaxes, the zonules pull me flatter for distance.', k: 'focus accommodation near far' },
      { q: 'How are you connected to angle closure?', a: 'I grow throughout life and my front surface moves forward. In an eye that is already small or crowded, I push the iris toward the cornea, narrowing the drainage angle. Removing me and fitting a slim artificial lens is an effective treatment for many people with angle closure.', k: 'angle closure grow thick crowd surgery' },
      { q: 'What are the white flakes in pseudoexfoliation?', a: 'An abnormal protein-rich material produced by tissues in and around the eye. It collects on my front surface in a typical target pattern, rubs off as the pupil moves, and clogs the drain. It also weakens my zonules, which makes cataract surgery trickier.', k: 'flakes pseudoexfoliation pxf white dandruff' },
    ],
    related: ['zonules', 'iris', 'ciliary-body', 'posterior-chamber'],
  },

  zonules: {
    name: 'Zonules',
    tagline: 'The lens suspension cables',
    group: 'front',
    hello: "We're the zonules — hundreds of microscopic fibres holding the lens in place like the springs of a trampoline.",
    what: `<p>Fine fibres made mostly of the protein <em>fibrillin</em>, running from the ciliary body to the edge (equator) of the lens capsule. Together they form the <em>suspensory ligament</em> of the lens.</p>`,
    role: `<p>They transmit the pull of the ciliary muscle to the lens: when the muscle relaxes, the zonules tighten and flatten the lens for distance vision.</p>`,
    glaucoma: `<p>In <strong>pigment dispersion</strong>, a backward-bowing iris rubs against the zonules like a bow on violin strings, releasing pigment granules into the fluid. In <strong>pseudoexfoliation</strong>, the zonules become weak and can even break.</p>`,
    fact: 'Fibrillin, the protein in the zonules, is the same protein affected in Marfan syndrome — which is why people with Marfan often have a dislocated lens.',
    qa: [
      { q: 'How do you cause pigment to be released?', a: 'In some (often young, short-sighted) people, the iris bows backwards. Its pigmented back surface then scrapes against us with every blink and eye movement, and pigment granules flake off into the aqueous humour, drifting to the drain.', k: 'pigment release rub dispersion' },
      { q: 'What happens if you break?', a: 'The lens can tilt or move out of place (subluxation), which blurs vision and can even block fluid flow. Weak zonules are a known risk in pseudoexfoliation and in some genetic conditions.', k: 'break weak dislocate subluxation' },
    ],
    related: ['lens', 'ciliary-body', 'iris'],
  },

  'ciliary-body': {
    name: 'Ciliary body',
    tagline: 'The tap — where the eye’s fluid is made',
    group: 'drainage',
    hello: "I'm the ciliary body, the ring behind the iris. Think of me as the eye's tap: my processes make all the aqueous humour, about 2.5 microlitres every minute.",
    what: `<p>A ring of tissue about 6&nbsp;mm wide behind the iris, part of the eye's middle layer (the <em>uvea</em>, together with the iris and choroid). Its front part has about 70–80 folded <em>ciliary processes</em>; inside it lies the <em>ciliary muscle</em>.</p>`,
    role: `<ul><li><strong>Fluid production:</strong> the ciliary processes filter and actively secrete aqueous humour.</li>
      <li><strong>Focusing:</strong> the ciliary muscle changes the shape of the lens via the zonules.</li>
      <li><strong>Back-door drainage:</strong> part of the fluid seeps out between the ciliary muscle fibres (the uveoscleral route).</li></ul>`,
    glaucoma: `<p>Many glaucoma treatments target the ciliary body. <strong>Beta-blockers, carbonic anhydrase inhibitors</strong> and <strong>alpha-agonists</strong> turn down the tap. <strong>Prostaglandin analogues</strong> loosen the tissue between the muscle fibres to open the back door. <strong>Pilocarpine</strong> contracts the muscle, which pulls the drain open. For hard cases, a laser can reduce the tap permanently (<em>cyclophotocoagulation</em>).</p>`,
    fact: 'Fluid production follows a daily rhythm: it drops by roughly half while you sleep.',
    qa: [
      { q: 'How much fluid do you make?', a: 'About 2–3 microlitres per minute — roughly a raindrop every 20 minutes. The front of the eye holds about 0.3 millilitres, so the whole volume is refreshed roughly every 1.5–2 hours.', k: 'how much fluid production rate volume' },
      { q: 'Which drops turn you down?', a: 'Beta-blockers such as timolol, carbonic anhydrase inhibitors such as dorzolamide (and acetazolamide tablets), and alpha-agonists such as brimonidine all reduce how much fluid I produce.', k: 'drops reduce production timolol dorzolamide brimonidine' },
      { q: 'Why not just switch you off?', a: 'The fluid I make is not waste — it feeds the cornea and lens, which have no blood supply, and keeps the eye inflated. Switching me off completely would starve those tissues and let the eye go soft (hypotony). Treatments aim to balance production and drainage.', k: 'switch off stop why not' },
    ],
    related: ['ciliary-processes', 'zonules', 'uveoscleral-pathway', 'aqueous-humor'],
  },

  'ciliary-processes': {
    name: 'Ciliary processes',
    tagline: 'The factory folds that secrete aqueous humour',
    group: 'drainage',
    hello: "We're the ciliary processes — about 70 folds packed with tiny blood vessels. We turn blood plasma into the crystal-clear aqueous humour, around the clock.",
    what: `<p>Finger-like ridges on the inner surface of the ciliary body, arranged in a ring around the lens like the petals of a sunflower. Each is covered by a double layer of epithelium over a dense network of leaky capillaries.</p>`,
    role: `<p>Fluid leaks out of the capillaries, and the epithelial cells actively pump ions (using enzymes such as Na⁺/K⁺-ATPase and <em>carbonic anhydrase</em>) so that water follows by osmosis. The result is a clear fluid with little protein but lots of vitamin C.</p>`,
    glaucoma: `<p>Turning down our output is one of the main ways to lower eye pressure: carbonic anhydrase inhibitors block one of our key enzymes, beta-blockers and alpha-agonists dial down our activity.</p>`,
    fact: 'Aqueous humour contains roughly 15–20 times more vitamin C than blood plasma — thought to help protect the lens and cornea from UV damage.',
    qa: [
      { q: 'How do you make fluid?', a: 'Three processes: plasma filters out of our leaky capillaries (ultrafiltration), a little diffuses through, and most importantly our epithelium actively secretes ions — water follows them by osmosis.', k: 'make secrete produce how' },
      { q: 'Is the fluid like blood?', a: 'It starts as blood plasma but we filter out almost all proteins and cells, so it is crystal clear. It has more vitamin C and lactate, and less protein than plasma.', k: 'blood like composition' },
    ],
    related: ['ciliary-body', 'posterior-chamber', 'aqueous-humor'],
  },

  'trabecular-meshwork': {
    name: 'Trabecular meshwork',
    tagline: 'The main drain — a living sieve',
    group: 'drainage',
    hello: "I'm the trabecular meshwork — the eye's main drain. Most of the fluid leaves through me. When I get clogged or stiff, pressure rises. I'm at the heart of open-angle glaucoma.",
    what: `<p>A spongy, sieve-like band of tissue in the <em>drainage angle</em>, where the iris meets the cornea. It has three layers that become progressively finer: the <em>uveal</em> and <em>corneoscleral</em> meshwork, and the <em>juxtacanalicular tissue</em> right next to Schlemm's canal, which provides most of the resistance.</p>`,
    role: `<p>Fluid percolates through the meshwork into Schlemm's canal. The resistance it offers is what keeps eye pressure in the normal range. Its cells also clean the fluid by swallowing debris (phagocytosis).</p>`,
    glaucoma: `<p>In <strong>primary open-angle glaucoma</strong> the angle looks open, but the meshwork itself becomes stiffer and less permeable — the outflow resistance rises and so does the pressure. It can also be clogged by <em>pigment</em> (pigmentary glaucoma), <em>exfoliation material</em>, <em>inflammatory cells</em>, a <em>steroid</em>-induced build-up of material, or covered by new vessels or the iris itself.</p>
      <p>Treatments that target it: <strong>SLT laser</strong>, <strong>Rho-kinase inhibitor</strong> drops, <strong>pilocarpine</strong>, and <strong>micro-stents (MIGS)</strong> that bypass it.</p>`,
    fact: 'The meshwork loses cells with age — one reason pressure tends to creep up as we get older.',
    qa: [
      { q: 'What happens to you in open-angle glaucoma?', a: 'The angle stays wide open, but I become less permeable: my cells decline, my extracellular material builds up and stiffens, and the tissue next to Schlemm\'s canal resists flow more. It is like a coffee filter slowly clogging — the tap keeps running, so pressure rises.', k: 'open angle poag what happens clog stiff' },
      { q: 'How much fluid leaves through you?', a: 'In most adults the majority — often estimated at roughly three-quarters or more. The rest leaves through the uveoscleral "back door". My route is pressure-dependent: the higher the pressure, the more is pushed through me.', k: 'how much percent outflow route' },
      { q: 'What does laser trabeculoplasty do to you?', a: 'Selective laser trabeculoplasty (SLT) aims very short, low-energy pulses at my pigmented cells. Rather than burning holes, it triggers a biological clean-up and remodelling response that improves outflow — typically lowering pressure by about 20–30%. It can be repeated.', k: 'slt laser trabeculoplasty' },
      { q: 'Can you be bypassed?', a: 'Yes — micro-stents such as tiny titanium or nitinol devices (MIGS) create a channel from the front of the eye directly into Schlemm\'s canal, skipping my most resistant layer. They are often placed during cataract surgery.', k: 'bypass stent migs istent hydrus' },
      { q: 'Can you see me in an eye exam?', a: 'Not directly — light from the angle is trapped by total internal reflection in the cornea. Doctors use a mirrored contact lens (gonioscopy) to look at me, or an OCT scan of the front of the eye.', k: 'see exam gonioscopy look' },
    ],
    related: ['schlemms-canal', 'drainage-angle', 'scleral-spur', 'aqueous-humor'],
  },

  'schlemms-canal': {
    name: "Schlemm's canal",
    tagline: 'The ring-shaped collecting channel',
    group: 'drainage',
    hello: "I'm Schlemm's canal — a ring-shaped channel that runs all the way around the eye, just behind the trabecular meshwork. I collect the fluid and send it to the veins.",
    what: `<p>A circular, flattened channel about 36&nbsp;mm in circumference, lying in the wall of the eye at the limbus. Its inner wall is lined by special endothelial cells that form tiny pores and giant bubbles (<em>vacuoles</em>) to let fluid in. It drains into about 25–35 <em>collector channels</em>.</p>`,
    role: `<p>It gathers aqueous humour that has filtered through the trabecular meshwork and passes it on, via collector channels and aqueous veins, into the <em>episcleral veins</em> — back into the bloodstream.</p>`,
    glaucoma: `<p>Resistance at its inner wall is a major part of the drain's total resistance. Several modern operations work on the canal: stents that open into it (iStent, Hydrus), procedures that open or dilate it (goniotomy, trabeculotomy, canaloplasty).</p>`,
    fact: 'It is named after the German anatomist Friedrich Schlemm, who described it in 1830.',
    qa: [
      { q: 'Where does the fluid go after you?', a: 'Into collector channels in the sclera, then into aqueous veins and finally the episcleral veins on the surface of the eye — where it mixes with blood. Doctors can sometimes see clear streaks of aqueous flowing in these veins.', k: 'where after go veins' },
      { q: 'How do cells let fluid into you?', a: 'My inner-wall cells form giant vacuoles — bubble-like bulges — and pores, through which fluid passes in one direction, from the meshwork into my lumen. How these pores are regulated is still an active research topic.', k: 'pores vacuoles cells enter' },
    ],
    related: ['trabecular-meshwork', 'episcleral-veins', 'drainage-angle'],
  },

  'scleral-spur': {
    name: 'Scleral spur',
    tagline: 'The anchor of the drain',
    group: 'drainage',
    hello: "I'm the scleral spur — a small white ridge in the drainage angle. The ciliary muscle pulls on me, and doctors use me as a landmark.",
    what: `<p>A ring-shaped ridge of collagen projecting inward from the sclera, just behind the trabecular meshwork. The longitudinal fibres of the ciliary muscle attach to it.</p>`,
    role: `<p>When the ciliary muscle contracts, it pulls the spur backwards, stretching the meshwork and opening its spaces — increasing outflow.</p>`,
    glaucoma: `<p>This is how <strong>pilocarpine</strong> drops lower pressure. In gonioscopy, seeing the spur as a white line means the angle is open at least to that level. On anterior-segment OCT, it is the reference point for measuring angle width.</p>`,
    fact: 'The spur contains contractile cells of its own that may fine-tune drainage.',
    qa: [
      { q: 'Why does pilocarpine pull on you?', a: 'Pilocarpine makes the ciliary muscle contract. The muscle is anchored to me, so I am pulled back, which stretches the trabecular meshwork open like pulling a net taut — fluid then drains more easily.', k: 'pilocarpine pull muscle' },
    ],
    related: ['trabecular-meshwork', 'ciliary-body', 'drainage-angle'],
  },

  'episcleral-veins': {
    name: 'Episcleral veins',
    tagline: 'Where the fluid rejoins the blood',
    group: 'drainage',
    hello: "We're the episcleral veins — the end of the line for aqueous humour. Our own pressure sets the floor for how low eye pressure can go.",
    what: `<p>Small veins lying on the surface of the sclera, under the conjunctiva. Aqueous veins from Schlemm's canal drain into them.</p>`,
    role: `<p>They carry the drained fluid back into the venous circulation. Their pressure — about <strong>8–10&nbsp;mmHg</strong> — pushes back against the drain.</p>`,
    glaucoma: `<p>Because fluid must flow "downhill" into these veins, eye pressure through the main drain cannot fall below episcleral venous pressure. Conditions that raise it (certain blood-vessel malformations, thyroid eye disease, Sturge-Weber syndrome) can cause glaucoma. <strong>Rho-kinase inhibitor</strong> drops can lower it slightly.</p>`,
    fact: 'In the Goldmann equation for eye pressure, these veins are the “EVP” term.',
    qa: [
      { q: 'Why can\'t eye pressure drop below yours?', a: 'Fluid flows from high to low pressure. If the eye\'s pressure dropped below ours, fluid would stop draining through the main route. So our pressure is a floor — roughly 8–10 mmHg — for that route.', k: 'floor minimum lowest evp' },
    ],
    related: ['schlemms-canal', 'conjunctiva', 'trabecular-meshwork'],
  },

  'drainage-angle': {
    name: 'Drainage angle',
    tagline: 'Where the iris meets the cornea — and the drain sits',
    group: 'drainage',
    hello: "You're in the drainage angle, also called the iridocorneal angle: the corner between the iris and the cornea, all the way round the eye. The drain lives here.",
    what: `<p>The narrow, ring-shaped corner where the iris root meets the inner wall of the cornea and sclera. From front to back, its wall shows <em>Schwalbe's line</em>, the <em>trabecular meshwork</em>, the <em>scleral spur</em> and the <em>ciliary body band</em>.</p>`,
    role: `<p>All conventional drainage happens here. The wider the angle, the easier it is for fluid to reach the meshwork.</p>`,
    glaucoma: `<p>Glaucoma is classified by this angle:</p>
      <ul><li><strong>Open-angle glaucoma:</strong> the angle is wide, but the drain itself works poorly.</li>
      <li><strong>Angle-closure glaucoma:</strong> the iris physically blocks the angle — suddenly (acute, an emergency) or gradually (chronic).</li></ul>
      <p>Doctors examine it with <em>gonioscopy</em> (a mirrored lens) or anterior-segment OCT, and grade it from wide open (Shaffer grade 4) to closed (grade 0).</p>`,
    fact: 'You cannot see this angle with an ordinary microscope: light from it is trapped inside the cornea by total internal reflection — the same physics that makes fibre-optic cables work.',
    qa: [
      { q: 'What is the difference between open and closed angle?', a: 'In open-angle glaucoma the doorway to the drain is wide open but the drain itself is clogged. In angle closure the drain may be fine, but the iris has shut the doorway. The treatments differ: open angles get drops, laser or drain surgery; closed angles often first need a laser hole in the iris or lens surgery to reopen the doorway.', k: 'open closed difference angle' },
      { q: 'Who has narrow angles?', a: 'People with smaller, far-sighted eyes, older people (the lens thickens), women, and people of East Asian descent are more likely to have narrow angles. Many never develop problems, but they should be monitored.', k: 'narrow who risk hyperopia asian' },
      { q: 'How do doctors look at the angle?', a: 'With gonioscopy: a special contact lens with mirrors placed on the numbed eye at the slit lamp. Pressing gently (indentation) shows whether a closed angle can be reopened. Anterior-segment OCT gives a cross-section image without touching the eye.', k: 'look examine gonioscopy oct' },
    ],
    related: ['trabecular-meshwork', 'iris', 'scleral-spur', 'schlemms-canal'],
  },

  'anterior-chamber': {
    name: 'Anterior chamber',
    tagline: 'The fluid-filled space behind the cornea',
    group: 'inside',
    hello: "You're swimming in the anterior chamber — the space between the cornea and the iris, filled with crystal-clear aqueous humour.",
    what: `<p>The space bounded by the cornea in front and the iris and lens behind. It is about <strong>3&nbsp;mm</strong> deep in the centre and holds about <strong>0.25&nbsp;mL</strong> of aqueous humour.</p>`,
    role: `<p>The fluid here nourishes the cornea from behind and carries waste away. Slow convection currents circulate it: warmed by the iris, it rises; cooled by the cornea, it sinks.</p>`,
    glaucoma: `<ul><li>A <strong>shallow</strong> chamber means a crowded front of the eye and a higher risk of angle closure.</li>
      <li>In uveitis, doctors see inflammatory <em>cells</em> and protein <em>flare</em> floating here.</li>
      <li>Convection currents deposit pigment in a vertical spindle on the back of the cornea (a <em>Krukenberg spindle</em>) in pigment dispersion.</li></ul>`,
    fact: 'The convection current in your anterior chamber is driven by the temperature difference between the cooler cornea (in contact with air) and the warmer iris.',
    qa: [
      { q: 'How deep are you?', a: 'About 3 mm in the centre in adults, shallower towards the edges. In far-sighted eyes and as the lens grows with age, I get shallower — which crowds the drainage angle.', k: 'deep depth shallow' },
      { q: 'What floats in you?', a: 'Normally almost nothing — the fluid is crystal clear. In inflammation, white blood cells and proteins appear; after an injury, red blood cells may settle at the bottom (a hyphema); in pigment dispersion, pigment granules drift around.', k: 'float cells flare pigment' },
    ],
    related: ['aqueous-humor', 'cornea', 'iris', 'drainage-angle'],
  },

  'posterior-chamber': {
    name: 'Posterior chamber',
    tagline: 'The narrow space behind the iris where fluid is born',
    group: 'inside',
    hello: "You're in the posterior chamber — a slim space behind the iris and in front of the lens. Fresh aqueous humour starts its journey here.",
    what: `<p>A small, ring-shaped space bounded by the back of the iris, the ciliary processes, the zonules and the front of the lens. It holds only about 0.06&nbsp;mL.</p>`,
    role: `<p>Aqueous humour secreted by the ciliary processes collects here, then flows forward through the pupil into the anterior chamber.</p>`,
    glaucoma: `<p>In <strong>pupillary block</strong>, fluid cannot get through the pupil easily. Pressure builds up here, pushing the iris forward like a sail (<em>iris bombé</em>) until it blocks the drainage angle. A laser iridotomy releases this pressure.</p>`,
    fact: 'Even though it is "posterior", this chamber is still in the front part of the eye — the names compare it to the anterior chamber, not to the whole eye.',
    qa: [
      { q: 'What is iris bombé?', a: 'When fluid is trapped behind the iris, the pressure here exceeds the pressure in front, and the iris bows forward like a sail filling with wind. Its outer edge then touches the trabecular meshwork and closes the angle.', k: 'bombe bulge sail' },
    ],
    related: ['ciliary-processes', 'pupil', 'iris', 'zonules'],
  },

  'aqueous-humor': {
    name: 'Aqueous humour',
    tagline: 'The eye’s self-renewing fluid',
    group: 'inside',
    hello: "I'm aqueous humour — the glowing droplets you see flowing. I'm made, I circulate, and I drain away, continuously. The balance between making and draining me sets your eye pressure.",
    what: `<p>A clear, watery fluid filling the front of the eye (anterior and posterior chambers). It is made from blood plasma by the ciliary processes at about <strong>2.5&nbsp;µL per minute</strong>.</p>`,
    role: `<p>It feeds the cornea and lens (which have no blood vessels), removes their waste, carries antioxidants, and inflates the eye to keep its shape. Normal eye pressure is roughly <strong>10–21&nbsp;mmHg</strong>.</p>`,
    glaucoma: `<p>Eye pressure is a balance — like a sink with the tap on: <strong>pressure rises if inflow exceeds outflow</strong>. In almost all forms of glaucoma with high pressure, the problem is on the drain side, not the tap side. Treatments either turn the tap down or open the drains.</p>
      <p>The relationship is described by the <em>Goldmann equation</em>: IOP = (F − U) / C + EVP — production minus back-door outflow, divided by how easily the main drain flows, plus the venous pressure the drain empties into.</p>`,
    fact: '“Humour” comes from the old medical idea of body fluids (the four humours). “Aqueous” just means watery.',
    qa: [
      { q: 'What path do you take?', a: 'I am made by the ciliary processes behind the iris, collect in the posterior chamber, squeeze through the pupil, drift through the anterior chamber, then leave mainly through the trabecular meshwork into Schlemm\'s canal and the veins — with some of me escaping through the uveoscleral back door. Try the tour "The journey of a drop"!', k: 'path route journey flow where go' },
      { q: 'What is normal eye pressure?', a: 'Roughly 10–21 mmHg, with an average around 15–16. But "normal" is a statistical range: some nerves are damaged at 15, others tolerate 25. That is why pressure alone cannot tell you whether someone has glaucoma.', k: 'normal pressure range iop mmhg' },
      { q: 'What is the Goldmann equation?', a: 'IOP = (F − U) / C + EVP. F is how fast I am produced, U how much leaves via the back door, C how easily the main drain lets me through, and EVP the pressure in the veins I drain into. Every glaucoma medicine changes one of these terms.', k: 'goldmann equation formula' },
      { q: 'Why does pressure rise if the drain clogs?', a: 'Because I keep being produced. If the drain lets out less than is made, I accumulate until the pressure is high enough to push the same amount out through the narrower drain. A new balance is reached — at a higher pressure.', k: 'why rise clog drain balance' },
    ],
    related: ['ciliary-processes', 'trabecular-meshwork', 'uveoscleral-pathway', 'anterior-chamber'],
  },

  'uveoscleral-pathway': {
    name: 'Uveoscleral pathway',
    tagline: 'The back door for fluid',
    group: 'drainage',
    hello: "I'm the uveoscleral pathway — the eye's back door. Some fluid seeps out between the ciliary muscle fibres and through the tissue layers behind them, bypassing the main drain.",
    what: `<p>An "unconventional" outflow route: from the drainage angle, aqueous humour passes into the ciliary muscle, through the spaces between its fibres, into the <em>suprachoroidal space</em> (between choroid and sclera) and out through the sclera or into blood vessels.</p>`,
    role: `<p>It carries a variable share of the outflow — estimates range from about a tenth to over a third, higher in young people. Unlike the main drain, it hardly depends on pressure.</p>`,
    glaucoma: `<p><strong>Prostaglandin analogue drops</strong> — the most widely used glaucoma medicines — work mainly by widening this route: they remodel the tissue between the ciliary muscle fibres. Some newer surgical devices drain into the suprachoroidal space too.</p>`,
    fact: 'This route was only properly recognised in the 1960s, long after the main drain was known.',
    qa: [
      { q: 'How do prostaglandin drops use you?', a: 'They trigger enzymes that break down and rebuild the extracellular matrix between the ciliary muscle fibres, widening the gaps fluid seeps through. More fluid escapes through me, so pressure falls — often by about 25–30% with a single nightly drop.', k: 'prostaglandin latanoprost drops how' },
    ],
    related: ['ciliary-body', 'choroid', 'aqueous-humor'],
  },

  vitreous: {
    name: 'Vitreous humour',
    tagline: 'The clear gel that fills the eye',
    group: 'inside',
    hello: "You're floating in the vitreous — the clear gel filling about 80% of the eye. Those drifting specks? Floaters. You may have seen them in your own vision.",
    what: `<p>A transparent gel of about <strong>4&nbsp;mL</strong>, about 99% water held in a scaffold of collagen fibres and hyaluronic acid. It lies between the lens and the retina.</p>`,
    role: `<p>It transmits light to the retina, cushions the eye and helps keep the retina in place. Unlike aqueous humour it is not continuously renewed. With age it gradually liquefies and can separate from the retina (posterior vitreous detachment), causing floaters.</p>`,
    glaucoma: `<p>The vitreous plays little role in most glaucoma. In a rare form, <em>aqueous misdirection</em> ("malignant glaucoma"), fluid flows backwards into the vitreous and pushes the lens and iris forward, closing the angle.</p>`,
    fact: 'Floaters are shadows cast on your retina by clumps of collagen in the vitreous — you are seeing the inside of your own eye.',
    qa: [
      { q: 'What are floaters?', a: 'Small clumps of collagen fibres in me that cast shadows on the retina. They are common and usually harmless, but a sudden shower of new floaters, flashes of light, or a curtain over your vision can mean a retinal tear — see an eye doctor urgently.', k: 'floaters specks spots' },
      { q: 'Are you renewed like aqueous humour?', a: 'No — I am mostly formed before birth and stay largely the same, slowly liquefying with age. That is why blood or debris in me can take a long time to clear.', k: 'renewed replaced' },
    ],
    related: ['retina', 'lens', 'hyaloid-canal'],
  },

  'hyaloid-canal': {
    name: 'Hyaloid canal',
    tagline: 'A tunnel left over from before birth',
    group: 'inside',
    hello: "I'm the hyaloid canal (Cloquet's canal) — a faint tunnel through the vitreous. Before you were born, an artery ran through me to feed your developing lens.",
    what: `<p>A narrow channel running through the vitreous from the optic disc to the back of the lens.</p>`,
    role: `<p>In the embryo it contains the <em>hyaloid artery</em>, which supplies the growing lens. The artery normally withers away before birth, leaving the empty canal.</p>`,
    glaucoma: `<p>No direct role in glaucoma — but a nice reminder that the eye is built from brain tissue and blood vessels that reorganise before birth.</p>`,
    fact: 'Tiny remnants of the hyaloid artery are common: a dot on the back of the lens (Mittendorf dot) or a wisp on the optic disc (Bergmeister papilla).',
    qa: [{ q: 'Why do you exist?', a: 'I am a developmental leftover: the path of the hyaloid artery that fed the lens before birth. Once the lens could be fed by the aqueous humour, the artery regressed.', k: 'why exist purpose' }],
    related: ['vitreous', 'optic-disc', 'lens'],
  },

  retina: {
    name: 'Retina',
    tagline: 'The light-sensing film of the eye',
    group: 'back',
    hello: "I'm the retina — a sheet of brain tissue only about a quarter of a millimetre thick, lining the back of the eye. I turn light into electrical signals.",
    what: `<p>A layered neural tissue (about 10 layers) lining the inside of the back of the eye. Light-sensitive <strong>photoreceptors</strong> (about 120 million rods and 6 million cones) sit at the <em>back</em> of the retina; signals pass forward through <em>bipolar cells</em> to about 1.2 million <strong>retinal ganglion cells</strong>, whose fibres form the optic nerve.</p>`,
    role: `<p>The retina detects light and also processes the image — detecting edges, contrast and motion — before sending it to the brain.</p>`,
    glaucoma: `<p>Glaucoma attacks one specific cell type: the <strong>retinal ganglion cells</strong> and their fibres. The photoreceptors are spared, but without ganglion cells their signals can never reach the brain. The fibres are lost in typical arcuate (arched) patterns, starting with those that enter the top and bottom of the optic disc.</p>`,
    fact: 'Light must pass through the whole thickness of the retina — nerves, vessels and all — before reaching the photoreceptors at the back. Our retina is "inside out".',
    qa: [
      { q: 'Which part of you does glaucoma damage?', a: 'My retinal ganglion cells — the output neurons whose long fibres (axons) travel across my surface into the optic nerve. When their fibres are injured at the optic disc, the cells die. My light-sensing photoreceptors are not directly affected.', k: 'damage glaucoma which part cells ganglion' },
      { q: 'Why is the retina inside out?', a: 'It develops as an outgrowth of the brain, and the photoreceptors need close contact with the pigment epithelium and choroid behind them for nourishment and recycling of visual pigments. The price is that light passes through the nerve layers first — and a blind spot where the fibres leave.', k: 'inside out inverted backwards' },
      { q: 'Can the retina regenerate?', a: 'In humans, no — lost retinal neurons are not replaced. Some fish and amphibians can regrow retinal cells, and scientists are studying how to unlock this in humans.', k: 'regenerate regrow heal' },
    ],
    related: ['ganglion-cells', 'rnfl', 'macula', 'optic-disc'],
  },

  macula: {
    name: 'Macula & fovea',
    tagline: 'The centre of sharp vision',
    group: 'back',
    hello: "I'm the macula, with the fovea at my centre. I'm responsible for the sharp, detailed vision you are using to read this.",
    what: `<p>An oval area about <strong>5.5&nbsp;mm</strong> across at the centre of the retina, coloured by yellow pigments (lutein and zeaxanthin). At its centre lies the <strong>fovea</strong>, a small pit packed with cones and free of blood vessels.</p>`,
    role: `<p>The macula provides central, detailed and colour vision. The fovea, only about 1.5&nbsp;mm across, gives the sharpest vision of all.</p>`,
    glaucoma: `<p>Glaucoma typically spares the very centre until late — which is why people can read the bottom lines of the eye chart while losing large parts of their side vision. But the macula contains about half of all ganglion cells, so <strong>OCT scans of the macula</strong> (ganglion cell layer thickness) can detect early glaucoma damage too.</p>`,
    fact: 'Your sharp central vision covers an area about the size of your thumbnail held at arm\'s length — your eyes dart around constantly to build the illusion of a sharp world.',
    qa: [
      { q: 'Why does glaucoma spare central vision until late?', a: 'The fibres from the macula (the papillomacular bundle) enter the side of the optic disc that is most resistant to damage, and there are so many of them that a lot can be lost before central acuity drops. That is exactly why people often don\'t notice glaucoma until it is advanced.', k: 'central spare why late reading' },
      { q: 'What is the difference between macula and fovea?', a: 'The macula is the whole central region (about 5.5 mm). The fovea is the small pit at its very centre (about 1.5 mm), where cones are packed tightest and vision is sharpest.', k: 'difference fovea macula' },
    ],
    related: ['retina', 'ganglion-cells', 'rnfl'],
  },

  rnfl: {
    name: 'Retinal nerve fibre layer',
    tagline: 'The fibres that carry vision to the brain',
    group: 'back',
    hello: "I'm the retinal nerve fibre layer — those glowing threads you see. Each represents a bundle of ganglion cell axons sweeping across the retina to the optic disc. Watch me in the Glaucoma Lab: in glaucoma, my fibres die.",
    what: `<p>The innermost layer of the retina: about 1.2 million axons of retinal ganglion cells, running across the retinal surface and converging on the optic disc. Fibres from the side of the retina arch around the macula in a characteristic pattern, and never cross a horizontal line (the <em>raphe</em>) on the temporal side.</p>`,
    role: `<p>It is the eye's wiring loom, carrying all visual information out of the eye. Inside the eye the fibres are not wrapped in myelin, which keeps them transparent so light can pass through.</p>`,
    glaucoma: `<p>Glaucoma kills these fibres, usually starting with the arcuate bundles that enter the <strong>top and bottom</strong> of the disc. The layer becomes thinner — measured in micrometres by <strong>OCT</strong>. A healthy layer around the disc is about 90–100&nbsp;µm thick on average. Because fibres from above and below never cross the horizontal raphe, damage often produces a visual-field defect with a sharp horizontal edge (a "nasal step").</p>`,
    fact: 'Because of the arcuate fibre pattern, damage at one small spot on the optic disc can wipe out a long arched band of vision — like cutting one cable in a bundle.',
    qa: [
      { q: 'Why does damage at the disc cause arch-shaped vision loss?', a: 'Each part of the disc collects fibres from a specific, arch-shaped strip of retina. Kill the fibres at the bottom pole of the disc, and you lose the whole arched strip they came from — which maps to an arched patch of the upper visual field. Try it in the Glaucoma Lab and look at the visual field map.', k: 'arch arcuate shape pattern why' },
      { q: 'How does OCT measure you?', a: 'An OCT scan circles the optic disc with near-infrared light and measures my thickness all the way round, comparing it with healthy people of the same age. Thin sectors are flagged yellow or red. Repeating the scan over years shows whether I am thinning faster than normal ageing.', k: 'oct measure thickness scan' },
      { q: 'What is the ISNT rule?', a: 'In most healthy eyes, the rim of the optic disc (and my thickness around it) is thickest Inferiorly, then Superiorly, then Nasally, and thinnest Temporally. Glaucoma often breaks this pattern by thinning the inferior and superior parts first.', k: 'isnt rule pattern' },
    ],
    related: ['ganglion-cells', 'optic-disc', 'retina', 'macula'],
  },

  'ganglion-cells': {
    name: 'Retinal ganglion cells',
    tagline: 'The cells glaucoma destroys',
    group: 'back',
    hello: "We're the retinal ganglion cells — about 1.2 million of us per eye. We're the final output neurons of the retina, and each of us sends one long fibre all the way to the brain. Glaucoma is, at its core, the slow death of our kind.",
    what: `<p>Neurons in the inner retina. Each collects signals from photoreceptors (via bipolar cells) and sends a single axon — several centimetres long — through the optic nerve to the brain. There are dozens of subtypes, specialised for detail, motion, colour, or even setting your body clock.</p>`,
    role: `<p>They encode the visual scene into electrical spikes that the brain can read. Everything you see passes through them.</p>`,
    glaucoma: `<p>In glaucoma, ganglion cell axons are injured where they pass through the lamina cribrosa at the optic disc — by mechanical stress from pressure, reduced blood flow and other factors. The cells then die by a self-destruct program (<em>apoptosis</em>). In humans they do not regenerate, so the loss is permanent. A large fraction can be lost before a standard visual-field test shows any defect.</p>`,
    fact: 'A special type of ganglion cell contains its own light-sensitive pigment (melanopsin) and tells your brain\'s body clock whether it is day or night.',
    qa: [
      { q: 'Why don\'t you grow back?', a: 'We are central nervous system neurons, like brain cells. In mammals, these neurons do not divide after development, and the environment around injured axons actively inhibits regrowth. Researchers are working on gene therapies and stem cells to change this, but for now loss is permanent.', k: 'grow back regenerate why' },
      { q: 'How many of you can be lost before vision tests notice?', a: 'Studies comparing tissue with visual-field results suggest that a substantial proportion — often quoted as 25–40% in a given area — can be lost before standard automated perimetry detects a defect, because the remaining cells and the brain compensate. That is why structural tests like OCT are so useful.', k: 'how many lost before notice test' },
    ],
    related: ['rnfl', 'optic-disc', 'lamina-cribrosa', 'optic-nerve'],
  },

  'optic-disc': {
    name: 'Optic disc (nerve head)',
    tagline: 'Where 1.2 million fibres leave the eye',
    group: 'nerve',
    hello: "I'm the optic disc — the head of the optic nerve, where all the nerve fibres of the retina turn and dive out of the eye. In glaucoma, I'm where the damage happens and where doctors look for it.",
    what: `<p>A pale, oval disc about <strong>1.5–1.8&nbsp;mm</strong> across, about 15° towards the nose from the centre of vision. The pinkish-orange ring is the <strong>neuroretinal rim</strong> — living nerve fibres. The paler central depression is the <strong>cup</strong>. The central retinal artery and vein enter and leave through its centre.</p>`,
    role: `<p>It is the exit port of the eye's wiring. There are no photoreceptors here, which creates your natural <em>blind spot</em> — about 15° to the side of where you are looking.</p>`,
    glaucoma: `<p>Glaucoma shows up here as <strong>cupping</strong>: as fibres die, the rim thins and the cup enlarges and deepens — usually vertically first. Doctors look for:</p>
      <ul><li>a large or growing <strong>cup-to-disc ratio</strong> (or a big difference between the two eyes),</li>
      <li><strong>rim thinning or notching</strong>, especially at the top and bottom,</li>
      <li>small <strong>disc haemorrhages</strong> at the edge (a sign of active damage),</li>
      <li>visible pores of the lamina cribrosa at the bottom of a deep cup.</li></ul>`,
    fact: 'Each eye has a blind spot big enough to hide a tennis ball held at arm\'s length — you never notice it because the other eye and your brain fill it in.',
    qa: [
      { q: 'What is the cup-to-disc ratio?', a: 'The diameter of the pale central cup divided by the diameter of the whole disc. Many healthy eyes are around 0.3, but it varies: large discs naturally have large cups. A ratio above about 0.6–0.7, a vertical cup larger than the horizontal, a growing cup over time, or a difference of more than about 0.2 between eyes are warning signs.', k: 'cup disc ratio cdr' },
      { q: 'Why is the damage here and not at the drain?', a: 'Pressure pushes equally in every direction inside the eye. The weakest point of the eye wall is where the nerve fibres exit through a sieve (the lamina cribrosa). Pressure deforms that sieve and squeezes the fibres and their blood supply — so the drain causes the problem at the front, but the damage happens at the back.', k: 'why damage here back front' },
      { q: 'Find your blind spot', a: 'Close your left eye and stare at a small cross on a page with your right eye. Put a dot about 8 cm to the right of the cross. Move the page slowly towards and away from you: at about 25–30 cm the dot vanishes — it has landed on me, your optic disc.', k: 'blind spot find test try' },
      { q: 'What is a disc haemorrhage?', a: 'A small, flame-shaped bleed at my edge. It comes and goes within weeks, so it is easy to miss — but it is an important sign that glaucoma may be active or progressing, especially in normal-tension glaucoma.', k: 'haemorrhage hemorrhage bleed drance' },
    ],
    related: ['optic-cup', 'lamina-cribrosa', 'rnfl', 'optic-nerve'],
  },

  'optic-cup': {
    name: 'Optic cup',
    tagline: 'The pale hollow in the centre of the disc',
    group: 'nerve',
    hello: "I'm the optic cup — the pale hollow in the middle of the optic disc. In glaucoma, I grow as the fibres around me die.",
    what: `<p>A central depression in the optic disc where there are no nerve fibres. In a healthy eye it is usually small and round; its size is related to the size of the whole disc.</p>`,
    role: `<p>The cup itself does nothing — it is simply the space left over where the fibres of the disc are not crowded. Its shape and size tell doctors how much rim (living tissue) is left.</p>`,
    glaucoma: `<p>As ganglion cell fibres die, the rim around me thins and I enlarge — "glaucomatous cupping". I also get deeper because the lamina cribrosa below me bows backward. Growth that is <strong>vertical</strong>, <strong>asymmetric</strong> between the eyes, or <strong>progressive</strong> over time strongly suggests glaucoma.</p>`,
    fact: 'A large cup is not always glaucoma — some people simply have big discs with big cups ("physiological cupping"). Change over time is the key.',
    qa: [
      { q: 'Does a big cup mean I have glaucoma?', a: 'Not necessarily. Big discs naturally have big cups. Doctors judge me together with the disc size, the shape of the rim, the other eye, OCT measurements, visual fields and — most importantly — whether I change over time.', k: 'big large cup mean glaucoma' },
      { q: 'Why do you grow vertically first?', a: 'The fibres entering the top and bottom of the disc are the most vulnerable (the lamina cribrosa has larger, weaker pores there). As those die, I widen up and down first, so my vertical diameter grows faster than my horizontal one.', k: 'vertical grow first why' },
    ],
    related: ['optic-disc', 'lamina-cribrosa', 'rnfl'],
  },

  'lamina-cribrosa': {
    name: 'Lamina cribrosa',
    tagline: 'The sieve where glaucoma injures the nerve',
    group: 'nerve',
    hello: "I'm the lamina cribrosa — a sieve of collagen plates at the bottom of the optic disc. All 1.2 million nerve fibres squeeze through my pores. Most experts think this is where glaucoma does its damage.",
    what: `<p>A mesh of about ten stacked, perforated plates of connective tissue spanning the hole in the sclera where the optic nerve leaves. Bundles of nerve fibres and blood vessels pass through its pores.</p>`,
    role: `<p>It supports the nerve fibres as they leave the pressurised eye for the lower-pressure space around the optic nerve (which is filled with cerebrospinal fluid).</p>`,
    glaucoma: `<p>The lamina sits between two pressures: eye pressure in front and cerebrospinal fluid pressure behind. High eye pressure (or relatively low fluid pressure behind) <strong>deforms and bows</strong> the lamina backward, pinching the fibres and their blood supply and blocking the transport of essential molecules along the axons. Its pores are larger at the top and bottom — matching where glaucoma damage usually starts.</p>`,
    fact: '"Lamina cribrosa" is Latin for "sieve-like plate" (cribrum = sieve).',
    qa: [
      { q: 'Why are you the weak spot?', a: 'Everywhere else, the eye wall is solid sclera. Here it is a sieve with hundreds of holes for the nerve fibres — mechanically much weaker. Pressure stretches and bends me, and the fibres passing through feel that strain.', k: 'weak spot why' },
      { q: 'What is the translaminar pressure difference?', a: 'The difference between eye pressure in front of me and cerebrospinal fluid pressure behind me. Some researchers think a low fluid pressure behind me may explain why some people get glaucoma at normal eye pressure — an active research question.', k: 'translaminar csf pressure difference normal tension' },
    ],
    related: ['optic-disc', 'optic-cup', 'optic-nerve', 'ganglion-cells'],
  },

  'optic-nerve': {
    name: 'Optic nerve',
    tagline: 'The cable from eye to brain',
    group: 'nerve',
    hello: "I'm the optic nerve — a cable of about 1.2 million nerve fibres connecting your eye to your brain. Glaucoma is, by definition, a disease of me.",
    what: `<p>A nerve about 4&nbsp;mm thick and roughly 5&nbsp;cm long, running from the back of the eye to the optic chiasm in the brain. Behind the eye its fibres are wrapped in myelin (which makes it thicker), and it is sheathed in the same membranes and fluid that surround the brain.</p>`,
    role: `<p>It carries every visual signal from the retina to the brain. Technically it is part of the central nervous system — a tract of the brain, not a peripheral nerve.</p>`,
    glaucoma: `<p>Glaucoma is called an <strong>optic neuropathy</strong>: progressive loss of the nerve's fibres. Because, like the brain, the optic nerve cannot regenerate, lost fibres mean permanently lost vision. Treatment aims to stop or slow further loss.</p>`,
    fact: 'At the optic chiasm, the fibres from the nose-side half of each retina cross over, so each side of your brain sees the opposite half of the world.',
    qa: [
      { q: 'How does eye pressure damage you?', a: 'Pressure pushes equally on the whole inside of the eye. Where my fibres leave, the eye wall is a sieve — the lamina cribrosa — and it bends backwards under strain. That squeezes my fibres, chokes their blood supply and blocks the transport of vital molecules along them, until the ganglion cells they belong to die. The first to go are usually the fibres passing through the top and bottom of the disc.', k: 'pressure damage how harm hurt lamina mechanism high iop kill' },
      { q: 'Can a damaged optic nerve be repaired?', a: 'Not yet. My fibres are central nervous system axons, which do not regrow after injury in adults. Research into neuroprotection, gene therapy and stem cells is very active, but today the only proven strategy is to prevent further damage — mainly by lowering eye pressure.', k: 'repair fix heal transplant' },
      { q: 'Why am I thicker behind the eye?', a: 'Inside the eye my fibres are bare (unmyelinated) so the retina stays transparent. Right after the lamina cribrosa they get wrapped in myelin insulation, which speeds up the signals but adds bulk — so I roughly double in diameter.', k: 'thicker myelin why' },
    ],
    related: ['optic-disc', 'lamina-cribrosa', 'ganglion-cells'],
  },

  'retinal-vessels': {
    name: 'Retinal blood vessels',
    tagline: 'The inner retina’s blood supply',
    group: 'back',
    hello: "We're the retinal arteries and veins. We branch out from the centre of the optic disc to feed the inner layers of the retina. The brighter, thinner ones are arteries; the darker, wider ones are veins.",
    what: `<p>The central retinal artery enters the eye through the optic nerve and splits into four main branches that arch around the macula. Veins run alongside and leave through the disc. The fovea itself is free of vessels.</p>`,
    role: `<p>They nourish the inner two-thirds of the retina, including the ganglion cells. The outer retina (photoreceptors) is fed by the choroid instead.</p>`,
    glaucoma: `<ul><li>Good blood flow matters: <strong>low blood pressure</strong> (especially at night) and poor blood flow regulation may contribute to glaucoma, particularly normal-tension glaucoma.</li>
      <li>Retinal vessel diseases (diabetic retinopathy, vein occlusions) starve the retina of oxygen, which triggers abnormal vessel growth on the iris — <strong>neovascular glaucoma</strong>.</li>
      <li>In a deep cup, vessels bend sharply over the rim ("bayoneting").</li></ul>`,
    fact: 'The retina is the only place in the body where doctors can look directly at blood vessels and nerve tissue without any incision.',
    qa: [
      { q: 'How is blood pressure related to glaucoma?', a: 'What matters to the nerve is perfusion pressure: roughly blood pressure minus eye pressure. Very low blood pressure — especially dips during sleep, sometimes caused by over-treated hypertension — can starve the optic nerve. Never change blood pressure medicines without your doctor, but do mention glaucoma to them.', k: 'blood pressure perfusion low high' },
      { q: 'How do you cause neovascular glaucoma?', a: 'When we are blocked or damaged (diabetes, vein occlusion), the retina becomes oxygen-starved and releases a growth signal called VEGF. It drifts forward and makes fragile new vessels grow on the iris and over the drain, blocking it. Anti-VEGF injections and laser treatment of the retina switch the signal off.', k: 'neovascular vegf diabetes' },
    ],
    related: ['optic-disc', 'retina', 'choroid'],
  },

  choroid: {
    name: 'Choroid',
    tagline: 'The blood-rich layer behind the retina',
    group: 'coats',
    hello: "I'm the choroid — a dense layer of blood vessels between the retina and the sclera. I have one of the highest blood flows of any tissue in the body.",
    what: `<p>A pigmented, spongy layer of blood vessels, part of the uvea (with the iris and ciliary body). It lies between the retina and the sclera and is about 0.2–0.3&nbsp;mm thick.</p>`,
    role: `<p>It feeds the hungry outer retina, especially the photoreceptors, and helps cool it. Its pigment absorbs stray light, like the black paint inside a camera.</p>`,
    glaucoma: `<p>The space between the choroid and the sclera (the <em>suprachoroidal space</em>) is the last stretch of the uveoscleral "back door" outflow route. Some surgical devices drain fluid into it.</p>`,
    fact: 'Many animals that see well at night have a reflective layer in their choroid (the tapetum) — that is why cats\' eyes shine in headlights.',
    qa: [{ q: 'Why are you so full of blood?', a: 'The photoreceptors are among the most energy-hungry cells in the body, constantly recycling visual pigments. I deliver oxygen and nutrients at a very high rate — and carry away the heat that light and metabolism produce.', k: 'blood why flow' }],
    related: ['retina', 'sclera', 'uveoscleral-pathway'],
  },

  'ora-serrata': {
    name: 'Ora serrata',
    tagline: 'The jagged edge where the retina ends',
    group: 'back',
    hello: "I'm the ora serrata — the serrated edge where the light-sensing retina stops and the ciliary body begins. You're at the far edge of vision here.",
    what: `<p>The scalloped junction between the retina and the flat rear part of the ciliary body (pars plana), about 6–8&nbsp;mm behind the limbus.</p>`,
    role: `<p>It marks the boundary of the light-sensitive retina. The retina's outer pigmented layer continues forward as the lining of the ciliary body — the same cell layers that make aqueous humour.</p>`,
    glaucoma: `<p>The far periphery of your vision is processed here — and the far periphery is where glaucoma often begins stealing vision unnoticed.</p>`,
    fact: '"Ora serrata" is Latin for "serrated edge".',
    qa: [{ q: 'What happens to the retina beyond you?', a: 'It continues forward as a non-light-sensing double layer of cells that covers the ciliary body and the back of the iris. Remarkably, those continuation cells are the ones that produce aqueous humour.', k: 'beyond continue edge' }],
    related: ['retina', 'ciliary-body'],
  },

  'extraocular-muscles': {
    name: 'Eye muscles',
    tagline: 'Six muscles that aim the eye',
    group: 'around',
    hello: "We're the six extraocular muscles — four straight (rectus) muscles and two oblique ones. We move your eye with astonishing speed and precision.",
    what: `<p>The superior, inferior, medial and lateral rectus muscles, and the superior and inferior oblique muscles. They attach to the sclera and work in coordinated pairs.</p>`,
    role: `<p>They point both eyes at exactly the same spot, track moving objects and make rapid jumps (saccades) of up to around 700° per second.</p>`,
    glaucoma: `<p>Not directly involved, but in <em>thyroid eye disease</em> the muscles swell, which can raise eye pressure — and make pressure readings jump when looking upward.</p>`,
    fact: 'Your eyes make about 3 saccades every second — over 100,000 per day — and your brain blanks out the blur during each one.',
    qa: [{ q: 'Do you affect eye pressure?', a: 'Normally only slightly and briefly. But swollen muscles (as in thyroid eye disease) can squeeze the eye and raise the pressure in its veins, which can raise eye pressure.', k: 'pressure affect thyroid' }],
    related: ['sclera', 'optic-nerve'],
  },
};

/** Where am I? regions map onto entries above. */
export const REGION_ENTRY = {
  outside: 'outside',
  cornea: 'cornea',
  sclera: 'sclera',
  'ciliary-body': 'ciliary-body',
  lens: 'lens',
  iris: 'iris',
  choroid: 'choroid',
  retina: 'retina',
  'anterior-chamber': 'anterior-chamber',
  'drainage-angle': 'drainage-angle',
  'posterior-chamber': 'posterior-chamber',
  vitreous: 'vitreous',
  'optic-nerve': 'optic-nerve',
};
