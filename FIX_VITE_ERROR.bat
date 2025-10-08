@echo off
echo =====================================================
echo SOLUCIONANDO ERROR DE VITE
echo =====================================================
echo.

echo 1. Limpiando cache de npm...
call npm cache clean --force

echo.
echo 2. Eliminando node_modules...
rmdir /s /q node_modules

echo.
echo 3. Eliminando package-lock.json...
del /f /q package-lock.json

echo.
echo 4. Reinstalando dependencias...
call npm install

echo.
echo 5. Instalando React Query nuevamente...
call npm install @tanstack/react-query

echo.
echo =====================================================
echo SOLUCION COMPLETA
echo =====================================================
echo.
echo Ahora puedes ejecutar: npm run dev
echo.
pause
