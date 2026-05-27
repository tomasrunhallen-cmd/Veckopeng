const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({ credential: cert(sa) });
const db = getFirestore();

const RUT = {
  name: 'Rut',
  balance: 485,
  weeklyAmount: 30,
  avatar: '🐨',
  goal: null,
};

async function run() {
  const ref  = db.doc('families/main');
  const snap = await ref.get();
  if (!snap.exists) { console.error('families/main finns inte'); process.exit(1); }

  const kids = snap.data().kids || [];
  if (kids.some(k => k.name === 'Rut')) {
    console.log('Rut finns redan – inget ändrat.');
    return;
  }

  // Lägg Rut först (index 0), Tage behåller index 1
  await ref.update({ kids: [RUT, ...kids] });
  console.log('Rut återställd. kids:', [RUT, ...kids].map(k => k.name));
}

run().catch(err => { console.error(err); process.exit(1); });
