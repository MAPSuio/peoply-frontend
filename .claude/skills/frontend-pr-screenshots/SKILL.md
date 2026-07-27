---
name: frontend-pr-screenshots
description: Obligatorisk før enhver frontend-PR med synlige UI-endringer opprettes eller oppdateres — ta før/etter-screenshots (390px og 1440px) med Playwright og legg dem som tabell i PR-beskrivelsen.
---

# Før/etter-screenshots i frontend-PR-er

## Krav

- Alle PR-er som endrer noe visuelt skal ha en «Før / etter»-tabell i PR-beskrivelsen,
  med fullside-screenshots av hver berørt side i **390×844 (mobil)** og **1440×900 (desktop)**.
  UI-et er mobile-first, så 390px-bildet er ikke valgfritt.
- PR-er uten visuell effekt (refaktorering, config, docs) skal i stedet ha linjen
  «Ingen visuelle endringer.» i beskrivelsen.

## Fremgangsmåte

### 1. «Etter» — branchen din

Kjør dev-serveren (`npm run dev`, port 3001) med branchen sjekket ut, og ta
fullside-screenshots med Playwright. Ta bildet fra en fersk page/tab og vent på
innhold før du knipser — fullPage-screenshot fra en gjenbrukt tab kan henge:

```js
const p = await page.context().newPage();
await p.setViewportSize({ width: 390, height: 844 }); // og 1440×900
await p.goto('http://localhost:3001/<side>', { waitUntil: 'load' });
await p.getByText('<tekst som finnes på siden>').first().waitFor({ state: 'visible' });
await p.waitForTimeout(1500);
await p.screenshot({ path: '<mappe>/<side>-etter-390.png', fullPage: true });
await p.close();
```

### 2. «Før» — master

Bytt de endrede filene midlertidig til master-versjonen i samme dev-server
(hot reload plukker det opp), knips, og bytt tilbake:

```bash
git checkout origin/master -- <endrede filer>
# … ta screenshots som i steg 1, med -for- i filnavnet …
git checkout <din-branch> -- <endrede filer>
```

Alternativ: bruk https://peoply.app/<side> hvis prod beviselig er i sync med master.

### 3. Last opp til `screenshots`-branchen

Bildene bor på den historikk-løse branchen `screenshots` (kun bilder, aldri kode),
i én mappe per PR:

```bash
git worktree add /tmp/screenshots-wt screenshots   # legg til --orphan -b screenshots hvis branchen mangler
mkdir -p /tmp/screenshots-wt/pr-<nr>
cp *.png /tmp/screenshots-wt/pr-<nr>/
git -C /tmp/screenshots-wt add -A
git -C /tmp/screenshots-wt commit -m "docs: screenshots for PR #<nr>"
git -C /tmp/screenshots-wt push -u origin screenshots
git worktree remove /tmp/screenshots-wt
```

### 4. Tabellen i PR-beskrivelsen

```markdown
## Før / etter

| Viewport | Før | Etter |
| --- | --- | --- |
| 390px (mobil) | <img src="https://raw.githubusercontent.com/MAPSuio/peoply-frontend/screenshots/pr-<nr>/<side>-for-390.png" width="300" /> | <img src="https://raw.githubusercontent.com/MAPSuio/peoply-frontend/screenshots/pr-<nr>/<side>-etter-390.png" width="300" /> |
| 1440px (desktop) | <img src="https://raw.githubusercontent.com/MAPSuio/peoply-frontend/screenshots/pr-<nr>/<side>-for-1440.png" width="420" /> | <img src="https://raw.githubusercontent.com/MAPSuio/peoply-frontend/screenshots/pr-<nr>/<side>-etter-1440.png" width="420" /> |
```

Gjenta radene per berørt side. Verifiser at raw-URL-ene svarer 200 før du
oppdaterer PR-en (`curl -s -o /dev/null -w "%{http_code}" <url>`).
