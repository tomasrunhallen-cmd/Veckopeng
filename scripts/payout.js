const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore }       = require('firebase-admin/firestore');

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({ credential: cert(sa) });
const db = getFirestore();

async function run() {
  const ref  = db.doc('families/main');
  const snap = await ref.get();
  if (!snap.exists) { console.log('Dokument saknas'); return; }

  const data = snap.data();

  // Aktuell veckodag i Stockholm (0=sön…6=lör)
  const stockholmStr = new Date().toLocaleString('en-US', { timeZone: 'Europe/Stockholm' });
  const todayWeekday = new Date(stockholmStr).getDay();
  const payDay       = data.payDay ?? 1;

  if (todayWeekday !== payDay) {
    console.log(`Veckodag ${todayWeekday}, utbetalningsdag ${payDay} – inget att göra.`);
    return;
  }

  // Skydda mot dubbel-utbetalning
  const lastPayout = data.lastPayout ? new Date(data.lastPayout) : null;
  if (lastPayout) {
    const daysSince = (Date.now() - lastPayout.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 6) {
      console.log(`Redan utbetalt för ${daysSince.toFixed(1)} dagar sedan – hoppar över.`);
      return;
    }
  }

  const weekly  = data.weeklyAmount ?? 30;
  const newKids = (data.kids || []).map(k => ({
    ...k,
    balance: (k.balance || 0) + (k.weeklyAmount ?? weekly),
  }));

  await ref.update({ kids: newKids, lastPayout: new Date().toISOString() });
  console.log('Veckopeng utbetald:', newKids.map(k => `${k.name} ${k.balance} kr`).join(', '));
}

run().catch(err => { console.error(err); process.exit(1); });
