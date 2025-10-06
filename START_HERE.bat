@echo off
color 0A
title GAMMA Service - Inicio del Sistema

echo.
echo ========================================
echo    GAMMA SERVICE ERP/DMS v2.0
echo    Sistema de Gestion Integral
echo ========================================
echo.
echo Seleccione una opcion:
echo.
echo [1] Iniciar Backend
echo [2] Iniciar Frontend
echo [3] Iniciar Ambos (Recomendado)
echo [4] Ver estado de servicios
echo [5] Salir
echo.
set /p option="Ingrese su opcion (1-5): "

if "%option%"=="1" goto backend
if "%option%"=="2" goto frontend
if "%option%"=="3" goto both
if "%option%"=="4" goto status
if "%option%"=="5" goto end

:backend
echo.
echo Iniciando Backend...
start "GAMMA Backend" cmd /k "cd backend && npm start"
echo Backend iniciado en http://localhost:5000
timeout /t 3 >nul
goto menu

:frontend
echo.
echo Iniciando Frontend...
start "GAMMA Frontend" cmd /k "npm run dev"
echo Frontend iniciado en http://localhost:5173
timeout /t 3 >nul
goto menu

:both
echo.
echo [1/2] Iniciando Backend...
start "GAMMA Backend" cmd /k "cd backend && npm start"
timeout /t 5 >nul
echo.
echo [2/2] Iniciando Frontend...
start "GAMMA Frontend" cmd /k "npm run dev"
echo.
echo ========================================
echo   SERVICIOS INICIADOS
echo ========================================
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo   API Docs: http://localhost:5000/api-docs
echo ========================================
timeout /t 5 >nul
goto end

:status
echo.
echo Verificando servicios...
netstat -ano | findstr :5000
netstat -ano | findstr :5173
timeout /t 5 >nul
goto menu

:menu
echo.
pause
cls
goto start

:end
echo.
echo Gracias por usar GAMMA Service!
timeout /t 2 >nul
exit
