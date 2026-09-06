/* GENERATED COPY -- DO NOT EDIT.
   Source of truth: _question-engine/question.js (canonical engine copy).
   Edit there, then re-run _question-engine/sync-question.ps1. */
'use strict';

/* ═══════════════════════════════════════════════════════════
   QUESTION ENGINE — one implementation of the shared question contract.

   Source of truth for the behaviour: 720-templates →
   references/_question-template-defaults.md. Everything that doc calls a
   default lives here once; a screen supplies only its DATA (which option is
   correct, what the popups say) and its deviations.

   WHY AN ENGINE AND NOT ONE BLOCK PER SCREEN
   The reference projects hand-write each question, which is right for six of
   them. This unit has ~25 across five parts, and the contract has several
   clauses that are easy to get subtly wrong in the twentieth copy and never
   notice — "a non-final wrong marks NOTHING", "resubmitting the identical
   wrong answer must not burn attempt 2", "two flags, not one, or return
   grants a fresh attempt". Those are written once here.

   Per-screen deviations still belong in the screen: pass them in, or drive
   the DOM yourself and let the engine handle only the parts you want.

   DOM CONTRACT — a screen N provides:
     #sN-opt-<key>   .scq-opt buttons          (kind: 'single' | 'multi')
     #sN-in-<key>    .viq-input inputs         (kind: 'value')
     #sN-submit      the check/continue pill
     #sN-hint        hint button      (optional)
     #sN-hint-overlay                 (optional)
     #sN-popup / #sN-popup-title / #sN-popup-body
   ═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   PROGRESS QUESTION STRIP

   Generated rather than written out: the shipped markup carries two inline
   SVGs per item, and this unit needs the strip on six screens per practice
   block. Thirty-six hand-copied blobs is a diff nobody can read and a
   guaranteed drift.

   06.09 — this now renders percent-04's strip (.qprog), the one the client
   approved on 31.08.26, rather than this project's own .progress-question:
   numbered stations with tick/cross states instead of two labelled dots and
   a hairline. Part 01 had already been moved over by hand; the rest of the
   unit follows from here, so there is one stepper and not two.

   States are the approved component's: correct and incorrect share the SAME
   solid subject circle and differ only by glyph — colour does not encode
   correctness — and the connector fills once the lower-numbered question
   beside it resolves.
   ═══════════════════════════════════════════════════════════ */
window.ProgressStrip = (function () {
  /* 06.09 — the two glyphs of percent-04's strip. They MUST keep their class
     attributes: the CSS hides every svg in a dot and then re-shows exactly
     one by class, so a copy without `class="qp-tick"` renders a dot with no
     mark on it and a correct answer looks unanswered. */
  const TICK = '<svg class="qp-tick" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1.5 6.2l3 3 6-6.4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const XMARK = '<svg class="qp-x" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';

  /* results: { <1-based index>: 'correct' | 'wrong' }, current: 1-based */
  function render(host, count, current, results) {
    if (!host) return;
    results = results || {};
    /* The host is authored as .progress-question; swap it for the approved
       component's class here rather than in seven index.html files, and carry
       the one positioning modifier across with it (05/S3 sits at the right
       edge instead of centred). */
    if (host.classList.contains('progress-question--clear')) {
      host.classList.remove('progress-question--clear');
      host.classList.add('qprog--clear');
    }
    host.classList.remove('progress-question');
    host.classList.add('qprog');
    host.setAttribute('aria-hidden', 'true');

    let html = '';
    for (let i = 1; i <= count; i++) {
      const r = results[i];
      const cls = (r === 'correct' ? 'is-correct' : r === 'wrong' ? 'is-wrong' : '') +
                  (i === current ? ' is-current' : '');
      html += '<div class="qprog-station ' + cls + '" data-question="' + i + '">' +
                '<span class="qprog-dot">' + TICK + XMARK + '</span>' +
                '<span class="qprog-label">שאלה ' + i + '</span>' +
              '</div>';
      /* RTL: station i+1 sits to the LEFT of station i, so the connector
         between them fills once the RIGHT-hand (lower-numbered) one resolves. */
      if (i < count) {
        html += '<span class="qprog-line' + (r ? ' is-done' : '') + '"></span>';
      }
    }
    host.innerHTML = html;
  }
  return { render: render };
})();

