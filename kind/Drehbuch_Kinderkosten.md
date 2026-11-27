# Was kostet ein Kind, bis es 18 ist? (27.11.2026)

## Idee

Fast jeder hat eine Zahl im Kopf, und fast jeder liegt daneben. Das Video stellt die Frage gleich am Anfang, lässt die Zuschauer schätzen und baut die Antwort Schritt für Schritt auf. Dabei wächst ein Kinderzimmer mit: aus dem Gitterbett wird ein Kinderbett, daraus ein Teenager-Zimmer. Zu jedem Alter steht oben, was es im Monat kostet. Im Zeitraffer zählt der Betrag bis zum 18. Geburtstag hoch, am Ende landet der Kindergeld-Brief auf dem Bett.

Look (neu nach Rückmeldung vom 27.11.2026, der Knete-Look gefiel nicht): ein aufgeschnittenes Kinderzimmer wie ein Puppenhaus, das mit dem Kind mitwächst. Aus dem Gitterbett wird ein Kinderbett mit Schreibtisch, daraus ein Teenager-Zimmer mit Monitor und Gitarre. An der Wand hängt eine Messlatte mit den Größenmarken. Der rote Faden ist ein roter Teddy, der in jedem Alter dabei ist. Stiltests mit drei Looks: `kind/zimmer.html?s=1|2|3&a=0|1|2`, Vergleich in `kind/Stiltest_Kinderzimmer.jpg`. Szenenplan E und G werden nach der Wahl des Looks angepasst.

## A. Drei Hook-Varianten

1. „Was kostet ein Kind, bis es 18 ist? Schätz mal.“
2. „Ein Teenager kostet seine Eltern fast 1.000 Euro im Monat.“
3. „Ein Kind kostet heute mehr als 200.000 Euro.“

## B. Beste Hook: Variante 1

Die Frage zieht jeden sofort hinein, weil jeder eine Schätzung im Kopf hat und wissen will, ob sie stimmt. Die Auflösung kommt erst nach gut 15 Sekunden, bis dahin bleibt man dran. Danach schreiben viele ihre eigene Schätzung oder ihre eigenen Kosten in die Kommentare. Variante 3 nimmt die Pointe vorweg, Variante 2 ist nur ein Teil der Geschichte.

## C. Drehbuch

Ein durchgehender One-Take im aufgeschnittenen Kinderzimmer. Look 2 spielt am Abend (Nachtlicht, Lampen, Lichterkette, leichte Tiefenunschärfe), Look 3 an einem sonnigen Morgen (Lichtstrahl durchs Fenster, Tilt-Shift wie ein Modell).

| Zeit (Stimme) | Bild | Was passiert |
|---|---|---|
| 0–4 s | Nah am Kleinkind auf dem Spielteppich, das den roten Teddy hält, das Mobile dreht sich | Titel „Was kostet ein Kind bis 18?“. Die Kamera zieht auf das ganze Zimmer auf. |
| 4–8,5 s | Kleinkind-Zimmer: Gitterbett, Wickelkommode, Stillsessel, Schaukelpferd, Wimpelkette | „679 €“ im Monat. |
| 8,5–10,7 s | Die Möbel wechseln von links nach rechts, die Wand wird hellblau | Schulkind mit Ranzen, Bett mit Raketenbettwäsche, Schreibtisch, Straßenteppich. „≈ 785 €“. |
| 10,7–14 s | Zweiter Wechsel, die Wand wird dunkelgrau | Teenager mit Handy auf dem Bett, Monitor, PC, Gitarre, Lichterkette. „953 €“. |
| 14–17,6 s | Die Kamera fährt näher heran | Schilder „Wohnen“ (Bett), „Essen“ (Pizza), „Kleidung“ (Jacke am Stuhl). „≈ 50 %“. |
| 17,6–21,2 s | Zeitraffer: das Zimmer läuft noch einmal durch alle drei Alter, die Wanduhr dreht sich schnell | Oben zählt der Betrag bis „174.000 €“ hoch. |
| 21,2–30 s | Das Teenager-Zimmer bleibt | „174.000 €“ (Preise 2018), auf „zweihunderttausend“ springt die Zahl auf „216.000 €“. |
| 30–35,4 s | Nah am Teenager | Ein gelber Brief „Kindergeld“ fällt aufs Bett. „259 €“, dann „≈ 26 %“. |
| 35,4–38,7 s | Ganzes Zimmer | Der Teenager schaut auf und winkt. Frage „Hättest du so viel geschätzt?“ |
| 38,7–42,5 s | Outro | Schlichte 2D-Outro mit dem roten Punkt. |

