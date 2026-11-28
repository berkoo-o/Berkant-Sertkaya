# Sounds im Merz-Video (Test und ganzes Video)

Alle Geräusche und die Musik stammen aus dem Epidemic-Sound-Connector. Die Dateien liegen nur lokal in `rundfunk/sfx/epidemic/` und nicht im Repo, weil die Lizenz das Weitergeben einzelner Dateien verbietet. Die IDs stehen in `rundfunk/SOUNDS.md`.

| Sound | Einsatz |
|---|---|
| Musik „Radar Focus“ (Blue Saga) | durchgehend; seit v6 mit abgesenktem Sub-Bass und so eingestellt, dass der auf dem Handy hörbare Anteil über 250 Hz 22 dB unter der Stimme liegt (v3 bis v5 waren auf dem Handy praktisch unhörbar) |
| power_down | einmal, wenn 90 der 100 Lichter ausgehen, und zu Beginn der Outro |
| switch | wenn das Spotlicht auf Merz angeht, in der Outro zweimal |
| shimmer | bis v4 leise, wenn die LED-Säulen wachsen; seit v5 ersetzt (Wunsch des Nutzers, 18.11.2026) |
| column_chord (Epidemic, ID 4b2516e0-8522-44f0-9337-c36c44420ab4, „User Interface, Beep, Button, Chord, Up, Soft“) | seit v5 ein weicher aufsteigender Akkord pro LED-Säule (0:11,75, 0:12,15, 0:12,55 und November bei 0:36,75), jeweils nach dem Wert gestimmt, sodass die fallenden Zahlen auch tiefer klingen |
| neon_on, neon_flicker | Outro mit der roten LED-Schrift |
| whoosh.wav, clicks.wav (vom Nutzer geliefert) | Kamerafahrten und das Erscheinen von Zahlen und Titeln |
| coins_falling (Epidemic, ID 3d901da6-d83f-4c76-bb8b-2c163e633e1a, „Objects, Coin, Falling Coins“) | bis v3 Münzregen auf die fünf Stapel; seit v4 gestrichen, weil das helle Klirren (fast nur über 3 kHz) dem Nutzer „viel zu penetrant“ war |
| coin_single, coins_drop (Epidemic, IDs in `rundfunk/SOUNDS.md`) | nur in v4 als drei weiche Akzente |
| coins_stack_slow (Epidemic, ID e600d5bc-881e-4559-85d5-382533817807, „Objects, Coin, Money, Coins, Stack, Slow“) | seit v5 ganz leise unter dem Stapeln der Münzen (18,53 bis 22,3 s), oben leicht abgedunkelt; die Münzen werden dabei wie im Bild immer dichter |
| arm_raise (Epidemic, ID 1e40d662-5c4a-4c34-a359-bb2c0011dffe, „Machines, Elevator, Truck Arm, Raising 01“) | die Schranke „Schuldenbremse“ hebt sich; seit v4 kürzer, leiser und abgedunkelt |
| coins_stack | bis v3, als die letzten Münzen sich auf die Stapel setzten; seit v4 durch coins_drop ersetzt |
