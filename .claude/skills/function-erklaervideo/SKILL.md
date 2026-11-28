---
name: "function-erklaervideo"
description: "Für jedes neue function.-Erklärvideo (TikTok/Reels/Shorts): Look, Animation, Text, Ton, Cover, Beschreibungen und Ablauf nach dem festen Kanal-Styleguide."
---

# function. – Erklärvideo-Styleguide

Der Kanal „function.“ macht ~60-Sekunden-Erklärvideos zu Themen, die ganz Deutschland interessieren (Beispiele: Flughafen BER, Elbphilharmonie, Pfandflasche, Weißes Haus). Referenz für alles unten: das Pfandflasche-Video v5 (14.11.2026). Antworten immer auf Deutsch, kurz und direkt.

## 1. Ablauf (immer so)
1. Thema + Fakten recherchieren (Quellen notieren, aktuelle Zahlen per Websuche prüfen).
2. Skript (~60 s, 130–150 Wörter) mit Szenenplan schicken → Freigabe abwarten („Go“ / „Mach weiter“).
3. Stimme: Nutzer erstellt sie mit ElevenLabs „Rupert“ und lädt die MP3 hoch. Timing der Szenen an die Stimme anpassen.
4. Erst Stil-Stills / Kontaktbogen zeigen, dann komplett rendern.
5. Vor dem Abschicken eigene Kontrolle: Kontaktbogen aus dem fertigen Video, auf Fehler prüfen (siehe 3.).
6. Liefern: Video „mit Musik“ + Video „nur Effekte“ + Cover-PNG + Beschreibungen (.txt).
7. Bei Feedback nur die betroffenen Stellen neu rendern (Chunk-Rendering), nicht alles.
8. Higgsfield darf genutzt werden (z. B. Referenzbilder ~0,25 Credits pro Bild für detaillierte Maschinen/Gebäude), aber Credit-Kosten immer vorher nennen.

## 2. Look
- Format 1080×1920, 30 fps.
- Filmischer Nebel-Look wie die schraffuren-Referenz: warmer Sepia-Nebel, tiefe Kamera, Filmkorn, Vignette, weiches Licht.
- Etwas Farbe, aber zurückhaltend. Rot #E01E2B ist die einzige starke Signalfarbe und zieht sich als roter Faden durch (z. B. roter Deckel der Heldenflasche).
- So viel Animation wie möglich, alles 3D (Three.js-Pipeline), Maschinen/Gebäude detailliert und realistisch nach echten Vorbildern (Higgsfield-Referenzbilder).
- Vorgänge müssen physikalisch stimmen und erkennbar sein (Presse = glatte Walzen, die sichtbar zerdrücken – kein Schredder-Look).
- Kamera: ruhig, clean, keine Ruckler, kein Flackern.
- KEINE roten Wellenringe/Kreise im Video (einzige Ausnahme: der dezente Landering im Outro, siehe 6b).

## 3. Fehler, die nie vorkommen dürfen
- Objekte, die ineinander stecken oder durch etwas hindurchgehen (Flaschen durch Halter, Ballen durch Maschine, Deckel in Wand, Flasche in Flasche).
- Zu schnell aufeinanderfolgende Objekte, unnatürliche Bewegungen.
- Verzerrte oder angeschnittene Elemente (Text, Tafeln, Kalender).
- Unklare Objekte (Betrachter muss sofort erkennen, was es ist).
- Dinge, die stehen bleiben sollen, nicht neu aufbauen oder zerfallen lassen.

## 4. Text im Video
- Minimal: eine weiße Untertitelzeile unten (Poppins), große Zahl oben links mit kurzer Erklärzeile, kleine Quellenzeile, rotes Logo „function.“ unten links.
- Schrift: Poppins (500/600/700).
- Text nie aus dem Display ragen lassen, genug Abstand zum Rand.

