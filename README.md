# Homepage – Entwurf (Beispieldaten)

Statische Seite ohne Server, Datenbank, Cookies oder externe Ressourcen.
Reiter **„Zu meiner Person“** (Standard) zeigt Karriere, Qualifikationen und Kompetenzen untereinander; **„Projekte“** zeigt Business- und private Projekte. Kein Shop-Bereich – die Seite ist rein privat, ohne Geschäftsbezug.

## Ordnerstruktur

```
homepage/
├── index.html            Startseite (Reiter werden per JS aufgebaut)
├── datenschutz.html      Vorlage – Platzhalter (gelb) ausfüllen
├── css/style.css         Design (hell/dunkel automatisch)
├── js/app.js             Logik, hier neue Reiter ergänzen
├── data/
│   ├── daten.js          Inhalte (wird vom Update-Werkzeug erzeugt) – aktuell BEISPIELDATEN
│   ├── projekte.js       Projekte-Reiter (von Hand): Titel, Kurztext, Status, Tags, Screenshot
│   └── config.js         Layout, Reiter an/aus, Beschriftungen (von Hand)
├── img/projekte/         Screenshots der Projekte (wetter.png, aktien.png, carfinder.png)
└── tools/update.html     LinkedIn-ZIP einlesen -> daten.js erzeugen (läuft lokal im Browser)
```

**Hinweis:** Es gibt bewusst kein `impressum.html` mehr – die Seite hat keinen Shop und keinen Geschäftsbezug (§ 5 DDG greift nur bei „geschäftsmäßigen“ Angeboten). Eine Datenschutzerklärung bleibt trotzdem sinnvoll/nötig, da GitHub Pages beim Seitenaufruf IP-Adressen der Besucher protokolliert (personenbezogene Daten, Art. 13 DSGVO).

## Layout wählen

In `data/config.js` steht `layout: "klassisch"`. Mögliche Werte: `"klassisch"`, `"seitenleiste"`, `"kacheln"`, `"kacheln-ohne-kennzahlen"` (D, Skyline), `"kacheln-d1"` (Glas), `"kacheln-d2"` (Editorial), `"kacheln-d3"` (Viewfinder), `"kacheln-e1"` (Sonnenaufgang), `"kacheln-e2"` (Pastell), `"kacheln-e3"` (Mint-Welle), `"kacheln-e4"` (Papierkarte), `"kacheln-e5"` (Pastell mit rundem Foto).
Zum schnellen Ausprobieren hilft ein Zusatz in der Adresse, z. B. `index.html?layout=kacheln&theme=dark`.
Hell/Dunkel folgt automatisch der Einstellung des Besuchers.

## Projekte und Screenshots

Neue Projekte in `data/projekte.js` ergänzen. Screenshot als PNG/JPG in `img/projekte/` legen und den Dateinamen bei `bild` eintragen. Fehlt die Datei, zeigt die Karte „Screenshot folgt“. Keine Screenshots mit privaten Daten veröffentlichen.

Jedes Projekt hat außerdem ein Feld `kategorie`: `"business"` erscheint oben unter der Überschrift „Business-Projektreferenzen“, `"privat"` darunter unter „Private Projekte“, getrennt durch einen schmalen Trennstrich. Eine leere Gruppe (z. B. noch keine Business-Referenz) wird automatisch ausgeblendet, inklusive Trennstrich – aktuell sind alle Projekte `"privat"`.

Lokal ansehen: `index.html` per Doppelklick öffnen (funktioniert ohne Webserver).

## Inhalte über den lokalen Ordner pflegen

Im Ordner `Landingpage_Sascha` liegt eine Vorlagen-Struktur zum Befüllen, unabhängig vom Code-Paket hier:

```
00_LIESMICH.txt                              Format & Ablauf
01_Zu_meiner_Person/
├── Profil.txt                               Name, Kurzprofil, Ort, LinkedIn, E-Mail
├── Karriere/_Vorlage.txt                    pro Station eine Kopie der Vorlage
├── Qualifikationen/_Vorlage_*.txt           Zertifikat / Ausbildung
└── Kompetenzen/Kompetenzen.txt
02_Projekte/
├── Business_Projekte/_Vorlage.txt           pro Referenz eine Kopie
└── Private_Projekte/*.txt                   Wetter-App, Aktien-Report, Carfinder, Landingpage (bereits vorausgefüllt)
03_Rechtliches/
├── Impressum-Angaben.txt
└── Datenschutz-Angaben.txt
04_Medien/
├── Profilfoto/                              aktuelles Foto ablegen
└── Projekte_Screenshots/                    ein Bild pro Projekt, Dateiname passend zum Feld „Bilddatei:“
```

