# function. – „Was wäre, wenn alle gleichzeitig ihr Geld abheben?“

Stand: 20.11.2026 · **gekürzte Fassung: Länge 71,3 Sekunden** (Wunsch des Nutzers: „das Video geht zu lange“; „Deutschland 1931“ und „Und einfach mehr Geld drucken?“ gestrichen, Stimme Take 2 an zwei stillen Stellen geschnitten, 0,17 s Atempause eingefügt) · vorher 89,2 Sekunden (Stimme Take 2, 85,5 s ab 0,15 s, danach 3,4 s Outro) · ursprünglich geplante Länge: etwa 87 Sekunden (Stimme etwa 84 s bei 227 Wörtern, danach rund 3 s Outro) · 9:16 · Stimme: Tom Magic (ElevenLabs, eleven_v4)
Zwei Fassungen mit identischem Ablauf, Text und Ton: **Stil 1 Tilt-Shift-Miniatur** und **Stil 2 isometrische Spielbrett-Welt** (Stiltest: `bankrun/Stiltest_Vergleich.jpg`). Gerendert wird auf dem PC des Nutzers mit `render-pc.mjs` (Doppelklick auf „function. rendern“).

## Look

Umsetzung: `bankrun/modell.html` mit Code in `bankrun/src/` (`town.js` Stadt und Bank, `people.js` Figuren und ihre Wege, `main.js` Ablauf, Kamera, Licht, Texte). Die Häuserreihe vor der Bank wurde beim Bauen durch einen niedrigen Park mit Brunnen ersetzt, damit die Kamera bei den Nahaufnahmen freie Sicht auf die Automaten hat. Die Geldbündel fliegen deshalb in Häuser hinter der Bank. Für „Geld drucken“ kreist die Kamera einmal um die Bank und schaut von hinten in den Hof. Der Turm besteht aus echten Geldbündeln statt aus Glas, weil gläserne Bündel im Überblick kaum zu sehen waren. `window.CHECK()` prüft das ganze Video auf Figuren, die sich zu nahe kommen oder durch Gebäude laufen, und auf Bündel, die durch Häuser fliegen.

Eine einzige kleine Stadt, in der Mitte eine Bank mit Säulen und dem Schild „BANK“, rechts an der Fassade drei Geldautomaten, davor der Gehweg mit der Schlange, eine Straße mit Autos auf geschlossenen Runden, Bäume, Laternen und Häuser in gedeckten, unterschiedlichen Farben. Stil 1 wirkt wie eine von oben fotografierte Modellstadt mit unscharfem oberen und unteren Bildrand und warmem Sonnenlicht, Stil 2 wie ein Spielbrett in Pastell auf einer dicken Platte vor dunklem Hintergrund, ohne Fluchtpunkt. Die Kamera fährt in beiden Stilen ruhig und ohne Schnitt, die Stelle, um die es geht, ist immer am hellsten.

Der rote Faden ist das Display des vordersten Geldautomaten: Es springt als erstes auf Rot und „LEER“, bleibt die ganze Zeit rot und wird in der Outro zum Punkt im Logo. Kräftiges Rot gibt es sonst nirgends.

Text wie gewohnt: Titel oben links in Inter Tight, bei Zahlen ersetzt durch die große Zahl mit weißer Erklärzeile, Untertitel als weiße Zeile unter dem Modell, winzige Quellenzeile mit „Modell vereinfacht“ und das rote „function.“ unten links.

## Kürzung (20.11.2026)

Das Video war dem Nutzer mit 89 Sekunden zu lang. Gestrichen wurden die beiden Abschnitte, die am wenigsten zur Geschichte beitragen: „Deutschland 1931“ (das dritte historische Beispiel in Folge, Griechenland zeigt dasselbe) und „Und einfach mehr Geld drucken?“ (eine Nebenfrage direkt vor der wichtigsten Info für den Zuschauer). Die Geschichte läuft jetzt in einem Zug: kaum Bargeld, Automaten leer, der Staat schließt die Banken, dein Geld ist trotzdem geschützt, Panik allein reicht. Toms Stimme ist dieselbe Aufnahme, geschnitten wird zwischen „… 60 Euro am Tag.“ und „Verloren wäre dein Geld trotzdem nicht.“ (Aufnahmezeit 44,90 s bis 62,94 s, beides Stille), nichts ist beschleunigt. Im Code bleiben alle Zeiten Aufnahmezeiten; `src/main.js` (`CUT_A`, `CUT_B`, `ot()`, `nt()`) und `audio.py` (`T()`) lassen den Abschnitt aus. Die Kamera fährt vom „60 €“-Automaten ohne Schnitt zurück auf die Bankfront, während Schranke und Rollladen aufgehen und die Glashaube herunterkommt, dabei wird es Abend. Die beiden gestrichenen Fakten stehen als vorbereitete Antworten für die Kommentare in `social/Beschreibungen_Bankrun.txt`. Die Tabellen unten zeigen noch den vollständigen Ablauf; gestrichene Zeilen sind markiert.

