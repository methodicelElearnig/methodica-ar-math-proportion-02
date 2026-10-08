'use strict';
/* ═══════════════════════════════════════════════════════════════════
   methodica-math-proportion-02 — unit behaviour (יעד 2.2)
   Screens keep ONE global 0..N numbering across all seven components;
   window.PART_CONFIG (each component's script.js) bounds the range.
   ═══════════════════════════════════════════════════════════════════ */

/* What is BUILT, not what is planned. goTo() silently no-ops on a screen
   with no section, so an optimistic total makes המשך look broken. Raise
   this as each screen lands. */
const TOTAL_SCREENS = 60;   /* deck 3-86 — the whole script */

const CHARACTER_IDS = ['character-yellow', 'character-green'];
const DEFAULT_CHARACTER = 'character-yellow';
/* Equals UI_CHARACTER_KEY in 40-resume.js (namespaced per unit, QA D-6). The key this unit used
   before the platform layer is read once and moved (getStoredCharacter). */
const CHARACTER_STORAGE_KEY = 'methodica_math_proportion_02_selectedCharacter';
const LEGACY_CHARACTER_KEY = 'proportion02_selectedCharacter';

/* The producer's picked set, carried over from the previous build (Elad,
   27.09.26 — "ready and picked"). Pose coverage is ASYMMETRIC: yellow has a
   reading clip and green does not; green has a cube clip and yellow does not.
   POSE_FALLBACK below resolves that rather than showing the wrong monster. */
const CHARACTER_ASSETS = {
  'character-yellow': {
    selection: '../unit-assets/video/character-yellow-selection.mp4',
    standing:  '../unit-assets/img/character-yellow.png',
    squashed:  '../unit-assets/img/character-squashed-yellow-715.png',
    victory:   '../unit-assets/img/character-victory-yellow-328.png',
    magnifier: '../unit-assets/img/character-magnifier-yellow.png',
    calculator:'../unit-assets/img/character-calculator-yellow.png',
    measuring: '../unit-assets/img/character-measuring-yellow.png',
    duo:       '../unit-assets/video/character-yellow-duo.mp4',
    reading:   '../unit-assets/video/character-yellow-reading.mp4',
    spinning:  '../unit-assets/video/character-yellow-spinning.mp4',
    practice:  '../unit-assets/video/character-yellow-popcorn.mp4',
    calc:      '../unit-assets/video/character-yellow-calc.mp4',
    breakdance:'../unit-assets/video/character-yellow-breakdance.mp4',
    climbing:  '../unit-assets/video/character-yellow-climbing.mp4',
  },
  'character-green': {
    selection: '../unit-assets/video/character-green-selection.mp4',
    standing:  '../unit-assets/img/character-green.png',
    squashed:  '../unit-assets/img/character-squashed-green.png',
    victory:   '../unit-assets/img/character-victory-green.png',
    magnifier: '../unit-assets/img/character-magnifier-green.png',
    calculator:'../unit-assets/img/character-calculator-green.png',
    measuring: '../unit-assets/img/character-measuring-green.png',
    duo:       '../unit-assets/video/character-green-duo.mp4',
    cube:      '../unit-assets/video/character-green-cube.mp4',
    spinning:  '../unit-assets/video/character-green-spinning.mp4',
    breakdance:'../unit-assets/video/character-green-breakdance.mp4',
    climbing:  '../unit-assets/video/character-green-climbing.mp4',
    practice:  '../unit-assets/video/character-green-ball.mp4',
    calc:      '../unit-assets/video/character-green-calc.mp4',
    cube2:     '../unit-assets/video/character-green-cube2.mp4',
  },
};

/* A pose one monster lacks walks this chain until it finds one it owns. Every
   chain ends at a pose BOTH have, so it always resolves. Delete an entry the
   day its asset arrives. */
