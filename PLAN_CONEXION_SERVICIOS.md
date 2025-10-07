# 🔌 PLAN DE CONEXIÓN DE SERVICIOS - SIN MODIFICAR DISEÑO

**Objetivo**: Conectar operaciones CRUD con backend real manteniendo 100% el diseño actual

---

## 📋 MÓDULOS A ACTUALIZAR

### 1. **VehiclesModule.tsx**
**Estado actual**: Props desde App (✅), CRUD local (❌)

**Operaciones a conectar**:
- ✅ Lectura: Ya viene de App.tsx → vehicleService.getAll()
- ❌ Crear: `handleSubmit` → vehicleService.create()
- ❌ Editar: `handleSubmit` → vehicleService.update()
- ❌ Eliminar: `handleDeleteVehicle` → vehicleService.delete()

---

### 2. **ClientsModule.tsx**
**Estado actual**: Props desde App (✅), CRUD local (❌)

**Operaciones a conectar**:
- ✅ Lectura: Ya viene de App.tsx → clientService.getAll()
- ❌ Crear: Conectar con clientService.create()
- ❌ Editar: Conectar con clientService.update()
- ❌ Eliminar: Conectar con clientService.delete()

---

### 3. **SalesModule.tsx**
**Estado actual**: Props desde App (✅), CRUD local (❌)

**Operaciones a conectar**:
- ✅ Lectura: Ya viene de App.tsx → saleService.getAll()
- ❌ Crear: Conectar con saleService.create()
- ❌ Editar: Conectar con saleService.update()
- ❌ Eliminar: Conectar con saleService.delete()
- ❌ Confirmar: Conectar con saleService.confirm()
- ❌ Completar: Conectar con saleService.complete()

---

### 4. **InventoryModule.tsx**
**Estado actual**: Datos mock internos (❌)

**Operaciones a conectar**:
- ❌ Lectura: inventoryService.getAll()
- ❌ Crear: inventoryService.create()
- ❌ Editar: inventoryService.update()
- ❌ Eliminar: inventoryService.delete()
- ❌ Movimientos: inventoryService.createMovement()

---

### 5. **WorkshopModule.tsx**
**Estado actual**: Datos mock internos (❌)

**Operaciones a conectar**:
- ❌ Lectura: workshopService.getAll()
- ❌ Crear orden: workshopService.create()
- ❌ Actualizar estado: workshopService.updateStatus()
- ❌ Asignar técnico: workshopService.assignTechnician()
- ❌ Completar: workshopService.complete()

---

### 6. **BillingModule.tsx**
**Estado actual**: Props desde App (✅), CRUD local (❌)

**Operaciones a conectar**:
- ❌ Crear factura: invoiceService.create()
- ❌ Emitir: invoiceService.issue()
- ❌ Registrar pago: invoiceService.registerPayment()
- ❌ Enviar email: invoiceService.sendEmail()

---

### 7. **PurchasesModule.tsx**
**Estado actual**: Datos mock internos (❌)

**Operaciones a conectar**:
- ❌ Lectura: purchaseService.getAll()
- ❌ Crear: purchaseService.create()
- ❌ Recibir: purchaseService.receive()
- ❌ Stats: purchaseService.getStats()

---

### 8. **HRModule.tsx**
**Estado actual**: Datos mock internos (❌)

**Operaciones a conectar**:
- ❌ Lectura: hrService.getAll()
- ❌ Crear empleado: hrService.create()
- ❌ Actualizar: hrService.update()
- ❌ Terminar contrato: hrService.terminate()
- ❌ Evaluaciones: hrService.addEvaluation()

---

### 9. **FinancingModule.tsx**
**Estado actual**: Datos mock internos (❌)

**Operaciones a conectar**:
- ❌ Lectura: financingService.getAll()
- ❌ Crear solicitud: financingService.create()
- ❌ Evaluar: financingService.evaluate()
- ❌ Aprobar: financingService.approve()
- ❌ Rechazar: financingService.reject()
- ❌ Tabla amortización: financingService.getAmortizationTable()

---

### 10. **PlatesModule.tsx**
**Estado actual**: Datos mock internos (❌)

**Operaciones a conectar**:
- ❌ Lectura: plateService.getAll()
- ❌ Crear solicitud: plateService.create()
- ❌ Actualizar estado: plateService.updateStatus()
- ❌ Subir documentos: plateService.uploadDocument()

---

## 🎯 ESTRATEGIA DE IMPLEMENTACIÓN

### **Patrón a seguir** (sin modificar diseño):

```typescript
// ANTES (solo estado local)
const handleDelete = (id: string) => {
  setData(prev => prev.filter(item => item.id !== id));
  showAlert('success', 'Eliminado', 'Item eliminado');
};

// DESPUÉS (con backend)
const handleDelete = async (id: string) => {
  try {
    await service.delete(id);
    setData(prev => prev.filter(item => item.id !== id));
    showAlert('success', 'Eliminado', 'Item eliminado');
  } catch (error) {
    showAlert('error', 'Error', 'No se pudo eliminar');
  }
};
```

### **Principios**:
1. ✅ Mantener EXACTAMENTE el mismo diseño UI
2. ✅ Mantener los mismos nombres de funciones
3. ✅ Mantener la misma estructura de componentes
4. ✅ Solo agregar llamadas a servicios
5. ✅ Agregar try/catch para manejo de errores
6. ✅ Mantener los mismos mensajes de éxito/error

---

## 📊 PRIORIDADES

### **ALTA** (Módulos que se usan más):
1. VehiclesModule ⭐⭐⭐
2. ClientsModule ⭐⭐⭐
3. SalesModule ⭐⭐⭐
4. InventoryModule ⭐⭐

### **MEDIA**:
5. WorkshopModule ⭐⭐
6. BillingModule ⭐⭐
7. PurchasesModule ⭐

### **BAJA** (pueden esperar):
8. HRModule ⭐
9. FinancingModule ⭐
10. PlatesModule ⭐

---

## ✅ CHECKLIST POR MÓDULO

Para cada módulo:
- [ ] Importar servicio correspondiente
- [ ] Conectar función create
- [ ] Conectar función update
- [ ] Conectar función delete
- [ ] Conectar funciones especiales (si hay)
- [ ] Agregar loading states (opcional)
- [ ] Agregar error handling
- [ ] Probar que funcione
- [ ] Verificar que el diseño NO cambió

---

## 🚀 EJECUCIÓN

Empezaré con los módulos de **ALTA PRIORIDAD** en este orden:
1. VehiclesModule
2. ClientsModule  
3. SalesModule
4. InventoryModule

Luego continuaré con los demás si es necesario.

---

**Tiempo estimado**: 3-4 horas para los 4 módulos prioritarios
