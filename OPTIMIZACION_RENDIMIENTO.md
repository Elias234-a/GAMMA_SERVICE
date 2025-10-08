# Plan de Optimización de Rendimiento - GAMMA Service

## 📊 Análisis Actual del Sistema

### Stack Tecnológico
- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Node.js + Express + MongoDB
- **Base de Datos**: MongoDB (Mongoose)

### Optimizaciones Ya Implementadas ✅
- ✅ Debounce hook para búsquedas
- ✅ Rate limiting (100 req/15 min)
- ✅ Compresión HTTP
- ✅ Algunos índices en MongoDB (identificationNumber, email, VIN, plate)
- ✅ Paginación en endpoints principales
- ✅ Soft deletes para mejorar integridad

---

## 🚀 Optimizaciones Recomendadas (Prioridad)

### 1. BASE DE DATOS - MONGODB (Impacto ALTO)

#### A. Índices Faltantes y Compuestos
**Problema**: Consultas lentas en búsquedas y filtros comunes
**Solución**: Agregar índices estratégicos

```javascript
// En Client.js - Agregar al schema
clientSchema.index({ status: 1, category: 1 });
clientSchema.index({ createdAt: -1 });
clientSchema.index({ 'address.city': 1 });
clientSchema.index({ firstName: 'text', lastName: 'text', email: 'text' }); // Búsqueda de texto

// En Vehicle.js - Agregar al schema
vehicleSchema.index({ status: 1, category: 1, brand: 1 });
vehicleSchema.index({ price: 1 });
vehicleSchema.index({ createdAt: -1 });
vehicleSchema.index({ brand: 'text', model: 'text', description: 'text' }); // Búsqueda de texto

// En Sale.js
saleSchema.index({ saleDate: -1 });
saleSchema.index({ client: 1, saleDate: -1 });
saleSchema.index({ status: 1 });

// En Inventory.js
inventorySchema.index({ status: 1, location: 1 });
inventorySchema.index({ createdAt: -1 });
```

**Impacto**: ⚡ 60-80% más rápido en consultas con filtros

#### B. Proyecciones en Queries
**Problema**: Se traen todos los campos cuando solo se necesitan algunos
**Solución**: Usar `.select()` y `.lean()`

```javascript
// ANTES (❌ LENTO)
const clients = await Client.find(query);

// DESPUÉS (✅ RÁPIDO)
const clients = await Client.find(query)
  .select('firstName lastName email phone status category')
  .lean(); // Devuelve objetos planos JS, no documentos Mongoose (más rápido)
```

**Impacto**: ⚡ 40-60% más rápido + menos uso de memoria

#### C. Agregaciones Optimizadas
**Problema**: Múltiples queries cuando se puede hacer en una sola
**Solución**: Usar `$facet` para estadísticas

```javascript
// En getVehicleStats - Optimizar con facet
const stats = await Vehicle.aggregate([
  { $match: { isDeleted: false } },
  {
    $facet: {
      counts: [
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ],
      totalValue: [
        { $match: { status: 'available' } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ],
      byCategory: [
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ],
      byBrand: [
        { $group: { _id: '$brand', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]
    }
  }
]);
```

**Impacto**: ⚡ Reduce de 5 queries a 1 query

---

### 2. BACKEND - API (Impacto ALTO)

#### A. Implementar Caché con Redis
**Problema**: Consultas repetidas a la DB
**Solución**: Cache para datos que no cambian frecuentemente

```bash
npm install redis ioredis
```

```javascript
// backend/config/redis.js
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true
});

redis.on('error', (err) => console.error('Redis error:', err));

export default redis;

// Middleware de caché
export const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();
    
    const key = `cache:${req.originalUrl}`;
    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // Guardar respuesta original
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        redis.setex(key, duration, JSON.stringify(data));
        return originalJson(data);
      };
      next();
    } catch (err) {
      next();
    }
  };
};
```

**Uso en rutas**:
```javascript
// En routes/vehicles.js
import { cacheMiddleware } from '../config/redis.js';

router.get('/stats', cacheMiddleware(600), getVehicleStats); // Cache 10 min
router.get('/', cacheMiddleware(60), getVehicles); // Cache 1 min
```

**Impacto**: ⚡ 90% más rápido para datos cacheados

