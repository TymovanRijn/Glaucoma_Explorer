/**
 * "ASK ME" — a small offline question-answering engine.
 *
 * Every anatomical part has hand-written questions and answers (content/anatomy.js), and
 * there is a shared FAQ. When you type a question, we:
 *   1. normalise it (lower-case, remove filler words, map synonyms: "drainage" -> "drain"),
 *   2. score every stored question by the important words it shares with yours
 *      (rare words count more — an idea called TF-IDF),
 *   3. prefer answers from the part you are talking to,
 *   4. if another part knows better, hand you over to that "neighbour".
 *
 * No data leaves your browser, and every answer was written and checked in advance —
 * which is safer for medical information than generating text on the fly.
 */
import { PARTS } from '../content/anatomy.js';
import { FAQ } from '../content/faq.js';
import { stripHtml } from './dom.js';

const STOP = new Set(
  'a an the is are am was were be been being do does did doing i me my you your yours it its of in on at to for from by with about as into over this that these those what which who whom how why when where can could should would will shall may might must there here and or but if so than then too very just also some any all much many more most such no not only own same tell please explain give show know want like really get got make made let lets ok okay hey hi hello'.split(' '),
);

const SYN = {
  pressure: ['pressure', 'iop', 'tension', 'mmhg', 'hypertension', 'pressures'],
  drain: ['drain', 'drainage', 'outflow', 'drains', 'draining', 'exit', 'leave', 'leaves', 'escape', 'filter'],
  fluid: ['fluid', 'aqueous', 'humour', 'humor', 'water', 'liquid'],
  vision: ['vision', 'sight', 'see', 'seeing', 'blind', 'blindness', 'visual'],
  cure: ['cure', 'curable', 'cured', 'reverse', 'reversible', 'heal', 'fix', 'restore', 'repair', 'regenerate', 'regrow', 'back'],
  damage: ['damage', 'damaged', 'harm', 'injury', 'injure', 'destroy', 'kill', 'die', 'dies', 'death', 'loss', 'lose', 'lost'],
  treat: ['treat', 'treatment', 'therapy', 'medicine', 'medication', 'drug', 'drugs', 'drop', 'drops'],
  surgery: ['surgery', 'operation', 'operate', 'surgical'],
  laser: ['laser', 'slt', 'iridotomy', 'lpi'],
  angle: ['angle', 'iridocorneal'],
  closure: ['closure', 'closed', 'close', 'closing', 'blocked', 'block'],
  pain: ['pain', 'hurt', 'hurts', 'painful', 'ache', 'sore'],
  child: ['child', 'children', 'baby', 'babies', 'kid', 'kids', 'infant', 'congenital'],
  gene: ['gene', 'genes', 'genetic', 'hereditary', 'inherit', 'inherited', 'family'],
  test: ['test', 'tests', 'exam', 'examination', 'check', 'screening', 'screen', 'diagnose', 'diagnosis', 'detect', 'detected'],
  big: ['big', 'large', 'size', 'enlarged'],
  colour: ['colour', 'color', 'colours', 'colors'],
  nerve: ['nerve', 'neuron', 'neurons', 'axon', 'axons', 'fibre', 'fibres', 'fiber', 'fibers'],
  cup: ['cup', 'cupping', 'cdr'],
  make: ['make', 'produce', 'production', 'secrete', 'secretion', 'create'],
};
const CANON = new Map();
for (const [canon, words] of Object.entries(SYN)) for (const w of words) CANON.set(w, canon);

function stem(w) {
  if (CANON.has(w)) return CANON.get(w);
  let s = w;
  if (s.length > 5 && s.endsWith('ies')) s = s.slice(0, -3) + 'y';
  else if (s.length > 4 && s.endsWith('es') && !s.endsWith('ses')) s = s.slice(0, -2);
  else if (s.length > 3 && s.endsWith('s') && !s.endsWith('ss')) s = s.slice(0, -1);
  if (s.length > 6 && s.endsWith('ing')) s = s.slice(0, -3);
  if (s.length > 5 && s.endsWith('ed')) s = s.slice(0, -2);
  return CANON.get(s) || s;
}

export function tokens(text) {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((w) => w && !STOP.has(w))
    .map(stem);
}

