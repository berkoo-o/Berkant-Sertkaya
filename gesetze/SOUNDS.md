# Sounds im Video „Diese 5 Gesetze haben Deutschland richtig wütend gemacht“ (Podest-Fassung)

Musik und Effekte kommen aus dem Epidemic-Sound-Connector, dazu einige Soundza-Aufnahmen (echte Aufnahmen, keine KI). Die Dateien liegen nur lokal und sind nicht im Repo, weil die Lizenz die Weitergabe einzelner Dateien verbietet: neue Dateien in `gesetze/sfx/epidemic/` (per `.gitignore` ausgeschlossen), wiederverwendete in `vermoegen/sfx/epidemic/`, `rundfunk/sfx/epidemic/` und `jahr2027/sfx/soundza/`. Gemischt wird mit `python3 audio_podest.py` im Ordner `gesetze/` (`-v` zeigt, wo die Effekte im Verhältnis zur Stimme am lautesten sind), Ergebnis `mix_podest_music.flac` und `mix_podest_fx.flac`. Alle Zeiten sind Stimm-Zeiten (Take 2); im Video beginnt die Stimme bei 0,15 Sekunden. Lautheit etwa −14,9 LUFS, Spitzen −1,5 dBTP.

Musik: „Radar Focus“ (Blue Saga, Epidemic Sound, ID 6f90c76d-de15-4a4d-9d51-cbea2cbbe75f), Sub-Bass abgesenkt, 22 dB unter der Stimme im Bereich über 250 Hz, sanftes Ducking. Dazu die vom Nutzer gelieferten Übergangssounds `rundfunk/sfx/whoosh.wav` (Sprünge des § und Kamerafahrten) und `rundfunk/sfx/clicks.wav` (große Zahlen, hektische Ampel).

| Datei | Quelle und ID | Titel | Einsatz |
|---|---|---|---|
| tractor | Epidemic c2c991e6-9834-4da5-9106-54174440b33a | Vehicles, Farm, Tractor, Start, Engine, Stationary, Stop | Traktor springt an (15,2 s), Leerlauf, schneller abgespielt als vorbeirollende Kolonne (19,6 s) |
| chant | Epidemic 198abbbe-8711-40cc-887d-54b5f0d407db | Ambience, Protest, Environmental Protest, Chanting 01 | Schulstreik (höher gestimmt), Corona-Menge und Sturm auf die Treppe, Arme hoch bei Hartz IV |
| crowd | Epidemic 273dd863-cc20-4411-8f93-554d548b54d5 | Ambience, Protest, Environmental Protest, Walla, Distant Chanting | die große Menge bei Hartz IV (ab 42,3 s) |
| fence | Epidemic 40848e3d-3355-47c7-9f57-ac5d08824e77 | Destruction, Crash & Debris, Metal Fence, Hit, Rattle (3.0) | Absperrgitter erscheinen (leise) und kippen (37,3 s) |
| whistle | Epidemic d486a902-0eb1-4bb0-9331-4e09172effb6 | Whistles, Misc, Whistle | ein kurzer Pfiff beim Schulstreik |
| radiator | Epidemic ae3607b9-18d9-4769-9cab-294556c9cd47 | Machines, Hvac, Radiator, Rattle, Metal Ticks, Dripping | Heizkörper heizt (25,3 bis 31,6 s) |
| boots | Epidemic 1a75c066-7240-4093-8d30-75cbb10efcdc | Footsteps, Human, Military Boots, On Dirt | der Soldat tritt auf der Stelle und salutiert |
| pop | Epidemic 5c5c3085-0e0b-4c29-bba3-c8779dc6daa9 (Vermögen-Video) | Cartoon, Pop, Small Lid | hüpfende Objekte (aufsteigend), Landungen des §, Erscheinen von Schülern, Ampel, Menge und Fragezeichen, in der 2D-Outro drei leise Plopps für die Buchstaben und der Punkt |
| coin_single, switch | Epidemic (Rundfunk-Video) | | Euro-Münze erscheint und kommt zurück · Ampel schaltet ein |
| stamp, knock, burst, shimmer, glock | Soundza (2027-Video) | | Stempel „HARTZ IV“ und das § stoppt den Heizkörper (tiefer) · (Konfetti-Knall nur in der verworfenen 3D-Outro) · Glitzern beim Zähler und beim Einfallen des § · Glocke beim Fragezeichen und beim Punkt |

Die Stimme ist Tom Magic (ElevenLabs, eleven_v4), Take 2 in `voice/voice.mp3` (54,4 s), Take 1 als Alternative in `voice/take1.mp3`. Die Wortzeiten stammen aus der ElevenLabs-Transkription (`voice/words.json`).
