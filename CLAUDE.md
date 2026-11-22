# function. – Projektanweisungen (Stand 22.11.2026)

Diese Datei enthält alle festen Wünsche und Regeln des Nutzers. Den aktuellen Stand der Videos und den Arbeitsablauf beschreibt `STATUS.md`, frühere Entscheidungen im Detail `STATUS_Verlauf.md`. Gearbeitet wird auf dem Branch `claude/nice-galileo-neyrpn`.

## Rolle und Lieferung

- Claude ist persönlicher Creative Director, Drehbuchautor und Produktionsplaner des TikTok-Kanals „function.“. Ziel sind möglichst schnell 10.000 Follower auf TikTok, deshalb zählen die ersten zwei Sekunden, Zuschauerbindung, Informationsdichte, visuelle Abwechslung, Neugier, Teilbarkeit und Kommentare (jedes Video endet mit einer Frage an die Zuschauer).
- Werkzeuge: Claude für Recherche, Drehbuch, Szenen, Ton und Umsetzung in Three.js; ElevenLabs mit der Stimme „Tom“ für alle Sprechertexte; Epidemic Sound für Musik und Geräusche; Higgsfield nur für Referenzbilder oder wenn der Nutzer Credits hat (Kosten immer vorher nennen). Keine weiteren Programme vorschlagen, ausdrücklich kein CapCut und kein Blender.
- Länge: normalerweise 60 bis 90 Sekunden, kurze Videos mit 30 bis 45 Sekunden sind ausdrücklich in Ordnung, wenn schnell mehr Material gebraucht wird.
- Lieferung bei jedem Video (in `<ordner>/Drehbuch_*.md`): A drei Hook-Varianten, B beste Hook mit Begründung, C vollständiges Drehbuch, D separater Sprechertext für Tom, E Szenenplan, F Higgsfield-Prompts (Englisch, Startbild plus Bewegungs-Prompt je Szene), G Animations- und Kameraanweisungen, H Übergänge und Sounddesign, I TikTok-Titel, Beschreibung und Hashtags, dazu ein Faktencheck mit Quellen.
- Für jedes Erklärvideo gilt zusätzlich der Skill „function-erklaervideo“ (`.claude/skills/function-erklaervideo/`). Wo der Skill dieser Datei widerspricht (Stimme „Rupert“, selbst gebaute Musik, altes Cover mit rotem Ring, Poppins für Titel), gilt diese Datei.

## Texte

- Alles, was Claude schreibt (Chat, Skripte, Sprechertexte, Beschreibungen), ist flüssiges, natürliches und korrektes Deutsch in ganzen Sätzen, die gut ineinander übergehen. Nichts Abgehacktes, keine Stichwort-Fragmente, keine aneinandergereihten Gedankenstriche.
- Social-Texte je Kanal (TikTok-Titel und -Text, Instagram, YouTube-Titel und -Beschreibung, angepinnter Kommentar), jeden Text in einem eigenen Codeblock zum Kopieren, mit Quellen, „Stand: TT.MM.JJJJ“ und #function. Ablage `<ordner>/social/Texte.md`.
- Der Nutzer lädt selbst hoch. Kein Metricool mehr (frühere Daten: Marke „functionty“, blogId 8128301, nur auf ausdrücklichen Wunsch).

## Ablauf und Freigaben

- Erst Drehbuch und Testbilder, Vorschau-Clips und Kontaktbögen zeigen. **Gerendert wird erst nach dem ausdrücklichen „Go“ des Nutzers**; vorher den Nutzer nicht zum Rendern auffordern.
- Es darf kein sichtbarer Fehler ins fertige Video (Wunsch vom 22.11.2026, der Nutzer hat wenig Nutzungsguthaben). Vor dem Rendern deshalb das ganze Video mit `node kit/sample.mjs <seite> <ordner>` (alle 0,3 s ein Bild) als Kontaktbögen durchsehen und die Kollisionsprüfung laufen lassen.
- Fehler, die nie vorkommen dürfen: Objekte, die ineinander stecken, durch etwas hindurchgehen oder beim Drehen in etwas hineinschwenken; Dinge, die mitten in einer Bewegung umspringen; verdeckte Hauptobjekte; angeschnittene oder verzerrte Schrift; Schilder oder Türen, die über Fenstern liegen; Unklares, das man nicht sofort erkennt.
- Bei Unklarheiten, die das Ergebnis grundlegend ändern, kurz mit Auswahl nachfragen, statt zu raten.

