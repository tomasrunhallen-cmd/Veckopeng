## Vad ändrades?
<!-- Beskriv kortfattat -->

## Automatiska tester
<!-- CI kör node test.mjs automatiskt. Inga manuella steg behövs. -->

## UAT – testa på mobil innan merge

### Uppstart
- [ ] Appen laddar utan att fastna på "Laddar"
- [ ] Ingen vit/svart blixt vid start
- [ ] Grisikonen syns i headern
- [ ] Datum visas korrekt ("Onsdag, 6 maj")

### Huvudvy
- [ ] Veckopeng-bannern visar "Veckopeng på [dag]" / "X dagar kvar"
- [ ] Barnkorten visar namn, belopp och "Ändra"-knapp
- [ ] Bakgrundsbild syns oskarp (inte suddad)

### Ändra pengar
- [ ] Tryck på "Ändra" öppnar sheet
- [ ] Lägg till pengar → saldo ökar direkt
- [ ] Ta bort pengar → saldo minskar direkt
- [ ] Ångra-toast fungerar

### Tema
- [ ] Mörkt/ljust-toggle fungerar
- [ ] Korten ser korrekta ut i båda lägena
- [ ] Payout-bannern läsbar i båda lägena

### Övrigt
- [ ] Inloggning fungerar
- [ ] Utloggning fungerar
- [ ] Fungerar på iOS Safari (PWA)
