# Sistema de Gestión Vehicular

Un sistema integral de gestión vehicular desarrollado con React, TypeScript y Node.js, diseñado para optimizar todos los procesos de concesionarios y talleres automotrices.

## 🚀 Características Principales

### Frontend
- **Dashboard Interactivo**: Resumen completo del negocio con métricas en tiempo real
- **Gestión de Clientes**: Registro y seguimiento completo de clientes
- **Control de Inventario**: Administración detallada de vehículos disponibles
- **Proceso de Ventas**: Flujo completo desde cotización hasta entrega
- **Módulo de Taller**: Gestión de servicios de mantenimiento y reparaciones
- **Sistema de Autenticación**: Autenticación por roles con permisos granulares
- **Interfaz Moderna**: Diseño responsive con componentes reutilizables

### Backend
- **API RESTful**: Endpoints completos para todas las funcionalidades
- **Autenticación JWT**: Sistema seguro de autenticación
- **Validación de Datos**: Validación robusta con express-validator
- **Manejo de Errores**: Gestión centralizada de errores
- **Rate Limiting**: Protección contra abuso de API
- **CORS Configurado**: Integración segura con frontend

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Tailwind CSS** - Framework de CSS utilitario
- **Vite** - Herramienta de construcción rápida
- **Radix UI** - Componentes accesibles
- **React Router** - Enrutamiento del lado del cliente
- **React Hook Form** - Manejo de formularios
- **Lucide React** - Iconografía moderna

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web minimalista
- **JWT** - Autenticación basada en tokens
- **bcryptjs** - Hashing de contraseñas
- **express-validator** - Validación de datos
- **CORS** - Configuración de recursos cruzados
- **Helmet** - Seguridad HTTP
- **Compression** - Compresión de respuestas

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd sistema-gestion-vehicular
```

### 2. Configurar Variables de Entorno

#### Frontend
```bash
cp .env.example .env
```

#### Backend
```bash
cd backend
cp .env.example .env
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
```

### 4. Ejecutar el Proyecto

#### Desarrollo (Frontend y Backend)
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

#### Producción
```bash
# Backend
cd backend
npm start

# Frontend
npm run build
npm run preview
```

## 🔐 Credenciales de Prueba

El sistema incluye usuarios de prueba para diferentes roles:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@empresa.com | admin123 |
| Vendedor | vendedor@empresa.com | vendedor123 |
| Mecánico | mecanico@empresa.com | mecanico123 |
| Cliente | cliente@empresa.com | cliente123 |

## 📁 Estructura del Proyecto

```
sistema-gestion-vehicular/
├── src/                          # Frontend
│   ├── components/              # Componentes reutilizables
│   │   ├── ui/                  # Componentes de UI base
│   │   ├── LoginScreen.tsx      # Pantalla de login
│   │   ├── Sidebar.tsx          # Barra lateral de navegación
│   │   ├── TopBar.tsx           # Barra superior
│   │   └── ...                  # Otros componentes
│   ├── pages/                   # Páginas principales
│   │   ├── Home.tsx             # Dashboard principal
│   │   └── About.tsx            # Página de información
│   ├── context/                 # Contextos de React
│   │   └── AuthContext.tsx      # Contexto de autenticación
│   ├── services/                # Servicios de API
│   │   └── api.ts               # Cliente de API
│   ├── types/                   # Definiciones de tipos
│   │   ├── auth.types.ts        # Tipos de autenticación
│   │   └── client.types.ts      # Tipos de cliente
│   └── styles/                  # Estilos globales
├── backend/                     # Backend
│   ├── src/                     # Código fuente del servidor
│   │   ├── routes/              # Rutas de la API
│   │   │   ├── auth.js          # Autenticación
│   │   │   ├── clients.js       # Gestión de clientes
│   │   │   ├── vehicles.js      # Gestión de vehículos
│   │   │   ├── sales.js         # Gestión de ventas
│   │   │   └── workshop.js      # Gestión de taller
│   │   └── server.js            # Servidor principal
│   ├── package.json             # Dependencias del backend
│   └── .env.example             # Variables de entorno
├── package.json                 # Dependencias del frontend
├── vite.config.ts               # Configuración de Vite
├── tsconfig.json                # Configuración de TypeScript
└── README.md                    # Este archivo
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/logout` - Cerrar sesión

### Clientes
- `GET /api/clients` - Obtener todos los clientes
- `GET /api/clients/:id` - Obtener cliente por ID
- `POST /api/clients` - Crear nuevo cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente

### Vehículos
- `GET /api/vehicles` - Obtener todos los vehículos
- `GET /api/vehicles/:id` - Obtener vehículo por ID
- `POST /api/vehicles` - Crear nuevo vehículo
- `PUT /api/vehicles/:id` - Actualizar vehículo
- `DELETE /api/vehicles/:id` - Eliminar vehículo
- `GET /api/vehicles/stats/overview` - Estadísticas de vehículos

### Ventas
- `GET /api/sales` - Obtener todas las ventas
- `GET /api/sales/:id` - Obtener venta por ID
- `POST /api/sales` - Crear nueva venta
- `PUT /api/sales/:id` - Actualizar venta
- `DELETE /api/sales/:id` - Eliminar venta
- `GET /api/sales/stats/overview` - Estadísticas de ventas

### Taller
- `GET /api/workshop` - Obtener todos los servicios
- `GET /api/workshop/:id` - Obtener servicio por ID
- `POST /api/workshop` - Crear nuevo servicio
- `PUT /api/workshop/:id` - Actualizar servicio
- `DELETE /api/workshop/:id` - Eliminar servicio
- `GET /api/workshop/stats/overview` - Estadísticas del taller

## 🎨 Roles y Permisos

El sistema implementa un sistema de roles con permisos específicos:

- **Administrador**: Acceso completo a todos los módulos
- **Vendedor**: Acceso a ventas, clientes, vehículos y CRM
- **Mecánico**: Acceso a taller y dashboard
- **Cliente**: Acceso a portal de cliente y dashboard

## 🚀 Despliegue

### Frontend (Vercel/Netlify)
```bash
npm run build
# Subir la carpeta dist/ a tu plataforma de hosting
```

### Backend (Railway/Heroku/DigitalOcean)
```bash
cd backend
# Configurar variables de entorno en la plataforma
# Desplegar el código
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto, contacta a:
- Email: soporte@empresa.com
- Documentación: [Wiki del proyecto]

## 🔄 Roadmap

- [ ] Integración con base de datos MongoDB
- [ ] Sistema de notificaciones en tiempo real
- [ ] Módulo de reportes avanzados
- [ ] Integración con sistemas de pago
- [ ] App móvil (React Native)
- [ ] Integración con DIAN para facturación electrónica
- [ ] Sistema de backup automático
- [ ] Dashboard de analytics avanzado

---

**Desarrollado con ❤️ para la industria automotriz colombiana**