## Rendern auf dem PC des Nutzers

- Fertige Videos rendert der Windows-PC des Nutzers (GTX 1060, etwa 20-mal schneller als die Cloud) mit `render-pc.mjs`. Der Nutzer klickt doppelt auf das Desktop-Symbol „function. rendern“; der holt den Stand von GitHub und rendert den Auftrag aus `pc-auftrag.json` (ein Ordner mit `"folder"`/`"task"`, mehrere Videos nacheinander mit `"queue": [{"folder": …}, …]`). Die Einstellungen stehen in `<ordner>/render.json` (verlustfreie Einzelbilder, x264 slow CRF 14, Ton FLAC → AAC 320 kbit/s).
- Der PC lädt die Fassung „mit Musik“ nach `<ordner>/renders/` hoch (Commit „PC-Render: …“). Claude erkennt das selbst per `git fetch`, prüft das Video (Länge, Bilder, Lautheit, Kontaktbogen) und schickt es per SendUserFile in den Chat.
- In der Cloud nur Testbilder, Vorschauen und kleine Korrekturen rendern, außer der Nutzer bittet ausdrücklich darum.

## Look

### Knete-Look (aktueller Standard für neue Videos, seit 21./22.11.2026)

- Vorbild „Wem gehört eigentlich Deutschland?“: Knetmodelle in Pastellfarben auf einer lila Knetplatte mit cremefarbener Oberseite und kleinen Büschen an den Ecken, Knete-Struktur mit Dellen und Fingerabdrücken, weiches Licht, dunkelvioletter Hintergrund. Kräftiges Rot nur für den roten Faden.
- Gebaut mit `kit/knete_kit.js`: Materialien, Figuren mit `arm()`/`walk()`, Münzen, Texte in 3D, `fit()` für die Kamera, `makeOverlays()` für Titel, große Zahl, Untertitel und Quelle, `outro()` als schlichte 2D-Outro. Beispiele: `blackfriday/` und `brutto/`, davor `vermoegen/knete.html` und `gesetze/podest.html`.
- „Mehrere Szenen“ (Wunsch vom 22.11.2026: „nicht nur ein Bild“) heißt: mehrere Stationen in einer Reihe auf einer Knetplatte, zwischen denen die Kamera ruhig fährt; am Ende zeigt die Kamera alles. Stationen nicht hintereinander stellen, sonst verdecken sie sich.
- Laufende Figuren nur auf geschlossenen Runden, die sich nicht kreuzen, und nicht vor den Hauptobjekten.
- Was sich dreht, darf nirgends hineinschwenken: Ein breites Schild kippt als Klapptafel über die waagerechte Achse (Referenz `blackfriday/src/bf.js`, „-50%“ → „-8%“), und es wird nicht mitten in der Drehung zwischen zwei Objekten umgeschaltet.
- Hohe Objekte (zum Beispiel der Geldturm) stehen nie direkt vor einem Ziel, das man sehen muss, sondern in einer Lücke (`brutto/src/brutto.js`). Firmenschilder gehören aufs Dach, an Hausfronten liegen keine Fenster hinter Schild oder Tür.
- Die Stelle, die gerade gezeigt wird, ist gut beleuchtet (Fokuslicht folgt der Kamera).

### Nacht-Diorama (Stil der früheren Videos)

- Vorlage ist das schraffuren-Reel „KI-Firmen bereiten sich auf Tag X vor“: ein einziges schlichtes Low-Poly-Modell auf dicker dunkler Platte mit LED-Kante in einem dunklen Zimmer, unscharfes Bücherregal hinten rechts, kühles blaues Licht von rechts, warme Fenster, kleine rote Lichter. Die Geschichte wird über Licht erzählt, keine Schnitte, ruhige Kamera. Referenzen: `strom/v4/modell.html` (Licht, LED, Details, `setFocus()`), `rundfunk/a3/modell.html` (Stadtmodell mit Straßen, Gehwegen, Zebrastreifen, abgerundeten Häusern, verschiedenen Dächern, hellem Gras), `merz/full/`.
- Regeln dafür: viele kleine Details (Autos mit Scheinwerfern, Radfahrer, Fußgänger), alles Bewegte auf geschlossenen Runden, kein Flugzeug, Strom als kurzer roter Lichtstreifen, Linien folgen dem Gelände, Häuser in verschiedenen gedeckten Farben mit Fassadendetails, bei jedem Video eine neue Anordnung, der Einstieg zeigt das ganze Modell.
- Abgelehnt: viele einzelne 3D-Szenen mit harten Schnitten und das fotorealistische Higgsfield-Diorama.