Format: einfache `.txt`-Dateien mit `Feld: Wert`-Zeilen (siehe `_Vorlage.txt`-Dateien) – lässt sich in jedem Texteditor bearbeiten, ohne Formatierungsartefakte wie in Word/Excel, und lässt sich zuverlässig automatisch einlesen. Inhalte dort ablegen/ändern und kurz Bescheid geben („Go“) – die Übernahme in `data/*.js` und ggf. `img/` erfolgt dann von hier aus.

Business-Projekte werden erst sichtbar, sobald mindestens eine Datei in `02_Projekte/Business_Projekte/` liegt.

## Schritte für morgen

1. Lokalen Ordner anlegen (z. B. `homepage`) und den Inhalt dieses Pakets hineinkopieren.
2. GitHub-Repository anlegen, dann im Ordner:
   ```
   git init
   git add .
   git commit -m "Erste Version"
   git branch -M main
   git remote add origin https://github.com/<benutzer>/<repo>.git
   git push -u origin main
   ```
3. Veröffentlichen mit GitHub Pages: Repository → Settings → Pages → „Deploy from a branch“ → `main` / `(root)`.
   Hinweis: Pages aus einem *privaten* Repository braucht einen bezahlten GitHub-Tarif; sonst Repository öffentlich stellen (ok, solange keine privaten Daten drin liegen).
4. Platzhalter ersetzen: `datenschutz.html` (gelb markiert).

## Regelmäßig aktualisieren

1. LinkedIn: Einstellungen & Datenschutz → Datenschutz → „Kopie deiner Daten abrufen“ (Positionen, Ausbildung, Zertifikate, Kompetenzen, Profil) → ZIP herunterladen.
2. `tools/update.html` im Browser öffnen, ZIP hineinziehen. Beim ersten Mal ggf. Name, Ort, LinkedIn-URL im Formular ergänzen.
   Beim nächsten Update die bisherige `data/daten.js` mit hineinziehen, damit ausgeblendete Einträge und Profilangaben erhalten bleiben.
3. Nicht gewünschte Einträge abwählen, „daten.js herunterladen“, in `data/` ersetzen.
4. Committen und pushen (oder im GitHub-Browser „Upload files“).

Datenschutz beim Import: Es werden nur Positions, Education, Certifications, Skills und aus Profile nur Name/Headline/Kurzprofil gelesen. Alles andere im Export (Nachrichten, Kontakte, Adresse, Geburtsdatum …) wird ignoriert und nie veröffentlicht.

## Neuen Reiter hinzufügen (z. B. „Projekte“)

In `js/app.js`: Funktion `renderProjekte()` schreiben, in das Array `TABS` eintragen, ggf. Beschriftung in `data/config.js` ergänzen. Ein Reiter lässt sich dort auch mit `aktiv: false` ausblenden.

## Bekannte Punkte

- Die Spaltennamen der LinkedIn-CSVs sind aus dem üblichen Exportformat abgeleitet und mit Testdateien geprüft, aber noch nicht mit deinem echten Export. Das Werkzeug meldet, wenn erwartete Spalten fehlen; dann bitte kurz die Kopfzeile einer Datei zeigen.
- Beispieldaten in `data/daten.js` (Max Mustermann) werden beim ersten Import überschrieben, wenn du die alte `daten.js` **nicht** mit hineinziehst.
- Datenschutzerklärung ist eine Vorlage und keine Rechtsberatung. Ohne Shop/Geschäftsbezug entfällt die Impressumspflicht (§ 5 DDG); eine Datenschutzerklärung bleibt aber wegen der IP-Protokollierung durch GitHub Pages sinnvoll.
- Sollte später doch ein Shop/Geschäftsbereich dazukommen (siehe Projektkonzept – als künftige Erweiterung z. B. über einen weiteren Reiter angedacht), wird in dem Moment wieder ein Impressum Pflicht.
