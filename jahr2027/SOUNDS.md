# Sounds im Video „Was ändert sich 2027 für dich?“

Seit der dritten Fassung (Wunsch des Nutzers vom 19.11.2026: „verwende andere Sounds, benutze SFX oder Soundza“) kommen alle Geräuscheffekte aus der kostenlosen Soundza-Bibliothek. Es sind ausschließlich echte Aufnahmen, kein Sound ist KI-erzeugt (`ai_content` fehlt bei allen). Die Dateien liegen nur lokal in `jahr2027/sfx/soundza/` und sind nicht im Repo, weil die Soundza-Lizenz die Weitergabe einzelner Dateien verbietet. Die kommerzielle Nutzung im Video ist erlaubt, eine Nennung ist nicht nötig; Soundza freut sich über den Tag @soundza_audio.

Unverändert bleiben die Musik „Radar Focus“ (Epidemic Sound, ID 6f90c76d-de15-4a4d-9d51-cbea2cbbe75f, `rundfunk/sfx/epidemic/`) und die beiden vom Nutzer gelieferten Übergangssounds `rundfunk/sfx/whoosh.wav` und `rundfunk/sfx/clicks.wav`.

Gemischt wird mit `python3 audio.py` im Ordner `jahr2027/` (`python3 audio.py -v` zeigt zusätzlich, wo die Effekte im Verhältnis zur Stimme am lautesten sind). Die Zeiten sind Stimm-Zeiten; im Video beginnt die Stimme bei 0,15 Sekunden.

| Datei | Soundza-ID | Titel | Einsatz |
|---|---|---|---|
| marker_scratch | cmtlveiqydbpscqyzhj7wkg5x | Crisp Pencil Scratch (wet paper) | alle Striche und Kreise des roten Filzstifts, auch das Logo |
| pencil_scratch2 | cmv0gp82z008a06i9kdv5qeze | Pencil Scratch 2 | Bleistift: „geplant“, Unterstrich, 259 € gestrichen, 267 €, gestrichelter Kreis, Haken bei „freiwillig“ |
| cover_tear1 | cmv5mzdr700ul06l4ctov5cv0 | Cover Paper Tear 1 | Deckblatt reißt ab (7 s), letzte Seite vor der Outro |
| tear4 | cmv5swsdk00yq06l6krildtr3 | Paper Tear 4 | Seite 1. Januar mit dem Zettel reißt ab (42 s) |
| tear8 | cmv5swsdk00ys06l6m9h7w4k2 | Paper Tear 8 | Seite 1. Juli reißt ab (63,4 s) |
| rustle_slide | cmukby4jej1z2td8905bzxb8b | Paper Rustle Slide | Lohnabrechnung kommt heraus; Geldbündel rutscht bei der privaten Übergabe |
| card_slide | cmv0il4an009506l5p37quq3s | Card Slide 1 | Deutschlandticket |
| book_drop | cmukbw8xe5u7cyfpd5ljbes18 | Book Drop | Riester-Ordner kippt um; gedämpft, wenn das Bündel auf dem Tisch landet |
| shimmer | cmvjom5v0wesjkcnnq42gu3ql | Sparkle Shimmer | ganz leise: Kurve im Depot, Glanz des neuen Führerscheins, Rentenmünze, Übersicht |
| coins2 | cmv5p0bmi00l506l5t616c4y5 | Coins 2 | Münzen fallen ins Altersvorsorgedepot |
| paper3 | cmv0gjx4z001l06l8aylcu9uz | Paper 3 | Zettel „geplant“ landet; Musterungsbrief kommt |
| knock | cmv8zxseeyz42m1kvc48ask6x | Wood Door Knock | einzelne Schläge, hochgefiltert: Hufe des Sparschweins (sehr leise), Holzfiguren landen, kippen und hüpfen |
| coin_box | cmukeapx5pqtvs1kl3eywua9n | Coin Drop Metal Box | drei Münzen fallen ins Sparschwein (tiefpassgefiltert, leicht verschieden gestimmt) |
| glock | cmvcmgxpuvpqbjdx0i99c21ia | Glockenspiel Success Chime | Balken 2027 wächst (tiefer gestimmt, leise); Glocke auf dem fertigen Logo |
| card_flip | cmv5t3dbz001806ju9mdth3am | Card Playing 14 | alter Führerschein dreht sich in den neuen |
| page_flips | cmv0gp82z008806i9v08lw7cm | Sketchbook Page Flips 2 | Februar bis Juni fliegen vorbei |
| quarter_desk | cmukebqgd4asz39ggzzvyc8n7 | Quarter Dropping on Desk | zusätzliche Münze landet auf dem Rentenstapel |
| envelope | cmukbvw5bktolkm5jm3d6jgcb | Envelope Unfolding | Umschlag öffnet sich hinten, der Brief gleitet nach vorne heraus |

Heruntergeladen, aber nicht verwendet: card_slide2 (cmv5t3dbz001j06jucnmb2n5c, Card Slide 2).

Abgelöst (Fassung 1 und 2, Epidemic Sound): marker_line, tear_04, tear_03, tear_notepad, marker_circle, marker_circle2, receipt_print, card_slide, binder_drop, paper_drop, pencil_write, pencil_v, crayon_circle, pages_flick, notes_count, coin_single, piggy_coin4, piggy_ceramic, piggy_coin2, tiny_steps, card_flip, coins_drop, envelope_flap, envelope_open, shimmer, column_chord. Die IDs stehen in der Git-Geschichte dieser Datei.

Die Stimme ist Tom Magic (ElevenLabs, eleven_v4), Take 1 in `voice/voice.mp3`, Take 2 als Alternative in `voice/take2.mp3`. Die Wortzeiten stammen aus der ElevenLabs-Transkription (`voice/words_take1.json`).
