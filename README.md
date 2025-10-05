# GAMMA Service ERP 🚗

Sistema integral de gestión empresarial para concesionarios de vehículos, talleres mecánicos y servicios automotrices.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D4.4-green.svg)

## 🌟 Características Principales

### 💼 Gestión Empresarial Completa
- **Ventas y Cotizaciones**: Gestión completa del proceso de ventas
- **Inventario de Vehículos**: Control de stock y disponibilidad
- **CRM**: Gestión de relaciones con clientes
- **Taller y Postventa**: Órdenes de trabajo y seguimiento
- **Facturación Electrónica**: Integración con DIAN
- **Reportes y Análisis**: Dashboards y reportes personalizables

### 🔐 Sistema de Autenticación
- Login/Registro con validación completa
- Gestión de roles y permisos (Administrador, Vendedor, Cliente, Mecánico)
- Persistencia de sesión con JWT
- Recuperación de contraseña
- Logout seguro

### 🔔 Centro de Notificaciones
- Notificaciones en tiempo real
- Contador de notificaciones no leídas
- Marcar como leída/eliminar
- Sincronización automática con backend
- Diseño moderno e intuitivo

### ⚡ Estados de Carga
- Loading spinners en todas las operaciones asíncronas
- Feedback visual inmediato
- Mejor experiencia de usuario

### 🎨 Diseño Moderno
- Interfaz intuitiva y profesional
- Responsive design (Desktop, Tablet, Mobile)
- Animaciones suaves
- Tema oscuro con acentos naranja

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Windows)

```bash
# Ejecutar el script de inicio
start.bat
```

Este script:
- ✅ Instala dependencias automáticamente
- ✅ Inicia backend y frontend
- ✅ Abre ambos servidores en terminales separadas

### Opción 2: Manual

#### 1. Instalar Dependencias

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

#### 2. Configurar Variables de Entorno

Copia `.env.example` a `.env` (backend) y `.env.local` (frontend) y configura según tu entorno.

#### 3. Iniciar Servidores

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

## 📋 Requisitos

- **Node.js** v16 o superior
- **MongoDB** v4.4 o superior
- **npm** o **yarn**

## 🔑 Credenciales de Prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@gammaservice.com | admin123 | Administrador |
| vendedor@gammaservice.com | vendedor123 | Vendedor |
| cliente@gammaservice.com | cliente123 | Cliente |
| mecanico@gammaservice.com | mecanico123 | Mecánico |

## 📡 URLs del Sistema

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **API Docs**: http://localhost:5000/api-docs

## 📚 Documentación

- **[SETUP.md](./SETUP.md)** - Guía completa de instalación y configuración
- **[TESTING.md](./TESTING.md)** - Guía de pruebas y QA
- **[CHANGELOG.md](./CHANGELOG.md)** - Historial de cambios

## 🏗️ Arquitectura

### Frontend
- **React 18** con TypeScript
- **Vite** para build y desarrollo
- **TailwindCSS** para estilos
- **Lucide React** para iconos
- **Axios** para peticiones HTTP
- **Custom Hooks** para lógica reutilizable

### Backend
- **Node.js** con Express
- **MongoDB** con Mongoose
- **JWT** para autenticación
- **Bcrypt** para hash de contraseñas
- **Winston** para logging
- **Swagger** para documentación API

## 📦 Módulos del Sistema

1. **Dashboard** - Panel principal con métricas
2. **Ventas** - Gestión de ventas y cotizaciones
3. **Clientes** - Base de datos de clientes
4. **Vehículos** - Inventario de vehículos
5. **CRM** - Gestión de relaciones
6. **Taller** - Órdenes de trabajo
7. **Facturación** - Finanzas y contabilidad
8. **Financiamiento** - Evaluación crediticia
9. **Placas** - Trámites con tránsito
10. **Inventario** - Control de stock
11. **Compras** - Gestión de proveedores
12. **RRHH** - Recursos humanos
13. **Reportes** - Análisis y reportes
14. **DIAN** - Facturación electrónica
15. **Portal Cliente** - Acceso para clientes
16. **Usuarios** - Gestión de roles

## 🛠️ Stack Tecnológico

### Frontend
```json
{
  "react": "^18.3.1",
  "typescript": "^5.0.0",
  "vite": "^6.3.5",
  "tailwindcss": "^3.0.0",
  "axios": "^1.6.0",
  "lucide-react": "^0.487.0"
}
```

### Backend
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.19.0",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "winston": "^3.18.3",
  "swagger-ui-express": "^5.0.1"
}
```

## 🔒 Seguridad

- ✅ Autenticación JWT
- ✅ Hash de contraseñas con bcrypt
- ✅ Validación de inputs
- ✅ Sanitización de datos
- ✅ Rate limiting
- ✅ Helmet para headers de seguridad
- ✅ CORS configurado
- ✅ Manejo seguro de tokens

## 🧪 Testing

Ver [TESTING.md](./TESTING.md) para la guía completa de pruebas.

```bash
# Backend tests
cd backend
npm test

# Frontend tests (próximamente)
npm test
```

## 📈 Roadmap

### v1.1.0
- [ ] WebSockets para notificaciones en tiempo real
- [ ] Tests unitarios y de integración
- [ ] CI/CD pipeline
- [ ] Docker containerization

### v1.2.0
- [ ] Módulo de reportes avanzados
- [ ] Exportación/Importación de datos
- [ ] Dashboard personalizable
- [ ] Temas de color

### v2.0.0
- [ ] Aplicación móvil (React Native)
- [ ] Integración con más APIs externas
- [ ] Sistema de plugins
- [ ] Multi-tenancy

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más información.

## 👥 Equipo

Desarrollado con ❤️ por el equipo de GAMMA Service

## 📞 Soporte

Para soporte técnico o consultas:
- Email: support@gammaservice.com
- Documentación: Ver archivos .md en el proyecto

---

**¡Gracias por usar GAMMA Service ERP!** 🚀