const POSE_FALLBACK = {
  /* 04.10, producer: green has no reading clip, and the old chain sent it to
     `duo` — a clip with TWO green monsters, on a screen about one. `calc`
     is green's single-monster clipboard pose, the nearest thing to reading. */
  reading: ['calc', 'standing'],
  cube:    ['spinning', 'standing'],
  /* the producer supplied the Rubik's-cube clip for GREEN only (28.09), so the
     yellow companion walks to a pose it owns — without this, screen 24 asked
     for an asset that does not exist and rendered NO character at all. */
  cube2:   ['cube', 'spinning', 'standing'],
  calc:    ['spinning', 'standing'],
  practice:['spinning', 'standing'],
};

window.lomdaState = window.lomdaState || { selectedCharacter: null };

function getStoredCharacter() {
  try {
    let v = localStorage.getItem(CHARACTER_STORAGE_KEY);
    if (!v) {
      const old = localStorage.getItem(LEGACY_CHARACTER_KEY);
      if (CHARACTER_IDS.includes(old)) { localStorage.setItem(CHARACTER_STORAGE_KEY, old); v = old; }
      localStorage.removeItem(LEGACY_CHARACTER_KEY);
    }
    return CHARACTER_IDS.includes(v) ? v : null;
  } catch (e) { return null; }
}
window.lomdaState.selectedCharacter = getStoredCharacter();

function characterAsset(pose) {
  const id = CHARACTER_IDS.includes(window.lomdaState.selectedCharacter)
    ? window.lomdaState.selectedCharacter : DEFAULT_CHARACTER;
  if (!CHARACTER_ASSETS[id][pose]) {
    const alt = (POSE_FALLBACK[pose] || []).find(p => CHARACTER_ASSETS[id][p]);
    if (alt) pose = alt;
  }
  return CHARACTER_ASSETS[id][pose];
}

/* Hold המשך until a screen's delayed content has actually appeared, so the
   learner cannot skip past it (producer 27.09, screen 2). The reveal only
   plays on a screen's FIRST visit — Motion marks that with `.m-animate` — so
   on a revisit the button must not stay locked. */
function gateOnReveal(screenEl, selector) {
  const btn = screenEl && screenEl.querySelector('.btn-continue');
  const el = screenEl && screenEl.querySelector(selector);
  if (!btn) return;
  if (!el || !screenEl.classList.contains('m-animate')) { btn.disabled = false; return; }
  btn.disabled = true;
  let done = false;
  const release = () => { if (!done) { done = true; btn.disabled = false; } };
  /* Timed off the element's OWN animation-delay + duration rather than an
     `animationend` listener: the reveal is a CSS animation that Motion kills
     by removing `.m-animate`, and a cancelled animation fires no `end` event
     at all. animationend stays as an early release when it does arrive. */
  const cs = getComputedStyle(el);
  const secs = (parseFloat(cs.animationDelay) || 0) + (parseFloat(cs.animationDuration) || 0);
  el.addEventListener('animationend', release, { once: true });
  setTimeout(release, secs > 0 ? secs * 1000 + 60 : 0);
}

function setCharacter(id, pose) {
  const el = document.getElementById(id);
  if (!el) return;
  /* stamp WHICH companion is showing on the wrapper: the two monsters' poses
     have very different aspect ratios, so a slot that sizes one of them well
     can render the other at nearly twice the height (screen 4, 27.09). */
  const who = CHARACTER_IDS.includes(window.lomdaState.selectedCharacter)
    ? window.lomdaState.selectedCharacter : DEFAULT_CHARACTER;
  if (el.parentElement) el.parentElement.dataset.char = who;
  const want = characterAsset(pose);
  if (!el.getAttribute('src') || !el.getAttribute('src').endsWith(want)) el.setAttribute('src', want);
  if (el.tagName === 'VIDEO') { el.load(); el.currentTime = 0; el.play().catch(() => {}); }
}

/* A slot whose pose may resolve to a CLIP for one monster and a STILL for the
   other — the element type has to follow the asset. */
function setCharacterMedia(wrapId, pose, alt) {
  const wrap = document.getElementById(wrapId);
  if (!wrap) return;
  const src = characterAsset(pose);
  if (wrap.dataset.src === src) {
    const v = wrap.querySelector('video');
    if (v) { v.currentTime = 0; v.play().catch(() => {}); }
    return;
  }
  wrap.dataset.src = src;
  const label = alt || 'הדמות המלווה';
  wrap.innerHTML = /\.mp4$/.test(src)
    ? `<video class="transition-video" src="${src}" autoplay muted loop playsinline aria-label="${label}"></video>`
    : `<img class="transition-still" src="${src}" alt="${label}">`;
}

