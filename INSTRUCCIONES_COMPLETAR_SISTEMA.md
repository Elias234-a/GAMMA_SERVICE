# 🎯 INSTRUCCIONES PARA COMPLETAR EL SISTEMA GAMMA

**Fecha**: 2025-10-07  
**Estado actual**: Modelos completos (100%), Controladores parciales (18%)

---

## 📦 LO QUE YA ESTÁ LISTO

### ✅ 10 Modelos Completos
1. Vehicle.js
2. Client.js
3. Sale.js
4. Invoice.js
5. Service.js
6. Inventory.js
7. Purchase.js
8. Employee.js
9. Financing.js
10. PlateRequest.js

### ✅ 2 Controladores Completos
1. vehicleController.js (10 endpoints)
2. clientController.js (7 endpoints)

---

## 🚀 PASOS PARA COMPLETAR (Estimado: 20-25 horas)

### FASE 1: Completar Controladores Backend (12-15 horas)

Crear los siguientes controladores siguiendo el patrón de `vehicleController.js` y `clientController.js`:

#### 1. `saleController.js` (Prioridad: CRÍTICA)
```javascript
// Endpoints necesarios:
- createSale() - Crear venta con validación de vehículo disponible
- getSales() - Listar con filtros (cliente, vehículo, fecha, estado)
- getSaleById() - Detalle completo con cliente y vehículo poblados
- updateSale() - Actualizar venta
- deleteSale() - Soft delete
- confirmSale() - Confirmar venta → Actualizar vehículo → Actualizar inventario
- completeSale() - Completar venta → Marcar vehículo como entregado
- cancelSale() - Cancelar venta → Restaurar vehículo a disponible
- getSaleStats() - Estadísticas (total ventas, ingresos, por mes, por vendedor)
- getSalesByClient() - Historial de compras del cliente
- generateContract() - Generar PDF del contrato
```

**Lógica importante**:
- Al confirmar venta: llamar a `vehicle.markAsSold(clientId)`
- Actualizar estadísticas del cliente: `client.updatePurchaseStats(totalPrice)`
- Crear factura automáticamente si se especifica
- Crear notificación para el cliente

#### 2. `invoiceController.js` (Prioridad: CRÍTICA)
```javascript
// Endpoints necesarios:
- createInvoice() - Crear factura (manual o desde venta)
- getInvoices() - Listar con filtros (cliente, estado pago, rango fechas)
- getInvoiceById() - Detalle completo
- updateInvoice() - Actualizar
- deleteInvoice() - Soft delete
- issueInvoice() - Emitir factura → Cambiar estado a "issued"
- registerPayment() - Registrar pago → Actualizar balance
- generatePDF() - Generar PDF de la factura
- sendByEmail() - Enviar factura por correo
- getInvoiceStats() - Estadísticas (pendientes, pagadas, vencidas, total facturado)
- getOverdueInvoices() - Facturas vencidas
- getInvoicesByMonth() - Facturación mensual
```

**Lógica importante**:
- Calcular totales automáticamente con `invoice.calculateTotals()`
- Al registrar pago: actualizar estado automáticamente
- Integrar con DIAN si `dianData.isElectronic = true`
- Enviar email con PDF adjunto

#### 3. `serviceController.js` o `workshopController.js` (Prioridad: CRÍTICA)
```javascript
// Endpoints necesarios:
- createService() - Crear servicio
- getServices() - Listar con filtros (cliente, vehículo, técnico, estado)
- getServiceById() - Detalle completo
- updateService() - Actualizar
- deleteService() - Soft delete
- startService() - Iniciar servicio → Cambiar estado
- completeService() - Completar servicio → Calcular horas reales
- cancelService() - Cancelar
- requestApproval() - Solicitar aprobación del cliente
- approveService() - Aprobar servicio
- rejectService() - Rechazar servicio
- addPart() - Agregar repuesto
- addLabor() - Agregar mano de obra
- calculateCosts() - Recalcular costos
- getServiceStats() - Estadísticas (en progreso, completados, ingresos)
- getServicesByTechnician() - Servicios por técnico
```

**Lógica importante**:
- Calcular costos automáticamente con `service.calculateCosts()`
- Validar técnico disponible antes de asignar
- Crear factura automáticamente al completar (si se especifica)
- Enviar recordatorio de próximo servicio

