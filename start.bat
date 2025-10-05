@echo off
echo ========================================
echo   GAMMA Service ERP - Sistema Iniciando
echo ========================================
echo.

REM Check if node_modules exists in root
if not exist "node_modules\" (
    echo [INFO] Instalando dependencias del frontend...
    call npm install
    echo.
)

REM Check if node_modules exists in backend
if not exist "backend\node_modules\" (
    echo [INFO] Instalando dependencias del backend...
    cd backend
    call npm install
    cd ..
    echo.
)

echo [INFO] Iniciando servidor backend en puerto 5000...
start "GAMMA Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [INFO] Iniciando servidor frontend en puerto 5173...
start "GAMMA Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   Servidores Iniciados Correctamente
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:5000/api-docs
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