## A. Drei Hook-Varianten

1. „Von 100 Euro auf deutschen Konten haben die Banken nicht mal einen Euro als Bargeld da.“
2. „Wenn morgen alle ihr Geld abheben wollen, sind die ersten Geldautomaten nach wenigen Stunden leer.“
3. „Alle Euro-Scheine der Welt reichen nicht, um das Geld auszuzahlen, das allein auf deutschen Konten liegt.“

## B. Beste Hook: Variante 1

Der Satz ist in zwei Sekunden gesagt, betrifft jeden mit einem Konto und klingt im ersten Moment unglaublich, deshalb bleibt man hängen. Er stellt sofort die Frage, die das Video beantwortet, und die Zahl ist belegt (rund 20 Mrd. € Bargeld bei über 4.000 Mrd. € Einlagen, also weniger als 50 Cent pro 100 Euro). Variante 3 kommt als Überraschung später im Video vor.

## C. Drehbuch

Zeiten sind geplant und werden nach der Stimmaufnahme an Toms Wortzeiten angepasst.

| Zeit | Sprechertext | Bild und Animation | Einblendung |
|---|---|---|---|
| 0:00–0:07 | „Von 100 Euro auf deutschen Konten haben die Banken nicht mal einen Euro als Bargeld da. Was passiert also, wenn morgen alle gleichzeitig ihr Geld abheben wollen?“ | Die ganze Stadt von schräg oben, vor der Bank steht schon eine lange Schlange, Autos fahren ihre Runden. Die Kamera fährt langsam auf die Bank zu. | Titel „Was wäre, wenn alle gleichzeitig ihr Geld abheben?“, dann **unter 1 €** von 100 € liegt als Bargeld bei der Bank |
| 0:07–0:17 | „Auf den Konten liegen über 4.000 Milliarden Euro. In den Tresoren und Automaten aller Banken zusammen sind es nur rund 20 Milliarden. Der Rest ist zum Großteil verliehen: als Kredit für Häuser, Autos und Firmen.“ | Hinter der Bank wächst ein Turm aus gläsernen Scheinbündeln weit nach oben, die Kamera neigt sich mit. Die Wände der Bank werden durchsichtig, im Tresor steht ein winziger Stapel Scheine. Dann lösen sich die Glasbündel vom Turm und gleiten über die Straßen in die Häuser, in die Autos und in eine kleine Fabrik. | **4.000 Mrd. €** auf deutschen Konten, dann **20 Mrd. €** Bargeld bei allen Banken, dann Titel „Der Rest ist verliehen“ |
| 0:17–0:29 | „Schon nach wenigen Stunden wären die ersten Automaten leer. Wie schnell das geht, zeigte 2023 die Silicon Valley Bank: An einem einzigen Tag wollten Kunden 42 Milliarden Dollar abziehen. Am nächsten Morgen war die Bank geschlossen.“ | Die Schlange rückt Schritt für Schritt vor. Die Displays springen nacheinander von Blau auf Rot „LEER“, das vorderste zuerst. Bei „geschlossen“ gehen in der Bank die Lichter aus, und ein Rollladen fährt vor der Tür herunter. | **42 Mrd. $** an einem Tag (Silicon Valley Bank, 2023) |
| 0:29–0:42 | „Dann greift der Staat ein. In Griechenland blieben die Banken 2015 drei Wochen zu, am Automaten gab es höchstens 60 Euro am Tag. ~~Deutschland hat das 1931 schon erlebt: Nach einem Ansturm erklärte die Regierung Bankfeiertage, und die Schalter blieben zu.~~“ (der Satz zu 1931 ist gestrichen) | Eine weiße Schranke mit dem Schild „Geschlossen“ senkt sich vor der Bank. Ein Automat zeigt kurz „max. 60 €“. Bei 1931 wird die Stadt etwas wärmer und dunkler, über der Tür hängt ein Schild „Bankfeiertag“. | **60 €** pro Tag (Griechenland 2015, Banken 3 Wochen zu), dann Titel „Deutschland 1931: Bankfeiertage“ |
| ~~0:42–0:50~~ (gestrichen) | „Und einfach mehr Geld drucken? Alle Euro-Scheine, die es überhaupt gibt, sind zusammen nur rund 1.600 Milliarden Euro wert, nicht mal halb so viel, wie allein auf deutschen Konten liegt.“ | Der gläserne Turm erscheint wieder als Umriss. Daneben wächst ein Stapel echter Scheine, der bei weniger als der Hälfte der Turmhöhe stehen bleibt. | **1.600 Mrd. €** alle Euro-Scheine zusammen |
| 0:50–0:58 | „Verloren wäre dein Geld trotzdem nicht. Bis 100.000 Euro pro Bank sind gesetzlich geschützt und müssen innerhalb von sieben Arbeitstagen ausgezahlt werden.“ | Eine gläserne Glocke senkt sich sanft über die Bank, die Fenster der Häuser gehen nacheinander warm an. | **100.000 €** pro Person und Bank geschützt, Auszahlung in 7 Arbeitstagen |
| 0:58–1:10 | „Das Verrückte ist: Eine gesunde Bank kann allein durch Panik pleitegehen. Deshalb trat Angela Merkel 2008 vor die Kameras und sagte den Sparern: Ihre Einlagen sind sicher.“ | Die Glocke hebt sich, die Bank leuchtet, aber die Schlange wird immer länger, und die Lichter in der Bank flackern und gehen aus. Bei „sicher“ geht das Licht wieder an, die Schranke öffnet sich, und die Leute gehen ruhig nach Hause. | Titel „Panik allein reicht“, dann „2008: ‚Ihre Einlagen sind sicher‘“ |
| 1:10–1:14 | „Würdest du dein Geld abheben? Schreib’s in die Kommentare.“ | Die Kamera steigt in die Übersicht, nur das rote Display leuchtet noch. | Titel „Würdest du dein Geld abheben?“ |
| 1:14–1:17 | (Outro) | siehe Outro-Auswahl | Logo |

