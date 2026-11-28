# Sounds im Video „Black Friday: Sind die Rabatte echt?“ (Knete)

Gemischt mit `python3 audio_bf.py` im Ordner `blackfriday/` (gemeinsamer Mischer `kit/mix.py`), Ergebnis `mix_bf_music.flac` und `mix_bf_fx.flac`. Die Dateien liegen nur lokal und sind nicht im Repo, weil die Lizenz die Weitergabe einzelner Dateien verbietet: neue Dateien in `blackfriday/sfx/epidemic/` (per `.gitignore` ausgeschlossen), wiederverwendete in `vermoegen/sfx/epidemic/`, `rundfunk/sfx/` und `jahr2027/sfx/soundza/`. Alle Zeiten sind Stimm-Zeiten (Take 1); im Video beginnt die Stimme bei 0,15 s. Lautheit −14 LUFS.

Musik: „Radar Focus“ (Blue Saga, Epidemic Sound, ID 6f90c76d-de15-4a4d-9d51-cbea2cbbe75f), Sub-Bass abgesenkt, 22 dB unter der Stimme im Bereich über 250 Hz, sanftes Ducking. Übergänge mit den vom Nutzer gelieferten `rundfunk/sfx/whoosh.wav` und `clicks.wav`.

| Datei | Quelle und ID | Titel | Einsatz |
|---|---|---|---|
| kaching | Epidemic 6caad476-d3e4-44ad-afa1-1e9187c46bd0 | Cash Register, Kaching, Money | das rote „-50%“-Schild ploppt auf (0,3 s) |
| mall | Epidemic a7a0ca04-4d2b-4f9a-a4d1-bdd12d246262 | Ambience, Public Place, Shopping Mall, Walla | sehr leises Klangbett (nur Höhen) unter dem ganzen Video |
| pop | Epidemic (Vermögen-Video) | Cartoon, Pop, Small Lid | Schild, Regal füllt sich, Punkte im Preisverlauf, Balken, Sprechblase, Outro |
| card_flip, shimmer, marker_scratch, pencil_scratch2, glock | Soundza (2027-Video) | | Schild dreht sich, Preisschilder drehen sich (nur zwei), Regal glitzert, Preiskurve und Handy-Kurve werden gezeichnet, Glocke beim Punkt |

Die Stimme ist Tom Magic (ElevenLabs, eleven_v4), Take 1 in `voice/voice.mp3` (36,4 s), Take 2 als Alternative. Wortzeiten in `voice/words.json`.
