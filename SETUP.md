# GAMMA Service ERP - Guía de Configuración

## 📋 Requisitos Previos

- **Node.js** v16 o superior
- **MongoDB** v4.4 o superior (local o Atlas)
- **npm** o **yarn**

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd HOLA_XD
```

### 2. Configurar Variables de Entorno

#### Backend (.env en carpeta raíz)

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/gamma_service

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Otros ajustes
MAX_FILE_UPLOAD=1000000
FILE_UPLOAD_PATH=./public/uploads
```

#### Frontend (.env.local en carpeta raíz)

```env
# API Base URL
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=GAMMA Service ERP
VITE_APP_VERSION=1.0.0
```

### 3. Instalar Dependencias

#### Frontend

```bash
npm install
```

#### Backend

```bash
cd backend
npm install
cd ..
```

### 4. Iniciar MongoDB

Asegúrate de que MongoDB esté ejecutándose:

```bash
# Si usas MongoDB local
mongod

# O verifica que tu conexión a MongoDB Atlas esté configurada correctamente
```

### 5. Iniciar la Aplicación

#### Opción 1: Iniciar Backend y Frontend por Separado

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

#### Opción 2: Script de Inicio Rápido (Windows)

Crea un archivo `start.bat` en la raíz:

```batch
@echo off
echo Iniciando GAMMA Service ERP...
start cmd /k "cd backend && npm run dev"
timeout /t 3
start cmd /k "npm run dev"
echo Servidores iniciados!
```

Luego ejecuta:
```bash
start.bat
```

## 🔑 Credenciales de Prueba

El sistema incluye credenciales hardcoded para pruebas (modo demo):

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@gammaservice.com | admin123 | Administrador |
| vendedor@gammaservice.com | vendedor123 | Vendedor |
| cliente@gammaservice.com | cliente123 | Cliente |
| mecanico@gammaservice.com | mecanico123 | Mecánico |

## 📡 Endpoints de la API

### Autenticación
- `POST /api/users/register` - Registrar nuevo usuario
- `POST /api/users/login` - Iniciar sesión
- `GET /api/users/profile` - Obtener perfil (requiere auth)
- `PUT /api/users/profile` - Actualizar perfil (requiere auth)
- `POST /api/users/logout` - Cerrar sesión (requiere auth)

### Notificaciones
- `GET /api/notifications` - Obtener notificaciones
- `GET /api/notifications/unread/count` - Contador de no leídas
- `PATCH /api/notifications/:id/read` - Marcar como leída
- `PATCH /api/notifications/read-all` - Marcar todas como leídas
- `DELETE /api/notifications/:id` - Eliminar notificación
- `DELETE /api/notifications` - Eliminar todas

### Órdenes
- `GET /api/orders` - Listar órdenes
- `POST /api/orders` - Crear orden
- `GET /api/orders/:id` - Obtener orden
- `PUT /api/orders/:id` - Actualizar orden
- `DELETE /api/orders/:id` - Eliminar orden

### Técnicos
- `GET /api/technicians` - Listar técnicos
- `POST /api/technicians` - Crear técnico
- `GET /api/technicians/:id` - Obtener técnico
- `PUT /api/technicians/:id` - Actualizar técnico
- `DELETE /api/technicians/:id` - Eliminar técnico

### Integraciones Externas
- `POST /api/dian/validate` - Validar con DIAN
- `POST /api/datacredito/check` - Consultar Datacrédito
- `POST /api/transito/query` - Consultar tránsito

## 📚 Documentación de la API

Una vez iniciado el backend, accede a la documentación Swagger en:

```
http://localhost:5000/api-docs
```

## 🛠️ Estructura del Proyecto

```
HOLA_XD/
├── backend/                 # Servidor Node.js/Express
│   ├── config/             # Configuraciones (DB, Swagger, Logger)
│   ├── controllers/        # Controladores de rutas
│   ├── middleware/         # Middleware (auth, validación, errores)
│   ├── models/             # Modelos de MongoDB
│   ├── routes/             # Definición de rutas
│   ├── utils/              # Utilidades
│   └── server.js           # Punto de entrada del backend
├── src/                    # Frontend React
│   ├── components/         # Componentes React
│   ├── services/           # Servicios API
│   ├── hooks/              # Custom React Hooks
│   ├── types/              # TypeScript types
│   ├── assets/             # Imágenes y recursos
│   └── App.tsx             # Componente principal
├── .env                    # Variables de entorno (backend)
├── .env.local              # Variables de entorno (frontend)
└── package.json            # Dependencias del frontend
```

## 🔧 Solución de Problemas

### Error: "Cannot connect to MongoDB"

1. Verifica que MongoDB esté ejecutándose
2. Comprueba la cadena de conexión en `.env`
3. Si usas MongoDB Atlas, verifica tu IP en la whitelist

### Error: "CORS policy"

Asegúrate de que el frontend esté configurado en las opciones de CORS del backend (`server.js`):

```javascript
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  // ...
};
```

### Error: "Port already in use"

Cambia el puerto en `.env`:

```env
PORT=5001  # o cualquier puerto disponible
```

Y actualiza `VITE_API_URL` en `.env.local`:

```env
VITE_API_URL=http://localhost:5001/api
```

### Las notificaciones no se cargan

1. Verifica que el backend esté ejecutándose
2. Comprueba la consola del navegador para errores
3. Verifica que estés autenticado correctamente
4. Revisa los logs del backend para errores de base de datos

## 🎨 Características Implementadas

### ✅ Frontend
- ✅ Sistema de autenticación con login/registro
- ✅ Estados de carga en todos los formularios
- ✅ Centro de notificaciones integrado con backend
- ✅ Gestión de sesiones persistentes
- ✅ Manejo de errores y feedback al usuario
- ✅ Diseño responsive y moderno
- ✅ Integración completa con API REST

### ✅ Backend
- ✅ API RESTful con Express
- ✅ Autenticación JWT
- ✅ Sistema de notificaciones
- ✅ Validación de datos
- ✅ Manejo de errores centralizado
- ✅ Rate limiting
- ✅ Seguridad con Helmet
- ✅ Documentación Swagger
- ✅ Logging con Winston

## 📝 Próximos Pasos

1. **WebSockets**: Implementar notificaciones en tiempo real
2. **Tests**: Agregar pruebas unitarias e integración
3. **CI/CD**: Configurar pipeline de despliegue
4. **Docker**: Containerizar la aplicación
5. **Backup**: Sistema automático de respaldo de BD

## 📞 Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.

---

**Versión:** 1.0.0  
**Última actualización:** 2025-10-04
