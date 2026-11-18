# Sounds im Merz-Video (Test und ganzes Video)

Alle Geräusche und die Musik stammen aus dem Epidemic-Sound-Connector. Die Dateien liegen nur lokal in `rundfunk/sfx/epidemic/` und nicht im Repo, weil die Lizenz das Weitergeben einzelner Dateien verbietet. Die IDs stehen in `rundfunk/SOUNDS.md`.

| Sound | Einsatz |
|---|---|
| Musik „Radar Focus“ (Blue Saga) | durchgehend, seit v3 etwa 19 dB unter der Stimme (vorher 15 dB) |
| power_down | einmal, wenn 90 der 100 Lichter ausgehen, und zu Beginn der Outro |
| switch | wenn das Spotlicht auf Merz angeht, in der Outro zweimal |
| shimmer | einmal leise, wenn die drei LED-Säulen wachsen |
| neon_on, neon_flicker | Outro mit der roten LED-Schrift |
| whoosh.wav, clicks.wav (vom Nutzer geliefert) | Kamerafahrten und das Erscheinen von Zahlen und Titeln |
| coins_falling (Epidemic, ID 3d901da6-d83f-4c76-bb8b-2c163e633e1a, „Objects, Coin, Falling Coins“) | bis v3 Münzregen auf die fünf Stapel; seit v4 gestrichen, weil das helle Klirren (fast nur über 3 kHz) dem Nutzer „viel zu penetrant“ war |
| coin_single, coins_drop (Epidemic, IDs in `rundfunk/SOUNDS.md`) | seit v4 nur drei weiche, tiefpassgefilterte Akzente: die erste Münze landet (18,55 s), der erste Stapel ist voll (20,0 s), der letzte Stapel setzt sich (22,15 s) |
| arm_raise (Epidemic, ID 1e40d662-5c4a-4c34-a359-bb2c0011dffe, „Machines, Elevator, Truck Arm, Raising 01“) | die Schranke „Schuldenbremse“ hebt sich; seit v4 kürzer, leiser und abgedunkelt |
| coins_stack | bis v3, als die letzten Münzen sich auf die Stapel setzten; seit v4 durch coins_drop ersetzt |