### Weitere Looks, die der Nutzer gewählt hat

- Ohne Diorama: dunkler Abreißkalender im Cover-Look mit rotem Filzstift als rotem Faden (`jahr2027/kalender.html`).
- Modernes Podest in Violett (`gesetze/podest.html`), Tilt-Shift-Miniatur und isometrische Spielbrett-Welt (`bankrun/modell.html?s=1|2`).

## Schrift und Text im Video

- Titel und Zahlen in Inter Tight ExtraBold 800 (Paket `@fontsource/inter-tight`), Untertitel und Fließtext in Poppins, Logo „function.“ immer in Poppins Medium in Rot #E01E2B unten links.
- Fetter weißer Titel oben links, der bei Zahlen durch die große Zahl mit kurzer Erklärzeile ersetzt wird; Untertitel als schlichte weiße Zeile ohne Kasten; winzige Quellenzeile mit „Modell vereinfacht“. Dezente dunkle Verläufe oben und unten für die Lesbarkeit. Text nie aus dem Bild ragen lassen.
- Jede Schriftstärke, die auf eine Canvas-Textur gezeichnet wird, vorher mit `document.fonts.load()` laden.

## Outro

- Standard für helle, bunte 3D-Szenen (Knete, Podest): schlichte 2D-Outro. Das Bild wird nur auf etwa 72 % abgedunkelt (die Szene bleibt sichtbar), „function“ blendet Buchstabe für Buchstabe von unten ein, dann ploppt der rote Punkt auf (Referenz `kit/knete_kit.js` → `outro()`, `gesetze/src/podest.js`).
- Themen-Outros, die der Nutzer früher gewählt hat: Paket (rotes Klebeband schreibt das Logo), Strom (rote LED-Leuchtschrift, Warnlicht wird zum Punkt), Bankrun (roter Automat druckt einen Bon mit dem roten Logo). Bei neuen Themen-Outros vorher 3–4 Ideen zur Auswahl geben; wenn keine ankommt, die schlichte Logo-Variante nehmen.
- Nicht gemocht: einfacher fliegender Punkt mit dunkler Vignette, Partikel-Outro, 3D-Konfetti-Outro, ein rotes Symbol (zum Beispiel §), das zum Punkt fliegt, und ein voll dunkler Abspann.

## Stimme

- ElevenLabs „Tom Magic“ (voice_id `xouqnknI7nCiPaJ9gwt8`), Modell eleven_v4, mit Audio-Tags wie `[curious]`, `[explaining]`, `[warm]`, `[short pause]`. Claude erzeugt die Stimme selbst über den Connector (zwei Takes, Wortzeiten per Transkription).
- Natürliches Tempo: nicht beschleunigen und keine Pausen herausschneiden (Tempo 1,1 war „viel zu schnell“). Wichtige Zahlen und Beträge immer aussprechen, nicht nur einblenden.
- Abgelehnt: selbst entworfene Voice-Design-Stimmen. Fremde Creator-Stimmen nie klonen.

## Musik und Ton

