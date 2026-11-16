# STATUS – function. (Stand 16.11.2026)

> **Für jeden neuen Chat:** Lies zuerst diese Datei und die `CLAUDE.md`. Dort stehen alle festen Regeln für Look, Stimme, Musik, Cover und Outro. Bitte nichts davon neu erfragen.

## Fertige Videos in diesem Repo
| Ordner | Video | Stand |
|---|---|---|
| `paket-test/` | Das Paket | fertig (v4), Referenz für Cover (`cover3.html`), Musik (`track_D`) und Outro |
| `geldautomat/` | Der Geldautomat | fertig, mit Cover und Beschreibungen |
| `strom/` | Der Strom | fertig als **v3**, das ist die Referenz für den neuen Look (`strom/v3/modell.html`) |

Frühere Videos außerhalb des Repos: Elbphilharmonie, Flughafen BER, Weißes Haus (v3) und Pfandflasche (v5).

## Aktueller Look (seit Strom v3)
Ein einziges schlichtes Low-Poly-Modell auf einer dunklen Platte, wie im schraffuren-Reel. Die Geschichte wird über Licht erzählt, es gibt keine Schnitte und die Kamera fährt langsam. Abgelehnt wurden viele einzelne 3D-Szenen und das fotorealistische Higgsfield-Diorama.

## Aktuelles Video: Der Strom („Wie kommt der Strom in deine Steckdose?“)
- **Ordner:** `strom/`, die aktuelle Version liegt in `strom/v3/` (`modell.html`, `render.mjs`, `audio_modell.py`)
- **Stand:** v3 ist fertig gerendert (`Der_Strom_mit_Musik.mp4`, `Der_Strom_nur_Effekte.mp4`), Cover und Beschreibungen liegen ebenfalls vor
- **Skript:** `strom/Skript_Strom.txt`, Sprechertext in `strom/Sprechertext_mit_Tags.txt`
- **Outro:** Die roten Warnlichter steigen von den Windrädern auf und werden zu den Buchstaben, das Licht des vordersten Windrads landet als Punkt
- **Aktuelle Etappe:** Überarbeitung von v3 nach dem Feedback des Nutzers
- **Offene Änderungswünsche:** _(hier eintragen)_

## Etappen
Nach jeder Etappe wird diese Datei aktualisiert, danach `/clear` und im neuen Chat mit `@STATUS.md` weitermachen.

1. Thema und Skript, dann Freigabe per „Go“
2. Stimme „Tom Magic“ (eleven_v4) über den ElevenLabs-Connector erzeugen
3. Standbild neben die Vorlage legen und vergleichen, dann Freigabe
4. Film rendern; bei Fehlern nur die betroffenen Stellen neu rendern
5. Ton in zwei Versionen: „mit Musik“ und „nur Effekte“
6. 3–4 themenbezogene Outro-Ideen zur Auswahl geben, dann bauen
7. Cover-PNG nach `paket-test/cover3.html`
8. Beschreibungen für TikTok, Reels und Shorts mit Quellen und #function

## Entscheidungen im aktuellen Video
- _(hier sammeln: Skriptversion, Szenen, Lichter, Timing, gewählte Outro …)_

## Nächster Schritt
Am Strom-Video v3 weiterarbeiten: Feedback des Nutzers aufnehmen und nur die betroffenen Stellen neu rendern.
