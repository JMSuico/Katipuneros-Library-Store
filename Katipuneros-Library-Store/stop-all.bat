@echo off
title Stop Katipuneros Library Store Services
cls
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0manage.ps1" stop
pause
