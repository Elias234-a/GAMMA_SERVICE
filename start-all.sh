#!/bin/bash

# Script to start both frontend and backend

echo "🚀 Iniciando Sistema de Gestión Vehicular..."
echo ""

# Check if backend dependencies are installed
if [ ! -d "server/node_modules" ]; then
  echo "📦 Instalando dependencias del backend..."
  cd server && npm install && cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependencias del frontend..."
  npm install
fi

# Start backend in background
echo "🔧 Iniciando backend en http://localhost:5000..."
cd server && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Go back to root
cd ..

# Start frontend
echo "🌐 Iniciando frontend en http://localhost:3000..."
npm run dev

# Trap to kill background process on exit
trap "kill $BACKEND_PID" EXIT
