@echo off
title Katipuneros Library Store EF Core Migrations
cls
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0manage.ps1" migrate
pause
