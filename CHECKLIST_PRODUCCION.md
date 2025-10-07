# ✅ CHECKLIST TÉCNICO PARA PRODUCCIÓN
## Sistema GAMMA Service ERP

**Objetivo**: Convertir el sistema de prototipo a producción real

---

## 🗂️ BACKEND - Base de Datos

### Modelos que DEBEN crearse (Priority: CRITICAL)

- [ ] **Vehicle.js**
  ```javascript
  // Campos mínimos:
  - brand, model, year, plate, vin, color
  - price, cost, status (available/sold/reserved)
  - category, type, transmission, fuel
  - mileage, features, images[]
  - createdAt, updatedAt
  ```

- [ ] **Client.js**
  ```javascript
  // Campos mínimos:
  - firstName, lastName, identificationType, identificationNumber
  - email, phone, mobile, address, city
  - dateOfBirth, occupation, income
  - creditScore, status (active/inactive/blocked)
  - createdAt, updatedAt
  ```

- [ ] **Sale.js**
  ```javascript
  // Campos mínimos:
  - saleNumber, client (ref), vehicle (ref)
  - saleDate, totalPrice, discount
  - paymentMethod, paymentStatus
  - downPayment, financingDetails
  - salesperson (ref User), status
  - createdAt, updatedAt
  ```

- [ ] **Invoice.js**
  ```javascript
  // Campos mínimos:
  - invoiceNumber, sale (ref), client (ref)
  - issueDate, dueDate, totalAmount
  - subtotal, taxes[], total
  - paymentStatus, paymentDate
  - dianData (electronic invoice data)
  - createdAt, updatedAt
  ```

- [ ] **Service.js** (Taller/Postventa)
  ```javascript
  // Campos mínimos:
  - serviceNumber, vehicle (ref), client (ref)
  - serviceType, description, status
  - scheduledDate, completedDate
  - technician (ref User), parts[]
  - laborCost, partsCost, totalCost
  - createdAt, updatedAt
  ```

- [ ] **Inventory.js**
  ```javascript
  // Campos mínimos:
  - vehicle (ref), location, quantity
  - minStock, maxStock, reorderPoint
  - lastRestockDate, supplier
  - status (in_stock/low_stock/out_of_stock)
  ```

- [ ] **Purchase.js**
  ```javascript
  // Campos mínimos:
  - purchaseNumber, supplier, vehicle (ref)
  - purchaseDate, quantity, unitPrice, totalPrice
  - status (pending/completed/cancelled)
  - receivedDate, createdBy (ref User)
  ```

- [ ] **Employee.js**
  ```javascript
  // Campos mínimos:
  - user (ref), position, department
  - hireDate, salary, status
  - schedule, performance
  ```

- [ ] **Financing.js**
  ```javascript
  // Campos mínimos:
  - sale (ref), client (ref), vehicle (ref)
  - loanAmount, interestRate, term
  - monthlyPayment, status, approvalDate
  - financialEntity, datacreditoReport
  ```

- [ ] **PlateRequest.js**
  ```javascript
  // Campos mínimos:
  - vehicle (ref), client (ref), requestNumber
  - requestType, status, submittedDate
  - completedDate, transitData
  ```

---

## 🗂️ BACKEND - Controladores y Rutas

### Controladores a crear

- [ ] **vehicleController.js**
  - [ ] `createVehicle()` - POST /api/vehicles
  - [ ] `getAllVehicles()` - GET /api/vehicles (con filtros)
  - [ ] `getVehicleById()` - GET /api/vehicles/:id
  - [ ] `updateVehicle()` - PUT /api/vehicles/:id
  - [ ] `deleteVehicle()` - DELETE /api/vehicles/:id (soft delete)
  - [ ] `getAvailableVehicles()` - GET /api/vehicles/available
  - [ ] `uploadVehicleImages()` - POST /api/vehicles/:id/images
  - [ ] `getVehiclesByCategory()` - GET /api/vehicles/category/:category

- [ ] **clientController.js**
  - [ ] `createClient()` - POST /api/clients
  - [ ] `getAllClients()` - GET /api/clients (paginado)
  - [ ] `getClientById()` - GET /api/clients/:id
  - [ ] `updateClient()` - PUT /api/clients/:id
  - [ ] `deleteClient()` - DELETE /api/clients/:id (soft delete)
  - [ ] `getClientPurchaseHistory()` - GET /api/clients/:id/purchases
  - [ ] `getClientStats()` - GET /api/clients/:id/stats