## D. Sprechertext für Tom (eleven_v4, Audio-Tags)

```
[curious] Was kostet ein Kind, bis es achtzehn ist? [short pause] Schätz mal.

[explaining] Für ein Kleinkind geben Eltern im Schnitt rund sechshundertachtzig Euro im Monat aus. Für ein Schulkind fast achthundert. Und für einen Teenager über neunhundertfünfzig.

Etwa die Hälfte davon geht für Wohnen, Essen und Kleidung drauf.

Bis zum achtzehnten Geburtstag kommen so rund hundertvierundsiebzigtausend Euro zusammen. Das sind die neuesten amtlichen Zahlen, und sie stammen von zweitausendachtzehn. Mit den Preisen von heute sind es über zweihunderttausend.

Der Staat zahlt zweihundertneunundfünfzig Euro Kindergeld im Monat. Das deckt nur etwa ein Viertel.

[curious] Hättest du so viel geschätzt? [short pause] [warm] Schreib's in die Kommentare.
```

(etwa 100 Wörter, rund 38 Sekunden)

## E. Szenenplan (Technik)

Three.js ohne Knete, Seite `kind/zimmer.html?s=2|3`, Code `kind/src/zimmer.js`. Zimmer 3,4 × 3,0 m mit Holzdielen, Fußleisten, Fenster mit Griff, Vorhängen mit Raffhaltern, Heizkörper mit Thermostat, Wanduhr, Steckdosen, Lichtschalter und Messlatte (die Größenmarken kommen mit jedem Alter dazu). Jede Altersstufe ist eine eigene Gruppe mit vielen Einzelteilen, die von links nach rechts verschwinden und auftauchen; dabei steht nie ein altes und ein neues Möbelstück gleichzeitig am selben Platz. Die Figuren sind glatt und leicht stilisiert, mit Gelenken (sitzen, winken, Kopf drehen). Unsichtbare Decke und rechte Wand werfen nur Schatten, damit die Sonne nur durchs Fenster fällt. Prüfbilder: `node kind/shot_zimmer.mjs <ordner> 2,3 a0,a1,a2` und Zeitpunkte `t…`; Thumbnail-Motiv: `node kind/motif.mjs 3 1 thumbs/motive_knete/kind.png`.

## F. Higgsfield-Prompts

Komplett in Three.js gebaut, Higgsfield wird nicht gebraucht. Falls nötig: „Isometric cutaway of a cozy children's room like a dollhouse, wooden floor, window with curtains and a radiator, a toddler on a play rug hugging a red teddy bear, crib with a mobile, soft evening lamp light, highly detailed, stylized 3D render.“

## G. Animations- und Kameraanweisungen

Die Kamera startet nah am Kleinkind und zieht ruhig auf das ganze Zimmer auf. Bei den Wechseln bleibt sie auf dem ganzen Zimmer, damit man sieht, wie es mitwächst. Zu „Wohnen, Essen und Kleidung“ fährt sie näher heran, im Zeitraffer dreht sie sich langsam etwas, zum Kindergeld geht sie nah an den Teenager und am Ende wieder auf das ganze Zimmer. Kleine Bewegungen halten das Bild lebendig: Das Mobile dreht sich, das Kleinkind wiegt sich, das Schulkind schaut sich um, der Teenager schaut aufs Handy und winkt am Ende.

