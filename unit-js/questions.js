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

const DINO_FB = `<p><strong>בדמות המקורית, </strong>היחס בין הגובה לרוחב הוא:</p>
  ${ctr(qeq(qfr('12', '9'), qfr('4', '3')) + '<span class="fb-note">צמצום ב-3</span>')}
  <p>יחס זה צריך להישמר גם בין הגובה החדש (20 ס"מ) לרוחב החדש (נסמן ב-x):</p>
  ${ctr(qeq(qfr('20', 'x'), qfr('4', '3')))}
  <p>נכפול במכנה המשותף (3x) ונפתור:</p>
  ${sol('4 · x = 20 · 3<br>4x = 60 &nbsp;/:4<br>x = 15')}
  <p>רוחב הדמות המוגדלת צריך להיות 15 ס"מ.</p>`;

const BAR_FB = `<p><strong>נסמן</strong>: x - כמות החלבון בחטיף בודד (45 גרם)</p>
  <p>נסדר את הנתונים בטבלת הפרופורציה:</p>
  ${pTable(['', 'סימון תזונתי', 'חטיף בודד'],
           [['כמות חלבון (גרם)', '18', 'x'], ['משקל (גרם)', '100', '45']])}
  <p>היחס בין כמות החלבון למשקל החטיף קבוע ולכן משוואת הפרופורציה המתאימה:</p>
  ${ctr(qeq(qfr('x', '45'), qfr('18', '100')))}
  <p>נצמצם את היחס באגף ימין:</p>
  ${ctr(qeq(qfr('9', '50'), qfr('x', '45')))}
  <p>נכפול במכנה המשותף (450) ונקבל:</p>
  ${sol('10x = 81 &nbsp;/:10<br>x = 8.1')}
  <p>חטיף במשקל 45 מכיל 8.1 גרם חלבון.</p>`;

const GOAL_FB = `<p>היחס בין רוחב לגובה שער עבור בוגרים:</p>
  ${ctr(qeq(qfr('7.32', '2.44'), '3'))}
  <p>כלומר, רוחב שער הבוגרים גדול בדיוק <strong>פי 3</strong> מהגובה שלו.</p>
  <p>יחס זה צריך להישמר גם עבור שער לנוער (12-14).</p>
  <p>אם גובה השער לנוער הוא 2.13 מטר, אז הרוחב יהיה פי 3 הגובה:</p>
  ${sol('2.13 · 3 = <span class="eq-unit" dir="rtl">6.39 מטרים</span>')}`;

const CHARGE_FB = `<p>ב-5 דקות, המטען יטעין 12% מסוללת הטלפון.</p>
  <p>יעל צריכה לצאת בעוד חצי שעה - 30 דקות.</p>
  <p>נסמן ב-x את אחוז הטעינה ב-30 דקות,<br>ונשלים את טבלת הפרופורציה:</p>
  ${pTable(['זמן טעינה (דקות)', '5', '30'], [['אחוז טעינה', '12', 'x']])}
  <p>נשים לב לקשר בין הזמנים:</p>
  ${sol('5 · 6 = 30')}
  <p>כדי לשמור על הפרופורציה, אותו קשר צריך להתקיים גם בין אחוזי הטעינה:</p>
  ${sol('12 · 6 = x<br>72 = x')}
  <p>כלומר, ב-30 דקות, המטען יטעין 72% מסוללת הטלפון (יותר מ-70%) ולכן
     יעל תספיק להטעין את הטלפון בזמן זה.</p>`;


/* ── component 03 feedback bodies (deck slides 41-49) ── */
const C3_Q1A = `<p>היחס בין x ל-27 שווה ליחס בין 6 ל-9.</p>
  <p>נתרגם את היחסים לשברים:</p>
  <p>היחס בין x ל-27 נכתב כשבר: ${qfr('x', '27')}</p>
  <p>היחס בין 6 ל-9 נכתב כשבר: ${qfr('6', '9')}.</p>
  <p>פרופורציה היא שוויון בין יחסים.</p>
  <p>נבנה את משוואת הפרופורציה ונקבל שהתשובה המתאימה היא:</p>
  ${ctr(qeq(qfr('x', '27'), qfr('6', '9')))}`;

const C3_Q1B = `<p>משוואת הפרופורציה המתאימה היא:</p>
  ${ctr(qeq(qfr('x', '27'), qfr('6', '9')))}
  <p>נכפול במכנה המשותף (27) ונקבל:</p>
  ${sol('x = 6 · 3<br>x = 18')}`;

const C3_Q2A = `<p>על כל 3 משימות, איתי מקבל 120 מטבעות זהב וירטואליים ולכן השבר ${qfr('3', '120')} מייצג את היחס:</p>
  ${ctr(qfr('כמות משימות', 'מטבעות זהב'))}
  <p>במשחק אחר הצהריים איתי השלים x משימות וקיבל 400 מטבעות זהב.</p>
  <p>לכן משוואת הפרופורציה היא:</p>
  ${ctr(qeq(qfr('3', '120'), qfr('x', '400')))}`;

const C3_Q2B = `<p>נכפול במכנה המשותף (1200):</p>
  ${sol('30 = 3x &nbsp;/:3<br>x = 10')}
  <p>איתי סיים בהצלחה 10 משימות.</p>`;

const C3_Q3 = `<p>יש לשמור על יחס של 2:5 בין שיש לדשא.</p>
  <p>נסמן ב-x את מספר הבלוקים של השיש הדרושים עבור 30 בלוקים של דשא.</p>
  <p>משוואת הפרופורציה המתאימה היא:</p>
  ${ctr(qeq(qfr('2', '5'), qfr('x', '30')))}
  <p>נכפול במכנה המשותף (30)</p>
  ${sol('x = 2 · 6<br>x = 12')}
  <p>כלומר, דרושים 12 בלוקים של שיש עבור 30 בלוקים של דשא.</p>`;

const C3_Q4 = `<p>נסמן: x - כמות השירים בפלייליסט של 60 דקות.</p>
  <p>נסדר את הנתונים בטבלת פרופורציה:</p>
  ${pTable(['כמות שירים', 'זמן השמעה'], [['5', '15 דקות'], ['x', '60 דקות']])}
  <p>נרצה לשמור על היחס:</p>
  ${ctr(qfr('כמות שירים', 'זמן בדקות'))}
  <p>נכתוב משוואת פרופורציה מתאימה:</p>
  ${ctr(qeq(qfr('5', '15'), qfr('x', '60')))}
  <p>נכפול במכנה המשותף (60):</p>
  ${sol('x = 5 · 4<br>x = 20')}`;

const C3_Q5 = `<p>נסמן ב-x את המחיר הכולל של 175 חולצות ונסדר את הנתונים בטבלת פרופורציה:</p>
  ${pTable(['', 'הצעת מחיר', 'ההזמנה כולה'], [['כמות חולצות', '25', '175'], ['מחיר (₪)', '550', 'x']])}
  <p>ונכתוב את הפרופורציה הבאה:</p>
  ${ctr(qeq(qfr('25', '175'), qfr('550', 'x')))}
  <p>נוכל לצמצם ב-25 את היחס באגף שמאל:</p>
  ${ctr(qeq(qfr('1', '7'), qfr('550', 'x')))}
  <p>נכפול במכנה המשותף (7x):</p>
  ${sol('x = 3850')}
  <p>ולכן המחיר הכולל של ההזמנה יהיה 3850 שקלים.</p>`;

const C3_Q6 = `<p>עלינו להגדיל את הכמות של כל אחד מהמרכיבים לפי היחס בין כמויות הרוטב.</p>
  <p>היחס בין כמות הרוטב במתכון החדש לכמות הרוטב במתכון המקורי הוא</p>
  ${ctr(qeq(qfr('150', '100'), '1.5'))}
  <p>לכן, עלינו להכפיל את כמויות המרכיבים במתכון המקורי ב-1.5:</p>
  <p>שמן זית:</p>${sol('60 · 1.5 = <span class="eq-unit" dir="rtl">90 מ"ל</span>')}
  <p>חומץ בלסמי:</p>${sol('30 · 1.5 = <span class="eq-unit" dir="rtl">45 מ"ל</span>')}
  <p>רוטב סויה:</p>${sol('10 · 1.5 = <span class="eq-unit" dir="rtl">15 מ"ל</span>')}`;


