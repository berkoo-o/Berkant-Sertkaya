# function. – „Wem gehört eigentlich Deutschland?“ (Knete-Fassung)

Stand: 21.11.2026 · Länge 76,5 Sekunden (Stimme 73,2 s, danach rund 3 s Logo) · 9:16 · Stimme: Tom Magic (ElevenLabs, eleven_v4, Take 1 in `voice/knete/voice.mp3`) · Szene `knete.html` mit Code in `src/knete.js` · gerendert auf dem PC des Nutzers (`knete.render.json`)

## Warum neu

Die Stadt-Fassung war für den Nutzer unverständlich, und sie hatte zu viele Animationsfehler. Deshalb erzählt die Neufassung alles mit einem einzigen, einfachen Bild. Zehn Knetfiguren stehen in einer Reihe, und jede steht für ein Zehntel der Haushalte, von arm (1) nach reich (10). Hundert Münzen sind alles, was die Haushalte besitzen. Die reichste Figur ist rot und trägt einen Zylinder, sie ist der rote Faden. Hinter dem Platz steht eine kleine Knetestadt (Fabrik, Börse, Mietshäuser, Villa), die zeigt, worin das Vermögen steckt. Den Look (Stil 6, Knete) hat der Nutzer am 21.11.2026 gewählt.

Alle Flugbahnen der Münzen sind so geplant, dass sich nichts berührt. Die Prüfung `CHECK()` in `knete.html` testet für jedes Bild, ob sich Münzen in der Luft berühren, durch Figuren oder Stapel fliegen oder ob ein Stapel Lücken hat. `CHECK_LABELS()` testet, ob ein Schild aus dem Bild ragt oder in die Untertitel rutscht. Beide melden 0 Fehler.

## A. Drei Hook-Varianten

1. „Die reichsten zehn Prozent besitzen mehr als die Hälfte von allem, was den Haushalten in Deutschland gehört. Und die ärmere Hälfte? Zusammen nur zwei bis drei Prozent.“
2. „Ab rund 780.000 Euro Vermögen gehörst du zu den reichsten zehn Prozent. Die Hälfte der Haushalte hat nicht mal 103.000.“
3. „Stell dir vor, hundert Münzen sind alles, was Deutschland besitzt. Eine einzige von zehn Figuren bekommt mehr als die Hälfte.“

## B. Beste Hook: Variante 1

Der Gegensatz von „mehr als die Hälfte“ und „zwei bis drei Prozent“ ist in vier Sekunden gesagt, und im Bild passiert genau das gleichzeitig: 54 Münzen fliegen zur roten Figur, und die Zahl oben zählt mit. Jeder fragt sich sofort, auf welcher Seite er steht. Diese Frage beantwortet das Video mit den beiden Schildern 103.000 € und 780.000 €, und am Ende soll jeder seine Figurnummer kommentieren.

## C. Drehbuch

