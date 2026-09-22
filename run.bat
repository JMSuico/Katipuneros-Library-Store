@echo off
title Katipuneros Library Store Controller
cls
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0manage.ps1" %*
pause
