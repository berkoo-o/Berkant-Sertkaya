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
- **Aktuelle Etappe:** Veröffentlichung eingeplant. Die drei Beiträge (TikTok, Instagram Reel, YouTube Short) liegen in Metricool (Marke „functionty“) und gehen am 17.11.2026 um 12:00 Uhr automatisch online, mit Video aus Commit 0dc2cf5, Thumbnail aus `strom/social/` und den Texten aus `strom/Beschreibungen_Strom.txt`.
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
- Licht (Wunsch vom 17.11.2026): Ein warmes Fokuslicht folgt immer der Stelle, auf die die Kamera gerade schaut (`setFocus()` in `modell.html`, Spot von oben und von der Kameraseite, Radius und Stärke passen sich dem Kameraabstand an, in der Outro blendet es aus). Dazu sind Windräder und Hügel etwas heller und jedes Windrad hat ein schwaches Licht am Turmfuß.
- Ton (Wunsch vom 17.11.2026): Die meisten Effekte sind jetzt echte Aufnahmen aus dem Soundza-Connector statt selbst gebauter Synth-Klänge, Liste in `strom/v4/SOUNDS.md`. Die Dateien selbst sind nicht im Repo, weil die Lizenz das Weitergeben einzelner Dateien verbietet.
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

## Rundfunkbeitrag (Diskussions-Video, Stand 17.11.2026)
Der Nutzer wollte ein Thema, unter dem viel diskutiert wird, und hat „Wohin geht dein Rundfunkbeitrag?“ gewählt. Zuerst gab es zwei 15-s-Tests: A im eigenen Diorama-Stil (`rundfunk/a/`) und B als dunkles Studio mit Münzstapeln (`rundfunk/b/`). Der Nutzer hat sich für seinen Stil entschieden.
- Fassung A2 (`rundfunk/a2/modell.html`, ca. 26 s plus Logo): neue Stadtanordnung mit Marktplatz und Brunnen, Park mit Teich vorne links, Häuser mit abgerundeten Kanten und sechs Dachformen (flach, begrünt, Sattel-, Walm-, Pult- und Tonnendach) sowie zwei runde Türme, moderne Fassadenfarben und hellere, moderne Bäume (Kugel-, Säulen- und Kegelform). Die ARD hat jetzt ein geschwungenes Funkhaus am Fuß des Fernsehturms mit Glasbändern, LED-Linien, LED-Ringen am Turm und einer Medienwand. Deutschlandradio und Medienaufsicht sind größer, das ZDF ist unverändert.
- Skript mit Diskussionsfrage am Ende: `rundfunk/Skript_Rundfunkbeitrag_26s.txt`, Stimme `rundfunk/voice25/voice.mp3` (Take 2, Pausen gekürzt, Tempo 1,1).
- Ton komplett aus dem Epidemic-Sound-Connector, Musik „Radar Focus“ (Blue Saga): `rundfunk/audio_test.py a2`, Liste in `rundfunk/SOUNDS.md`.
- Rendern: Server in `rundfunk/a2` auf Port 8772, `seq 0 120 840 | xargs -P 5 -I{} ./chunk.sh {}`, danach `./build_test.sh a2` im Ordner `rundfunk`.

- Fassung A3 (`rundfunk/a3/modell.html`, ca. 34 s plus Logo, Wünsche vom 17.11.2026): Straßen aus Asphalt mit Gehwegen, Bordsteinen und Zebrastreifen, kräftig helles Gras, ein Brief mit Rechnung („Rundfunkbeitrag (früher GEZ)“) zum Einstieg vor der ganzen Stadt, ein neues ZDF-Gebäude im Stil der ARD (kleiner, Stadionform mit Glasband und rundem Studioturm), Bimetall-Euromünzen mit Spiegelungen. Die Stimme läuft im natürlichen Tempo und nennt alle vier Beträge (`rundfunk/voice34/voice.mp3`, Skript `rundfunk/Skript_Rundfunkbeitrag_36s.txt`). Ton: `python3 audio_test.py a3`, Video: `./build_test.sh a3`.

- Cover und Texte (17.11.2026): Das erste Cover (Fernseher mit Münzschlitz, `rundfunk/cover/cover_rundfunk.html`) gefiel dem Nutzer nicht. Aus drei Varianten (`rundfunk/social/Cover_Varianten.jpg`: Fernsehturm, Sparschwein `cover_schwein.html`, Mini-Stadt) hat er den Fernsehturm gewählt: `rundfunk/cover/cover_turm.html` (Server Port 8774, `PAGE=cover_turm.html node cover.mjs out.png`). Thumbnails und Beschreibungen für TikTok, Instagram und YouTube in `rundfunk/social/`. Metricool hat der Nutzer vorerst zurückgestellt.

