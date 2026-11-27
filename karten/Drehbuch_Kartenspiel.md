# Diese Reihenfolge gab es noch nie: Das gemischte Kartenspiel (Entwurf vom 27.11.2026)

## Idee

Kurzes Wissensvideo (etwa 40 Sekunden) über eine Zahl, die fast niemand kennt. Wer ein Kartenspiel gut mischt, hält mit an Sicherheit grenzender Wahrscheinlichkeit eine Reihenfolge in der Hand, die es in der Geschichte noch nie gab. Der rote Faden ist wörtlich ein roter Faden, der sich durch die 52 Karten im Fächer zieht und so „die eine Reihenfolge“ zeigt.

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

## C. Drehbuch

| Zeit (ca.) | Bild | Was passiert |
|---|---|---|
| 0–4 s | Mischen in Nahaufnahme | Das Spiel wird geteilt, die Hälften kippen hoch, und die Karten fallen abwechselnd ineinander (Riffle). Danach schieben sich die Hälften zusammen, und das Spiel wölbt sich kurz zur „Brücke“. |
| 4–7 s | Umdrehen und Fächer | Das Spiel dreht sich mit der Bildseite nach oben und fächert sich zu einer Rosette auf, in der alle 52 Karten zu sehen sind. Große Zahl „52“. |
| 7–8 s | Roter Faden | Ein roter Faden läuft von Karte zu Karte durch alle Ecken und zeigt die eine Reihenfolge. |
| 8–12 s | Fallblatt-Tafel | Auf einer Tafel rattern 68 Ziffern, bis die ganze Zahl 52! dasteht. Große Zahl „8 × 10⁶⁷“. |
| 12–24 s | Vergleiche | Atome der Erde (etwa 10⁵⁰) gegen 8 × 10⁶⁷, danach acht Milliarden Menschen, die seit dem Urknall jede Sekunde mischen. |
| 24–33 s | Siebenmal mischen | Ein Zähler 1 bis 7 über dem Spiel: Erst nach etwa sieben Riffle-Mischungen ist die Reihenfolge wirklich zufällig. |
| 33–38 s | Ganze Szene | Die Kamera zeigt alles, dazu die Frage an die Zuschauer. |
| 38–41 s | Outro | Schlichte 2D-Outro mit dem roten Logo. |

## D. Sprechertext für Tom (eleven_v4, Audio-Tags)

```
[curious] Wenn du ein Kartenspiel richtig gut mischst, hältst du ziemlich sicher eine Reihenfolge in der Hand, die es noch nie gegeben hat. [short pause]

[explaining] Zweiundfünfzig Karten lassen sich auf so viele Arten hintereinanderlegen, dass die Zahl achtundsechzig Stellen hat. Das sind mehr Möglichkeiten, als es Atome auf der Erde gibt.

Stell dir vor, alle acht Milliarden Menschen hätten seit dem Urknall jede Sekunde ein Kartenspiel gemischt. Selbst dann wäre wahrscheinlich keine Reihenfolge zweimal vorgekommen.

Aber das gilt nur, wenn du gut mischst. Mathematiker haben ausgerechnet, dass man ein Kartenspiel dafür etwa siebenmal mischen muss.

[curious] Wie oft mischst du? [short pause] [warm] Schreib's in die Kommentare.
```

(etwa 95 Wörter, rund 40 Sekunden)

## E. Szenenplan (Technik)

Three.js mit gemeinsamem Kern `karten/src/core.js`: 52 gezeichnete Karten (Eckzeichen, Bildanordnung der Zahlenkarten, eigene moderne Bildkarten, Pik-Ass mit „52!“), Mischen ohne Durchdringung (die Hälften reiten auf dem wachsenden Stapel, jede Karte hat ihre eigene Höhe), Brücke, Umdrehen als fester Block, Rosetten-Fächer, roter Faden als Röhre durch die Kartenecken, Fallblatt-Tafel als gezeichnete Textur. Die Looks stehen in `s1.js`, `s2.js` und `s3.js`. Vor dem Rendern laufen Kontaktbögen und eine Kollisionsprüfung.

## F. Higgsfield-Prompts

Wird nicht gebraucht, alles ist in Three.js gebaut. Falls doch ein Referenzbild nötig wird: „Cinematic macro shot of a riffle shuffle of a modern playing card deck on emerald green felt, warm pendant light, shallow depth of field, dust in the light beam, dark club interior with blurred bottle shelves.“

## G. Animations- und Kameraanweisungen

Die Kamera bleibt beim Mischen tief und nah, steigt beim Umdrehen auf und schaut von schräg oben auf den Fächer. Danach fährt sie ruhig zur Tafel und am Ende zurück auf die ganze Szene. Jede Bewegung hat weiche Ein- und Ausfahrten, und nichts springt mitten in einer Bewegung um.

## H. Übergänge und Sounddesign

Musik „Radar Focus“. Dazu kommt ein echtes Riffle-Geräusch aus dem Epidemic-Connector (Kartenrattern) genau während des Mischens, ein leises Klopfen beim Zusammenschieben, ein Wischen beim Auffächern und das Rattern der Fallblatt-Tafel, das leise unter der Stimme liegt. Für die Kamerafahrten nehmen wir die Whooshes des Nutzers. Die Liste kommt in `SOUNDS.md`, sobald der Look feststeht.

## I. TikTok-Titel, Beschreibung und Hashtags

Folgt nach der Stilwahl in `social/Texte.md`.

## Faktencheck (Stand 27.11.2026)

- 52! = 80.658.175.170.943.878.571.660.636.856.403.766.975.289.505.440.883.277.824.000.000.000.000. Das sind 68 Stellen, also rund 8,07 × 10⁶⁷ (eigene Berechnung).
- Die Erde besteht aus etwa 1,33 × 10⁵⁰ Atomen. Das ist eine Schätzung aus Erdmasse und Zusammensetzung (Jefferson Lab, Science Education: „How many atoms make up the Earth?“). 52! ist also rund 600 Billiarden Mal größer.
- Gedankenexperiment: 8,2 Milliarden Menschen mischen 13,8 Milliarden Jahre lang jede Sekunde. Das ergibt etwa 3,6 × 10²⁷ gemischte Spiele. Die Wahrscheinlichkeit, dass dabei irgendeine Reihenfolge doppelt vorkommt, liegt nach dem Geburtstagsproblem bei etwa 8 × 10⁻¹⁴ (eigene Rechnung; Alter des Universums 13,8 Milliarden Jahre nach Planck 2018, Weltbevölkerung nach UN World Population Prospects 2024).
- Siebenmal mischen: Nach Bayer und Diaconis braucht ein Spiel mit 52 Karten etwa sieben Riffle-Mischungen, bis die Reihenfolge praktisch zufällig ist (D. Bayer, P. Diaconis: „Trailing the Dovetail Shuffle to its Lair“, Annals of Applied Probability 2(2), 1992, S. 294–313).
- Einschränkung fürs Video: Ein frisch ausgepacktes Spiel liegt sortiert, und einmal kurz gemischt ist es noch nicht zufällig. Die Aussage „noch nie gegeben“ gilt für ein gut gemischtes Spiel, deshalb steht der Hinweis „wenn du gut mischst“ im Text.
