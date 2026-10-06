/**
 * LIBRARY — everything in readable form (also a fallback when 3D isn't available).
 */
import { PARTS, GROUPS } from '../content/anatomy.js';
import { TYPES, OTHER_TYPES, GLAUCOMA_INTRO, EMERGENCY } from '../content/glaucoma.js';
import { TESTS, DIAGNOSIS_INTRO } from '../content/diagnosis.js';
import { TREATMENT_INFO, TREATMENT_INTRO, DROP_TIPS, FUTURE } from '../content/treatments.js';
import { FAQ, DISCLAIMER } from '../content/faq.js';
import { el, icon, stripHtml } from './dom.js';

export class Library {
  constructor(root, { onPart }) {
    this.onPart = onPart;
    this.section = 'anatomy';
    this.node = el(`<div id="library" class="overlay hidden" role="dialog" aria-label="Library">
      <div class="sheet glass">
        <div class="sheet-head"><div class="grow"><span class="badge">Library</span><h2>Everything, in one place</h2><div class="sub">Read about every structure, every type of glaucoma, the tests and the treatments.</div></div>
          <input class="lib-search" type="search" placeholder="Search…" aria-label="Search the library" />
          <button class="icon-btn" data-act="close" aria-label="Close">${icon('x')}</button></div>
        <div class="sheet-body"><nav class="sheet-nav" data-k="nav"></nav><div class="sheet-main" data-k="main"></div></div>
      </div></div>`);
    root.appendChild(this.node);
    this.main = this.node.querySelector('[data-k="main"]');
    this.search = this.node.querySelector('.lib-search');
    const nav = [
      ['anatomy', 'Anatomy', 'Every part of the eye'],
      ['types', 'Types of glaucoma', 'Open, closed, secondary, childhood'],
      ['diagnosis', 'Diagnosis', 'How it is found'],
      ['treatment', 'Treatment', 'Drops, laser, surgery'],
      ['faq', 'Questions', 'Common questions'],
      ['about', 'About', 'Sources & disclaimer'],
    ];
    this.node.querySelector('[data-k="nav"]').innerHTML = nav.map(([k, n, s]) => `<button data-sec="${k}"><span>${n}</span><small>${s}</small></button>`).join('');
    this.node.addEventListener('click', (e) => {
      if (e.target === this.node) this.close();
      const b = e.target.closest('[data-sec],[data-act],[data-part]');
      if (!b) return;
      if (b.dataset.act === 'close') this.close();
      if (b.dataset.sec) {
        this.search.value = '';
        this.show(b.dataset.sec);
      }
      if (b.dataset.part) {
        this.close();
        this.onPart?.(b.dataset.part);
      }
    });
    this.search.addEventListener('input', () => this.runSearch(this.search.value));
  }

  get isOpen() {
    return !this.node.classList.contains('hidden');
  }
  open(sec) {
    this.node.classList.remove('hidden');
    this.show(sec || this.section);
  }
  close() {
    this.node.classList.add('hidden');
    this.onClose?.();
  }

