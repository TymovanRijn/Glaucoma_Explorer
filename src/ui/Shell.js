/**
 * The static parts of the interface: top bar, HUD, settings, help, intro, touch controls.
 */
import { el, icon, BRAND_SVG } from './dom.js';
import { IRIS_COLORS } from '../eye/textures.js';

export function buildShell(root, { isTouch }) {
  const ui = {};
  ui.topbar = el(`<header id="topbar">
    <div class="brand glass">${BRAND_SVG}<div class="brand-name">Glaucoma <span>Explorer</span></div></div>
    <nav id="nav" class="glass" aria-label="Main">
      <button data-nav="explore" class="active">${icon('compass')}<span>Explore</span></button>
      <button data-nav="tours">${icon('route')}<span>Tours</span></button>
      <button data-nav="lab">${icon('flask')}<span>Glaucoma Lab</span></button>
      <button data-nav="clinic">${icon('stethoscope')}<span>Clinic</span></button>
      <button data-nav="library">${icon('book')}<span>Library</span></button>
    </nav>
    <div class="top-actions">
      <button class="icon-btn glass" data-act="settings" aria-label="Settings">${icon('settings')}</button>
      <button class="icon-btn glass" data-act="help" aria-label="Help">${icon('help')}</button>
    </div>
  </header>`);
  root.appendChild(ui.topbar);

  ui.location = el(`<div id="location" class="glass">
    <span class="loc-dot"></span>
    <div><div class="loc-label">You are</div><div class="loc-name" data-k="loc">Outside the eye</div></div>
    <button class="btn small ghost" data-act="where">${icon('info')} What is this place?</button>
  </div>`);
  root.appendChild(ui.location);

  ui.pressure = el(`<div id="pressure-chip" class="glass hidden" title="Live eye pressure of the simulated patient">
    <div><div class="tiny">Eye pressure</div><div class="val" data-k="iop">16</div></div>
    <div class="tiny" data-k="sc" style="max-width:150px"></div>
  </div>`);
  root.appendChild(ui.pressure);

  ui.crosshair = el(`<div id="crosshair" class="hidden"></div>`);
  root.appendChild(ui.crosshair);
  ui.tooltip = el(`<div id="tooltip" class="glass hidden"><div class="tt-name"></div><div class="tt-sub"></div><div class="tt-hint"></div></div>`);
  root.appendChild(ui.tooltip);

  ui.hint = el(`<div id="controls-hint" class="glass"></div>`);
  root.appendChild(ui.hint);

  ui.modeSwitch = el(`<div id="mode-switch" class="glass" role="group" aria-label="Camera mode">
    <button data-mode="orbit" class="active" title="Orbit around (V)">${icon('orbit')}<span>Orbit</span></button>
    <button data-mode="swim" title="Swim inside (V)">${icon('swim')}<span>Swim</span></button>
  </div>`);
  root.appendChild(ui.modeSwitch);

  ui.viewTools = el(`<div id="view-tools">
    <button class="icon-btn glass" data-act="cut" title="Cut the eye open (C)" aria-label="Toggle cutaway">${icon('scissors')}</button>
    <button class="icon-btn glass" data-act="home" title="Back to overview" aria-label="Back to overview">${icon('home')}</button>
  </div>`);
  root.appendChild(ui.viewTools);

  ui.minimap = el(`<div id="minimap" class="glass"><div class="mm-title"><span>Map · top view</span><span data-k="depth"></span></div><canvas></canvas></div>`);
  root.appendChild(ui.minimap);

  ui.visionBadge = el(`<div id="vision-badge" class="glass hidden">${icon('vision')} <span>Seeing through the patient’s eye</span>
    <div class="seg"><button data-vmode="real" class="active">Realistic</button><button data-vmode="dark">Show missing areas</button></div></div>`);
  root.appendChild(ui.visionBadge);

  const swatches = Object.entries(IRIS_COLORS)
    .map(([k, c]) => `<button data-eyecolor="${k}" title="${k}" style="background: radial-gradient(circle, rgb(${c.pupil}) 0 30%, rgb(${c.mid}) 31% 70%, rgb(${c.outer}) 71%)"></button>`)
    .join('');
  ui.settings = el(`<div id="settings" class="glass hidden" role="dialog" aria-label="Settings">
    <h4>Show</h4>
    ${toggle('flow', 'Fluid flow (aqueous humour)', true)}
    ${toggle('fibres', 'Glowing nerve fibres', true)}
    ${toggle('labels', 'Labels in overview', true)}
    ${toggle('muscles', 'Eye muscles', false)}
    <h4 style="margin-top:12px">Cut the eye open</h4>
    ${toggle('cut', 'Cutaway view', true)}
    <input type="range" min="-6" max="6" step="0.1" value="2" data-set="cutOffset" aria-label="Cut position" />
    <h4 style="margin-top:12px">Eye colour</h4>
    <div class="swatches">${swatches}</div>
    <h4>Graphics quality</h4>
    <div class="seg" data-k="quality"><button data-q="auto">Auto</button><button data-q="high">High</button><button data-q="low">Low</button></div>
    <p class="tiny" style="margin-top:8px">Low quality helps on older phones and laptops.</p>
  </div>`);
  root.appendChild(ui.settings);

  ui.help = el(`<div id="help" class="overlay hidden" role="dialog" aria-label="Help">
    <div class="sheet glass" style="height:auto;max-height:calc(100vh - 28px);width:min(760px,100%)">
      <div class="sheet-head"><div class="grow"><span class="badge">How to explore</span><h2>Controls</h2></div><button class="icon-btn" data-act="close" aria-label="Close">${icon('x')}</button></div>
      <div class="sheet-main">
        <div class="two-col">
          <div><h3 style="margin-top:0">${icon('orbit', 'width="16" height="16"')} Orbit mode</h3>
            <p><span class="kbd">Drag</span> rotate · <span class="kbd">Scroll</span> / pinch zoom · <span class="kbd">Right-drag</span> / two fingers pan</p>
            <p><span class="kbd">Click</span> any part to learn about it and talk to it.</p></div>
          <div><h3 style="margin-top:0">${icon('swim', 'width="16" height="16"')} Swim mode</h3>
            <p>Click the view to steer with your mouse (<span class="kbd">Esc</span> to release).</p>
            <p><span class="kbd">W</span><span class="kbd">A</span><span class="kbd">S</span><span class="kbd">D</span> move · <span class="kbd">E</span>/<span class="kbd">Space</span> up · <span class="kbd">Q</span> down · <span class="kbd">Shift</span> faster · <span class="kbd">Scroll</span> speed</p>
            <p>Point the crosshair at something and <span class="kbd">click</span> or press <span class="kbd">F</span> to inspect it.</p>
            <p>On a phone: left thumb joystick to move, drag on the right to look, <strong>Inspect</strong> to learn.</p></div>
        </div>
        <h3>Shortcuts</h3>
        <p><span class="kbd">V</span> orbit / swim · <span class="kbd">C</span> cutaway · <span class="kbd">L</span> library · <span class="kbd">H</span> help · <span class="kbd">Esc</span> close panels</p>
        <div class="think-box"><b>A tip for learning</b>Before opening an info panel, try to guess what a structure does from its shape and position. Then check. Being wrong first is one of the fastest ways to learn.</div>
      </div></div></div>`);
  root.appendChild(ui.help);

  ui.intro = el(`<div id="intro" class="hidden">
    <div class="intro-inner">
      <div class="eyebrow">An interactive 3D journey</div>
      <h1>Glaucoma <span>Explorer</span></h1>
      <p class="lead">Shrink down and swim inside a living human eye. Discover how it works — and how glaucoma silently steals sight, how it is caught, and how it is treated.</p>
      <div class="cta">
        <button class="btn primary" data-start="tour">${icon('route')} Start the guided journey</button>
        <button class="btn" data-start="explore">${icon('compass')} Explore freely</button>
        <button class="btn" data-start="lab">${icon('flask')} Open the Glaucoma Lab</button>
      </div>
      <div class="stats">
        <div class="stat-i"><b>#1</b><span>cause of irreversible blindness worldwide</span></div>
        <div class="stat-i"><b>~3.5%</b><span>of people aged 40–80 have glaucoma</span></div>
        <div class="stat-i"><b>~1 in 2</b><span>of those affected don’t know it, in many countries</span></div>
      </div>
      <p class="fine">Educational project — not medical advice. ${isTouch ? 'Works best in landscape.' : 'Best with a mouse and keyboard; works on phones too.'}</p>
    </div>
  </div>`);
  root.appendChild(ui.intro);

  ui.touch = el(`<div id="touch-ui" class="hidden">
    <div id="joystick"><div class="knob"></div></div>
    <div id="touch-buttons">
      <button data-touch="up" aria-label="Up">Up</button>
      <button data-touch="down" aria-label="Down">Down</button>
      <button data-touch="inspect" class="inspect" aria-label="Inspect">Inspect</button>
    </div>
  </div>`);
  root.appendChild(ui.touch);
  return ui;
}

function toggle(key, label, on) {
  return `<label class="toggle-row"><span>${label}</span><span class="switch"><input type="checkbox" data-set="${key}" ${on ? 'checked' : ''}/><span></span></span></label>`;
}
