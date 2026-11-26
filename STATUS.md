# STATUS – function. (Stand 22.11.2026)

> **Für jede neue Sitzung:** Zuerst diese Datei und `CLAUDE.md` lesen. Dort stehen alle festen Regeln (Stimme, Musik, Look, Thumbnails, Outro, Texte, Rendern). Nichts davon neu erfragen. Gearbeitet wird auf dem Branch `claude/nice-galileo-neyrpn`. Das ausführliche Protokoll aller früheren Schritte steht in `STATUS_Verlauf.md`, die Checkliste für einen neuen Claude-Account in `UEBERGABE.md`.

## Kanal in Kürze

„function.“ macht kurze Erklärvideos für TikTok, Instagram Reels und YouTube Shorts zu Themen, die ganz Deutschland interessieren. Ziel sind möglichst schnell 10.000 Follower auf TikTok. Der Nutzer lädt alles selbst hoch; Claude liefert Video, Thumbnail und die Texte je Kanal. Aktueller Look der neuen Videos ist der **Knete-Look** (Baukasten `kit/`), die Thumbnails folgen für alle Videos dem System **„Galerie A“** mit Knete-Motiven.

## Alle Videos und wo die fertigen Dateien liegen

| Video | Ordner | Fertiges Video | Stand |
|---|---|---|---|
| Weihnachtsgeld: Warum bleibt so wenig? | `weihnachtsgeld/` | noch nicht gerendert (Testvideo `Test_Weihnachtsgeld.mp4`, Einstieg `Test_Weihnachtsgeld_Einstieg.mp4`) | Gebaut und geprüft, PC-Auftrag `weihnachtsgeld/render.json` bereit, Rendern nach Go. |
| Black Friday: Sind die Rabatte echt? | `blackfriday/` | `blackfriday/renders/Black_Friday_Knete_mit_Musik.mp4` (40,6 s) | Fertig, geprüft, geschickt. **Vor Freitag, 27.11.2026 hochladen.** |
| 3.000 € brutto: So viel bleibt dir | `brutto/` | `brutto/renders/Brutto_Netto_Knete_mit_Musik.mp4` (42,7 s) | Fertig, geprüft, geschickt. Läuft jederzeit. |
| Diese 5 Gesetze haben Deutschland richtig wütend gemacht | `gesetze/` | `gesetze/renders/Diese_5_Gesetze_Podest_mit_Musik.mp4` (58,6 s) | Fertig, mit schlichter 2D-Outro. Upload-Paket in `upload/Diese_5_Gesetze/`. |
| Wem gehört eigentlich Deutschland? (Knete) | `vermoegen/` | `vermoegen/renders/Wem_gehoert_Deutschland_Knete_mit_Musik.mp4` (77,4 s) | Fertig mit abgestuft ausgestatteten Figuren. Upload-Paket in `upload/Wem_gehoert_Deutschland/`. Die ältere Fassung „Stadt aus Geld“ (`Wem_gehoert_Deutschland_mit_Musik.mp4`) ist verworfen. |
| Was wäre, wenn alle gleichzeitig ihr Geld abheben? (Bankrun) | `bankrun/` | `bankrun/renders/Bankrun_Stil1_TiltShift_mit_Musik.mp4` (71,3 s) | Fertig, Stil 1 ist die Fassung zum Hochladen. |
| Was ändert sich 2027 für dich? | `jahr2027/` | `jahr2027/Was_aendert_sich_2027_mit_Musik.mp4` | Fertig (Kalender-Look ohne Diorama, schlichte Logo-Outro). |
| Ist Friedrich Merz Deutschlands unbeliebtester Bundeskanzler? | `merz/` | `merz/Merz_unbeliebtester_Kanzler_v6_mit_Musik.mp4` | Am 19.11.2026 auf allen drei Kanälen veröffentlicht. |
| Wohin geht dein Rundfunkbeitrag? | `rundfunk/` | `rundfunk/Rundfunk_Diorama_A3_36s_mit_Musik.mp4` | Fertig (Fassung A3). |
| Wie kommt der Strom in deine Steckdose? | `strom/` | `strom/Der_Strom_mit_Musik.mp4` | Fertig (v4), am 17.11.2026 veröffentlicht. |
| Der Geldautomat | `geldautomat/` | `geldautomat/Der_Geldautomat_mit_Musik.mp4` | Fertig. |
| Das Paket | `paket-test/` | `paket-test/Das_Paket_mit_Musik.mp4` | Fertig (v4). |