/* ── component 05 · תרגול מתקדם (deck 61-67) ── */
const C5_CODE = `<p>נטע בת 14.</p>
  <p>נסמן: x - הגיל של אבא היום.</p>
  <p>בעוד שנתיים, נטע תהיה בת 16, הגיל של אבא יהיה <span dir="ltr">x + 2</span>, והיחס בין הגילים שלהם יהיה:</p>
  ${ctr(qeq(qfr('16', 'x + 2'), qfr('4', '11')))}
  <p>נכפול במכנה המשותף:</p>
  ${sol('4(x + 2) = 176 &nbsp;/:4<br>x + 2 = 44 &nbsp;/−2<br>x = 42')}
  <p><strong>אבא בן 42 היום.</strong></p>
  <p>נסמן: y - הגיל של אמא היום.</p>
  <p>לפני 4 שנים, נטע הייתה בת 10, הגיל של אמא היה <span dir="ltr">y − 4</span>, והיחס בין הגילים שלהם היה:</p>
  ${ctr(qeq(qfr('10', 'y − 4'), qfr('2', '7')))}
  <p>נכפול במכנה המשותף:</p>
  ${sol('2(y − 4) = 70 &nbsp;/:2<br>y − 4 = 35 &nbsp;/+4<br>y = 39')}
  <p><strong>אמא בת 39 היום.</strong></p>
  <p>ולכן הקוד הוא 4239.</p>`;

const C5_PIZZA_A = `<p><strong>פיצה בינונית:</strong> בקוטר 30 ס"מ – לכן רדיוס הפיצה שווה ל-${qfr('30','2')} = <span dir="rtl">15 ס"מ</span>,</p>
  <p>ושטחה: <span dir="ltr">π · 15² = 225π</span>.</p>
  <p><strong>פיצה גדולה:</strong> בקוטר 40 ס"מ – לכן רדיוס הפיצה שווה ל-${qfr('40','2')} = <span dir="rtl">20 ס"מ</span>,</p>
  <p>ושטחה: <span dir="ltr">π · 20² = 400π</span>.</p>
  <p>ולכן היחס בין השטחים הוא:</p>
  ${ctr(qeq(qfr('400π', '225π'), qeq(qfr('400','225'), qfr('16','9'))))}`;

const C5_PIZZA_B = `<p>נחשב את היחס בין שטח כל פיצה למחיר שלה.</p>
  <p><strong>פיצה בינונית:</strong></p>
  <p>רדיוס: 15 ס"מ</p>
  <p>שטח: <span dir="ltr">π · 15² = 3.14 · 225 = 706.5</span> סמ"ר</p>
  <p>מחיר: 30 ₪</p>
  <p>יחס שטח למחיר: ${qfr('706.5 סמ"ר', '30 שקלים')} = 23.55 סמ"ר לשקלים</p>
  <p><strong>פיצה גדולה:</strong></p>
  <p>רדיוס: 20 ס"מ</p>
  <p>שטח: <span dir="ltr">π · 20² = 3.14 · 400 = 1256</span> סמ"ר</p>
  <p>מחיר: 40 ₪</p>
  <p>יחס שטח למחיר: ${qfr('1256 סמ"ר', '40 שקלים')} = 31.4 סמ"ר לשקלים</p>
  <p>בפיצה הגדולה מקבלים יותר שטח (כלומר, יותר פיצה) לכל שקל ולכן רוני צודקת.</p>`;

const C5_PIZZA_C = `<p>נחשב תחילה את היחס בין המחיר לשטח עבור ה<strong>פיצה הגדולה</strong>.</p>
  <p><strong>רדיוס</strong>: 20 ס"מ</p>
  <p><strong>שטח:</strong> <span dir="ltr">π · 20² = 3.14 · 400 =</span> 1256 סמ"ר</p>
  <p><strong>מחיר: </strong>40 ₪</p>
  <p><strong>יחס מחיר לשטח:</strong></p>
  ${ctr(qeq(qfr('40', '1256'), qfr('5', '157')))}
  <p>שקל לסמ"ר</p>
  <p><strong>פיצה משפחתית:</strong></p>
  <p><strong>רדיוס: </strong><span dir="ltr">50/2</span> = 25 ס"מ</p>
  <p><strong>שטח:</strong> <span dir="ltr">π · 25² = 3.14 · 625 =</span> 1962.5 סמ"ר</p>
  <p><strong>מחיר:</strong> נסמן ב-x ₪</p>
  <p>נכתוב פרופורציה עבור יחס המחיר לשטח:</p>
  ${ctr(qeq(qfr('x', '1962.5'), qfr('5', '157')))}
  <p>נכפול במכנה המשותף (כפל בהצלבה)</p>
  ${sol('157 · x = 1962.5 · 5<br>157x = 9812.5')}
  <p>נחלק ב-157:</p>
  ${sol('x = 62.5')}
  <p>מחיר הפיצה המשפחתית שישמור על אותו יחס הוא <strong>62.5 ₪.</strong></p>`;

const C5_SPRING_A = `<p>לפי היישומון, כאשר תולים על הקפיץ מסה של 100 גרם, הקפיץ מתארך ב־5 ס"מ.</p>
  <p>אם נוסיף משקולות נקבל שעבור מסה של 250 גרם הקפיץ מתארך ב-12.5 ס"מ.</p>`;

const C5_SPRING_B = `<p>מצאנו שמסה של <strong>100 גרם</strong> גורמת להתארכות של <strong>5 ס"מ</strong>, כלומר:</p>
  ${ctr(qeq(qfr('מסה', 'התארכות'), qfr('100', '5')))}
  <p>נצמצם ב־5 ונקבל:</p>
  ${ctr(qeq(qfr('מסה', 'התארכות'), qfr('20', '1')))}
  <p>כל <strong>20 גרם</strong> גורמים להתארכות של <strong>1 ס"מ</strong>.</p>
  <p>נסמן ב־x את התארכות הקפיץ בס"מ, עבור מסה של <strong>180 גרם</strong>.</p>
  <p>נכתוב את משוואת הפרופורציה:</p>
  ${ctr(qeq(qfr('20', '1'), qfr('180', 'x')))}
  <p>נכפול במכנה המשותף:</p>
  ${sol('20x = 180 &nbsp;/:20<br>x = 9')}
  <p>מסה של <strong>180 גרם</strong> תגרום להתארכות של <strong>9 ס"מ</strong>.</p>`;

const C5_PUZZLE = `<p>נשמור על היחס המקורי בין השורות לטורים:</p>
  ${pTable(['', 'פאזל מקורי', 'פאזל חדש'], [['שורות', '12', 'x'], ['טורים', '20', '30']])}
  ${ctr(qeq(qfr('x', '30'), qfr('12', '20')))}
  ${sol('2x = 36 &nbsp;/:2<br>x = 18')}
  <p>ולכן מספר החלקים בפאזל החדש:</p>
  ${sol('30 · 18 = <span class="eq-unit" dir="rtl">540 חלקים</span>')}`;


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

const BOARD = `<div class="camp-board" data-persist data-zoom data-zoom-label="הגדלת הלוח" role="group" aria-label="לוח המידע של המחנה">
  <h3 class="cb-title">לוח המידע של המחנה <span dir="ltr">(Camp Bulletin Board)</span></h3>
  <div class="cb-group">
    <h4>שער ההמרה היומי:</h4>
    <p>1 דולר אמריקאי <span dir="ltr">(USD)</span> = <strong class="cb-rate">3.25</strong> שקלים חדשים <span dir="ltr">(ILS)</span></p>
  </div>
  <div class="cb-group">
    <h4>המרות נפח נוזלים:</h4>
    <p>1 גלון <span dir="ltr">(Gallon)</span> = 3.785 ליטר</p>
    <p>1 כוס נוזל <span dir="ltr">(cup)</span> = 8 אונקיות נוזל <span dir="ltr">(fl oz)</span> = 240 מיליליטר (מ"ל)</p>
  </div>
  <div class="cb-group">
    <h4>המרות אורך:</h4>
    <p>1 אינץ' <span dir="ltr">(Inch)</span> = 2.54 סנטימטרים (ס"מ)</p>
    <p>1 רגל <span dir="ltr">(feet)</span> = 12 אינץ' <span dir="ltr">(Inch)</span></p>
    <p>1 יארד <span dir="ltr">(Yard)</span> = 3 רגל <span dir="ltr">(feet)</span></p>
  </div>
</div>`;

const C6_A = `<p>לפי הנתונים על לוח ההמרה:</p>
  <p>1 אינץ' = 2.54 ס"מ.</p>
  <p>1 רגל (feet) = 12 אינץ' ולכן נכפול:</p>
  ${sol('12 · 2.54 = <span class="eq-unit" dir="rtl">30.48 ס"מ</span>')}
  <p><strong>1 רגל = 30.48 ס"מ</strong></p>
  <p>לפי הנתונים על לוח ההמרה:</p>
  <p>1 יארד = 3 רגל ולכן נכפול את התוצאה שקיבלנו ב-3:</p>
  ${sol('3 · 30.48 = <span class="eq-unit" dir="rtl">91.44 ס"מ</span>')}
  <p><strong>1 יארד = 91.44 ס"מ</strong></p>`;

