@echo off
echo ========================================
echo   GAMMA Service - Reinicio de Frontend
echo ========================================
echo.

echo [1/3] Deteniendo procesos anteriores...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo [2/3] Limpiando cache de Vite...
if exist node_modules\.vite rmdir /s /q node_modules\.vite

echo.
echo [3/3] Iniciando servidor de desarrollo...
echo.
echo ========================================
echo   Frontend iniciado en http://localhost:5173
echo   Presiona Ctrl+C para detener
echo ========================================
echo.

npm run dev
