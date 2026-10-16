@echo off
title Hard Refresh Katipuneros Library Store [Ports 5000, 5173, 5174, 5175]
cls
echo ======================================================================
echo   KATIPUNEROS LIBRARY STORE -- HARD REFRESH ^& REBUILD
echo   Purging Vite/Dist Caches, .NET Bin/Obj, and Restarting 4 Services
echo ======================================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0manage.ps1" refresh
pause