const C6_B = `<p>קיים יחס קבוע בין יחידת הנפח אונקיות נוזל (fl oz) ליחידת הנפח מיליליטר (ml).</p>
  <p>נסמן ב-x את הכמות החסרה ונשלים את טבלת הפרופורציה:</p>
  ${pTable(['אונקיות נוזל (fl oz)', 'מיליליטרים (מ"ל)'], [['8', '240'], ['x', '600']])}
  <p>נכתוב את משוואת הפרופורציה (יחס בין אונקיות למ"ל):</p>
  ${ctr(qeq(qfr('x', '600'), qfr('8', '240')))}
  <p>נכפול במכנה המשותף (1200) ונקבל:</p>
  ${sol('2x = 40 &nbsp;/:2<br>x = 20')}
  <p>600 מ"ל חלב שווים ל-<strong>20</strong> אונקיות נוזל (oz).</p>`;

const C6_C = `<p>נחשב תחילה את כמות המים הנדרשת לפי נהלי הבטיחות.</p>
  <p>בקבוצה 15 תלמידים + 3 מדריכים = 18 אנשים.</p>
  <p>לכן דרושים סה"כ:</p>
  ${sol('2 · 18 = <span class="eq-unit" dir="rtl">36 ליטר</span>')}
  <p>לפי לוח המידע, 1 גלון שווה ל-3.785 ליטר.</p>
  <p>כדי לחשב כמה ליטרים שווים 8 גלונים של מים, נרחיב את היחס פי 8:</p>
  ${sol('8 · 3.785 = <span class="eq-unit" dir="rtl">30.28 ליטר</span>')}
  <p class="fb-figure" role="img" aria-label="הרחבת היחס גלון : ליטר פי 8 — מ-1 : 3.785 ל-8 : 30.28">${ratioExpand('ליטר : גלון', '1 : 3.785', '8 : 30.28', '· 8')}</p>
  <p>כמות המים במיכל (30.28 ליטר) קטנה מהכמות הנדרשת (36 ליטר), ולכן <strong>המים לא יספיקו</strong>.</p>`;

const C6_D = `<p>1 אינץ' שווה ל-2.54 ס"מ.</p>
  <p>רוחב החזה של דוד הוא 50.8 סנטימטרים.</p>
  <p>נסמן: x - רוחב החזה באינצ'ים</p>
  <p>ונשלים את טבלת הפרופורציה:</p>
  ${pTable(['אורך באינץ\'', 'אורך בס"מ'], [['1', '2.54'], ['x', '50.8']])}
  <p>נכתוב את משוואת הפרופורציה:</p>
  ${ctr(qeq(qfr('x', '50.8'), qfr('1', '2.54')))}
  <p>נכפול במכנה המשותף (כפל בהצלבה):</p>
  ${sol('2.54x = 50.8 &nbsp;/:2.54<br>x = 20')}
  <p>רוחב החזה של דוד הוא 20 אינץ', ולכן המידה המתאימה לו היא מידה Medium.</p>`;

const C6_E = `<p>מחיר כל חולצה הוא <span dir="ltr">$30</span> ולכן עלות 15 חולצות בדולרים היא:</p>
  ${sol('15 · 30 = <span dir="ltr">$450</span>')}
  <p>יחס ההמרה היומי מדולרים ($) לשקלים (₪) הוא <span dir="ltr">1 : 3.25</span>, ולכן:</p>
  ${sol('450 · 3.25 = <span class="eq-unit" dir="rtl">1462.5 ₪</span>')}
  <p class="fb-figure" role="img" aria-label="הרחבת יחס ההמרה דולר : שקל פי 450 — מ-1 : 3.25 ל-450 : 1462.5">${ratioExpand('שקל : דולר', '1 : 3.25', '450 : 1462.5', '· 450')}</p>
  <p>הסכום שהתקבל (1462.5 ₪) קטן מהתקציב (1500 ₪), ולכן <strong>התקציב יספיק</strong>.</p>`;


/* ── component 07 · שאלת שיא ב (deck 80-85) ── */
const C7_A = `<p>1 מטר שווה ל-100 ס"מ.</p>
  <p>לכן, כדי להמיר אורך ממטרים לסנטימטרים, נכפול ב-100, לפי יחס ההמרה:</p>
  <p><strong>אורך הקיר:</strong></p>${sol('4.5 · 100 = <span class="eq-unit" dir="rtl">450 ס"מ</span>')}
  <p><strong>גובה הקיר:</strong></p>${sol('2.8 · 100 = <span class="eq-unit" dir="rtl">280 ס"מ</span>')}`;

const C7_B = `<p>נסמן ב-x את הרוחב של פוסטר בודד בס"מ.</p>
  <p>עבור 5 פוסטרים, יהיו 4 מרווחים בין הפוסטרים ו-2 מרווחים בצדדים –<br>סה"כ <strong>6 מרווחים</strong> של 10 ס"מ:</p>
  ${sol('6 · 10 = <span class="eq-unit" dir="rtl">60 ס"מ</span>')}
  <p>הנה המשוואה:</p>
  ${sol('5x + 60 = 450 &nbsp;/−60<br>5x = 390 &nbsp;/:5<br>x = 78')}
  <p><strong>ולכן רוחב כל פוסטר בודד הוא 78 ס"מ.</strong></p>`;

const C7_C = `<p>נסמן: y – גובה הפוסטר בס"מ.</p>
  <p>נכתוב את משוואת הפרופורציה:</p>
  ${ctr(qeq(qfr('3', '4'), qfr('78', 'y')))}
  <p>נכפול במכנה המשותף <span dir="ltr">(4y)</span>:</p>
  ${sol('3y = 312 &nbsp;/:3<br>y = 104')}`;

const C7_D = `<p>נסמן ב-x את הרוחב של פוסטר בודד בס"מ.</p>
  <p>בעזרת היישומון נראה שהמרווחים עבור 8 פוסטרים הם: 7 מרווחים בין הפוסטרים ו-2 בצדדים - סה"כ 9 מרווחים של 10 ס"מ:</p>
  ${sol('9 · 10 = <span class="eq-unit" dir="rtl">90 ס"מ</span>')}
  <p>נכתוב את המשוואה הבאה:</p>
  ${sol('8x + 90 = 450 &nbsp;/−90<br>8x = 360 &nbsp;/:8<br>x = 45')}
  <p>נסמן: y = גובה הפוסטר בס"מ ונסדר את הנתונים בטבלת פרופורציה:</p>
  ${pTable(['גובה', 'רוחב'], [['4', '3'], ['y ס"מ', '45 ס"מ']])}
  ${ctr(qeq(qfr('3', '4'), qfr('45', 'y')))}
  <p>נכפול במכנה המשותף <span dir="ltr">(4y)</span>:</p>
  ${sol('3y = 180 &nbsp;/:3<br>y = 60')}`;

const C7_E = `<p>נחשב את היחס בין המחיר לשטח בכל הצעה – מחיר לסמ"ר.</p>
  <p>דפוס 1: ${qfr('20', '500')} = 0.04 ₪ לסמ"ר</p>
  <p>דפוס 2: ${qfr('15', '400')} = 0.0375 ₪ לסמ"ר</p>
  <p>המחיר לסמ"ר בדפוס 2 זול יותר<br>ולכן ההצעה של דפוס 2 משתלמת יותר.</p>`;

const C7_F = `<p>תחילה נחשב את השטח של 8 פוסטרים.</p>
  <p>מצאנו שבכדי לתלות 8 פוסטרים, מידות כל פוסטר צריכות להיות:<br>
     <strong>רוחב: 45 ס"מ, אורך: 60 ס"מ</strong></p>
  <p>שטח כל פוסטר (לפי שטח מלבן):</p>
  ${sol('45 · 60 = <span class="eq-unit" dir="rtl">2,700 סמ"ר</span>')}
  <p>השטח הכולל של 8 פוסטרים:</p>
  ${sol('8 · 2700 = <span class="eq-unit" dir="rtl">21,600 סמ"ר</span>')}
  <p>נציב בטבלת הפרופורציה:</p>
  ${pTable(['שטח (סמ"ר)', 'מחיר'], [['400', '15'], ['21,600', 'x']])}
  <p>ונכתוב את משוואת הפרופורציה:</p>
  ${ctr(qeq(qfr('15', '400'), qfr('x', '21600')))}
  <p>נכפול במכנה המשותף (21,600):</p>
  ${sol('x = 15 · 54 = <span class="eq-unit" dir="rtl">810 ש"ח</span>')}`;

