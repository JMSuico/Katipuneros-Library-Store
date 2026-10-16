@echo off
title Katipuneros Library Store EF Core Migrations
cls
echo ======================================================================
echo   KATIPUNEROS LIBRARY STORE -- EF CORE DATABASE MIGRATIONS
echo   Interactive Database Schema Migration ^& Update Utility
echo ======================================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0manage.ps1" migrate
pause
