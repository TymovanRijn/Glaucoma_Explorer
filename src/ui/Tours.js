/**
 * GUIDED TOURS — a narrated sequence of camera flights with "predict first" questions.
 */
import { TOURS } from '../content/tours.js';
import { el, icon } from './dom.js';

export class Tours {
  constructor(root, { onStep, onEnd }) {
    this.onStep = onStep;
    this.onEnd = onEnd;
    this.tour = null;
    this.i = 0;
    this.answers = new Map();
    this.card = el(`<div id="tour-card" class="glass hidden" role="region" aria-label="Guided tour"></div>`);
    root.appendChild(this.card);
    this.picker = el(`<div id="tour-picker" class="overlay hidden" role="dialog" aria-label="Choose a tour">
      <div class="sheet glass" style="height:auto;max-height:calc(100vh - 28px);width:min(820px,100%)">
        <div class="sheet-head"><div class="grow"><span class="badge">Guided tours</span><h2>Choose a journey</h2><div class="sub">Sit back: the camera flies for you. You can still look around at every stop.</div></div>
        <button class="icon-btn" data-act="close" aria-label="Close">${icon('x')}</button></div>
        <div class="sheet-main"><div class="lib-grid">${TOURS.map(
          (t, n) => `<div class="lib-card" data-tour="${t.id}" role="button" tabindex="0"><span class="badge">${n + 1} · ${t.minutes} min</span><h4 style="margin-top:8px">${t.name}</h4><p class="muted" style="margin:0">${t.blurb}</p></div>`,
        ).join('')}</div>
        <div class="think-box" style="margin-top:14px"><b>Tip</b>Some stops ask you to <strong>predict</strong> what happens before revealing the answer. Committing to a guess — even a wrong one — makes the explanation stick much better.</div></div>
      </div></div>`);
    root.appendChild(this.picker);
    this.picker.addEventListener('click', (e) => {
      if (e.target === this.picker || e.target.closest('[data-act="close"]')) this.closePicker();
      const c = e.target.closest('[data-tour]');
      if (c) {
        this.closePicker();
        this.start(c.dataset.tour);
      }
    });
    this.picker.addEventListener('keydown', (e) => {
      const c = e.target.closest('[data-tour]');
      if (c && (e.key === 'Enter' || e.key === ' ')) {
        this.closePicker();
        this.start(c.dataset.tour);
      }
    });
    this.card.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.act === 'next') this.go(this.i + 1);
      if (b.dataset.act === 'prev') this.go(this.i - 1);
      if (b.dataset.act === 'exit') this.end();
      if (b.dataset.opt !== undefined) this.answer(+b.dataset.opt);
    });
  }

  openPicker() {
    this.picker.classList.remove('hidden');
  }
  closePicker() {
    this.picker.classList.add('hidden');
  }
  get active() {
    return !!this.tour;
  }

  start(id) {
    this.tour = TOURS.find((t) => t.id === id);
    this.answers.clear();
    this.card.classList.remove('hidden');
    this.go(0);
  }

  end() {
    this.tour = null;
    this.card.classList.add('hidden');
    this.onEnd?.();
  }

  go(i) {
    if (!this.tour) return;
    if (i >= this.tour.steps.length) return this.end();
    this.i = Math.max(0, i);
    const step = this.tour.steps[this.i];
    this.render();
    this.onStep?.(step, this.i, this.tour);
  }

  answer(k) {
    const step = this.tour.steps[this.i];
    if (this.answers.has(this.i)) return;
    this.answers.set(this.i, k);
    this.render();
    if (step.predict && k !== step.predict.answer) {
      /* wrong guesses are fine — the explanation follows */
    }
  }

  render() {
    const t = this.tour;
    const step = t.steps[this.i];
    const n = t.steps.length;
    const answered = this.answers.has(this.i);
    let predict = '';
    if (step.predict) {
      const pk = this.answers.get(this.i);
      predict = `<div class="predict"><div class="think">${icon('sparkles', 'width="13" height="13" style="vertical-align:-2px"')} Predict before you continue</div><div class="pq">${step.predict.q}</div><div class="opts">${step.predict.options
        .map((o, k) => {
          let cls = '';
          if (answered) cls = k === step.predict.answer ? 'right' : k === pk ? 'wrong' : '';
          return `<button data-opt="${k}" class="${cls}" ${answered ? 'disabled' : ''}>${o}</button>`;
        })
        .join('')}</div>${answered ? `<div class="explain">${pk === step.predict.answer ? '<strong>Exactly.</strong> ' : '<strong>Not quite — and that is how learning works.</strong> '}${step.predict.explain}</div>` : ''}</div>`;
    }
    const blocked = step.predict && !answered;
    this.card.innerHTML = `<div class="tour-top"><span class="tour-name">${t.name} · ${this.i + 1}/${n}</span><button class="icon-btn" data-act="exit" aria-label="Exit tour" style="width:32px;height:32px">${icon('x')}</button></div>
      <h3>${step.title}</h3><div class="tour-text">${step.text}${predict}</div>
      <div class="tour-nav"><button class="btn small" data-act="prev" ${this.i === 0 ? 'disabled' : ''}>${icon('left')} Back</button>
      <div class="dots">${t.steps.map((_, k) => `<i class="${k < this.i ? 'done' : k === this.i ? 'cur' : ''}"></i>`).join('')}</div>
      <button class="btn small primary" data-act="next" ${blocked ? 'disabled title="Make a prediction first"' : ''}>${this.i === n - 1 ? 'Finish' : 'Next'} ${icon('right')}</button></div>`;
    const tt = this.card.querySelector('.tour-text');
    if (tt && answered) tt.scrollTop = tt.scrollHeight;
  }
}
