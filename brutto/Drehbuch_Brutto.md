# 3.000 € brutto: So viel bleibt dir (Knete, 22.11.2026)

## Idee

Kurzes Video (etwa 42 Sekunden), das jederzeit läuft und viele Kommentare bringt, weil jeder mit seinem eigenen Gehalt vergleicht. Mehrere Szenen auf einer Knetplatte (Wunsch des Nutzers: „nicht nur ein Bild“): Büro mit Chef, Lohnzettel, fünf Häuser, in die das Geld fließt. Roter Faden ist der rote Netto-Teil des Geldturms.

## A. Drei Hook-Varianten

1. „Du kostest deinen Chef jeden Monat über 3.600 Euro. Auf deinem Konto landen gut 2.050. Wo ist der Rest?“
2. „Von 3.000 Euro brutto siehst du fast tausend Euro nie.“
3. „So viel von deinem Gehalt behält der Staat wirklich.“

## B. Beste Hook: Variante 1

Sie beginnt bei der größeren Zahl, die kaum jemand kennt (was man den Chef wirklich kostet), und endet mit einer Frage, die das Video beantwortet.

## C. Drehbuch

| Zeit | Station | Was passiert |
|---|---|---|
| 0–8,6 s | A Büro | Chef im Anzug und Mitarbeiter vor dem Firmengebäude (Schild „FIRMA“ auf dem Dach), daneben ein Wagen mit dem Geldturm „3.639 €“ (sieben farbige Scheiben, unten rot das Netto). Auf „Konto“ werden alle Scheiben außer der roten durchsichtig, das Schild „netto 2.054 €“ ploppt auf, auf „Wo ist der Rest?“ erscheint ein Fragezeichen. |
| 8,6–13,0 s | B Lohnzettel | Großer Lohnzettel, die Zeilen „Brutto 3.000 €“, „Steuerklasse I“, „Kinder keine“ erscheinen auf Toms Worte. |
| 13,0–17,9 s | Wagen rollt | Der Wagen rollt in die Lücke zwischen den fünf Häusern (Rente, Krankenkasse und Pflege links, Arbeitsagentur und Finanzamt rechts), damit der hohe Geldturm kein Haus verdeckt. Die lila Scheibe „+ 639 € Chef“ fliegt zu den vier Sozialversicherungs-Häusern, die kurz hüpfen. |
| 17,9–32,0 s | D Häuser | Jede Scheibe fliegt in ihr Haus, sobald Tom sie nennt: Rentenversicherung 279 €, Krankenkasse 262,50 €, Pflegeversicherung 72 €, Arbeitsagentur 39 €, Finanzamt 293 €. Über jedem Haus erscheint der Betrag. Der Mitarbeiter läuft hinter den Häusern zum Wagen. |
| 32,0–35,2 s | E Netto | Übrig ist nur der rote Netto-Teil „2.054 €“, der Mitarbeiter steht daneben und hebt die Arme. |
| 35,2–38,8 s | Ganze Platte | Die Kamera zeigt alles, eine Sprechblase mit Fragezeichen ploppt auf. |
| 38,8–42,5 s | Outro | Schlichte 2D-Outro wie im Gesetze-Video. |

## D. Sprechertext für Tom (eleven_v4, Audio-Tags)

Erzeugt am 22.11.2026, zwei Takes, gewählt Take 2 (38,6 s): `voice/voice.mp3`, Wortzeiten `voice/words.json`.

```
[curious] Du kostest deinen Chef jeden Monat über dreitausendsechshundert Euro. [short pause] Auf deinem Konto landen gut zweitausendfünfzig. Wo ist der Rest?

[explaining] Nehmen wir dreitausend Euro brutto, Steuerklasse eins, keine Kinder. Dein Chef legt über sechshundert Euro obendrauf, für Rente, Krankenkasse und Co.

Von deinen dreitausend gehen dann zweihundertneunundsiebzig Euro an die Rentenversicherung, rund zweihundertsechzig an die Krankenkasse, zweiundsiebzig an die Pflege und neununddreißig an die Arbeitslosenversicherung. Dazu kommen knapp dreihundert Euro Lohnsteuer.

Übrig bleiben rund zweitausendvierundfünfzig Euro. [curious] Und wie viel bleibt bei dir? [short pause] [warm] Schreib's in die Kommentare.
```

