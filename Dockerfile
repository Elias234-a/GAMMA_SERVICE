# Dockerfile para el Sistema de Gestión Vehicular
# Multi-stage build para optimizar el tamaño de la imagen

# Stage 1: Build del frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Build del backend
FROM node:18-alpine AS backend-build
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .

# Stage 3: Imagen final
FROM node:18-alpine AS production
WORKDIR /app

# Instalar dependencias del backend
COPY --from=backend-build /app/node_modules ./backend/node_modules
COPY --from=backend-build /app/src ./backend/src
COPY --from=backend-build /app/package*.json ./backend/

# Copiar frontend build
COPY --from=frontend-build /app/dist ./dist

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Exponer puerto
EXPOSE 5000

# Comando de inicio
CMD ["node", "backend/src/server.js"]