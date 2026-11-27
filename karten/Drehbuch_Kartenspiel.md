# Diese Reihenfolge gab es noch nie: Das gemischte Kartenspiel (27.11.2026)

## Idee

Kurzes Wissensvideo (etwa 40 Sekunden) über eine Zahl, die fast niemand kennt. Wer ein Kartenspiel gut mischt, hält mit an Sicherheit grenzender Wahrscheinlichkeit eine Reihenfolge in der Hand, die es in der Geschichte noch nie gab. Der rote Faden ist wörtlich ein roter Faden, der sich durch die 52 Karten im Fächer zieht und so „die eine Reihenfolge“ zeigt.

**Gewählt: Spieltisch Noir** (Nutzer, 27.11.2026). Das ganze Video steht in `karten/noir.html` (Code `karten/src/noir.js`), Stimme Take 1 mit 40,7 s, Länge 44,1 s mit Outro.

Stiltest mit drei modernen Looks (Seite `karten/test.html?s=1|2|3`, Code `karten/src/`):

1. **Spieltisch Noir:** dunkler Club-Raum mit smaragdgrünem Filz, Lederpolster, Nussbaum-Rand, Chips, Kartenschachtel, Whisky-Glas, Pendelleuchte mit Lichtkegel und Staub, Lamellenwand mit Fallblatt-Tafel und beleuchtetem Flaschenregal. Tiefenschärfe, Bloom und Körnung.
2. **Glas und Neon:** Studio wie eine Tech-Keynote mit spiegelndem Boden und Raster, schwarzen Glaskarten mit leuchtendem Aufdruck, Bühnenscheibe mit Skala, rotierendem Ziffernring, HUD-Beschriftungen, Hologramm-Tafel mit Projektor, Lichtsäulen und Sternenstaub.
3. **Kartenstadt:** helle Tilt-Shift-Miniatur. Das Kartenspiel liegt riesig auf einem runden Platz, ringsum stehen winzige Leute, auf dem Ring fahren Autos, dazu Kartenhäuser als Wahrzeichen, moderne Häuser mit Dachgärten, Solaranlagen und Wassertanks, Bäume, Laternen, Bänke und eine Fallblatt-Tafel wie am Bahnhof.

## A. Drei Hook-Varianten

1. „Diese Reihenfolge gab es noch nie.“ (Text im Bild, dazu der Sprechertext unten)
2. „Wenn du ein Kartenspiel mischst, machst du wahrscheinlich gerade Geschichte.“
3. „Es gibt mehr Arten, ein Kartenspiel zu mischen, als Atome auf der Erde.“

## B. Beste Hook: Variante 1

Der Satz ist kurz, klingt unglaublich und lässt sich sofort überprüfen, weil jeder schon einmal Karten gemischt hat. Das Bild zeigt im selben Moment, wie das Spiel gemischt wird, sodass Text, Stimme und Bewegung zusammenpassen.

## C. Drehbuch (Zeiten im fertigen Video)

| Zeit | Bild | Was passiert |
|---|---|---|
| 0–4 s | Mischen in Nahaufnahme | Das Spiel wird geteilt, die Hälften kippen hoch, und die Karten fallen abwechselnd ineinander. Danach schieben sich die Hälften zusammen, und das Spiel wölbt sich kurz zur Brücke. Titel „Diese Reihenfolge gab es noch nie.“ |
| 4–9 s | Umdrehen, Fächer, roter Faden | Das Spiel dreht sich mit der Bildseite nach oben, fächert sich zu einer Rosette auf, und ein roter Faden läuft durch alle 52 Eckzeichen. Große Zahl „52“. |
| 9–15 s | Fallblatt-Tafel | Die Kamera fährt zur Tafel an der Wand, 68 Ziffern rattern, bis 52! dasteht. Große Zahl „8 × 10⁶⁷“. |
| 15–20 s | Globus | Ein alter Tischglobus links auf dem Tisch dreht sich mit Europa und Afrika nach vorn, auf dem Messingschild steht „Erde · rund 10⁵⁰ Atome“. Große Zahl „600 Billiarden“. |
| 20–30 s | Tafel: Gedankenexperiment | Die Tafel blättert um auf „GEMISCHT:“ und zählt bis etwa 3,6 × 10²⁷ hoch. Darunter klappt „DOPPELT: 0“ auf. Große Zahlen „8 Mrd.“ und „0“. |
| 30–37 s | Zweites Spiel mit Mischzähler | Rechts auf dem Tisch wird ein zweites Spiel siebenmal gemischt, ein kleiner Fallblatt-Zähler zählt 0 bis 7. Große Zahl „7-mal“. |
| 37–41 s | Ganze Szene | Die Kamera zeigt den ganzen Tisch mit allen Stationen und der Tafel. Titel „Wie oft mischst du?“ |
| 41–44 s | Outro | Schlichte 2D-Outro: Das Bild wird dunkler, „function“ erscheint Buchstabe für Buchstabe, der rote Punkt ploppt auf. |

## D. Sprechertext für Tom (eleven_v4, Audio-Tags, erzeugt am 27.11.2026, Take 1 gewählt)