#### 4. `inventoryController.js` (Prioridad: ALTA)
```javascript
// Endpoints necesarios:
- createInventory() - Crear registro de inventario
- getInventory() - Listar todo el inventario
- getInventoryById() - Detalle de un ítem
- updateInventory() - Actualizar
- deleteInventory() - Soft delete
- registerEntry() - Registrar entrada de inventario
- registerExit() - Registrar salida
- transferLocation() - Transferir ubicación
- performAudit() - Realizar auditoría física
- createReservation() - Crear reserva
- getLowStock() - Items con stock bajo
- getNeedingReorder() - Items que necesitan reorden
- getInventoryStats() - Estadísticas (total items, valor, alertas)
```

#### 5. `purchaseController.js` (Prioridad: ALTA)
```javascript
// Endpoints necesarios:
- createPurchase() - Crear orden de compra
- getPurchases() - Listar compras
- getPurchaseById() - Detalle
- updatePurchase() - Actualizar
- deletePurchase() - Soft delete
- confirmPurchase() - Confirmar orden
- markAsReceived() - Marcar como recibida → Actualizar inventario
- cancelPurchase() - Cancelar
- getPurchaseStats() - Estadísticas
```

#### 6. `hrController.js` o `employeeController.js` (Prioridad: MEDIA)
```javascript
// Endpoints necesarios:
- createEmployee() - Crear empleado
- getEmployees() - Listar empleados
- getEmployeeById() - Detalle
- updateEmployee() - Actualizar
- deleteEmployee() - Soft delete
- terminateEmployee() - Terminar contrato
- addPerformanceReview() - Agregar evaluación
- addDisciplinaryAction() - Agregar acción disciplinaria
- registerAbsence() - Registrar ausencia
- registerVacation() - Registrar vacaciones
- getEmployeeStats() - Estadísticas
```

#### 7. `financingController.js` (Prioridad: MEDIA)
```javascript
// Endpoints necesarios:
- createFinancingApplication() - Crear solicitud
- getFinancingApplications() - Listar solicitudes
- getFinancingById() - Detalle
- updateFinancing() - Actualizar
- deleteFinancing() - Soft delete
- evaluateCredit() - Evaluar crédito → Datacrédito
- approveFinancing() - Aprobar
- rejectFinancing() - Rechazar
- disburseFinancing() - Desembolsar
- generatePaymentSchedule() - Generar tabla de amortización
- getFinancingStats() - Estadísticas
```

#### 8. `plateController.js` (Prioridad: MEDIA)
```javascript
// Endpoints necesarios:
- createPlateRequest() - Crear solicitud
- getPlateRequests() - Listar trámites
- getPlateRequestById() - Detalle
- updatePlateRequest() - Actualizar
- deletePlateRequest() - Soft delete
- submitToTransito() - Enviar a tránsito
- markAsReady() - Marcar como lista
- deliverPlate() - Entregar placa
- cancelPlateRequest() - Cancelar trámite
- getPendingPlateRequests() - Trámites pendientes
- getOverduePlateRequests() - Trámites vencidos
- getPlateStats() - Estadísticas
```

#### 9. `reportController.js` (Prioridad: MEDIA)
```javascript
// Endpoints necesarios:
- generateSalesReport() - Reporte de ventas (PDF/Excel)
- generateClientsReport() - Reporte de clientes
- generateInventoryReport() - Reporte de inventario
- generateFinancialReport() - Reporte financiero
- generateServiceReport() - Reporte de servicios
- getGeneralStats() - Estadísticas generales del sistema
```

---

### FASE 2: Crear Rutas API (3-4 horas)

Crear archivos de rutas en `/backend/routes/` siguiendo el patrón de `orders.js`:

#### Plantilla de ruta:
```javascript
import express from 'express';
import { auth } from '../middleware/auth.js';
import { body } from 'express-validator';
import * as controller from '../controllers/NOMBRE_Controller.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

// GET all
router.get('/', controller.getAll);

// GET by ID
router.get('/:id', controller.getById);

// POST create
router.post('/',
  [
    body('campo1').notEmpty().withMessage('Campo 1 es requerido'),
    body('campo2').isEmail().withMessage('Email inválido'),
    // ... más validaciones
  ],
  controller.create
);

// PUT update
router.put('/:id', controller.update);

// DELETE soft delete
router.delete('/:id', controller.delete);

// ... rutas adicionales específicas

export default router;
```