/* ═══════════════════════════════════════════════════════════
   S0 — deck slide 3 · TwoOptionSelection
   ═══════════════════════════════════════════════════════════ */
function selectOption(cardEl) {
  document.querySelectorAll('#s0 .option-card').forEach(c => {
    c.classList.remove('selected');
    c.setAttribute('aria-checked', 'false');
  });
  cardEl.classList.add('selected');
  cardEl.setAttribute('aria-checked', 'true');
  /* Through the platform layer when it is loaded: the choice lands in this component's state
     document as well as the localStorage mirror the later components adopt it from (40-resume.js
     setUnitCharacter / adoptUnitCharacter). */
  if (typeof setUnitCharacter === 'function') setUnitCharacter(cardEl.dataset.value);
  else {
    window.lomdaState.selectedCharacter = cardEl.dataset.value;
    try { localStorage.setItem(CHARACTER_STORAGE_KEY, cardEl.dataset.value); } catch (e) {}
  }
  const btn = document.getElementById('s0-continue');
  if (btn) btn.disabled = false;
}

function s0Enter() {
  const saved = window.lomdaState.selectedCharacter;
  document.querySelectorAll('#s0 .option-card').forEach(card => {
    const isSel = !!saved && card.dataset.value === saved;
    card.classList.toggle('selected', isSel);
    card.setAttribute('aria-checked', isSel ? 'true' : 'false');
  });
  const cont = document.getElementById('s0-continue');
  if (cont) cont.disabled = !saved;
}

/* Keyboard select on the cards — the template binds this rather than putting
   an inline onkeydown on each card. */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#s0 .option-card').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectOption(card); }
    });
  });
});

/* ─── per-screen entry ─────────────────────────────────────── */
function resetScreenState(n) {
  if (typeof quizResetScreenState === 'function') quizResetScreenState(n);
  switch (n) {
    case 0: s0Enter(); break;
    case 1: setCharacter('s1-char', 'standing'); break;   /* deck image3 is 221x211 — the normal pose */
    /* deck slide 5 has NO companion: the callout belongs to the photo, so the
       delayed element to wait for is the bubble itself. (The old
       setCharacter('s2-char') call was dead — no such element exists.) */
    case 2: gateOnReveal(document.getElementById('s2'), '.s2-bubble'); break;
    case 3: setCharacter('s3-char', 'standing'); break;
    case 4: setCharacter('s4-char', 'squashed'); break;   /* deck image9 IS character-squashed-*.png */
    case 5: carEnter(); break;                      /* the 12-step carousel */
    case 7: setCharacterMedia('s7-char', 'duo'); break;
    case 8: gEnter(); break;                        /* the 7-step guided flow */
    case 9: setCharacterMedia('s9-char', 'reading'); break;
    case 12: setCharacterMedia('s12-char', 'spinning'); break;
    case 13: if (typeof dinoWire === 'function') dinoWire(); break;   /* the applet */
    case 17: setCharacterMedia('s17-char', 'practice'); break;
    case 24: setCharacterMedia('s24-char', 'cube2'); break;
    case 27: setCharacterMedia('s27-char', 'calc'); break;
    case 28: setCharacter('s28-char', 'magnifier'); break;
    case 31: setCharacter('s31-char', 'standing'); break;
    case 34: setCharacter('s34-char', 'victory'); break;
    case 35: setCharacterMedia('s35-char', 'spinning'); break;
    case 38: debateTails(); break;                  /* the two speech-bubble tails */
    case 43: setCharacterMedia('s43-char', 'breakdance'); break;
    case 44: setCharacter('s44-char', 'standing'); break;
    case 45: setCharacterMedia('s45-char', 'victory'); break;   /* deck 71: מטפס על הר, מגיע לפסגה */
    case 51: setCharacterMedia('s51-char', 'climbing'); break;  /* deck 78 — producer clips 30.09 */
    default: break;
  }
}

