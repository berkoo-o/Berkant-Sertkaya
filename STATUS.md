# STATUS – function. (Stand 16.11.2026)

> **Für jeden neuen Chat:** Lies zuerst diese Datei und die `CLAUDE.md`. Dort stehen alle festen Regeln für Look, Stimme, Musik, Cover und Outro. Bitte nichts davon neu erfragen.

## Fertige Videos in diesem Repo
| Ordner | Video | Stand |
|---|---|---|
| `paket-test/` | Das Paket | fertig (v4), Referenz für Cover (`cover3.html`), Musik (`track_D`) und Outro |
| `geldautomat/` | Der Geldautomat | fertig, mit Cover und Beschreibungen |
| `strom/` | Der Strom | fertig als **v4** (`strom/v4/modell.html`), das ist die Referenz für Look, LED-Licht und Details |

Frühere Videos außerhalb des Repos: Elbphilharmonie, Flughafen BER, Weißes Haus (v3) und Pfandflasche (v5).

## Aktueller Look (seit Strom v3, verfeinert in v4)
Ein einziges schlichtes Low-Poly-Modell auf einer dunklen Platte, wie im schraffuren-Reel. Die Geschichte wird über Licht erzählt, es gibt keine Schnitte und die Kamera fährt langsam. Abgelehnt wurden viele einzelne 3D-Szenen und das fotorealistische Higgsfield-Diorama.

## Aktuelles Video: Der Strom („Wie kommt der Strom in deine Steckdose?“)
- **Ordner:** `strom/`, die aktuelle Version liegt in `strom/v4/` (`modell.html`, `render.mjs`, `chunk.sh`, `audio_modell.py`). `strom/v3/` bleibt als Stand vor der Überarbeitung erhalten.
- **Stand:** v4 ist fertig gerendert (`strom/Der_Strom_mit_Musik.mp4`, `strom/Der_Strom_nur_Effekte.mp4`, Kontrolle in `strom/Kontaktbogen_Final.jpg`). Das Cover ist neu im cleanen Stil (`strom/Cover_Der_Strom.png`, Vorlage `strom/v4/cover_strom.html`, gerendert mit `node cover.mjs`): ein kompaktes Windrad im Stil des Geldautomaten-Covers mit gläserner Gondel und gläsernem Turm. Innen sieht man Antriebsstrang, Generator mit Kupferwicklungen, Leiter, Messkasten und Transformator, und der rote Strom läuft vom Generator bis zum Stecker in der Steckdose. Die erste, schlichtere Fassung war dem Nutzer zu wenig detailliert. Das alte Cover liegt als `Cover_Der_Strom_alt.png` daneben. Die Beschreibungen sind unverändert von v3.
- **Skript:** `strom/Skript_Strom.txt`, Sprechertext in `strom/Sprechertext_mit_Tags.txt`, Stimme unverändert (`strom/voice/Strom_Sprecher_Tom_v4.mp3`)
- **Outro:** LED-Leuchtschrift. Die Stadt wird dunkel, „function“ schaltet sich als rote LED-Schrift ein, das Warnlicht des vordersten Windrads rastet als Punkt ein.
- **Aktuelle Etappe:** Die Entwürfe für TikTok, Instagram Reels und YouTube Shorts liegen in Metricool (Marke „functionty“, alle auf den 18.11.2026 um 10:00 Uhr gelegt, aber nur als Entwurf, also nicht automatisch veröffentlicht). Thumbnails liegen in `strom/social/`.
- **Offene Änderungswünsche:** _(hier eintragen)_