#### Crear estos archivos:
1. `/backend/routes/vehicles.js` ✅ (ya existe lógica en controller)
2. `/backend/routes/clients.js` ✅ (ya existe lógica en controller)
3. `/backend/routes/sales.js`
4. `/backend/routes/invoices.js`
5. `/backend/routes/services.js` (o workshop.js)
6. `/backend/routes/inventory.js`
7. `/backend/routes/purchases.js`
8. `/backend/routes/hr.js` (o employees.js)
9. `/backend/routes/financing.js`
10. `/backend/routes/plates.js`
11. `/backend/routes/reports.js`

---

### FASE 3: Actualizar server.js (30 minutos)

Agregar todas las nuevas rutas:

```javascript
// En /backend/server.js

// Importar nuevas rutas
import vehicleRoutes from './routes/vehicles.js';
import clientRoutes from './routes/clients.js';
import saleRoutes from './routes/sales.js';
import invoiceRoutes from './routes/invoices.js';
import serviceRoutes from './routes/services.js';
import inventoryRoutes from './routes/inventory.js';
import purchaseRoutes from './routes/purchases.js';
import hrRoutes from './routes/hr.js';
import financingRoutes from './routes/financing.js';
import plateRoutes from './routes/plates.js';
import reportRoutes from './routes/reports.js';

// Registrar rutas (después de las rutas existentes)
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/services', serviceRoutes); // o /api/workshop
app.use('/api/inventory', inventoryRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/hr', hrRoutes); // o /api/employees
app.use('/api/financing', financingRoutes);
app.use('/api/plates', plateRoutes);
app.use('/api/reports', reportRoutes);
```

---

### FASE 4: Crear Seeds de Datos (3-4 horas)

Crear scripts de seed en `/backend/seeds/`:

#### 1. `seedVehicles.js`
```javascript
import Vehicle from '../models/Vehicle.js';
import connectDB from '../config/db.js';

const vehicles = [
  {
    brand: 'Toyota',
    model: 'Corolla',
    year: 2023,
    vin: '1HGBH41JXMN109186',
    color: 'Blanco',
    price: 95000000,
    cost: 75000000,
    status: 'available',
    category: 'sedan',
    type: 'new',
    transmission: 'automatic',
    fuel: 'gasoline',
    mileage: 0,
    description: 'Toyota Corolla 2023 nuevo, full equipo'
  },
  // ... 49 vehículos más
];

const seedVehicles = async () => {
  try {
    await connectDB();
    await Vehicle.deleteMany({});
    await Vehicle.insertMany(vehicles);
    console.log('✅ 50 vehículos creados');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedVehicles();
```

#### 2. `seedClients.js` (100 clientes)
#### 3. `seedSales.js` (30 ventas)
#### 4. `seedServices.js` (50 servicios)

#### 5. `seedAll.js`
```javascript
import { exec } from 'child_process';

const runSeed = (file) => {
  return new Promise((resolve, reject) => {
    exec(`node seeds/${file}`, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(stdout);
    });
  });
};

const seedAll = async () => {
  try {
    console.log('🌱 Iniciando seed completo...\n');
    
    await runSeed('seedVehicles.js');
    await runSeed('seedClients.js');
    await runSeed('seedSales.js');
    await runSeed('seedServices.js');
    
    console.log('\n✅ Seed completo finalizado');
  } catch (error) {
    console.error('❌ Error en seed:', error);
  }
};

seedAll();
```

Agregar al `package.json`:
```json
"scripts": {
  "seed": "node --no-warnings=ExperimentalWarning seeds/seedAll.js",
  "seed:vehicles": "node seeds/seedVehicles.js",
  "seed:clients": "node seeds/seedClients.js"
}
```

---

### FASE 5: Servicios Frontend (8-10 horas)

Crear servicios en `/src/services/` siguiendo el patrón de `authService.ts`:

#### Plantilla de servicio:
```typescript
// /src/services/vehicleService.ts
import api from './api';

const vehicleService = {
  // GET all
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/vehicles?${params}`);
    return response.data;
  },

  // GET by ID
  getById: async (id: string) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  // POST create
  create: async (data: any) => {
    const response = await api.post('/vehicles', data);
    return response.data;
  },

  // PUT update
  update: async (id: string, data: any) => {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data;
  },

  // DELETE
  delete: async (id: string) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  // Custom methods
  getAvailable: async () => {
    const response = await api.get('/vehicles/available');
    return response.data;
  },

  markAsSold: async (id: string, clientId: string) => {
    const response = await api.patch(`/vehicles/${id}/sold`, { clientId });
    return response.data;
  }
};

