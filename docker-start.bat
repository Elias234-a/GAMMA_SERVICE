@echo off
echo ================================
echo   GAMMA Service ERP - Docker
echo ================================
echo.

echo Iniciando servicios con Docker Compose...
echo.

docker-compose up -d

echo.
echo ================================
echo   Servicios iniciados!
echo ================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8001
echo API Docs:  http://localhost:8001/api-docs
echo MongoDB:   localhost:27017
echo.
echo Para ver logs: docker-compose logs -f
echo Para detener:  docker-compose down
echo.

pause