/* ─── dslide 38 — the debate bubbles' tails ────────────────────────
   Producer 06.10: "i really want to make the text bubbles come out of their
   mouths". The two mouths were measured off pizza-debate.jpg and live on the
   figure as percentages OF THE PHOTO; everything else is read from the live
   boxes, so the tail re-aims itself when the copy rewraps or the type size
   changes. (Typed tail coordinates are what the callout-positioning rule
   forbids, and they would be wrong the moment a bubble gains a line.)

   The path is open — M base1 L apex L base2 — with a white fill and a stroke.
   The fill auto-closes across the base and therefore paints over the bubble's
   own bottom border between the two base points, which is what makes the tail
   read as part of the bubble instead of a triangle stuck to it. Only the two
   arms are stroked. ─── */
function debateTails() {
  const fig = document.querySelector('#q38 .debate-fig, [data-screen="38"] .debate-fig');
  const svg = fig && fig.querySelector('.debate-tails');
  const photo = fig && fig.querySelector('.debate-photo');
  if (!fig || !svg || !photo) return;

  const draw = () => {
    const F = fig.getBoundingClientRect(), P = photo.getBoundingClientRect();
    /* a hidden screen measures 0 (maven-skills §8) — never draw from that */
    if (!F.width || !P.width) return;
    svg.setAttribute('viewBox', `0 0 ${F.width} ${F.height}`);

    const paths = ['natanel', 'roni'].map(who => {
      const bub = fig.querySelector('.debate-bubble--' + who);
      const raw = fig.dataset['mouth' + who[0].toUpperCase() + who.slice(1)];
      if (!bub || !raw) return '';
      const [mx, my] = raw.split(',').map(Number);
      /* mouth, in figure coordinates */
      const ax = P.left - F.left + P.width * mx / 100;
      const ay = P.top - F.top + P.height * my / 100;

      const B = bub.getBoundingClientRect();
      const by = B.bottom - F.top - 1;            /* sit on the bubble's border */
      /* The tail leaves from the bubble's INNER edge — the one nearer the middle
         of the figure — not from directly above the mouth. Dropped straight down
         it ran over the speaker's forehead and eyes; leaving from the inner edge
         sends it through the empty gap between the two of them (whiteboard) and
         it only meets the face at the mouth itself. Narrow, 18px, for the same
         reason. */
      const W = 18, R = 16;
      const left = B.left - F.left, right = B.right - F.left;
      const mid = F.width / 2;
      const inner = Math.abs(left - mid) < Math.abs(right - mid)
        ? left + R + W / 2          /* bubble sits right of centre */
        : right - R - W / 2;        /* bubble sits left of centre */
      const cx = Math.min(Math.max(inner, left + R + W / 2), right - R - W / 2);
      if (!isFinite(cx)) return '';
      return `<path d="M ${cx - W / 2} ${by} L ${ax} ${ay} L ${cx + W / 2} ${by}" ` +
             `fill="#fff" stroke="#303030" stroke-width="1.5" stroke-linejoin="round"/>`;
    }).join('');
    svg.innerHTML = paths;
  };

  draw();
  /* the photo decides the geometry, so redraw once it has actually decoded —
     a cold load measures an unsized <img> (the zoom-init decode race) */
  if (!photo.complete || !photo.naturalWidth) photo.addEventListener('load', draw, { once: true });
  window.addEventListener('resize', draw);
}

/* ─── Speech-bubble frame ──────────────────────────────────────────
   The bubble outline is an SVG path injected at render time, not a CSS
   border: the tail has to join the rounded body cleanly at any size, and
   a rotated CSS square renders a diagonal wedge instead (ratio-06, 15.09).
   Copied verbatim from the delivered percent-08. engine.js calls
   decorateBubbles(screen) on every goTo. ─── */
/* Figma bubble shapes (551:12741 / 551:12742) — vendored verbatim from the
   approved proportion-2-1 build (maven-skills §8i). */