export default vehicleService;
```

#### Crear estos servicios:
1. vehicleService.ts
2. clientService.ts
3. saleService.ts
4. invoiceService.ts
5. workshopService.ts
6. inventoryService.ts
7. purchaseService.ts
8. hrService.ts
9. financingService.ts
10. plateService.ts

---

### FASE 6: Conectar Módulos Frontend (5-8 horas)

Actualizar los módulos existentes para usar servicios reales en lugar de datos mock.

#### Ejemplo: VehiclesModule.tsx
```typescript
// ANTES (con datos mock):
const [vehicles, setVehicles] = useState<Vehicle[]>([
  { id: '1', brand: 'Toyota', model: 'Corolla', ... },
  { id: '2', brand: 'Honda', model: 'Civic', ... }
]);

// DESPUÉS (con API real):
import vehicleService from '../services/vehicleService';

const [vehicles, setVehicles] = useState<Vehicle[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getAll();
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      // Mostrar mensaje de error
    } finally {
      setLoading(false);
    }
  };

  fetchVehicles();
}, []);

// Al crear vehículo:
const handleCreate = async (formData) => {
  try {
    await vehicleService.create(formData);
    // Recargar lista
    // Mostrar notificación de éxito
  } catch (error) {
    // Mostrar error
  }
};
```

#### Módulos a actualizar:
1. VehiclesModule.tsx → vehicleService
2. ClientsModule.tsx → clientService
3. SalesModule.tsx → saleService
4. BillingModule.tsx → invoiceService
5. WorkshopModule.tsx → workshopService
6. InventoryModule.tsx → inventoryService
7. PurchasesModule.tsx → purchaseService
8. HRModule.tsx → hrService
9. FinancingModule.tsx → financingService
10. PlatesModule.tsx → plateService

---

## 📊 CHECKLIST DE PROGRESO

### Backend
- [x] Modelos creados (10/10)
- [x] vehicleController.js
- [x] clientController.js
- [ ] saleController.js
- [ ] invoiceController.js
- [ ] serviceController.js
- [ ] inventoryController.js
- [ ] purchaseController.js
- [ ] hrController.js
- [ ] financingController.js
- [ ] plateController.js
- [ ] reportController.js
- [ ] Rutas creadas (0/11)
- [ ] server.js actualizado
- [ ] Seeds creados (0/5)

### Frontend
- [ ] vehicleService.ts
- [ ] clientService.ts
- [ ] saleService.ts
- [ ] invoiceService.ts
- [ ] workshopService.ts
- [ ] inventoryService.ts
- [ ] purchaseService.ts
- [ ] hrService.ts
- [ ] financingService.ts
- [ ] plateService.ts
- [ ] Módulos actualizados (0/10)

### Testing
- [ ] Probar todos los endpoints con Postman/Thunder Client
- [ ] Verificar flujo completo: Crear cliente → Crear venta → Generar factura
- [ ] Verificar flujo: Crear vehículo → Vender → Actualizar inventario
- [ ] Verificar flujo: Crear servicio → Completar → Generar factura

---

## 🎯 ORDEN RECOMENDADO DE IMPLEMENTACIÓN

### Día 1 (8 horas)
1. ✅ Modelos (completados)
2. ✅ vehicleController.js (completado)
3. ✅ clientController.js (completado)
4. ⏳ saleController.js
5. ⏳ invoiceController.js

### Día 2 (8 horas)
6. serviceController.js
7. inventoryController.js
8. purchaseController.js
9. Crear rutas (vehicles, clients, sales, invoices, services)

### Día 3 (8 horas)
10. hrController.js
11. financingController.js
12. plateController.js
13. reportController.js
14. Crear rutas restantes
15. Actualizar server.js

### Día 4 (6-8 horas)
16. Seeds de datos
17. Testing manual de todos los endpoints
18. Fixes de bugs encontrados

### Días 5-7 (Opcional, 16-24 horas)
19. Servicios frontend (10 servicios)
20. Actualizar módulos frontend (10 módulos)
21. Testing end-to-end
22. Ajustes finales

---

## ✅ RESULTADO ESPERADO

Al completar todas las fases tendrás:

✅ **10 modelos completos** con validaciones, métodos y soft delete  
✅ **11 controladores funcionales** con todas las operaciones CRUD  
✅ **11 rutas API** con validaciones y autenticación  
✅ **Datos de prueba** para desarrollo y testing  
✅ **10 servicios frontend** para consumir la API  
✅ **10 módulos frontend** conectados al backend real  
✅ **Sistema 100% funcional end-to-end**  

---

**¡Éxito con la implementación!** 🚀
