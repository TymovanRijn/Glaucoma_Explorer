/**
 * INFO PANEL — opens when you select a part. Three tabs: About · In glaucoma · Ask me.
 */
import { PARTS, GROUPS } from '../content/anatomy.js';
import { el, icon, escapeHtml } from './dom.js';

export class InfoPanel {
  constructor(root, { chat, onFly, onSelect, onClose }) {
    this.chat = chat;
    this.onFly = onFly;
    this.onSelect = onSelect;
    this.onClose = onClose;
    this.current = null;
    this.tab = 'about';
    this.histories = new Map(); // remember each conversation
    this.node = el(`<aside id="info" class="side-panel right glass closed" aria-live="polite">
      <div class="panel-head">
        <span class="badge" data-k="group"></span>
        <h2 data-k="name"></h2>
        <div class="sub" data-k="tagline"></div>
        <div class="panel-actions">
          <button class="btn small" data-act="fly">${icon('plane')} Fly here</button>
          <button class="btn small" data-act="ask">${icon('chat')} Ask me</button>
        </div>
        <button class="icon-btn panel-close" data-act="close" aria-label="Close">${icon('x')}</button>
      </div>
      <div class="tabs" role="tablist">
        <button data-tab="about" class="active">About</button>
        <button data-tab="glaucoma">In glaucoma</button>
        <button data-tab="ask">Ask me</button>
      </div>
      <div class="panel-body" data-k="body"></div>
      <form class="chat-input hidden" data-k="form" autocomplete="off">
        <input type="text" placeholder="Ask a question…" aria-label="Ask a question" maxlength="200" />
        <button class="icon-btn" type="submit" aria-label="Send">${icon('send')}</button>
      </form>
    </aside>`);
    root.appendChild(this.node);
    this.q = (k) => this.node.querySelector(`[data-k="${k}"]`);
    this.node.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.act === 'close') this.close();
      if (b.dataset.act === 'fly') this.onFly?.(this.current);
      if (b.dataset.act === 'ask') this.setTab('ask');
      if (b.dataset.tab) this.setTab(b.dataset.tab);
      if (b.dataset.goto) this.onSelect?.(b.dataset.goto, { fly: true });
      if (b.dataset.suggest) this.send(b.dataset.suggest);
    });
    this.q('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = this.q('form').querySelector('input');
      const v = input.value.trim();
      if (v) this.send(v);
      input.value = '';
    });
  }

  get isOpen() {
    return !this.node.classList.contains('closed');
  }

  show(id, tab = null) {
    const p = PARTS[id];
    if (!p) return;
    this.current = id;
    this.q('group').textContent = GROUPS[p.group] || '';
    this.q('name').textContent = p.name;
    this.q('tagline').textContent = p.tagline;
    this.node.classList.remove('closed');
    this.setTab(tab || (this.tab === 'ask' ? 'ask' : 'about'));
  }

  close() {
    this.node.classList.add('closed');
    this.onClose?.();
  }

  setTab(tab) {
    this.tab = tab;
    for (const b of this.node.querySelectorAll('.tabs button')) b.classList.toggle('active', b.dataset.tab === tab);
    const p = PARTS[this.current];
    const body = this.q('body');
    this.q('form').classList.toggle('hidden', tab !== 'ask');
    if (tab === 'about') {
      body.innerHTML = `${p.what}<h3>What it does</h3>${p.role}
        <div class="fact"><b>Did you know?</b>${p.fact}</div>
        ${this.relatedHtml(p)}`;
    } else if (tab === 'glaucoma') {
      body.innerHTML = `${p.glaucoma}${this.relatedHtml(p)}`;
    } else {
      this.renderChat();
    }
    body.scrollTop = 0;
  }

  relatedHtml(p) {
    if (!p.related?.length) return '';
    return `<h3>Explore nearby</h3><div class="related">${p.related
      .filter((r) => PARTS[r])
      .map((r) => `<button class="chip" data-goto="${r}">${PARTS[r].name}</button>`)
      .join('')}</div>`;
  }

  history() {
    if (!this.histories.has(this.current)) {
      const p = PARTS[this.current];
      this.histories.set(this.current, [{ who: 'bot', text: p.hello }]);
    }
    return this.histories.get(this.current);
  }

  renderChat() {
    const p = PARTS[this.current];
    const h = this.history();
    const body = this.q('body');
    body.innerHTML = `<div class="chat">${h
      .map((m) => this.msgHtml(m, p))
      .join('')}</div><h3>Try asking</h3><div class="suggest">${this.chat
      .suggestions(this.current)
      .map((s) => `<button class="chip" data-suggest="${escapeHtml(s)}">${escapeHtml(s)}</button>`)
      .join('')}</div>`;
    body.scrollTop = body.scrollHeight;
    if (window.matchMedia('(pointer: fine)').matches) this.q('form').querySelector('input').focus({ preventScroll: true });
  }

  msgHtml(m, p) {
    if (m.who === 'user') return `<div class="msg user">${escapeHtml(m.text)}</div>`;
    if (m.typing) return `<div class="msg bot typing"><span></span><span></span><span></span></div>`;
    const actions = m.handoff
      ? `<div class="msg-actions"><button class="chip" data-goto="${m.handoff}">${icon('plane', 'width="13" height="13"')} Visit the ${PARTS[m.handoff].name}</button></div>`
      : '';
    return `<div class="msg bot"><div class="who">${p.name}</div>${m.text}${actions}</div>`;
  }

  send(text) {
    if (this.tab !== 'ask') this.setTab('ask');
    const h = this.history();
    h.push({ who: 'user', text });
    const typing = { who: 'bot', typing: true };
    h.push(typing);
    this.renderChat();
    const ans = this.chat.ask(this.current, text);
    const partAtSend = this.current;
    setTimeout(() => {
      const idx = h.indexOf(typing);
      if (idx >= 0) h.splice(idx, 1, { who: 'bot', text: ans.text, handoff: ans.handoff });
      if (this.current === partAtSend && this.tab === 'ask') this.renderChat();
    }, 420 + Math.min(900, ans.text.length * 4));
  }
}
