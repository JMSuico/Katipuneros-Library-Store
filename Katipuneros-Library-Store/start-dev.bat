@echo off
title Start Katipuneros Library Store Dev
cls
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0manage.ps1" start
pause
