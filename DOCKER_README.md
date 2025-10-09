# 🐳 Docker - GAMMA Service ERP

## 📋 Descripción

Configuración completa de Docker para desarrollo y producción del sistema GAMMA Service ERP.

---

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Windows)
```bash
# Doble click en:
docker-start.bat         # Producción
docker-start-dev.bat     # Desarrollo
```

### Opción 2: Comandos Manuales

#### Producción
```bash
docker-compose up -d
```

#### Desarrollo (con hot-reload)
```bash
docker-compose -f docker-compose.dev.yml up
```

---

## 📦 Servicios Incluidos

### Producción (`docker-compose.yml`)
| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **frontend** | 3000 | React + Nginx |
| **backend** | 8001 | Node.js + Express API |
| **mongodb** | 27017 | Base de datos MongoDB |

### Desarrollo (`docker-compose.dev.yml`)
| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **frontend** | 5173 | Vite dev server (hot-reload) |
| **backend** | 8001 | Nodemon (hot-reload) |
| **mongodb** | 27017 | Base de datos MongoDB |
| **mongo-express** | 8081 | UI para MongoDB |

---

## ⚙️ Configuración Inicial

### 1. Instalar Docker
- **Windows**: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Mac**: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux**: `sudo apt install docker.io docker-compose`

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo:
```bash
cp .env.docker.example .env
```

Edita `.env` con tus valores:
```bash
# MongoDB
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=tu_password_seguro

# JWT
JWT_SECRET=genera_un_string_aleatorio_seguro_de_64_caracteres

# Email
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password
```

**Generar JWT_SECRET seguro**:
```bash
# En Git Bash o WSL
openssl rand -base64 64

# En PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 🎯 Comandos Principales

### Iniciar servicios
```bash
# Producción (background)
docker-compose up -d

# Desarrollo (con logs)
docker-compose -f docker-compose.dev.yml up

# Ver logs
docker-compose logs -f
docker-compose logs -f backend  # Solo backend
```

### Detener servicios
```bash
docker-compose down              # Detener y remover contenedores
docker-compose down -v           # + eliminar volúmenes (borra DB)
docker-compose stop              # Solo detener (mantiene estado)
```

### Construir imágenes
```bash
# Forzar rebuild
docker-compose build --no-cache

# Rebuild y reiniciar
docker-compose up -d --build
```

### Ver estado
```bash
docker-compose ps                # Estado de servicios
docker-compose top               # Procesos en ejecución
docker stats                     # Uso de recursos en tiempo real
```

---

## 🔍 Acceder a los Servicios

### URLs Locales

#### Producción
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/api-docs
- **MongoDB**: mongodb://localhost:27017

#### Desarrollo
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/api-docs
- **Mongo Express**: http://localhost:8081
  - Usuario: `admin`
  - Password: `admin123`

---

## 🐛 Debugging

### Ver logs en tiempo real
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Entrar en un contenedor
```bash
docker exec -it gamma-backend sh
docker exec -it gamma-frontend sh
docker exec -it gamma-mongodb mongosh
```

### Verificar salud de servicios
```bash
docker-compose ps
docker inspect gamma-backend | grep -i health
```

### Reiniciar un servicio específico
```bash
docker-compose restart backend
docker-compose restart frontend
```

---

## 📊 Gestión de Base de Datos

### Backup de MongoDB
```bash
# Crear backup
docker exec gamma-mongodb mongodump --uri="mongodb://admin:admin123@localhost:27017/gamma_service?authSource=admin" --out=/dump

# Copiar backup al host
docker cp gamma-mongodb:/dump ./backup-$(date +%Y%m%d)
```

### Restaurar MongoDB
```bash
# Copiar backup al contenedor
docker cp ./backup-20231207 gamma-mongodb:/dump

# Restaurar
docker exec gamma-mongodb mongorestore --uri="mongodb://admin:admin123@localhost:27017/?authSource=admin" /dump
```

### Conectar a MongoDB
```bash
# Usando mongosh
docker exec -it gamma-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# Ver bases de datos
show dbs
use gamma_service
show collections
```

---

## 🧪 Testing en Docker

### Ejecutar tests en contenedor
```bash
# Backend tests
docker-compose exec backend npm test
docker-compose exec backend npm run test:coverage