## D. Sprechertext für Tom (eleven_v4, Audio-Tags)

```
[curious] Von hundert Euro auf deutschen Konten haben die Banken nicht mal einen Euro als Bargeld da. [short pause] Was passiert also, wenn morgen alle gleichzeitig ihr Geld abheben wollen?

[explaining] Auf den Konten liegen über viertausend Milliarden Euro. In den Tresoren und Automaten aller Banken zusammen sind es nur rund zwanzig Milliarden. Der Rest ist zum Großteil verliehen: als Kredit für Häuser, Autos und Firmen.

[serious] Schon nach wenigen Stunden wären die ersten Automaten leer. Wie schnell das geht, zeigte zweitausenddreiundzwanzig die Silicon Valley Bank: An einem einzigen Tag wollten Kunden zweiundvierzig Milliarden Dollar abziehen. [short pause] Am nächsten Morgen war die Bank geschlossen.

[matter-of-fact] Dann greift der Staat ein. In Griechenland blieben die Banken zweitausendfünfzehn drei Wochen zu, am Automaten gab es höchstens sechzig Euro am Tag. Deutschland hat das neunzehnhunderteinunddreißig schon erlebt: Nach einem Ansturm erklärte die Regierung Bankfeiertage, und die Schalter blieben zu.

[curious] Und einfach mehr Geld drucken? [short pause] [explaining] Alle Euro-Scheine, die es überhaupt gibt, sind zusammen nur rund eintausendsechshundert Milliarden Euro wert, nicht mal halb so viel, wie allein auf deutschen Konten liegt.

[calm] Verloren wäre dein Geld trotzdem nicht. Bis hunderttausend Euro pro Bank sind gesetzlich geschützt und müssen innerhalb von sieben Arbeitstagen ausgezahlt werden.

[serious] Das Verrückte ist: Eine gesunde Bank kann allein durch Panik pleitegehen. [short pause] Deshalb trat Angela Merkel zweitausendacht vor die Kameras und sagte den Sparern: Ihre Einlagen sind sicher.

[curious] Würdest du dein Geld abheben? [short pause] [warm] Schreib's in die Kommentare.
```

