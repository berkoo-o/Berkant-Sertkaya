# Black Friday: Sind die Rabatte echt? (Knete, 22.11.2026)

## Idee

Kurzes Video (etwa 40 Sekunden) vor dem Black Friday am Freitag, 27.11.2026. Der Nutzer wollte zwei kurze Videos für die Woche, ausdrücklich „nicht nur ein Bild, sondern mehrere Szenen“. Umsetzung im Knete-Look von „Wem gehört Deutschland?“: eine lange Knetplatte als Einkaufsstraße mit fünf Stationen in einer Reihe, die Kamera fährt von Station zu Station, am Ende zeigt sie die ganze Straße schräg von der Seite. Roter Faden ist das rote Rabatt-Schild.

## A. Drei Hook-Varianten

1. „Minus fünfzig Prozent? Am Black Friday sparst du im Schnitt gerade mal acht Prozent.“
2. „Die meisten Black-Friday-Deals gibt es an einem anderen Tag noch billiger.“
3. „Dieses Rabatt-Schild lügt, und zwar ganz legal.“

## B. Beste Hook: Variante 1

Sie stellt die große Zahl, die jeder kennt, gegen die echte, kleine Zahl. Das überrascht in der ersten Sekunde, und das Schild dreht sich im Bild genau auf „acht“ von „-50%“ zu „-8%“.

## C. Drehbuch

| Zeit | Station | Was passiert |
|---|---|---|
| 0–5,9 s | A Laden | Laden mit Markise und „SALE“-Schild, davor zwei Kundinnen. Das rote Schild „-50%“ ploppt auf, auf „acht“ dreht es sich zu „-8%“. |
| 5,9–11,4 s | B Regal | Ein leeres Regal füllt sich auf „hundert“ mit 100 kleinen Produkten, eine Lupe fährt darüber. |
| 11,4–20,1 s | C Preisschilder und Kalender | Fünf Produkte auf Sockeln, vier Preisschilder drehen sich auf den niedrigeren Preis. Dann fährt die Kamera hoch zum Kalender „November 2025“: Die Preiskurve zeichnet sich, der Black Friday ist rot markiert, zwei andere Tage sind noch günstiger (grüne Punkte). |
| 20,1–29,3 s | E Fernseher | Am Fernseher hängt ein rotes „-50%“-Schild. Zuerst wachsen die Säulen „echter Preis 549 €“ und „Black Friday 499 €“, dann die hohe Säule „UVP 999 €“. Ein roter Pfeil zeigt den großen Rabatt von der UVP, dann wird die UVP-Säule durchsichtig, eine Figur schüttelt den Kopf. |
| 29,3–32,1 s | F Handy | Ein großes Handy zeigt „Preisverlauf“, die Kurve zeichnet sich, der Tiefstpreis ploppt auf, die Käuferin hebt die Tüte. |
| 32,1–36,6 s | Ganze Straße | Die Kamera fährt zurück und zeigt alle Stationen, über der Straße ploppt eine Sprechblase mit Fragezeichen auf. |
| 36,6–40,4 s | Outro | Schlichte 2D-Outro wie im Gesetze-Video: Bild wird dunkler, „function“ blendet ein, roter Punkt ploppt auf. |

## D. Sprechertext für Tom (eleven_v4, Audio-Tags)

Erzeugt am 22.11.2026, zwei Takes, gewählt Take 1 (36,4 s): `voice/voice.mp3`, Wortzeiten `voice/words.json`.

```
[curious] Minus fünfzig Prozent? [short pause] Am Black Friday sparst du im Schnitt gerade mal acht Prozent.

[explaining] Das Vergleichsportal Idealo hat letztes Jahr die Preise in hundert beliebten Kategorien verfolgt. Vier von fünf Produkten waren am Black Friday zwar billiger als im Oktober, aber mehr als die Hälfte gab es an einem anderen Tag im November noch günstiger.

Und woher kommen die riesigen Prozente? Viele Shops rechnen den Rabatt nicht vom echten Preis, sondern von der unverbindlichen Preisempfehlung, die fast niemand zahlt.

Schau dir also den Preisverlauf an, bevor du zuschlägst. [curious] Was war dein bestes Black-Friday-Schnäppchen? [short pause] [warm] Schreib's in die Kommentare.
```

