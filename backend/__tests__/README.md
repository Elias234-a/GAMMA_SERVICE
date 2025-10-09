# 🧪 Tests Backend - GAMMA Service ERP

## 📋 Descripción

Suite completa de tests automatizados para el backend, incluyendo:
- **Tests de Modelos**: Validación de esquemas y lógica de negocio
- **Tests de Integración**: Endpoints API completos
- **Coverage**: >70% de cobertura de código

## 🚀 Comandos Disponibles

### Ejecutar todos los tests
```bash
npm test
```

### Tests con watch mode (desarrollo)
```bash
npm run test:watch
```

### Tests con cobertura
```bash
npm run test:coverage
```

### Solo tests de modelos
```bash
npm run test:models
```

### Solo tests de integración
```bash
npm run test:integration
```

### Tests para CI/CD
```bash
npm run test:ci
```

## 📁 Estructura

```
__tests__/
├── setup.js                    # Configuración global de tests
├── models/                     # Tests de modelos Mongoose
│   ├── Vehicle.test.js
│   ├── Client.test.js
│   └── Sale.test.js
└── integration/                # Tests de API endpoints
    ├── vehicles.test.js
    ├── clients.test.js
    └── auth.test.js
```

## ⚙️ Configuración

Los tests usan **MongoDB Memory Server** para crear una base de datos temporal en memoria. Esto significa:
- ✅ No afecta tu base de datos real
- ✅ Tests rápidos y aislados
- ✅ No requiere MongoDB corriendo localmente

### Variables de Entorno

Los tests usan estas variables (definidas en `setup.js`):
```javascript
NODE_ENV=test
JWT_SECRET=test_jwt_secret_key_for_testing_only
JWT_EXPIRES_IN=1h
```

## 📊 Interpretando Resultados

### Test exitoso ✅
```
PASS  __tests__/models/Vehicle.test.js
  ✓ Debe crear un vehículo con datos válidos (45ms)
  ✓ Debe rechazar VIN duplicado (23ms)
```

### Test fallido ❌
```
FAIL  __tests__/models/Vehicle.test.js
  ✕ Debe crear un vehículo con datos válidos (52ms)
  
  Error: Expected "Toyota" but received "Honda"
```

### Reporte de Coverage
```
-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------|---------|----------|---------|---------|-------------------
All files        |   85.71 |    78.26 |   88.89 |   85.71 |                   
 controllers     |   90.48 |    85.00 |   94.74 |   90.48 |                   
  vehicleCtrl.js |   92.31 |    87.50 |   95.00 |   92.31 | 45,67             
 models          |   95.00 |    90.00 |   100   |   95.00 |                   
  Vehicle.js     |   95.00 |    90.00 |   100   |   95.00 | 89                
-----------------|---------|----------|---------|---------|-------------------
```

## 📝 Escribiendo Nuevos Tests

### Test de Modelo
```javascript
import Vehicle from '../../models/Vehicle.js';

describe('Vehicle Model', () => {
  test('Debe crear un vehículo válido', async () => {
    const vehicle = new Vehicle({
      brand: 'Toyota',
      model: 'Corolla',
      year: 2023,
      vin: '1HGBH41JXMN109186',
      // ... más campos
    });
    
    const saved = await vehicle.save();
    expect(saved._id).toBeDefined();
    expect(saved.brand).toBe('Toyota');
  });
});
```

### Test de API
```javascript
import request from 'supertest';
import app from '../../server.js';

describe('Vehicle API', () => {
  test('GET /api/vehicles debe retornar lista', async () => {
    const response = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

## 🐛 Debugging Tests

### Ver logs detallados
```bash
npm test -- --verbose
```

### Ejecutar un solo test
```bash
npm test -- --testNamePattern="Debe crear un vehículo"
```

### Ejecutar un solo archivo
```bash
npm test __tests__/models/Vehicle.test.js
```

### Ver solo tests fallidos
```bash
npm test -- --onlyFailures
```

## 🔧 Troubleshooting

### Error: "Cannot find module"
**Solución**: Instalar dependencias
```bash
npm install
```

### Error: "MongoDB Memory Server failed to start"
**Solución**: Limpiar cache
```bash
rm -rf node_modules/.cache/mongodb-memory-server
npm test
```

### Tests muy lentos
**Solución**: Los primeros tests son lentos porque MongoDB Memory Server descarga binarios. Ejecuciones posteriores serán rápidas.

### Error: "Port already in use"
**Solución**: Los tests usan `--runInBand` para evitar conflictos. Si persiste:
```bash
# Matar procesos en puerto 8001
npx kill-port 8001
```

## 📈 Mejores Prácticas

### ✅ DO
- Usar nombres descriptivos: `"Debe rechazar email inválido"`
- Limpiar datos después de cada test
- Usar beforeEach/afterEach para setup
- Probar casos edge (límites, errores, etc.)
- Mantener tests independientes

### ❌ DON'T
- No hacer tests que dependan de otros
- No usar setTimeout (usar async/await)
- No hardcodear IDs de MongoDB
- No saltarse tests con `.skip` permanentemente
- No hacer tests muy largos (>50 líneas)

## 🎯 Objetivo de Coverage

Para producción, mantener:
- **Statements**: >70%
- **Branches**: >70%
- **Functions**: >70%
- **Lines**: >70%

Verificar con:
```bash
npm run test:coverage
```

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)

## 🚦 CI/CD

Los tests se ejecutan automáticamente en cada push/PR mediante GitHub Actions:

```yaml
# En .github/workflows/ci.yml
- name: Run Tests
  run: npm run test:ci
```

## ✅ Checklist Pre-Production

Antes de deploy a producción:
- [ ] Todos los tests pasan
- [ ] Coverage >70% en todas las categorías
- [ ] No hay tests marcados como `.skip`
- [ ] Tests de integración funcionan
- [ ] Tests ejecutan en <2 minutos
- [ ] CI/CD pipeline pasa

---

**¡Importante!**: Ejecuta `npm run test:coverage` antes de cada commit para asegurar calidad del código.
