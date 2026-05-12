const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore }       = require('firebase-admin/firestore');
const fs                     = require('fs');

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({ credential: cert(sa) });
const db = getFirestore();

async function run() {
  const families  = await db.collection('families').get();
  const users     = await db.collection('users').get();
  const backup    = { exportedAt: new Date().toISOString(), families: {}, users: {} };

  for (const doc of families.docs) {
    const txSnap = await db.collection(`families/${doc.id}/transactions`).get();
    backup.families[doc.id] = {
      ...doc.data(),
      transactions: txSnap.docs.map(t => ({ id: t.id, ...t.data() })),
    };
  }

  users.docs.forEach(d => { backup.users[d.id] = d.data(); });

  const filename = `backup-${new Date().toISOString().slice(0,10)}.json`;
  fs.writeFileSync(filename, JSON.stringify(backup, null, 2));
  console.log(`Backup sparad: ${filename} (${families.size} familj(er), ${users.size} användare)`);
}

run().catch(err => { console.error('Backup misslyckades:', err); process.exit(1); });
