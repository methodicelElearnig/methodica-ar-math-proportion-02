'use strict';
/* ═══════════════════════════════════════════════════════════════════
   methodica-math-proportion-02 — question data
   ═══════════════════════════════════════════════════════════════════ */
/* small builders so the feedback bodies read like the deck, not like markup */
const qfr = (n, d) => `<span class="fraction fr-inline"><span class="frac-top">${n}</span><span class="frac-bottom">${d}</span></span>`;
const qeq = (a, b) => `<span class="car-eq" dir="ltr">${a}<span class="car-eq-op">=</span>${b}</span>`;
const ctr = (h) => `<p class="car-center">${h}</p>`;
const sol = (h) => `<p class="car-solve" dir="ltr">${h}</p>`;
/* a proportion table. RTL: the FIRST cell renders rightmost, which is the
   order the deck's own tables read in (their tblPr carries no rtl flag, so
   their first cell is leftmost and the two orders mirror). */
const pTable = (head, rows, mod) => `<table class="car-table${mod ? ' ' + mod : ''}">
  <thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead>
  <tbody>${rows.map(r => `<tr>${r.map((c, i) => i === 0 ? `<th>${c}</th>` : `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;


/* ── feedback bodies for component 02. Both popups on each slide carry the
   SAME body — only the title differs — so each is written once. ── */

const DINO_FB = `<p><strong>في الشكل الأصلي، </strong>النسبة بين الارتفاع والعرض هي:</p>
  ${ctr(qeq(qfr('12', '9'), qfr('4', '3')) + '<span class="fb-note">اختزال بـ 3</span>')}
  <p>يجب أن تبقى هذه النسبة محفوظة أيضًا بين الارتفاع الجديد (20 سم) والعرض الجديد (نرمز له بـ x):</p>
  ${ctr(qeq(qfr('20', 'x'), qfr('4', '3')))}
  <p>نضرب في المقام المشترك (3x) ونحلّ:</p>
  ${sol('4 · x = 20 · 3<br>4x = 60 &nbsp;/:4<br>x = 15')}
  <p>عرض الشخصية المكبّرة يجب أن يكون 15 سم.</p>`;

const BAR_FB = `<p><strong>نعيّن</strong>: x - كمية البروتين في لوح واحد (45 غرام)</p>
  <p>نرتّب المعطيات في جدول التناسب:</p>
  ${pTable(['', 'علامة غذائية', 'وجبة خفيفة واحدة'],
           [['كمية البروتين (غرام)', '18', 'x'], ['الوزن (غرام)', '100', '45']])}
  <p>النسبة بين كمية البروتين ووزن الوجبة الخفيفة ثابتة، ولذلك معادلة التناسب المناسبة هي:</p>
  ${ctr(qeq(qfr('x', '45'), qfr('18', '100')))}
  <p>سنختزل النسبة في الطرف الأيمن:</p>
  ${ctr(qeq(qfr('9', '50'), qfr('x', '45')))}
  <p>نضرب في المقام المشترك (450) فنحصل على:</p>
  ${sol('10x = 81 &nbsp;/:10<br>x = 8.1')}
  <p>وجبة خفيفة بوزن 45 تحتوي على 8.1 غرام بروتين.</p>`;

const GOAL_FB = `<p>النسبة بين عرض وارتفاع المرمى للبالغين:</p>
  ${ctr(qeq(qfr('7.32', '2.44'), '3'))}
  <p>أي أن عرض مرمى الكبار يساوي بالضبط <strong>3 أضعاف</strong> ارتفاعه.</p>
  <p>يجب أن تبقى هذه النسبة محفوظة أيضًا لمرمى الناشئين (12-14).</p>
  <p>إذا كان ارتفاع مرمى الناشئين هو 2.13 متر، فإن العرض سيكون 3 أضعاف الارتفاع:</p>
  ${sol('2.13 · 3 = <span class="eq-unit" dir="rtl">6.39 متر</span>')}`;

const CHARGE_FB = `<p>في 5 دقائق، سيشحن الشاحن 12% من بطارية الهاتف.</p>
  <p>ريم تحتاج أن تخرج بعد نصف ساعة - 30 دقيقة.</p>
  <p>نرمز بـ x إلى نسبة الشحن خلال 30 دقيقة،<br>ونكمل جدول التناسب:</p>
  ${pTable(['زمن الشحن (دقائق)', '5', '30'], [['نسبة الشحن', '12', 'x']])}
  <p>لنلاحظ العلاقة بين الأزمنة:</p>
  ${sol('5 · 6 = 30')}
  <p>للحفاظ على التناسب، يجب أن تتحقق نفس العلاقة أيضًا بين نسب الشحن:</p>
  ${sol('12 · 6 = x<br>72 = x')}
  <p>أي أنه خلال 30 دقيقة، سيشحن الشاحن 72% من بطارية الهاتف (أكثر من 70%) ولذلك ستتمكّن ريم من شحن الهاتف خلال هذا الوقت.</p>`;


/* ── component 03 feedback bodies (deck slides 41-49) ── */
const C3_Q1A = `<p>النسبة بين x و-27 تساوي النسبة بين 6 و-9.</p>
  <p>نحوّل النسب إلى كسور:</p>
  <p>النسبة بين x و27 تُكتب ككسر: ${qfr('x', '27')}</p>
  <p>النسبة بين 6 و-9 تُكتب ككسر: ${qfr('6', '9')}.</p>
  <p>التناسب هو تساوي بين النسب.</p>
  <p>سنبني معادلة التناسب وسنحصل على أن الإجابة المناسبة هي:</p>
  ${ctr(qeq(qfr('x', '27'), qfr('6', '9')))}`;

const C3_Q1B = `<p>معادلة التناسب المناسبة هي:</p>
  ${ctr(qeq(qfr('x', '27'), qfr('6', '9')))}
  <p>نضرب في المقام المشترك (27) فنحصل على:</p>
  ${sol('x = 6 · 3<br>x = 18')}`;

const C3_Q2A = `<p>مقابل كل 3 مهمات، يحصل وسيم على 120 قطعة نقدية ذهبية افتراضية، ولذلك فإن الكسر ${qfr('3', '120')} يمثّل النسبة:</p>
  ${ctr(qfr('عدد المهام', 'عملات ذهبية'))}
  <p>في لعبة بعد الظهر أكمل وسيم x مهمات وحصل على 400 قطعة ذهبية.</p>
  <p>لذلك معادلة التناسب هي:</p>
  ${ctr(qeq(qfr('3', '120'), qfr('x', '400')))}`;

const C3_Q2B = `<p>نضرب في المقام المشترك (1200):</p>
  ${sol('30 = 3x &nbsp;/:3<br>x = 10')}
  <p>أنهى وسيم 10 مهمّات بنجاح.</p>`;

const C3_Q3 = `<p>يجب الحفاظ على نسبة 2:5 بين الرخام والعشب.</p>
  <p>نرمز بـ x لعدد قوالب الرخام المطلوبة مقابل 30 قالب عشب.</p>
  <p>معادلة التناسب المناسبة هي:</p>
  ${ctr(qeq(qfr('2', '5'), qfr('x', '30')))}
  <p>نضرب في المقام المشترك (30)</p>
  ${sol('x = 2 · 6<br>x = 12')}
  <p>أي أنه يلزم 12 كتلة من الرخام مقابل 30 كتلة من العشب.</p>`;

const C3_Q4 = `<p>نرمز: x - عدد الأغاني في قائمة تشغيل مدتها 60 دقيقة.</p>
  <p>نرتّب البيانات في جدول تناسب:</p>
  ${pTable(['عدد الأغاني', 'مدة التشغيل'], [['5', '15 دقيقة'], ['x', '60 دقيقة']])}
  <p>نريد الحفاظ على النسبة:</p>
  ${ctr(qfr('عدد الأغاني', 'الزمن بالدقائق'))}
  <p>نكتب معادلة تناسب مناسبة:</p>
  ${ctr(qeq(qfr('5', '15'), qfr('x', '60')))}
  <p>نضرب في المقام المشترك (60):</p>
  ${sol('x = 5 · 4<br>x = 20')}`;

const C3_Q5 = `<p>نرمز بـ x إلى السعر الإجمالي لـ 175 قميصًا وننظّم المعطيات في جدول تناسب:</p>
  ${pTable(['', 'عرض سعر', 'الطلبية بالكامل'], [['عدد القمصان', '25', '175'], ['السعر (₪)', '550', 'x']])}
  <p>ونكتب التناسب التالي:</p>
  ${ctr(qeq(qfr('25', '175'), qfr('550', 'x')))}
  <p>يمكننا اختزال النسبة في الطرف الأيسر بالقسمة على 25:</p>
  ${ctr(qeq(qfr('1', '7'), qfr('550', 'x')))}
  <p>نضرب في المقام المشترك (7x):</p>
  ${sol('x = 3850')}
  <p>ولذلك فإن السعر الإجمالي للطلبية سيكون 3850 شيكل.</p>`;

const C3_Q6 = `<p>علينا زيادة كمية كل مكوّن من المكوّنات وفقًا للنسبة بين كميات الصلصة.</p>
  <p>النسبة بين كمية الصلصة في الوصفة الجديدة وكمية الصلصة في الوصفة الأصلية هي</p>
  ${ctr(qeq(qfr('150', '100'), '1.5'))}
  <p>لذلك، علينا ضرب كميات المكونات في الوصفة الأصلية بـ 1.5:</p>
  <p>زيت زيتون:</p>${sol('60 · 1.5 = <span class="eq-unit" dir="rtl">90 مل</span>')}
  <p>خل بلسمي:</p>${sol('30 · 1.5 = <span class="eq-unit" dir="rtl">45 مل</span>')}
  <p>صلصة الصويا:</p>${sol('10 · 1.5 = <span class="eq-unit" dir="rtl">15 مل</span>')}`;


/* ── component 05 · תרגול מתקדם (deck 61-67) ── */
const C5_CODE = `<p>ليان تبلغ من العمر 14 عامًا.</p>
  <p>نفرض: x - عمر الأب اليوم.</p>
  <p>بعد سنتين، ستبلغ ليان 16 عامًا، وسيكون عمر الأب <span dir="ltr">x + 2</span>، والنسبة بين عمريهما ستكون:</p>
  ${ctr(qeq(qfr('16', 'x + 2'), qfr('4', '11')))}
  <p>نضرب بالمقام المشترك:</p>
  ${sol('4(x + 2) = 176 &nbsp;/:4<br>x + 2 = 44 &nbsp;/−2<br>x = 42')}
  <p><strong>الأب عمره 42 سنة اليوم.</strong></p>
  <p>نفرض أن: y - عمر الأم اليوم.</p>
  <p>قبل 4 سنوات، كانت ليان في العاشرة من عمرها، وكان عمر أمها <span dir="ltr">y − 4</span>، والنسبة بين عمريهما كانت:</p>
  ${ctr(qeq(qfr('10', 'y − 4'), qfr('2', '7')))}
  <p>نضرب بالمقام المشترك:</p>
  ${sol('2(y − 4) = 70 &nbsp;/:2<br>y − 4 = 35 &nbsp;/+4<br>y = 39')}
  <p><strong>الأم عمرها 39 سنة اليوم.</strong></p>
  <p>وبالتالي الرمز هو 4239.</p>`;

const C5_PIZZA_A = `<p><strong>بيتزا متوسطة:</strong> بقطر 30 سم – لذلك نصف قطر البيتزا يساوي ${qfr('30','2')} = <span dir="rtl">15 سم</span>،</p>
  <p>ومساحتها: <span dir="ltr">π · 15² = 225π</span>.</p>
  <p><strong>بيتزا كبيرة:</strong> بقطر 40 سم – لذلك نصف قطر البيتزا يساوي ${qfr('40','2')} = <span dir="rtl">20 سم</span>،</p>
  <p>ومساحتها: <span dir="ltr">π · 20² = 400π</span>.</p>
  <p>وبالتالي النسبة بين المساحتين هي:</p>
  ${ctr(qeq(qfr('400π', '225π'), qeq(qfr('400','225'), qfr('16','9'))))}`;

const C5_PIZZA_B = `<p>لنحسب النسبة بين مساحة كل بيتزا وسعرها.</p>
  <p><strong>بيتزا متوسطة:</strong></p>
  <p>نصف القطر: 15 سم</p>
  <p>المساحة: <span dir="ltr">π · 15² = 3.14 · 225 = 706.5</span> سم²</p>
  <p>السعر: 30 ₪</p>
  <p>نسبة المساحة إلى السعر: ${qfr('706.5 سم²', '30 شيكل')} = 23.55 سم² للشيكل</p>
  <p><strong>بيتزا كبيرة:</strong></p>
  <p>نصف القطر: 20 سم</p>
  <p>المساحة: <span dir="ltr">π · 20² = 3.14 · 400 = 1256</span> سم²</p>
  <p>السعر: 40 ₪</p>
  <p>نسبة المساحة إلى السعر: ${qfr('1256 سم²', '40 شيكل')} = 31.4 سم² للشيكل</p>
  <p>في البيتزا الكبيرة نحصل على مساحة أكبر (أي بيتزا أكثر) لكل شيكل، ولذلك ملك محقّة.</p>`;

const C5_PIZZA_C = `<p>نحسب أولًا النسبة بين السعر والمساحة لـ<strong>البيتزا الكبيرة</strong>.</p>
  <p><strong>نصف القطر</strong>: 20 سم</p>
  <p><strong>المساحة:</strong> <span dir="ltr">π · 20² = 3.14 · 400 =</span> 1256 سم²</p>
  <p><strong>السعر: </strong>40 ₪</p>
  <p><strong>نسبة السعر إلى المساحة:</strong></p>
  ${ctr(qeq(qfr('40', '1256'), qfr('5', '157')))}
  <p>شيكل للسم²</p>
  <p><strong>بيتزا عائلية:</strong></p>
  <p><strong>نصف القطر: </strong><span dir="ltr">50/2</span> = 25 سم</p>
  <p><strong>المساحة:</strong> <span dir="ltr">π · 25² = 3.14 · 625 =</span> 1962.5 سم²</p>
  <p><strong>السعر:</strong> نرمز له بـ x ₪</p>
  <p>نكتب تناسبًا لنسبة السعر إلى المساحة:</p>
  ${ctr(qeq(qfr('x', '1962.5'), qfr('5', '157')))}
  <p>نضرب بالمقام المشترك (الضرب التبادلي)</p>
  ${sol('157 · x = 1962.5 · 5<br>157x = 9812.5')}
  <p>نقسم على 157:</p>
  ${sol('x = 62.5')}
  <p>سعر البيتزا العائلية الذي يحافظ على نفس النسبة هو <strong>62.5 ₪.</strong></p>`;

const C5_SPRING_A = `<p>وفقًا للتطبيق، عندما نعلّق على النابض كتلة مقدارها 100 غرام، يتمدد النابض بمقدار 5 سم.</p>
  <p>إذا أضفنا أثقالاً سنحصل على أنه عند كتلة 250 غرام يتمدد النابض بمقدار 12.5 سم.</p>`;

const C5_SPRING_B = `<p>وجدنا أن كتلة <strong>100 غرام</strong> تسبب استطالة بمقدار <strong>5 سم</strong>، أي:</p>
  ${ctr(qeq(qfr('كتلة', 'الاستطالة'), qfr('100', '5')))}
  <p>نختزل بـ 5 فنحصل على:</p>
  ${ctr(qeq(qfr('كتلة', 'الاستطالة'), qfr('20', '1')))}
  <p>كل <strong>20 غرام</strong> تسبب استطالة بمقدار <strong>1 سم</strong>.</p>
  <p>نرمز بـ x لاستطالة النابض بالسنتيمتر، لكتلة مقدارها <strong>180 غرام</strong>.</p>
  <p>نكتب معادلة التناسب:</p>
  ${ctr(qeq(qfr('20', '1'), qfr('180', 'x')))}
  <p>نضرب بالمقام المشترك:</p>
  ${sol('20x = 180 &nbsp;/:20<br>x = 9')}
  <p>كتلة <strong>180 غرام</strong> ستسبب استطالة بمقدار <strong>9 سم</strong>.</p>`;

const C5_PUZZLE = `<p>نحافظ على النسبة الأصلية بين الصفوف والأعمدة:</p>
  ${pTable(['', 'بازل أصلي', 'أحجية جديدة'], [['صفوف', '12', 'x'], ['أعمدة', '20', '30']])}
  ${ctr(qeq(qfr('x', '30'), qfr('12', '20')))}
  ${sol('2x = 36 &nbsp;/:2<br>x = 18')}
  <p>وبالتالي عدد القطع في الأحجية الجديدة:</p>
  ${sol('30 · 18 = <span class="eq-unit" dir="rtl">540 جزءًا</span>')}`;


/* ── component 06 · שאלת שיא א (deck 72-76) ── */
/* 30.09 — the board was a 593x411 raster whose type came out tiny and soft.
   Rebuilt as markup: crisp at any size, scales with the column, and the
   numbers are real text a translator can reach. Same content as the deck's
   image, same three sections. */
/* ── ratio expansion ("הרחבת היחס") ──────────────────────────────────────
   06.10, producer: "dslide 50 feedback image is really blury please
   reconstruct it". It was a 289x138 raster being upscaled in the panel. Same
   treatment the camp bulletin board got on 30.09: rebuilt as markup, so it is
   sharp at any size, the copy is real text, and it grows with the feedback
   font instead of staying a fixed bitmap. The arcs are CSS (a bordered box
   with an elliptical radius) and therefore stretch to whatever height the two
   rows take. ── */
const ratioExpand = (title, top, bottom, factor) => `<span class="rx">
  <span class="rx-title">${title}</span>
  <span class="rx-body">
    <span class="rx-side"><b class="rx-k">${factor}</b><i class="rx-arc rx-arc--left"></i></span>
    <span class="rx-rows"><span dir="ltr">${top}</span><span dir="ltr">${bottom}</span></span>
    <span class="rx-side"><i class="rx-arc rx-arc--right"></i><b class="rx-k">${factor}</b></span>
  </span>
</span>`;

const BOARD = `<div class="camp-board" data-persist data-zoom data-zoom-label="تكبير اللوحة" role="group" aria-label="لوحة معلومات المخيم">
  <h3 class="cb-title">لوحة معلومات المخيم <span dir="ltr">(Camp Bulletin Board)</span></h3>
  <div class="cb-group">
    <h4>سعر الصرف اليومي:</h4>
    <p>1 دولار أمريكي <span dir="ltr">(USD)</span> = <strong class="cb-rate">3.25</strong> شيكل جديد <span dir="ltr">(ILS)</span></p>
  </div>
  <div class="cb-group">
    <h4>تحويلات حجم السوائل:</h4>
    <p>1 غالون <span dir="ltr">(Gallon)</span> = 3.785 لتر</p>
    <p>1 كوب سائل <span dir="ltr">(cup)</span> = 8 أونصات سائلة <span dir="ltr">(fl oz)</span> = 240 ملليلتر (مل)</p>
  </div>
  <div class="cb-group">
    <h4>تحويلات الطول:</h4>
    <p>1 إنش <span dir="ltr">(Inch)</span> = 2.54 سنتيمتر (سم)</p>
    <p>1 قدم <span dir="ltr">(feet)</span> = 12 إنش <span dir="ltr">(Inch)</span></p>
    <p>1 يارد <span dir="ltr">(Yard)</span> = 3 أقدام <span dir="ltr">(feet)</span></p>
  </div>
</div>`;

const C6_A = `<p>وفقًا للبيانات الموجودة على لوحة التحويل:</p>
  <p>1 إنش = 2.54 سم.</p>
  <p>1 قدم (feet) = 12 إنش ولذلك نضرب:</p>
  ${sol('12 · 2.54 = <span class="eq-unit" dir="rtl">30.48 سم</span>')}
  <p><strong>1 قدم = 30.48 سم</strong></p>
  <p>وفقًا للبيانات الموجودة على لوحة التحويل:</p>
  <p>1 يارد = 3 أقدام ولذلك سنضرب النتيجة التي حصلنا عليها بـ 3:</p>
  ${sol('3 · 30.48 = <span class="eq-unit" dir="rtl">91.44 سم</span>')}
  <p><strong>1 يارد = 91.44 سم</strong></p>`;

const C6_B = `<p>توجد نسبة ثابتة بين وحدة الحجم أونصة سائلة (fl oz) ووحدة الحجم ميليلتر (ml).</p>
  <p>نرمز بـ x للكمية المجهولة ونكمل جدول التناسب:</p>
  ${pTable(['أونصات سائلة (fl oz)', 'ميليلترات (مل)'], [['8', '240'], ['x', '600']])}
  <p>سنكتب معادلة التناسب (نسبة بين الأونصات والمل):</p>
  ${ctr(qeq(qfr('x', '600'), qfr('8', '240')))}
  <p>نضرب في المقام المشترك (1200) فنحصل على:</p>
  ${sol('2x = 40 &nbsp;/:2<br>x = 20')}
  <p>600 مل حليب تساوي <strong>20</strong> أونصة سائلة (oz).</p>`;

const C6_C = `<p>لنحسب أولاً كمية المياه المطلوبة وفقاً لإجراءات السلامة.</p>
  <p>في المجموعة 15 طالبًا + 3 مرشدين = 18 شخصًا.</p>
  <p>لذلك المطلوب إجمالاً:</p>
  ${sol('2 · 18 = <span class="eq-unit" dir="rtl">36 لتر</span>')}
  <p>وفقًا لجدول المعلومات، 1 غالون يساوي 3.785 لتر.</p>
  <p>لحساب كم لتراً يساوي 8 غالونات من الماء، سنضرب النسبة في 8:</p>
  ${sol('8 · 3.785 = <span class="eq-unit" dir="rtl">30.28 لتر</span>')}
  <p class="fb-figure" role="img" aria-label="توسيع نسبة غالون: لتر بمقدار 8 أضعاف — من 1: 3.785 إلى 8: 30.28">${ratioExpand('لتر: غالون', '1 : 3.785', '8 : 30.28', '· 8')}</p>
  <p>كمية الماء في الخزّان (30.28 لتر) أقل من الكمية المطلوبة (36 لتر)، ولذلك <strong>الماء لن يكفي</strong>.</p>`;

const C6_D = `<p>1 إنش يساوي 2.54 سم.</p>
  <p>عرض صدر كريم هو 50.8 سنتيمترات.</p>
  <p>نعيّن: x - عرض الصدر بالإنشات</p>
  <p>ونكمل جدول التناسب:</p>
  ${pTable(['طول بالإنش', 'الطول بالسم'], [['1', '2.54'], ['x', '50.8']])}
  <p>نكتب معادلة التناسب:</p>
  ${ctr(qeq(qfr('x', '50.8'), qfr('1', '2.54')))}
  <p>نضرب في المقام المشترك (الضرب التبادلي):</p>
  ${sol('2.54x = 50.8 &nbsp;/:2.54<br>x = 20')}
  <p>عرض صدر كريم هو 20 إنش، ولذلك المقاس المناسب له هو مقاس Medium.</p>`;

const C6_E = `<p>سعر كل قميص هو <span dir="ltr">$30</span> ولذلك تكلفة 15 قميصًا بالدولارات هي:</p>
  ${sol('15 · 30 = <span dir="ltr">$450</span>')}
  <p>نسبة التحويل اليومية من الدولار ($) إلى الشيكل (₪) هي <span dir="ltr">1: 3.25</span>، ولذلك:</p>
  ${sol('450 · 3.25 = <span class="eq-unit" dir="rtl">1462.5 ₪</span>')}
  <p class="fb-figure" role="img" aria-label="توسيع نسبة التحويل دولار: شيكل بمقدار 450 ضعفًا — من 1: 3.25 إلى 450: 1462.5">${ratioExpand('شيكل: دولار', '1 : 3.25', '450 : 1462.5', '· 450')}</p>
  <p>المبلغ الذي حصلنا عليه (1462.5 ₪) أقل من الميزانية (1500 ₪)، ولذلك <strong>الميزانية ستكفي</strong>.</p>`;


/* ── component 07 · שאלת שיא ב (deck 80-85) ── */
const C7_A = `<p>1 متر يساوي 100 سم.</p>
  <p>لذلك، لتحويل الطول من أمتار إلى سنتيمترات، نضرب في 100، وفقًا لنسبة التحويل:</p>
  <p><strong>طول الجدار:</strong></p>${sol('4.5 · 100 = <span class="eq-unit" dir="rtl">450 سم</span>')}
  <p><strong>ارتفاع الجدار:</strong></p>${sol('2.8 · 100 = <span class="eq-unit" dir="rtl">280 سم</span>')}`;

const C7_B = `<p>نرمز بـ x إلى عرض الملصق الواحد بالسنتيمتر.</p>
  <p>لـ 5 ملصقات، ستكون هناك 4 فراغات بين الملصقات و-2 فراغات على الجانبين –<br>المجموع <strong>6 فراغات</strong> بطول 10 سم:</p>
  ${sol('6 · 10 = <span class="eq-unit" dir="rtl">60 سم</span>')}
  <p>ها هي المعادلة:</p>
  ${sol('5x + 60 = 450 &nbsp;/−60<br>5x = 390 &nbsp;/:5<br>x = 78')}
  <p><strong>ولذلك عرض كل ملصق على حدة هو 78 سم.</strong></p>`;

const C7_C = `<p>نرمز: y – ارتفاع الملصق بالسم.</p>
  <p>نكتب معادلة التناسب:</p>
  ${ctr(qeq(qfr('3', '4'), qfr('78', 'y')))}
  <p>نضرب بالمقام المشترك <span dir="ltr">(4y)</span>:</p>
  ${sol('3y = 312 &nbsp;/:3<br>y = 104')}`;

const C7_D = `<p>نرمز بـ x إلى عرض الملصق الواحد بالسنتيمتر.</p>
  <p>بمساعدة التطبيق نرى أن الفراغات لـ 8 ملصقات هي: 7 فراغات بين الملصقات و-2 على الجانبين - المجموع 9 فراغات بطول 10 سم:</p>
  ${sol('9 · 10 = <span class="eq-unit" dir="rtl">90 سم</span>')}
  <p>نكتب المعادلة التالية:</p>
  ${sol('8x + 90 = 450 &nbsp;/−90<br>8x = 360 &nbsp;/:8<br>x = 45')}
  <p>نرمز: y = ارتفاع الملصق بالسم ونرتّب المعطيات في جدول تناسب:</p>
  ${pTable(['ارتفاع', 'عرض'], [['4', '3'], ['y سم', '45 سم']])}
  ${ctr(qeq(qfr('3', '4'), qfr('45', 'y')))}
  <p>نضرب بالمقام المشترك <span dir="ltr">(4y)</span>:</p>
  ${sol('3y = 180 &nbsp;/:3<br>y = 60')}`;

const C7_E = `<p>سنحسب النسبة بين السعر والمساحة في كل عرض – السعر لكل سم².</p>
  <p>مطبعة 1: ${qfr('20', '500')} = 0.04 ₪ لكل سم²</p>
  <p>مطبعة 2: ${qfr('15', '400')} = 0.0375 ₪ لكل سم²</p>
  <p>السعر لكل سم² في المطبعة 2 أرخص<br>ولذلك عرض المطبعة 2 أكثر جدوى.</p>`;

const C7_F = `<p>أولاً سنحسب مساحة 8 ملصقات.</p>
  <p>وجدنا أنه لتعليق 8 ملصقات، يجب أن تكون أبعاد كل ملصق:<br> <strong>العرض: 45 سم، الطول: 60 سم</strong></p>
  <p>مساحة كل ملصق (حسب مساحة المستطيل):</p>
  ${sol('45 · 60 = <span class="eq-unit" dir="rtl">2,700 سم²</span>')}
  <p>المساحة الإجمالية لـ 8 ملصقات:</p>
  ${sol('8 · 2700 = <span class="eq-unit" dir="rtl">21,600 سم²</span>')}
  <p>نعوّض في جدول التناسب:</p>
  ${pTable(['المساحة (سم²)', 'سعر'], [['400', '15'], ['21,600', 'x']])}
  <p>ونكتب معادلة التناسب:</p>
  ${ctr(qeq(qfr('15', '400'), qfr('x', '21600')))}
  <p>نضرب في المقام المشترك (21,600):</p>
  ${sol('x = 15 · 54 = <span class="eq-unit" dir="rtl">810 شيكل</span>')}`;

const QUESTIONS = [
  { /* deck slide 31 — warm-up 1 of 2. The bar note on slides 31-32 reads
       "מקטע זה מלווה בסרגל שאלה, שאלה N מתוך 2". */
    screen: 10, type: 'value-input', label: '',
    step: { group: 'warmup', index: 1, total: 2 },
    stem: `<strong>سؤال 1</strong><br>النسبة بين 10 و-x تساوي النسبة بين 6 و-15.<br><br><strong>أوجدوا x.</strong>`,
    ratioRows: [{ label: 'x =', parts: 1 }],
    correctInputs: ['25'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'انتبهوا!', body: 'ما هي معادلة التناسب (تساوي النسب) المناسبة للمعطيات؟' },
    fb: { retry: 'هذا غير دقيق، هل نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: `<p>سنكتب معادلة التناسب المناسبة للمعطيات:</p>
        <p class="car-center"><span class="car-eq" dir="ltr"><span class="fraction fr-inline"><span class="frac-top">10</span><span class="frac-bottom">x</span></span><span class="car-eq-op">=</span><span class="fraction fr-inline"><span class="frac-top">6</span><span class="frac-bottom">15</span></span></span></p>
        <p>نضرب بالمضاعف المشترك: <span dir="ltr">15x</span></p>
        <p class="car-solve" dir="ltr">6 · x = 10 · 15<br>6x = 150 &nbsp;/:6</p>
        <p>وسنحصل على:</p>
        <p class="car-solve" dir="ltr">x = 25</p>` },
      wrong: { title: 'تقريبًا...', body: `<p>سنكتب معادلة التناسب المناسبة للمعطيات:</p>
        <p class="car-center"><span class="car-eq" dir="ltr"><span class="fraction fr-inline"><span class="frac-top">10</span><span class="frac-bottom">x</span></span><span class="car-eq-op">=</span><span class="fraction fr-inline"><span class="frac-top">6</span><span class="frac-bottom">15</span></span></span></p>
        <p>نضرب بالمضاعف المشترك: <span dir="ltr">15x</span></p>
        <p class="car-solve" dir="ltr">6 · x = 10 · 15<br>6x = 150 &nbsp;/:6</p>
        <p>وسنحصل على:</p>
        <p class="car-solve" dir="ltr">x = 25</p>` } },
  },
  { /* deck slide 32 — warm-up 2 of 2 */
    screen: 11, type: 'value-input', label: '',
    step: { group: 'warmup', index: 2, total: 2 },
    stem: `<strong>سؤال 2</strong><br>في مقصف السينما يبيعون الفشار بالوزن بسعر ثابت.<br>على اللافتة مكتوب "السعر حسب الوزن: 11 ₪ لكل 100 غرام فشار".<br><br>شيرا وراز ملأا كيس فشار بوزن 300 غرام.<br><br><strong>كم عليهما أن يدفعا؟</strong>`,
    ratioRows: [{ suffix: 'شيكل', parts: 1 }],
    correctInputs: ['33'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'فكّروا:', body: 'ما هي النسبة بين أوزان الفشار؟<br>ماذا عليكم أن تفعلوا للسعر للحفاظ على نفس النسبة؟' },
    fb: { retry: 'هذا غير دقيق، نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: `<p>نرمز:<br>x - السعر الذي يجب على شيرا وراز دفعه.</p>
        <p>لنرتّب المعطيات في جدول تناسب:</p>
        <table class="car-table"><thead><tr><th>الوزن (غرام)</th><th>السعر (₪)</th></tr></thead>
        <tbody><tr><td>100</td><td>11</td></tr><tr><td>300</td><td>x</td></tr></tbody></table>
        <p>نكتب معادلة التناسب:</p>
        <p class="car-center"><span class="car-eq" dir="ltr"><span class="fraction fr-inline"><span class="frac-top">x</span><span class="frac-bottom">300</span></span><span class="car-eq-op">=</span><span class="fraction fr-inline"><span class="frac-top">11</span><span class="frac-bottom">100</span></span></span></p>
        <p>نحلّ المعادلة ونحصل على:</p>
        <p class="car-solve" dir="ltr">x = 33</p>
        <p>استنتاج: على شيرا وراز دفع 33 ₪.</p>` },
      wrong: { title: 'تقريبًا...', body: `<p>نرمز:<br>x - السعر الذي يجب على شيرا وراز دفعه.</p>
        <p>لنرتّب المعطيات في جدول تناسب:</p>
        <table class="car-table"><thead><tr><th>الوزن (غرام)</th><th>السعر (₪)</th></tr></thead>
        <tbody><tr><td>100</td><td>11</td></tr><tr><td>300</td><td>x</td></tr></tbody></table>
        <p>نكتب معادلة التناسب:</p>
        <p class="car-center"><span class="car-eq" dir="ltr"><span class="fraction fr-inline"><span class="frac-top">x</span><span class="frac-bottom">300</span></span><span class="car-eq-op">=</span><span class="fraction fr-inline"><span class="frac-top">11</span><span class="frac-bottom">100</span></span></span></p>
        <p>نحلّ المعادلة ونحصل على:</p>
        <p class="car-solve" dir="ltr">x = 33</p>
        <p>استنتاج: على شيرا وراز دفع 33 ₪.</p>` } },
  },

  /* ═══ component 02 — תרגול סטנדרטי (deck slides 35-38) ═══ */

  { /* deck 35 — the applet question. The slide's "הפקה- שילוב ישומון" callout
       is a production note over a reference render, so the applet is BUILT
       (js/applet-dino.js) rather than shown as a picture. */
    screen: 13, type: 'value-input', label: '',
    step: { group: 'standard', index: 1, total: 4 },
    stem: `قام تلاميذ ببناء رسم تخطيطي لشخصية ديناصور لصالح لعبة حاسوب.<br> في الرسم التخطيطي الأولي، كانت أبعاد الديناصور:<br> <strong>الارتفاع: 12 سم</strong><br><strong>العرض: 9 سم</strong><br> لكي تتناسب الشخصية مع شاشة الحاسوب، يجب تكبير شخصية الديناصور بحيث يصبح ارتفاعها الجديد <strong>20 سم</strong>، مع الحفاظ على التناسب،<br> استعينوا بالتطبيق لإيجاد الإجابة.<br><br> <strong>كم يجب أن يكون العرض الجديد لشخصية الديناصور (بالسنتيمترات)؟</strong>`,
    content: dinoAppletHTML(),
    ratioRows: [{ suffix: 'سم', parts: 1 }],
    correctInputs: ['15'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'استعينوا بالتطبيق', body: 'غيّروا أبعاد شخصية الديناصور وفقًا للمطلوب بحيث يتم الحفاظ على النسبة الأصلية بين ارتفاعه وعرضه.' },
    fb: { retry: 'هذا غير دقيق، نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: DINO_FB },
      wrong:   { title: 'تقريبًا...', body: DINO_FB } },
  },

  { /* deck 36 — protein per bar */
    screen: 14, type: 'value-input', label: '',
    step: { group: 'standard', index: 2, total: 4 },
    stem: `اشترى أمير من كافيتيريا المدرسة قطعة سناك صحية جديدة.<br>على السناك مدوّنة القيم الغذائية لكل 100 غرام – كل 100 غرام من السناك يحتوي على 18 غرام بروتين.<br>وزن قطعة سناك الطاقة الواحدة هو 45 غرام.<br><br><strong>كم غرام بروتين تحتوي قطعة سناك صحية واحدة؟</strong>`,
    /* deck 36 image63 (38,446) 676x369 */
    content: `<img src="assets/img/q36-bar-AR.png" alt="وجبة خفيفة صحية وبجانبها الملصق الغذائي لكل 100 غرام من المنتج">`,
    ratioRows: [{ suffix: 'غرام بروتين', parts: 1 }],
    correctInputs: ['8.1'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'انتبهوا!', body: 'ما هي النسبة بين كمية البروتين ووزن المنتج لكل 100 غرام؟<br>يجب أن تبقى هذه النسبة محفوظة أيضًا لـ 45 غرام.' },
    fb: { retry: 'هذا غير دقيق، نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: BAR_FB },
      wrong:   { title: 'تقريبًا...', body: BAR_FB } },
  },

  { /* deck 37 — the goal */
    screen: 15, type: 'value-input', label: '',
    step: { group: 'standard', index: 3, total: 4 },
    stem: `أبعاد مرمى كرة القدم القانوني تتغير وفقًا لعمر اللاعبين.<br>في دوري الناشئين من سن 15 فما فوق، أبعاد المرمى القانوني هي<br><strong>العرض:</strong> 7.32 متر.<br><strong>الارتفاع:</strong> 2.44 متر.<br>بالنسبة للفئات العمرية الأصغر، يتم تصغير المرامي لتتناسب مع أبعاد الجسم<br>ومساحة الملعب.<br>للفتيان الذين تتراوح أعمارهم بين 12 و14 عامًا، يبلغ ارتفاع المرمى 2.13 متر.<br><br><strong>ما هو عرض المرمى المناسب، بحيث تُحفظ النسبة بين العرض والارتفاع للمرمى القانوني للكبار؟</strong>`,
    /* deck 37 image64 (16,282) 664x363 */
    content: `<img src="assets/img/q37-goal-AR.png" alt="مرمى كرة قدم قياسي: العرض 7.32 متر، الارتفاع 2.44 متر">`,
    ratioRows: [{ suffix: 'أمتار', parts: 1 }],
    correctInputs: ['6.39'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'انتبهوا:', body: 'ما هي النسبة بين عرض مرمى الكبار وارتفاعه؟<br>يجب أن تكون هذه النسبة مطابقة أيضًا في مرمى الناشئين.' },
    fb: { retry: 'هذا غير دقيق، نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: GOAL_FB },
      wrong:   { title: 'تقريبًا...', body: GOAL_FB } },
  },

  { /* deck 38 — single choice, the charger */
    screen: 16, type: 'single', label: '',
    step: { group: 'standard', index: 4, total: 4 },
    stem: `شاحن الهاتف المحمول قادر على شحن 12% من البطارية كل 5 دقائق.<br><br>تريد ريم شحن الهاتف إلى مستوى شحن 70%، لكنها تحتاج إلى مغادرة المنزل بعد نصف ساعة.<br><br><strong>هل ستتمكّن ريم من شحن الهاتف في الوقت المتاح؟</strong>`,
    options: [{ id: 'yes', html: 'نعم' }, { id: 'no', html: 'لا' }, { id: 'idk', html: 'لا يمكن المعرفة' }],
    correct: 'yes',
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'فكّروا:', body: 'إذا كان الشاحن يشحن 12% في 5 دقائق، فكم بالمئة من البطارية سيشحن في نصف ساعة (30 دقيقة)؟' },
    fb: { retry: 'هذا غير دقيق، هل نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: CHARGE_FB },
      wrong:   { title: 'تقريبًا...', body: CHARGE_FB } },
  },

  /* ═══ component 03 — תרגול בסיסי וסטנדרטי ב (deck slides 41-49)
     Six stations on the stepper: slides 41+42 are א/ב of station 1 and
     43+44 are א/ב of station 2, which is why eight question slides map to
     six stations (the deck's own stepper on slide 41 shows 6). ═══ */

  { /* deck 41 — station 1א, pick the proportion */
    screen: 18, type: 'single', label: '',
    step: { group: 'basic', index: 1, total: 4 },
    stem: `النسبة بين x و-27 تساوي النسبة بين 6 و-9.<br><br> <strong>أ. حددوا التناسب (تساوي النسب) المناسب:</strong>`,
    /* rendered page order, top to bottom */
    options: [
      { id: 'a', html: qeq(qfr('x', '9'), qfr('27', '6')) },
      { id: 'b', html: qeq(qfr('27', 'x'), qfr('6', '9')) },
      { id: 'c', html: qeq(qfr('x', '27'), qfr('6', '9')) },
      { id: 'd', html: qeq(qfr('x', '6'), qfr('9', '27')) },
    ],
    correct: 'c',
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'تذكّروا:', body: 'يجب أن تحرصوا على أن يكون ترتيب الأعداد في البسط والمقام متطابقًا في طرفي المعادلة.' },
    fb: { retry: 'هذا غير دقيق، نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C3_Q1A }, wrong: { title: 'تقريبًا...', body: C3_Q1A } },
  },

  { /* deck 42 — station 1ב, solve for x */
    screen: 19, type: 'value-input', label: '',
    step: { group: 'basic', index: 1, total: 4 },
    stem: `النسبة بين x و-27 تساوي النسبة بين 6 و-9.<br> وجدنا أن التناسب المناسب هو ${qeq(qfr('x', '27'), qfr('6', '9'))}<br><br> <strong>ب. جدوا قيمة x.</strong>`,
    ratioRows: [{ label: 'x =', parts: 1 }],
    correctInputs: ['18'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'انتبهوا:', body: 'يمكن الضرب في المقام المشترك (جدول التناسب) أو تحديد عامل التوسيع للكسر.' },
    fb: { retry: 'هذا غير دقيق، هل نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C3_Q1B }, wrong: { title: 'تقريبًا...', body: C3_Q1B } },
  },

  { /* deck 43 — station 2א: complete the DENOMINATOR of the right fraction */
    screen: 20, type: 'value-input', label: '',
    step: { group: 'basic', index: 2, total: 4 },
    stem: `في لعبة كمبيوتر، يجمع اللاعب 120 قطعة نقدية ذهبية افتراضية عن كل 3 مهمات يُكملها.<br><br>وسيم لعب بعد الظهر ورأى أنه تجمّع لديه 400 قطعة نقدية، لكنه لم يتذكر كم مهمة أنهى بنجاح.<br><br>نرمز: x - عدد المهمات التي أنهاها وسيم.<br><br><strong>أ. أكملوا التناسب (تساوي النسب):</strong>`,
    equation: { left: { top: '3', bottom: '120' },
                right: { top: 'x', bottom: { input: true, label: 'مقام' } } },
    correctInputs: ['400'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'استعينوا بجدول التناسب:', body: 'مقابل كل 3 مهام يحصل وسيم على 120 قطعة نقدية — أي معطى يُكمل الطرف الثاني؟' },
    fb: { retry: 'هذا غير دقيق، هل نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C3_Q2A }, wrong: { title: 'هذا خطأ، لكن يمكن التعلّم منه:', body: C3_Q2A } },
  },

  { /* deck 44 — station 2ב */
    screen: 21, type: 'value-input', label: '',
    step: { group: 'basic', index: 2, total: 4 },
    stem: `في لعبة كمبيوتر، يجمع اللاعب 120 قطعة نقدية ذهبية افتراضية عن كل 3 مهمّات يُكملها.<br><br>وسيم لعب بعد الظهر ورأى أنه تراكم لصالحه 400 قطعة نقدية، لكنه لم يتذكّر كم مهمّة أنهى بنجاح.<br><br>نرمز: x - عدد المهمّات التي أنهاها وسيم.<br>وجدنا أن التناسب بين عدد المهمّات التي أنهاها وعدد القطع النقدية الذهبية هو: ${qeq(qfr('3', '120'), qfr('x', '400'))}<br><br><strong>ب. كم مهمّة أكمل وسيم في اللعبة بعد الظهر؟</strong>`,
    ratioRows: [{ label: 'x =', parts: 1 }],
    correctInputs: ['10'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'انتبهوا:', body: 'اضربوا بالمقام المشترك لحل المعادلة.' },
    fb: { retry: 'هذا غير دقيق، هل نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C3_Q2B }, wrong: { title: 'تقريبًا...', body: C3_Q2B } },
  },

  { /* deck 45 — station 3 */
    screen: 22, type: 'value-input', label: '',
    step: { group: 'basic', index: 3, total: 4 },
    stem: `في لعبة كمبيوتر، أنتم تعملون على تبليط مدخل حصنكم.<br> لإنشاء نمط من البلوكات المزخرفة، تستخدمون نسبة ثابتة من بلوكَين من <strong>الرخام</strong> لكل 5 بلوكات من <strong>العشب</strong>.<br><br> <strong>إذا استخدمتم 30 بلوكًا من العشب،<br> كم بلوكًا من الرخام تحتاجون<br> للحفاظ على نسبة 2:5؟</strong>`,
    /* deck 45's image71 was a REFERENCE render of this applet; the producer
       supplied the real thing (28.09), so it is embedded rather than pictured. */
    content: appletEmbed('applets/tiling.html', 'مهمة التبليط — نسبة 2:5'),
    ratioRows: [{ suffix: 'بلوكات', parts: 1 }],
    correctInputs: ['12'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'انتبهوا!', body: 'ابنوا معادلة تناسب تصف تساوي النسب بين كمية الرخام وكمية العشب.' },
    fb: { retry: 'هذا غير دقيق، هل نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C3_Q3 }, wrong: { title: 'تقريبًا...', body: C3_Q3 } },
  },

  { /* deck 46 — station 4 */
    screen: 23, type: 'value-input', label: '',
    step: { group: 'basic', index: 4, total: 4 },
    stem: `سامر يحضّر قائمة تشغيل من الأغاني المفضلة للاستماع إليها أثناء المشي.<br> لاحظ أن كل 5 أغانٍ في القائمة تستغرق معًا بالضبط 15 دقيقة من التشغيل.<br> سامر يريد تحضير قائمة تشغيل تستمر 60 دقيقة (ساعة واحدة).<br><br> <strong>إذا بقيت سرعة التشغيل نفسها، كم أغنية يجب أن تكون في قائمة التشغيل؟</strong>`,
    /* the proportion table lives in the feedback only (producer 28.09) */
    ratioRows: [{ suffix: 'أغانٍ', parts: 1 }],
    correctInputs: ['20'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'انتبهوا:', body: `ضعوا x لعدد الأغاني في قائمة التشغيل التي مدتها 60 دقيقة،<br>واستعينوا بجدول التناسب التالي:${pTable(['عدد الأغاني', 'وقت التشغيل'], [['5', '15 دقيقة'], ['x', '60 دقيقة']])}` },
    fb: { retry: 'هذا غير دقيق، نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C3_Q4 }, wrong: { title: 'تقريبًا!', body: C3_Q4 } },
  },

  { /* deck 48 — station 5 */
    screen: 25, type: 'value-input', label: '',
    step: { group: 'basic2', index: 1, total: 2 },
    stem: `استعدادًا للرحلة السنوية، تطلب طبقة الصف الثامن قمصانًا مطبوعة لجميع طالبات وطلاب الطبقة.<br> مطبعة محلية قدّمت لهم عرض سعر: 25 قميصًا بـ 550 ₪.<br> في الطبقة 175 طالبًا.<br><br> <strong>كم شيكلًا ستكلّف الطلبية كلها؟</strong>`,
    ratioRows: [{ suffix: '₪', parts: 1 }],
    correctInputs: ['3850'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'تحققوا:', body: 'كم مرة يكون عدد الطلاب في المستوى أكبر من عدد القمصان في العرض الأصلي؟' },
    fb: { retry: 'هذا غير دقيق، نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C3_Q5 }, wrong: { title: 'تقريبًا...', body: C3_Q5 } },
  },

  { /* deck 49 — station 6, THREE values */
    screen: 26, type: 'value-input', label: '',
    step: { group: 'basic2', index: 2, total: 2 },
    stem: `لتحضير صلصة للسلطة يجب خلط المكونات لكل 100 مل صلصة:<br><br> <strong>أكملوا:</strong><br> <strong>لتحضير كمية 150 مل من صلصة السلطة، يجب خلط:</strong>`,
    /* 06.10, producer: bigger type AND closer to the opening sentence. The
       content column is `align-items: center`, which parked the table in the
       middle of an empty half-screen, far from the stem it belongs to. */
    content: pTable(['مكوّن', 'كمية'],
      [['زيت زيتون', '60 مل'], ['خل بلسمي', '30 مل'], ['صلصة الصويا', '10 مل']], 'car-table--lg'),
    ratioRows: [
      { suffix: 'مل زيت زيتون', parts: 1 },
      { suffix: 'مل خل بلسمي', parts: 1 },
      { suffix: 'مل صلصة صويا', parts: 1 },
    ],
    correctInputs: ['90', '45', '15'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'فكّروا:', body: 'ما هي النسبة بين كمية الصلصة في الوصفة الجديدة وكمية الصلصة في الوصفة الأصلية؟' },
    fb: { retry: 'هذا غير دقيق، نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C3_Q6 }, wrong: { title: 'تقريبًا...', body: C3_Q6 } },
  },

  /* ═══ component 05 — תרגול מתקדם (deck 61-67).  Four stepper stations:
     61 · 62-64 (א/ב/ג) · 65-66 (א/ב) · 67 — matching slide 60's "4 שאלות". ═══ */

  { /* deck 61 — the escape-room code */
    screen: 36, type: 'value-input', label: '',
    step: { group: 'advanced', index: 1, total: 4 },
    stem: `ليان تحتفل بعيد ميلادها الـ <strong>14</strong> في غرفة هروب.<br> إحدى المهمات هي فتح صندوق مقفل برمز مكوّن من 4 أرقام.<br> ليان تركت لهم تلميحين:<br><br> <strong>الرقمان الأولان من اليسار</strong> هما عمر أبيها اليوم.<br> بعد سنتين، ستكون النسبة بين عمر ليان وعمر أبيها ${qfr('4','11')}.<br><br> <strong>الرقمان الأخيران</strong> هما عمر أمها اليوم.<br> قبل 4 سنوات، كانت النسبة بين عمر ليان وعمر أمها ${qfr('2','7')}.<br><br> <strong>أدخلوا الرمز لفتح القفل</strong>`,
    ratioRows: [{ parts: 1 }],
    correctInputs: ['4239'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'انتبهوا', body: 'إذا رمزنا بـ x لعمر الأب اليوم، ما سيكون عمره بعد سنتين؟ وعمر ليان؟ أكملوا التناسب المناسب.<br>إذا رمزنا بـ y لعمر الأم اليوم، ما كان عمرها قبل 4 سنوات؟ وعمر ليان؟ أكملوا التناسب المناسب.' },
    fb: { retry: 'هذا غير دقيق، نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C5_CODE }, wrong: { title: 'تقريبًا...', body: C5_CODE } },
  },

  { /* deck 62 — pizza, part א */
    screen: 37, type: 'single', label: '',
    step: { group: 'advanced', index: 2, total: 4 },
    stem: `مطعم بيتزا يقدّم بيتزتين دائريتين بنفس السماكة ولكن بأحجام مختلفة.<br> آدم وملك يتجادلان فيما بينهما أيّ بيتزا أكثر توفيرًا للشراء:<br> <strong>بيتزا متوسطة</strong>: قطر 30 سم، سعر 30 شيكل.<br> <strong>بيتزا كبيرة</strong>: قطر 40 سم، سعر 40 شيكل.<br><br> <strong>أ. النسبة بين مساحة البيتزا الكبيرة ومساحة البيتزا المتوسطة هي:</strong>`,
    /* 30.09 — the two pizzas are drawn TO SCALE against each other, as deck
       page 62 does: 30cm reads smaller than 40cm. A single max-height made
       them identical, which is the opposite of what the question asks. */
    content: `<div class="pizza-stack">
      <img class="pizza pizza--30" src="assets/img/pizza-med-AR.png" alt="بيتزا متوسطة، قطر 30 سم">
      <img class="pizza pizza--40" src="assets/img/pizza-large-AR.png" alt="بيتزا كبيرة، قطرها 40 سم">
    </div>`,
    /* 30.09 — order read off the RENDERED deck page 62 (maven-skills §4c) */
    options: [{ id: 'd', html: '4:3' }, { id: 'a', html: '15:4' },
              { id: 'b', html: '16:9' }, { id: 'c', html: '3:2' }],
    correct: 'b',
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'انتبهوا:', body: 'طول القطر يساوي ضعف نصف قطر الدائرة.<br>مساحة دائرة نصف قطرها R تساوي <span dir="ltr">π · R²</span>.<br>للتسهيل، يمكن استخدام <span dir="ltr">π = 3.14</span>.' },
    fb: { retry: 'هذا غير دقيق، نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C5_PIZZA_A }, wrong: { title: 'تقريبًا...', body: C5_PIZZA_A } },
  },

  { /* deck 63 — pizza, part ב.  The two callouts are what נתנאל and רוני each
       claim, so they belong to the options, not to the screen. */
    screen: 38, type: 'single', label: '',
    step: { group: 'advanced', index: 2, total: 4 },
    stem: `مطعم بيتزا يقدّم نوعين من البيتزا الدائرية بنفس السُمك ولكن بأحجام مختلفة.<br>آدم وملك يتجادلان فيما بينهما أيّ بيتزا أكثر ربحية للشراء:<br><strong>بيتزا متوسطة</strong>: قطر 30 سم، سعر 30 شيكل.<br><strong>بيتزا كبيرة</strong>: قطر 40 سم، سعر 40 شيكل.<br><br><strong>ب. من على حق؟</strong>`,
    /* 30.09 — deck page 63 draws this as ONE picture with two speech bubbles
       over it, not a photo plus two paragraphs. Geometry lifted from the slide
       (stage coords: photo 3,241 506x375 · bubble נתנאל 243,52 · bubble רוני
       -1,184) and expressed as percentages of the figure so it scales with the
       column. The photo is the deck's own image119. */
    /* 06.10, producer: "i really want to make the text bubbles come out of
       their mouths". The mouths are measured off the photo itself and carried
       here as percentages OF THE PHOTO (x,y); debateTails() turns them into a
       drawn tail per bubble at runtime, from the live boxes — a typed pixel
       tail would be wrong the moment the copy rewraps. */
    content: `<figure class="debate-fig" data-mouth-natanel="73.0,44.2" data-mouth-roni="31.2,44.2">
      <img class="debate-photo" data-no-zoom src="assets/img/pizza-debate-AR.png" alt="آدم وملك يتجادلان أيّ بيتزا أكثر توفيرًا">
      <svg class="debate-tails" aria-hidden="true"></svg>
      <div class="debate-bubble debate-bubble--natanel">البيتزتان مُجديتان بنفس القدر!<br>قطر البيتزا المتوسطة هو 30 سم وسعرها 30 شيكل، قطر البيتزا الكبيرة هو 40 سم وسعرها 40 ₪.<br>في كلتا الحالتين النسبة بين القطر والسعر هي 1 إلى 1، ولذلك لا يوجد فرق.</div>
      <div class="debate-bubble debate-bubble--roni">البيتزا الكبيرة أكثر توفيرًا، لأن النسبة بين مساحة البيتزا الكبيرة وسعرها أكبر من النسبة بين مساحة البيتزا المتوسطة وسعرها</div>
    </figure>`,
    /* 30.09 — deck page 63 reads נתנאל / רוני / אף אחד top-to-bottom. All three
       option shapes share one <a:off>, so the XML order is meaningless here
       and the RENDERED page is the only source (maven-skills §4c). */
    options: [{ id: 'natanel', html: 'آدم' }, { id: 'roni', html: 'ملك' }, { id: 'none', html: 'لا أحد' }],
    correct: 'roni',
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'فكّروا', body: 'كم مساحة بيتزا نحصل عليها مقابل كل شيكل لكلّ واحدة من البيتزات؟' },
    fb: { retry: 'هذا غير دقيق، نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C5_PIZZA_B }, wrong: { title: 'تقريبًا...', body: C5_PIZZA_B } },
  },

  { /* deck 64 — pizza, part ג */
    screen: 39, type: 'value-input', label: '',
    step: { group: 'advanced', index: 2, total: 4 },
    stem: `مطعم بيتزا يقدّم نوعين من البيتزا الدائرية بنفس السماكة ولكن بأحجام مختلفة.<br>‏ <strong>بيتزا متوسطة</strong>: بقطر 30 سم وبسعر 30 شيكل.<br>‏ <strong>بيتزا كبيرة</strong>: بقطر 40 سم وبسعر 40 شيكل.<br>‏ بيتزا عائلية جديدة على وشك أن تُطرح في السوق.<br>‏ يريد المطعم الحفاظ على نفس نسبة السعر إلى المساحة كما في البيتزا الكبيرة.<br><br>‏ <strong>ج. إذا كان قطر البيتزا العائلية 50 سم،<br>كم يجب أن يكون سعرها؟</strong>`,
    /* 30.09 — deck page 64 shows all three pizzas (30 / 40 / 50), each to
       scale; the build carried only the family one. */
    content: `<div class="pizza-stack pizza-stack--three">
      <img class="pizza pizza--30" src="assets/img/pizza-med-AR.png" alt="بيتزا متوسطة، قطر 30 سم">
      <img class="pizza pizza--40" src="assets/img/pizza-large-AR.png" alt="بيتزا كبيرة، قطر 40 سم">
      <img class="pizza pizza--50" src="assets/img/pizza-family-AR.png" alt="بيتزا عائلية، قطر 50 سم">
    </div>`,
    ratioRows: [{ suffix: '₪', parts: 1 }],
    correctInputs: ['62.5'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'فكّروا:', body: 'ما هي نسبة السعر إلى المساحة للبيتزا الكبيرة؟<br>كم يجب أن يكون سعر البيتزا العائلية حتى تبقى النسبة محفوظة؟' },
    fb: { retry: 'هذا غير دقيق، نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C5_PIZZA_C }, wrong: { title: 'تقريبًا...', body: C5_PIZZA_C } },
  },

  { /* deck 65 — the spring applet, part א (producer-supplied page) */
    screen: 40, type: 'value-input', label: '',
    step: { group: 'advanced', index: 3, total: 4 },
    stem: `عند تعليق ثقل على نابض، يتمدد النابض.<br>كلما أضفنا أثقالاً أكثر (زدنا الكتلة) تمدد النابض أكثر.<br>أضيفوا أثقالاً إلى السلة وافحصوا مقدار تمدد النابض<br>وفقاً لمقياس التمدد الديناميكي.<br><br><strong>أ. أكملوا:</strong>`,
    content: appletEmbed('applets/spring.html', 'تطبيق النابض والأثقال'),
    ratioRows: [
      { label: 'كتلة 100 غرام تسبب استطالة بمقدار', suffix: 'سم', parts: 1 },
      { label: 'كتلة مقدارها', suffix: 'غرام تسبب استطالة بمقدار 12.5 سم', parts: 1 },
    ],
    correctInputs: ['5', '250'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'استعينوا بالتطبيق:', body: 'أضيفوا أثقالاً إلى السلة وافحصوا مدى تمدّد النابض.' },
    fb: { retry: 'هذا غير دقيق، نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C5_SPRING_A }, wrong: { title: 'تقريبًا...', body: C5_SPRING_A } },
  },

  { /* deck 66 — the spring, part ב */
    screen: 41, type: 'value-input', label: '',
    step: { group: 'advanced', index: 3, total: 4 },
    stem: `في التطبيق يمكن إضافة أو إزالة أثقال فقط بقفزات مقدارها 50 غرام.<br>في الواقع، يمكن تعليق كتل بأحجام مختلفة على النابض.<br><br><strong>أكملوا:</strong>`,
    /* 30.09 — deck page 66 carries the SAME applet as page 65; the copy even
       says "ביישומון", and the build had no content at all here. */
    content: appletEmbed('applets/spring.html', 'تطبيق النابض والأثقال'),
    ratioRows: [
      { label: 'النسبة الثابتة بين الكتلة واستطالة النابض هي', suffix: 'غرام لكل سم.', parts: 1 },
      { label: 'ولذلك فإن كتلة 180 غرام تسبب استطالة مقدارها', suffix: 'سم', parts: 1 },
    ],
    correctInputs: ['20', '9'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'استعينوا بالمعطيات التي وجدتموها في البند السابق:', body: 'لكتلة مقدارها 100 غرام، يتمدد النابض بمقدار 5 سم.' },
    fb: { retry: 'هذا غير دقيق، هل نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C5_SPRING_B }, wrong: { title: 'تقريبًا...', body: C5_SPRING_B } },
  },

  { /* deck 67 — the puzzle applet */
    screen: 42, type: 'value-input', label: '',
    step: { group: 'advanced', index: 4, total: 4 },
    stem: `<strong>استعينوا بالتطبيق.</strong><br>كم جزءًا إجماليًا سيحتوي عليه البازل الجديد؟`,
    /* 30.09 — producer-supplied applet (יישומון פאזל). The screen said
       "העזרו ביישומון" with no applet on it. */
    /* measured: the applet stops overflowing at ~1000x826, so it is laid out
       at 1020x860 and scaled to the embed — no X or Y scroll, file unchanged */
    content: appletEmbed('applets/puzzle.html', 'تطبيق الأحجية', { w: 1020, h: 860 }),
    ratioRows: [{ suffix: 'قطعة', parts: 1 }],
    correctInputs: ['540'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'اكتشفوا أولاً كم صفاً سيكون في الأحجية الجديدة،', body: 'بحيث تُحفظ النسبة الأصلية بين طول الأحجية وعرض الأحجية.' },
    fb: { retry: 'هذا غير دقيق، نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C5_PUZZLE }, wrong: { title: 'تقريبًا...', body: C5_PUZZLE } },
  },

  /* ═══ component 06 — שאלת שיא א (deck 72-76). Five sections; slide 71 says
     "יש בה 5 סעיפים. עליכם להצליח ב-4 לפחות". image133 (לוח המידע) is on
     every one of them. ═══ */

  { /* deck 72 — section א */
    screen: 46, type: 'value-input', label: '',
    /* producer 04.10: no stepper bar on this screen. The question stays IN
       the group — drop it and station 1 has no question, which the paint
       loop reads as "all its parts are done" and ticks it green forever. */
    step: { group: 'peak1', index: 1, total: 5, hideBar: true },
    stem: `أ. تم اختيار مجموعة من 15 طالبًا من الصف الثامن لتمثيل إسرائيل في مخيم صيفي رياضي دولي في الولايات المتحدة الأمريكية.<br> لمساعدة الطلاب، يقوم المرشدون بتحديث "لوحة معلومات المخيم" يوميًا والتي تتضمن بيانات تسهّل عليهم التعامل في بلد أجنبي.<br><br> <strong>استخدموا المعلومات الموجودة على اللوحة للإجابة عن الأسئلة التالية:</strong>`,
    content: BOARD,
    ratioRows: [
      { label: "1 قدم (feet) يساوي", suffix: 'سم', parts: 1 },
      { label: '1 يارد (yard) يساوي', suffix: 'سم', parts: 1 },
    ],
    correctInputs: ['30.48', '91.44'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'انتبهوا!', body: "إذا كان معطى لكم أن 1 قدم = 12 إنش، و-1 يارد = 3 أقدام،<br>عليكم ضرب القيم للوصول إلى قيمة يارد واحد." },
    fb: { retry: 'هذا غير دقيق، نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C6_A }, wrong: { title: 'تقريبًا...', body: C6_A } },
  },

  { /* deck 73 — section ב */
    screen: 47, type: 'value-input', label: '',
    step: { group: 'peak1', index: 2, total: 5, hideBar: true },
    stem: `ب. يخطط الطلاب لتحضير بانكيك لجميع أعضاء المجموعة. مكتوب في وصفتهم أنه يجب إضافة 600 مل حليب إلى الخليط.<br>في مطبخ المخيم يوجد وعاء قياس واحد فقط تكون العلامات عليه مدرّجة بأونصات السوائل (oz) فقط.<br><br><strong>كم أونصة حليب عليهم قياسها في الوعاء لتتطابق الكمية<br>مع الكمية المذكورة في الوصفة؟</strong>`,
    content: BOARD,
    ratioRows: [{ suffix: 'oz', parts: 1 }],
    correctInputs: ['20'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'انتبهوا:', body: 'توجد نسبة ثابتة بين وحدة الحجم أونصة سائلة (fl oz) ووحدة الحجم ميلليلتر (ml).<br>استعينوا بهذه النسبة لكتابة تناسب مناسب.' },
    fb: { retry: 'هذا غير دقيق، نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C6_B }, wrong: { title: 'تقريبًا...', body: C6_B } },
  },

  { /* deck 74 — section ג */
    screen: 48, type: 'single', label: '',
    step: { group: 'peak1', index: 3, total: 5, hideBar: true },
    stem: `ج. استعدادًا ليوم رحلة في الطبيعة، تنصّ قواعد السلامة على أنّ كل شخص يجب أن يأخذ معه لترين من الماء للشرب على الأقل.<br> يخرج إلى الرحلة جميع التلاميذ الـ 15 بالإضافة إلى 3 مرشدين مرافقين.<br> تمّ تخصيص خزّان مياه مركزي واحد للمجموعة يحتوي على 8 غالونات من الماء.<br><br> <strong>هل كمية الماء في الخزّان ستكفي لتعبئة زجاجات جميع المشاركين وفقًا لقواعد السلامة؟</strong>`,
    content: BOARD,
    options: [{ id: 'yes', html: 'نعم' }, { id: 'no', html: 'لا' }, { id: 'idk', html: 'لا يمكن المعرفة' }],
    correct: 'no',
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'فكّروا:', body: 'كم لترًا من الماء مطلوب وفقًا لإجراءات السلامة لجميع المشاركين في الرحلة؟<br>المقارنة المباشرة بين كمية الماء المطلوبة وكمية الماء في الخزان ممكنة فقط عندما تكون الكميات بنفس وحدات القياس.' },
    fb: { retry: 'هذا غير دقيق، نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C6_C }, wrong: { title: 'تقريبًا...', body: C6_C } },
  },

  { /* deck 75 — section ד */
    screen: 49, type: 'single', label: '',
    step: { group: 'peak1', index: 4, total: 5, hideBar: true },
    stem: `د. يطلب الفريق قمصانًا تمثيلية من متجر أمريكي.<br>لقياس المقاس، يقيس كريم عرض صدره ويحصل على نتيجة 50.8 سم.<br>في جدول المقاسات الخاص بالمتجر، يظهر عرض الصدر بالإنشات.<br><br><strong>أي مقاس قميص يجب أن يختار كريم؟</strong>`,
    content: BOARD,
    /* 30.09 — deck page 75 runs Small → Large; ours ran it backwards */
    options: [
      { id: 's', html: "Small (حتى 18 إنش)" },
      { id: 'm', html: "Medium (19-21 إنش)" },
      { id: 'l', html: "Large (22 إنش فما فوق)" },
    ],
    correct: 'm',
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'انتبهوا:', body: "استخدموا المعطى من الجدول - إذا كان 1 إنش يساوي 2.54 سم،<br>كيف نعرف كم إنشًا يساوي 50.8 سم؟" },
    fb: { retry: 'هذا غير دقيق، نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C6_D }, wrong: { title: 'تقريبًا...', body: C6_D } },
  },

  { /* deck 76 — section ה */
    screen: 50, type: 'single', label: '',
    step: { group: 'peak1', index: 5, total: 5, hideBar: true },
    stem: `هـ. تحت تصرف المجموعة ميزانية محددة مسبقًا قدرها 1,500 ₪ لشراء قمصان تمثيلية لـ 15 طالبًا (لا حاجة لشراء قمصان للمرشدين).<br> سعر كل قميص في متجر المخيم هو <span dir="ltr">$30</span>.<br><br> <strong>هل ستكفي الميزانية المتاحة للمجموعة لشراء قمصان لجميع الطلاب؟</strong>`,
    content: BOARD,
    options: [{ id: 'yes', html: 'نعم' }, { id: 'no', html: 'لا' }, { id: 'idk', html: 'لا يمكن معرفة ذلك' }],
    correct: 'yes',
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'لمعرفة ما إذا كانت الميزانية كافية، من الأفضل تقسيم السؤال إلى ثلاث مراحل:',
      body: '1. ما هي التكلفة الإجمالية لجميع القمصان بالدولار؟<br>2. كيف نحوّل هذا المبلغ إلى شيكل حسب سعر الصرف المعطى في الجدول؟<br>3. هل المبلغ الذي حصلتم عليه بالشيكل أصغر أم أكبر من 1500 ₪؟' },
    fb: { retry: 'هذا غير دقيق، نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C6_E }, wrong: { title: 'تقريبًا...', body: C6_E } },
  },

  /* ═══ component 07 — שאלת שיא ב (deck 80-85).  Slide 78 announces "5 סעיפים"
     but the deck carries SIX (א-ו, slides 80-85); the stepper follows the real
     slides. Flagged to the producer; 2026-10-12 the team decided 6 sections, 4 to pass —
     s51's text now says 6. ═══ */

  { /* deck 80 — section א */
    screen: 53, type: 'value-input', label: '',
    /* producer 04.10: no stepper bar on this screen. The question stays IN
       the group — drop it and station 1 has no question, which the paint
       loop reads as "all its parts are done" and ticks it green forever. */
    step: { group: 'peak2', index: 1, total: 6, hideBar: true },
    stem: `أ. أبعاد جدار القاعة الذي ستُعلَّق عليه الملصقات هي:<br>طول 4.5 أمتار<br>ارتفاع 2.8 أمتار.<br><br><strong>حوّلوا أبعاد الجدار إلى سنتيمترات (سم):</strong>`,
    content: `<figure class="expo-fig">
      <div class="expo-bubble">هذا هو الوقت للاستعانة بكل ما تعلمناه عن التناسب لمساعدة اللجنة في تخطيط المعرض!</div>
      <img class="expo-shot" data-no-zoom src="assets/img/expo-wall.png" alt="طالبة في معرض التصوير">
    </figure>`,
    ratioRows: [
      { label: 'طول الجدار', suffix: 'سم', parts: 1 },
      { label: 'ارتفاع الجدار', suffix: 'سم', parts: 1 },
    ],
    correctInputs: ['450', '280'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'انتبهوا:', body: 'استعينوا بنسبة التحويل 1 متر = 100 سم.' },
    fb: { retry: 'هذا غير دقيق، هل نحاول مرة أخرى؟',
      correct: { title: 'ممتاز، إجابة صحيحة!', body: C7_A },
      wrong: { title: 'الإجابة غير صحيحة، لكن أحسنت بالمحاولة!<br>إليك الشرح:', body: C7_A } },
  },

  { /* deck 81 — section ב, the posters applet */
    screen: 54, type: 'value-input', label: '',
    step: { group: 'peak2', index: 2, total: 6, hideBar: true },
    stem: `ب. يجب تعليق الملصقات على الحائط بحيث تُحفظ مسافة 10 سم بين كل ملصقين متجاورين، وكذلك مسافة 10 سم بين الملصقات وأطراف الحائط.<br><br> <strong>استعينوا بالتطبيق وفكّروا:</strong><br> ما هو العرض المطلوب لكل ملصق، إذا أردنا تعليق 5 ملصقات على الحائط؟`,
    content: appletEmbed('applets/posters.html', 'تطبيق الملصقات على الحائط'),
    ratioRows: [{ suffix: 'سم', parts: 1 }],
    correctInputs: ['78'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'فكّروا:', body: 'كم فراغًا بمقدار 10 سم تكوّن لـ 5 ملصقات؟' },
    fb: { retry: 'هذا غير دقيق، هل نحاول مرة أخرى؟',
      correct: { title: 'ممتاز، إجابة صحيحة!', body: C7_B },
      wrong: { title: 'أخطأت. لا بأس، سنتقدّم خطوة بخطوة:', body: C7_B } },
  },

  { /* deck 82 — section ג */
    screen: 55, type: 'value-input', label: '',
    step: { group: 'peak2', index: 3, total: 6, hideBar: true },
    stem: `ج. طُلب من الطلاب تصوير الصور بالهاتف المحمول بنسبة بين عرض الصورة وارتفاعها تساوي 3:4.<br><br>لكي لا تتشوّه الصور، ستُطبع الملصقات مع الحفاظ على نفس النسبة بين العرض والارتفاع.<br>وجدنا أن عرض الملصق هو 78 سم.<br><br><strong>ما ارتفاع الملصق الذي يحافظ على التناسب المناسب؟</strong>`,
    content: `<img src="assets/img/expo-ratio.png" alt="النسبة بين عرض وارتفاع الصورة — 3:4">`,
    ratioRows: [{ suffix: 'سم', parts: 1 }],
    correctInputs: ['104'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'استعينوا بجدول التناسب:', body: 'رتّبوا العرض والارتفاع للصورة مقابل العرض والارتفاع للملصق.' },
    fb: { retry: 'هذا غير دقيق، هل نحاول مرة أخرى؟',
      correct: { title: 'الإجابة صحيحة.', body: C7_C },
      wrong: { title: 'أخطأت. إليك الشرح الذي سيساعدك على فهم أين:', body: C7_C } },
  },

  { /* deck 83 — section ד */
    screen: 56, type: 'value-input', label: '',
    step: { group: 'peak2', index: 4, total: 6, hideBar: true },
    stem: `د. ثلاث طالبات إضافيات ينضممن إلى المعرض، والآن يجب حساب عرض الملصقات من جديد.<br>ما هي أبعاد كل ملصق، إذا أردنا تعليق 8 ملصقات؟<br>للتذكير، النسبة بين العرض والارتفاع للصور الملتقطة بالهاتف المحمول هي 3:4.`,
    content: appletEmbed('applets/posters.html', 'تطبيق الملصقات على الحائط'),
    ratioRows: [
      { label: 'العرض:', suffix: 'سم', parts: 1 },
      { label: 'ارتفاع:', suffix: 'سم', parts: 1 },
    ],
    correctInputs: ['45', '60'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'انتبهوا:', body: 'ابدأوا بحساب عرض كل ملصق - استعينوا بالتطبيق.' },
    /* 06.10, producer: this wrong title ALWAYS — also when one of the two
       fields is right, where the engine would otherwise say "تقريبًا!". */
    fb: { retry: 'هذا غير دقيق، هل نحاول مرة أخرى؟', partial: null,
      correct: { title: 'ممتاز، إجابة صحيحة!', body: C7_D },
      wrong: { title: 'أخطأت في بعض البنود أو جميعها. الإجابة الصحيحة معروضة.', body: C7_D } },
  },

  { /* deck 84 — section ה */
    screen: 57, type: 'single', label: '',
    step: { group: 'peak2', index: 5, total: 6, hideBar: true },
    stem: `هـ. توجّه الطلاب والطالبات إلى مطبعتين للحصول على عروض أسعار لطباعة الملصقات. وردت عروض الأسعار التالية:<br><br> مطبعة 1 - 20 شيكل لكل 500 سم²<br> مطبعة 2 - 15 شيكل لكل 400 سم²<br><br> <strong>أيّ عرض أكثر توفيرًا؟</strong>`,
    content: `<img class="expo-shot expo-shot--print" data-no-zoom src="assets/img/expo-print-565.jpg" alt="ملصقات مطبوعة">`,
    /* 30.09 — deck page 84 puts "שתי ההצעות" third and "لا يمكن التحديد" last */
    options: [
      { id: 'p1', html: 'مطبعة 1' }, { id: 'p2', html: 'طباعة 2' },
      { id: 'same', html: 'العرضان مُجديان بنفس القدر' }, { id: 'idk', html: 'لا يمكن التحديد' },
    ],
    correct: 'p2',
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'انتبهوا:', body: 'لكي نقارن بين العروض، يجب أن نعرف ما سيكون السعر مقابل <strong>نفس المساحة</strong>.' },
    fb: { retry: 'هذا غير دقيق، هل نحاول مرة أخرى؟',
      correct: { title: 'صحيح!', body: C7_E },
      wrong: { title: 'تقريبًا، لا بأس، هذا جزء من كل عملية تعلّم.<br>إليك الشرح:', body: C7_E } },
  },

  { /* deck 85 — section ו */
    screen: 58, type: 'value-input', label: '',
    step: { group: 'peak2', index: 6, total: 6, hideBar: true },
    stem: `اكتشفنا أن مساحة كل ملصق هي 2,700 سم².<br>و. اختارت اللجنة عرض مطبعة 2، حيث السعر هو 15 ₪ لكل 400 سم².<br><br><strong>أكملوا: ما سيكون سعر طباعة 8 ملصقات؟</strong>`,
    ratioRows: [{ suffix: 'ش. ج', parts: 1 }],
    correctInputs: ['810'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'فكّروا:', body: 'ما المساحة الإجمالية لـ 8 ملصقات؟' },
    fb: { retry: 'هذا غير دقيق، نحاول مرة أخرى؟',
      correct: { title: 'ممتاز، إجابة صحيحة!', body: C7_F },
      wrong: { title: 'الإجابة غير صحيحة، ممتاز أنك حاولت،<br>هيا نكون أكثر دقة:', body: C7_F } },
  },
];
