/**
 * DIAGNOSIS CLINIC — try the real tests on the virtual patient from the Glaucoma Lab.
 */
import { TESTS, DIAGNOSIS_INTRO, RISK_FACTORS, SCREENING } from '../content/diagnosis.js';
import { TYPES } from '../content/glaucoma.js';
import { SCENARIOS } from '../sim/PressureModel.js';
import { el, icon } from './dom.js';
import { drawDiscPhoto, drawWideFundus, drawOCT, drawGonio, drawTonometer } from './clinicViz.js';
import { fieldFor, drawFieldMap, fieldIndices } from './fieldViz.js';

// typical central corneal thickness per patient (µm) — illustrative
const CCT = { healthy: 550, oht: 590, poag: 535, ntg: 512, acute: 560, chronicClosure: 548, pigmentary: 545, pxf: 538, neovascular: 550, uveitic: 552, steroid: 548, congenital: 600 };

export class Clinic {
  constructor(root, { model, fibres, vessels, onOpenLab }) {
    this.model = model;
    this.fibres = fibres;
    this.vessels = vessels;
    this.onOpenLab = onOpenLab;
    this.page = 'intro';
    this.node = el(`<div id="clinic" class="overlay hidden" role="dialog" aria-label="Diagnosis clinic">
      <div class="sheet glass">
        <div class="sheet-head">
          <div class="grow"><span class="badge">Diagnosis Clinic</span><h2>How glaucoma is caught</h2><div class="sub" data-k="patient"></div></div>
          <button class="btn small" data-act="lab">${icon('flask')} Change patient in the Lab</button>
          <button class="icon-btn" data-act="close" aria-label="Close">${icon('x')}</button>
        </div>
        <div class="sheet-body">
          <nav class="sheet-nav" data-k="nav"></nav>
          <div class="sheet-main" data-k="main"></div>
        </div>
      </div>
    </div>`);
    root.appendChild(this.node);
    this.main = this.node.querySelector('[data-k="main"]');
    this.renderNav();
    this.node.addEventListener('click', (e) => {
      if (e.target === this.node) this.close();
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.act === 'close') this.close();
      if (b.dataset.act === 'lab') {
        this.close();
        this.onOpenLab?.();
      }
      if (b.dataset.page) this.show(b.dataset.page);
      if (b.dataset.act === 'puff') this.puff();
      if (b.dataset.act === 'compare') this.toggleCompare();
      if (b.dataset.act === 'demo') this.startDemo();
    });
    this.node.addEventListener('input', (e) => {
      if (e.target.dataset.k === 'cct') this.updatePachy(+e.target.value);
      if (e.target.closest('.risk-list')) this.updateRisk();
    });
  }

  get isOpen() {
    return !this.node.classList.contains('hidden');
  }
  open(page) {
    this.node.classList.remove('hidden');
    this.show(page || this.page);
  }
  close() {
    this.node.classList.add('hidden');
    this.stopDemo();
    this.onClose?.();
  }

  renderNav() {
    const items = [
      ['intro', 'Overview', 'Why several tests'],
      ...Object.entries(TESTS).map(([k, t]) => [k, t.name, t.sub]),
      ['risk', 'Am I at risk?', 'Risk factors'],
      ['screening', 'Getting checked', 'When & how often'],
    ];
    this.node.querySelector('[data-k="nav"]').innerHTML =
      `<div class="nav-group">Start here</div>` +
      items
        .map(([k, n, s], i) => `${i === 1 ? '<div class="nav-group">The tests</div>' : ''}${i === 7 ? '<div class="nav-group">You</div>' : ''}<button data-page="${k}"><span>${n}</span><small>${s}</small></button>`)
        .join('');
  }

  patientLine() {
    const m = this.model;
    const T = TYPES[m.id];
    const sc = SCENARIOS[m.id];
    const unit = sc.unit === 'hours' ? 'hour' : 'year';
    return `Patient: <strong>${T.name}</strong> · ${unit} ${m.t.toFixed(1)} · pressure ${m.state.IOP.toFixed(0)} mmHg`;
  }

  show(page) {
    this.stopDemo();
    this.page = page;
    for (const b of this.node.querySelectorAll('.sheet-nav button')) b.classList.toggle('active', b.dataset.page === page);
    this.node.querySelector('[data-k="patient"]').innerHTML = this.patientLine();
    const m = this.model;
    const v = { ...m.state, damage: m.damage };
    const T = TESTS[page];
    const think = T ? `<div class="think-box"><b>Think about it</b>${T.think}</div>` : '';
    const textCol = T ? `<h2>${T.name}</h2><p class="muted">${T.sub}</p><h3>What happens</h3>${T.what}<h3>What it shows</h3>${T.shows}<h3>Limits</h3>${T.limits}${think}` : '';
    if (page === 'intro') {
      this.main.innerHTML = `<h2>Catching a silent disease</h2>${DIAGNOSIS_INTRO}
        <div class="patient-bar">${icon('flask')} The tests on the following pages are performed on the patient currently loaded in the Glaucoma Lab: <strong>${TYPES[m.id].name}</strong>. Change patient or move time forward in the Lab, then come back and compare.</div>`;
    } else if (page === 'tonometry') {
      this.main.innerHTML = `<div class="two-col"><div>${textCol}</div><div>
        <div class="viz"><canvas data-k="tono" width="640" height="420"></canvas>
        <div class="viz-cap">An air-puff tonometer flattens the cornea for a split second and measures how hard it had to push.</div>
        <div class="panel-actions"><button class="btn primary small" data-act="puff">${icon('gauge')} Measure this patient</button></div></div>
        <div class="viz" style="margin-top:12px"><div class="tiny">Reading</div><div class="readout" data-k="tread">—</div><div class="tiny" data-k="tnote">Normal range ≈ 10–21 mmHg</div></div>
      </div></div>`;
      drawTonometer(this.main.querySelector('[data-k="tono"]'), 0, m.state.IOP);
    } else if (page === 'pachymetry') {
      const cct = CCT[m.id] ?? 545;
      this.main.innerHTML = `<div class="two-col"><div>${textCol}</div><div>
        <div class="viz"><div class="tiny">This patient's central corneal thickness</div><div class="readout">${cct} µm</div>
        <p class="tiny">Average ≈ 540–550 µm</p>
        <h3>Experiment</h3><p class="muted" style="font-size:13.5px">Imagine the same true eye pressure measured through corneas of different thickness. Drag the slider:</p>
        <input type="range" min="460" max="640" value="${cct}" data-k="cct" aria-label="Corneal thickness" />
        <div data-k="pachyout" style="margin-top:8px"></div></div>
      </div></div>`;
      this.updatePachy(cct);
    } else if (page === 'ophthalmoscopy') {
      this.main.innerHTML = `<div class="two-col"><div>${textCol}</div><div>
        <div class="viz"><canvas data-k="disc" width="560" height="560"></canvas><div class="viz-cap" data-k="disccap"></div>
        <div class="panel-actions"><button class="btn small" data-act="compare">Compare with a healthy disc</button></div></div>
        <div class="viz" style="margin-top:12px"><canvas data-k="wide" width="560" height="560"></canvas><div class="viz-cap">Wide view: optic disc (right), macula (centre-left), the vessel arcades — and the silvery nerve-fibre sheen, which fades where fibres are lost.</div></div>
      </div></div>`;
      this.compare = false;
      this.drawDisc();
      drawWideFundus(this.main.querySelector('[data-k="wide"]'), { vessels: this.vessels, fibres: this.fibres, damage: m.damage, haemorrhage: !!m.state.discHaemorrhage });
    } else if (page === 'oct') {
      this.main.innerHTML = `<div class="two-col"><div>${textCol}</div><div>
        <div class="viz"><canvas data-k="oct" width="760" height="420"></canvas><div class="viz-cap">Nerve-fibre thickness measured in a circle around the disc (white line) against the range of healthy eyes: green normal, yellow borderline, red outside normal limits.</div></div>
        <div class="viz" style="margin-top:12px" data-k="octsum"></div>
      </div></div>`;
      const r = drawOCT(this.main.querySelector('[data-k="oct"]'), this.fibres, m.damage);
      const col = { green: 'var(--good)', yellow: 'var(--warn)', red: 'var(--bad)' };
      this.main.querySelector('[data-k="octsum"]').innerHTML = `<div class="tiny">Average RNFL thickness</div><div class="readout" style="color:${col[r.cls]}">${Math.round(r.avg)} µm</div>
        <div class="related" style="margin-top:10px">${['S', 'N', 'I', 'T'].map((k) => `<span class="chip" style="border-color:${col[r.sectors[k].cls]}">${{ S: 'Superior', N: 'Nasal', I: 'Inferior', T: 'Temporal' }[k]}: ${r.sectors[k].cls}</span>`).join('')}</div>`;
    } else if (page === 'perimetry') {
      const field = fieldFor(this.fibres, m.damage);
      const idx = fieldIndices(field);
      this.main.innerHTML = `<div class="two-col"><div>${textCol}</div><div>
        <div class="viz"><canvas data-k="field" width="560" height="560"></canvas>
        <div class="viz-cap">Right eye, central 30°. Dark = faint lights not seen. Mean deviation <strong>${idx.md.toFixed(1)} dB</strong> · VFI <strong>${Math.round(idx.vfi)}%</strong>. The black spot on the right is the normal blind spot.</div></div>
        <div class="viz" style="margin-top:12px"><h3 style="margin-top:0">Feel what the test is like</h3>
          <p class="muted" style="font-size:13.5px">Cover one eye, keep staring at the central dot, and press <span class="kbd">Space</span> (or tap) whenever a light flashes anywhere. <em>This demo cannot detect glaucoma</em> — screens are not calibrated, and real machines measure the faintest light you can see.</p>
          <div style="position:relative"><canvas data-k="demo" width="560" height="360" style="background:#000;touch-action:manipulation"></canvas></div>
          <div class="panel-actions"><button class="btn primary small" data-act="demo">${icon('target')} Start demo test</button><span class="tiny" data-k="demostat"></span></div>
        </div>
      </div></div>`;
      drawFieldMap(this.main.querySelector('[data-k="field"]').getContext('2d'), field, 560, { labels: true });
      this.drawDemoIdle();
    } else if (page === 'gonioscopy') {
      this.main.innerHTML = `<div class="two-col"><div>${textCol}</div><div>
        <div class="viz"><canvas data-k="gonio" width="560" height="560"></canvas><div class="viz-cap" data-k="goniocap"></div></div>
      </div></div>`;
      const r = drawGonio(this.main.querySelector('[data-k="gonio"]'), v);
      const desc = ['closed — no structures visible', 'very narrow — only Schwalbe’s line visible', 'narrow — meshwork partly visible', 'open — scleral spur visible', 'wide open — ciliary body band visible'][r.grade];
      this.main.querySelector('[data-k="goniocap"]').innerHTML = `Through the mirror, from bottom to top: iris, ciliary body band (dark), scleral spur (white line), pigmented trabecular meshwork, Schwalbe’s line. <br><strong>Shaffer grade ${r.grade}</strong>: ${desc}.`;
    } else if (page === 'risk') {
      this.main.innerHTML = `<h2>Am I at risk?</h2><p class="muted">Tick what applies to you. This is not a diagnosis — it is a conversation starter for your next eye exam.</p>
        <div class="risk-list">${RISK_FACTORS.map((r) => `<label><input type="checkbox" value="${r.id}" /><span><strong>${r.label}</strong><br><span class="tiny">${r.detail}</span></span></label>`).join('')}</div>
        <div class="fact" data-k="riskout" style="margin-top:12px">Tick any boxes that apply.</div>`;
    } else if (page === 'screening') {
      this.main.innerHTML = `<h2>Getting checked</h2>${SCREENING}<div class="emergency">If you ever have sudden eye pain with a red eye, blurred vision, halos around lights or nausea, seek emergency eye care immediately.</div>`;
    }
    this.main.scrollTop = 0;
  }

  puff() {
    const c = this.main.querySelector('[data-k="tono"]');
    if (!c) return;
    const reading = this.model.state.IOP + (Math.random() - 0.5) * 2;
    const t0 = performance.now();
    const step = () => {
      const t = (performance.now() - t0) / 1400;
      drawTonometer(c, Math.min(1, t), reading);
      if (t < 1) requestAnimationFrame(step);
      else {
        const r = this.main.querySelector('[data-k="tread"]');
        if (r) {
          r.textContent = `${reading.toFixed(0)} mmHg`;
          r.style.color = reading > 30 ? 'var(--bad)' : reading > 21 ? 'var(--warn)' : 'var(--good)';
          const note = this.main.querySelector('[data-k="tnote"]');
          note.innerHTML =
            reading > 21
              ? 'Above the usual range. High pressure is a risk factor — but is the nerve damaged? Check the disc, OCT and field.'
              : 'In the normal range — but remember normal-tension glaucoma. Pressure alone cannot rule glaucoma out.';
        }
      }
    };
    requestAnimationFrame(step);
  }

  updatePachy(cct) {
    const out = this.main.querySelector('[data-k="pachyout"]');
    if (!out) return;
    const truePressure = this.model.state.IOP;
    // illustrative: about 0.5 mmHg per 10 µm away from average
    const measured = truePressure + ((cct - 545) / 10) * 0.5;
    out.innerHTML = `<div class="stat-row" style="margin:6px 0"><div class="stat"><div class="label">Cornea</div><div class="value">${cct}<small>µm</small></div></div>
      <div class="stat"><div class="label">Tonometer reads</div><div class="value">${measured.toFixed(0)}<small>mmHg</small></div><div class="note">true pressure ≈ ${truePressure.toFixed(0)}</div></div></div>
      <p class="tiny">${cct < 520 ? 'A thin cornea makes the reading too low — real pressure may be underestimated.' : cct > 580 ? 'A thick cornea makes the reading too high — the eye may be safer than the number suggests.' : 'Close to average: the reading is fairly representative.'}</p>`;
  }

  drawDisc() {
    const c = this.main.querySelector('[data-k="disc"]');
    if (!c) return;
    const m = this.model;
    const dmg = this.compare ? 0 : m.damage;
    drawDiscPhoto(c, { vessels: this.vessels, fibres: this.fibres, damage: dmg, haemorrhage: !this.compare && !!m.state.discHaemorrhage });
    const cap = this.main.querySelector('[data-k="disccap"]');
    cap.innerHTML = this.compare
      ? 'A <strong>healthy</strong> disc for comparison: thick orange-pink rim, small round cup.'
      : `This patient's optic disc. ${m.damage > 0.25 ? 'Notice the enlarged, vertically stretched pale cup and the thin rim.' : 'The rim looks healthy.'}${m.state.discHaemorrhage ? ' Can you spot the small splinter haemorrhage at the lower edge?' : ''}`;
  }

  toggleCompare() {
    this.compare = !this.compare;
    this.drawDisc();
    const b = this.main.querySelector('[data-act="compare"]');
    if (b) b.textContent = this.compare ? 'Show this patient' : 'Compare with a healthy disc';
  }

  updateRisk() {
    const n = this.main.querySelectorAll('.risk-list input:checked').length;
    const out = this.main.querySelector('[data-k="riskout"]');
    out.innerHTML =
      n === 0
        ? 'No risk factors ticked. Regular comprehensive eye exams are still the best protection — glaucoma can occur without known risk factors.'
        : n < 3
          ? `<b>${n} risk factor${n > 1 ? 's' : ''}</b>Mention ${n > 1 ? 'these' : 'this'} at your next eye exam and ask whether your optic nerve has been checked.`
          : `<b>${n} risk factors</b>Several factors apply to you. Consider booking a comprehensive eye examination that includes an optic nerve check — glaucoma is silent, and early detection protects sight.`;
  }

  // ------------------------------------------------------------- demo perimetry
  drawDemoIdle() {
    const c = this.main.querySelector('[data-k="demo"]');
    if (!c) return;
    const g = c.getContext('2d');
    g.fillStyle = '#000';
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = '#ffbd4a';
    g.beginPath();
    g.arc(c.width / 2, c.height / 2, 5, 0, Math.PI * 2);
    g.fill();
  }

  startDemo() {
    const c = this.main.querySelector('[data-k="demo"]');
    if (!c) return;
    this.stopDemo();
    const g = c.getContext('2d');
    const pts = [];
    for (let y = -2; y <= 2; y++) for (let x = -3; x <= 3; x++) if (!(x === 0 && y === 0)) pts.push([x, y]);
    pts.sort(() => Math.random() - 0.5);
    const results = new Map();
    let i = 0;
    let current = null;
    let falsePos = 0;
    const stat = this.main.querySelector('[data-k="demostat"]');
    const respond = () => {
      if (current && !current.answered) {
        current.answered = true;
        results.set(current.key, true);
      } else falsePos++;
    };
    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        respond();
      }
    };
    const onTap = () => respond();
    window.addEventListener('keydown', onKey);
    c.addEventListener('pointerdown', onTap);
    const base = () => {
      g.fillStyle = '#000';
      g.fillRect(0, 0, c.width, c.height);
      g.fillStyle = '#ffbd4a';
      g.beginPath();
      g.arc(c.width / 2, c.height / 2, 5, 0, Math.PI * 2);
      g.fill();
    };
    const next = () => {
      if (i >= pts.length) return finish();
      const [x, y] = pts[i++];
      const px = c.width / 2 + x * (c.width / 7.4);
      const py = c.height / 2 + y * (c.height / 5.4);
      current = { key: `${x},${y}`, answered: false };
      results.set(current.key, false);
      base();
      const bright = 90 + Math.random() * 120;
      g.fillStyle = `rgb(${bright},${bright},${bright})`;
      g.beginPath();
      g.arc(px, py, 4, 0, Math.PI * 2);
      g.fill();
      this.demoTimers.push(setTimeout(base, 200));
      this.demoTimers.push(setTimeout(next, 1100 + Math.random() * 700));
      stat.textContent = `Point ${i} of ${pts.length}`;
    };
    const finish = () => {
      window.removeEventListener('keydown', onKey);
      c.removeEventListener('pointerdown', onTap);
      g.fillStyle = '#0b1420';
      g.fillRect(0, 0, c.width, c.height);
      let seen = 0;
      for (const [key, ok] of results) {
        const [x, y] = key.split(',').map(Number);
        const px = c.width / 2 + x * (c.width / 7.4);
        const py = c.height / 2 + y * (c.height / 5.4);
        g.fillStyle = ok ? '#e8f4ff' : '#1b2633';
        g.fillRect(px - 22, py - 22, 44, 44);
        if (ok) seen++;
      }
      g.fillStyle = '#ffbd4a';
      g.beginPath();
      g.arc(c.width / 2, c.height / 2, 5, 0, Math.PI * 2);
      g.fill();
      stat.innerHTML = `You saw ${seen} of ${pts.length} flashes${falsePos ? ` · ${falsePos} presses without a flash (real machines track these "false positives")` : ''}. Remember: a demo, not a diagnosis.`;
      this.demoCleanup = null;
    };
    this.demoTimers = [];
    this.demoCleanup = () => {
      window.removeEventListener('keydown', onKey);
      c.removeEventListener('pointerdown', onTap);
    };
    stat.textContent = 'Get ready… stare at the yellow dot';
    base();
    this.demoTimers.push(setTimeout(next, 1500));
  }

  stopDemo() {
    for (const t of this.demoTimers || []) clearTimeout(t);
    this.demoTimers = [];
    this.demoCleanup?.();
    this.demoCleanup = null;
  }
}
