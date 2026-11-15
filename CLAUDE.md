# function. – Projektanweisungen

- Für jedes function.-Erklärvideo gilt der Skill „function-erklaervideo“ (Styleguide).
- **Outro immer ans Thema anpassen** (Wunsch des Nutzers, 14.11.2026): Jedes Video bekommt eine eigene Outro, die aus dem Hauptmotiv heraus das Logo „function.“ entstehen lässt. Das rote Detail des Hauptmotivs (roter Faden des Videos) ist dabei der Hauptdarsteller, und die Kamera fährt vorher so weit zurück, dass es gut sichtbar ist.
  - Paket (14.11.2026, vom Nutzer gewählt): Das rote Klebeband löst sich vom Paket, fliegt als rotes Band im Bogen nach oben und schreibt das Logo Buchstabe für Buchstabe. Das Ende des Bands wird zum Punkt. Ton: Abzieh-Knistern, Whoosh, leises Schreib-Wischen, Pop und Glocken-Akkord beim Punkt.
  - Vor dem Bauen dem Nutzer 3–4 themenbezogene Outro-Ideen zur Auswahl geben.
  - Nicht gemocht: einfacher fliegender Punkt mit dunkler Vignette (Styleguide 6b in der Grundform) und die alte Partikel-Outro aus dem Branch `add-function-toolkit` (render.py → outro()).
- **Musik:** im schraffuren-Stil (Instagram „schraffuren“, Original-Audio): weicher tiefer Puls ~100 BPM, Sub-Bass, leise luftige Fläche, fast keine Melodie/Hi-Hats, ca. 15 dB unter der Stimme (Referenz: `paket-test/music_variants.py` → `track_D`).
- **Übergangs-Sounds:** keine Standard-Synth-Whooshes („hat jeder auf TikTok“). Für Wischer/Szenenwechsel die vom Nutzer gelieferten Epidemic-Sounds verwenden: `paket-test/sfx_epidemic/whoosh.mp3` (2 weiche Swooshes) und `clicks.mp3` (3 UI-Klicks, z. B. wenn eine Zahl erscheint).
- Referenz-Umsetzung: `paket-test/v4.html` → `drawOutro()`, Ton in `paket-test/audio2.py` (Abschnitt „outro (themed …)“).