- [ ] **saleController.js**
  - [ ] `createSale()` - POST /api/sales
  - [ ] `getAllSales()` - GET /api/sales (con filtros por fecha, cliente, etc.)
  - [ ] `getSaleById()` - GET /api/sales/:id
  - [ ] `updateSale()` - PUT /api/sales/:id
  - [ ] `cancelSale()` - DELETE /api/sales/:id
  - [ ] `getSalesByClient()` - GET /api/sales/client/:clientId
  - [ ] `getSalesByDateRange()` - GET /api/sales/date-range
  - [ ] `getSalesStatistics()` - GET /api/sales/statistics

- [ ] **invoiceController.js**
  - [ ] `createInvoice()` - POST /api/invoices
  - [ ] `getAllInvoices()` - GET /api/invoices
  - [ ] `getInvoiceById()` - GET /api/invoices/:id
  - [ ] `updateInvoice()` - PUT /api/invoices/:id
  - [ ] `generateInvoicePDF()` - GET /api/invoices/:id/pdf
  - [ ] `sendInvoiceByEmail()` - POST /api/invoices/:id/send

- [ ] **workshopController.js**
  - [ ] `createService()` - POST /api/workshop/services
  - [ ] `getAllServices()` - GET /api/workshop/services
  - [ ] `getServiceById()` - GET /api/workshop/services/:id
  - [ ] `updateService()` - PUT /api/workshop/services/:id
  - [ ] `assignTechnician()` - POST /api/workshop/services/:id/assign
  - [ ] `completeService()` - POST /api/workshop/services/:id/complete
  - [ ] `getServicesByTechnician()` - GET /api/workshop/technician/:id/services

- [ ] **inventoryController.js**
  - [ ] `addToInventory()` - POST /api/inventory
  - [ ] `getInventory()` - GET /api/inventory
  - [ ] `updateInventory()` - PUT /api/inventory/:id
  - [ ] `getLowStock()` - GET /api/inventory/low-stock
  - [ ] `getInventoryReport()` - GET /api/inventory/report

- [ ] **purchaseController.js**
  - [ ] `createPurchase()` - POST /api/purchases
  - [ ] `getAllPurchases()` - GET /api/purchases
  - [ ] `getPurchaseById()` - GET /api/purchases/:id
  - [ ] `updatePurchase()` - PUT /api/purchases/:id
  - [ ] `receivePurchase()` - POST /api/purchases/:id/receive

- [ ] **hrController.js**
  - [ ] `createEmployee()` - POST /api/hr/employees
  - [ ] `getAllEmployees()` - GET /api/hr/employees
  - [ ] `getEmployeeById()` - GET /api/hr/employees/:id
  - [ ] `updateEmployee()` - PUT /api/hr/employees/:id
  - [ ] `terminateEmployee()` - POST /api/hr/employees/:id/terminate

- [ ] **financingController.js**
  - [ ] `createFinancingRequest()` - POST /api/financing
  - [ ] `evaluateFinancing()` - POST /api/financing/:id/evaluate
  - [ ] `approveFinancing()` - POST /api/financing/:id/approve
  - [ ] `getFinancingById()` - GET /api/financing/:id

- [ ] **plateController.js**
  - [ ] `createPlateRequest()` - POST /api/plates
  - [ ] `getPlateRequests()` - GET /api/plates
  - [ ] `updatePlateRequest()` - PUT /api/plates/:id
  - [ ] `completePlateRequest()` - POST /api/plates/:id/complete

### Rutas a crear
- [ ] `/routes/vehicles.js`
- [ ] `/routes/clients.js`
- [ ] `/routes/sales.js`
- [ ] `/routes/invoices.js`
- [ ] `/routes/workshop.js`
- [ ] `/routes/inventory.js`
- [ ] `/routes/purchases.js`
- [ ] `/routes/hr.js`
- [ ] `/routes/financing.js`
- [ ] `/routes/plates.js`

### Validaciones con express-validator
- [ ] Todas las rutas deben tener validaciones completas
- [ ] Validar tipos de datos
- [ ] Validar campos requeridos
- [ ] Validar rangos (precios > 0, etc.)
- [ ] Validar formatos (email, teléfono, placa)

---

## 🎨 FRONTEND - Servicios

### Servicios a crear en `/src/services/`

- [ ] **vehicleService.ts**
  ```typescript
  - createVehicle()
  - getVehicles()
  - getVehicleById()
  - updateVehicle()
  - deleteVehicle()
  - uploadImages()
  ```

- [ ] **clientService.ts**
  ```typescript
  - createClient()
  - getClients()
  - getClientById()
  - updateClient()
  - deleteClient()
  - getClientHistory()
  ```

