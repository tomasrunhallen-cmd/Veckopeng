const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore }       = require('firebase-admin/firestore');

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({ credential: cert(sa) });
const db = getFirestore();

async function payoutFamily(docId, ref) {
  const snap = await ref.get();
  if (!snap.exists) { console.log(`[${docId}] Dokument saknas`); return; }

  const data = snap.data();

  const stockholmStr = new Date().toLocaleString('en-US', { timeZone: 'Europe/Stockholm' });
  const todayWeekday = new Date(stockholmStr).getDay();
  const payDay       = data.payDay ?? 1;

  if (todayWeekday !== payDay) {
    console.log(`[${docId}] Veckodag ${todayWeekday}, utbetalningsdag ${payDay} – inget att göra.`);
    return;
  }

  const lastPayout = data.lastPayout ? new Date(data.lastPayout) : null;
  if (lastPayout) {
    const daysSince = (Date.now() - lastPayout.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 6) {
      console.log(`[${docId}] Redan utbetalt för ${daysSince.toFixed(1)} dagar sedan – hoppar över.`);
      return;
    }
  }

  const weekly  = data.weeklyAmount ?? 30;
  const newKids = (data.kids || []).map(k => ({
    ...k,
    balance: (k.balance || 0) + (k.weeklyAmount ?? weekly),
  }));

  const now = new Date().toISOString();
  await ref.update({ kids: newKids, lastPayout: now });

  const txCol = db.collection(`families/${docId}/transactions`);
  await Promise.all((data.kids || []).map((k, i) =>
    txCol.add({
      kidIndex: i, kidName: k.name,
      delta: k.weeklyAmount ?? weekly,
      type: 'payout', timestamp: now, undone: false,
    })
  ));
  console.log(`[${docId}] Veckopeng utbetald:`, newKids.map(k => `${k.name} ${k.balance} kr`).join(', '));
}

async function run() {
  const snapshot = await db.collection('families').get();
  if (snapshot.empty) { console.log('Inga familjdokument hittades.'); return; }
  await Promise.all(snapshot.docs.map(d => payoutFamily(d.id, d.ref)));
}

run().catch(err => { console.error(err); process.exit(1); });