## E. Szenenplan (Technik)

Three.js im Knete-Look, gemeinsamer Baukasten `kit/knete_kit.js` (Materialien, Figuren, Kamera-Fit, Texte, 2D-Outro). Seite `blackfriday/bf.html`, Code `blackfriday/src/bf.js`. Stationen in einer Reihe (x −4,5 / −2,25 / 0 / 2,25 / 4,5), davor ein Gehweg, auf dem fünf Figuren auf einer geschlossenen Runde laufen (nur zwischen B und E, damit niemand vor dem Schild oder dem Handy vorbeiläuft). Kollisionsprüfung `node kit/shot.mjs blackfriday/bf.html check` ist leer. Standbilder: `node kit/shot.mjs blackfriday/bf.html <prefix> t…`, Vorschau: `node kit/preview.mjs blackfriday/bf.html out.mp4`.

## F. Higgsfield-Prompts

Dieses Video ist komplett in Three.js gebaut, Higgsfield wird nicht gebraucht. Falls einzelne Szenen dort nachgebaut werden sollen:

- Startbild A: „Claymation miniature shop on a lilac clay base with cream top, pastel peach shop with striped awning and a ‚SALE‘ sign, a big glossy red 3D sign ‚-50%‘ in front, two small clay figures with shopping bags, soft warm key light, dark violet background, plasticine texture with fingerprints, no text except the signs.“
- Bewegung A: „The red ‚-50%‘ sign flips around and shows ‚-8%‘, slow push-in, gentle bounce, claymation style.“
- Startbild E: „Claymation TV on a stand next to three clay bars, the tallest labelled UVP 999 €, a red curved arrow from the tallest bar down to the shortest, pastel mint mat, dark violet background.“

## G. Animations- und Kameraanweisungen

Ruhige Fahrten von Station zu Station (je etwa 0,8 s), dazwischen langsames Heranfahren. Alles, was erscheint, ploppt mit leichtem Überschwingen auf. Die Kamera bekommt ein Fokuslicht, damit die gezeigte Station hell ist. Am Ende schräger Blick über die ganze Straße.

## H. Übergänge und Sounddesign

Siehe `SOUNDS.md`. Kasse beim „-50%“, Kartenumdrehen beim Schild und bei zwei Preisschildern, leise Plopps und Klicks bei den großen Zahlen, Stift beim Zeichnen der Kurven, darunter sehr leise Einkaufszentrum-Atmosphäre und „Radar Focus“. Whooshes (vom Nutzer geliefert) bei den Kamerafahrten.

## I. TikTok-Titel, Beschreibung und Hashtags

Siehe `social/Texte.md`.

## Faktencheck (Stand 22.11.2026)

- Idealo-Preisanalyse Black Friday 2025: 79 % der untersuchten Produkte waren günstiger als im Oktober, durchschnittliche Ersparnis 8 %, untersucht wurden 100 beliebte Kategorien (Berichte von retail-news.de, t3n, Finanztip über die Idealo-Studie).
- Rund 52 % der Produkte waren 2025 an einem anderen Novembertag günstiger als am Black Friday (2024: 59 %). Die Originalstudie war aus der Cloud nicht abrufbar, die Werte stammen aus mehreren Berichten darüber.
- Viele Rabatte werden von der unverbindlichen Preisempfehlung (UVP) gerechnet, nicht vom Marktpreis (Idealo, Verbraucherzentrale Bayern 2022).
- Preise im Video (UVP 999 €, echter Preis 549 €, Black Friday 499 €) sind ein Beispiel und als solches gekennzeichnet.