# Build test
docker-compose build
```

---

## 🔧 Troubleshooting

### Problema: Puerto ocupado
**Error**: `Bind for 0.0.0.0:8001 failed: port is already allocated`

**Solución**:
```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :8001

# Matar el proceso (Windows)
taskkill /PID <PID> /F

# O cambiar puerto en docker-compose.yml
ports:
  - "8002:8001"
```

### Problema: MongoDB no inicia
**Error**: `MongoDB service unhealthy`

**Solución**:
```bash
# Ver logs de MongoDB
docker-compose logs mongodb

# Eliminar volumen y recrear
docker-compose down -v
docker-compose up -d
```

### Problema: Contenedor se reinicia constantemente
**Solución**:
```bash
# Ver logs
docker-compose logs backend

# Verificar health check
docker inspect gamma-backend

# Rebuildar imagen
docker-compose build --no-cache backend
docker-compose up -d
```

### Problema: No se ve código actualizado
**Solución**:
```bash
# Rebuild sin cache
docker-compose build --no-cache
docker-compose up -d

# O en desarrollo (hot-reload debería funcionar)
docker-compose -f docker-compose.dev.yml restart backend
```

### Problema: Error de permisos en volumes
**Windows/WSL**:
```bash
# Dar permisos a carpetas
mkdir backend/logs backend/uploads
chmod -R 777 backend/logs backend/uploads
```

---

## 📈 Optimización

### Reducir tamaño de imágenes
Las imágenes ya están optimizadas usando:
- ✅ Alpine Linux (imágenes pequeñas)
- ✅ Multi-stage builds
- ✅ .dockerignore
- ✅ npm ci (instalación limpia)

### Verificar tamaño de imágenes
```bash
docker images | grep gamma
```

Tamaños esperados:
- **Backend**: ~150-200 MB
- **Frontend**: ~50-80 MB
- **MongoDB**: ~150 MB

---

## 🚀 Deploy en Producción

### 1. Build para producción
```bash
docker-compose -f docker-compose.yml build
```

### 2. Subir a registry (Docker Hub, AWS ECR, etc.)
```bash
# Tag images
docker tag gamma-backend:latest your-registry/gamma-backend:v1.0.0
docker tag gamma-frontend:latest your-registry/gamma-frontend:v1.0.0

# Push
docker push your-registry/gamma-backend:v1.0.0
docker push your-registry/gamma-frontend:v1.0.0
```

### 3. Deploy en servidor
```bash
# En el servidor
docker-compose -f docker-compose.yml pull
docker-compose -f docker-compose.yml up -d
```

---

## 🔐 Seguridad

### Checklist de Seguridad
- [ ] Cambiar MONGO_ROOT_PASSWORD
- [ ] Generar JWT_SECRET único y seguro
- [ ] No commitear archivo .env
- [ ] Usar secrets en producción
- [ ] Ejecutar contenedores como non-root (✅ ya implementado)
- [ ] Activar HTTPS en producción
- [ ] Configurar firewall

### Usar Docker Secrets (Producción)
```yaml
secrets:
  mongo_password:
    external: true
  jwt_secret:
    external: true
```

---

## 📝 Arquitectura Docker

```
┌─────────────────────────────────────────┐
│           Docker Compose                │
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │ Frontend │  │ Backend  │           │
│  │  (Nginx) │  │ (Node.js)│           │
│  │   :3000  │  │   :8001  │           │
│  └────┬─────┘  └────┬─────┘           │
│       │             │                  │
│       └─────────────┴─────────┐       │
│                               │       │
│                         ┌─────┴─────┐ │
│                         │  MongoDB  │ │
│                         │   :27017  │ │
│                         └───────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📚 Recursos

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Best Practices for Node.js](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

## ✅ Checklist Pre-Deploy

Antes de deploy a producción:

- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET único y seguro (>32 caracteres)
- [ ] MongoDB con password fuerte
- [ ] Health checks funcionando
- [ ] Backups configurados
- [ ] Logs centralizados
- [ ] Monitoring activo
- [ ] HTTPS configurado
- [ ] Recursos limitados (CPU/RAM)
- [ ] Tests pasando en contenedores

---

**¡Docker configurado exitosamente!** 🎉

Para empezar, ejecuta:
```bash
docker-compose up -d
```

Luego abre: http://localhost:3000
