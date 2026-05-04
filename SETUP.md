# Setup-guide – Veckopeng

## Steg 1: Skapa Firebase-projekt

1. Gå till [console.firebase.google.com](https://console.firebase.google.com)
2. Klicka **"Add project"** → ge det ett namn (t.ex. `veckopeng`) → fortsätt
3. Stäng av Google Analytics (behövs inte) → **"Create project"**

---

## Steg 2: Aktivera Firestore

1. I sidomenyn: **Build → Firestore Database**
2. Klicka **"Create database"**
3. Välj **"Start in production mode"** → välj en region nära dig (t.ex. `europe-west1`) → **"Enable"**

---

## Steg 3: Aktivera Email/Password-autentisering

1. I sidomenyn: **Build → Authentication**
2. Klicka **"Get started"**
3. Under fliken **"Sign-in method"**: klicka på **Email/Password** → aktivera den → **"Save"**
4. Under fliken **"Users"**: klicka **"Add user"** → lägg till ditt konto (email + lösenord)
5. Upprepa för din frus konto

---

## Steg 4: Sätt Firestore Security Rules

1. I Firestore: gå till fliken **"Rules"**
2. Ersätt hela innehållet med detta:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /families/{docId} {
      allow read, write: if request.auth != null;
      match /transactions/{txId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

3. Klicka **"Publish"**

---

## Steg 5: Hämta Firebase config och klistra in i index.html

1. I Firebase-konsolen: klicka på kugghjulet ⚙️ → **"Project settings"**
2. Scrolla ner till **"Your apps"** → klicka på webb-ikonen **`</>`**
3. Ge appen ett smeknamn (t.ex. `veckopeng-web`) → klicka **"Register app"**
4. Du får ett config-objekt som ser ut ungefär så här:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "veckopeng.firebaseapp.com",
  projectId: "veckopeng",
  storageBucket: "veckopeng.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

5. Öppna `index.html` och hitta raden `// ── CONFIG: Klistra in ditt Firebase-config-objekt här ──`
6. Ersätt hela `const firebaseConfig = { ... };`-blocket med ditt riktiga config

---

## Steg 6: Skapa GitHub-repo och aktivera GitHub Pages

1. Skapa ett nytt repo på [github.com/new](https://github.com/new)
   - Ge det ett namn, t.ex. `veckopeng`
   - Sätt det till **Public** (krävs för gratis GitHub Pages)
   - Klicka **"Create repository"**

2. I terminalen (eller via GitHub Desktop):

```bash
cd /sökväg/till/veckopeng
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DITT-ANVÄNDARNAMN/veckopeng.git
git push -u origin main
```

3. I ditt GitHub-repo: gå till **Settings → Pages**
4. Under **"Branch"**: välj `main`, mapp `/` (root) → **"Save"**
5. Efter ~1 minut är appen live på:
   `https://DITT-ANVÄNDARNAMN.github.io/veckopeng/`

6. Lägg till den URL:en i Firebase:
   - **Authentication → Settings → Authorized domains** → **"Add domain"**
   - Klistra in `DITT-ANVÄNDARNAMN.github.io`

---

## Steg 7: Lägg till som genväg på hemskärmen

### iPhone (Safari)
1. Öppna `https://DITT-ANVÄNDARNAMN.github.io/veckopeng/` i Safari
2. Tryck på dela-ikonen (rutan med pil upp)
3. Scrolla ner → **"Lägg till på hemskärmen"**
4. Ge den ett namn → **"Lägg till"**

### Android (Chrome)
1. Öppna URL:en i Chrome
2. Tryck på menyikonen (tre punkter) uppe till höger
3. Välj **"Lägg till på startskärmen"** (eller så dyker en banner upp automatiskt)

---

## Appikoner (valfritt)

Filen `manifest.json` refererar till `icon-192.png` och `icon-512.png`.  
Lägg till egna ikoner i samma mapp för en snyggare hemskärms-ikon, annars
fungerar appen utan (den tar en skärmbild som ikon).

---

## Klart!

Öppna appen, logga in med ett av de skapade kontona och appen sätter automatiskt
upp Firestore-dokumentet med standardvärden (30 kr/vecka, måndag).
Båda kontona ser samma data i realtid.
