@echo off
title function. - Video rendern
cd /d "%~dp0"
echo.
echo  function. - Video rendern
echo  Hole den neuesten Stand ...
git pull --ff-only
if errorlevel 1 git pull --no-rebase --no-edit
if errorlevel 1 (
  echo.
  echo  Der neueste Stand konnte nicht geladen werden. Bitte ein Foto von diesem Fenster schicken.
  pause
  exit /b 1
)
echo.
node render-pc.mjs
echo.
echo  Fenster schliessen mit einer beliebigen Taste.
pause >nul
