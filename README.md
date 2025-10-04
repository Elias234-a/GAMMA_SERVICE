
# Sistema de Gestión Vehicular

Un sistema integral de gestión vehicular construido con React, TypeScript y Vite. Diseñado para automatizar y optimizar procesos operativos en empresas del sector automotriz.

## 🚀 Características

- **Gestión Completa de Clientes**: Registro, actualización y seguimiento de clientes
- **Control de Vehículos**: Inventario completo con historial de servicio
- **Sistema de Ventas**: Gestión de cotizaciones, ventas y facturación
- **Taller y Mantenimiento**: Programación de citas y gestión de servicios
- **CRM Integrado**: Gestión de leads y seguimiento de oportunidades
- **Reportes y Analytics**: Dashboards interactivos con métricas clave
- **Integración DIAN**: Facturación electrónica compatible
- **Portal del Cliente**: Acceso self-service para clientes
- **Gestión de Recursos Humanos**: Administración de empleados y roles

## 🛠️ Tecnologías

- **Frontend**: React 18, TypeScript, Vite
- **UI/UX**: Tailwind CSS, shadcn/ui, Radix UI
- **State Management**: React Context + Custom Hooks
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **File Handling**: jsPDF, XLSX, Papa Parse

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd sistema-gestion-vehicular
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Copiar el archivo de ejemplo
   cp .env.development .env.local
   
   # Editar las variables según tu configuración
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_ENABLE_MOCK_DATA=true
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

5. **Construir para producción**
   ```bash
   npm run build
   ```

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes de UI
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── Dashboard.tsx   # Panel principal
│   ├── LoginScreen.tsx # Pantalla de login
│   └── ...modules/     # Módulos específicos
├── context/            # Context providers
│   └── AuthContext.tsx # Autenticación
├── hooks/              # Custom hooks
│   └── useApi.ts       # Hooks para API
├── pages/              # Páginas principales
│   ├── Home.tsx
│   └── About.tsx
├── services/           # Servicios de API
│   ├── api.ts          # Cliente API base
│   └── apiServices.ts  # Servicios específicos
├── types/              # Definiciones TypeScript
│   ├── index.ts        # Tipos generales
│   ├── auth.types.ts   # Tipos de autenticación
│   └── client.types.ts # Tipos de cliente
├── utils/              # Utilidades
│   └── index.ts        # Funciones auxiliares
└── styles/             # Estilos globales
    └── globals.css
```

## 🔑 Credenciales de Prueba

### Modo Desarrollo (Mock Data)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@sistema.com | admin123 |
| Cliente | cliente@sistema.com | cliente123 |

## 🔧 Configuración

### Variables de Entorno

#### Desarrollo (.env.development)
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_ENV=development
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_REAL_TIME=true
VITE_DEFAULT_PAGE_SIZE=20
VITE_API_TIMEOUT=30000
```

#### Producción (.env.production)
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_APP_ENV=production
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_REAL_TIME=true
VITE_ANALYTICS_ID=your-analytics-id
```

### Configuración del Backend

El frontend está preparado para integrarse con cualquier backend REST API. Los endpoints esperados son:

```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
GET    /api/clients
POST   /api/clients
PUT    /api/clients/:id
DELETE /api/clients/:id
GET    /api/vehicles
POST   /api/vehicles
GET    /api/sales
POST   /api/sales
GET    /api/appointments
POST   /api/appointments
... etc
```

## 🚦 API Integration

### Estructura de Respuesta API

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
```

### Ejemplo de Uso

```typescript
// Usando los servicios de API
import { ClientsAPI } from '@/services/apiServices';

const clients = await ClientsAPI.getClients({ page: 1, limit: 20 });

// Usando custom hooks
import { useApi } from '@/hooks/useApi';

function ClientsList() {
  const { data: clients, loading, error } = useApi(
    () => ClientsAPI.getClients()
  );

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {clients?.map(client => (
        <div key={client.id}>{client.name}</div>
      ))}
    </div>
  );
}
```

## 🎨 Personalización de UI

### Temas

El sistema usa Tailwind CSS con variables CSS para temas:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... más variables */
}
```

### Componentes

Los componentes base están en `src/components/ui/` y siguen el patrón de shadcn/ui:

```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function MyComponent() {
  return (
    <Card>
      <Button variant="primary">Click me</Button>
    </Card>
  );
}
```

## 📱 Características Responsivas

- **Mobile First**: Diseño optimizado para dispositivos móviles
- **Breakpoints**: Responsive design con Tailwind CSS
- **Touch Friendly**: Interfaz táctil optimizada
- **Progressive Web App**: Soporte PWA (configurable)

## 🔒 Seguridad

- **Autenticación JWT**: Tokens seguros para autenticación
- **Roles y Permisos**: Sistema granular de permisos
- **Validación de Datos**: Validación en frontend y backend
- **HTTPS Only**: Forzado en producción
- **CSP Headers**: Content Security Policy

## 📊 Módulos Disponibles

### 1. Dashboard
- Métricas en tiempo real
- Gráficos interactivos
- Notificaciones importantes
- Accesos rápidos

### 2. Gestión de Clientes
- Registro de clientes
- Historial de compras
- Seguimiento de interacciones
- Portal de autoservicio

### 3. Inventario de Vehículos
- Catálogo completo
- Estados y disponibilidad
- Historial de mantenimiento
- Documentos asociados

### 4. Sistema de Ventas
- Cotizaciones
- Órdenes de venta
- Facturación
- Seguimiento de pagos

### 5. Taller y Mantenimiento
- Programación de citas
- Órdenes de trabajo
- Control de repuestos
- Historial de servicios

### 6. CRM
- Gestión de leads
- Pipeline de ventas
- Seguimiento de oportunidades
- Comunicación con clientes

### 7. Reportes y Analytics
- Reportes de ventas
- Análisis financiero
- Métricas de servicio
- Exportación de datos

## 🚀 Despliegue

### Construcción

```bash
npm run build
```

### Deploy en Vercel

```bash
npm install -g vercel
vercel --prod
```

### Deploy en Netlify

```bash
npm run build
# Subir la carpeta 'build' a Netlify
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén configurados)
npm test

# Linting
npm run lint

# Verificación de tipos
npx tsc --noEmit
```

## 📈 Performance

- **Code Splitting**: Carga lazy de módulos
- **Tree Shaking**: Eliminación de código no usado
- **Asset Optimization**: Compresión de imágenes y archivos
- **Caching**: Estrategias de cache para producción
- **Bundle Analysis**: Análisis del tamaño del bundle

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está licenciado bajo la MIT License - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte y consultas:

- Email: soporte@sistema-vehicular.com
- Documentación: [docs.sistema-vehicular.com](https://docs.sistema-vehicular.com)
- Issues: [GitHub Issues](https://github.com/tu-usuario/sistema-vehicular/issues)

## 🔮 Roadmap

- [ ] PWA completo con offline support
- [ ] Integración con WhatsApp Business
- [ ] API de geolocalización para rutas
- [ ] Inteligencia artificial para predicciones
- [ ] Integración con sistemas contables
- [ ] App móvil nativa (React Native)
- [ ] Módulo de ecommerce
- [ ] Integración con plataformas de pago

---

⭐ Si este proyecto te ha sido útil, ¡no olvides darle una estrella en GitHub!