## Outro-Auswahl

Vom Nutzer gewählt (20.11.2026): **Variante 2, der Automat gibt das Logo aus.** Überarbeitet am selben Tag (Wunsch: „Outro ändern und flüssiger machen“, „Automaten moderner“): Die Kamera fährt nach der Frage ruhig von der Halbtotalen der Bank bei Nacht an den roten Automaten heran, ohne Sprung aus der Übersicht. Aus dem beleuchteten Kopf des Automaten steigt ein Kassenbon nach oben, der Druck „function“ wandert dabei mit dem Papier nach oben, darunter leuchtet weiter „LEER“. Wenn der Bon steht, ploppt der rote Punkt auf. Das ganze Logo auf dem Bon ist rot wie das Kanal-Logo (Wunsch des Nutzers, 20.11.2026: „Outro komplett in rot“), vorher war „function“ schwarz und nur der Punkt rot. Die Automaten sind jetzt modern (abgerundetes Gehäuse, dunkle Glasfront, Bildschirm mit Blendschutz, schräges Tastenfeld mit Kontaktlos-Feld, Kartenschlitz mit grüner LED, Geldausgabe mit Lichtring, beleuchteter Kopf mit €-Zeichen), und alle Bildschirmtexte werden automatisch so verkleinert, dass sie hineinpassen. Erste Fassung: Die Kamera taucht vom Überblick an den roten Automaten, ein Beleg schiebt sich aus dem Geldschlitz, kippt nach unten und hängt wie ein echter Kassenbon. Darauf erscheint „function“ in Poppins Medium, kurz danach ploppt der rote Punkt auf. Oben im Bild leuchtet das rote „LEER“-Display.


1. **Bankschild wird zum Logo (Empfehlung):** Die Stadt wird dunkel, nur das rote „LEER“-Display leuchtet. Die Buchstaben „BANK“ auf dem Giebel klappen nacheinander um und werden zu „function“, das rote Licht des Displays steigt auf und rastet als Punkt ein.
2. **Der Automat gibt das Logo aus:** Der rote Automat surrt, aus dem Geldschlitz schiebt sich statt eines Scheins ein weißer Zettel mit „function.“, der rote Punkt leuchtet auf.
3. **Die Schlange schreibt das Logo:** Von oben gesehen laufen die Figuren der Schlange in Formation und bilden „function“, das rote Display wird zum Punkt. (Aufwendig, nur wenn ausdrücklich gewünscht.)
4. **Schlicht:** Das rote „function.“ erscheint zwei Sekunden lang mittig, der Hintergrund bleibt leicht sichtbar, der Punkt kommt kurz danach (wie beim 2027-Video).

## E. Szenenplan (Technik)

| Zeit | Kamera | Licht | Übergang |
|---|---|---|---|
| 0:00–0:07 | Übersicht schräg von oben, langsame Fahrt auf die Bank | Stil 1 warmes Sonnenlicht von links oben, Stil 2 weiches Licht mit violettem Rand; Fokuslicht auf der Schlange | keiner, die Szene läuft schon |
| 0:07–0:17 | Neigung nach oben am Turm entlang, dann zurück auf die Straßen | Turm von innen leicht beleuchtet, Tresor mit kleinem Spot | Bankwände blenden auf Glas, Bündel gleiten über die Straßen |
| 0:17–0:29 | nah an die Automaten und die Spitze der Schlange | Displays als eigene Lichtquelle, das rote färbt den Gehweg leicht | Displays springen nacheinander um, Rollladen fährt herunter |
| 0:29–0:42 | halbnah auf Eingang und Schranke | 1931: Farbe kurz wärmer und etwas dunkler | Schranke senkt sich, Schild schwingt kurz nach |
| 0:42–0:50 | zurück und nach oben, Turm und Stapel im Bild | Stapel hell, Turm als Umriss | Stapel wächst in Stufen |
| 0:50–0:58 | Halbtotale der Stadt | Fenster gehen warm an | Glocke senkt sich sanft |
| 0:58–1:10 | Halbtotale, leichte Fahrt nach rechts | Bank flackert, dann gleichmäßig hell | Schranke öffnet sich, Leute gehen nach Hause |
| 1:10–1:17 | Fahrt nach oben in die Übersicht | Stadt dunkler, nur das rote Display | Outro |

## F. Higgsfield-Prompts

