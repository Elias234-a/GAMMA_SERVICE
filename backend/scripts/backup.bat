@echo off
REM MongoDB Backup Script para Windows
REM Ejecuta el script de backup de Node.js

echo ===============================================
echo   MongoDB Backup - GAMMA Service ERP
echo ===============================================
echo.

cd /d "%~dp0.."
node scripts/backup-mongodb.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Backup completado exitosamente
) else (
    echo.
    echo [ERROR] Backup fallido - Revisa logs/backup.log
)

pause
