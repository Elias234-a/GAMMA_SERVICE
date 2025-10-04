# Sistema de Gestión Vehicular - Backend API

Backend API para el Sistema de Gestión Vehicular.

## Instalación

```bash
cd server
npm install
```

## Configuración

Crea un archivo `.env` basado en `.env.example` y configura las variables de entorno.

## Ejecución

### Modo desarrollo (con auto-reload)
```bash
npm run dev
```

### Modo producción
```bash
npm start
```

El servidor se ejecutará en `http://localhost:5000` por defecto.

## Endpoints Disponibles

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/logout` - Cerrar sesión

### Vehículos
- `GET /api/vehicles` - Obtener todos los vehículos
- `GET /api/vehicles/:id` - Obtener un vehículo
- `POST /api/vehicles` - Crear vehículo
- `PUT /api/vehicles/:id` - Actualizar vehículo
- `DELETE /api/vehicles/:id` - Eliminar vehículo

### Clientes
- `GET /api/clients` - Obtener todos los clientes
- `GET /api/clients/:id` - Obtener un cliente
- `POST /api/clients` - Crear cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente

### Ventas
- `GET /api/sales` - Obtener todas las ventas
- `GET /api/sales/:id` - Obtener una venta
- `POST /api/sales` - Crear venta
- `PUT /api/sales/:id` - Actualizar venta
- `DELETE /api/sales/:id` - Eliminar venta

### Taller
- `GET /api/workshop` - Obtener todas las órdenes
- `GET /api/workshop/:id` - Obtener una orden
- `POST /api/workshop` - Crear orden
- `PUT /api/workshop/:id` - Actualizar orden
- `DELETE /api/workshop/:id` - Eliminar orden

### Inventario
- `GET /api/inventory` - Obtener todos los items
- `GET /api/inventory/:id` - Obtener un item
- `POST /api/inventory` - Crear item
- `PUT /api/inventory/:id` - Actualizar item
- `DELETE /api/inventory/:id` - Eliminar item

## Usuarios de Prueba

- **Administrador**: admin@sistema.com / admin123
- **Vendedor**: ventas@sistema.com / ventas123
- **Mecánico**: mecanico@sistema.com / mecanico123
- **Cliente**: cliente@sistema.com / cliente123
