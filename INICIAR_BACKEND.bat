@echo off
echo ================================================
echo   Iniciando Backend - GAMMA Service ERP
echo ================================================
echo.

cd backend

echo [1/3] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
)

echo.
echo [2/3] Iniciando servidor backend en puerto 8001...
echo.
echo IMPORTANTE: Mantén esta ventana abierta
echo El backend estará disponible en: http://localhost:8001
echo.
echo Para detener el servidor: Presiona Ctrl+C
echo ================================================
echo.

call npm run dev
