# Sistema de Gestión Vehicular

Sistema integral de gestión vehicular que incluye módulos para ventas, gestión de clientes, inventario de vehículos, taller mecánico, facturación, financiamiento, gestión de placas y más.

## 🚀 Características

- **Gestión de Ventas**: Control completo del proceso de ventas de vehículos
- **Gestión de Clientes**: Base de datos de clientes con historial
- **Inventario de Vehículos**: Control de stock y disponibilidad
- **Taller Mecánico**: Órdenes de servicio y mantenimiento
- **Facturación**: Sistema integrado de facturación
- **Financiamiento**: Gestión de créditos y financiación
- **CRM**: Sistema de gestión de relaciones con clientes
- **Reportes**: Análisis y reportes detallados
- **Portal de Clientes**: Acceso para clientes a su información
- **Gestión de Usuarios**: Control de roles y permisos

## 📋 Requisitos Previos

- Node.js 18+ (para frontend y backend)
- npm o yarn

## 🛠️ Instalación

### Frontend

```bash
# Instalar dependencias del frontend
npm install

# Copiar archivo de configuración
cp .env.example .env
```

### Backend (Opcional)

El frontend funciona con datos mock si el backend no está disponible.

```bash
# Instalar dependencias del backend
cd server
npm install

# Copiar archivo de configuración
cp .env.example .env
cd ..
```

## 🚀 Ejecución

### Solo Frontend (con datos mock)

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

### Frontend + Backend (datos reales)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

El backend estará disponible en `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## 👥 Usuarios de Prueba

El sistema incluye usuarios de prueba para cada rol:

- **Administrador**: 
  - Email: `admin@sistema.com`
  - Password: `admin123`
  - Acceso: Todos los módulos

- **Vendedor**:
  - Email: `ventas@sistema.com`
  - Password: `ventas123`
  - Acceso: Ventas, clientes, vehículos, CRM

- **Mecánico**:
  - Email: `mecanico@sistema.com`
  - Password: `mecanico123`
  - Acceso: Taller mecánico

- **Cliente**:
  - Email: `cliente@sistema.com`
  - Password: `cliente123`
  - Acceso: Portal de clientes

## 🏗️ Construcción para Producción

### Frontend

```bash
npm run build
```

Los archivos compilados estarán en el directorio `dist/`

### Backend

```bash
cd server
npm start
```

## 📁 Estructura del Proyecto

```
/
├── src/                    # Código fuente del frontend
│   ├── components/        # Componentes React
│   │   ├── ui/           # Componentes de interfaz reutilizables
│   │   └── ...           # Módulos específicos
│   ├── context/          # Context API (AuthContext)
│   ├── pages/            # Páginas de la aplicación
│   ├── services/         # Servicios API
│   ├── types/            # Tipos TypeScript
│   ├── styles/           # Estilos globales
│   └── data/             # Datos mock
├── server/               # Backend API (Node.js/Express)
│   ├── routes/          # Rutas de la API
│   ├── server.js        # Servidor principal
│   └── package.json     # Dependencias del backend
├── public/              # Archivos estáticos
└── package.json         # Dependencias del frontend
```

## 🔌 API Endpoints

El backend proporciona los siguientes endpoints:

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/logout` - Cerrar sesión

### Vehículos
- `GET /api/vehicles` - Listar vehículos
- `POST /api/vehicles` - Crear vehículo
- `PUT /api/vehicles/:id` - Actualizar vehículo
- `DELETE /api/vehicles/:id` - Eliminar vehículo

### Clientes
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Crear cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente

### Ventas
- `GET /api/sales` - Listar ventas
- `POST /api/sales` - Crear venta
- `PUT /api/sales/:id` - Actualizar venta
- `DELETE /api/sales/:id` - Eliminar venta

### Taller
- `GET /api/workshop` - Listar órdenes de servicio
- `POST /api/workshop` - Crear orden
- `PUT /api/workshop/:id` - Actualizar orden
- `DELETE /api/workshop/:id` - Eliminar orden

### Inventario
- `GET /api/inventory` - Listar items de inventario
- `POST /api/inventory` - Crear item
- `PUT /api/inventory/:id` - Actualizar item
- `DELETE /api/inventory/:id` - Eliminar item

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 18 con TypeScript
- Vite (build tool)
- React Router (navegación)
- Radix UI (componentes de interfaz)
- TailwindCSS (estilos)
- Recharts (gráficos)
- jsPDF (generación de PDFs)
- XLSX (exportación a Excel)

### Backend
- Node.js con Express
- JWT (autenticación)
- bcrypt (encriptación)
- CORS (configuración)

## 📝 Notas

- El sistema funciona con o sin backend
- Si el backend no está disponible, se utilizan datos mock
- Los datos mock están disponibles para desarrollo rápido
- Para producción, se recomienda usar el backend con base de datos real

## 🔐 Seguridad

- Autenticación basada en JWT
- Control de acceso basado en roles
- Validación de datos en frontend y backend
- Variables de entorno para configuración sensible

## 📄 Licencia

MIT