const QUESTIONS = [
  { /* deck slide 31 — warm-up 1 of 2. The bar note on slides 31-32 reads
       "מקטע זה מלווה בסרגל שאלה, שאלה N מתוך 2". */
    screen: 10, type: 'value-input', label: '',
    step: { group: 'warmup', index: 1, total: 2 },
    stem: `<strong>שאלה 1</strong><br>היחס בין 10 ל-x שווה ליחס בין 6 ל-15.<br><br><strong>מצאו את x.</strong>`,
    ratioRows: [{ label: 'x =', parts: 1 }],
    correctInputs: ['25'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'שימו לב!', body: 'מהי משוואת הפרופורציה (שוויון היחסים) המתאימה לנתונים?' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: `<p>נכתוב את משוואת הפרופורציה המתאימה לנתונים:</p>
        <p class="car-center"><span class="car-eq" dir="ltr"><span class="fraction fr-inline"><span class="frac-top">10</span><span class="frac-bottom">x</span></span><span class="car-eq-op">=</span><span class="fraction fr-inline"><span class="frac-top">6</span><span class="frac-bottom">15</span></span></span></p>
        <p>נכפול בכפולה המשותפת: <span dir="ltr">15x</span></p>
        <p class="car-solve" dir="ltr">6 · x = 10 · 15<br>6x = 150 &nbsp;/:6</p>
        <p>ונקבל:</p>
        <p class="car-solve" dir="ltr">x = 25</p>` },
      wrong: { title: 'כמעט...', body: `<p>נכתוב את משוואת הפרופורציה המתאימה לנתונים:</p>
        <p class="car-center"><span class="car-eq" dir="ltr"><span class="fraction fr-inline"><span class="frac-top">10</span><span class="frac-bottom">x</span></span><span class="car-eq-op">=</span><span class="fraction fr-inline"><span class="frac-top">6</span><span class="frac-bottom">15</span></span></span></p>
        <p>נכפול בכפולה המשותפת: <span dir="ltr">15x</span></p>
        <p class="car-solve" dir="ltr">6 · x = 10 · 15<br>6x = 150 &nbsp;/:6</p>
        <p>ונקבל:</p>
        <p class="car-solve" dir="ltr">x = 25</p>` } },
  },
  { /* deck slide 32 — warm-up 2 of 2 */
    screen: 11, type: 'value-input', label: '',
    step: { group: 'warmup', index: 2, total: 2 },
    stem: `<strong>שאלה 2</strong><br>במזנון הקולנוע מוכרים פופקורן בתפזורת במחיר קבוע לפי משקל.<br>
      על השלט כתוב "המחיר לפי משקל: 11 ₪ ל-100 גרם פופקורן".<br><br>
      שירה ורז מילאו שקית פופקורן במשקל 300 גרם.<br><br><strong>כמה עליהם לשלם?</strong>`,
    ratioRows: [{ suffix: 'ש"ח', parts: 1 }],
    correctInputs: ['33'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'חשבו:', body: 'מה היחס בין משקלי הפופקורן?<br>מה עליכם לעשות למחיר כדי לשמור על אותו היחס?' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: `<p>נסמן:<br>x - המחיר ששירה ורז צריכים לשלם.</p>
        <p>נסדר את הנתונים בטבלת פרופורציה:</p>
        <table class="car-table"><thead><tr><th>משקל (גרם)</th><th>מחיר (₪)</th></tr></thead>
        <tbody><tr><td>100</td><td>11</td></tr><tr><td>300</td><td>x</td></tr></tbody></table>
        <p>נכתוב את משוואת הפרופורציה:</p>
        <p class="car-center"><span class="car-eq" dir="ltr"><span class="fraction fr-inline"><span class="frac-top">x</span><span class="frac-bottom">300</span></span><span class="car-eq-op">=</span><span class="fraction fr-inline"><span class="frac-top">11</span><span class="frac-bottom">100</span></span></span></p>
        <p>נפתור את המשוואה ונקבל:</p>
        <p class="car-solve" dir="ltr">x = 33</p>
        <p>מסקנה: על שירה ורז לשלם 33 ₪.</p>` },
      wrong: { title: 'כמעט...', body: `<p>נסמן:<br>x - המחיר ששירה ורז צריכים לשלם.</p>
        <p>נסדר את הנתונים בטבלת פרופורציה:</p>
        <table class="car-table"><thead><tr><th>משקל (גרם)</th><th>מחיר (₪)</th></tr></thead>
        <tbody><tr><td>100</td><td>11</td></tr><tr><td>300</td><td>x</td></tr></tbody></table>
        <p>נכתוב את משוואת הפרופורציה:</p>
        <p class="car-center"><span class="car-eq" dir="ltr"><span class="fraction fr-inline"><span class="frac-top">x</span><span class="frac-bottom">300</span></span><span class="car-eq-op">=</span><span class="fraction fr-inline"><span class="frac-top">11</span><span class="frac-bottom">100</span></span></span></p>
        <p>נפתור את המשוואה ונקבל:</p>
        <p class="car-solve" dir="ltr">x = 33</p>
        <p>מסקנה: על שירה ורז לשלם 33 ₪.</p>` } },
  },

  /* ═══ component 02 — תרגול סטנדרטי (deck slides 35-38) ═══ */

  { /* deck 35 — the applet question. The slide's "הפקה- שילוב ישומון" callout
       is a production note over a reference render, so the applet is BUILT
       (js/applet-dino.js) rather than shown as a picture. */
    screen: 13, type: 'value-input', label: '',
    step: { group: 'standard', index: 1, total: 4 },
    stem: `תלמידים בנו סקיצה של דמות דינוזאור עבור משחק מחשב.<br>
      בסקיצה הראשונית, ממדי הדינוזאור היו:<br>
      <strong>גובה: 12 ס"מ</strong><br><strong>רוחב: 9 ס"מ</strong><br>
      כדי שהדמות תתאים למסך מחשב, יש להגדיל את דמות הדינוזאור כך שגובהה החדש יהיה <strong>20 ס"מ</strong>, תוך שמירה על פרופורציה,<br>
      העזרו ביישומון כדי למצוא את התשובה.<br><br>
      <strong>מה צריך להיות הרוחב החדש של דמות הדינוזאור(בסנטימטרים)?</strong>`,
    content: dinoAppletHTML(),
    ratioRows: [{ suffix: 'ס"מ', parts: 1 }],
    correctInputs: ['15'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'היעזרו ביישומון', body: 'שנו את ממדי דמות הדינוזאור בהתאם לדרישה כך שיישמר היחס המקורי בין הגובה לרוחב שלו.' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: DINO_FB },
      wrong:   { title: 'כמעט...', body: DINO_FB } },
  },

  { /* deck 36 — protein per bar */
    screen: 14, type: 'value-input', label: '',
    step: { group: 'standard', index: 2, total: 4 },
    stem: `ניב רכש בקפיטריה של בית הספר חטיף בריאות חדש.<br>
      על החטיף מצוינים הערכים התזונתיים ל-100 גרם – כל 100 גרם חטיף מכיל 18 גרם חלבונים.<br>
      משקל חטיף אנרגיה בודד הוא 45 גרם.<br><br>
      <strong>כמה גרם חלבון מכיל חטיף בריאות בודד?</strong>`,
    /* deck 36 image63 (38,446) 676x369 */
    content: `<img src="assets/img/q36-bar.jpg" alt="חטיף בריאות ולצדו הסימון התזונתי ל-100 גרם מוצר">`,
    ratioRows: [{ suffix: 'גרם חלבון', parts: 1 }],
    correctInputs: ['8.1'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'שימו לב!', body: 'מה היחס בין כמות החלבון למשקל המוצר עבור 100 גרם?<br>יחס זה צריך להישמר גם עבור 45 גרם.' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: BAR_FB },
      wrong:   { title: 'כמעט...', body: BAR_FB } },
  },

  { /* deck 37 — the goal */
    screen: 15, type: 'value-input', label: '',
    step: { group: 'standard', index: 3, total: 4 },
    stem: `מידות שער כדורגל תקני משתנות בהתאם לגיל השחקנים.<br>
      בליגת הנערים מגילאי 15 ומעלה, מידות שער תקני הן<br>
      <strong>רוחב:</strong> 7.32 מטר.<br><strong>גובה:</strong> 2.44 מטר.<br>
      לשכבות גיל צעירות יותר, השערים מוקטנים כדי להתאים לממדי הגוף<br>ולשטח המגרש.<br>
      לנערים בגילאי 12-14 - גובה השער הוא 2.13 מטר.<br><br>
      <strong>מהו רוחב השער המתאים, כך שישמר היחס בין רוחב לגובה של שער תקני לבוגרים?</strong>`,
    /* deck 37 image64 (16,282) 664x363 */
    content: `<img src="assets/img/q37-goal.jpg" alt="שער כדורגל תקני: רוחב 7.32 מטר, גובה 2.44 מטר">`,
    ratioRows: [{ suffix: 'מטרים', parts: 1 }],
    correctInputs: ['6.39'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'שימו לב:', body: 'מה היחס בין רוחב השער של הבוגרים לגובה שלו?<br>יחס זה צריך להיות זהה גם בשער לנערים.' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: GOAL_FB },
      wrong:   { title: 'כמעט...', body: GOAL_FB } },
  },

  { /* deck 38 — single choice, the charger */
    screen: 16, type: 'single', label: '',
    step: { group: 'standard', index: 4, total: 4 },
    stem: `מטען לטלפון נייד מסוגל להטעין כל 5 דקות 12% סוללה.<br><br>
      יעל רוצה להטעין את הטלפון לרמת טעינה של 70%, אבל היא צריכה לצאת מהבית בעוד חצי שעה.<br><br>
      <strong>האם יעל תספיק להטעין את הטלפון?</strong>`,
    options: [{ id: 'yes', html: 'כן' }, { id: 'no', html: 'לא' }, { id: 'idk', html: 'לא ניתן לדעת' }],
    correct: 'yes',
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'חשבו:', body: 'אם ב-5 דקות המטען מטעין 12%, כמה אחוזי סוללה יטעין בחצי שעה (30 דקות)?' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: CHARGE_FB },
      wrong:   { title: 'כמעט...', body: CHARGE_FB } },
  },

  /* ═══ component 03 — תרגול בסיסי וסטנדרטי ב (deck slides 41-49)
     Six stations on the stepper: slides 41+42 are א/ב of station 1 and
     43+44 are א/ב of station 2, which is why eight question slides map to
     six stations (the deck's own stepper on slide 41 shows 6). ═══ */

  { /* deck 41 — station 1א, pick the proportion */
    screen: 18, type: 'single', label: '',
    step: { group: 'basic', index: 1, total: 4 },
    stem: `היחס בין x ל-27 שווה ליחס בין 6 ל-9.<br><br>
      <strong>א. סמנו את הפרופורציה (שוויון היחסים) המתאימה:</strong>`,
    /* rendered page order, top to bottom */
    options: [
      { id: 'a', html: qeq(qfr('x', '9'), qfr('27', '6')) },
      { id: 'b', html: qeq(qfr('27', 'x'), qfr('6', '9')) },
      { id: 'c', html: qeq(qfr('x', '27'), qfr('6', '9')) },
      { id: 'd', html: qeq(qfr('x', '6'), qfr('9', '27')) },
    ],
    correct: 'c',
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'זכרו:', body: 'עליכם להקפיד שסדר המספרים במונה ובמכנה יהיה זהה בשני אגפי המשוואה.' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C3_Q1A }, wrong: { title: 'כמעט...', body: C3_Q1A } },
  },

  { /* deck 42 — station 1ב, solve for x */
    screen: 19, type: 'value-input', label: '',
    step: { group: 'basic', index: 1, total: 4 },
    stem: `היחס בין x ל-27 שווה ליחס בין 6 ל-9.<br>
      מצאנו שהפרופורציה המתאימה היא ${qeq(qfr('x', '27'), qfr('6', '9'))}<br><br>
      <strong>ב. מצאו את x.</strong>`,
    ratioRows: [{ label: 'x =', parts: 1 }],
    correctInputs: ['18'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'שימו לב:', body: 'ניתן לכפול במכנה המשותף (טבלת פרופורציה) או לזהות את גורם ההרחבה של השבר.' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C3_Q1B }, wrong: { title: 'כמעט...', body: C3_Q1B } },
  },

  { /* deck 43 — station 2א: complete the DENOMINATOR of the right fraction */
    screen: 20, type: 'value-input', label: '',
    step: { group: 'basic', index: 2, total: 4 },
    stem: `במשחק מחשב, שחקן צובר 120 מטבעות זהב וירטואליים על כל 3 משימות שהוא משלים.<br><br>
      איתי שיחק אחר הצהריים וראה שנצברו לזכותו 400 מטבעות, אבל לא זכר כמה משימות סיים בהצלחה.<br><br>
      נסמן: x - כמות המשימות שאיתי סיים.<br><br>
      <strong>א. השלימו את הפרופורציה (שוויון היחסים):</strong>`,
    equation: { left: { top: '3', bottom: '120' },
                right: { top: 'x', bottom: { input: true, label: 'מכנה' } } },
    correctInputs: ['400'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'העזרו בטבלת הפרופורציה:', body: 'על כל 3 משימות איתי מקבל 120 מטבעות — איזה נתון משלים את האגף השני?' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C3_Q2A }, wrong: { title: 'זו טעות, אבל אפשר ללמוד ממנה:', body: C3_Q2A } },
  },

  { /* deck 44 — station 2ב */
    screen: 21, type: 'value-input', label: '',
    step: { group: 'basic', index: 2, total: 4 },
    stem: `במשחק מחשב, שחקן צובר 120 מטבעות זהב וירטואליים על כל 3 משימות שהוא משלים.<br><br>
      איתי שיחק אחר הצהריים וראה שנצברו לזכותו 400 מטבעות, אבל לא זכר כמה משימות סיים בהצלחה.<br><br>
      נסמן: x - כמות המשימות שאיתי סיים.<br>
      מצאנו שהפרופורציה בין כמות המשימות שסיים לכמות מטבעות הזהב היא:
      ${qeq(qfr('3', '120'), qfr('x', '400'))}<br><br>
      <strong>ב. כמה משימות איתי השלים במשחק אחר הצהריים?</strong>`,
    ratioRows: [{ label: 'x =', parts: 1 }],
    correctInputs: ['10'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'שימו לב:', body: 'כפלו במכנה המשותף כדי לפתור את המשוואה.' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C3_Q2B }, wrong: { title: 'כמעט...', body: C3_Q2B } },
  },

  { /* deck 45 — station 3 */
    screen: 22, type: 'value-input', label: '',
    step: { group: 'basic', index: 3, total: 4 },
    stem: `במשחק מחשב, אתם עובדים על ריצוף הכניסה למבצר שלכם.<br>
      כדי ליצור דוגמה של בלוקים מעוצבים, אתם משתמשים ביחס קבוע של 2 בלוקים של <strong>שיש</strong> על כל 5 בלוקים של <strong>דשא</strong>.<br><br>
      <strong>אם השתמשתם ב- 30 בלוקים של דשא,<br>
      כמה בלוקים של שיש אתם צריכים<br>
      כדי לשמור על יחס של 2:5?</strong>`,
    /* deck 45's image71 was a REFERENCE render of this applet; the producer
       supplied the real thing (28.09), so it is embedded rather than pictured. */
    content: appletEmbed('applets/tiling.html', 'משימת ריצוף — יחס 2:5'),
    ratioRows: [{ suffix: 'בלוקים', parts: 1 }],
    correctInputs: ['12'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'שימו לב!', body: 'בנו משוואת פרופורציה שמתארת את שוויון היחסים בין כמות השיש לכמות הדשא.' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C3_Q3 }, wrong: { title: 'כמעט...', body: C3_Q3 } },
  },

  { /* deck 46 — station 4 */
    screen: 23, type: 'value-input', label: '',
    step: { group: 'basic', index: 4, total: 4 },
    stem: `אורי מכין פלייליסט של שירים אהובים לשמיעה בזמן הליכה.<br>
      הוא שם לב שכל 5 שירים בפלייליסט אורכים יחד בדיוק 15 דקות של השמעה.<br>
      אורי רוצה להכין פלייליסט שיימשך 60 דקות (שעה אחת).<br><br>
      <strong>אם קצב ההשמעה נשאר זהה, כמה שירים צריכים להיות בפלייליסט?</strong>`,
    /* the proportion table lives in the feedback only (producer 28.09) */
    ratioRows: [{ suffix: 'שירים', parts: 1 }],
    correctInputs: ['20'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'שימו לב:', body: `סמנו ב-x את מספר השירים בפלייליסט שאורך 60 דקות,<br>והעזרו בטבלת הפרופורציה הבאה:${pTable(['כמות שירים', 'זמן השמעה'], [['5', '15 דקות'], ['x', '60 דקות']])}` },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C3_Q4 }, wrong: { title: 'כמעט!', body: C3_Q4 } },
  },

  { /* deck 48 — station 5 */
    screen: 25, type: 'value-input', label: '',
    step: { group: 'basic2', index: 1, total: 2 },
    stem: `לקראת הטיול השנתי, שכבת ח' מזמינה חולצות מודפסות לכל תלמידות ותלמידי השכבה.<br>
      בית דפוס מקומי נתן להם הצעת מחיר: 25 חולצות ב-550 ₪.<br>
      בשכבה 175 תלמידים.<br><br>
      <strong>כמה שקלים תעלה ההזמנה כולה?</strong>`,
    ratioRows: [{ suffix: '₪', parts: 1 }],
    correctInputs: ['3850'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'בדקו:', body: 'פי כמה גדול מספר התלמידים בשכבה ממספר החולצות שבהצעה המקורית?' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C3_Q5 }, wrong: { title: 'כמעט...', body: C3_Q5 } },
  },

  { /* deck 49 — station 6, THREE values */
    screen: 26, type: 'value-input', label: '',
    step: { group: 'basic2', index: 2, total: 2 },
    stem: `להכנת רוטב לסלט יש לערבב את המרכיבים עבור 100 מ"ל רוטב:<br><br>
      <strong>השלימו:</strong><br>
      <strong>כדי להכין כמות של 150 מ"ל רוטב לסלט, יש לערבב:</strong>`,
    /* 06.10, producer: bigger type AND closer to the opening sentence. The
       content column is `align-items: center`, which parked the table in the
       middle of an empty half-screen, far from the stem it belongs to. */
    content: pTable(['מרכיב', 'כמות'],
      [['שמן זית', '60 מ"ל'], ['חומץ בלסמי', '30 מ"ל'], ['רוטב סויה', '10 מ"ל']], 'car-table--lg'),
    ratioRows: [
      { suffix: 'מ"ל שמן זית', parts: 1 },
      { suffix: 'מ"ל חומץ בלסמי', parts: 1 },
      { suffix: 'מ"ל רוטב סויה', parts: 1 },
    ],
    correctInputs: ['90', '45', '15'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'חשבו:', body: 'מה היחס בין כמות הרוטב במתכון החדש לכמות הרוטב במתכון המקורי?' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C3_Q6 }, wrong: { title: 'כמעט...', body: C3_Q6 } },
  },

  /* ═══ component 05 — תרגול מתקדם (deck 61-67).  Four stepper stations:
     61 · 62-64 (א/ב/ג) · 65-66 (א/ב) · 67 — matching slide 60's "4 שאלות". ═══ */

  { /* deck 61 — the escape-room code */
    screen: 36, type: 'value-input', label: '',
    step: { group: 'advanced', index: 1, total: 4 },
    stem: `נטע חוגגת יום הולדת <strong>14</strong> בחדר בריחה.<br>
      אחת המשימות היא לפתוח קופסה נעולה בקוד בן 4 ספרות.<br>
      נטע השאירה להם שני רמזים:<br><br>
      <strong>שתי הספרות הראשונות משמאל</strong> הן הגיל של אבא שלה היום.<br>
      בעוד שנתיים, היחס בין הגיל של נטע לגיל של אבא יהיה ${qfr('4','11')}.<br><br>
      <strong>שתי הספרות האחרונות</strong> הן הגיל של אמא שלה היום.<br>
      לפני 4 שנים, היחס בין הגיל של נטע לגיל של אמא היה ${qfr('2','7')}.<br><br>
      <strong>הזינו את הקוד לפתיחת המנעול</strong>`,
    ratioRows: [{ parts: 1 }],
    correctInputs: ['4239'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'שימו לב', body: 'אם נסמן ב-x את הגיל של אבא היום, מה יהיה גילו בעוד שנתיים? והגיל של נטע? השלימו את הפרופורציה המתאימה.<br>אם נסמן ב-y את הגיל של אמא היום, מה היה גילה לפני 4 שנים? והגיל של נטע? השלימו את הפרופורציה המתאימה.' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C5_CODE }, wrong: { title: 'כמעט...', body: C5_CODE } },
  },

  { /* deck 62 — pizza, part א */
    screen: 37, type: 'single', label: '',
    step: { group: 'advanced', index: 2, total: 4 },
    stem: `פיצרייה מגישה שתי פיצות עגולות בעלות אותו עובי אך בגדלים שונים.<br>
      נתנאל ורוני מתווכחים ביניהם איזו פיצה משתלמת יותר לקנייה:<br>
      <strong>פיצה בינונית</strong>: קוטר 30 ס"מ, מחיר 30 שקלים.<br>
      <strong>פיצה גדולה</strong>: קוטר 40 ס"מ, מחיר 40 שקלים.<br><br>
      <strong>א. היחס בין שטח הפיצה הגדולה לבין שטח הפיצה הבינונית הוא:</strong>`,
    /* 30.09 — the two pizzas are drawn TO SCALE against each other, as deck
       page 62 does: 30cm reads smaller than 40cm. A single max-height made
       them identical, which is the opposite of what the question asks. */
    content: `<div class="pizza-stack">
      <img class="pizza pizza--30" src="assets/img/pizza-med.png" alt="פיצה בינונית, קוטר 30 ס&quot;מ">
      <img class="pizza pizza--40" src="assets/img/pizza-large.png" alt="פיצה גדולה, קוטר 40 ס&quot;מ">
    </div>`,
    /* 30.09 — order read off the RENDERED deck page 62 (maven-skills §4c) */
    options: [{ id: 'd', html: '4:3' }, { id: 'a', html: '15:4' },
              { id: 'b', html: '16:9' }, { id: 'c', html: '3:2' }],
    correct: 'b',
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'שימו לב:', body: 'אורך הקוטר שווה לפעמיים רדיוס המעגל.<br>שטח עיגול בעל רדיוס R שווה ל-<span dir="ltr">π · R²</span>.<br>לשם נוחות, ניתן להשתמש ב-<span dir="ltr">π = 3.14</span>.' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C5_PIZZA_A }, wrong: { title: 'כמעט...', body: C5_PIZZA_A } },
  },

  { /* deck 63 — pizza, part ב.  The two callouts are what נתנאל and רוני each
       claim, so they belong to the options, not to the screen. */
    screen: 38, type: 'single', label: '',
    step: { group: 'advanced', index: 2, total: 4 },
    stem: `פיצרייה מגישה שתי פיצות עגולות בעלות אותו עובי אך בגדלים שונים.<br>
      נתנאל ורוני מתווכחים ביניהם איזו פיצה משתלמת יותר לקנייה:<br>
      <strong>פיצה בינונית</strong>: קוטר 30 ס"מ, מחיר 30 שקלים.<br>
      <strong>פיצה גדולה</strong>: קוטר 40 ס"מ, מחיר 40 שקלים.<br><br>
      <strong>ב. מי צודק?</strong>`,
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
      <img class="debate-photo" data-no-zoom src="assets/img/pizza-debate.jpg" alt="נתנאל ורוני מתווכחים איזו פיצה משתלמת יותר">
      <svg class="debate-tails" aria-hidden="true"></svg>
      <div class="debate-bubble debate-bubble--natanel">שתי הפיצות משתלמות באותה מידה!<br>קוטר הפיצה הבינונית הוא 30 ס"מ והמחיר הוא 30 ש"ח, קוטר הפיצה הגדולה הוא 40 ס"מ והמחיר הוא 40 ₪.<br>בשני המקרים היחס בין הקוטר למחיר הוא 1 ל-1, ולכן אין הבדל.</div>
      <div class="debate-bubble debate-bubble--roni">הפיצה הגדולה משתלמת יותר, כי היחס בין שטח הפיצה הגדולה למחיר שלה גדול מהיחס בין שטח הפיצה הבינונית למחיר שלה</div>
    </figure>`,
    /* 30.09 — deck page 63 reads נתנאל / רוני / אף אחד top-to-bottom. All three
       option shapes share one <a:off>, so the XML order is meaningless here
       and the RENDERED page is the only source (maven-skills §4c). */
    options: [{ id: 'natanel', html: 'נתנאל' }, { id: 'roni', html: 'רוני' }, { id: 'none', html: 'אף אחד' }],
    correct: 'roni',
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'חשבו', body: 'כמה שטח פיצה מקבלים לכל שקל עבור כל אחת מהפיצות?' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C5_PIZZA_B }, wrong: { title: 'כמעט...', body: C5_PIZZA_B } },
  },

  { /* deck 64 — pizza, part ג */
    screen: 39, type: 'value-input', label: '',
    step: { group: 'advanced', index: 2, total: 4 },
    stem: `פיצרייה מגישה שתי פיצות עגולות בעלות אותו עובי אך בגדלים שונים.<br>
      <strong>פיצה בינונית</strong>: בקוטר 30 ס"מ ובמחיר 30 שקלים.<br>
      <strong>פיצה גדולה</strong>: בקוטר 40 ס"מ ובמחיר 40 שקלים.<br>
      פיצה משפחתית חדשה עומדת לצאת לשוק.<br>
      הפיצרייה רוצה לשמור על אותו יחס מחיר לשטח כמו של הפיצה הגדולה.<br><br>
      <strong>ג. אם קוטר הפיצה המשפחתית הוא 50 ס"מ,<br>כמה היא צריכה לעלות?</strong>`,
    /* 30.09 — deck page 64 shows all three pizzas (30 / 40 / 50), each to
       scale; the build carried only the family one. */
    content: `<div class="pizza-stack pizza-stack--three">
      <img class="pizza pizza--30" src="assets/img/pizza-med.png" alt="פיצה בינונית, קוטר 30 ס&quot;מ">
      <img class="pizza pizza--40" src="assets/img/pizza-large.png" alt="פיצה גדולה, קוטר 40 ס&quot;מ">
      <img class="pizza pizza--50" src="assets/img/pizza-family.png" alt="פיצה משפחתית, קוטר 50 ס&quot;מ">
    </div>`,
    ratioRows: [{ suffix: '₪', parts: 1 }],
    correctInputs: ['62.5'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'חשבו:', body: 'מה יחס המחיר לשטח עבור הפיצה הגדולה?<br>מה צריך להיות מחיר הפיצה המשפחתית כך שהיחס ישמר?' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C5_PIZZA_C }, wrong: { title: 'כמעט...', body: C5_PIZZA_C } },
  },

  { /* deck 65 — the spring applet, part א (producer-supplied page) */
    screen: 40, type: 'value-input', label: '',
    step: { group: 'advanced', index: 3, total: 4 },
    stem: `בתליית משקולת על קפיץ, הקפיץ מתארך.<br>
      ככל שנוסיף יותר משקולות (נגדיל את המסה) כך הקפיץ יתארך יותר.<br>
      הוסיפו משקולות לסל ובחנו את מידת התארכות הקפיץ<br>
      לפי מד ההתארכות הדינמי.<br><br><strong>א. השלימו:</strong>`,
    content: appletEmbed('applets/spring.html', 'יישומון הקפיץ והמשקולות'),
    ratioRows: [
      { label: 'מסה של 100 גרם גורמת להתארכות של', suffix: 'ס"מ', parts: 1 },
      { label: 'מסה של', suffix: 'גרם גורמת להתארכות של 12.5 ס"מ', parts: 1 },
    ],
    correctInputs: ['5', '250'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'היעזרו ביישומון:', body: 'הוסיפו משקולות לסל ובחנו את מידת התארכות הקפיץ.' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C5_SPRING_A }, wrong: { title: 'כמעט...', body: C5_SPRING_A } },
  },

  { /* deck 66 — the spring, part ב */
    screen: 41, type: 'value-input', label: '',
    step: { group: 'advanced', index: 3, total: 4 },
    stem: `ביישומון ניתן להוסיף או להסיר משקולות רק בקפיצות של 50 גרם.<br>
      במציאות, ניתן לתלות על הקפיץ מסות בגדלים שונים.<br><br><strong>השלימו:</strong>`,
    /* 30.09 — deck page 66 carries the SAME applet as page 65; the copy even
       says "ביישומון", and the build had no content at all here. */
    content: appletEmbed('applets/spring.html', 'יישומון הקפיץ והמשקולות'),
    ratioRows: [
      { label: 'היחס הקבוע בין המסה להתארכות הקפיץ הוא', suffix: 'גרם לס"מ.', parts: 1 },
      { label: 'ולכן מסה של 180 גרם גורמת להתארכות של', suffix: 'ס"מ', parts: 1 },
    ],
    correctInputs: ['20', '9'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'היעזרו בנתונים שמצאתם בסעיף הקודם:', body: 'עבור מסה של 100 גרם, הקפיץ מתארך ב-5 ס"מ.' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C5_SPRING_B }, wrong: { title: 'כמעט...', body: C5_SPRING_B } },
  },

  { /* deck 67 — the puzzle applet */
    screen: 42, type: 'value-input', label: '',
    step: { group: 'advanced', index: 4, total: 4 },
    stem: `<strong>העזרו ביישומון.</strong><br>כמה חלקים סך הכל יכיל הפאזל החדש?`,
    /* 30.09 — producer-supplied applet (יישומון פאזל). The screen said
       "העזרו ביישומון" with no applet on it. */
    /* measured: the applet stops overflowing at ~1000x826, so it is laid out
       at 1020x860 and scaled to the embed — no X or Y scroll, file unchanged */
    content: appletEmbed('applets/puzzle.html', 'יישומון הפאזל', { w: 1020, h: 860 }),
    ratioRows: [{ suffix: 'חלקים', parts: 1 }],
    correctInputs: ['540'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'מצאו תחילה כמה שורות יהיו בפאזל החדש,', body: 'כך שישמר היחס המקורי בין אורך הפאזל לרוחב הפאזל.' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C5_PUZZLE }, wrong: { title: 'כמעט...', body: C5_PUZZLE } },
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
    stem: `א. קבוצה של 15 תלמידי שכבת ח' נבחרה לייצג את ישראל במחנה קיץ ספורטיבי בינלאומי בארצות הברית.<br>
      בכדי לעזור לתלמידים, המדריכים מעדכנים מידי יום את "לוח המידע של המחנה" הכולל נתונים שיקלו על ההתנהלות במדינה זרה.<br><br>
      <strong>השתמשו במידע שעל הלוח כדי לענות על השאלות הבאות:</strong>`,
    content: BOARD,
    ratioRows: [
      { label: "1 רגל (feet) שווה ל-", suffix: 'ס"מ', parts: 1 },
      { label: '1 יארד (yard) שווה ל-', suffix: 'ס"מ', parts: 1 },
    ],
    correctInputs: ['30.48', '91.44'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'שימו לב!', body: "אם נתון לכם ש-1 רגל = 12 אינץ', ו-1 יארד = 3 רגליים,<br>עליכם להכפיל את הערכים כדי להגיע לערך של יארד אחד." },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C6_A }, wrong: { title: 'כמעט...', body: C6_A } },
  },

  { /* deck 73 — section ב */
    screen: 47, type: 'value-input', label: '',
    step: { group: 'peak1', index: 2, total: 5, hideBar: true },
    stem: `ב. התלמידים מתכננים להכין פנקייקים עבור כל חברי הקבוצה. במתכון שלהם רשום שיש להוסיף 600 מ"ל חלב לבלילה.<br>
      במטבח של המחנה ישנו רק כלי מדידה אחד שהשנתות עליו מסומנות באונקיות נוזל (oz) בלבד.<br><br>
      <strong>כמה אונקיות חלב עליהם למדוד בכלי בכדי שהכמות<br>תתאים לכמות במתכון?</strong>`,
    content: BOARD,
    ratioRows: [{ suffix: 'oz', parts: 1 }],
    correctInputs: ['20'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'שימו לב:', body: 'קיים יחס קבוע בין יחידת הנפח אונקיות נוזל (fl oz) ליחידת הנפח מיליליטר (ml).<br>היעזרו ביחס זה לכתיבת פרופורציה מתאימה.' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C6_B }, wrong: { title: 'כמעט...', body: C6_B } },
  },

  { /* deck 74 — section ג */
    screen: 48, type: 'single', label: '',
    step: { group: 'peak1', index: 3, total: 5, hideBar: true },
    stem: `ג. לקראת יום טיול בטבע, נהלי הבטיחות קובעים שכל אדם חייב לקחת עמו לפחות 2 ליטרים של מים לשתייה.<br>
      לטיול יוצאים כל 15 התלמידים ועוד 3 מדריכים מלווים.<br>
      לרשות הקבוצה הועמד מיכל מים מרכזי אחד שמכיל 8 גלונים של מים.<br><br>
      <strong>האם כמות המים במיכל תספיק למילוי הבקבוקים של כל המשתתפים בהתאם לנהלי הבטיחות?</strong>`,
    content: BOARD,
    options: [{ id: 'yes', html: 'כן' }, { id: 'no', html: 'לא' }, { id: 'idk', html: 'לא ניתן לדעת' }],
    correct: 'no',
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'חשבו:', body: 'כמה ליטרים של מים נדרשים לפי נהלי הבטיחות עבור כל המשתתפים בטיול?<br>השוואה ישירה בין כמות המים הנדרשת לכמות המים במיכל אפשרית רק כאשר הכמויות הן באותן יחידות מידה.' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C6_C }, wrong: { title: 'כמעט...', body: C6_C } },
  },

  { /* deck 75 — section ד */
    screen: 49, type: 'single', label: '',
    step: { group: 'peak1', index: 4, total: 5, hideBar: true },
    stem: `ד. הקבוצה מזמינה חולצות ייצוגיות מחנות אמריקאית.<br>
      כדי לבחור מידה, דויד מודד את רוחב החזה שלו ומקבל תוצאה של 50.8 ס"מ.<br>
      בטבלת המידות של החנות, רוחב החזה מופיע באינצ׳ים.<br><br>
      <strong>איזו מידת חולצה צריך דויד לבחור?</strong>`,
    content: BOARD,
    /* 30.09 — deck page 75 runs Small → Large; ours ran it backwards */
    options: [
      { id: 's', html: "Small (עד 18 אינץ')" },
      { id: 'm', html: "Medium (21-19 אינץ')" },
      { id: 'l', html: "Large (22 אינץ' ומעלה)" },
    ],
    correct: 'm',
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'שימו לב:', body: "השתמשו בנתון מהלוח - אם 1 אינץ' שווה ל-2.54 ס\"מ,<br>איך נדע כמה אינצ'ים הם 50.8 ס\"מ?" },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C6_D }, wrong: { title: 'כמעט...', body: C6_D } },
  },

  { /* deck 76 — section ה */
    screen: 50, type: 'single', label: '',
    step: { group: 'peak1', index: 5, total: 5, hideBar: true },
    stem: `ה. לרשות הקבוצה עומד תקציב קבוע מראש של 1,500 ₪ לצורך רכישת חולצות ייצוגיות ל-15 התלמידים (אין צורך לקנות חולצות למדריכים).<br>
      מחיר כל חולצה בחנות המחנה הוא <span dir="ltr">$30</span>.<br><br>
      <strong>האם התקציב שעומד לרשות הקבוצה יספיק כדי לרכוש חולצות לכל התלמידים?</strong>`,
    content: BOARD,
    options: [{ id: 'yes', html: 'כן' }, { id: 'no', html: 'לא' }, { id: 'idk', html: 'לא ניתן לדעת' }],
    correct: 'yes',
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'כדי לדעת אם התקציב מספיק, כדאי לפרק את השאלה לשלושה שלבים:',
      body: '1. מה העלות הכוללת של כל החולצות בדולרים?<br>2. איך הופכים את הסכום הזה לשקלים לפי שער ההמרה שנתון בלוח?<br>3. האם הסכום שקיבלתם בשקלים קטן או גדול מ-1500 ₪?' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C6_E }, wrong: { title: 'כמעט...', body: C6_E } },
  },

  /* ═══ component 07 — שאלת שיא ב (deck 80-85).  Slide 78 announces "5 סעיפים"
     but the deck carries SIX (א-ו, slides 80-85); the stepper follows the real
     slides. Flagged to the producer. ═══ */

  { /* deck 80 — section א */
    screen: 53, type: 'value-input', label: '',
    /* producer 04.10: no stepper bar on this screen. The question stays IN
       the group — drop it and station 1 has no question, which the paint
       loop reads as "all its parts are done" and ticks it green forever. */
    step: { group: 'peak2', index: 1, total: 6, hideBar: true },
    stem: `א. מידות קיר האולם שעליו יתלו הפוסטרים הן:<br>
      אורך 4.5 מטרים<br>גובה 2.8 מטרים.<br><br>
      <strong>המירו את מידות הקיר לסנטימטרים (ס"מ):</strong>`,
    content: `<figure class="expo-fig">
      <div class="expo-bubble">זה הזמן להיעזר בכל מה שלמדנו על פרופורציות כדי לעזור לוועדה לתכנן את התערוכה!</div>
      <img class="expo-shot" data-no-zoom src="assets/img/expo-wall.png" alt="תלמידה בתערוכת הצילום">
    </figure>`,
    ratioRows: [
      { label: 'אורך הקיר', suffix: 'ס"מ', parts: 1 },
      { label: 'גובה הקיר', suffix: 'ס"מ', parts: 1 },
    ],
    correctInputs: ['450', '280'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'שימו לב:', body: 'העזרו ביחס ההמרה 1 מטר = 100 ס"מ.' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'יופי, תשובה נכונה!', body: C7_A },
      wrong: { title: 'התשובה אינה נכונה, אבל יופי שניסית!<br>הנה ההסבר:', body: C7_A } },
  },

  { /* deck 81 — section ב, the posters applet */
    screen: 54, type: 'value-input', label: '',
    step: { group: 'peak2', index: 2, total: 6, hideBar: true },
    stem: `ב. את הפוסטרים על הקיר יש לתלות כך שיישמר מרווח של 10 ס"מ בין כל שני פוסטרים סמוכים, וגם מרווח של 10 ס"מ בין הפוסטרים לקצות הקיר.<br><br>
      <strong>היעזרו ביישומון וחשבו:</strong><br>
      מה צריך להיות רוחב כל פוסטר, אם נרצה לתלות 5 פוסטרים על הקיר?`,
    content: appletEmbed('applets/posters.html', 'יישומון הפוסטרים על הקיר'),
    ratioRows: [{ suffix: 'ס"מ', parts: 1 }],
    correctInputs: ['78'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'חשבו:', body: 'כמה מרווחים של 10 ס"מ נוצרו עבור 5 פוסטרים?' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'יופי, תשובה נכונה!', body: C7_B },
      wrong: { title: 'טעית. לא נורא, נתקדם שלב אחר שלב:', body: C7_B } },
  },

  { /* deck 82 — section ג */
    screen: 55, type: 'value-input', label: '',
    step: { group: 'peak2', index: 3, total: 6, hideBar: true },
    stem: `ג. התלמידים התבקשו לצלם את התמונות בנייד ביחס בין רוחב לגובה התמונה של 3:4.<br><br>
      על מנת שהתמונות לא יתעוותו, הפוסטרים יודפסו תוך שמירה על אותו יחס בין הרוחב לגובה.<br>
      מצאנו שרוחב פוסטר הוא 78 ס"מ.<br><br>
      <strong>מה גובה הפוסטר שישמור על הפרופורציה המתאימה?</strong>`,
    content: `<img src="assets/img/expo-ratio.png" alt="היחס בין רוחב לגובה התמונה — 3:4">`,
    ratioRows: [{ suffix: 'ס"מ', parts: 1 }],
    correctInputs: ['104'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'העזרו בטבלת הפרופורציה:', body: 'סדרו את הרוחב והגובה של התמונה מול הרוחב והגובה של הפוסטר.' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'התשובה נכונה.', body: C7_C },
      wrong: { title: 'טעית. הנה ההסבר שיעזור לך להבין היכן:', body: C7_C } },
  },

  { /* deck 83 — section ד */
    screen: 56, type: 'value-input', label: '',
    step: { group: 'peak2', index: 4, total: 6, hideBar: true },
    stem: `ד. שלוש תלמידות נוספות מצטרפות לתערוכה, וכעת יש לחשב מחדש את רוחב הפוסטרים.<br>
      מה יהיו ממדי כל פוסטר, אם נרצה לתלות 8 פוסטרים?<br>
      נזכיר כי היחס בין רוחב לגובה התמונות המצולמות בטלפון הנייד הוא 3:4.`,
    content: appletEmbed('applets/posters.html', 'יישומון הפוסטרים על הקיר'),
    ratioRows: [
      { label: 'רוחב:', suffix: 'ס"מ', parts: 1 },
      { label: 'גובה:', suffix: 'ס"מ', parts: 1 },
    ],
    correctInputs: ['45', '60'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'שימו לב:', body: 'התחילו בחישוב רוחב כל פוסטר - העזרו ביישומון.' },
    /* 06.10, producer: this wrong title ALWAYS — also when one of the two
       fields is right, where the engine would otherwise say "כמעט!". */
    fb: { retry: 'זה לא מדויק, ננסה שוב?', partial: null,
      correct: { title: 'יופי, תשובה נכונה!', body: C7_D },
      wrong: { title: 'טעית בחלק מהסעיפים או בכולם. התשובה הנכונה מוצגת.', body: C7_D } },
  },

  { /* deck 84 — section ה */
    screen: 57, type: 'single', label: '',
    step: { group: 'peak2', index: 5, total: 6, hideBar: true },
    stem: `ה. התלמידות והתלמידים פנו לשני בתי דפוס להצעות מחיר כדי להדפיס את הפוסטרים. התקבלו שתי הצעות מחיר:<br><br>
      דפוס 1 - 20 ש"ח לכל 500 סמ"ר<br>
      דפוס 2 - 15 ש"ח לכל 400 סמ"ר<br><br>
      <strong>איזו הצעה משתלמת יותר?</strong>`,
    content: `<img class="expo-shot expo-shot--print" data-no-zoom src="assets/img/expo-print-565.jpg" alt="פוסטרים מודפסים">`,
    /* 30.09 — deck page 84 puts "שתי ההצעות" third and "לא ניתן לקבוע" last */
    options: [
      { id: 'p1', html: 'דפוס 1' }, { id: 'p2', html: 'דפוס 2' },
      { id: 'same', html: 'שתי ההצעות משתלמות באותה מידה' }, { id: 'idk', html: 'לא ניתן לקבוע' },
    ],
    correct: 'p2',
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'שימו לב:', body: 'בכדי להשוות בין ההצעות, צריך לדעת מה יהיה המחיר עבור <strong>אותו שטח</strong>.' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'נכון!', body: C7_E },
      wrong: { title: 'כמעט, לא נורא, זה חלק מכל למידה.<br>הנה ההסבר:', body: C7_E } },
  },

  { /* deck 85 — section ו */
    screen: 58, type: 'value-input', label: '',
    step: { group: 'peak2', index: 6, total: 6, hideBar: true },
    stem: `גילינו שגודל כל פוסטר הוא 2,700 סמ"ר.<br>
      ו. הועד בחר בהצעה של דפוס 2, בה המחיר הוא 15 ₪ לכל 400 סמ"ר.<br><br>
      <strong>השלימו: מה יהיה מחיר ההדפסה של 8 פוסטרים?</strong>`,
    ratioRows: [{ suffix: 'ש"ח', parts: 1 }],
    correctInputs: ['810'],
    maxAttempts: 2, hintPolicy: 'after-wrong',
    hint: { title: 'חשבו:', body: 'מה השטח הכולל של 8 פוסטרים?' },
    fb: { retry: 'זה לא מדויק, ננסה שוב?',
      correct: { title: 'יופי, תשובה נכונה!', body: C7_F },
      wrong: { title: 'התשובה אינה נכונה, מצוין שניסית,<br>בואו נדייק:', body: C7_F } },
  },
];