### Was in v4 geändert wurde (Feedback vom 16.11.2026)
- Mehr Licht mit LED: kühlweiße LED-Straßenlampen, LED-Band um die Platte, LED-Flutlicht am Umspannwerk, kleine LEDs an den Windrädern (Türlicht am Turmfuß, rote Turmbefeuerung auf halber Höhe), Park-Poller, Bushaltestelle mit LED-Tafel, Schaufenster, einzelne kühle Fenster und Fernseher-Flackern.
- Flugzeug entfernt. Die Warnlichter gehen bei 53,3 s nacheinander aus und bei 56,15 s gemeinsam wieder an, ein Flugzeug ist nur sehr leise in der Ferne zu hören.
- Verkehr: 14 fahrende Autos mit Scheinwerferkegeln, geparkte Autos, 7 Radfahrer, rund 35 Fußgänger (einer mit Hund, ein Kind), E-Auto an der Wallbox am Haus. Dafür gibt es drei neue Randstraßen, damit alles auf geschlossenen Runden fährt.
- Kleine Details: Dachaufbauten und Solarmodule, Fenstersprossen und Türgriff am Haus, helles Trafohäuschen mit Türen, Bänke.
- Roter Strom: kurzer Lichtstreifen mit hellem Kopf statt roter Kugel. Die Warnlichter blinken im echten Takt der Nachtkennzeichnung (1 s an, 0,5 s aus, 1 s an, 1,5 s aus) und werfen rotes Licht auf die Gondel.
- Elektronen: Nahaufnahme auf das Kabel vor dem Haus als Glasröhre, die Elektronen schwingen sichtbar auf der Stelle, eines ist rot markiert. Danach fährt die Kamera zurück und drei schnelle rote Wellen laufen vom Windrad bis zum Haus.
- Die rote Linie zum Windrad folgt jetzt der Hügeloberfläche und verschwindet nicht mehr im Gras. Außerdem läuft der Strom im Umspannwerk und am Haus nicht mehr durch Gehäuse und Hausecke.
- Titel und Zahlen in Inter Tight ExtraBold, leichte dunkle Verläufe oben und unten für die Lesbarkeit.
- Dritter Wunsch (17.11.2026): Der fließende Strom klingt jetzt elektrisch, mit einem Brummen aus der 50-Hz-Familie, Funkenknistern und einem kleinen Kontaktklick beim Ankommen, statt der gläsernen Blips (`zap()`, `zip_()` und `arrive()` in `audio_modell.py`). Die Kamera schaut beim Trafohäuschen weiter von links, damit es nicht mehr hinter dem Dach des Hauses verschwindet. Der Punkt im Outro-Logo saß zu weit links und war zu groß, weil die Glyphe falsch vermessen wurde; er landet jetzt genau auf dem echten Punkt. Bei „47 × um die Erde“ steigt über der linken Ecke der Platte eine kleine Erde auf, um die sich 47 orangefarbene Kreise legen, genau im Takt des Zählers und mit einem leisen Tick pro Kreis. Die Kamera fährt dafür kurz an die Erde heran.
- Windräder (Wunsch vom 17.11.2026): nach zwei Higgsfield-Referenzbildern neu gebaut (`strom/v4/ref/wind_ref1.png` und `wind_ref2.png`, Kosten 0,5 Credits, danach noch 0,25 Credits übrig). Sie haben jetzt lange, schlanke Blätter mit rot-weißen Spitzen, Blattlager, eine spitze Nabe, eine kantige Gondel mit Lagerkragen, Lüftungsgittern, Kühler mit zwei Lüftern, Dachluke, Geländer, Windmesser und Windfahne, zwei Warnlichter an den Dachecken, Azimutlager und Flanschringe am Turm.
- Häuser (zweiter Wunsch vom 16.11.2026): zehn gedeckte Fassadenfarben statt einheitlichem Sandton, dazu Sockel, Gesims, Fensterbänke, Balkone, Haustüren mit Vordach und Lampe, Markisen über den Schaufenstern, Fallrohre, drei Fensterformate und Satteldächer mit Schornstein auf einigen niedrigen Häusern. Das Haus mit dem roten Dach bleibt als einziges rot.

### Rendern
Im Ordner `strom/v4`: `npm install`, `npx http-server -p 8769 -c-1 .`, dann `seq 0 120 1800 | xargs -P 4 -I{} ./chunk.sh {}` (Bilder landen in `fr/`). Ton mit `python3 audio_modell.py` (braucht `sfx/whoosh.wav` und `sfx/clicks.wav`, aus `paket-test/sfx_epidemic/*.mp3` umgewandelt). Für Prüfansichten mit freier Kamera gibt es `dbgcam.mjs`.

## Etappen
Nach jeder Etappe wird diese Datei aktualisiert, danach `/clear` und im neuen Chat mit `@STATUS.md` weitermachen.

1. Thema und Skript, dann Freigabe per „Go“
2. Stimme „Tom Magic“ (eleven_v4) über den ElevenLabs-Connector erzeugen
3. Standbild neben die Vorlage legen und vergleichen, dann Freigabe
4. Film rendern; bei Fehlern nur die betroffenen Stellen neu rendern
5. Ton in zwei Versionen: „mit Musik“ und „nur Effekte“
6. 3–4 themenbezogene Outro-Ideen zur Auswahl geben, dann bauen
7. Cover-PNG nach `paket-test/cover3.html`
8. Beschreibungen für TikTok, Reels und Shorts mit Quellen und #function

## Entscheidungen im aktuellen Video
- _(hier sammeln: Skriptversion, Szenen, Lichter, Timing, gewählte Outro …)_

## Nächster Schritt
Rückmeldung des Nutzers zu Strom v4 abwarten und danach nur die betroffenen Stellen neu rendern.