- [ ] **saleService.ts**
  ```typescript
  - createSale()
  - getSales()
  - getSaleById()
  - updateSale()
  - cancelSale()
  - getSalesStatistics()
  ```

- [ ] **invoiceService.ts**
  ```typescript
  - createInvoice()
  - getInvoices()
  - getInvoiceById()
  - downloadInvoicePDF()
  - sendInvoiceEmail()
  ```

- [ ] **workshopService.ts**
  ```typescript
  - createService()
  - getServices()
  - updateService()
  - assignTechnician()
  - completeService()
  ```

- [ ] **inventoryService.ts**
- [ ] **purchaseService.ts**
- [ ] **hrService.ts**
- [ ] **financingService.ts**
- [ ] **plateService.ts**

### Conectar módulos con servicios reales
- [ ] Actualizar `VehiclesModule.tsx` para usar `vehicleService`
- [ ] Actualizar `ClientsModule.tsx` para usar `clientService`
- [ ] Actualizar `SalesModule.tsx` para usar `saleService`
- [ ] Actualizar `BillingModule.tsx` para usar `invoiceService`
- [ ] Actualizar `WorkshopModule.tsx` para usar `workshopService`
- [ ] Actualizar `InventoryModule.tsx` para usar `inventoryService`
- [ ] Actualizar `PurchasesModule.tsx` para usar `purchaseService`
- [ ] Actualizar `HRModule.tsx` para usar `hrService`
- [ ] Actualizar `FinancingModule.tsx` para usar `financingService`
- [ ] Actualizar `PlatesModule.tsx` para usar `plateService`

### Remover datos mock
- [ ] Eliminar arrays de datos hardcodeados en componentes
- [ ] Reemplazar con llamadas a API
- [ ] Implementar loading states
- [ ] Implementar error handling

---

## 🔐 SEGURIDAD

### Autenticación y Autorización
- [ ] Implementar refresh tokens
- [ ] Implementar 2FA (autenticación de dos factores)
- [ ] Verificación de email con token
- [ ] Recuperación de contraseña funcional
- [ ] Bloqueo de cuenta tras intentos fallidos
- [ ] Política de contraseñas robusta (min 8 chars, mayúsculas, números, símbolos)
- [ ] Rotación de tokens JWT cada X días
- [ ] Logout en todos los dispositivos

### Permisos por rol
- [ ] Verificar permisos en cada endpoint
- [ ] Middleware de autorización por módulo
- [ ] Logs de acceso y auditoría
- [ ] Prevenir escalada de privilegios

### Datos sensibles
- [ ] Encriptar datos sensibles en BD (salarios, números de tarjeta)
- [ ] Variables de entorno seguras (no hardcodear)
- [ ] HTTPS en producción (SSL/TLS)
- [ ] Certificados SSL válidos

### Validaciones
- [ ] Validar TODOS los inputs (frontend y backend)
- [ ] Sanitización de datos (prevenir XSS, SQL injection)
- [ ] Rate limiting por usuario y IP
- [ ] Protección CSRF
- [ ] Content Security Policy (CSP)

---

## 📧 SISTEMA DE EMAILS

### Plantillas a crear en `/backend/templates/emails/`

- [ ] **welcome.ejs**
  ```html
  - Mensaje de bienvenida
  - Link de verificación de email
  - Información de la cuenta
  ```

- [ ] **password-reset.ejs**
  ```html
  - Link para resetear contraseña
  - Tiempo de expiración del token
  - Soporte de contacto
  ```

- [ ] **order-confirmation.ejs**
  ```html
  - Detalles de la orden
  - Información del cliente
  - Estado y tracking
  ```

- [ ] **invoice.ejs**
  ```html
  - Factura detallada
  - Información fiscal
  - Métodos de pago
  ```

- [ ] **service-reminder.ejs**
  ```html
  - Recordatorio de servicio
  - Información del vehículo
  - Link para agendar
  ```

- [ ] **sale-confirmation.ejs**
  ```html
  - Confirmación de compra
  - Detalles del vehículo
  - Próximos pasos
  ```

### Configuración SMTP
- [ ] Configurar cuenta de email profesional (no Gmail personal)
- [ ] Usar SendGrid o Amazon SES para producción
- [ ] Configurar SPF y DKIM para evitar spam
- [ ] Límite de envíos por hora
- [ ] Cola de emails con Bull/Redis

---

## 📊 BASE DE DATOS

### Índices de MongoDB
- [ ] Crear índices en campos de búsqueda frecuente
  ```javascript
  // Ejemplos:
  Vehicle: { plate: 1, vin: 1, status: 1 }
  Client: { email: 1, identificationNumber: 1 }
  Sale: { saleDate: -1, client: 1, status: 1 }
  ```

