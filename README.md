# Glaucoma Explorer

**An interactive 3D journey inside the human eye** — explore its anatomy, watch the eye's fluid flow and drain, and see how every type of glaucoma damages the optic nerve, how it is detected and how it is treated.

Open it in any modern browser: no installs, no plugins, works on desktop and phones.

## What you can do

| Section | What it does |
| --- | --- |
| **Explore** | Orbit around a true-scale 3D eye, or switch to **Swim** mode and move through it in first person (WASD + mouse, or a touch joystick). Point at any structure — 30+ of them — to learn what it is, what it does and its role in glaucoma. |
| **Ask me** | Every structure "talks": ask it questions in your own words. Answers come from a hand-checked knowledge base and run entirely in your browser. |
| **Tours** | Three narrated camera journeys (*The journey of a drop*, *From light to sight*, *How glaucoma steals sight*) with "predict first" questions that make you think before you're told. |
| **Glaucoma Lab** | Pick a patient — open-angle, normal-tension, acute & chronic angle closure, pigmentary, pseudoexfoliation, neovascular, uveitic, steroid-induced, congenital, or ocular hypertension — run time forward and try treatments. The 3D eye responds: the meshwork clogs, the iris bulges, droplets queue up, the pressure climbs, nerve fibres die, the optic cup deepens, and the visual field shrinks. You can even see through the patient's eye. |
| **Clinic** | Perform the real tests on the Lab patient: tonometry, pachymetry, optic-disc photography, OCT, visual fields (with a hands-on demo) and gonioscopy. |
| **Library** | All content in readable form, searchable — also the fallback when 3D isn't available. |

## How it works (the interesting bits)

- **Procedural anatomy** – there are no 3D model files. Every structure is generated in code from anatomical measurements in [`src/config/anatomy.js`](src/config/anatomy.js) (1 unit = 1 mm). Most of the eye is rotationally symmetric, so parts are made by spinning 2D outlines around the optical axis ("lathe" geometry).
- **One source of truth for the back of the eye** – [`src/eye/fundusData.js`](src/eye/fundusData.js) traces ~1,400 nerve-fibre bundles from ganglion cells to the optic disc, following the real arcuate pattern. The 3D glowing fibres, the optic-cup shape, the OCT thickness curve and the visual-field map are *all computed from those same fibres*, so they always agree — like in a real patient.
- **The pressure model** – [`src/sim/PressureModel.js`](src/sim/PressureModel.js) uses the Goldmann equation `IOP = (F − U) / C + EVP`. Each glaucoma type and each treatment changes one of those terms; nerve damage accumulates when pressure exceeds what that nerve can tolerate.
- **Fluid flow** – [`src/sim/AqueousFlow.js`](src/sim/AqueousFlow.js) moves thousands of droplets along the real route of aqueous humour, queuing them at blockages.
- **Solid cross-sections** – [`src/scene/SectionCaps.js`](src/scene/SectionCaps.js) uses the GPU stencil buffer to fill the cut surfaces when the eye is sliced open, like a textbook diagram.

## Run it locally

```bash
npm install
npm run dev      # open the printed http://localhost:5173 address
npm run build    # production build in dist/
```

## Publish it for everyone (GitHub Pages)

1. In the repository on GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Merge to `main`. The workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and publishes the site to `https://<your-username>.github.io/Glaucoma_Explorer/`.

## Disclaimer

Glaucoma Explorer is an educational project. It simplifies anatomy and uses an illustrative model; it is not a medical device and not medical advice. If you have sudden eye pain, a red eye, blurred vision or halos around lights, seek emergency eye care.
