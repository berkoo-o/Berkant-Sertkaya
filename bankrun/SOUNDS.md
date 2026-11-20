# Sounds im Video „Was wäre, wenn alle gleichzeitig ihr Geld abheben?“

Musik und fast alle Effekte kommen aus dem Epidemic-Sound-Connector. Die Dateien liegen nur lokal in `bankrun/sfx/epidemic/` und sind nicht im Repo, weil die Lizenz die Weitergabe einzelner Dateien verbietet. Ins Repo kommen nur die fertigen Mischungen `mix_music.m4a` und `mix_fx.m4a`, die `render-pc.mjs` an die Videos hängt. Gemischt wird mit `python3 audio.py` im Ordner `bankrun/` (`-v` zeigt, wo die Effekte im Verhältnis zur Stimme am lautesten sind). Alle Zeiten im Skript sind Stimm-Zeiten; im Video beginnt die Stimme bei 0,15 Sekunden.

Musik: „Radar Focus“ (Blue Saga, Epidemic Sound, ID 6f90c76d-de15-4a4d-9d51-cbea2cbbe75f, Datei aus `rundfunk/sfx/epidemic/`), Sub-Bass abgesenkt, 22 dB unter der Stimme im Bereich über 250 Hz, sanftes Ducking. Dazu die vom Nutzer gelieferten Übergangssounds `rundfunk/sfx/whoosh.wav` und `rundfunk/sfx/clicks.wav`.

| Datei | Epidemic-ID | Titel | Einsatz |
|---|---|---|---|
| ambience_city | e825d157-4017-4cdd-a304-4338cb69f48b | Ambience, Urban, City, Hum, Distant Traffic, Rumble, Walla | leises Stadt-Klangbett, abends leiser |
| atm | 0849ca76-ec23-48bb-bd12-da7b68f25490 | Machines, Appliance, ATM, Money, Cash, Press, Button … 03 | leise Automatentöne beim Abheben und bei „max. 60 €“ |
| error_beep | 08ab470d-94e4-4d1b-bcbf-69749d71284f | User Interface, Beep, Error, Fail, Tonal, Negative | die drei Automaten springen auf „LEER“ (rot zuerst, dann tiefer und leiser) |
| shutter | 7aa8827a-1712-4157-8da0-04791cb998dc | Vehicles, Door, Car, Van, Side Shutter, Roll Down | Rollladen herunter (Bank geschlossen, Pleite) und etwas schneller hinauf |
| receipt | ff0f74c4-982e-4b24-a567-4a49e755b92f | Machines, Misc, Receipt Machine, Print Out, Remove Receipt | Outro: der Automat druckt den Beleg mit dem Logo |
| money_count | 45986e3f-12c8-4914-b106-956defaf3460 | Money, Notes, Count Into Hand | die Geldbündel fliegen in die Stadt (vier Takes, leicht verstimmt) |
| money_handling | f44fd9e3-ed6c-4751-b95a-7fd664ccc39b | Paper, Handle, Money, Banknotes, Handling | Turm wächst; der Stapel aller Euro-Scheine wächst in vier Stufen |
| latch | 1b6d739d-2a18-4e1b-8c2d-bf16d68a670b | Doors, Gate, Metal, Fence, Latch | Schranke landet und öffnet sich wieder |
| neon_flicker | 41f45a4d-ae2c-4260-842b-f6338714ae0d | Electricity, Buzz & Hum, Flickering Neon Light | die Lichter der Bank flackern bei „Panik“ |
| glass_down | 779e5c9a-0450-49ac-83ac-68b1549e9a36 | Objects, Container, Glass Jar, Large, Place Down On Hard Surface | die Glashaube setzt über der Bank auf |
| footsteps | a4613fd8-4459-4790-9549-dd5b18f07b98 | Footsteps, Human, Shoes, Multiple, Walk, Concrete, City, People, Walla | Neuankömmlinge in der Panik und der Heimweg am Ende |
| safe_open | 4bd430ed-bd05-4727-816b-3330123cdd4d | Doors, Metal, Doors, Safe, Electronic, Digital, Open 02 | Blick in den Tresor |
| cloth_flap | af1cd4d8-402d-42ba-86f7-74b55a8dead8 | Cloth, Flap, Flag Move 01 | Banner „Bankfeiertag“ rollt sich ab und wieder auf |

Aus der Soundza-Bibliothek (echte Aufnahmen, keine KI, Dateien in `jahr2027/sfx/soundza/`): shimmer (Sparkle Shimmer, cmvjom5v0wesjkcnnq42gu3ql) ganz leise beim gläsernen Bankgebäude und bei der Glashaube, glock (Glockenspiel Success Chime, cmvcmgxpuvpqbjdx0i99c21ia) tiefer gestimmt und leise, wenn der rote Punkt erscheint.

Die Stimme ist Tom Magic (ElevenLabs, eleven_v4), Take 2 in `voice/voice.mp3` (85,5 s), Take 1 als Alternative in `voice/take1.mp3`. Die Wortzeiten stammen aus der ElevenLabs-Transkription (`voice/words_take2.json`).
