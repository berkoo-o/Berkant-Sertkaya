# function. - Einrichtung zum Rendern auf dem eigenen Windows-PC (nur einmal noetig)
# Start in PowerShell mit:
#   irm https://raw.githubusercontent.com/berkoo-o/Berkant-Sertkaya/claude/nice-galileo-neyrpn/einrichten.ps1 | iex
# Installiert Git, Node.js und ffmpeg (falls sie fehlen), laedt das Projekt nach C:\Users\<Name>\function
# und legt auf dem Desktop das Symbol "function. rendern" an. Danach reicht ein Doppelklick auf dieses Symbol.

Write-Host ""
Write-Host "  function. - Einrichtung" -ForegroundColor Red
Write-Host ""

function Ensure($id, $cmd) {
  if (Get-Command $cmd -ErrorAction SilentlyContinue) { Write-Host "  [ok] $cmd ist schon installiert" -ForegroundColor Green; return }
  Write-Host "  Installiere $id ... (falls Windows fragt, mit Ja bestaetigen)" -ForegroundColor Yellow
  winget install --id $id -e --silent --accept-source-agreements --accept-package-agreements
}
Ensure 'Git.Git' 'git'
Ensure 'OpenJS.NodeJS.LTS' 'node'
Ensure 'Gyan.FFmpeg' 'ffmpeg'

# neu installierte Programme sofort finden, ohne PowerShell neu zu starten
$env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
foreach ($c in 'git', 'node', 'ffmpeg') {
  if (-not (Get-Command $c -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Host "  $c wurde nicht gefunden. Bitte PowerShell schliessen, neu oeffnen und die Zeile noch einmal eingeben." -ForegroundColor Red
    return
  }
}

$dir = Join-Path $HOME 'function'
if (Test-Path (Join-Path $dir '.git')) {
  Write-Host "  Projekt ist schon da, hole den neuesten Stand ..." -ForegroundColor Yellow
  git -C $dir pull --ff-only
} else {
  Write-Host "  Lade das Projekt herunter (etwa 1,2 GB, das dauert ein paar Minuten) ..." -ForegroundColor Yellow
  git clone --depth 1 -b claude/nice-galileo-neyrpn https://github.com/berkoo-o/Berkant-Sertkaya.git $dir
}
if (-not (Test-Path (Join-Path $dir 'render-pc.mjs'))) {
  Write-Host ""
  Write-Host "  Das Herunterladen hat nicht geklappt. Bitte ein Foto von diesem Fenster schicken." -ForegroundColor Red
  return
}

$lnk = Join-Path ([Environment]::GetFolderPath('Desktop')) 'function. rendern.lnk'
$s = (New-Object -ComObject WScript.Shell).CreateShortcut($lnk)
$s.TargetPath = Join-Path $dir 'Video rendern.cmd'
$s.WorkingDirectory = $dir
$s.Save()

Write-Host ""
Write-Host "  Fertig! Auf dem Desktop liegt jetzt 'function. rendern'." -ForegroundColor Green
Write-Host "  Wenn ein Video bereit ist, einfach doppelt darauf klicken." -ForegroundColor Green
Write-Host ""
