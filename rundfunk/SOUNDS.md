# Geräusche der Rundfunk-Tests

Die Dateien liegen nur lokal in `sfx/soundza/` und werden nicht ins Repo gelegt, weil die Soundza-Lizenz die Weitergabe einzelner Dateien verbietet. Sie lassen sich über den Soundza-Connector (`download_sound` mit der ID) jederzeit neu laden, danach mit `ffmpeg -ac 1 -ar 48000` in `<name>.48k.wav` umwandeln.

| Datei | Soundza-ID | Titel | Einsatz |
|---|---|---|---|
| coin_desk | cmukebqgd4asz39ggzzvyc8n7 | Quarter Dropping on Desk | B: nur der erste Klang als leises Aufstapeln der 20 Münzen; A und B: einzelne Münzen für Deutschlandradio und Medienaufsicht |
| coins_pile | cmvr5hlr6j8x3rkvxh9lzzdpx | Gold Coins Drop on Soft Surface | Münzen landen bei ARD und ZDF (je Sender eine Kaskade, nicht pro Münze) |
| coin_spin | cmv5mzdr700ug06l4mjwcz9kd | Coin Spin Fall | B, Outro: Münze kreiselt auf der Kante und fällt flach |
| coin_shimmer | cmvjoofik3p929tq9ufhkcubg | Magical Coin Shimmer | A: Münzen steigen aus den Häusern auf; B: leise, wenn das Logo erscheint |
| fluorescent_flicker, power_down, switch_on, switch_off | siehe `strom/v4/SOUNDS.md` | | A: LED-Leuchtschrift in der Outro, Fenster gehen an |

Dazu die Epidemic-Sounds des Nutzers (`whoosh.wav` für Kamerafahrten, `clicks.wav` wenn eine Zahl erscheint). Keiner der Soundza-Sounds ist KI-erzeugt.