Das Video wird komplett in 3D gebaut und auf dem PC gerendert, Higgsfield ist dafür nicht nötig. Die Prompts sind für eine spätere fotorealistische Variante oder B-Roll gedacht. Jede Szene hat ein Startbild und einen Bewegungs-Prompt, das Endbild ist das Startbild der nächsten Szene. Stilreferenz ist ein sauberes Standbild ohne Schrift aus dem Stiltest (`bankrun/Stiltest_1_TiltShift.jpg` bzw. `Stiltest_2_Isometrisch.jpg`, Text vorher wegschneiden).

Stilblock Stil 1 (vor jeden Prompt setzen): *Tilt-shift miniature photograph of a small model town seen from high above at 45 degrees, strong shallow depth of field with the top and bottom of the frame blurred, warm afternoon sunlight from the upper left, saturated toy-like colours, simple boxy houses with window grids and a few gable roofs, dark asphalt roads with white dashes, round trees, tiny cars, a white neoclassical bank with four columns and a pediment in the centre, three cash machines on its right facade, no text except the word BANK on the pediment, vertical 9:16.*

Stilblock Stil 2: *Isometric diorama on a thick lavender tile floating on a dark violet background, orthographic view, soft pastel colours (peach, sky blue, butter yellow, lilac, mint), clean low-poly houses with window grids and purple gable roofs, a white bank with columns and the word BANK, three cash machines, tiny rounded people and cars, soft shadows, vertical 9:16.*

1. **Hook – Start:** the town with a long queue of tiny people in front of the bank. **Bewegung:** cars drive slowly along the road, people shift their weight, the camera pushes in slowly towards the bank.
2. **Turm – Start:** the same view, slightly closer. **Bewegung:** a tall tower of glass banknote bundles grows out of the ground behind the bank, the camera tilts up; the bank walls turn to glass and reveal a tiny pile of cash in a vault; bundles detach from the tower and glide along the roads into houses, cars and a small factory.
3. **Automaten – Start:** close view of the three cash machines and the front of the queue. **Bewegung:** the queue moves forward step by step, the screens switch from blue to red one after another, the bank's lights go off and a roller shutter closes the door.
4. **Schranke – Start:** the closed bank entrance. **Bewegung:** a white barrier with a sign lowers in front of the bank, a cash machine screen shows a small amount, the scene turns a little warmer and darker.
5. **Geld drucken – Start:** wide view with the glass tower as an outline. **Bewegung:** a stack of real banknotes grows next to the tower and stops below half its height.
6. **Schutz – Start:** the town at dusk. **Bewegung:** a glass dome lowers gently over the bank, the windows of the houses light up warm one after another.
7. **Panik – Start:** the bank lit, the queue growing. **Bewegung:** the bank lights flicker and go out, then come back on; the barrier rises and the people walk home calmly along the sidewalks.
8. **Schluss – Start:** wide view of the dark town with one glowing red cash machine screen. **Bewegung:** the camera rises slowly; the letters on the bank's pediment flip and turn into a red word, the red screen light rises and becomes a full stop.

## G. Animations- und Kameraanweisungen

- Eine durchgehende Kamerafahrt ohne Schnitt mit Keyframes und weicher Interpolation, in beiden Stilen dieselben Zeiten. In Stil 2 bleibt die Kamera orthografisch und ändert nur Ausschnitt und Höhe, damit das Spielbrett-Gefühl bleibt.
- Jede Figur hat ihre eigene Spur auf dem Gehweg. Sie läuft nur auf festen Wegen, bleibt mit Abstand hinter der vorderen Figur stehen und rückt nach, wenn vorne jemand fertig ist. Niemand läuft durch einen anderen, durch Bäume, Laternen oder Häuser, und niemand taucht plötzlich auf: Neue Leute kommen von außerhalb des Bildes oder aus Haustüren.
- Autos fahren auf geschlossenen Runden mit festem Abstand, nichts kreuzt sich.
- Glasbündel gleiten über der Straßenoberfläche zu ihren Zielen und verschwinden durch Türen oder Garagentore, nicht durch Wände.
- Displays wechseln mit einem kurzen Flackern die Farbe. Rollladen, Schranke und Glocke bewegen sich mit sanftem Abbremsen und einem kleinen Nachschwingen.
- Vor dem Rendern wird automatisch geprüft, ob sich zwei Figuren zu nahe kommen oder etwas in einem Gebäude steckt (Prüfskript wie `jahr2027/collide.mjs`), dazu ein Kontaktbogen aus beiden Stilen.