| Zeit | Sprechertext | Bild und Animation | Einblendung |
|---|---|---|---|
| 0:00–0:10 | „Die reichsten zehn Prozent besitzen mehr als die Hälfte von allem, was den Haushalten in Deutschland gehört. Und die ärmere Hälfte? Zusammen nur zwei bis drei Prozent.“ | Das ganze Knetemodell, die Kamera fährt an die Reihe heran. Die rote Figur hüpft kurz, dann fliegen 54 Münzen nacheinander zu ihrem Stapel, danach 43 Münzen zu den Figuren 6 bis 9. Bei „ärmere Hälfte“ wird es auf der rechten Seite dunkler, das Licht bleibt auf den Figuren 1 bis 5, und eine Klammer erscheint. Drei einzelne Münzen landen bei den Figuren 3, 4 und 5. | Titel, dann **54 %** (zählt mit), Schild „Reichste 10 %“, Klammer „Ärmere Hälfte“, **2–3 %** |
| 0:10–0:19 | „Stell dir vor, hundert Münzen sind alles, was die Haushalte in Deutschland besitzen. Jede Figur steht für ein Zehntel der Haushalte, von arm bis reich.“ | Alle Münzen leuchten einmal auf. Vor den Figuren erscheinen nacheinander die Nummernscheiben 1 bis 10. | „100 Münzen = alles, was Haushalte besitzen“, „1 Figur = 10 % der Haushalte“, Schilder „arm“ und „reich“ |
| 0:19–0:29 | „Die rote Figur, also die reichsten zehn Prozent, hat vierundfünfzig Münzen. Rechnet man die Superreichen dazu, die bei Umfragen kaum mitmachen, sind es sogar rund sechzig.“ | Die Kamera fährt zur roten Figur. Bei „Superreichen“ erscheinen über dem Stapel sechs leere, durchscheinende Plätze. Bei „rund sechzig“ hüpfen sechs Münzen von den Stapeln 6 bis 9 hinüber und füllen sie. | „54 Münzen“, dann **≈ 60 %** und „60 Münzen“ |
| 0:29–0:33 | „Ihr Vermögen steckt vor allem in Firmen, Mietshäusern und Aktien.“ | Blick über die Knetestadt. Auf Fabrik, Mietshäusern und Börse (mit grüner Kurstafel) ploppen rote Fähnchen auf, Wort für Wort. | „Firmen“, „Mietshäuser“, „Aktien“ |
| 0:33–0:43 | „Aber ab wann gehört man eigentlich dazu? Ab rund siebenhundertachtzigtausend Euro Vermögen pro Haushalt. Also Haus, Erspartes und Aktien zusammengerechnet, minus Schulden.“ | Zwischen Figur 9 und 10 steht ein Schild „780.000 €“, eine gestrichelte Linie zieht die Grenze. Vorne ploppen nacheinander ein Häuschen, ein Sparschwein, eine Aktienkurve und ein grauer Block „− Kredit“ auf. | **780.000 €**, „Haus + Erspartes + Aktien − Schulden“ |
| 0:43–0:47 | „Die Hälfte der Haushalte hat dagegen weniger als hundertdreitausend Euro.“ | Zwischen Figur 5 und 6 steht das Schild „103.000 €“ mit Linie. | **< 103.000 €** (Median) |
| 0:47–0:57 | „Ein großer Grund: Mehr als die Hälfte wohnt zur Miete, so viele wie in keinem anderen Land der EU. Und die Miete fließt jeden Monat an die, denen die Häuser gehören.“ | Über den Figuren 1 bis 6 steht die Klammer „Wohnen zur Miete“, dahinter die Mietshäuser mit roten Fähnchen. Dann hüpft über jedem Mieter eine Münze hoch und fliegt zur roten Figur. | **58 %**, „Die Miete fließt zu den Eigentümern“ |
| 0:57–1:09 | „Dazu wird viel Vermögen nicht verdient, sondern vererbt. Allein zweitausendvierundzwanzig wurden über hundertdreizehn Milliarden Euro vererbt und verschenkt. Und das ist nur der Teil, den das Finanzamt erfasst.“ | Ein Stapel aus acht Münzen mit roter Schleife schwebt von oben auf den roten Stapel. | „Verdient oder vererbt?“, „Erbe“, **113 Mrd. €** |
| 1:09–1:13 | „Und du? Welche Figur bist du? Schreib deine Nummer in die Kommentare.“ | Die ganze Reihe mit beiden Schildern, die Nummernscheiben leuchten nacheinander auf. | „Welche Figur bist du?“ |
| 1:13–1:16 | (Outro) | Das Bild wird dunkel, das rote „function.“ erscheint mittig (Platzhalter, siehe Outro-Ideen). | Logo |

## D. Sprechertext für Tom (eleven_v4, Audio-Tags)

