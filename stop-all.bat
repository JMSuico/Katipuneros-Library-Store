@echo off
title Stop Katipuneros Library Store Services [Ports 5000, 5173, 5174, 5175]
cls
echo ======================================================================
echo   KATIPUNEROS LIBRARY STORE -- STOPPING ALL SERVICES
echo   Freeing Ports 5000 (API), 5173 (Patron), 5174 (Admin), 5175 (Cashier)
echo ======================================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0manage.ps1" stop
pause
