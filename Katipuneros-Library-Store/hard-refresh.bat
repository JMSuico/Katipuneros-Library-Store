@echo off
title Hard Refresh Katipuneros Library Store
cls
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0manage.ps1" refresh
pause
