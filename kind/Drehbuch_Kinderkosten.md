# Was kostet ein Kind, bis es 18 ist? (27.11.2026)

## Idee

Fast jeder hat eine Zahl im Kopf, und fast jeder liegt daneben. Das Video stellt die Frage gleich am Anfang, lässt die Zuschauer schätzen und baut die Antwort Schritt für Schritt auf. Auf einer Knetplatte wird ein Kind an drei Stationen größer: Kleinkind, Schulkind, Teenager. An jeder Station steht, was es im Monat kostet. Am Ende stapeln sich 18 Jahresblöcke zu einem Geldturm, der mit den heutigen Preisen noch ein Stück wächst. Daneben steht der viel kleinere Turm, den das Kindergeld abdeckt.

Look (neu nach Rückmeldung vom 27.11.2026, der Knete-Look gefiel nicht): ein aufgeschnittenes Kinderzimmer wie ein Puppenhaus, das mit dem Kind mitwächst. Aus dem Gitterbett wird ein Kinderbett mit Schreibtisch, daraus ein Teenager-Zimmer mit Monitor und Gitarre. An der Wand hängt eine Messlatte mit den Größenmarken. Der rote Faden ist ein roter Teddy, der in jedem Alter dabei ist. Stiltests mit drei Looks: `kind/zimmer.html?s=1|2|3&a=0|1|2`, Vergleich in `kind/Stiltest_Kinderzimmer.jpg`. Szenenplan E und G werden nach der Wahl des Looks angepasst.

## A. Drei Hook-Varianten

1. „Was kostet ein Kind, bis es 18 ist? Schätz mal.“
2. „Ein Teenager kostet seine Eltern fast 1.000 Euro im Monat.“
3. „Ein Kind kostet heute mehr als 200.000 Euro.“

## B. Beste Hook: Variante 1

Die Frage zieht jeden sofort hinein, weil jeder eine Schätzung im Kopf hat und wissen will, ob sie stimmt. Die Auflösung kommt erst nach gut 15 Sekunden, bis dahin bleibt man dran. Danach schreiben viele ihre eigene Schätzung oder ihre eigenen Kosten in die Kommentare. Variante 3 nimmt die Pointe vorweg, Variante 2 ist nur ein Teil der Geschichte.

## C. Drehbuch

| Zeit (ca.) | Bild | Was passiert |
|---|---|---|
| 0–3 s | Station A: Kleinkind mit rotem Luftballon, Kinderwagen, Bauklötze | Titel „Was kostet ein Kind bis 18?“. Münzen fallen in eine kleine Spardose. |
| 3–8 s | Station A nah | Schild „679 € im Monat“ ploppt auf, Zahl oben links. |
| 8–11 s | Station B: Schulkind mit Ranzen am Pult | Schild „≈ 785 € im Monat“. |
| 11–15 s | Station C: Teenager mit Handy und Kopfhörern | Schild „953 € im Monat“. |
| 15–19 s | Alle drei Stationen | Über den Kindern ploppen Haus, Teller und T-Shirt auf: „etwa die Hälfte für Wohnen, Essen und Kleidung“. |
| 19–27 s | Station D: Geldturm | 18 Jahresblöcke stapeln sich (Farben wie die drei Stationen), Schild „174.000 €“. Dann wächst ein heller Block oben drauf, das Schild kippt auf „216.000 €“. |
| 27–33 s | Station D mit Kindergeld-Turm | Daneben wächst der Kindergeld-Turm auf 56.000 €, gut ein Viertel so hoch. |
| 33–36 s | Ganze Platte | Frage an die Zuschauer. |
| 36–39 s | Outro | Schlichte 2D-Outro mit dem roten Punkt. |

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

Three.js im Knete-Look mit `kit/knete_kit.js`. Eine lila Knetplatte mit vier Stationen in einer Reihe, keine Station steht vor einer anderen:

- **A Kleinkind (0–6):** Figur in Größe 0,6 auf einer hellblauen Matte, Kinderwagen, Bauklötze, kleine Spardose. Schild hinten auf Pfosten.
- **B Schulkind (6–12):** Figur in Größe 0,8 mit Schulranzen auf einer mintfarbenen Matte, Pult mit Büchern.
- **C Teenager (12–18):** Figur in Größe 1,0 mit Handy und Kopfhörern auf einer pfirsichfarbenen Matte, Skateboard.
- **D Geldturm:** 18 Jahresblöcke, Höhe nach den Jahreskosten (8.148 €, 9.420 €, 11.436 €), Farben wie die Matten der drei Stationen. Darauf ein heller Block für die Teuerung seit 2018. Daneben der mintfarbene Kindergeld-Turm. Maßstab 100.000 € = 1,2 Einheiten.

Die Kinder stehen still und bewegen nur Kopf und Arme, keine Figur läuft. Der Ballon hängt an einer Schnur an der Hand und wippt leicht. Die Schilder stehen hinter den Kindern, die Ballons schweben vor den Schildern und berühren sie nie.

## F. Higgsfield-Prompts

Komplett in Three.js gebaut, Higgsfield wird nicht gebraucht. Falls nötig: „Claymation diorama on a lilac clay base: a toddler, a schoolchild with a backpack and a teenager with a phone stand in a row, each holding a glossy red clay balloon, next to a tall stack of pastel clay money blocks, soft warm light, dark violet background, plasticine texture.“

## G. Animations- und Kameraanweisungen

Die Kamera fährt ruhig von links nach rechts von Station zu Station und bleibt bei jeder Zahl kurz stehen. Bei „die Hälfte“ zeigt sie die drei Kinder zusammen. Beim Geldturm fährt sie langsam am Turm hoch, während die Jahresblöcke von unten nach oben aufploppen. Zum Kindergeld fährt sie etwas zurück, damit beide Türme ganz im Bild sind. Am Ende zeigt sie die ganze Platte.

## H. Übergänge und Sounddesign

Musik „Radar Focus“. Kamerafahrten mit den Whooshes des Nutzers (`paket-test/sfx_epidemic/whoosh.mp3`). Münzklimpern nur bei den Schildern mit den Monatsbeträgen, ein leises Pop für die drei Symbole, ein kurzes Tick-Rattern beim Stapeln der Jahresblöcke (nur einmal, nicht pro Block) und ein weicher Aufschlag, wenn der Kindergeld-Turm steht. Liste in `SOUNDS.md`.

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
