# Weihnachtsgeld: Warum bleibt davon so wenig? (Knete, Entwurf vom 26.11.2026)

## Idee

Hintergrund: Winternacht in Nachtblau mit leise fallendem Schnee (Wahl des Nutzers am 26.11.2026 aus vier Varianten, `Hintergrund_Vergleich.jpg`). Kurzes Video (etwa 40 Sekunden) passend zum Monatsende November, wenn das Weihnachtsgeld auf dem Konto landet. Es knüpft an „3.000 € brutto: So viel bleibt dir“ an (gleiche Person, gleiche Rechnung) und erklärt, warum vom Weihnachtsgeld weniger übrig bleibt als von einem normalen Monatsgehalt. Knete-Look mit mehreren Stationen auf einer Platte, roter Faden ist der rote Geschenkumschlag „Weihnachtsgeld“, dessen roter Netto-Teil am Ende übrig bleibt.

## A. Drei Hook-Varianten

1. „Von deinem Weihnachtsgeld bleibt weniger übrig als von deinem Gehalt. Und zwar deutlich.“
2. „Dreitausend Euro Weihnachtsgeld? Auf dem Konto landen knapp siebzehnhundert.“
3. „Wird Weihnachtsgeld extra besteuert? Ja und nein.“

## B. Beste Hook: Variante 2

Sie nennt sofort zwei konkrete Zahlen, die jeder mit seinem eigenen Weihnachtsgeld vergleicht, und die Lücke von über 1.300 Euro überrascht. Das sorgt für Kommentare.

## C. Drehbuch

| Zeit (ca.) | Station | Was passiert |
|---|---|---|
| 0–5 s | A Weihnachtsbaum | Kleiner Knete-Tannenbaum, darunter ein roter Umschlag „Weihnachtsgeld 3.000 €“. Eine Figur öffnet ihn, nur ein kleinerer Stapel kommt heraus, das Schild „1.684 €“ ploppt auf. |
| 5–13 s | B Wer bekommt es? | Zwei Reihen mit je zehn Knetfiguren vor zwei Firmen. Links „mit Tarifvertrag“: acht bekommen ein rotes Geschenk. Rechts „ohne Tarifvertrag“: nur vier. Große Zahl „52 %“. |
| 13–27 s | C Zwei Geldtürme | Zwei gleich hohe Türme auf Wagen, „Gehalt 3.000 €“ und „Weihnachtsgeld 3.000 €“. Die Sozialversicherung (652,50 €) fliegt bei beiden gleich ab. Die Lohnsteuer ist links 293 €, rechts 664 € dick. Übrig bleiben die roten Teile 2.054 € und 1.684 €. |
| 27–35 s | D Steuertreppe | Eine Treppe mit steigendem Steuersatz. Das Jahresgehalt füllt die unteren Stufen, das Weihnachtsgeld landet oben auf der Stufe „28 %“. |
| 35–38 s | Ganze Platte | Kamera zeigt alles, Sprechblase mit Fragezeichen. |
| 38–41 s | Outro | Schlichte 2D-Outro wie bei den anderen Knete-Videos. |

## D. Sprechertext für Tom (eleven_v4, Audio-Tags)

```
[curious] Dreitausend Euro Weihnachtsgeld? [short pause] Auf dem Konto landen knapp siebzehnhundert.

[explaining] Überhaupt bekommt nur etwa jeder Zweite Weihnachtsgeld. Mit Tarifvertrag sind es fast acht von zehn, ohne nur gut vier.

Nehmen wir dreitausend Euro brutto, Steuerklasse eins. Von deinem normalen Gehalt bleiben rund zweitausendfünfzig Euro. Vom Weihnachtsgeld in gleicher Höhe nur knapp siebzehnhundert.

Die Sozialabgaben sind gleich. Aber die Lohnsteuer ist mehr als doppelt so hoch: rund sechshundertsechzig statt knapp dreihundert Euro. Denn das Weihnachtsgeld kommt oben auf dein Jahresgehalt, und dort ist der Steuersatz am höchsten.

[curious] Bekommst du Weihnachtsgeld? [short pause] [warm] Schreib's in die Kommentare.
```

(etwa 95 Wörter, rund 38 Sekunden)

## Feinschliff nach dem Testvideo (26.11.2026, Wunsch „so viel Feinschliff wie möglich“)