### Seeds de datos
- [ ] Crear `/backend/seeds/seedVehicles.js`
- [ ] Crear `/backend/seeds/seedClients.js`
- [ ] Crear `/backend/seeds/seedSales.js`
- [ ] Crear `/backend/seeds/seedAll.js` (ejecutar todos)
- [ ] Script: `npm run seed:all`

### Backup
- [ ] Configurar backup automático diario
- [ ] Almacenar backups en S3 o similar
- [ ] Retention policy (30 días)
- [ ] Script de restauración
- [ ] Probar restore al menos 1 vez

### Migraciones
- [ ] Crear sistema de migraciones (migrate-mongo)
- [ ] Documentar cambios de esquema
- [ ] Versionado de base de datos

---

## 🧪 TESTING

### Backend - Tests Unitarios (Jest)
- [ ] Tests para modelos
  - [ ] Validaciones de esquema
  - [ ] Métodos de instancia
  - [ ] Hooks (pre/post save)

- [ ] Tests para controladores
  - [ ] Cada función del controlador
  - [ ] Casos de éxito
  - [ ] Casos de error
  - [ ] Validaciones

- [ ] Tests para middleware
  - [ ] Autenticación
  - [ ] Autorización
  - [ ] Error handling

- [ ] Coverage mínimo: 80%

### Backend - Tests de Integración (Supertest)
- [ ] Tests de rutas completas
- [ ] Tests de flujos (crear venta completa)
- [ ] Tests de autenticación
- [ ] Tests de permisos

### Frontend - Tests Unitarios (Vitest + React Testing Library)
- [ ] Tests de componentes
- [ ] Tests de hooks
- [ ] Tests de servicios
- [ ] Tests de utilidades

### E2E Tests (Playwright)
- [ ] Login flow
- [ ] Crear venta completa
- [ ] Crear cliente
- [ ] Agregar vehículo
- [ ] Generar factura
- [ ] Generar reporte

### CI/CD
- [ ] Configurar GitHub Actions / GitLab CI
- [ ] Ejecutar tests en cada PR
- [ ] Bloquear merge si tests fallan
- [ ] Code coverage reports

---

## 🔌 INTEGRACIONES EXTERNAS

### DIAN (Facturación Electrónica) - Colombia
- [ ] Registrarse en DIAN como facturador electrónico
- [ ] Obtener credenciales de producción
- [ ] Implementar firma digital de facturas
- [ ] Implementar envío a DIAN
- [ ] Validar respuesta de DIAN
- [ ] Almacenar facturas electrónicas (PDF + XML)
- [ ] Manejar rechazos y correcciones

### Datacrédito (Consulta Crediticia)
- [ ] Contratar servicio de Datacrédito
- [ ] Obtener API key
- [ ] Implementar consulta de reporte
- [ ] Parsear respuesta
- [ ] Calcular score crediticio
- [ ] Almacenar historial de consultas

### Tránsito (RUNT)
- [ ] Integración con RUNT (si disponible)
- [ ] Consulta de vehículos por placa
- [ ] Consulta de propietarios
- [ ] Trámites de traspaso
- [ ] (Alternativa: proceso manual documentado)

### Pasarela de Pagos
- [ ] Seleccionar pasarela (PSE, Wompi, Mercado Pago, Stripe)
- [ ] Obtener credenciales de producción
- [ ] Implementar flujo de pago
- [ ] Webhooks de confirmación
- [ ] Manejo de pagos fallidos
- [ ] Conciliación bancaria

### Mensajería (Opcional)
- [ ] Twilio para SMS
- [ ] WhatsApp Business API
- [ ] Notificaciones push

---

## 🚀 DEVOPS Y DESPLIEGUE

### Containerización
- [ ] Crear `Dockerfile` para backend
- [ ] Crear `Dockerfile` para frontend
- [ ] Crear `docker-compose.yml` para desarrollo
- [ ] Crear `docker-compose.prod.yml` para producción
- [ ] Probar build y deploy local

### Variables de Entorno
- [ ] Separar configuración por ambiente (dev/staging/prod)
- [ ] Usar .env.example como plantilla
- [ ] NO commitear .env a Git
- [ ] Usar secretos en CI/CD

### Hosting
- [ ] Seleccionar proveedor (AWS, Azure, DigitalOcean, Heroku, Vercel)
- [ ] Configurar servidor de producción
- [ ] Configurar MongoDB Atlas o servidor propio
- [ ] Configurar HTTPS con Let's Encrypt
- [ ] Configurar dominio (DNS)