## H. Übergänge und Sounddesign

Musik „Radar Focus“. Ein Whoosh bei jedem Wechsel der Altersstufe und bei den Kamerafahrten, ein leises Klicken bei den Monatsbeträgen, ein Pop je Schild, ein Glockenspiel-Ton für das Mobile am Anfang, Blätterrauschen im Zeitraffer, ein Münzklang beim Endbetrag und ein Papiergeräusch, wenn der Kindergeld-Brief landet. Skript `audio_kind.py`, Liste in `SOUNDS.md`.

## I. TikTok-Titel, Beschreibung und Hashtags

Alle Texte je Kanal stehen in `social/Texte.md`, das Thumbnail (Galerie A, Knetmotiv) in `social/`.

## Faktencheck (Stand 27.11.2026)

- **Monatliche Kosten:** Paare mit einem Kind gaben 2018 im Schnitt 763 € im Monat für das Kind aus, das waren 21 % ihrer Konsumausgaben (Statistisches Bundesamt, „Zahl der Woche“ vom 29.06.2021, Einkommens- und Verbrauchsstichprobe 2018). Für Kinder bis 6 Jahre waren es 679 €, für Jugendliche von 12 bis unter 18 Jahren 953 €. Für 6- bis 12-Jährige nennen Sekundärquellen 784 € oder 786 €, deshalb steht im Video „≈ 785 €“ und Tom sagt „fast achthundert“.
- **Hälfte:** Rund die Hälfte der Ausgaben für Kinder entfiel auf die Grundversorgung mit Ernährung, Bekleidung und Wohnen, etwa 15 % auf Freizeit, Unterhaltung und Kultur (ebenda).
- **Neueste Zahlen:** Die Destatis-Veröffentlichung „Konsumausgaben von Familien für Kinder“ auf Basis der EVS 2018 ist die letzte Ausgabe, die Reihe wurde eingestellt. Neuere amtliche Zahlen je Kind gibt es nicht.
- **Summe bis 18 (eigene Rechnung):** 6 Jahre × 12 Monate × (679 € + 785 € + 953 €) = 174.024 € (mit 784 € 173.952 €, mit 786 € 174.096 €), also rund 174.000 €. Das liegt etwas über der oft genannten Rechnung 763 € × 216 Monate = 164.808 €, weil die 763 € ein Durchschnitt über alle Ein-Kind-Familien sind, in denen jüngere Kinder häufiger vorkommen.
- **Heutige Preise (eigene Rechnung):** Verbraucherpreisindex (2020 = 100) 2018: 98,1, Jahresdurchschnitt 2025: rund 121,9 (Mittel der Monatswerte). Faktor 1,243, also 174.024 € × 1,243 ≈ 216.000 €. Tom sagt deshalb „über zweihunderttausend“.
- **Kindergeld:** 259 € pro Kind und Monat seit 1. Januar 2026 (vorher 255 €). Über 18 Jahre zum heutigen Satz: 259 € × 216 = 55.944 €, also rund 56.000 € und knapp 26 % von 216.000 €, „etwa ein Viertel“. Familien mit höherem Einkommen profitieren stattdessen vom Kinderfreibetrag, das lässt das Video weg.
- **Einschränkung:** Gezählt werden nur die Konsumausgaben für das Kind (Wohnen, Essen, Kleidung, Freizeit, Mobilität und so weiter), nicht Sparen für das Kind, nicht Versicherungen und nicht das Einkommen, das Eltern durch Elternzeit oder Teilzeit verlieren.

Quellen: Statistisches Bundesamt, Zahl der Woche vom 29.06.2021 („763 Euro im Monat geben Paare mit einem Kind für den Nachwuchs aus“); Statistisches Bundesamt, Konsumausgaben von Familien für Kinder (EVS 2018, letzte Ausgabe); Statistisches Bundesamt, Verbraucherpreisindex 2020 = 100; Bundesagentur für Arbeit, Merkblatt Kindergeld 2026.