## 5. Ton
- Immer zwei Versionen: „mit Musik“ und „nur Effekte“. Lautheit −14 LUFS.
- Musik leise unter der Stimme (Ducking). Stil: ruhig, modern, gleichbleibend – ein Loop ohne Aufbau, Drops oder Wechsel. Vorbild „fauna“ von bomull (Epidemic): ruhige Ambient-Elektronik, ~96 BPM, warme Flächen, weicher Bass, leises Pluck-Arpeggio, dezenter Beat. Düstere/„deepe“ Musik gefällt nicht.
- Musik selbst bauen.
- Soundeffekte: siehe 5a. Realistische Soundeffekte für jede Aktion: z. B. Plastik-Knistern beim Zerdrücken, hohler Plastik-Aufprall, Kassen-Piep beim Scanner, Förderband-Klicken, Maschinenbrummen, Wasserblasen, Druckluft, Glasklirren, schwerer Aufprall, weiche Whooshes bei Szenenwechseln.

## 5a. Soundeffekte (bei jeder Animation, selbstständig und ohne Nachfrage)
1. Jede Szene und jede Bewegung analysieren und eine Sound-Liste anlegen: Zeitpunkt (Frame/Sekunde), Bewegung, Sound-Typ.
2. Passende Sounds wählen: Whoosh, Swoosh, Pop, Click, Impact, Riser, Übergänge sowie die realistischen Aktionsgeräusche aus 5.
3. Zuerst in der verbundenen Soundbibliothek suchen (Sound-Connector: Soundeffekte suchen, ähnliche Sounds suchen, herunterladen). Mehrere Kandidaten pro Sound vergleichen (Beschreibung, Länge, Vorschau/Wellenform) und den passendsten nehmen.
4. Nur wenn die Bibliothek nichts Passendes liefert oder der Download im Arbeitsbereich nicht klappt: Sound selbst bauen (Synthese mit ffmpeg/Code) oder eine andere kostenlose, kommerziell nutzbare Quelle verwenden.
5. Lizenz: bevorzugt kostenlose, kommerziell nutzbare Sounds. Quelle und Lizenz jedes Sounds in einer `SOUNDS.md` im Projekt notieren.
6. Timing: Der Sound sitzt framegenau auf der Bewegung (Impact auf dem Kontakt-Frame, Whoosh beginnt kurz vor der Bewegung, Riser endet exakt am Schnitt). Nach dem Rendern am fertigen Video prüfen.
7. Lautstärke: Effekte liegen klar unter der Stimme und übertönen sie nie. Wichtige Aktionen etwas lauter, Übergänge dezent. Gesamtlautheit bleibt bei −14 LUFS.
8. Weniger ist mehr: kein Sound ohne sichtbare Bewegung, keine doppelten oder überlagerten Effekte auf derselben Aktion, nichts, was nicht zum ruhigen Look passt.
9. Die Sounddateien direkt ins Projekt legen (z. B. `audio/sfx/`) und in beide Tonspuren mischen („mit Musik“ und „nur Effekte“).

