# A und B haben dieselbe Farbe (Schachbrett-Schatten, 27.11.2026)

## Idee

Ein Mitmach-Video über eine optische Täuschung, die fast niemand glaubt, bis er den Beweis sieht. Auf einem Schachbrett liegt Feld A im Licht und wirkt dunkel, Feld B liegt im Schatten eines Zylinders und wirkt hell. In Wahrheit haben beide exakt dieselbe Farbe. Das Video beweist es zweimal (Balken in derselben Farbe, alles andere wegnehmen) und erklärt dann, warum das Gehirn den Schatten herausrechnet. Vorbild ist die Schachbrett-Täuschung von Edward Adelson (MIT, 1995).

Look: helles, modernes Fotostudio (Test vom 27.11.2026, `schatten/test.html`), Seite des ganzen Videos `schatten/feld.html`, Code `schatten/src/feld.js`. Die Helligkeit von A und B ist ausgerechnet und im fertigen Bild nachgemessen (identische RGB-Werte). Der rote Faden sind die roten Ringe und Markierungen, die A und B kennzeichnen.

## A. Drei Hook-Varianten

1. „Die Felder A und B haben exakt dieselbe Farbe.“
2. „Dein Gehirn lügt dich gerade an. Schau auf A und B.“
3. „99 Prozent sehen hier zwei verschiedene Farben.“ (verworfen, die Zahl ist nicht belegt)

## B. Beste Hook: Variante 1

Der Satz ist eine klare Behauptung, die jeder sofort für falsch hält. Man bleibt dran, weil man den Beweis sehen will, und der Beweis kommt nach wenigen Sekunden. Variante 2 ist reißerischer, Variante 3 bräuchte eine Zahl, die es nicht gibt.

## C. Drehbuch

| Zeit (ca.) | Bild | Was passiert |
|---|---|---|
| 0–3 s | Studio, Schachbrett mit Zylinder | A und B werden mit roten Ringen markiert. Titel „A und B haben exakt dieselbe Farbe.“ |
| 3–8 s | Nah auf A und B | A sieht dunkel aus, B hell. |
| 8–13 s | Beweis 1 | Ein Balken in genau der gemessenen Farbe wächst von A nach B und geht nahtlos in beide über. |
| 13–18 s | Beweis 2 | Alles außer A und B blendet weg, übrig bleiben zwei gleiche graue Felder. |
| 18–27 s | Erklärung | Die Kamera fährt zur Seite, man sieht die Studiolampe, den Zylinder und seinen Schatten. Das Gehirn rechnet den Schatten heraus. |
| 27–32 s | Auflösung | Der Zylinder wird hochgehoben, der Schatten verschwindet, B ist hell. |
| 32–36 s | Ganze Szene | Frage an die Zuschauer. |
| 36–39 s | Outro | Schlichte 2D-Outro mit dem roten Logo. |

## D. Sprechertext für Tom (eleven_v4, Audio-Tags)

```
[curious] Die Felder A und B haben exakt dieselbe Farbe. [short pause] Glaubst du nicht?

[explaining] A sieht dunkel aus, B hell. Aber auf deinem Bildschirm leuchten beide Stellen genau gleich. Wenn ich die beiden mit einem Balken in derselben Farbe verbinde, siehst du keinen Übergang. Und wenn ich alles andere wegnehme, bleiben zwei identische graue Felder übrig.

Der Grund: Dein Gehirn misst nicht einfach das Licht. Es sieht den Schatten und rechnet ihn heraus, damit du Farben auch im Schatten richtig erkennst. Ohne den Zylinder siehst du, wie hell B wirklich ist.

[curious] Hast du es am Anfang erkannt? [short pause] [warm] Schreib's in die Kommentare.
```

(etwa 90 Wörter, rund 35 Sekunden)

## E. Szenenplan (Technik)

Three.js, heller Studio-Look: Hohlkehle, Softboxen auf Stativen, Kamera auf Stativ, Beistelltisch mit Zauberwürfel und Tasse, Kabel, Klebemarkierungen, Podest mit Schachbrett (5 × 5) und grünem Zylinder. Für das Brett gibt es nur weißes Umgebungslicht und eine weiße Sonne von hinten rechts (35° hoch). Die Felder sind so hell gewählt, dass das dunkle Feld im Licht genau so hell ist wie das helle Feld im Schatten (dunkel = hell × Umgebungslicht ÷ (Umgebungslicht + Sonne × sin 35°)). Keine Vignette und keine Tiefenschärfe, weil beide A und B unterschiedlich verändern würden. Der Balken und die Maske werden im 2D-Overlay gezeichnet, ihre Farbe kommt direkt aus dem fertigen Bild.

## F. Higgsfield-Prompts

Wird nicht gebraucht, alles ist in Three.js gebaut.

## G. Animations- und Kameraanweisungen

Die Kamera steht ruhig vor dem Brett, solange verglichen wird, denn bei jeder Bewegung würden A und B anders aussehen. Erst zur Erklärung fährt sie langsam zur Seite, damit man Lampe, Zylinder und Schatten in einer Linie sieht. Danach geht sie zurück auf die Ausgangsposition, damit man B vor und nach dem Anheben direkt vergleichen kann.

## H. Übergänge und Sounddesign

Musik „Radar Focus“. Leiser Pop, wenn die Ringe um A und B erscheinen, ein weiches Wischen beim Balken, ein Klick, wenn alles andere wegblendet, und ein Whoosh beim Anheben des Zylinders. Kamerafahrten mit den Whooshes des Nutzers. Liste in `SOUNDS.md`.

## I. TikTok-Titel, Beschreibung und Hashtags

Alle Texte je Kanal stehen in `social/Texte.md`, das Thumbnail (Galerie A, Knetmotiv mit Schachbrett, Zylinder und roten Rahmen um A und B) in `social/Thumbnail_Gleiche_Farbe_9x16.png`.

## Faktencheck (Stand 27.11.2026)

- Die Schachbrett-Schatten-Täuschung stammt von Edward H. Adelson, Professor für Sehwissenschaft am MIT, veröffentlicht 1995 („Checker shadow illusion“, Website des MIT Perceptual Science Group).
- Erklärung: Das visuelle System schätzt die Helligkeit einer Oberfläche (Reflexion) und nicht das ankommende Licht. Es berücksichtigt den Schatten und den Kontrast zu den Nachbarfeldern. Das nennt man Helligkeitskonstanz.
- Im Video sind A und B im gerenderten Bild nachgemessen identisch (beide RGB 73/72/70 im Test). Nach dem Anheben des Zylinders misst B rund doppelt so hell (146/144/139).
- Einschränkung: Durch die Videokompression von TikTok können einzelne Pixel minimal abweichen, sichtbar bleibt das nicht.
