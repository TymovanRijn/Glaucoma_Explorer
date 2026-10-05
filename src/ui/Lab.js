/**
 * GLAUCOMA LAB — pick a type of glaucoma, run time forward, try treatments, and watch
 * the eye, the pressure, the nerve and the patient's vision respond.
 */
import { TYPES, EMERGENCY } from '../content/glaucoma.js';
import { TREATMENT_INFO } from '../content/treatments.js';
import { SCENARIOS, NORMAL } from '../sim/PressureModel.js';
import { aliveFraction } from '../eye/fundusData.js';
import { el, icon } from './dom.js';
import { fieldFor, drawFieldMap, fieldIndices } from './fieldViz.js';

const ORDER = ['healthy', 'oht', 'poag', 'ntg', 'acute', 'chronicClosure', 'pigmentary', 'pxf', 'neovascular', 'uveitic', 'steroid', 'congenital'];

export class Lab {
  constructor(root, { model, fibres, onScenario, onView, onVision, getCup }) {
    this.model = model;
    this.fibres = fibres;
    this.onScenario = onScenario;
    this.onView = onView;
    this.onVision = onVision;
    this.getCup = getCup;
    this.playing = false;
    this.speed = 1;
    this.visionOn = false;
    this.node = el(`<aside id="lab" class="side-panel left glass closed">
      <div class="panel-head">
        <span class="badge">Glaucoma Lab</span>
        <h2 data-k="title">Choose a patient</h2>
        <div class="sub" data-k="kind"></div>
        <button class="icon-btn panel-close" data-act="close" aria-label="Close">${icon('x')}</button>
      </div>
      <div class="panel-body" data-k="body"></div>
    </aside>`);
    root.appendChild(this.node);
    this.body = this.node.querySelector('[data-k="body"]');
    this.node.addEventListener('click', (e) => this.onClick(e));
    this.renderPicker();
  }

  get isOpen() {
    return !this.node.classList.contains('closed');
  }
  open() {
    this.node.classList.remove('closed');
  }
  close() {
    this.node.classList.add('closed');
    this.onClose?.();
  }