## Bundestag: „Was verdient ein Bundestagsabgeordneter?“ (Paket vom 17.11.2026)
Der Nutzer hat seine Arbeitsweise neu festgelegt (siehe CLAUDE.md: Claude für Recherche, Drehbuch und Prompts, Higgsfield für die Bilder, ElevenLabs Tom für die Stimme, Lieferung A bis I, 60 bis 90 Sekunden). Dazu kam ein Reichstag-Prompt. Daraus ist das Thema Abgeordnetenbezüge geworden.
- Paket A bis I: `bundestag/Paket_Was_verdient_ein_Abgeordneter.md`, Sprechertext für Tom: `bundestag/Sprechertext_Tom.txt` (etwa 83 s plus 3 s Outro).
- Stilreferenzen für Higgsfield (saubere Standbilder aus `rundfunk/a3`, ohne Schrift): `bundestag/higgsfield/`.
- Zahlen: Diät 11.833,47 € (Erhöhung 2026 auf 12.330,48 € ausgesetzt), Kostenpauschale 5.467,27 €, Mitarbeiter bis 27.396 €, Bahn frei, Altersentschädigung 2,5 % je Jahr, 630 Abgeordnete, Median Vollzeit 2025 54.066 €. www.bundestag.de ist aus dieser Umgebung nicht erreichbar, die Zahlen stammen aus Suchtreffern auf bundestag.de, Gesetzestexten und Destatis.
- Roter Faden: ein kleines rotes Licht in der Reichstagskuppel, das im Outro zum Punkt von „function.“ wird.

## Merz: „Ist Friedrich Merz Deutschlands unbeliebtester Bundeskanzler?“ (17.11.2026)
Der Nutzer hat das Bundestag-Paket abgebrochen und stattdessen dieses Thema bestellt: 35 bis 50 Sekunden, belegte Umfragewerte, kurze Erklärung, Szenen von Bundestag, Plenarsaal und Merz, dynamische Statistiken, zuerst das Drehbuch und dann ein Test.
- **Drehbuch:** `merz/Drehbuch_Merz.md` mit Faktencheck. Quellen: ARD-Deutschlandtrend Oktober 2026 (10 %, Tiefstwert seit 1997), Mai 16 %, September 13 %, November 12 %, Ipsos Januar 2026 (64 % unglaubwürdig), Destatis (BIP 2025 +0,2 %).
- **Stimme:** Tom Magic (eleven_v4), `merz/voice/take1.mp3` (41,2 s) und `take2.mp3`, natürliches Tempo.
- **Higgsfield:** Ein Referenzbild des aufgeschnittenen Reichstags mit Plenarsaal (`merz/ref/reichstag_ref.png`) hat 0,25 Credits gekostet. Danach ist das Guthaben leer.
- **Test (die ersten fünf Sätze plus Logo, etwa 16 s):**
  - Modell: `merz/test/modell.html`, gebaut aus `rundfunk/a3` mit neuer Anordnung. In der Mitte steht der aufgeschnittene Reichstag mit 630 Sitzen, Adlerwand, halber Glaskuppel und der Merz-Figur am Rednerpult, davor der Rasen mit 100 Lichtern, dahinter die Spree.
  - Roter Faden: die rote Redezeit-Lampe am Pult. Sie wird in der Outro zum Punkt im LED-Logo.
  - Ablauf: Server auf Port 8775, `seq 0 120 475 | TOTAL=476 xargs -P 4 -I{} ./chunk.sh {}`, dann `python3 audio_merz.py` und `./build_test.sh` im Ordner `merz/`.
  - Die Seite wird erzeugt mit `python3 merz/src/build_merz.py`: Grundlage ist `rundfunk/a3/modell.html`, dazu kommen die Bausteine `merz/src/merz_layout.js`, `merz_reichstag.js` und `merz_timeline.js`. Änderungen gehören in diese Bausteine.

## Nächster Schritt
Rückmeldung des Nutzers zum Merz-Test abwarten. Danach das ganze Video (etwa 47 s) mit den restlichen Szenen bauen: Schuldenbremse mit Schranke und Münzen, 64 % unglaubwürdig, +0,2 % Wirtschaft, November 12 %, Frage an die Community. Das Bundestag-Paket wurde vom Nutzer abgebrochen. Danach erzeugt der Nutzer (oder auf Wunsch Claude über die Connectoren) die Stimme mit Tom und die Higgsfield-Bilder und Clips, dann werden die Zeiten an die Stimme angepasst. Rundfunk A3 ist geliefert. Metricool-Entwürfe erst, wenn der Nutzer sie wieder möchte.