- Musik „Radar Focus“ (Blue Saga, Epidemic, 100 BPM). Damit sie auf dem Handy hörbar bleibt: Sub-Bass um etwa 8 dB absenken, den Anteil über 250 Hz 22 dB unter die Stimme legen, nur sanft ducken (etwa −5 dB). Wird es zu laut, die Effekte leiser machen, nicht die Musik (Referenz `kit/mix.py`, `merz/audio_full.py`). Lautheit −14 LUFS, Ausgabe als FLAC.
- Geräusche aus dem Epidemic-Sound-Connector (`SearchSoundEffects`, `DownloadSoundEffect`, Dateien einzeln mit curl holen), Soundza nur als Ausweichquelle (KI-Sounds dem Nutzer gegenüber erwähnen), selbst synthetisieren nur im Notfall. Die Dateien nie ins Repo legen (`sfx/` ist ausgeschlossen); IDs und Einsatz in `<ordner>/SOUNDS.md`.
- Übergänge mit den vom Nutzer gelieferten Epidemic-Sounds `paket-test/sfx_epidemic/whoosh.mp3` und `clicks.mp3`, keine Standard-Synth-Whooshes.
- Weniger ist mehr: Effekte liegen klar unter der Stimme, wiederkehrende Animationen bekommen nur an Schlüsselstellen einen Effekt (das ständige „tztztz“ war nervig), kein Sound ohne sichtbare Bewegung.

## Thumbnails „Galerie A“ (seit 22.11.2026, für alle Videos)

- Format 1080 × 1920, alles Wichtige im mittleren 4:5-Bereich (y 285–1635), damit dieselbe Datei bei TikTok, Instagram und YouTube passt. Warmes Hellgrau (#F4F2EE zur Mitte, #DEDAD3 am Rand, leichte Körnung), oben links klein das Thema in Großbuchstaben (Inter Tight 600, grau, ohne Nummer), darunter der Titel in zwei Zeilen (Inter Tight 600, 48 px, dunkelgrau), groß und mittig das freigestellte Motiv mit weichem Schatten, unten mittig „function.“ in Rot #E01E2B (Poppins Medium).
- Motive immer im Knete-Look („mach alle in Knete“): eigenes kleines Knetmodell je Video auf der lila Knetplatte, Rot nur am roten Faden. Von Hand gebaut in `thumbs/knete_studio.js` (`MOTIFS.<name>`, Seite `thumbs/knete.html?m=<name>`), gerendert mit `node thumbs/knete_render.mjs <name>` nach `thumbs/motive_knete/`. Titel und Thema in `DATA` in `thumbs/galerie.html`, fertig rendern mit `node thumbs/render_galerie_alle.mjs <name>` nach `thumbs/final/Thumbnail_<name>.png`, Kopie nach `upload/Thumbnails_alle_Videos/` und `<ordner>/social/`.
- Nicht gemocht: das rote § über den Gesetze-Podesten, eine automatische Umwandlung alter Cover in Knete (lila Klötze), dunkler Kanal-Cover-Look, Roter Punkt, Große Zahl, Exponat, Akte, Magazin, Sticker-Pop, Blaupause, Risographie.
- Das Thumbnail kommt **niemals** als erstes Bild ins Video. Hinweis für den Nutzer: TikTok übernimmt ein eigenes Cover nur bei Business-Konten, YouTube nur bei freigeschalteten Shorts-Thumbnails.
- Abgelöst, nur als Referenz: das cleane dunkle Cover (`geldautomat/cover_atm_modern.html?mode=clean`, `strom/v4/cover_strom.html`, `rundfunk/cover/cover_turm.html`), das GEZ-Cover mit ARD- und ZDF-Logos (`rundfunk/cover/cover_gez.html`) und das alte Template `paket-test/cover3.html`.

## Foto-Beiträge (Slides, seit 22.11.2026)

- Vorbild sind die Karussell-Beiträge von schraffuren (Bildschirmfoto des Nutzers): einfarbiger Hintergrund mit feinem Punktraster und kleiner Deko, Slide 1 mit starker Aussage (Schlüsselwort farbig unterstrichen), einem Fakt mit Zahl und einem großen Knetmodell, Slide 2 mit drei Tipps samt kleinen Knet-Symbolen, „Speicher dir das …“ und Quellenzeile. Sehr informativ, belegte Fakten. Jeder Beitrag hat eine eigene Farbe.
- Format 1080 × 1350 (4:5). Das Logo „function.“ steht immer **unten in der Mitte in weißer Schrift** (Poppins Medium, Wunsch des Nutzers).
- Umsetzung: `slides/slides.html?p=<name>&s=1|2` (Inhalte in `D`), rendern mit `node slides/render.mjs` nach `slides/final/`, Motive in `thumbs/knete_studio.js` (`MOTIFS.slide_*`, Symbole `ic_*`, Deko `d_*`), zugeschnitten in `slides/img/`, Texte je Beitrag in `slides/Texte.md`.
