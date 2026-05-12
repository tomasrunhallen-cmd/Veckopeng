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

// ── Test runner ────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function describe(useCase, fn) {
  console.log('\n' + useCase);
  fn();
}

function test(scenario, fn) {
  try {
    fn();
    console.log('  ✓', scenario);
    passed++;
  } catch (e) {
    console.error('  ✗', scenario);
    console.error('    →', e.message);
    failed++;
  }
}

// ── Use case: Säker rendering av barnens namn och text i HTML ──────────────

describe('UC1  Säker rendering – skadlig kod i barnnamn/belopp blockeras', () => {
  test('& i namn renderas som &amp; (XSS-skydd)',    () => assert.equal(escHtml('Rut & Tage'), 'Rut &amp; Tage'));
  test('<script>-tag neutraliseras',                 () => assert.equal(escHtml('<script>'), '&lt;script&gt;'));
  test('Citationstecken i namn escappas',            () => assert.equal(escHtml('"Rut"'), '&quot;Rut&quot;'));
  test('Vanligt barnnamn förblir oförändrat',        () => assert.equal(escHtml('Rut'), 'Rut'));
  test('Numeriskt belopp konverteras till sträng',   () => assert.equal(escHtml(395), '395'));
});

// ── Use case: Dagnamn visas korrekt på svenska ─────────────────────────────

describe('UC2  Dagnamn – visas korrekt och med liten bokstav på svenska', () => {
  test('Söndag är dag 0 → "söndag"',                () => assert.equal(getDayName(0), 'söndag'));
  test('Fredag är dag 5 → "fredag"',                () => assert.equal(getDayName(5), 'fredag'));
  test('Lördag är dag 6 → "lördag"',                () => assert.equal(getDayName(6), 'lördag'));
  test('Alla dagar skrivs med liten bokstav',        () => {
    for (let i = 0; i < 7; i++) assert.equal(getDayName(i), getDayName(i).toLowerCase());
  });
});

// ── Use case: Datum i headern visas läsbart ────────────────────────────────

describe('UC3  Datumetikett i header – läsbart format för förälder och barn', () => {
  test('Börjar med versal (t.ex. "Onsdag")',         () => assert.match(getTodayLabel(new Date('2026-05-06')), /^[A-ZÅÄÖ]/));
  test('Innehåller dag i rätt form ("Onsdag")',      () => assert.match(getTodayLabel(new Date('2026-05-06')), /[Oo]nsdag/));
  test('Innehåller datumsiffra (6)',                 () => assert.match(getTodayLabel(new Date('2026-05-06')), /6/));
  test('Innehåller månadsnamn ("maj")',              () => assert.match(getTodayLabel(new Date('2026-05-06')), /maj/));
  test('Fullt format: "Fredag, 8 maj"',             () => assert.match(getTodayLabel(new Date('2026-05-08')), /^Fredag, 8 maj/));
});

// ── Use case: Räkna ut senaste och nästa utbetalningsdag ───────────────────

describe('UC4  Utbetalningslogik – räknar ut rätt dag för veckopeng', () => {
  test('Utbetalningsdag = idag → returnerar idag',  () => {
    const fri = new Date('2026-05-08');
    assert.equal(lastOccurrence(fri, 5).toDateString(), fri.toDateString());
  });
  test('Onsdag → senaste fredag var 1 maj',         () => {
    assert.equal(
      lastOccurrence(new Date('2026-05-06'), 5).toDateString(),
      new Date('2026-05-01').toDateString()
    );
  });
  test('Senaste utbetalning aldrig i framtiden',     () => {
    const today = new Date('2026-05-06');
    for (let wd = 0; wd < 7; wd++) assert.ok(lastOccurrence(today, wd) <= today);
  });
});

// ── Use case: Veckopengsbannern visar rätt text för barn ──────────────────

describe('UC5  Veckopengsbanner – barnvänlig text beroende på utbetalningsstatus', () => {
  test('Utbetalningsdag, ej utbetalt → "Pengarna betalas ut idag"', () => {
    const { mainText, subText } = payoutTexts(0, 5, false);
    assert.equal(mainText, 'Veckopeng idag! 🎉');
    assert.equal(subText,  'Pengarna betalas ut idag');
  });
  test('Utbetalningsdag, redan utbetalt → "Pengarna har betalats ut idag"', () => {
    assert.equal(payoutTexts(0, 5, true).subText, 'Pengarna har betalats ut idag');
  });
  test('1 dag till fredag → "1 dag kvar"',           () => {
    assert.equal(payoutTexts(1, 5).subText, '1 dag kvar');
  });
  test('2 dagar till fredag → "2 dagar kvar"',       () => {
    assert.equal(payoutTexts(2, 5).subText, '2 dagar kvar');
  });
  test('Dagnamn i banner med liten bokstav',          () => {
    assert.equal(payoutTexts(3, 5).mainText, 'Veckopeng på fredag');
  });
});

// ── Sammanfattning ─────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(50));
console.log(`${passed} godkända, ${failed} misslyckade`);
if (failed > 0) process.exit(1);