```
[curious] Die reichsten zehn Prozent besitzen mehr als die Hälfte von allem, was den Haushalten in Deutschland gehört. [short pause] Und die ärmere Hälfte? [short pause] Zusammen nur zwei bis drei Prozent.

[explaining] Stell dir vor, hundert Münzen sind alles, was die Haushalte in Deutschland besitzen. Jede Figur steht für ein Zehntel der Haushalte, von arm bis reich. Die rote Figur, also die reichsten zehn Prozent, hat vierundfünfzig Münzen. Rechnet man die Superreichen dazu, die bei Umfragen kaum mitmachen, sind es sogar rund sechzig. Ihr Vermögen steckt vor allem in Firmen, Mietshäusern und Aktien.

[curious] Aber ab wann gehört man eigentlich dazu? [short pause] [explaining] Ab rund siebenhundertachtzigtausend Euro Vermögen pro Haushalt. Also Haus, Erspartes und Aktien zusammengerechnet, minus Schulden.

[matter-of-fact] Die Hälfte der Haushalte hat dagegen weniger als hundertdreitausend Euro. Ein großer Grund: Mehr als die Hälfte wohnt zur Miete, so viele wie in keinem anderen Land der EU. Und die Miete fließt jeden Monat an die, denen die Häuser gehören.

[serious] Dazu wird viel Vermögen nicht verdient, sondern vererbt. Allein zweitausendvierundzwanzig wurden über hundertdreizehn Milliarden Euro vererbt und verschenkt. [short pause] Und das ist nur der Teil, den das Finanzamt erfasst.

[curious] Und du? Welche Figur bist du? [short pause] [warm] Schreib deine Nummer in die Kommentare.
```

## Outro-Ideen (zur Auswahl)

1. **Die rote Figur wird zum Punkt:** Die Kamera fährt zurück, die rote Knetfigur wird wie Knete zu einer Kugel zusammengedrückt, rollt nach vorne und rastet als Punkt hinter dem Schriftzug „function“ ein, der aus roten Knetwürsten entsteht.
2. **Der Zylinder fällt:** Der schwarze Zylinder der roten Figur fliegt hoch, dreht sich und landet als Punkt hinter „function“, das sich wie gestempelt in den Knetboden drückt.
3. **Die Münzen legen das Logo:** Alle Münzen rollen von den Stapeln und legen sich zum Schriftzug „function“, die rote Schleife vom Erbe-Stapel wird zum Punkt.
4. **Schlicht (jetzt eingebaut):** Das Bild wird dunkel, und das rote „function.“ erscheint zwei Sekunden lang mittig, wie beim 2027-Video.

## E. Szenenplan (Technik)

| Zeit | Kamera | Licht | Übergang |
|---|---|---|---|
| 0:00–0:06 | ganzes Modell, in 1,7 s an die Reihe heran, dann ruhig | warmes Hauptlicht von links vorne, violettes Gegenlicht, Fokuslicht folgt dem Kamerazentrum | Münzen fliegen in festen Bögen, die letzten 25 % jeder Bahn gehen senkrecht nach unten |
| 0:06–0:10 | nah an die Figuren 1 bis 5 | rechte Seite etwa ein Drittel dunkler | weiche Fahrt |
| 0:10–0:19 | ganze Reihe mit Nummern | Münzen leuchten kurz | Nummern ploppen auf |
| 0:19–0:29 | an der roten Figur, der Stapel ganz im Bild | – | Münzen hüpfen in die leeren Plätze |
| 0:29–0:33 | flach über die Stadt | – | Fähnchen ploppen |
| 0:33–0:47 | Grenze 9/10, dann vorne an den Gegenständen, dann Grenze 5/6 | – | Schilder ploppen auf, Linie wird gezeichnet |
| 0:47–0:57 | Mieter mit Stadt, dann ganze Reihe | – | Münzen fliegen von den Mietern zum roten Stapel |
| 0:57–1:09 | oben am roten Stapel | – | der Erbe-Stapel senkt sich ab |
| 1:09–1:16 | ganze Reihe, langsam zurück | Nummern leuchten nacheinander | Logo |

Jede Einstellung wird mit `fit()` aus einem Kasten im Modell berechnet, damit das Wichtige immer zwischen Titel (oben) und Untertitel (unten) liegt.

## F. Higgsfield-Prompts

Das Video ist komplett in 3D gebaut und braucht Higgsfield nicht. Für eine spätere KI-Fassung oder B-Roll: Stilblock vor jeden Prompt setzen.

Stilblock: *Claymation miniature, soft matte plasticine with fingerprints, pastel colours, a compact clay town on a thick purple clay plate floating in a dark violet room, ten small clay figures in a row on a cream plaza, golden clay coins with a pressed euro sign, the richest figure is red with a black top hat, small red flags only on what the richest own, soft warm key light from the front left, violet rim light, vertical 9:16, no text.*

