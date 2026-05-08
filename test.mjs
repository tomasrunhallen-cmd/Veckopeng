import assert from 'node:assert/strict';

// ── Functions under test (copied from index.html) ──────────────────────────

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getDayName(d) {
  return ['söndag','måndag','tisdag','onsdag','torsdag','fredag','lördag'][d];
}

function getTodayLabel(now = new Date()) {
  const months = ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'];
  const day = getDayName(now.getDay());
  return day.charAt(0).toUpperCase() + day.slice(1) + ', ' + now.getDate() + ' ' + months[now.getMonth()];
}

function lastOccurrence(date, wd) {
  const d = new Date(date); d.setHours(0,0,0,0);
  const diff = (d.getDay() - wd + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

const CHILD_FRIENDLY = true;

function payoutTexts(diff, payDay, paidToday = false) {
  const mainText = CHILD_FRIENDLY
    ? (diff === 0 ? 'Veckopeng idag! 🎉' : 'Veckopeng på ' + getDayName(payDay))
    : (diff === 0 ? 'Utbetalning idag!' : 'Utbetalning ' + getDayName(payDay));
  const subText = CHILD_FRIENDLY
    ? (diff === 0 ? (paidToday ? 'Pengarna har betalats ut idag' : 'Pengarna betalas ut idag') : diff === 1 ? '1 dag kvar' : diff + ' dagar kvar')
    : (diff === 0 ? (paidToday ? 'Veckopeng har betalats ut idag' : 'Veckopeng betalas ut idag') : diff === 1 ? 'Imorgon' : 'Om ' + diff + ' dagar');
  return { mainText, subText };
}

// ── Tests ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log('  ✓', name);
    passed++;
  } catch (e) {
    console.error('  ✗', name);
    console.error('   ', e.message);
    failed++;
  }
}

console.log('\nescHtml');
test('escapes ampersand',    () => assert.equal(escHtml('a & b'), 'a &amp; b'));
test('escapes less-than',    () => assert.equal(escHtml('<script>'), '&lt;script&gt;'));
test('escapes quotes',       () => assert.equal(escHtml('"hi"'), '&quot;hi&quot;'));
test('leaves plain text',    () => assert.equal(escHtml('hello'), 'hello'));
test('coerces number',       () => assert.equal(escHtml(42), '42'));

console.log('\ngetDayName');
test('söndag = 0',  () => assert.equal(getDayName(0), 'söndag'));
test('fredag = 5',  () => assert.equal(getDayName(5), 'fredag'));
test('lördag = 6',  () => assert.equal(getDayName(6), 'lördag'));
test('always lowercase', () => {
  for (let i = 0; i < 7; i++) assert.equal(getDayName(i), getDayName(i).toLowerCase());
});

console.log('\ngetTodayLabel');
test('starts with capital letter', () => {
  const label = getTodayLabel(new Date('2026-05-06')); // onsdag
  assert.match(label, /^[A-ZÅÄÖ]/);
});
test('contains day name',  () => assert.match(getTodayLabel(new Date('2026-05-06')), /[Oo]nsdag/));
test('contains date',      () => assert.match(getTodayLabel(new Date('2026-05-06')), /6/));
test('contains month',     () => assert.match(getTodayLabel(new Date('2026-05-06')), /maj/));
test('friday format',      () => assert.match(getTodayLabel(new Date('2026-05-08')), /^Fredag, 8 maj/));

console.log('\nlastOccurrence');
test('same day returns that day', () => {
  const fri = new Date('2026-05-08'); // fredag = 5
  const result = lastOccurrence(fri, 5);
  assert.equal(result.toDateString(), fri.toDateString());
});
test('last friday from wednesday', () => {
  const wed = new Date('2026-05-06'); // onsdag
  const result = lastOccurrence(wed, 5); // fredag
  assert.equal(result.toDateString(), new Date('2026-05-01').toDateString());
});
test('result always <= input date', () => {
  const today = new Date('2026-05-06');
  for (let wd = 0; wd < 7; wd++) {
    assert.ok(lastOccurrence(today, wd) <= today);
  }
});

console.log('\npayoutTexts (CHILD_FRIENDLY=true)');
test('idag, ej utbetalt → betalas ut', () => {
  const { mainText, subText } = payoutTexts(0, 5, false);
  assert.equal(mainText, 'Veckopeng idag! 🎉');
  assert.equal(subText,  'Pengarna betalas ut idag');
});
test('idag, redan utbetalt → har betalats ut', () => {
  const { subText } = payoutTexts(0, 5, true);
  assert.equal(subText, 'Pengarna har betalats ut idag');
});
test('imorgon → 1 dag kvar', () => {
  const { subText } = payoutTexts(1, 5);
  assert.equal(subText, '1 dag kvar');
});
test('2 dagar kvar', () => {
  const { subText } = payoutTexts(2, 5);
  assert.equal(subText, '2 dagar kvar');
});
test('banner fredag lowercase', () => {
  const { mainText } = payoutTexts(3, 5);
  assert.equal(mainText, 'Veckopeng på fredag');
});

console.log('\n' + '─'.repeat(40));
console.log(`${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