## H. Übergänge und Sounddesign

Musik wie zuletzt „Radar Focus“ (Blue Saga, Epidemic Sound) mit abgesenktem Sub-Bass, 22 dB unter der Stimme im Bereich über 250 Hz und sanftem Ducking. Effekte aus der Epidemic- bzw. Soundza-Bibliothek, nur an Schlüsselstellen: leises Stadt-Ambiente mit entfernten Autos und Stimmengemurmel als Klangbett, Gläser-Klirren leise beim Turm, ein Rutschen beim Wegfliegen der Bündel, ein Automaten-Piepen beim ersten roten Display (die anderen beiden leiser), ein metallisches Rattern beim Rollladen, ein dumpfes Klacken bei der Schranke, ein Papierrascheln beim wachsenden Stapel, ein weicher heller Ton bei der Glocke, ein elektrisches Flackern bei den Bank-Lichtern und Schritte, wenn die Leute nach Hause gehen. Die gelieferten Swooshes tragen die großen Kamerafahrten, die Klicks kommen nur bei den großen Zahlen. IDs in `bankrun/SOUNDS.md`.

## I. TikTok-Titel, Beschreibung und Hashtags

Titel: „Was wäre, wenn alle gleichzeitig ihr Geld abheben? 🏦“

Beschreibung: „Von 100 Euro auf deutschen Konten haben die Banken nicht mal einen Euro als Bargeld da. Wir zeigen dir, was bei einem Bankrun passiert: leere Automaten, geschlossene Banken und warum dein Geld trotzdem nicht weg ist. Würdest du abheben? Schreib's in die Kommentare! 👇“

Hashtags (TikTok und Instagram höchstens fünf): #function #bankrun #geld #bank #waswärewenn

## Faktencheck

| Aussage im Video | Stand 20.11.2026 | Beleg |
|---|---|---|
| Bargeld (Kassenbestand) aller Banken in Deutschland rund 20 Mrd. € | 19,7 Mrd. € Ende 2024 | Bundesbank-Bankenstatistik via Statista |
| Einlagen inländischer Nichtbanken bei Banken in Deutschland über 4.000 Mrd. € | rund 4.550 Mrd. € (Januar 2026) | Bundesbank, Monatsbericht Februar 2026, Tabelle IV.7 |
| Daraus: von 100 € auf Konten weniger als 1 € als Bargeld bei den Banken | rund 0,45 € | Rechnung aus beiden Werten |
| Silicon Valley Bank: am 9.3.2023 sollten 42 Mrd. $ abgezogen werden, am 10.3.2023 geschlossen | gilt | kalifornische Finanzaufsicht, Bloomberg |
| Griechenland 2015: Banken vom 29.6. bis 20.7. geschlossen, Abhebung höchstens 60 € pro Tag | gilt | Al Jazeera, Euronews, Deutsche Bank |
| 1931: Danatbank stellt am 13.7. die Zahlungen ein, Bankfeiertage am 14. und 15.7., Zahlungsverkehr bis Anfang August beschränkt | gilt | Deutscher Bundestag „Bankenkrise 1931“, German History Docs |
| Alle Euro-Banknoten zusammen rund 1.600 Mrd. € | 1.619,5 Mrd. € Ende 2025 | EZB, konsolidierte Bilanz des Eurosystems; Bundesbank |
| Gesetzliche Einlagensicherung 100.000 € pro Person und Bank, Auszahlung spätestens 7 Arbeitstage nach Feststellung des Entschädigungsfalls | gilt | Bundesbank, Entschädigungseinrichtung deutscher Banken |
| 5.10.2008: Merkel und Steinbrück: „Wir sagen den Sparerinnen und Sparern, dass ihre Einlagen sicher sind.“ | gilt (politische Zusage) | Bundestag Textarchiv, Börsen-Zeitung |

Quellenzeile im Video (gekürzte Fassung, ohne EZB, weil die Euro-Scheine nicht mehr vorkommen): „Quellen: Deutsche Bundesbank, Einlagensicherungsgesetz, kalifornische Finanzaufsicht · Stand 20.11.2026 · Modell vereinfacht“. Die Zeilen zu 1931 und zu den Euro-Banknoten gehören nur noch zu den vorbereiteten Kommentar-Antworten.
