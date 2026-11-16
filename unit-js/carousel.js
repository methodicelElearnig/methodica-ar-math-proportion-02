'use strict';
/* ═══════════════════════════════════════════════════════════════════
   S5 — the carousel · deck slides 8-19 (ONE screen, 12 steps)

   The deck draws a 9-dot strip on all twelve slides with the SAME dot
   active — it is a static mock, never advanced. The step count is the
   slides (12), and the indicator below is built from that.

   Four steps are graded (4, 6, 9, 10 — deck slides 11, 13, 16, 17);
   the rest are explanation. The bottom bar is the only control: המשך
   steps forward, and on a graded step it becomes צדקתי? until answered.
   ═══════════════════════════════════════════════════════════════════ */

/* ── The deck's annotated proportion equation (slides 14 and 18) ───────────
   A CENTRED fraction pair with three callout boxes around it: one beside the
   left fraction, and two to the right joined to the right fraction's numerator
   and denominator by leader lines. The lines are drawn in `eqfigWire()` from
   the laid-out geometry — hard-coded coordinates drift the moment the text
   rewraps. */
const eqfig = (left, tr, br, eq, opt) => {
  const o = opt || {};
  const at = o.lines === false ? ['', ''] : [' data-from="num"', ' data-from="den"'];
  const col = `<div class="eqfig-col">
      <div class="eqfig-box"${at[0]}>${tr}</div>
      <div class="eqfig-box"${at[1]}>${br}</div>
    </div>`;
  const box = `<div class="eqfig-box eqfig-box--l">${left}</div>`;
  const body = `<div class="eqfig-eq">${eq}</div>`;
  /* `mirror` puts the pair on the LEFT and the lone label on the RIGHT — which
     is how the deck lays out the second equation in slide 13's feedback. */
  return `<div class="eqfig${o.tight ? ' eqfig--tight' : ''}">
    <svg class="eqfig-lines" aria-hidden="true"></svg>
    ${o.mirror ? col + body + box : box + body + col}
  </div>`;
};

