# Sounds im Video „Was ändert sich 2027 für dich?“

Alle Geräusche und die Musik stammen aus dem Epidemic-Sound-Connector. Die Dateien liegen nur lokal in `jahr2027/sfx/epidemic/` und `rundfunk/sfx/epidemic/` und sind nicht im Repo, weil die Lizenz die Weitergabe einzelner Dateien verbietet. Gemischt wird mit `python3 audio.py` im Ordner `jahr2027/`. Die Zeiten sind Stimm-Zeiten, im Video beginnt die Stimme bei 0,15 Sekunden.

| Datei | Epidemic-ID | Titel | Einsatz |
|---|---|---|---|
| music_radar_focus | 6f90c76d-de15-4a4d-9d51-cbea2cbbe75f | Radar Focus (Blue Saga), 100 BPM | Musikbett ab Trackbeginn, Sub-Bass abgesenkt, über 250 Hz 22 dB unter der Stimme, sanftes Ducking |
| marker_line | 9f76f0f2-0cc1-44f4-b1e4-a673573582fe | Objects, Writing, Marker Pen, Draw Line On Cardboard Sheet | Hook: der rote Stift streicht das Geldbündel durch; 65,9 s das rote Kreuz |
| tear_04 | e86cd981-a794-4d9c-82d9-70228e95a487 | Paper, Rip, Telephone Directory, Yellow Pages, Page Tear Out 04 | Deckblatt reißt ab (7 s), Seite 1. Juli reißt ab (63,4 s) |
| tear_03 | 4c3d5b9c-349a-4da9-bccb-eb9495d22561 | Paper, Rip, Telephone Directory, Yellow Pages, Page Tear Out 03 | Seite 1. Januar mit dem Zettel reißt ab (42 s) |
| tear_notepad | 9da88452-eb77-480e-940c-65b27116d6ed | Paper, Rip, Notepad, Small, Binded Page, Tear Out, Several | letzte Seite vor der Outro |
| marker_circle | a836c16e-6b5d-4d44-8eda-12f135d8dfe8 | Objects, Writing, Marker Writing, Circle | roter Kreis um den 1. Januar und den 10. Juli, Kreis für den Punkt im Logo |
| marker_circle2 | b640d342-e24b-4ecc-9611-e02e7dd9c4c9 | Objects, Writing, Color Marker On Paper, Circle | Kreis um den 19. Januar, der Stift schreibt „function“ |
| receipt_print | 54644c85-f1a0-4cbc-adb0-4376fe506ade | Machines, Antique, Cash Register, Printing, Receipt, Light | die Lohnabrechnung erscheint (leise, gedämpft) |
| card_slide | 604c921e-5e19-429e-88a7-6319719f8423 | Objects, Misc, Credit Card, Slide On Table | Deutschlandticket und Führerschein |
| binder_drop | 42c2a242-c964-43b2-b677-a7a4210a53c2 | Objects, Book, Books, Pile Of School Homework, Drop Down On Table | der Riester-Ordner kippt um |
| paper_drop | cda39aae-673d-4bae-a99c-d47d84d646fe | Paper, Impact, Letter, Drop On Table 02 | der Zettel „geplant“ landet auf der Seite |
| pencil_write | d283b949-59d2-4b9b-9eaa-b813f517dd90 | Objects, Writing, Pencil On Paper, Letter | der Bleistift schreibt „geplant“ und „267 €“ |
| pencil_v | 8973628b-5791-4098-8302-83bfd7133a26 | Objects, Writing, Pencil On Paper, Letter V | Unterstrich, 259 € durchgestrichen, Haken bei „freiwillig“ |
| crayon_circle | 65e5776d-953e-43cb-a4fc-922384a5f82d | Objects, Writing, Crayon, Draw Circle On Paper | gestrichelter Bleistiftkreis um 267 € |
| pages_flick | 5c96103c-85ee-4d3b-96fc-0413e623bc03 | Document, Thick, Many Pages, Flick Through Fast 03 | Februar bis Juni fliegen vorbei |
| notes_count | 45986e3f-12c8-4914-b106-956defaf3460 | Money, Notes, Count Into Hand | private Übergabe des Bündels |
| coin_single | 11214eb1-567c-4cff-953d-8408c4c26832 | Coin, Money, Pound, Coin, Down On Table | drei leise Münzen ins Sparschwein, die zusätzliche Münze auf dem Rentenstapel |
| coins_drop | 8e7e3f28-f5cc-4f6c-9342-7e762b5b98a6 | Coins, Drop 01 | Münzen fallen ins Altersvorsorgedepot |
| envelope_flap | 3c4bcbd5-7781-4843-9cbc-086fb37aa0c1 | Paper, Handle, Envelope, Flap, Open | der Musterungsbrief kommt |
| envelope_open | d09076fc-ff2c-49da-8af1-5f0ecb6e1de8 | Paper, Handle, Opening Envelope | der Brief geht auf |
| shimmer | 59869c0c-1388-480e-b06d-4592db0c3415 | Magic, Shimmer, Bright | ganz leise: Kurve im Depot, Glanz der Rentenmünze, Übersicht |
| column_chord | 4b2516e0-8522-44f0-9337-c36c44420ab4 | User Interface, Beep, Button, Chord, Up, Soft | der Balken 2027 wächst; Akkord auf dem fertigen Logo |

Dazu die Epidemic-Sounds, die der Nutzer früher geliefert hat: `rundfunk/sfx/whoosh.wav` für die Fahrten der Objekte und `rundfunk/sfx/clicks.wav`, wenn eine Zahl erscheint (nur an Schlüsselstellen, nicht bei jeder Zahl).

Heruntergeladen, aber nicht verwendet: stamp (d530c5b9-3047-42fe-a06a-7c479d637b60, Office Supplies, Rubber Stamp, Document 01).

Die Stimme ist Tom Magic (ElevenLabs, eleven_v4), Take 1 in `voice/voice.mp3`, Take 2 als Alternative in `voice/take2.mp3`. Die Wortzeiten stammen aus der ElevenLabs-Transkription (`voice/words_take1.json`).
