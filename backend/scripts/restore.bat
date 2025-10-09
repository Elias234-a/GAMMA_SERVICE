@echo off
REM MongoDB Restore Script para Windows
REM Ejecuta el script de restauración de Node.js

echo ===============================================
echo   MongoDB Restore - GAMMA Service ERP
echo ===============================================
echo.

cd /d "%~dp0.."
node scripts/restore-mongodb.js %*

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Restauracion completada exitosamente
) else (
    echo.
    echo [ERROR] Restauracion fallida - Revisa logs/restore.log
)

pause