  show(sec) {
    this.section = sec;
    for (const b of this.node.querySelectorAll('.sheet-nav button')) b.classList.toggle('active', b.dataset.sec === sec);
    const m = this.main;
    if (sec === 'anatomy') {
      const byGroup = {};
      for (const [id, p] of Object.entries(PARTS)) (byGroup[p.group] ||= []).push([id, p]);
      m.innerHTML = `<h2>Anatomy of the eye</h2><p class="muted">Tap a card to fly there in 3D and open its information.</p>${Object.entries(GROUPS)
        .filter(([g]) => byGroup[g])
        .map(
          ([g, name]) => `<h3>${name}</h3><div class="lib-grid">${byGroup[g]
            .map(([id, p]) => `<div class="lib-card" data-part="${id}" role="button" tabindex="0"><h4>${p.name}</h4><div class="lib-tag">${p.tagline}</div></div>`)
            .join('')}</div>`,
        )
        .join('')}`;
    } else if (sec === 'types') {
      m.innerHTML = `<h2>Types of glaucoma</h2>${GLAUCOMA_INTRO}<div class="emergency">${EMERGENCY}</div>${Object.entries(TYPES)
        .filter(([id]) => id !== 'healthy')
        .map(
          ([, t]) => `<div class="lib-card"><span class="badge ${t.emergency ? 'danger' : ''}">${t.kind}</span><h4 style="margin-top:6px">${t.name}</h4>${t.summary}
          ${['mechanism', 'who', 'symptoms', 'detection', 'treatment'].filter((k) => t[k]).map((k) => `<details class="more"><summary>${{ mechanism: 'What goes wrong', who: 'Who gets it', symptoms: 'Symptoms', detection: 'How it is found', treatment: 'Treatment' }[k]}</summary>${t[k]}</details>`).join('')}</div>`,
        )
        .join('')}<h3>Other forms</h3>${OTHER_TYPES.map((o) => `<div class="lib-card"><h4>${o.name}</h4><p style="margin:0">${o.text}</p></div>`).join('')}`;
    } else if (sec === 'diagnosis') {
      m.innerHTML = `<h2>How glaucoma is found</h2>${DIAGNOSIS_INTRO}${Object.values(TESTS)
        .map((t) => `<div class="lib-card"><h4>${t.name} <span class="tiny">· ${t.sub}</span></h4>${t.what}${t.shows}<p class="tiny">${stripHtml(t.limits)}</p></div>`)
        .join('')}`;
    } else if (sec === 'treatment') {
      m.innerHTML = `<h2>Treatment</h2>${TREATMENT_INTRO}${Object.values(TREATMENT_INFO)
        .map((t) => `<div class="lib-card"><span class="badge">${t.kind}</span> <span class="badge good">${t.term}</span><h4 style="margin-top:6px">${t.name}</h4><p class="tiny" style="margin:0 0 6px">${t.examples}</p><p style="margin:0 0 6px">${t.how}</p><p class="tiny" style="margin:0">Possible side effects: ${t.side}</p></div>`)
        .join('')}<h3>Using eye drops well</h3>${DROP_TIPS}<h3>What's coming next</h3>${FUTURE}`;
    } else if (sec === 'faq') {
      m.innerHTML = `<h2>Common questions</h2>${FAQ.map((f) => `<details class="faq-item"><summary>${f.q}</summary><p>${f.a}</p></details>`).join('')}`;
    } else if (sec === 'about') {
      m.innerHTML = `<h2>About Glaucoma Explorer</h2>
        <p>An interactive, open educational project. The eye is generated procedurally from anatomical measurements at true scale (1 unit = 1 mm); tiny structures such as Schlemm's canal and retinal vessels are slightly enlarged so they can be explored.</p>
        <p>The simulation uses the <strong>Goldmann equation</strong> for eye pressure, IOP = (F − U)/C + EVP, with typical published values, and a simple dose model of optic-nerve damage. The nerve-fibre pattern, the optic-disc cupping, the OCT curve and the visual-field map are all computed from the same set of simulated nerve fibres, so they always agree with each other — just as they do in a real patient.</p>
        <h3>Disclaimer</h3><div class="emergency">${DISCLAIMER}</div>
        <h3>Want to learn more?</h3><p>Reliable sources include national eye institutes, glaucoma research foundations and professional ophthalmology societies in your country. Ask your eye-care professional for material they trust.</p>`;
    }
    m.scrollTop = 0;
  }

  runSearch(q) {
    q = q.trim().toLowerCase();
    if (q.length < 2) return this.show(this.section);
    const hits = [];
    for (const [id, p] of Object.entries(PARTS)) {
      const text = `${p.name} ${p.tagline} ${stripHtml(p.what)} ${stripHtml(p.glaucoma)}`.toLowerCase();
      if (text.includes(q)) hits.push(`<div class="lib-card" data-part="${id}" role="button" tabindex="0"><span class="badge">Anatomy</span><h4 style="margin-top:6px">${p.name}</h4><div class="lib-tag">${p.tagline}</div></div>`);
    }
    for (const t of Object.values(TYPES)) {
      if (`${t.name} ${stripHtml(t.summary)} ${t.short}`.toLowerCase().includes(q)) hits.push(`<div class="lib-card"><span class="badge">Glaucoma type</span><h4 style="margin-top:6px">${t.name}</h4>${t.summary}</div>`);
    }
    for (const t of Object.values(TESTS)) {
      if (`${t.name} ${t.sub} ${stripHtml(t.what)}`.toLowerCase().includes(q)) hits.push(`<div class="lib-card"><span class="badge">Test</span><h4 style="margin-top:6px">${t.name}</h4>${t.what}</div>`);
    }
    for (const t of Object.values(TREATMENT_INFO)) {
      if (`${t.name} ${t.examples} ${t.how}`.toLowerCase().includes(q)) hits.push(`<div class="lib-card"><span class="badge">Treatment</span><h4 style="margin-top:6px">${t.name}</h4><p style="margin:0">${t.how}</p></div>`);
    }
    for (const f of FAQ) {
      if (`${f.q} ${f.a}`.toLowerCase().includes(q)) hits.push(`<div class="lib-card"><span class="badge">Question</span><h4 style="margin-top:6px">${f.q}</h4><p style="margin:0">${f.a}</p></div>`);
    }
    this.main.innerHTML = `<h2>Search: “${q.replace(/</g, '&lt;')}”</h2>${hits.length ? hits.join('') : '<p class="muted">Nothing found. Try another word.</p>'}`;
  }
}