Karte ragt schon im ersten Bild mit „3.000 €“ aus dem Umschlag; rote Klammer „−370 € weniger netto“ zwischen den Türmen; Türme stehen schon, wenn die Kamera ankommt; breitere Platte mit mehr Abstand zwischen den Stationen; Schnee auf Baum und Platte, funkelnde Lichterkette; Figuren ohne Geschenk lassen den Kopf hängen; Steuer-Skala von „0 %“ bis „28 %“, auf dem Stapel „im Schnitt knapp 10 % Lohnsteuer“ (3.517 € von 36.000 €); Hintergrund Winternacht mit fallendem Schnee; Thumbnail im Galerie-Knete-Stil.

## E. Szenenplan (Technik)

Three.js im Knete-Look mit `kit/knete_kit.js`, Seite `weihnachtsgeld/wg.html`, Code `weihnachtsgeld/src/wg.js`. Die Geldtürme aus `brutto/src/brutto.js` (1.000 € = 0,55 Einheiten) werden wiederverwendet. Stationen in einer Reihe, keine hohen Objekte vor Zielen, Figuren nur auf geschlossenen Runden.

## F. Higgsfield-Prompts

Komplett in Three.js gebaut, Higgsfield wird nicht gebraucht. Falls nötig: „Claymation Christmas tree on a lilac clay base, a glossy red clay envelope labelled ‚Weihnachtsgeld‘ underneath, two clay money towers on wooden carts next to it, soft warm light, dark violet background, plasticine texture.“

## G. Animations- und Kameraanweisungen

Ruhige Fahrten zwischen den Stationen, alles ploppt mit leichtem Überschwingen auf, Scheiben fliegen im Bogen in ihre Häuser wie im Brutto-Video. Fokuslicht folgt der Kamera.

## H. Übergänge und Sounddesign

Musik „Radar Focus“, Whooshes des Nutzers bei den Kamerafahrten, Papierrascheln beim Umschlag, leise Glöckchen nur beim ersten Geschenk, Münzklang bei den Netto-Beträgen. Liste folgt in `SOUNDS.md`.

## I. TikTok-Titel, Beschreibung und Hashtags

Siehe `social/Texte.md`.

## Faktencheck (Stand 26.11.2026)

- Weihnachtsgeld 2026: 52 % der Beschäftigten bekommen es; mit Tarifvertrag 78 %, ohne 42 % (WSI-Tarifarchiv, Auswertung von Lohnspiegel.de, Pressemitteilung 13.11.2026; Online-Befragung, nicht repräsentativ).
- Rechnung 2026, Steuerklasse I, keine Kinder, keine Kirchensteuer, durchschnittlicher Zusatzbeitrag 2,9 %, Monatsgehalt 3.000 €, Weihnachtsgeld 3.000 € (ein volles Monatsgehalt):
  - Sozialversicherung auf das Weihnachtsgeld wie auf ein Monatsgehalt: RV 279 €, KV 262,50 €, PV 72 €, AV 39 € = 652,50 € (Jahresbrutto 39.000 € liegt unter den Beitragsbemessungsgrenzen).
  - Lohnsteuer als sonstiger Bezug nach der Jahreslohnmethode: Jahressteuer mit Weihnachtsgeld minus ohne. Ohne: zvE 27.480 € → 3.517 €. Mit: Vorsorgepauschale 7.859 € (RV 9,3 %, KV 8,45 %, PV 2,4 %; der neue Teilbetrag für die Arbeitslosenversicherung entfällt, weil KV und PV schon über der Grenze von 1.900 € liegen), zvE 29.875 € → 4.181 €. Lohnsteuer auf das Weihnachtsgeld: 664 €. Kein Solidaritätszuschlag.
  - Netto-Weihnachtsgeld: 3.000 − 652,50 − 664 = 1.683,50 €. Zum Vergleich ein normaler Monat: 2.054,42 € netto, Lohnsteuer 293,08 €.
  - Grenzsteuersatz bei zvE 29.875 €: rund 28 %.
- Die Rechnung bestätigt auch das Brutto-Video: Der neue Teilbetrag für die Arbeitslosenversicherung in der Vorsorgepauschale 2026 zählt nur, solange er zusammen mit Kranken- und Pflegeversicherung 1.900 € nicht übersteigt (BMF-Schreiben vom 14.08.2025).
- Hinweis fürs Video: Das Weihnachtsgeld wird nicht mit einer eigenen „Sondersteuer“ belegt; es ist dieselbe Einkommensteuer, nur fällt es in den Bereich mit dem höchsten persönlichen Steuersatz. Über die Steuererklärung gibt es dafür normalerweise nichts zurück.
