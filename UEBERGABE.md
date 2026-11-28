# Übergabe an einen neuen Claude-Account (22.11.2026)

Alles Wichtige liegt in diesem GitHub-Repository `berkoo-o/Berkant-Sertkaya` auf dem Branch `claude/nice-galileo-neyrpn`. Der neue Account braucht nur Zugriff auf dieses Repository, dann ist der Stand komplett da.

## Was automatisch mitkommt (liegt im Repository)

- **`CLAUDE.md`**: alle Regeln und Wünsche (Stimme Tom, Musik, Look, Thumbnails „Galerie A“, Knete-Baukasten, Outro, Texte, Rendern auf dem PC). Claude liest sie in jeder Sitzung von selbst.
- **`STATUS.md`**: was bei jedem Video gemacht wurde und wo es liegt.
- **`.claude/skills/function-erklaervideo/SKILL.md`**: der Kanal-Styleguide als Skill. Er wird im neuen Account automatisch geladen, wenn eine Sitzung mit diesem Repository startet. Wo er `CLAUDE.md` widerspricht (zum Beispiel Stimme „Rupert“ statt „Tom“), gilt `CLAUDE.md`.
- Alle Videos, Drehbücher, Sprechertexte, Stimmen (`voice/`), Tonmischungen (`mix_*.flac`), Social-Texte, Thumbnails (`upload/`, `thumbs/final/`), der Code aller Szenen (`kit/`, `<video>/src/`) und die PC-Render-Skripte (`render-pc.mjs`, `Video rendern.cmd`, `pc-auftrag.json`).

## Was im neuen Account neu eingerichtet werden muss

1. **GitHub verbinden** (claude.ai → Einstellungen → Connectors → GitHub) und der Claude-GitHub-App Zugriff auf `berkoo-o/Berkant-Sertkaya` geben. Neue Sitzung mit diesem Repository starten und Claude sagen: „Arbeite auf dem Branch `claude/nice-galileo-neyrpn` weiter, lies STATUS.md.“
2. **Connectors neu verbinden:** ElevenLabs (Stimme Tom Magic, voice_id `xouqnknI7nCiPaJ9gwt8`, Modell eleven_v4; die Stimme muss im ElevenLabs-Konto verfügbar sein), Epidemic Sound (Soundeffekte und Musik „Radar Focus“), Higgsfield, Soundza. Die Logins bei diesen Diensten bleiben dieselben, nur die Verbindung zu Claude ist neu.
3. **Cloud-Umgebung anlegen** (Einstellungen der Code-Umgebung): Netzwerk „eingeschränkt“, Paketmanager und MCP-Server erlaubt, zusätzlich diese Hosts freigeben:
   - `elevenlabsusercontent.com` (Download der Stimmen)
   - `audiocdn.epidemicsound.com` (Download der Epidemic-Sounds)
   - `d8j0ntlcm91z4.cloudfront.net`
4. **Soundeffekte:** Die Epidemic-Dateien liegen aus Lizenzgründen nicht im Repository (`sfx/`-Ordner sind ausgeschlossen). Die IDs stehen in den `SOUNDS.md` der Videos; Claude lädt sie bei Bedarf über den Connector neu. Für die fertigen Videos ist das nicht nötig, die Mischungen (`mix_*.flac`) sind im Repository.
5. **PC zum Rendern:** Bleibt wie er ist. Das Desktop-Symbol „function. rendern“ holt den Stand von GitHub, das hängt nicht am Claude-Account.

## Was nicht mitkommt

- Die Chatverläufe selbst. Der Inhalt steckt aber in `CLAUDE.md` und `STATUS.md`.
- Artefakte, Scheduled Tasks und Einstellungen des alten Accounts.
