# Sascha Martin – Homepage

Private, statische Homepage ohne Server, Datenbank, Cookies oder externe Ressourcen. Zeigt beruflichen Werdegang, Qualifikationen und Kompetenzen sowie berufliche und private Projektreferenzen. Gehostet über GitHub Pages.

## Aufbau

```
homepage/
├── index.html            Startseite (Reiter werden per JS aufgebaut)
├── datenschutz.html      Datenschutzerklärung
├── css/style.css         Design (hell/dunkel automatisch nach Systemeinstellung)
├── js/app.js             Logik und Reiter-Verwaltung
├── data/
│   ├── daten.js          Profil, Karriere, Qualifikationen, Kompetenzen
│   ├── projekte.js       Projekte: Titel, Kurztext, Status, Tags, Screenshot, Kategorie (business/privat)
│   └── config.js         Layout, Reiter, Beschriftungen
├── img/projekte/         Screenshots der Projekte
└── tools/update.html     Liest einen LinkedIn-Datenexport ein und erzeugt daraus daten.js
```

Es gibt bewusst kein `impressum.html`: Die Seite ist rein privat, ohne Geschäftsbezug, daher greift die Impressumspflicht (§ 5 DDG) nicht. Die Datenschutzerklärung bleibt trotzdem bestehen, da GitHub Pages beim Seitenaufruf IP-Adressen protokolliert (Art. 13 DSGVO).

## Layout

In `data/config.js` steht z. B. `layout: "kacheln-e5"`. Weitere Werte: `"klassisch"`, `"seitenleiste"`, `"kacheln"` sowie die Varianten `"kacheln-d1"`–`"d3"` und `"kacheln-e1"`–`"e5"`. Zum Ausprobieren per Adresszusatz, z. B. `index.html?layout=kacheln&theme=dark`.

## Inhalte pflegen

Karriere, Qualifikationen, Kompetenzen und Projekte werden in `data/daten.js` bzw. `data/projekte.js` gepflegt. Screenshots liegen als PNG/JPG in `img/projekte/`, referenziert über das Feld `bild`; fehlt eine Datei, zeigt die Karte „Screenshot folgt“.

Projekte tragen ein Feld `kategorie`: `"business"` erscheint unter „Business-Projektreferenzen“, `"privat"` unter „Private Projekte“. Eine leere Gruppe wird automatisch ausgeblendet.

Für die laufende Pflege gibt es parallel einen Eingabe-Ordner mit einfachen `.txt`-Dateien (Profil, Karriere, Qualifikationen, Kompetenzen, Projekte, rechtliche Angaben), aus denen die Inhalte hier übernommen werden.

## Datenschutz beim LinkedIn-Import

`tools/update.html` liest aus einem LinkedIn-Datenexport ausschließlich Positionen, Ausbildung, Zertifikate, Kompetenzen sowie aus dem Profil Name, Headline und Kurzprofil. Alles andere im Export (Nachrichten, Kontakte, Adresse, Geburtsdatum …) wird ignoriert und nie veröffentlicht.
