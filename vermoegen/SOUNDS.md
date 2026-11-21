# Sounds im Video „Wem gehört eigentlich Deutschland?“

Musik und Effekte kommen aus dem Epidemic-Sound-Connector, dazu einige Soundza-Aufnahmen (echte Aufnahmen, keine KI). Die Dateien liegen nur lokal und sind nicht im Repo, weil die Lizenz die Weitergabe einzelner Dateien verbietet: neue Dateien in `vermoegen/sfx/epidemic/`, wiederverwendete in `bankrun/sfx/epidemic/`, `rundfunk/sfx/epidemic/` und `jahr2027/sfx/soundza/`. Gemischt wird mit `python3 audio.py` im Ordner `vermoegen/` (`-v` zeigt, wo die Effekte im Verhältnis zur Stimme am lautesten sind). Alle Zeiten sind Stimm-Zeiten (Take 1); im Video beginnt die Stimme bei 0,15 Sekunden. Lautheit etwa −14,8 LUFS, Spitzen −1,5 dBTP.

Musik: „Radar Focus“ (Blue Saga, Epidemic Sound, ID 6f90c76d-de15-4a4d-9d51-cbea2cbbe75f), Sub-Bass abgesenkt, 22 dB unter der Stimme im Bereich über 250 Hz, sanftes Ducking. Dazu die vom Nutzer gelieferten Übergangssounds `rundfunk/sfx/whoosh.wav` und `rundfunk/sfx/clicks.wav` (Kamerafahrten und große Zahlen).

| Datei | Quelle und ID | Titel | Einsatz |
|---|---|---|---|
| rumble | Epidemic d5a34416-fc8e-413e-acd8-1575316c4313 | Designed, Rumble, Low Sub | die markierten Gebäude versinken (22,9 s), leise und hochpassgefiltert |
| pop | Epidemic 5c5c3085-0e0b-4c29-bba3-c8779dc6daa9 | Cartoon, Pop, Small Lid | die roten Fähnchen ploppen auf (einmal pro Welle, nicht bei jedem Fähnchen), der rote Punkt im Logo |
| ambience_city | Epidemic e825d157-4017-4cdd-a304-4338cb69f48b | Ambience, Urban, City, Hum, Distant Traffic | Stadt-Klangbett, abends etwas leiser |
| cloth_flap | Epidemic af1cd4d8-402d-42ba-86f7-74b55a8dead8 | Cloth, Flap, Flag Move 01 | Fähnchen flattern, die Fahne löst sich in der Outro |
| money_count | Epidemic 45986e3f-12c8-4914-b106-956defaf3460 | Money, Notes, Count Into Hand | der Geldturm der reichsten zehn Prozent wächst |
| money_handling | Epidemic f44fd9e3-ed6c-4751-b95a-7fd664ccc39b | Paper, Handle, Money, Banknotes, Handling | Stapel wachsen, Geldtürme steigen auf, Haus und Aktien beim Einfamilienhaus |
| coins_drop | Epidemic 8e7e3f28-f5cc-4f6c-9342-7e762b5b98a6 | Coins, Drop 01 | kleine Münzstapel der ärmeren Hälfte, Münzen vor den Haustüren |
| coins_handful | Epidemic 528e259c-0839-4835-8fc8-f829cbbe1c0b | Coins, Handful, Drop Onto Wood | Münzen aus dem Sparschwein („Erspartes“) |
| coin_spin | Epidemic 0d8e2a38-4785-43fc-81d9-d77fb340fcb2 | Coin, Single, Spin On Table | die Miete rollt als Münzen zum Geldturm des Vermieters |
| envelope_flap | Epidemic 3c4bcbd5-7781-4843-9cbc-086fb37aa0c1 | Paper, Handle, Envelope, Flap, Open | der Geldstapel mit roter Schleife wird übergeben |
| shimmer | Soundza cmvjom5v0wesjkcnnq42gu3ql | Sparkle Shimmer | die Linie „Top 10 %“ erscheint |
| rustle_slide | Soundza (2027-Video) | Rustle Slide | der Kredit wird vom Stapel genommen |
| glock | Soundza cmvcmgxpuvpqbjdx0i99c21ia | Glockenspiel Success Chime | tiefer gestimmt bei der Übergabe und beim roten Punkt |

Die Stimme ist Tom Magic (ElevenLabs, eleven_v4), Take 1 in `voice/voice.mp3` (66,6 s), Take 2 als Alternative in `voice/take2.mp3`. Die Wortzeiten stammen aus der ElevenLabs-Transkription (`voice/words_take1.json`).