function bubblePathBottom(w, h) {
  const r = 10, i = 1, cx = w / 2, td = 15.3, tw = 17;
  return `M ${i + r} ${i} H ${w - i - r} A ${r} ${r} 0 0 1 ${w - i} ${i + r}` +
    ` V ${h - i - r} A ${r} ${r} 0 0 1 ${w - i - r} ${h - i}` +
    ` H ${cx + tw} L ${cx} ${h - i + td} L ${cx - tw} ${h - i}` +
    ` H ${i + r} A ${r} ${r} 0 0 1 ${i} ${h - i - r}` +
    ` V ${i + r} A ${r} ${r} 0 0 1 ${i + r} ${i} Z`;
}

function bubblePathSideLeft(w, h) {
  const r = 8.5, i = 1, cy = h / 2, td = 17.6, th = 11.3;
  return `M ${i + r} ${i} H ${w - i - r} A ${r} ${r} 0 0 1 ${w - i} ${i + r}` +
    ` V ${h - i - r} A ${r} ${r} 0 0 1 ${w - i - r} ${h - i}` +
    ` H ${i + r} A ${r} ${r} 0 0 1 ${i} ${h - i - r}` +
    ` V ${cy + th} L ${i - td} ${cy} L ${i} ${cy - th}` +
    ` V ${i + r} A ${r} ${r} 0 0 1 ${i + r} ${i} Z`;
}

/* mirror of bubblePathSideLeft: notch on the RIGHT edge, so the bubble can sit
   to the LEFT of the character and point at it (producer 14.09.26). */
function bubblePathSideRight(w, h) {
  const r = 8.5, i = 1, cy = h / 2, td = 17.6, th = 11.3;
  return `M ${i + r} ${i} H ${w - i - r} A ${r} ${r} 0 0 1 ${w - i} ${i + r}` +
    ` V ${cy - th} L ${w - i + td} ${cy} L ${w - i} ${cy + th}` +
    ` V ${h - i - r} A ${r} ${r} 0 0 1 ${w - i - r} ${h - i}` +
    ` H ${i + r} A ${r} ${r} 0 0 1 ${i} ${h - i - r}` +
    ` V ${i + r} A ${r} ${r} 0 0 1 ${i + r} ${i} Z`;
}

function decorateBubbles(scope) {
  (scope || document).querySelectorAll('.speech-bubble').forEach(b => {
    const w = b.offsetWidth, h = b.offsetHeight;
    if (!w || !h) return;
    const key = w + 'x' + h;
    if (b.dataset.bubbleSize === key) return;
    b.dataset.bubbleSize = key;
    const stale = b.querySelector('.bubble-shape');
    if (stale) stale.remove();
    if (!b.dataset.bubbleWatched) {
      b.dataset.bubbleWatched = '1';
      if (window.ResizeObserver) {
        new ResizeObserver(() => decorateBubbles(b.parentElement || b)).observe(b);
      }
    }
    let svg;
    if (b.classList.contains('side-bubble--right')) {
      const td = 18;
      svg = `<svg class="bubble-shape" style="left:0;top:0;width:${w + td}px;height:${h}px" ` +
        `viewBox="0 0 ${w + td} ${h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
        `<path d="${bubblePathSideRight(w, h)}" fill="white" stroke-width="2" stroke-linejoin="round"/></svg>`;
    } else if (b.classList.contains('side-bubble')) {
      const td = 18;
      svg = `<svg class="bubble-shape" style="left:${-td}px;top:0;width:${w + td}px;height:${h}px" ` +
        `viewBox="${-td} 0 ${w + td} ${h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
        `<path d="${bubblePathSideLeft(w, h)}" fill="white" stroke-width="2" stroke-linejoin="round"/></svg>`;
    } else {
      const td = 17;
      svg = `<svg class="bubble-shape" style="left:0;top:0;width:${w}px;height:${h + td}px" ` +
        `viewBox="0 0 ${w} ${h + td}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
        `<path d="${bubblePathBottom(w, h)}" fill="white" stroke-width="2" stroke-linejoin="round"/></svg>`;
    }
    b.insertAdjacentHTML('afterbegin', svg);
  });
}

function advanceScreen() { goTo(currentScreen + 1); }