  onClick(e) {
    const b = e.target.closest('button');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'close') this.close();
    if (b.dataset.sc) this.select(b.dataset.sc);
    if (act === 'pick') this.renderPicker();
    if (act === 'play') this.setPlaying(!this.playing);
    if (act === 'reset') this.select(this.model.id);
    if (act === 'speed') {
      this.speed = this.speed >= 4 ? 1 : this.speed * 2;
      b.textContent = `${this.speed}×`;
    }
    if (b.dataset.treat) {
      this.model.toggleTreatment(b.dataset.treat);
      if (this.model.t >= SCENARIOS[this.model.id].duration - 1e-6) this.setPlaying(false);
      this.renderTreatments();
      this.update(true);
    }
    if (b.dataset.view) this.onView?.(b.dataset.view);
    if (act === 'vision') this.setVision(!this.visionOn);
  }

  setVision(on) {
    this.visionOn = on;
    const b = this.node.querySelector('[data-act="vision"]');
    if (b) {
      b.classList.toggle('on', on);
      b.innerHTML = `${icon('vision')} ${on ? 'Hide patient’s vision' : 'See through the patient’s eyes'}`;
    }
    this.onVision?.(on);
  }

  setPlaying(on) {
    this.playing = on;
    const b = this.node.querySelector('[data-act="play"]');
    if (b) b.innerHTML = on ? `${icon('pause')} Pause` : `${icon('play')} ${this.model.t > 0 ? 'Resume' : 'Start'}`;
  }

  renderPicker() {
    this.setPlaying(false);
    this.node.querySelector('[data-k="title"]').textContent = 'Choose a patient';
    this.node.querySelector('[data-k="kind"]').textContent = 'Each one has a different kind of glaucoma';
    this.body.innerHTML = `<p class="muted">Every patient below has the same eye — but a different problem. Pick one, press <strong>Start</strong> to run time forward, and try treatments. Can you save their sight?</p>
      <div class="scenario-grid">${ORDER.map(
        (id) => `<button class="scenario-card ${this.model.id === id ? 'active' : ''}" data-sc="${id}">
          <span class="sc-name">${TYPES[id].name}</span><span class="sc-kind">${TYPES[id].kind}${TYPES[id].emergency ? ' · emergency' : ''}</span></button>`,
      ).join('')}</div>
      <p class="tiny" style="margin-top:12px">The Lab uses a simplified teaching model of eye pressure (the Goldmann equation) and nerve damage. Numbers are realistic in size but this is not a medical calculator.</p>`;
  }

  select(id) {
    this.model.reset(id);
    this.setPlaying(false);
    this.onScenario?.(id);
    this.render();
    this.update(true);
  }

  render() {
    const id = this.model.id;
    const T = TYPES[id];
    const sc = SCENARIOS[id];
    this.node.querySelector('[data-k="title"]').textContent = T.name;
    this.node.querySelector('[data-k="kind"]').innerHTML = `${T.kind}${T.emergency ? ' · <span class="badge danger">Emergency</span>' : ''}`;
    const more = ['mechanism', 'who', 'symptoms', 'detection', 'treatment']
      .filter((k) => T[k])
      .map((k) => `<h4>${{ mechanism: 'What goes wrong', who: 'Who gets it', symptoms: 'Symptoms', detection: 'How it is found', treatment: 'Treatment' }[k]}</h4>${T[k]}`)
      .join('');
    this.body.innerHTML = `
      <div class="panel-actions" style="margin-top:0;margin-bottom:10px">
        <button class="btn small" data-act="pick">${icon('left')} All patients</button>
        <div class="view-btns">
          <button class="btn small" data-view="angle">Drain</button>
          <button class="btn small" data-view="disc">Nerve</button>
          <button class="btn small" data-view="overview">Whole eye</button>
        </div>
      </div>
      ${T.summary}
      ${T.emergency ? `<div class="emergency">${EMERGENCY}</div>` : ''}
      <div class="watch">${icon('eye', 'width="15" height="15" style="vertical-align:-3px"')} ${T.watch}</div>
      <div class="timebar" style="margin-top:12px">
        <button class="btn small primary" data-act="play">${icon('play')} Start</button>
        <button class="btn small" data-act="speed">${this.speed}×</button>
        <button class="btn small" data-act="reset" title="Reset">${icon('reset')}</button>
        <span class="time" data-k="time"></span>
      </div>
      <div class="stat-row">
        <div class="stat"><div class="label">Eye pressure</div><div class="value" data-k="iop">—</div><div class="note" data-k="iopnote"></div><div class="meter"><div data-k="iopbar"></div></div></div>
        <div class="stat"><div class="label">Nerve fibres left</div><div class="value" data-k="alive">—</div><div class="note" data-k="cdr"></div><div class="meter"><div data-k="alivebar"></div></div></div>
      </div>
      <canvas class="history" data-k="history" width="760" height="128" aria-label="Pressure and damage over time"></canvas>
      <h3>The pressure equation, live</h3>
      <div class="equation" data-k="eq"></div>
      <p class="tiny" style="margin-top:6px">F = fluid made · U = back-door outflow · C = how easily the main drain flows · EVP = vein pressure. Every treatment changes one of these.</p>
      <h3>Treatments ${sc.treatments.length ? '' : '<span class="tiny">(none needed)</span>'}</h3>
      <div class="treat-grid" data-k="treat"></div>
      <h3>Visual field (what the eye can still see)</h3>
      <div class="field-wrap">
        <canvas data-k="field" width="264" height="264"></canvas>
        <div><div data-k="fieldtext" class="muted" style="font-size:13.5px"></div>
          <button class="btn small" data-act="vision" style="margin-top:8px">${icon('vision')} See through the patient’s eyes</button></div>
      </div>
      <details class="more"><summary>Learn more about ${T.name.toLowerCase()} ▾</summary>${more || '<p class="muted">This is the healthy reference eye.</p>'}${T.fact ? `<div class="fact"><b>Did you know?</b>${T.fact}</div>` : ''}</details>
    `;
    this.renderTreatments();
    this.setVision(this.visionOn);
  }

  renderTreatments() {
    const sc = SCENARIOS[this.model.id];
    const box = this.node.querySelector('[data-k="treat"]');
    if (!box) return;
    box.innerHTML = sc.treatments
      .map((tid) => {
        const t = TREATMENT_INFO[tid];
        const on = this.model.treatments.has(tid);
        const since = on ? this.model.treatments.get(tid) : null;
        const unit = sc.unit === 'hours' ? 'h' : 'y';
        return `<button class="treat-btn ${on ? 'on' : ''}" data-treat="${tid}" title="${t.how.replace(/"/g, '&quot;')}">
          <span class="tk">${t.kind}</span>
          <span><div class="tn">${t.name}</div><div class="tt">${t.term}${on ? ` · started at ${since.toFixed(1)}${unit}` : ''}</div></span>
          <span class="state">${on ? '✓' : '+'}</span></button>`;
      })
      .join('');
  }

  /** Called every frame by the app: advances time when playing, refreshes numbers. */
  tick(dt) {
    if (!this.playing) return;
    const sc = SCENARIOS[this.model.id];
    // years: ~1 year per 1.6 s ; hours: ~1 hour per 0.6 s (at 1×)
    const rate = sc.unit === 'hours' ? 1.6 : sc.duration > 10 ? 0.62 : 0.4;
    const steps = 3;
    for (let i = 0; i < steps; i++) {
      if (!this.model.step((dt * rate * this.speed) / steps)) {
        this.setPlaying(false);
        break;
      }
    }
  }

  update(force = false) {
    if (!this.isOpen && !force) return;
    const m = this.model;
    const s = m.state;
    const sc = SCENARIOS[m.id];
    const q = (k) => this.node.querySelector(`[data-k="${k}"]`);
    if (!q('iop')) return;
    const iop = s.IOP;
    const col = iop > 30 ? 'var(--bad)' : iop > 21 ? 'var(--warn)' : 'var(--good)';
    q('iop').innerHTML = `${iop.toFixed(0)}<small>mmHg</small>`;
    q('iop').style.color = col;
    q('iopnote').textContent = iop > 30 ? 'Very high' : iop > 21 ? 'Above normal (10–21)' : 'Normal range (10–21)';
    q('iopbar').style.width = `${Math.min(100, (iop / 70) * 100)}%`;
    q('iopbar').style.background = col;
    const alive = aliveFraction(this.fibres, m.damage);
    q('alive').innerHTML = `${Math.round(alive * 100)}<small>%</small>`;
    q('alive').style.color = alive < 0.5 ? 'var(--bad)' : alive < 0.85 ? 'var(--warn)' : 'var(--good)';
    q('alivebar').style.width = `${alive * 100}%`;
    q('alivebar').style.background = alive < 0.5 ? 'var(--bad)' : alive < 0.85 ? 'var(--warn)' : 'var(--good)';
    const cup = this.getCup?.();
    if (cup) q('cdr').textContent = `Cup-to-disc ratio ${cup.verticalCdr.toFixed(2)} (vertical)`;
    const unit = sc.unit === 'hours' ? 'hour' : 'year';
    const age = sc.unit === 'years' ? ` · patient aged ${Math.floor(sc.age + m.t)}` : '';
    q('time').textContent = `${unit[0].toUpperCase() + unit.slice(1)} ${m.t.toFixed(1)} of ${sc.duration}${age}`;
    // equation
    const fmt = (v, d = 2) => v.toFixed(d);
    const ch = (a, b) => (Math.abs(a - b) > 0.005 ? 'changed' : 't');
    q('eq').innerHTML = `IOP = (<span class="${ch(s.F, NORMAL.F)}">${fmt(s.F)}</span> − <span class="${ch(s.Ueff, NORMAL.U)}">${fmt(s.Ueff)}</span>) / <span class="${ch(s.Ceff, NORMAL.C)}">${fmt(s.Ceff, 3)}</span> + <span class="${ch(s.EVP, NORMAL.EVP)}">${fmt(s.EVP, 1)}</span> = <b style="color:#fff">${fmt(iop, 1)}</b>`;
    // field
    const field = fieldFor(this.fibres, m.damage);
    const fc = q('field');
    drawFieldMap(fc.getContext('2d'), field, fc.width, { labels: true });
    const idx = fieldIndices(field);
    q('fieldtext').innerHTML = `Mean deviation <strong>${idx.md.toFixed(1)} dB</strong><br>Visual field index <strong>${Math.round(idx.vfi)}%</strong><br><span class="tiny">Dark squares = places where faint lights are no longer seen. The black dot on the right is everyone's natural blind spot.</span>`;
    this.drawHistory(q('history'));
  }

  drawHistory(c) {
    const g = c.getContext('2d');
    const W = c.width;
    const H = c.height;
    g.clearRect(0, 0, W, H);
    const sc = SCENARIOS[this.model.id];
    const hist = this.model.history;
    // grid & normal band
    g.fillStyle = 'rgba(73,227,160,0.08)';
    const y = (iop) => H - 8 - (Math.min(70, iop) / 70) * (H - 16);
    g.fillRect(0, y(21), W, y(10) - y(21));
    g.strokeStyle = 'rgba(255,255,255,0.08)';
    g.beginPath();
    g.moveTo(0, y(21));
    g.lineTo(W, y(21));
    g.stroke();
    g.fillStyle = 'rgba(200,220,240,0.5)';
    g.font = '18px Inter, sans-serif';
    g.fillText('pressure', 8, 22);
    g.fillStyle = 'rgba(255,93,108,0.75)';
    g.fillText('nerve damage', 100, 22);
    if (!hist.length) return;
    const x = (t) => (t / sc.duration) * W;
    g.lineWidth = 3;
    g.strokeStyle = '#5ee3ff';
    g.beginPath();
    hist.forEach((p, i) => (i ? g.lineTo(x(p.t), y(p.iop)) : g.moveTo(x(p.t), y(p.iop))));
    g.stroke();
    g.strokeStyle = 'rgba(255,93,108,0.85)';
    g.beginPath();
    hist.forEach((p, i) => {
      const yy = H - 8 - p.damage * (H - 16);
      if (i) g.lineTo(x(p.t), yy);
      else g.moveTo(x(p.t), yy);
    });
    g.stroke();
  }
}