### CI/CD
- [ ] Pipeline de build
- [ ] Pipeline de tests
- [ ] Pipeline de deploy a staging
- [ ] Pipeline de deploy a producción (manual approval)
- [ ] Rollback automático si falla

### Monitoreo
- [ ] Configurar logs centralizados (ELK, Datadog, Loggly)
- [ ] Monitoreo de uptime (UptimeRobot, Pingdom)
- [ ] Monitoreo de performance (New Relic, Datadog)
- [ ] Alertas por Slack/Email
- [ ] Dashboard de métricas (Grafana)

### Escalabilidad
- [ ] Load balancer (Nginx, AWS ELB)
- [ ] Redis para sesiones y caché
- [ ] CDN para assets estáticos (Cloudflare, AWS CloudFront)
- [ ] Kubernetes (opcional, si se espera mucho tráfico)

---

## 📈 PERFORMANCE

### Backend
- [ ] Implementar paginación en TODAS las listas
- [ ] Limitar tamaño de respuestas
- [ ] Índices de MongoDB optimizados
- [ ] Caché con Redis (datos frecuentes)
- [ ] Compresión gzip en respuestas
- [ ] Pool de conexiones a BD

### Frontend
- [ ] Lazy loading de componentes
- [ ] Code splitting por ruta
- [ ] Optimización de imágenes
- [ ] Service Workers (PWA)
- [ ] Minificación y uglificación
- [ ] Tree shaking
- [ ] Preload de recursos críticos

---

## 📋 DOCUMENTACIÓN

### API
- [ ] Actualizar Swagger con TODOS los endpoints
- [ ] Documentar request/response examples
- [ ] Documentar códigos de error
- [ ] Crear Postman collection
- [ ] README de API

### Código
- [ ] Comentarios JSDoc en funciones críticas
- [ ] README actualizado
- [ ] CONTRIBUTING.md
- [ ] CODE_OF_CONDUCT.md
- [ ] Changelog actualizado

### Usuario
- [ ] Manual de usuario (PDF)
- [ ] Videos tutoriales (opcional)
- [ ] FAQ
- [ ] Troubleshooting guide

---

## ✅ CRITERIOS DE ACEPTACIÓN PARA PRODUCCIÓN

### Funcionalidad
- [ ] Todas las funcionalidades principales funcionan end-to-end
- [ ] Se pueden crear, leer, actualizar y eliminar registros en TODAS las entidades
- [ ] Los reportes se generan correctamente
- [ ] Las notificaciones se envían correctamente
- [ ] Los emails se envían correctamente

### Calidad
- [ ] Tests coverage > 80%
- [ ] Todos los tests pasan
- [ ] No hay errores en consola
- [ ] No hay warnings críticos
- [ ] Code review aprobado

### Seguridad
- [ ] Auditoría de seguridad completada
- [ ] No hay vulnerabilidades críticas
- [ ] HTTPS configurado
- [ ] Tokens y secretos seguros
- [ ] Permisos correctamente implementados

### Performance
- [ ] Tiempo de carga < 3 segundos
- [ ] API responde en < 500ms (promedio)
- [ ] Sin memory leaks
- [ ] Prueba de carga exitosa (100 usuarios concurrentes)

### DevOps
- [ ] CI/CD configurado y funcionando
- [ ] Backups automáticos activos
- [ ] Monitoreo activo
- [ ] Logs centralizados
- [ ] Plan de disaster recovery documentado

### Legal
- [ ] Términos y condiciones
- [ ] Política de privacidad
- [ ] RGPD/GDPR compliance (si aplica)
- [ ] Aviso de cookies

---

## 🎯 MVP MÍNIMO (Lanzamiento Rápido en 3-4 semanas)

Si necesitas lanzar RÁPIDO, implementa solo:

### Semana 1-2:
- [x] Modelos: Vehicle, Client, Sale
- [x] Controladores: vehicle, client, sale
- [x] Servicios frontend: vehicleService, clientService, saleService
- [x] Conectar módulos principales

### Semana 3:
- [x] Tests básicos (coverage 50%)
- [x] Seeds de datos
- [x] Validaciones de negocio críticas
- [x] Plantillas de email

### Semana 4:
- [x] Deploy a staging
- [x] Tests de usuario
- [x] Fixes de bugs
- [x] Deploy a producción (sin integraciones DIAN/pagos)

**Resultado**: Sistema funcional básico que puede usarse para operaciones reales (sin facturación electrónica ni pagos online).

---

**Última actualización**: 2025-10-07  
**Mantenedor**: Equipo GAMMA Service  
**Prioridad**: 🔴 CRÍTICO para producción
