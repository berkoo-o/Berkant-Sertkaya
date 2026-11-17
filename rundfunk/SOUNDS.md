# Geräusche und Musik der Rundfunk-Tests

Alles kommt aus dem Epidemic-Sound-Connector (Wunsch des Nutzers vom 17.11.2026). Die Dateien liegen nur lokal in `sfx/epidemic/` und werden nicht ins öffentliche Repo gelegt. Neu laden: `SearchSoundEffects`/`SearchRecordings` → `DownloadSoundEffect`/`DownloadRecording` (WAV) mit der ID, die Datei vom Host audiocdn.epidemicsound.com holen und mit `ffmpeg -ac 1 -ar 48000 -c:a pcm_f32le` in `<name>.48k.wav` umwandeln.

| Datei | Epidemic-ID | Titel | Einsatz |
|---|---|---|---|
| music_radar_focus | 6f90c76d-de15-4a4d-9d51-cbea2cbbe75f | Radar Focus (Blue Saga), 100 BPM | Musik ab Trackbeginn, etwa 15 dB unter der Stimme |
| coin_single | 11214eb1-567c-4cff-953d-8408c4c26832 | Coin, Money, Pound, Coin, Down On Table | B: nur der erste Klang als leises Aufstapeln der 20 Münzen und als Punkt in der Outro; A und B: einzelne Münzen für Deutschlandradio und Medienaufsicht |
| coins_stack | 54de9752-7c7a-4a98-9e0d-9ea8b0be1f91 | Coins, Stacking In Hand 01 | B: Münzen landen auf dem ARD-Stapel |
| coins_handful | 528e259c-0839-4835-8fc8-f829cbbe1c0b | Coins, Handful, Drop Onto Wood | A: Geld kommt bei der ARD an; B: zweite Welle ARD |
| coins_drop | 8e7e3f28-f5cc-4f6c-9342-7e762b5b98a6 | Coins, Drop 01 | ZDF |
| coin_spin | 0d8e2a38-4785-43fc-81d9-d77fb340fcb2 | Coin, Single, Spin On Table | B, Outro: Münze kreiselt und fällt flach |
| shimmer | 59869c0c-1388-480e-b06d-4592db0c3415 | Magic, Shimmer, Bright | A: Münzen steigen aus den Häusern; B: leise beim Logo |
| switch | 2b2e2214-2f82-4614-a840-75eb7bff59b7 | Light Switch, On, Off | A: Fenster gehen an, Outro |
| power_down | cc6d5f26-731e-4734-afe3-847fa0ac89a0 | Scifi, Machine, Power Down 01 | A, Outro: Stadt wird dunkel |
| neon_on | 19ddf9c6-5d70-4513-af64-90f82e4d16ec | Fluorescent Light, Neon Tube, Turned On | A, Outro: Leuchtschrift springt an |
| neon_flicker | 41f45a4d-ae2c-4260-842b-f6338714ae0d | Flickering Neon Light | A, Outro: Brummen der Leuchtschrift |

Dazu die Epidemic-Sounds, die der Nutzer früher geliefert hat (`sfx/whoosh.wav` für Kamerafahrten, `sfx/clicks.wav` wenn eine Zahl erscheint).