export class ChatEngine {
  constructor() {
    this.entries = [];
    for (const [id, p] of Object.entries(PARTS)) {
      const nameTokens = tokens(p.name);
      // section answers: "what are you", "what do you do", "role in glaucoma", "fun fact"
      this.add(id, `What are you? Describe yourself ${p.name}`, stripHtml(p.what), 'what describe yourself', nameTokens, 'what');
      this.add(id, 'What do you do? What is your job, function, purpose?', stripHtml(p.role), 'job function purpose role work', nameTokens, 'role');
      this.add(id, `What is your role in glaucoma? How are you involved in glaucoma?`, stripHtml(p.glaucoma), 'glaucoma role involved disease', nameTokens, 'glaucoma');
      this.add(id, 'Tell me a fun fact', p.fact, 'fun fact interesting surprising cool', nameTokens, 'fact');
      for (const qa of p.qa) this.add(id, qa.q, qa.a, qa.k || '', nameTokens, 'qa');
    }
    for (const f of FAQ) this.add(null, f.q, f.a, f.k || '', [], 'faq');
    // inverse document frequency
    const df = new Map();
    for (const e of this.entries) for (const t of new Set(e.tok)) df.set(t, (df.get(t) || 0) + 1);
    const N = this.entries.length;
    this.idf = (t) => Math.log(1 + N / (1 + (df.get(t) || 0)));
  }

  add(partId, q, a, k, nameTokens, kind) {
    const tok = [...tokens(q), ...tokens(k)];
    this.entries.push({ partId, q, a, tok, nameTok: nameTokens, kind });
  }

  /** Suggested starter questions for a part. */
  suggestions(partId, n = 4) {
    const p = PARTS[partId];
    const list = p ? p.qa.map((x) => x.q) : [];
    const extra = ['What is your role in glaucoma?', 'Tell me a fun fact'];
    return [...list.slice(0, n - 1), extra[0]].slice(0, n);
  }

  /**
   * Answer a question in the voice of `partId`.
   * Returns { text, from, entry, handoff } — handoff is set when another part answers.
   */
  ask(partId, question) {
    const qt = tokens(question);
    const raw = question.toLowerCase();
    if (!qt.length) {
      if (/\b(hi|hello|hey)\b/.test(raw)) return { text: PARTS[partId]?.hello || 'Hello!', from: partId };
      if (/thank/.test(raw)) return { text: 'You are welcome! Ask me anything else — or swim over to one of my neighbours.', from: partId };
      return { text: "Try asking me a full question — for example: \"What do you do?\" or \"How are you involved in glaucoma?\"", from: partId };
    }
    if (/thank/.test(raw) && qt.length <= 2) return { text: 'You are welcome! Curious minds learn the most.', from: partId };

    let best = null;
    let bestScore = 0;
    for (const e of this.entries) {
      let s = 0;
      const set = new Set(e.tok);
      for (const t of qt) {
        if (set.has(t)) s += this.idf(t);
        else if (t.length > 4) {
          // partial match (e.g. "trabecul" in "trabecular")
          for (const u of set) {
            if (u.length > 4 && (u.startsWith(t.slice(0, 5)) || t.startsWith(u.slice(0, 5)))) {
              s += this.idf(u) * 0.5;
              break;
            }
          }
        }
      }
      // questions that mention a part by name point to that part
      const mentionsPart = e.nameTok.length && e.nameTok.every((t) => qt.includes(t));
      if (mentionsPart) s += 2.2;
      if (e.partId === partId) s *= 1.35;
      if (e.partId === null) s *= 1.05;
      // generic section answers are fallbacks: only win clearly
      if (e.kind !== 'qa' && e.kind !== 'faq') s *= e.partId === partId ? 0.95 : 0.6;
      if (s > bestScore) {
        bestScore = s;
        best = e;
      }
    }
    if (!best || bestScore < 1.6) {
      return {
        text: `I'm not sure I know that one. I can tell you what I am, what I do, how I'm involved in glaucoma — or try one of the suggested questions. You can also search the Library.`,
        from: partId,
        unsure: true,
      };
    }
    if (best.partId && best.partId !== partId) {
      const other = PARTS[best.partId];
      return {
        text: `Good question — that's really something my neighbour the <strong>${other.name}</strong> knows best. They say: “${best.a}”`,
        from: partId,
        handoff: best.partId,
        entry: best,
      };
    }
    return { text: best.a, from: partId, entry: best };
  }
}