1. **Hook – Start:** the whole clay model with 100 coins lying in a grid behind the ten figures. **Bewegung:** the camera moves in to the row, 54 coins fly one after another onto a stack next to the red figure.
2. **Ärmere Hälfte – Start:** close on figures 1 to 5, almost no coins. **Bewegung:** three single coins hop to figures 3, 4 and 5, the right side gets darker.
3. **Superreiche – Start:** the tall golden stack next to the red figure with six translucent empty slots on top. **Bewegung:** six coins hop over from the neighbouring stacks and fill the slots.
4. **Stadt – Start:** the clay town behind the plaza. **Bewegung:** red flags pop up on the factory, the apartment blocks and the stock exchange.
5. **Grenze – Start:** a white clay sign „780.000 €“ between figure 9 and the red figure. **Bewegung:** a small house, a piggy bank, a share chart and a grey block pop up in front.
6. **Miete – Start:** figures 1 to 6 with the apartment blocks behind. **Bewegung:** a coin hops up above each figure and flies to the red stack.
7. **Erbe – Start:** the top of the red stack. **Bewegung:** a stack of coins tied with a red ribbon comes down onto it.

## G. Animations- und Kameraanweisungen

- Eine durchgehende Kamerafahrt mit weicher, monotoner Interpolation, keine Schnitte.
- Münzen fliegen mit gleichmäßiger Geschwindigkeit, die weitesten zuerst, damit keine Münze eine andere einholt. Vor der Landung liegen sie flach und fallen senkrecht auf ihren Platz.
- Nichts ploppt ohne Grund: Gegenstände erscheinen mit kurzem Federn genau auf dem gesprochenen Wort und verschwinden erst, wenn die Kamera weiterfährt.
- Licht dort, wo wir gerade sind: Ein Fokuslicht folgt dem Kamerazentrum.

## H. Übergänge und Sounddesign

Musik „Radar Focus“ (Blue Saga, Epidemic Sound) wie gewohnt, Sub-Bass abgesenkt, 22 dB unter der Stimme im Bereich über 250 Hz, sanftes Ducking. Effekte nur an Schlüsselstellen: ein Pop beim Hüpfen der roten Figur, zweimal Münzstapel-Klimpern beim großen Münzstrom, leiser für die mittleren Stapel, drei einzelne Münzen für die ärmere Hälfte, ein Schimmer beim Aufleuchten der Münzen und der leeren Plätze, Klicks bei den großen Zahlen, Pops für Fähnchen und Gegenstände, ein Holzklopfen bei den Schildern, ein dumpfes Klopfen beim Kredit-Block, Münzen beim Mietfluss, ein warmer Glockenton beim Erbe-Stapel und die gelieferten Swooshes bei den Kamerafahrten. Gemischt mit `python3 audio_knete.py`, Lautheit −15 LUFS, Spitzen −1,5 dBTP. IDs in `SOUNDS.md`.

## I. TikTok-Titel, Beschreibung und Hashtags

Titel: „Wem gehört eigentlich Deutschland? 🪙“

Beschreibung: „Stell dir vor, 100 Münzen sind alles, was die Haushalte in Deutschland besitzen. Die reichsten zehn Prozent haben 54 davon, mit den Superreichen sogar rund 60. Die ärmere Hälfte zusammen nur zwei bis drei. Welche Figur bist du? Schreib deine Nummer in die Kommentare! 👇“

Hashtags (höchstens fünf): #function #vermögen #geld #deutschland #wissen

## Faktencheck

Unverändert gegenüber `Drehbuch_Vermoegen.md` (Bundesbank-Vermögensbefragung 2023: 54 %, ärmere Hälfte 2–3 %, Median 103.200 €; Distributional Wealth Accounts: rund 60 %; IW Köln: ab 777.200 €; Zensus 2022: 58 % Mieter, niedrigste Eigentumsquote der EU; Destatis: 113,2 Mrd. € vererbt und verschenkt 2024). Die Verteilung der 100 Münzen auf die Zehntel (0, 0, 1, 1, 1, 5, 8, 12, 18, 54) ist vereinfacht und folgt der Bundesbank-Größenordnung, deshalb steht „Modell vereinfacht“ in der Quellenzeile.
