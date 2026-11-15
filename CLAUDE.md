# function. – Projektanweisungen

- Für jedes function.-Erklärvideo gilt der Skill „function-erklaervideo“ (Styleguide).
- **Outro immer ans Thema anpassen** (Wunsch des Nutzers, 14.11.2026): Jedes Video bekommt eine eigene Outro, die aus dem Hauptmotiv heraus das Logo „function.“ entstehen lässt. Das rote Detail des Hauptmotivs (roter Faden des Videos) ist dabei der Hauptdarsteller, und die Kamera fährt vorher so weit zurück, dass es gut sichtbar ist.
  - Paket (14.11.2026, vom Nutzer gewählt): Das rote Klebeband löst sich vom Paket, fliegt als rotes Band im Bogen nach oben und schreibt das Logo Buchstabe für Buchstabe. Das Ende des Bands wird zum Punkt. Ton: Abzieh-Knistern, Whoosh, leises Schreib-Wischen, Pop und Glocken-Akkord beim Punkt.
  - Strom (15.11.2026, vom Nutzer gewählt): Ein kleines Flugzeug fliegt nachts über den Windpark, unter ihm gehen die roten Warnlichter der Windräder nacheinander an und schreiben „function.“; das Licht des Helden-Windrads wird zum Punkt.
  - Vor dem Bauen dem Nutzer 3–4 themenbezogene Outro-Ideen zur Auswahl geben.
  - Nicht gemocht: einfacher fliegender Punkt mit dunkler Vignette (Styleguide 6b in der Grundform) und die alte Partikel-Outro aus dem Branch `add-function-toolkit` (render.py → outro()).
- **Stimme (ab 15.11.2026):** ElevenLabs „Tom Magic“ (voice_id `xouqnknI7nCiPaJ9gwt8`), Modell **eleven_v4**, mit Audio-Tags. Claude erzeugt die Stimme selbst über den ElevenLabs-Connector (Download-Host elevenlabsusercontent.com ist freigeschaltet). Abgelehnt: selbst entworfene Voice-Design-Stimmen. Fremde Creator-Stimmen (z. B. schraffuren) nie klonen.
- **Musik:** im schraffuren-Stil (Instagram „schraffuren“, Original-Audio): weicher tiefer Puls ~100 BPM, Sub-Bass, leise luftige Fläche, fast keine Melodie/Hi-Hats, ca. 15 dB unter der Stimme (Referenz: `paket-test/music_variants.py` → `track_D`).
- **Übergangs-Sounds:** keine Standard-Synth-Whooshes („hat jeder auf TikTok“). Für Wischer/Szenenwechsel die vom Nutzer gelieferten Epidemic-Sounds verwenden: `paket-test/sfx_epidemic/whoosh.mp3` (2 weiche Swooshes) und `clicks.mp3` (3 UI-Klicks, z. B. wenn eine Zahl erscheint).
- **Cover:** exakt wie das BER-Cover (Vorlage vom Nutzer, pixelgenau vermessen) – Template `paket-test/cover3.html` (Titel per URL `?l1=…&l2=…`):
  - Hintergrund: radialer Verlauf #1A1D23 → #0A0B0E mit feinen Sternpunkten.
  - Titel LINKSBÜNDIG (Tinte ab x=82): Zeile 1 weiß, Poppins Bold, Oberkante y≈335, Grundlinie y=441; Zeile 2 rot #E01E2B, Poppins Bold, Großbuchstaben-Oberkante y=506, Grundlinie y=639. Schlichter Titel („Flughafen BER“, „Das Paket“).
  - Roter Strich x 80–240, y 706–714, abgerundet.
  - Liegender roter Ring: Ellipse Mitte (540, 1248), außen rx 474,5 / ry 100, 7 px mit Glow, dünner dunkelroter Außenring #6E0F16 (rx 524 / ry 112,5), leichter roter Schimmer innen. Motiv steht mittig auf dem Ring.
  - Logo „function.“ Poppins Medium, zentriert, Tinte x 311–765, f-Oberkante y=1548, Grundlinie y=1641.
  - Nicht verwenden: zentrierte Fragetitel mit Kreisringen (alte cover6/7-Variante).
- Referenz-Umsetzung: `paket-test/v4.html` → `drawOutro()`, Ton in `paket-test/audio2.py` (Abschnitt „outro (themed …)“).
