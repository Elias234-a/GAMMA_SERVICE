@echo off
echo ================================
echo   GAMMA Service ERP - Development
echo ================================
echo.

echo Iniciando servicios en modo desarrollo...
echo.

docker-compose -f docker-compose.dev.yml up

echo.
echo Servicios detenidos.
echo.

pause
