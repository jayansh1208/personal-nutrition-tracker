@echo off
title NutriTrack - Personal Nutrition Tracker
echo ====================================================
echo Starting NutriTrack Personal Nutrition Tracker
echo ====================================================

REM Ensure DB is running
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\start-db.ps1"

REM Launch full-stack concurrently
echo Launching Backend (port 5000) and Frontend (port 5173)...
npm run dev
pause