function eqfigWire(sec) {
  sec.querySelectorAll('.eqfig').forEach(fig => {
    const svg = fig.querySelector('.eqfig-lines');
    const eq = fig.querySelector('.eqfig-eq');
    if (!svg || !eq) return;
    /* the RIGHT fraction of the pair — its numerator and denominator are what
       the two callouts point at */
    const fracs = eq.querySelectorAll('.fraction');
    const target = fracs[fracs.length - 1];
    if (!target) return;
    const anchors = {
      num: target.querySelector('.frac-top'),
      den: target.querySelector('.frac-bottom'),
    };
    const F = fig.getBoundingClientRect();
    /* the stage is CSS-scaled to the window: getBoundingClientRect() gives SCALED
       pixels while the svg draws in the fig's own (unscaled) pixels — convert, or
       the lines shrink toward the corner whenever the window is not full size */
    const k = F.width ? fig.offsetWidth / F.width : 1;
    const W = fig.offsetWidth, H = fig.offsetHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    let d = '';
    fig.querySelectorAll('[data-from]').forEach(box => {
      const a = anchors[box.dataset.from];
      if (!a) return;
      const b = box.getBoundingClientRect(), t = a.getBoundingClientRect();
      /* from the box's edge nearest the equation to the anchor's far edge */
      /* 5px of air before the glyph — the line used to land ON the numerator
         and denominator of the y fraction. 10px was too much (producer 06.10). */
      const GAP = 5;
      const x1 = (b.left - F.left) * k, y1 = (b.top - F.top + b.height / 2) * k;
      const x2 = (t.right - F.left) * k + GAP, y2 = (t.top - F.top + t.height / 2) * k;
      d += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />`;
    });
    svg.innerHTML = d;
  });
}

/* the explanation both drag steps share under their feedback table */
const EXPL = 'هذا هو جدول التناسب الصحيح الذي يمكننا من خلاله إنشاء المعادلة وإيجاد المجهول.';

const CAR_STEPS = 12;
const CAR_TITLE = {
  1: 'كيف نتأكد من أن التناسب محفوظ؟', 2: 'كيف نتأكد من أن التناسب محفوظ؟',
  3: 'ياسمين تخبز كعكة',
  4: 'كيف نحوّل الغرامات إلى أكواب قياس؟', 5: 'كيف نحوّل الغرامات إلى أكواب قياس؟',
  6: 'كيف نحوّل الغرامات إلى أكواب قياس؟', 7: 'كيف نحوّل الغرامات إلى أكواب قياس؟',
  8: 'كم كوب طحين أبيض يحتاج الوصفة؟',
  9: 'كم كوبًا من السكر تحتاج ياسمين؟', 10: 'كم كوبًا من السكر تحتاج ياسمين؟',
  11: 'كم كوبًا من السكر تحتاج ياسمين؟', 12: 'كم كوبًا من السكر تحتاج ياسمين؟',
};

const fr = (n, d) => `<span class="fraction fr-inline"><span class="frac-top">${n}</span><span class="frac-bottom">${d}</span></span>`;
const eqp = (a, b) => `<span class="car-eq" dir="ltr">${a}<span class="car-eq-op">=</span>${b}</span>`;

/* A proportion table. `cells` are the four body values; a null becomes a
   drop target for the drag steps. */
function carTable(head2, rows, cells) {
  const td = (v, slot) => v === null
    ? `<td class="car-drop" data-slot="${slot}" aria-label="اسحبوا إلى هنا"></td>`
    : `<td>${v}</td>`;
  return `<table class="car-table"><thead><tr><th></th><th>${head2[0]}</th><th>${head2[1]}</th></tr></thead>
    <tbody>
      <tr><th>${rows[0]}</th>${td(cells[0], 0)}${td(cells[1], 1)}</tr>
      <tr><th>${rows[1]}</th>${td(cells[2], 2)}${td(cells[3], 3)}</tr>
    </tbody></table>`;
}

const CAR = [
  { /* 1 · deck 8 */ img: 'car-kitchen-AR.jpg', alt: 'مطبخ منزلي مع مكونات خبز',
    body: `<p>لنأخذ مثالاً من مطبخ ياسمين:</p>
      <p>في وصفات الخبز، يمكن أن تظهر كميات المكونات بالغرامات (وحدة وزن)<br>أو بأكواب القياس (التي تقيس حجم المكونات).</p>
      <p>كيف يمكننا العمل بأكواب القياس، عندما تكون الوصفة مكتوبة بالغرامات؟</p>`,
    bubble: 'كم غراماً يوجد<br>في كوب واحد؟', bubbleAt: 'step1' },

  { /* 2 · deck 9 */ img: 'car-cups-AR.jpg', alt: 'أكواب قياس مع طحين وسكر',
    body: `<p>كمية الغرامات التي يحتويها كوب القياس تختلف بين المكونات المختلفة.<br> على سبيل المثال، <strong>كوب الطحين </strong>يزن <strong>أقل من كوب السكر</strong>.</p>
      <p>يمكن الاستعانة بالتناسب (تساوي النسب) لتحويل الكميات<br> من غرامات إلى أكواب قياس بشكل دقيق.</p>`,
    under: `<img class="car-scales" src="assets/img/car-scales-AR.png"
        alt="ميزانان للمطبخ: كوب سكر أبيض 200 غرام، كوب طحين أبيض 140 غرام">`,
    bubble: 'الدقة هي المفتاح<br>لكعكة ناجحة!', bubbleAt: 'mouth' },

  { /* 3 · deck 10 */ img: 'car-baking-AR.jpg', alt: 'ياسمين تخبز كعكة',
    body: `<p>ياسمين تريد أن تخبز كعكة بمناسبة عيد ميلاد أمّها.</p>
      <p>كميات المكونات في الوصفة مذكورة بالغرامات، لكن الميزان الرقمي<br>الخاص بها تعطّل وليس لديها سوى أكواب قياس.</p>
      <p>في الوصفة مكتوب أنها تحتاج 280 غرام من الطحين.</p>
      <p>ياسمين بحثت في الإنترنت ووجدت:</p>`,
    under: '<div class="car-chip-note"><strong>1 كوب طحين أبيض = 140 غرام</strong></div>' },

  { /* 4 · deck 11 — GRADED, drag the numbers into the table */
    img: 'car-recipe-AR.jpg', alt: 'وصفة ومكوّنات',
    body: `<p>النسبة للطحين هي: <strong>1 كوب طحين أبيض = 140 غرام</strong></p>
      <p>وفقًا للوصفة، نحتاج 280 غرام من الطحين.<br>نرمز: x - عدد أكواب الطحين اللازمة لياسمين.</p>
      <p>أكملوا جدول التناسب عن طريق السحب:</p>`,
    grade: { kind: 'drag', pool: ['280', '140', 'x'],
      table: () => carTable(['نسبة معروفة', 'وصفة ياسمين'], ['عدد الأكواب', 'الكمية بالغرامات'], ['1', null, null, null]),
      correct: ['x', '140', '280'],   /* slots 1,2,3 in order */
      /* deck slide 11 holds THREE tables: the canvas one plus a FILLED copy
         inside each feedback popup. Both popups were shipping without it. */
      fb: () => carTable(['نسبة معروفة', 'وصفة ياسمين'], ['عدد الأكواب', 'الكمية بالغرامات'], ['1', 'x', '140', '280']),
      ok: { t: 'صحيح!', b: `${EXPL}` },
      no: { t: 'ليس دقيقًا، إليك الإجابة والشرح:', b: `${EXPL}` } } },

  { /* 5 · deck 12 — the deck does NOT split this screen: the copy runs across
       the top and image17 sits UNDER it at (70,433) 846x329, i.e. two thirds
       of the stage width. */
    stack: true, mediaW: 846,
    img: 'car-writing-AR.jpg', alt: 'ياسمين تسجّل الوصفة',
    body: `<p>للحفاظ على الدقة، سنستعين بالتناسب –<br>تساوي النسب بين عدد أكواب القياس والكمية بالغرامات.</p>
      <p><strong>عند كتابة التناسب، هناك أهمية كبيرة لترتيب الكلمات والأعداد.</strong></p>` },

  { /* 6 · deck 13 — GRADED, multi-select: TWO equations are right */
    body: `<p>بالنظر إلى جدول التناسب المكتمل:</p>
      ${carTable(['نسبة معروفة', 'وصفة ياسمين'], ['عدد الأكواب', 'كمية الغرامات'], ['1', 'x', '140', '280'])}
      <p><strong>حددوا - ما هي معادلة التناسب المناسبة؟ اختاروا جميع الإجابات المناسبة.</strong></p>`,
    grade: { kind: 'multi',
      opts: [eqp(fr('x', '140'), fr('1', '280')), eqp(fr('1', '140'), fr('x', '280')),
             eqp(fr('1', '140'), fr('280', 'x')), eqp(fr('280', 'x'), fr('140', '1'))],
      correct: [1, 3],
      ok: { t: 'إجابة صحيحة، أحسنت!', b: `<p>إذا كتبنا النسبة بين الأكواب (1) والغرامات (140)،<br> فإن النسبة المناظرة في التناسب تُكتب بحيث يكون عدد<br> الأكواب في البسط وكمية الغرامات في المقام.</p>
      ${eqfig('النسبة المعروفة بين الكؤوس<br>والغرامات لطحين أبيض',
              'عدد كؤوس الطحين<br>التي تريد ياسمين حسابها',
              'كمية الغرامات من<br>الطحين في الوصفة',
              eqp(fr('1', '140'), fr('x', '280')), { lines: false, tight: true })}
      <p>يمكن أيضًا كتابة النسبة بين الغرامات (140)<br> والأكواب (1)، وعندها النسبة المقابلة في التناسب ستُكتب<br> بنفس الترتيب - الغرامات في البسط والأكواب في المقام.</p>
      ${eqfig('النسبة المعروفة بين الغرامات<br>والأكواب لدقيق أبيض',
              'كمية الغرامات من<br>الطحين في الوصفة',
              'عدد كؤوس الطحين<br>التي تريد ياسمين حسابها',
              eqp(fr('280', 'x'), fr('140', '1')), { lines: false, tight: true, mirror: true })}
      <p><strong>ولذلك هناك إجابتان صحيحتان.</strong></p>` },
      no: { t: 'أخطأت في بعض البنود أو جميعها. الإجابة الصحيحة معروضة.', b: `<p>إذا كتبنا النسبة بين الأكواب (1) والغرامات (140)،<br> فإن النسبة المناظرة في التناسب تُكتب بحيث يكون عدد<br> الأكواب في البسط وكمية الغرامات في المقام.</p>
      ${eqfig('النسبة المعروفة بين الكؤوس<br>والغرامات لطحين أبيض',
              'عدد كؤوس الطحين<br>التي تريد ياسمين حسابها',
              'كمية الغرامات من<br>الطحين في الوصفة',
              eqp(fr('1', '140'), fr('x', '280')), { lines: false, tight: true })}
      <p>يمكن أيضًا كتابة النسبة بين الغرامات (140)<br> والأكواب (1)، وعندها النسبة المقابلة في التناسب ستُكتب<br> بنفس الترتيب - الغرامات في البسط والأكواب في المقام.</p>
      ${eqfig('النسبة المعروفة بين الغرامات<br>والأكواب لدقيق أبيض',
              'كمية الغرامات من<br>الطحين في الوصفة',
              'عدد كؤوس الطحين<br>التي تريد ياسمين حسابها',
              eqp(fr('280', 'x'), fr('140', '1')), { lines: false, tight: true, mirror: true })}
      <p><strong>ولذلك هناك إجابتان صحيحتان.</strong></p>` } } },

  { /* 7 · deck 14 — the annotated equation: three callouts with connector
       lines into the fraction, plus the companion and its bubble. */
    body: `<p><strong>نؤكّد مرة أخرى:</strong></p>
      <p>إذا اخترنا كتابة النسبة بين الأكواب (1) والغرامات<br> (140)، يجب كتابة كل نسبة إضافية في التناسب بحيث<br> تكون الكمية بالأكواب في البسط والكمية بالغرامات في المقام.</p>
      ${eqfig('نسبة التحويل بين الكؤوس<br>والغرامات للطحين الأبيض',
              'عدد كؤوس الطحين<br>التي تريد ياسمين حسابها',
              'كمية الغرامات من<br>الطحين في الوصفة',
              eqp(fr('1', '140'), fr('x', '280')))}`,
    /* deck slide 14 puts the companion bottom-left (image3 at -11,459) */
    monster: 'standing', bubble: 'هذا مهم جدًا، جيد<br>أنكم راجعتم ذلك!' },

  { /* 8 · deck 15 */ img: 'car-measuring-AR.jpg', alt: 'قياس الطحين بالكوب',
    /* the deck sets this line above the photo; producer asked for it as the
       companion's speech bubble rather than a body paragraph (27.09) */
    bubble: 'إذا تضاعفت الغرامات –<br>فالأكواب أيضًا تتضاعف!', bubbleAt: 'abovepic',
    body: `<p>نلاحظ أنّ: <span dir="ltr">140 · <strong>2</strong> = 280</span></p>
      <p>لكي يتحقق التساوي، يجب أن يكون الكسر ${fr('x', '280')}<br>توسيعًا بمقدار 2 للكسر ${fr('1', '140')}</p>
      <!-- the deck draws the two ·2 arcs as shapes; cropped from the rendered
           deck page rather than re-drawn (producer 27.09) -->
      <img class="car-eqpic" src="assets/img/car-eq-times2.png"
           alt="1 من 140 يساوي x من 280، طرفا المعادلة مضروبان في 2">
      <p>ولذلك: <span dir="ltr">x = 1 · <strong>2</strong> = 2</span></p>
      <p><strong>أي أن ياسمين تحتاج إلى 2 كوب طحين.</strong></p>` },

  { /* 9 · deck 16 — GRADED, drag again (sugar) */
    img: 'car-sugar-AR.png', alt: 'كوب سكر',
    body: `<p>في الوصفة مكتوب أنه يجب 300 غرام سكر.</p>
      <p>بحثت ياسمين مرة أخرى على الإنترنت ووجدت:</p>
      <div class="car-chip-note"><strong>1 كوب سكر = 200 غرام</strong></div>
      <p>نرمز: y - عدد أكواب السكر اللازمة لياسمين.</p>
      <p>أكملوا جدول التناسب عن طريق سحب الأعداد إلى المكان الصحيح:</p>`,
    grade: { kind: 'drag', pool: ['300', '200', '1'],
      table: () => carTable(['نسبة معروفة', 'وصفة ياسمين'], ['عدد أكواب السكر', 'كمية السكر بالغرامات'], [null, 'y', null, null]),
      slots: [0, 2, 3], correct: ['1', '200', '300'],
      /* deck slide 16, same as 11: the filled table lives in BOTH popups — and
         the wrong-answer title literally promises it ("הנה הטבלה הנכונה:").
         NOTE the deck names the second row 'الكمية بالغرامات' inside the popups but
         'كمية السكر بالغرامات' on the canvas; each is built as written. */
      fb: () => carTable(['نسبة معروفة', 'وصفة ياسمين'], ['عدد أكواب السكر', 'الكمية بالغرامات'], ['1', 'y', '200', '300']),
      ok: { t: 'الإجابة صحيحة. هذا يدلّ على فهم!', b: `${EXPL}` },
      no: { t: 'ليس دقيقًا، إليكم الجدول الصحيح:', b: `${EXPL}` } } },

  { /* 10 · deck 17 — GRADED, single choice.  The slide's image3 IS the
       companion, bottom-left (it was missing from the build entirely). */
    monster: 'standing',
    body: `${carTable(['نسبة التحويل', 'وصفة ياسمين'], ['عدد أكواب السكر', 'كمية السكر بالغرامات'], ['1', 'y', '200', '300'])}
      <p>استعينوا بجدول التناسب واختاروا معادلة التناسب المناسبة:</p>`,
    grade: { kind: 'single',
      opts: [eqp(fr('1', '200'), fr('y', '300')), eqp(fr('y', '200'), fr('1', '300')), eqp(fr('1', '200'), fr('300', 'y'))],
      correct: [0],
      ok: { t: 'صحيح!', b: 'النسبة تُكتب بنفس الترتيب في كلا الطرفين — الأكواب في البسط، والغرامات في المقام.' },
      no: { t: 'ليس دقيقًا، إليك التوضيح:', b: 'النسبة تُكتب بنفس الترتيب في كلا الطرفين — الأكواب في البسط، والغرامات في المقام.' } } },

  { /* 11 · deck 18 */ body: `${carTable(['نسبة التحويل', 'وصفة ياسمين'], ['عدد أكواب السكر', 'كمية السكر بالغرامات'], ['1', 'y', '200', '300'])}
      <p>إذا كان y يمثّل كمية أكواب السكر المناسبة لـ 300 غرام،<br>نكتب معادلة التناسب كالتالي:</p>
      ${eqfig('نسبة التحويل بين الكؤوس<br>والغرامات للسكر',
              'كمية كؤوس السكر<br>التي تريد ياسمين حسابها',
              'كمية الغرامات من<br>السكر في الوصفة',
              eqp(fr('1', '200'), fr('y', '300')))}` },

  { /* 12 · deck 19 — image34 runs 757px wide in the deck, not the column's 430 */
    mediaW: 700,
    img: 'car-solving-AR.png', alt: 'ياسمين تحلّ التمرين في المطبخ', body: `<p>لإيجاد y (كمية أكواب السكر)،<br>هذه المرة سنحل المعادلة عن طريق الضرب بالمقام المشترك:</p>
      <p class="car-center" dir="ltr">${eqp(fr('1', '200'), fr('y', '300'))} <span class="car-mul">/ · 600</span> <span class="car-denom-note" dir="rtl">المقام<br>المشترك</span></p>
      <p class="car-solve" dir="ltr">2 · y = 1 · 3<br>2y = 3 &nbsp;/ :2<br>y = 1.5</p>
      <p><strong>أي أن ياسمين تحتاج لتحضير الكعكة إلى 1.5 كوب سكر.</strong></p>`,
    /* deck 19 draws the bubble ABOVE the photo with a downward tail */
    bubble: 'هذه معادلة سهلة<br>الحلّ بالنسبة لي!', bubbleAt: 'abovepic' },
];

/* ─── runtime ───────────────────────────────────────────────────────── */
const carState = { step: 1, answered: {}, picked: {}, placed: {} };

function carRender() {
  const i = carState.step, cfg = CAR[i - 1];
  const sec = document.getElementById('s5');
  if (!sec || !cfg) return;
  const g = cfg.grade;
  const done = !!carState.answered[i];

  let interaction = '';
  if (g && g.kind === 'drag') {
    const placed = carState.placed[i] || {};
    const used = Object.values(placed);
    const held = carState.held && carState.held[i];
    interaction = `<div class="car-drag">
        ${g.table()}
        <div class="car-pool" aria-label="اسحبوا أو اختاروا رقماً ثم الخلية في الجدول">
          ${g.pool.map(v => `<button type="button" class="car-chip${used.includes(v) ? ' is-used' : ''}${held === v ? ' is-held' : ''}"
             ${used.includes(v) || done ? 'disabled' : ''} draggable="${!done && !used.includes(v)}" data-v="${v}">${v}</button>`).join('')}
        </div>
      </div>`;
  } else if (g) {
    const picked = carState.picked[i] || [];
    interaction = `<div class="car-opts" role="${g.kind === 'multi' ? 'group' : 'radiogroup'}">
        ${g.opts.map((o, k) => `<button type="button" class="scq-opt car-opt${picked.includes(k) ? ' selected' : ''}${done && g.correct.includes(k) ? ' correct' : ''}${done && picked.includes(k) && !g.correct.includes(k) ? ' wrong' : ''}"
           data-k="${k}" ${done ? 'disabled' : ''}><span class="scq-radio${g.kind === 'multi' ? ' is-box' : ''}"></span>${o}</button>`).join('')}
      </div>`;
  }

  sec.dataset.carStep = i;          /* lets CSS address a single step */
  sec.innerHTML = `
    <h1 class="car-title">${CAR_TITLE[i]}</h1>
    <div class="car-body${cfg.stack ? ' car-body--stack' : ''}">
      <div class="car-copy">${cfg.body}${cfg.callout ? `<div class="car-callout">${cfg.callout}</div>` : ''}${cfg.under || ''}${interaction}</div>
      ${cfg.img ? `<figure class="car-media"${cfg.mediaW ? ` style="--car-media-w:${cfg.mediaW}px"` : ''}>
          <img src="assets/img/${cfg.img}" alt="${cfg.alt || ''}">
          ${cfg.bubble ? `<div class="speech-bubble ${cfg.bubbleAt === 'step1' ? 'side-bubble' : (cfg.bubbleAt === 'abovepic' ? '' : 'side-bubble--right')} car-bubble${cfg.bubbleAt ? ' car-bubble--' + cfg.bubbleAt : ''}">${cfg.bubble}</div>` : ''}
        </figure>` : (cfg.bubble && !cfg.monster
          ? `<div class="speech-bubble side-bubble--right car-bubble car-bubble--free">${cfg.bubble}</div>` : '')}
    </div>
    ${cfg.monster ? `<div class="car-char">
      ${cfg.bubble ? `<div class="speech-bubble car-bubble car-bubble--overchar">${cfg.bubble}</div>` : ''}
      <img id="car-char" alt="الشخصية المرافقة">
    </div>` : ''}
    <div class="car-dots" role="progressbar" aria-valuemin="1" aria-valuemax="${CAR_STEPS}" aria-valuenow="${i}" aria-label="خطوة ${i} من ${CAR_STEPS}">
      ${/* the dots say WHERE YOU ARE, nothing else — the done/missed states are
            gone (producer 06.10). The stepper above the practice screens is
            where progress is reported. */''}
      ${Array.from({ length: CAR_STEPS }, (_, k) => `<span class="car-dot${k + 1 === i ? ' is-on' : ''}"></span>`).join('')}
    </div>
    <div class="car-fb" id="car-fb"></div>
    <button class="btn-continue" id="car-next"${g && !done && !carGradedReady(i) ? ' disabled' : ''}>${g && !done ? 'هل إجابتي صحيحة؟' : 'متابعة'}</button>
    <button class="btn-back" id="car-prev">رجوع</button>`;

  if (done && g) carShowFeedback(i, carState.answered[i] === 'ok');
  carWire();
  eqfigWire(sec);
  /* tell the DEV harness which SLIDE of this screen is showing, so its arrows
     carry on from here instead of snapping to the screen's first slide */
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'DEV_SCREEN', screen: 5, step: carState.step }, '*');
  }
  if (cfg.monster && typeof setCharacter === 'function') setCharacter('car-char', cfg.monster);
  if (typeof decorateBubbles === 'function') decorateBubbles(sec);
  /* Platform layer (70-platform.js): mirror the state for resume. Guarded: runs without it. */
  if (typeof onCarChanged === 'function') {
    try { onCarChanged(); } catch (e) { console.error('[resume] onCarChanged', e); }
  }
}

function carWire() {
  const i = carState.step, cfg = CAR[i - 1], g = cfg.grade;
  /* `done` lives in carRender; referencing it here threw a ReferenceError
     inside the drop loop, which aborted the wiring and left the cells
     looking like dead input boxes. */
  const done = !!carState.answered[i];
  const sec = document.getElementById('s5');

  sec.querySelectorAll('.car-opt').forEach(b => b.onclick = () => {
    const k = +b.dataset.k;
    const cur = carState.picked[i] || [];
    carState.picked[i] = g.kind === 'multi'
      ? (cur.includes(k) ? cur.filter(x => x !== k) : cur.concat(k))
      : [k];
    carRender();
  });

  carState.held = carState.held || {};
  sec.querySelectorAll('.car-chip[draggable="true"]').forEach(c => {
    c.ondragstart = e => e.dataTransfer.setData('text/plain', c.dataset.v);
    /* click-to-pick: the same answer without a mouse drag */
    c.onclick = () => {
      carState.held[i] = carState.held[i] === c.dataset.v ? null : c.dataset.v;
      carRender();
    };
  });
  sec.querySelectorAll('.car-drop').forEach(d => {
    d.ondragover = e => { e.preventDefault(); d.classList.add('is-over'); };
    d.ondragleave = () => d.classList.remove('is-over');
    const put = (v) => {
      if (!v) return;
      const placed = Object.assign({}, carState.placed[i] || {});
      Object.keys(placed).forEach(s => { if (placed[s] === v) delete placed[s]; });
      placed[d.dataset.slot] = v;
      carState.placed[i] = placed;
      carState.held[i] = null;
      carRender();
    };
    d.ondrop = e => { e.preventDefault(); d.classList.remove('is-over'); put(e.dataTransfer.getData('text/plain')); };
    /* a focusable slot completes the click path, and keyboard users get in */
    d.tabIndex = done ? -1 : 0;
    d.onclick = () => { if (!done) carState.held[i] ? put(carState.held[i]) : takeBack(d); };
    d.onkeydown = (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault(); d.onclick();
    };
  });
  /* A value that arrived by DRAG has to be removable by drag too — clicking it
     works, but nothing says so, so the cells read as one-way (producer 27.09).
     A filled cell is itself draggable: drag it back to the chip pool (or off
     the table) to clear it, or onto another cell to move it. */
  const pool = sec.querySelector('.car-pool');
  if (pool && !done) {
    pool.ondragover = e => { e.preventDefault(); pool.classList.add('is-over'); };
    pool.ondragleave = () => pool.classList.remove('is-over');
    pool.ondrop = e => {
      e.preventDefault(); pool.classList.remove('is-over');
      const from = e.dataTransfer.getData('application/x-slot');
      if (!from) return;
      const placed = Object.assign({}, carState.placed[i] || {});
      delete placed[from];
      carState.placed[i] = placed;
      carRender();
    };
  }
  (carState.placed[i] ? Object.entries(carState.placed[i]) : []).forEach(([slot, v]) => {
    const cell = sec.querySelector(`.car-drop[data-slot="${slot}"]`);
    if (!cell) return;
    cell.classList.add('is-filled');
    cell.textContent = v;
    if (carState.answered[i]) return;
    cell.title = 'اسحبوا للخارج أو اضغطوا للإرجاع';
    cell.draggable = true;
    cell.ondragstart = e => {
      e.dataTransfer.setData('text/plain', v);
      e.dataTransfer.setData('application/x-slot', slot);
      cell.classList.add('is-lifting');
    };
    cell.ondragend = () => cell.classList.remove('is-lifting');
  });

  function takeBack(cell) {
    const placed = Object.assign({}, carState.placed[i] || {});
    delete placed[cell.dataset.slot];
    carState.placed[i] = placed;
    carRender();
  }

  sec.querySelector('#car-next').onclick = carNext;
  sec.querySelector('#car-prev').onclick = () => {
    if (carState.step > 1) { carState.step--; carRender(); }
    else goTo(4);
  };
}

function carGradedReady(i) {
  const g = CAR[i - 1].grade;
  if (!g) return true;
  if (g.kind === 'drag') return Object.keys(carState.placed[i] || {}).length === g.pool.length;
  return (carState.picked[i] || []).length > 0;
}

function carNext() {
  const i = carState.step, g = CAR[i - 1].grade;
  if (g && !carState.answered[i]) {
    if (!carGradedReady(i)) return;
    let ok;
    if (g.kind === 'drag') {
      const p = carState.placed[i] || {};
      const slots = g.slots || [1, 2, 3];
      ok = g.correct.every((want, k) => p[String(slots[k])] === want);
    } else {
      const picked = (carState.picked[i] || []).slice().sort();
      ok = picked.length === g.correct.length && picked.every((v, k) => v === g.correct.slice().sort()[k]);
    }
    carState.answered[i] = ok ? 'ok' : 'no';
    carRender();
    /* Platform layer: the step's one answer is committed — report it (item 002) and persist. */
    if (typeof onCarAnswered === 'function') {
      try { onCarAnswered(i, ok); } catch (e) { console.error('[xAPI] onCarAnswered', e); }
    }
    return;
  }
  if (carState.step < CAR_STEPS) { carState.step++; carRender(); }
  else goTo(6);
}

function carShowFeedback(i, ok) {
  const g = CAR[i - 1].grade, box = document.getElementById('car-fb');
  if (!g || !box) return;
  const f = ok ? g.ok : g.no;
  box.className = 'car-fb ' + (ok ? 'is-correct' : 'is-wrong');
  /* explanation first, table under it (producer 27.09) */
  box.innerHTML = `<p class="car-fb-title">${f.t}</p>`
    + `<div>${f.b}</div>`
    + (g.fb ? g.fb() : '');
  /* every feedback panel in the unit is draggable — same approved helper the
     quiz feedboxes use, so the carousel behaves identically (producer) */
  if (typeof quizFeedboxDrag === 'function') quizFeedboxDrag(box);
}

function carEnter() { carRender(); }


/* the dev harness (and anything else off-page) reaches a step through this */
window.carGoToStep = function (n) {
  const k = Math.max(1, Math.min(CAR_STEPS, parseInt(n, 10) || 1));
  carState.step = k;
  carRender();
};