window.Q = (function () {

  const specs = {};   // screen index -> config
  const state = {};   // screen index -> mutable state

  const el = (n, suffix) => document.getElementById('s' + n + suffix);

  /* ── Answer readers, one per mechanic ────────────────────
     Each returns a comparable snapshot, or null when incomplete. Returning
     null is what keeps Submit disabled — "disabled until every required
     input is filled" is one rule, expressed once. */
  const READERS = {
    single: function (n) {
      const s = state[n];
      return s.choice;
    },
    multi: function (n) {
      const s = state[n];
      return s.picks.length ? s.picks.slice().sort().join(',') : null;
    },
    /* A shared pool filling N slots — spec slide 27 calls it
       ValueinputQuestion, but its note says "שאלת בחירה מתוך מאגר (אותו מאגר
       בשתי התיבות)", which is dropdown mechanics. Order between slots does
       not matter, so the snapshot is sorted. */
    pool: function (n) {
      const s = state[n], spec = specs[n];
      const filled = spec.slots.map(function (k) { return s.slots[k] || ''; });
      if (filled.some(function (v) { return v === ''; })) return null;
      /* `ordered: true` grades by POSITION. The default sorts, because slide
         27's two blanks are interchangeable (2017/2022 == 2022/2017). A
         proportion table is the opposite case: the same three chips in the
         wrong cells is a wrong table, so 2-2's slides 11 and 16 set it. */
      return spec.ordered ? filled.join('|') : filled.slice().sort().join('|');
    },
    /* N rows, each picking one value from a shared set. Covers three shapes
       that look different on screen but grade identically:
       StatementAssessmentQuestion (נכון/לא נכון per statement),
       DropdownQuestion with a category per table row, and the כן/לא grid. */
    rows: function (n) {
      const st = state[n];
      const picked = specs[n].rows.map(function (r) { return st.rows[r] || ''; });
      if (picked.some(function (v) { return v === ''; })) return null;
      return picked.join('|');
    },
    value: function (n) {
      const spec = specs[n];
      const vals = spec.inputs.map(function (k) {
        const inp = el(n, '-in-' + k);
        return inp ? String(inp.value).trim() : '';
      });
      return vals.every(function (v) { return v !== ''; }) ? vals.join('|') : null;
    },
  };

  /* Normalises a spec's `correct` into the same shape a reader returns, so
     comparison is a single string equality regardless of mechanic. */
  function correctSnapshot(n) {
    const spec = specs[n];
    if (spec.kind === 'multi')  return spec.correct.slice().sort().join(',');
    if (spec.kind === 'pool')   return spec.ordered ? spec.correct.join('|')
                                                    : spec.correct.slice().sort().join('|');
    if (spec.kind === 'rows')   return spec.rows.map(function (r) { return spec.correct[r]; }).join('|');
    if (spec.kind === 'value')  return spec.correct.join('|');
    return spec.correct;
  }

  function isComplete(n) { return READERS[specs[n].kind](n) !== null; }

  /* Accepted values for value-input slot i. A spec may give a plain string or
     a list — slide 38 marks "2:12" right but also accepts "1:6", because the
     reduced form is an equally correct way to state the same ratio. */
  function accepted(spec, i) {
    const c = spec.correct[i];
    return Array.isArray(c) ? c : [c];
  }

  function valueIsRight(n) {
    const spec = specs[n];
    return spec.inputs.every(function (k, i) {
      const inp = el(n, '-in-' + k);
      const v = inp ? String(inp.value).trim() : '';
      return accepted(spec, i).indexOf(v) !== -1;
    });
  }

  function isRight(n, snap) {
    if (specs[n].kind === 'value') return valueIsRight(n);
    return snap === correctSnapshot(n);
  }

  /* ── Marking ─────────────────────────────────────────────
     Called ONLY on resolve. A non-final wrong deliberately marks nothing:
     marking on attempt 1 gives the answer away and turns attempt 2 into a
     formality. */
  function applyMarks(n) {
    const spec = specs[n], s = state[n];
    if (spec.kind === 'value') {
      spec.inputs.forEach(function (k, i) {
        const inp = el(n, '-in-' + k);
        if (!inp) return;
        inp.disabled = true;
        inp.classList.remove('correct', 'wrong');
        inp.classList.add(accepted(spec, i).indexOf(String(inp.value).trim()) !== -1 ? 'correct' : 'wrong');
      });
      return;
    }
    if (spec.kind === 'rows') {
      const st = state[n];
      spec.rows.forEach(function (r) {
        const right = spec.correct[r];
        const sel = document.getElementById('s' + n + '-sel-' + r);
        if (sel) {
          sel.disabled = true;
          sel.classList.remove('correct', 'wrong');
          sel.classList.add(st.rows[r] === right ? 'correct' : 'wrong');
          return;
        }
        spec.rowOptions.forEach(function (v) {
          const b = document.getElementById('s' + n + '-row-' + r + '-' + v);
          if (!b) return;
          b.disabled = true;
          b.classList.remove('correct', 'wrong');
          // Only the row's own pick is judged; the untaken option stays plain
          // so a wrong row does not also advertise the right answer twice.
          if (st.rows[r] === v) b.classList.add(v === right ? 'correct' : 'wrong');
          else if (v === right && st.rows[r] !== right) b.classList.add('correct');
        });
      });
      return;
    }
    if (spec.kind === 'pool') {
      const s2 = state[n];
      spec.slots.forEach(function (k, i) {
        const slot = el(n, '-slot-' + k);
        if (!slot) return;
        slot.classList.remove('correct', 'wrong', 'corrected');
        /* Ordered: this slot is right only if it holds the value expected AT
           this position. Unordered keeps the set test — a chip that belongs
           in the answer is correct wherever the learner parked it. */
        const want = spec.ordered ? spec.correct[i] : null;
        const ok = spec.ordered ? s2.slots[k] === want
                                : spec.correct.indexOf(s2.slots[k]) !== -1;
        /* REVEAL on a final wrong, per the shared contract ("Wrong, final
           attempt → Reveal the correct answer"). An ordered pool knows what
           belongs in each cell, so it writes it in: leaving the learner's own
           wrong values on screen under a popup that says "הנה התשובה" shows
           them everything except the answer it just promised.
           Only on wrong2 — `which` is 'correct' when they got it right, and
           a non-final wrong marks nothing at all. */
        if (s2.resolvedAs === 'wrong2' && spec.ordered && want !== undefined) {
          if (slot.tagName !== 'SELECT') slot.textContent = want;
          slot.classList.add('filled');
          slot.classList.add(ok ? 'correct' : 'corrected');
        } else {
          slot.classList.add(ok ? 'correct' : 'wrong');
        }
      });
      (spec.pool || []).forEach(function (v) {
        const b = document.getElementById('s' + n + '-pool-' + v);
        if (b) b.disabled = true;
      });
      return;
    }
    const correct = spec.kind === 'multi' ? spec.correct : [spec.correct];
    spec.options.forEach(function (k) {
      const b = el(n, '-opt-' + k);
      if (!b) return;
      b.disabled = true;
      b.classList.remove('selected', 'correct', 'wrong');
      const picked = spec.kind === 'multi' ? s.picks.indexOf(k) !== -1 : s.choice === k;
      if (correct.indexOf(k) !== -1) b.classList.add('correct');
      else if (picked) b.classList.add('wrong');
    });
  }

  function clearMarks(n) {
    const spec = specs[n];
    if (spec.kind === 'value') {
      spec.inputs.forEach(function (k) {
        const inp = el(n, '-in-' + k);
        if (!inp) return;
        inp.disabled = false;
        inp.value = '';
        inp.classList.remove('correct', 'wrong');
      });
      return;
    }
    if (spec.kind === 'rows') {
      spec.rows.forEach(function (r) {
        const sel = document.getElementById('s' + n + '-sel-' + r);
        if (sel) {
          sel.disabled = false;
          sel.value = '';
          sel.classList.remove('correct', 'wrong');
        }
        spec.rowOptions.forEach(function (v) {
          const b = document.getElementById('s' + n + '-row-' + r + '-' + v);
          if (b) { b.disabled = false; b.classList.remove('correct', 'wrong', 'selected'); }
        });
      });
      return;
    }
    if (spec.kind === 'pool') {
      const s2 = state[n];
      s2.slots = {};
      spec.slots.forEach(function (k) {
        const slot = el(n, '-slot-' + k);
        if (!slot) return;
        slot.classList.remove('correct', 'wrong', 'filled');
        /* Same reason as renderPool: clearing a <select> means clearing its
           VALUE, not emptying the element of its options. */
        if (slot.tagName === 'SELECT') { slot.value = ''; slot.disabled = false; }
        else slot.textContent = '';
      });
      (spec.pool || []).forEach(function (v) {
        const b = document.getElementById('s' + n + '-pool-' + v);
        if (b) { b.disabled = false; b.classList.remove('used'); }
      });
      return;
    }
    spec.options.forEach(function (k) {
      const b = el(n, '-opt-' + k);
      if (!b) return;
      b.disabled = false;
      b.classList.remove('selected', 'correct', 'wrong');
    });
  }

  /* Rows: one pick per row, from the shared option set. */
  function rowPick(n, rowKey, value) {
    const spec = specs[n], st = state[n];
    if (st.answered) return;
    st.rows[rowKey] = value;
    const sel = document.getElementById('s' + n + '-sel-' + rowKey);
    if (sel) { sel.value = value; refreshSubmit(n); return; }
    spec.rowOptions.forEach(function (v) {
      const b = document.getElementById('s' + n + '-row-' + rowKey + '-' + v);
      if (b) b.classList.toggle('selected', v === value);
    });
    refreshSubmit(n);
  }

  /* Pool: clicking a value drops it into the active slot; clicking a filled
     slot clears it. One value can occupy only one slot at a time. */
  function poolPick(n, value) {
    const spec = specs[n], s = state[n];
    if (s.answered) return;
    // Fill the first empty slot, or replace the active one.
    let target = s.activeSlot;
    if (!target || s.slots[target]) {
      target = spec.slots.filter(function (k) { return !s.slots[k]; })[0] || spec.slots[0];
    }
    // A value already placed elsewhere moves rather than duplicates.
    spec.slots.forEach(function (k) { if (s.slots[k] === value) delete s.slots[k]; });
    s.slots[target] = value;
    s.activeSlot = null;
    renderPool(n);
    refreshSubmit(n);
  }

  /* The twin of slotClear, for a pool question whose blanks are <select>s
     rather than chips: the control names its own slot, so the value goes to
     that slot instead of "the first empty one". Also the drop half of a
     drag-and-drop pool: the drop target names the slot. Grading is the same
     either way and follows the spec's `ordered` flag — unordered, 2017/2022
     and 2022/2017 are the same answer; ordered, they are not. */
  function slotSet(n, slotKey, value) {
    const s = state[n];
    if (s.answered) return;
    if (!value) { delete s.slots[slotKey]; }
    else {
      // A value already placed in the other blank moves rather than duplicates.
      (specs[n].slots || []).forEach(function (k) {
        if (k !== slotKey && s.slots[k] === value) delete s.slots[k];
      });
      s.slots[slotKey] = value;
    }
    s.activeSlot = null;
    renderPool(n);
    refreshSubmit(n);
  }

  function slotClear(n, slotKey) {
    const s = state[n];
    if (s.answered) return;
    delete s.slots[slotKey];
    s.activeSlot = slotKey;
    renderPool(n);
    refreshSubmit(n);
  }

  function renderPool(n) {
    const spec = specs[n], s = state[n];
    spec.slots.forEach(function (k) {
      const slot = el(n, '-slot-' + k);
      if (!slot) return;
      /* A <select> blank holds its own options — writing textContent into one
         deletes every <option> it has, which leaves an empty picker that can
         never be answered. Drive its value instead. */
      if (slot.tagName === 'SELECT') slot.value = s.slots[k] || '';
      else slot.textContent = s.slots[k] || '';
      slot.classList.toggle('filled', !!s.slots[k]);
    });
    const used = spec.slots.map(function (k) { return s.slots[k]; });
    (spec.pool || []).forEach(function (v) {
      const b = document.getElementById('s' + n + '-pool-' + v);
      if (b) b.classList.toggle('used', used.indexOf(v) !== -1);
    });
  }

  /* ── Feedback popup ──────────────────────────────────────
     Body entries are HTML fragments on purpose: several explanations in this
     unit carry a fraction or a small table. */
  function showPopup(n, which) {
    const cfg = (specs[n].popups || {})[which];
    if (!cfg) return;
    const pop = el(n, '-popup');
    if (!pop) return;
    pop.style.background = cfg.bg ||
      (which === 'correct' ? '#edf8ed' : '#ffdbdc');
    const title = el(n, '-popup-title');
    if (title) title.textContent = cfg.title || '';
    const body = el(n, '-popup-body');
    if (body) {
      body.innerHTML = '';
      (cfg.body || []).forEach(function (html) {
        const p = document.createElement('p');
        p.innerHTML = html;
        body.appendChild(p);
      });
    }
    /* A popup the learner dragged aside on the previous question must not
       open off-position on the next one. The engine does not own dragging —
       the project does — so it calls the hook only when the project defines
       one, and only on an open from HIDDEN, which leaves a popup that is
       already up (a retry -> wrong2 body swap) exactly where the learner
       put it. */
    const wasHidden = pop.classList.contains('hidden');
    if (wasHidden && typeof window.resetPopupPosition === 'function') {
      window.resetPopupPosition(pop);
    }
    pop.classList.remove('hidden');
  }

  function hidePopup(n) {
    const pop = el(n, '-popup');
    if (pop) pop.classList.add('hidden');
  }

  /* ── Submit gating ───────────────────────────────────────
     Enabled when the answer is complete AND differs from the wrong answer
     already submitted. Without that second clause, resubmitting an unchanged
     wrong answer silently consumes the last attempt. */
  function refreshSubmit(n) {
    const s = state[n], btn = el(n, '-submit');
    if (!btn || s.answered) return;
    const snap = READERS[specs[n].kind](n);
    btn.disabled = (snap === null) || (s.lastWrong !== null && snap === s.lastWrong);
  }

  /* ── Public: selection handlers ──────────────────────────*/
  function select(n, key) {
    const spec = specs[n], s = state[n];
    if (s.answered) return;
    if (spec.kind === 'multi') {
      const i = s.picks.indexOf(key);
      if (i === -1) s.picks.push(key); else s.picks.splice(i, 1);
      spec.options.forEach(function (k) {
        const b = el(n, '-opt-' + k);
        if (b) b.classList.toggle('selected', s.picks.indexOf(k) !== -1);
      });
    } else {
      s.choice = key;
      spec.options.forEach(function (k) {
        const b = el(n, '-opt-' + k);
        if (b) b.classList.toggle('selected', k === key);
      });
    }
    refreshSubmit(n);
  }

  /* ── Public: submit ──────────────────────────────────────*/
  function submit(n) {
    const spec = specs[n], s = state[n];
    /* Already resolved: applyResolved() has relabelled this pill from
       "צדקתי?" to the continue label, so a click on it now means "go on",
       not "check my answer". Returning here — which is what this did — left
       every question screen in the unit with a DEAD continue button. The
       only way forward was the ArrowLeft key, so a learner opening the root
       index.html got four screens in and stopped: parts 02-05 were
       unreachable by clicking at all.

       The host owns navigation, not the engine, so this defers to
       window.advanceScreen the same way the relabel defers to
       window.setNavLabel — and stays a no-op if the host has neither. */
    if (s.answered) {
      if (typeof window.advanceScreen === 'function') window.advanceScreen();
      return;
    }
    const snap = READERS[spec.kind](n);
    if (snap === null) return;

    s.attempts++;
    if (isRight(n, snap)) { resolve(n, 'correct'); return; }

    if (s.attempts < (spec.maxAttempts || 2)) {
      s.lastWrong = snap;
      const btn = el(n, '-submit');
      if (btn) btn.disabled = true;
      showPopup(n, 'retry');
      // The hint is often the point of a retry, so reveal it here when the
      // screen asked for reveal-after-wrong rather than always-visible.
      if (spec.hintAfterWrong) {
        const h = el(n, '-hint');
        if (h) h.style.visibility = '';
      }
      return;
    }
    resolve(n, 'wrong2');
  }

  function resolve(n, which) {
    const s = state[n];
    s.answered = true;
    s.done = true;
    s.resolvedAs = which;
    applyResolved(n);
    showPopup(n, which);
    if (typeof specs[n].onResolve === 'function') specs[n].onResolve(which);
  }

  /* Draws the resolved view. Called on resolve AND on every return to the
     screen, so the live path and the resume path cannot drift apart. */
  function applyResolved(n) {
    const spec = specs[n], s = state[n];
    if (!s.answered) return;
    applyMarks(n);
    const btn = el(n, '-submit');
    if (btn) {
      btn.disabled = false;
      if (typeof window.setNavLabel === 'function') {
        setNavLabel(btn, spec.continueLabel || 'שנמשיך?');
      }
    }
    const h = el(n, '-hint');
    // visibility, not display: the bottom bar keeps its layout.
    if (h) h.style.visibility = 'hidden';
  }

  function resetInitial(n) {
    const spec = specs[n], s = state[n];
    s.choice = null;
    s.picks = [];
    s.slots = {};
    s.rows = {};
    s.activeSlot = null;
    s.attempts = 0;
    s.answered = false;
    s.done = false;
    s.lastWrong = null;
    s.resolvedAs = null;
    clearMarks(n);
    const btn = el(n, '-submit');
    if (btn) {
      btn.disabled = true;
      if (typeof window.setNavLabel === 'function') setNavLabel(btn, spec.submitLabel || 'צדקתי?');
    }
    const h = el(n, '-hint');
    if (h) h.style.visibility = spec.hintAfterWrong ? 'hidden' : '';
    hidePopup(n);
  }

  /* ── Public: the resetScreenState hook ───────────────────
     The two-flag rule lives here: `done` guards the initial reset so that
     returning to an answered question never grants a new attempt, while
     `answered` drives the resolved view. */
  function restore(n) {
    if (!specs[n]) return;
    if (!state[n].done) resetInitial(n);
    applyResolved(n);
    /* 06.09, producer: coming BACK to an answered question re-opens the
       verdict it ended on, not just its marks. goTo() closes every popup on
       navigation, so without this the learner returns to a screen that shows
       a right/wrong tick and no explanation of it. resolvedAs is the verdict
       the question SETTLED on ('correct' or 'wrong2') — never the mid-attempt
       'retry', which is why the popup that comes back is the one the learner
       actually finished on. */
    if (state[n].answered && state[n].resolvedAs) {
      showPopup(n, state[n].resolvedAs);
    }
  }

  function isAnswered(n) { return !!(state[n] && state[n].answered); }

  /* How the question RESOLVED, not whether the last click was right: a
     question answered correctly on attempt 2 is still correct. Read back by
     the progress strip so the strip cannot disagree with the engine. */
  function wasCorrect(n) { return !!(state[n] && state[n].resolvedAs === 'correct'); }

  /* ── Hint overlay ────────────────────────────────────────*/
  function openHint(n)  { const o = el(n, '-hint-overlay'); if (o) o.classList.remove('hidden'); }
  function closeHint(n) { const o = el(n, '-hint-overlay'); if (o) o.classList.add('hidden'); }
  function closeHintOnBackdrop(n, e) { if (e.target === e.currentTarget) closeHint(n); }

  /* ── Registration ────────────────────────────────────────*/
  function define(cfg) {
    const n = cfg.screen;
    specs[n] = cfg;
    state[n] = { choice: null, picks: [], slots: {}, rows: {}, activeSlot: null,
                 attempts: 0, answered: false, done: false,
                 lastWrong: null, resolvedAs: null };
    // Value inputs re-gate Submit as they are typed.
    if (cfg.kind === 'value') {
      (cfg.inputs || []).forEach(function (k) {
        const inp = el(n, '-in-' + k);
        if (inp) inp.addEventListener('input', function () { refreshSubmit(n); });
      });
    }
    resetInitial(n);
  }

  return {
    define: define,
    /* Read-only access to a registered question's config. The DEV harness
       uses it to open a feedback state without answering wrongly on purpose;
       nothing in the lomda itself reads it. */
    spec: function (n) { return specs[n]; },
    select: select,
    poolPick: poolPick,
    rowPick: rowPick,
    slotSet: slotSet,
    slotClear: slotClear,
    submit: submit,
    restore: restore,
    isAnswered: isAnswered,
    wasCorrect: wasCorrect,
    openHint: openHint,
    closeHint: closeHint,
    closeHintOnBackdrop: closeHintOnBackdrop,
    hidePopup: hidePopup,
  };
})();
