@echo off
title Start Katipuneros Library Store Dev [Backend :5000 - Patron :5173 - Admin :5174 - Cashier :5175]
cls
echo ======================================================================
echo   KATIPUNEROS LIBRARY STORE -- STARTING 4-SERVICE DEV PREVIEW
echo   Backend (:5000) - Patron (:5173) - Admin (:5174) - Cashier (:5175)
echo ======================================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0manage.ps1" start
echo.
echo ======================================================================
echo   SYSTEM LIVE STATUS MATRIX
echo ======================================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0manage.ps1" status
pause
