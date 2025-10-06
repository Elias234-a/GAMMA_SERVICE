# Script to check and start services for GAMMA Service ERP
Write-Host "=== GAMMA Service - Verificación de Servicios ===" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is running
Write-Host "Verificando MongoDB..." -ForegroundColor Yellow
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "✓ MongoDB está corriendo (PID: $($mongoProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "✗ MongoDB NO está corriendo" -ForegroundColor Red
    Write-Host "  Por favor inicia MongoDB con: 'mongod' o inicia el servicio MongoDB" -ForegroundColor Yellow
}
Write-Host ""

# Check if backend is running on port 5000
Write-Host "Verificando Backend (Puerto 5000)..." -ForegroundColor Yellow
$backendPort = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($backendPort) {
    Write-Host "✓ Backend está corriendo en el puerto 5000" -ForegroundColor Green
} else {
    Write-Host "✗ Backend NO está corriendo en el puerto 5000" -ForegroundColor Red
    Write-Host "  Iniciando backend..." -ForegroundColor Yellow
    
    # Try to start backend
    $backendPath = Join-Path $PSScriptRoot "backend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev"
    Write-Host "✓ Backend iniciado en una nueva ventana" -ForegroundColor Green
}
Write-Host ""

# Check if frontend is running on port 5173
Write-Host "Verificando Frontend (Puerto 5173)..." -ForegroundColor Yellow
$frontendPort = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($frontendPort) {
    Write-Host "✓ Frontend está corriendo en el puerto 5173" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend NO está corriendo en el puerto 5173" -ForegroundColor Red
    Write-Host "  Iniciando frontend..." -ForegroundColor Yellow
    
    # Try to start frontend
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev"
    Write-Host "✓ Frontend iniciado en una nueva ventana" -ForegroundColor Green
}
Write-Host ""

Write-Host "=== Verificación Completa ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs de acceso:" -ForegroundColor White
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "  API Docs: http://localhost:5000/api-docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona cualquier tecla para cerrar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
