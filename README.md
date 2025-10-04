# Sistema de Gestión Vehicular

Un sistema completo de gestión para concesionarios de vehículos que incluye frontend y backend integrados.

## 🚀 Características Principales

- **Gestión de Clientes**: CRM completo con seguimiento de relaciones
- **Gestión de Vehículos**: Inventario completo con estados y características
- **Ventas**: Proceso completo de ventas con financiación
- **Taller**: Órdenes de trabajo y servicios
- **Facturación**: Gestión de facturación y pagos
- **Financiación**: Gestión de créditos y financiación
- **Placas**: Trámites de placas y documentos
- **Inventario**: Control de stock y compras
- **Compras**: Gestión de proveedores
- **Recursos Humanos**: Gestión de empleados
- **Reportes**: Dashboards y analytics
- **DIAN**: Integración con sistemas fiscales
- **Portal Cliente**: Portal web para clientes
- **Usuarios**: Gestión de usuarios y roles

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Vite** como build tool
- **Tailwind CSS** para estilos
- **Radix UI** para componentes
- **React Router** para navegación
- **React Hook Form** para formularios
- **Recharts** para gráficos
- **Lucide React** para iconos

### Backend
- **Node.js** con Express
- **JWT** para autenticación
- **Express Validator** para validación
- **CORS** para comunicación cross-origin
- **Helmet** para seguridad
- **Rate Limiting** para protección

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación Completa

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd sistema-gestion-vehicular
```

2. **Instalar todas las dependencias**
```bash
npm run install:all
```

3. **Configurar variables de entorno**
```bash
# Copiar archivo de ejemplo
cp .env.example .env
cp backend/.env.example backend/.env

# Editar las variables según tu configuración
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

Esto ejecutará tanto el frontend (puerto 3000) como el backend (puerto 5000) simultáneamente.

## 🚀 Scripts Disponibles

### Desarrollo
```bash
npm run dev              # Ejecutar frontend y backend en desarrollo
npm run dev:frontend     # Solo frontend
npm run dev:backend      # Solo backend
```

### Producción
```bash
npm run build            # Construir frontend
npm run start            # Ejecutar en producción
```

### Instalación
```bash
npm run install:all      # Instalar todas las dependencias
npm run build:backend    # Instalar dependencias del backend
```

## 🔧 Configuración

### Variables de Entorno Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Sistema de Gestión Vehicular
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development
```

### Variables de Entorno Backend (backend/.env)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

## 👥 Usuarios de Prueba

El sistema incluye usuarios de prueba predefinidos:

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@test.com | admin123 | Administrador |
| vendedor@test.com | ventas123 | Vendedor |
| cliente@test.com | cliente123 | Cliente |
| mecanico@test.com | taller123 | Mecánico |

## 📁 Estructura del Proyecto

```
sistema-gestion-vehicular/
├── src/                          # Frontend
│   ├── components/               # Componentes React
│   │   ├── ui/                   # Componentes UI reutilizables
│   │   └── ...                   # Módulos específicos
│   ├── pages/                    # Páginas principales
│   ├── services/                 # Servicios API
│   ├── types/                    # Definiciones de tipos
│   ├── context/                  # Contextos React
│   └── styles/                   # Estilos globales
├── backend/                      # Backend
│   ├── src/                      # Código fuente
│   │   ├── routes/               # Rutas de la API
│   │   └── server.js             # Servidor principal
│   └── package.json              # Dependencias del backend
├── public/                       # Archivos públicos
└── package.json                  # Dependencias del frontend
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrarse
- `GET /api/auth/verify` - Verificar token

### Clientes
- `GET /api/clients` - Listar clientes
- `GET /api/clients/:id` - Obtener cliente
- `POST /api/clients` - Crear cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente

### Vehículos
- `GET /api/vehicles` - Listar vehículos
- `GET /api/vehicles/:id` - Obtener vehículo
- `POST /api/vehicles` - Crear vehículo
- `PUT /api/vehicles/:id` - Actualizar vehículo
- `DELETE /api/vehicles/:id` - Eliminar vehículo

### Ventas
- `GET /api/sales` - Listar ventas
- `GET /api/sales/:id` - Obtener venta
- `POST /api/sales` - Crear venta
- `PUT /api/sales/:id` - Actualizar venta
- `DELETE /api/sales/:id` - Eliminar venta

### Taller
- `GET /api/workshop` - Listar órdenes de taller
- `GET /api/workshop/:id` - Obtener orden
- `POST /api/workshop` - Crear orden
- `PUT /api/workshop/:id` - Actualizar orden
- `DELETE /api/workshop/:id` - Eliminar orden

### Inventario
- `GET /api/inventory` - Listar inventario
- `GET /api/inventory/:id` - Obtener item
- `POST /api/inventory` - Crear item
- `PUT /api/inventory/:id` - Actualizar item
- `DELETE /api/inventory/:id` - Eliminar item

### Reportes
- `GET /api/reports/sales` - Reporte de ventas
- `GET /api/reports/inventory` - Reporte de inventario
- `GET /api/reports/workshop` - Reporte de taller
- `GET /api/reports/dashboard` - Resumen del dashboard

## 🎨 Componentes UI

El proyecto incluye una biblioteca completa de componentes UI basados en Radix UI:

- **Accordion** - Acordeones desplegables
- **Alert Dialog** - Diálogos de confirmación
- **Button** - Botones con variantes
- **Card** - Tarjetas de contenido
- **Dialog** - Modales y diálogos
- **Form** - Formularios con validación
- **Input** - Campos de entrada
- **Select** - Selectores desplegables
- **Table** - Tablas de datos
- **Tabs** - Pestañas de navegación
- **Toast** - Notificaciones
- Y muchos más...

## 🔒 Seguridad

- **JWT Authentication** - Autenticación basada en tokens
- **CORS** - Configuración de origen cruzado
- **Helmet** - Headers de seguridad
- **Rate Limiting** - Límite de peticiones
- **Input Validation** - Validación de entrada
- **Role-based Access** - Control de acceso por roles

## 📊 Roles y Permisos

### Administrador
- Acceso completo a todos los módulos
- Gestión de usuarios y roles
- Configuración del sistema

### Vendedor
- Dashboard, Ventas, Clientes, Vehículos, CRM
- Proceso completo de ventas
- Gestión de clientes

### Mecánico
- Dashboard, Taller
- Órdenes de trabajo
- Gestión de servicios

### Cliente
- Dashboard, Portal Cliente
- Visualización de servicios
- Historial de compras

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Subir carpeta 'dist' a tu plataforma de hosting
```

### Backend (Railway/Heroku/DigitalOcean)
```bash
cd backend
npm install
npm start
```

### Docker (Opcional)
```dockerfile
# Dockerfile para el backend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🐛 Solución de Problemas

### Error de CORS
- Verificar que `FRONTEND_URL` en el backend coincida con la URL del frontend
- Asegurarse de que ambos servidores estén ejecutándose

### Error de Autenticación
- Verificar que el token JWT sea válido
- Comprobar la configuración de `JWT_SECRET`

### Error de Build
- Ejecutar `npm run install:all` para instalar todas las dependencias
- Verificar que Node.js sea versión 18+

## 📝 Notas de Desarrollo

- Los datos están simulados con arrays en memoria (mock data)
- Para producción, integrar con una base de datos real (MongoDB, PostgreSQL)
- Los archivos de tipos están centralizados en `src/types/`
- Los servicios API están en `src/services/api.ts`
- El contexto de autenticación maneja el estado global del usuario

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto, contactar al equipo de desarrollo.

---

**¡Disfruta usando el Sistema de Gestión Vehicular! 🚗✨**