#### B. Rate Limiting Mejorado
**Problema**: Rate limit global muy restrictivo
**Solución**: Rate limits por endpoint

```javascript
// En server.js
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Demasiadas peticiones'
});

const relaxedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});

// Aplicar según endpoint
app.use('/api/users/login', strictLimiter);
app.use('/api', relaxedLimiter); // Más permisivo para operaciones normales
```

#### C. Compresión de Respuestas
**Ya implementado** pero verificar configuración:

```javascript
import compression from 'compression';

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  level: 6 // Balance entre velocidad y compresión
}));
```

#### D. Connection Pooling de MongoDB
**Problema**: Conexiones limitadas
**Solución**: Optimizar pool

```javascript
// En config/db.js
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 50, // Aumentar de 5 a 50
  minPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

**Impacto**: ⚡ Maneja más concurrencia

---

### 3. FRONTEND - REACT (Impacto MEDIO-ALTO)

#### A. Code Splitting y Lazy Loading
**Problema**: Bundle inicial muy grande
**Solución**: Cargar módulos bajo demanda

```typescript
// En App.tsx
import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/LoadingSpinner';

// ANTES (❌)
// import VehiclesModule from './components/VehiclesModule';
// import ClientsModule from './components/ClientsModule';

// DESPUÉS (✅)
const VehiclesModule = lazy(() => import('./components/VehiclesModule'));
const ClientsModule = lazy(() => import('./components/ClientsModule'));
const SalesModule = lazy(() => import('./components/SalesModule'));
const InventoryModule = lazy(() => import('./components/InventoryModule'));
const ReportsModule = lazy(() => import('./components/ReportsModule'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/vehicles" element={<VehiclesModule />} />
        <Route path="/clients" element={<ClientsModule />} />
        {/* ... */}
      </Routes>
    </Suspense>
  );
}
```

**Impacto**: ⚡ 50-70% menos tamaño inicial de bundle

#### B. React Query / TanStack Query para Caché
**Problema**: Re-fetch innecesarios de datos
**Solución**: Cache inteligente en cliente

```bash
npm install @tanstack/react-query
```

```typescript
// src/config/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// En main.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>

// Usar en componentes
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['vehicles'],
  queryFn: () => vehicleService.getAll(),
  staleTime: 5 * 60 * 1000
});
```

**Impacto**: ⚡ Elimina requests duplicados + mejor UX

#### C. Virtualización de Listas
**Problema**: Renderizar 1000+ items es lento
**Solución**: Renderizar solo lo visible

```bash
npm install @tanstack/react-virtual
```

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VehicleList({ vehicles }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: vehicles.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // altura estimada de cada row
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <VehicleRow vehicle={vehicles[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Impacto**: ⚡ 10x más rápido con listas grandes (1000+ items)

#### D. Memoización con useMemo y useCallback
**Problema**: Re-renders innecesarios
**Solución**: Memorizar valores y funciones

```typescript
import { useMemo, useCallback } from 'react';

function VehiclesModule() {
  const [filters, setFilters] = useState({});
  
  // Memorizar cálculos costosos
  const filteredVehicles = useMemo(() => 
    vehicles.filter(v => matchFilters(v, filters)),
    [vehicles, filters]
  );
  
  // Memorizar callbacks para evitar re-renders en children
  const handleDelete = useCallback((id: string) => {
    deleteVehicle(id);
  }, []);
  
  return (
    <VehicleList 
      vehicles={filteredVehicles}
      onDelete={handleDelete} 
    />
  );
}

// En el componente hijo
const VehicleList = React.memo(({ vehicles, onDelete }) => {
  // Solo re-renderiza si vehicles u onDelete cambian
});
```

**Impacto**: ⚡ 30-50% menos re-renders

#### E. Optimizar Búsquedas con Debounce
**Ya implementado** pero asegurar uso correcto:

```typescript
import { useDebounce } from '@/hooks/useDebounce';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500); // ✅ Correcto

useEffect(() => {
  if (debouncedSearch) {
    fetchVehicles({ search: debouncedSearch });
  }
}, [debouncedSearch]);
```

---

### 4. ASSETS Y RECURSOS (Impacto MEDIO)

#### A. Optimizar Imágenes
**Problema**: Imágenes pesadas
**Soluciones**:
1. Usar formato WebP
2. Lazy loading de imágenes
3. CDN para assets

```typescript
// Lazy loading nativo
<img 
  src={vehicle.image} 
  loading="lazy" 
  alt={vehicle.brand}