Ältere Videos ohne Dateien im Repo: Elbphilharmonie, Flughafen BER, Weißes Haus, Pfandflasche sowie TÜV-Plakette, Umweltplakette, Autobahn-Nummer, Benzinpreis, Kennzeichen und Wasserscheide (nur Thumbnails).

Zu jedem Video gehören im Ordner: Drehbuch mit Paket A–I und Faktencheck (`Drehbuch_*.md`), Stimme in `voice/`, Tonmischungen, `SOUNDS.md` mit den Sound-IDs und die Texte je Kanal in `social/` (`Texte.md` oder `Beschreibungen_*.txt`).

## Thumbnails

Alle 19 Thumbnails im System „Galerie A“ mit Knete-Motiv liegen in `thumbs/final/Thumbnail_<name>.png` und als Sammlung in `upload/Thumbnails_alle_Videos/`. Neue Motive entstehen in `thumbs/knete_studio.js` (Ablauf siehe `CLAUDE.md`).

## Offene Punkte

- **Black Friday hochladen** vor dem 27.11.2026, Texte in `blackfriday/social/Texte.md`.
- **Gen-Z-Proteste:** Es gibt kein Video dazu. Ein Entwurfs-Thumbnail mit Arbeitstitel liegt in `thumbs/final/Thumbnail_genz.png` (`upload/Thumbnails_alle_Videos/Thumbnail_genz_Entwurf.png`). Offen ist der echte Titel oder das Thema vom Nutzer.
- Das Black-Friday-Thumbnail zeigt das „-50%“-Schild noch frei stehend, im Video ist es inzwischen eine Klapptafel. Nur anpassen, wenn der Nutzer es möchte.
- Die Vorschau-Clips `blackfriday/Test_BF_Einstieg.mp4`, `brutto/Test_Brutto_Einstieg.mp4` und die beiden Kontaktbögen zeigen noch den Stand vor den letzten Korrekturen; maßgeblich sind die Videos in `renders/`.
- Higgsfield-Guthaben war zuletzt leer; Higgsfield nur nutzen, wenn der Nutzer Credits auflädt, und die Kosten vorher nennen.

## So entsteht ein neues Video (aktueller Ablauf)

1. Thema recherchieren, Paket A–I mit Faktencheck schreiben (`Drehbuch_*.md`), Freigabe abwarten.
2. Stimme „Tom Magic“ über den ElevenLabs-Connector erzeugen (zwei Takes), besten Take wählen, Wortzeiten per Transkription in `voice/words.json`.
3. Szene im Knete-Look mit `kit/knete_kit.js` bauen (Seite `<ordner>/<name>.html`, Code `<ordner>/src/`), Kollisionsprüfung `node kit/shot.mjs <seite> check`, Standbilder mit `node kit/shot.mjs <seite> <prefix> t…`.
4. Ton mit `kit/mix.py` (Skript `<ordner>/audio_*.py`), Sounds aus Epidemic, IDs in `SOUNDS.md`.
5. Ganzes Video mit `node kit/sample.mjs <seite> <ordner>` prüfen (alle 0,3 s ein Bild, als Kontaktbögen durchsehen), Vorschau des Einstiegs mit `node kit/preview.mjs`. Testbilder und Vorschau schicken.
6. Rendern erst nach dem „Go“ des Nutzers: `<ordner>/render.json` anlegen und `pc-auftrag.json` darauf zeigen lassen (mehrere Videos nacheinander mit `"queue"`). Der Nutzer klickt doppelt auf „function. rendern“, der PC lädt das Video hoch (Commit „PC-Render: …“). Claude holt es mit `git fetch`, prüft es und schickt es per SendUserFile.
7. Thumbnail im System „Galerie A“ (eigenes Knete-Motiv) und Texte je Kanal liefern, jeden Text in einem eigenen Codeblock.

Lokaler Server für alle Seiten: `python3 -m http.server 8780` im Hauptordner.

## Letzte Änderungen (22.11.2026)

- Black Friday und Brutto gebaut, korrigiert und auf dem PC gerendert. Korrekturen nach Rückmeldung des Nutzers: Das Rabatt-Schild ist eine Klapptafel, die von „-50%“ auf „-8%“ kippt; „FIRMA“ steht als Dachschild über den Fenstern; Türen und Schilder liegen nicht mehr auf Fenstern; der Geldturm hält in einer Lücke zwischen den Häusern, damit jedes Haus zu sehen ist.
- `render-pc.mjs` kann mehrere Videos nacheinander rendern (`"queue"` in `pc-auftrag.json`).
- Der Kanal-Skill liegt jetzt auch im Repository (`.claude/skills/function-erklaervideo/`), damit er in jedem Account mitlädt.
