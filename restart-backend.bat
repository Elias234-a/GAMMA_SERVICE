@echo off
echo ========================================
echo   GAMMA Service - Reinicio de Backend
echo ========================================
echo.

cd backend

echo [1/3] Deteniendo procesos anteriores...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo [2/3] Limpiando cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo [3/3] Iniciando servidor...
echo.
echo ========================================
echo   Backend iniciado en http://localhost:5000
echo   Presiona Ctrl+C para detener
echo ========================================
echo.

npm start
