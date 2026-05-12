const { onUserCreated } = require('firebase-functions/v2/identity');
const { defineString }  = require('firebase-functions/params');
const nodemailer        = require('nodemailer');

const NOTIFY_EMAIL    = defineString('NOTIFY_EMAIL');    // din e-post som tar emot notisen
const GMAIL_USER      = defineString('GMAIL_USER');      // Gmail-konto som skickar
const GMAIL_APP_PASS  = defineString('GMAIL_APP_PASS');  // Gmail-applösenord

exports.notifyOnRegister = onUserCreated(async (event) => {
  const user = event.data;
  const when = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' });

  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER.value(), pass: GMAIL_APP_PASS.value() },
  });

  await transport.sendMail({
    from: `"Min Spargris" <${GMAIL_USER.value()}>`,
    to: NOTIFY_EMAIL.value(),
    subject: '🐷 Ny användare i Min Spargris',
    text: [
      'En ny användare har registrerat sig.',
      '',
      `E-post:   ${user.email || '(ingen)'}`,
      `UID:      ${user.uid}`,
      `Tid:      ${when}`,
    ].join('\n'),
  });

  console.log('Notis skickad för ny användare:', user.uid);
});