## E. Szenenplan (Technik)

Three.js im Knete-Look mit dem Baukasten `kit/knete_kit.js`. Seite `brutto/brutto.html`, Code `brutto/src/brutto.js`. Der Geldturm ist maßstabsgetreu (1.000 € = 0,55 Einheiten Höhe), die Scheiben haben die Farben ihrer Häuser. Das Schild „FIRMA“ steht auf dem Dach, an der Vorderseite der Häuser sitzen Schild und Tür auf freier Wand, kein Fenster liegt dahinter (Nutzer, 22.11.2026: „Firma steht in den Fenstern drin“). Kollisionsprüfung `node kit/shot.mjs brutto/brutto.html check` ist leer (der Mitarbeiter läuft hinter den Häusern, nicht durch sie hindurch).

## F. Higgsfield-Prompts

Komplett in Three.js gebaut, Higgsfield wird nicht gebraucht. Falls nötig:

- Startbild: „Claymation office building on a lilac clay base, a clay boss in a dark suit and a clay employee in mint, next to them a wooden cart with a tall tower of stacked clay slices in pastel colours, the bottom slice glossy red, soft warm light, dark violet background, plasticine texture.“
- Bewegung: „The cart rolls to a row of five small clay houses, each slice flies in an arc into one house, the houses bounce, claymation style.“

## G. Animations- und Kameraanweisungen

Ruhige Fahrten zwischen den Stationen, der Wagen rollt mit drehenden Rädern. Die Scheiben fliegen in einem Bogen und werden dabei schmaler, damit sie ins Haus passen. Fokuslicht folgt der Kamera.

## H. Übergänge und Sounddesign

Siehe `SOUNDS.md`. Münzklang im Einstieg, Klicks bei den großen Zahlen, Papier beim Lohnzettel, Rollen des Wagens, Münze in die Kasse nur bei der ersten und der letzten Scheibe, sonst leise Plopps.

## I. TikTok-Titel, Beschreibung und Hashtags

Siehe `social/Texte.md`.

## Faktencheck (Rechnung für 2026)

- Beitragssätze 2026: Rentenversicherung 18,6 %, Arbeitslosenversicherung 2,6 %, Krankenversicherung 14,6 % plus durchschnittlicher Zusatzbeitrag 2,9 %, Pflegeversicherung 3,6 % plus 0,6 % Zuschlag für Kinderlose (Haufe, AOK, TK).
- Arbeitnehmer bei 3.000 € brutto: RV 279,00 €, KV 262,50 € (7,3 % + 1,45 %), PV 72,00 € (1,8 % + 0,6 %), AV 39,00 €.
- Lohnsteuer 2026, Steuerklasse I: Jahresbrutto 36.000 € minus Arbeitnehmer-Pauschbetrag 1.230 €, Sonderausgaben-Pauschbetrag 36 € und Vorsorgepauschale (RV 3.348 €, KV 3.042 € mit ermäßigtem Satz 7,0 % + 1,45 %, PV 864 €) ergibt ein zu versteuerndes Einkommen von 27.480 €. Tarif 2026 (§ 32a EStG, Grundfreibetrag 12.348 €, Zone bis 69.878 €: (173,10 · z + 2.397) · z + 1.034,87): 3.517 € im Jahr, 293,08 € im Monat. Solidaritätszuschlag fällt nicht an, Kirchensteuer nicht eingerechnet.
- Netto: 3.000 − 279 − 262,50 − 72 − 39 − 293,08 = 2.054,42 €.
- Arbeitgeber zusätzlich: RV 279 €, KV 262,50 €, PV 54 €, AV 39 €, Insolvenzgeldumlage 4,50 € = 639 €, also mindestens 3.639 € im Monat (ohne Umlagen U1/U2 und Unfallversicherung, die je nach Betrieb dazukommen).
- Einschränkung: In Sachsen ist der Pflegebeitrag für Arbeitnehmer höher, mit Kirchensteuer oder anderer Krankenkasse ändert sich das Netto um einige Euro.