```
[curious] Wenn du ein Kartenspiel richtig gut mischst, hältst du ziemlich sicher eine Reihenfolge in der Hand, die es noch nie gegeben hat. [short pause]

[explaining] Zweiundfünfzig Karten lassen sich auf so viele Arten hintereinanderlegen, dass man ungefähr eine Acht mit siebenundsechzig Nullen schreiben müsste. Das sind rund sechshundert Billiarden Mal mehr Möglichkeiten, als die ganze Erde Atome hat. [short pause]

Stell dir vor, acht Milliarden Menschen hätten seit dem Urknall jede Sekunde ein Kartenspiel gemischt. Selbst dann wäre mit großer Sicherheit noch keine Reihenfolge doppelt vorgekommen. [short pause]

Das gilt aber nur, wenn du gut mischst. Mathematiker haben ausgerechnet, dass man ein Kartenspiel dafür etwa siebenmal mischen muss.

[curious] Wie oft mischst du? [short pause] [warm] Schreib's in die Kommentare.
```

Dateien: `karten/voice/take1.mp3` (40,7 s, gewählt, = `voice.mp3`), `take2.mp3` (41,4 s), Wortzeiten in `voice/words.json`.

## E. Szenenplan (Technik)

Three.js mit dem gemeinsamen Kern `karten/src/core.js` (52 gezeichnete Karten, Mischen ohne Durchdringung, Brücke, Umdrehen als fester Block, Rosetten-Fächer, roter Faden als Röhre durch die Eckzeichen). Die Szene `src/noir.js` baut den Club-Raum aus dem Stiltest weiter aus: Globus mit gezeichneten Kontinenten, Messing-Meridian und Schild, zweites Spiel mit Mischzähler auf Messingfüßen, Fallblatt-Tafel mit zwei Inhalten und eigener Beschriftung, Fokuslicht, das der gezeigten Station folgt, Tiefenschärfe je Station und die schlichte 2D-Outro. Prüfungen: `node karten/check_noir.mjs` (Kollision aller Karten mit den Gegenständen, Ergebnis 0 Treffer), Prüfbilder mit `node kit/sample.mjs karten/noir.html <ordner> 0.3`.

## F. Higgsfield-Prompts

Wird nicht gebraucht, alles ist in Three.js gebaut. Falls doch ein Referenzbild nötig wird: „Cinematic macro shot of a riffle shuffle of a modern playing card deck on emerald green felt, warm pendant light, shallow depth of field, dust in the light beam, dark club interior with blurred bottle shelves.“

## G. Animations- und Kameraanweisungen

Die Kamera bleibt beim Mischen tief und nah, steigt beim Umdrehen auf und schaut von schräg oben auf den Fächer. Danach fährt sie ruhig zur Tafel, zum Globus, zurück zur Tafel, zum zweiten Spiel und am Ende auf den ganzen Tisch. Jede Bewegung hat weiche Ein- und Ausfahrten, und nichts springt mitten in einer Bewegung um.

## H. Übergänge und Sounddesign

Musik „Radar Focus“. Dazu kommen echte Kartengeräusche aus dem Epidemic-Connector: Riffle-Mischen genau während des Mischens (auch siebenmal am zweiten Spiel), ein leises Klopfen beim Zusammenschieben und Landen, ein Wischen beim Auffächern und das Rattern der Fallblatt-Tafel, das leise unter der Stimme liegt. Die fünf Kamerafahrten bekommen die Whooshes des Nutzers, der Mischzähler klickt nur bei der Sieben. Mischung in `audio_karten.py`, Liste in `SOUNDS.md`.

## I. TikTok-Titel, Beschreibung und Hashtags

Alle Texte je Kanal stehen in `social/Texte.md`, das Thumbnail (Galerie A, Knetmotiv mit Kartenfächer und rotem Faden) in `social/Thumbnail_Kartenspiel_9x16.png`.

## Faktencheck (Stand 27.11.2026)

- 52! = 80.658.175.170.943.878.571.660.636.856.403.766.975.289.505.440.883.277.824.000.000.000.000. Das sind 68 Stellen, also rund 8,07 × 10⁶⁷ (eigene Berechnung).
- Die Erde besteht aus etwa 1,33 × 10⁵⁰ Atomen. Das ist eine Schätzung aus Erdmasse und Zusammensetzung (Jefferson Lab, Science Education: „How many atoms make up the Earth?“). 52! ist also rund 600 Billiarden Mal größer.
- Gedankenexperiment: 8,2 Milliarden Menschen mischen 13,8 Milliarden Jahre lang jede Sekunde. Das ergibt etwa 3,6 × 10²⁷ gemischte Spiele. Die Wahrscheinlichkeit, dass dabei irgendeine Reihenfolge doppelt vorkommt, liegt nach dem Geburtstagsproblem bei etwa 8 × 10⁻¹⁴ (eigene Rechnung; Alter des Universums 13,8 Milliarden Jahre nach Planck 2018, Weltbevölkerung nach UN World Population Prospects 2024).
- Siebenmal mischen: Nach Bayer und Diaconis braucht ein Spiel mit 52 Karten etwa sieben Riffle-Mischungen, bis die Reihenfolge praktisch zufällig ist (D. Bayer, P. Diaconis: „Trailing the Dovetail Shuffle to its Lair“, Annals of Applied Probability 2(2), 1992, S. 294–313).
- Einschränkung fürs Video: Ein frisch ausgepacktes Spiel liegt sortiert, und einmal kurz gemischt ist es noch nicht zufällig. Die Aussage „noch nie gegeben“ gilt für ein gut gemischtes Spiel, deshalb steht der Hinweis „wenn du gut mischst“ im Text.
