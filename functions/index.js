const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp }  = require('firebase-admin/app');
const { getFirestore }   = require('firebase-admin/firestore');

initializeApp();

// Kör varje dag kl 07:00 Stockholm-tid (CET/CEST automatiskt)
exports.weeklyPayout = onSchedule(
  { schedule: '0 7 * * *', timeZone: 'Europe/Stockholm' },
  async () => {
    const db  = getFirestore();
    const ref = db.doc('families/main');
    const snap = await ref.get();
    if (!snap.exists) return;

    const data = snap.data();

    // Räkna ut aktuell veckodag i Stockholm (0=sön, 1=mån … 6=lör)
    const stockholmStr = new Date().toLocaleString('en-US', { timeZone: 'Europe/Stockholm' });
    const todayWeekday = new Date(stockholmStr).getDay();
    const payDay = data.payDay ?? 1;

    if (todayWeekday !== payDay) {
      console.log(`Idag veckodag ${todayWeekday}, utbetalningsdag ${payDay} – inget att göra.`);
      return;
    }

    // Kontrollera att vi inte redan betalat ut den här veckan
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
    console.log(`Veckopeng utbetald till ${newKids.length} barn kl 07:00.`);
  }
);