/>

// O con librería
npm install react-lazy-load-image-component

import { LazyLoadImage } from 'react-lazy-load-image-component';

<LazyLoadImage
  src={vehicle.image}
  effect="blur"
  threshold={100}
/>
```

#### B. Tree-shaking y Bundle Analysis

```bash
npm install --save-dev rollup-plugin-visualizer
```

```javascript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'chart-vendor': ['recharts']
        }
      }
    }
  }
};
```

**Impacto**: ⚡ Identifica y elimina código no usado

---

### 5. SERVIDOR Y DEPLOYMENT (Impacto MEDIO)

#### A. PM2 para Node.js (Producción)
**Problema**: Un solo proceso, sin auto-restart
**Solución**: Cluster mode con PM2

```bash
npm install -g pm2
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'gamma-backend',
    script: './server.js',
    instances: 'max', // Un proceso por CPU
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

```bash
pm2 start ecosystem.config.js
pm2 monit
```

**Impacto**: ⚡ 2-4x más throughput

#### B. Nginx como Reverse Proxy
**Problema**: Node.js sirviendo archivos estáticos
**Solución**: Nginx para static files + load balancer

```nginx
# /etc/nginx/sites-available/gamma
server {
    listen 80;
    server_name tudominio.com;
    
    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    # Frontend
    location / {
        root /var/www/gamma/dist;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }
}
```

**Impacto**: ⚡ 40-60% más rápido para archivos estáticos

---

## 📈 Priorización de Implementación

### Fase 1: Quick Wins (1-2 días) ⚡⚡⚡
1. ✅ Agregar índices a MongoDB
2. ✅ Implementar `.lean()` y `.select()` en queries
3. ✅ Code splitting en React (lazy loading)
4. ✅ Optimizar rate limiting

**Impacto estimado**: 40-60% mejora general

### Fase 2: Optimizaciones Medias (3-5 días) ⚡⚡
5. ✅ Implementar React Query
6. ✅ Memoización en componentes críticos
7. ✅ Virtualización de listas grandes
8. ✅ Optimizar agregaciones MongoDB

**Impacto estimado**: 30-40% mejora adicional

### Fase 3: Infraestructura (1 semana) ⚡
9. ✅ Implementar Redis para caché
10. ✅ PM2 en producción
11. ✅ Nginx como reverse proxy
12. ✅ CDN para assets

**Impacto estimado**: 50-80% mejora en carga

---

## 🛠️ Herramientas de Monitoreo

### A. Backend Performance
```bash
npm install clinic
```

```bash
# Analizar rendimiento
clinic doctor -- node server.js
```

### B. MongoDB Profiling
```javascript
// Habilitar profiling temporal
db.setProfilingLevel(2);
db.system.profile.find().limit(10).sort({ ts: -1 }).pretty();
```

### C. Frontend Performance
1. Chrome DevTools > Performance tab
2. Lighthouse audits
3. React DevTools Profiler

---

## 📊 KPIs de Éxito

### Antes vs Después
| Métrica | Antes (estimado) | Objetivo |
|---------|------------------|----------|
| Tiempo carga inicial | 3-5s | < 1.5s |
| Tiempo respuesta API (promedio) | 500-1000ms | < 200ms |
| Queries DB (dashboard) | 15-20 queries | 3-5 queries |
| Bundle size | 2-3 MB | < 500 KB inicial |
| Soporte concurrencia | 50 usuarios | 500+ usuarios |

---

## 🎯 Recomendación Inmediata

**Empezar con estos 3 cambios HOY**:

1. **Agregar índices a MongoDB** (15 minutos)
2. **Implementar lazy loading en React** (30 minutos)
3. **Usar .lean() en todas las queries de listado** (20 minutos)

Estos 3 cambios darán **40-50% de mejora** con mínimo esfuerzo.

---

## 📝 Notas Finales

- Medir SIEMPRE antes y después de cada optimización
- No optimizar prematuramente (perfil primero)
- Caché invalida cuando hay cambios (implementar estrategia)
- Monitorear en producción con herramientas APM (New Relic, DataDog)

¿Quieres que implemente alguna de estas optimizaciones ahora?