## 6. Cover (PNG 1080×1920)
- Schwarzer Hintergrund (radialer Verlauf #1A1D23 → #0A0B0E) mit feinen Sternpunkten.
- Nur das Hauptmotiv in 3D (z. B. nur die Flasche, nur das Terminal), darf heller sein.
- Titel oben links (left ~96 px, top ~270 px) in Poppins Bold: Zeile 1 weiß (~126 px), Zeile 2 rot #E01E2B (~108 px), enger Zeilenabstand, kurzer roter Strich darunter. Nicht zu groß, nicht zu nah am Rand. Schlichter Titel wie „Flughafen BER“ / „Die Pfandflasche“ statt Clickbait.
- Motiv steht auf einem LIEGENDEN leuchtend roten Ring (Ellipse am Boden, ~930×250 px, 7 px, Glow), unten komplett geschlossen, plus dünner dunkelroter Außenring (#6E0F16) und leichter roter Schimmer innen. Ring nicht vom Motiv/Schatten verdecken lassen.
- Logo „function.“ rot (Poppins 500, ~120 px) unten mittig.
- Bei Poppins bleiben (Montserrat, Bebas, Space Grotesk wurden abgelehnt).

## 6b. Outro (letzte ~3 s, in jedem Video gleich)
Idee: Der rote Faden des Videos (das rote Akzentdetail des Hauptmotivs, z. B. der rote Flaschendeckel) wird zum Punkt im Logo „function.“.

Zeitablauf ab Outro-Start (= direkt nach dem letzten gesprochenen Satz, bei 60,7 s Gesamtlänge ca. bei 57,7 s):
- **0–0,35 s:** Untertitel, große Zahl und Quellenzeile blenden aus. Die Kamera fährt im 3D langsam nach oben/hinten vom Hauptmotiv weg (weiter bis zum Ende).
- **0–1,0 s:** Eine dunkle radiale Vignette (2D-Canvas über dem 3D-Bild) blendet ein: Mitte rgba(26,23,19,0.74), Rand rgba(9,8,6,0.97). Die Szene bleibt schwach sichtbar.
- **0–0,3 s:** An der Bildschirmposition des roten Details (3D-Punkt per `project(cam)` umrechnen) erscheint ein roter Punkt #E01E2B mit Glow (shadowBlur ~34), gleich groß wie das Detail.
- **0,3–1,08 s:** Der Punkt fliegt auf einer quadratischen Bézierkurve zum Logo-Punkt. Der Kontrollpunkt liegt in der Mitte zwischen Start und Ziel, +240 px nach rechts und 300 px über dem höheren der beiden Punkte. Easing ease-in-out. Der Radius schrumpft linear auf die Größe des „.“, der Glow geht von 34 auf 12. Dazu kommt eine Schleifspur aus 6 Geisterpunkten (je 30 ms verzögert, Deckkraft 0,16 abnehmend). Gleichzeitig wird das echte rote Detail im 3D-Modell unsichtbar (ab 0,3 s).
- **1,0–1,9 s:** Die Buchstaben „f-u-n-c-t-i-o-n“ erscheinen nacheinander mit 55 ms Versatz, jeder in 0,5 s: aus blur(10px) scharf werdend, von 34 px tiefer nach oben gleitend und einblendend (ease-out). Poppins 500, 170 px, letter-spacing −7 px, Rot #E01E2B, horizontal zentriert, Grundlinie y ≈ 1010. Die Position des „.“ wird aus der Glyphe gemessen, damit der fliegende Punkt exakt dort landet.
- **1,08–1,95 s:** Bei der Landung breitet sich einmal ein dünner roter Ring vom Punkt aus (Radius +190 px, Linienstärke 6 → 1 px, Deckkraft 0,75 → 0) und verblasst. Das ist die einzige erlaubte Ringanimation.
- **Ab ca. 2 s:** Das Logo steht ruhig bis zum Ende (~1 s).

Sound im Outro:
- Weicher Whoosh bei +0,25 s (Start des Flugs).
- Sanfter tiefer Aufprall (120 → 60 Hz) plus winziger Klick (2,6 kHz) bei +1,08 s (Landung).
- Leiser Glocken-Akkord E5/B5/E6 bei +1,1 s, ca. 2 s ausklingend.
- 8 winzige Ticks (2,2 kHz, 30 ms) im 55-ms-Takt ab +1,0 s, einer pro Buchstabe.
- Die Musik endet ca. 1 s nach Outro-Start und blendet über ~1,8 s aus.

## 7. Beschreibungen (.txt)
- Je eine Version für TikTok (kurz), Instagram Reels (mit Fakten-Emojis) und YouTube Shorts (Titel + Beschreibung).
- Immer mit Quellen, „Stand: TT.MM.JJJJ“ und Hashtags inkl. #function.

## 8. Technische Hinweise
- Rendern lokal mit Playwright-Chromium (swiftshader), Frames → ffmpeg (libx264), in 60-Frame-Chunks, damit nur fehlerhafte Chunks neu gerendert werden müssen.
- Higgsfield-Dateien (Bilder, Audio, 3D) können lokal nicht heruntergeladen werden – Referenzbilder in der Higgsfield-Sandbox ansehen und nachbauen.