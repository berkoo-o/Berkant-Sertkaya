# Geräusche aus Soundza (Strom v4)

Die Dateien liegen lokal in `strom/v4/sfx/soundza/` und sind absichtlich **nicht** im Repo: Die Soundza Standard License erlaubt die Nutzung im Video, aber nicht, die Dateien einzeln weiterzugeben. Bei Bedarf über den Soundza-Connector (`download_sound` mit der ID) neu laden, als `<name>.wav` speichern und mit `ffmpeg -i <name>.wav -ac 1 -ar 48000 <name>.48k.wav` umwandeln.

| Datei | Soundza-Titel | ID | Einsatz im Video |
|---|---|---|---|
| plug_in | Power Cord Plug In | cmukd25pjv2uxxbr9gas6bg68 | Stecker rein (0,84 s) |
| switch_on | Light Switch Click | cmvr3x6iwb8k99rscioh63pph | Licht an, Flutlicht im Umspannwerk, Warnlichter wieder an |
| switch_off | Light Switch Click Off | cmukc1p2g2ecxi5vsb95frn5m | Spannungsstufen, Warnlichter aus, Stadt geht in der Outro aus |
| electric_flow | Light Electric Flow | cmvl6bf8p3rnmyj1n3qrnesgl | Strom läuft durch die Leitungen (Stücke daraus, Spitzen weich begrenzt) |
| spark | Spark Crackle | cmukdyzrtcj1jp8oh6r6xdk4i | Strom kommt an |
| transformer_hum | Electric Transformer Hum | cmvl6oa2r548d38xw36h94tn3 | Turm-Trafo, Umspannwerk, Trafohäuschen, 50-Hz-Schwingen |
| soft_wind | Soft Wind | cmuhywjvzr6townql9dhi0wsc | Wind am Windpark und an der Freileitung |
| tick | Button Tick | cmvcm0hfix9j8srrowqkqca87 | Netz leuchtet auf, ein Tick pro Kreis um die Erde |
| fluorescent_flicker | Fluorescent Bulb Flicker | cmvl663npmf88p7s9qyellxa9 | Buchstaben zünden wie eine Leuchtröhre, Brummen der Leuchtschrift |
| power_down | Electric Power Down | cmv0i6i8f01et06l8exyy3emc | Stadt geht aus (Anfang und Outro), sehr leise |

Weiterhin selbst gebaut: Getriebe und Generator in der Gondel, Rotorblatt-Swishes, das ferne Flugzeug, Dot-Landung und Glocken-Akkord. Übergänge und Zahl-Klicks bleiben die Epidemic-Sounds des Nutzers.
