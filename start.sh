#!/bin/bash

# Script de inicio para el Sistema de Gestión Vehicular
echo "🚀 Iniciando Sistema de Gestión Vehicular..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ primero."
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versión 18+ es requerida. Versión actual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del frontend..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependencias del backend..."
    cd backend && npm install && cd ..
fi

# Crear archivos .env si no existen
if [ ! -f ".env" ]; then
    echo "⚙️ Creando archivo .env para frontend..."
    cp .env.example .env
fi

if [ ! -f "backend/.env" ]; then
    echo "⚙️ Creando archivo .env para backend..."
    cp backend/.env.example backend/.env
fi

echo "🎯 Iniciando servidores..."
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo "📊 Health Check: http://localhost:5000/health"
echo ""
echo "👥 Usuarios de prueba:"
echo "   admin@test.com / admin123 (Administrador)"
echo "   vendedor@test.com / ventas123 (Vendedor)"
echo "   cliente@test.com / cliente123 (Cliente)"
echo "   mecanico@test.com / taller123 (Mecánico)"
echo ""
echo "Presiona Ctrl+C para detener los servidores"
echo ""

# Ejecutar ambos servidores
npm run dev