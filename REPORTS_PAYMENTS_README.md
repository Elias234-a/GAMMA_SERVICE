# 📊💳 Sistema de Reportes y Pagos - GAMMA Service ERP

## 📋 Descripción

Sistemas completos de generación de reportes (PDF/Excel) y procesamiento de pagos con múltiples pasarelas.

---

## 🎯 PARTE 1: SISTEMA DE REPORTES

### Características Implementadas

#### 1. Generación de PDFs Profesionales ✅
- Reportes de ventas
- Reportes de inventario
- Reportes financieros
- Facturas personalizadas
- Headers y footers automáticos
- Tablas con formato
- Gráficos de texto
- Paginación automática

#### 2. Generación de Excel ✅
- Reportes con formato profesional
- Múltiples hojas (sheets)
- Auto-filtros
- Formato condicional
- Fórmulas y totales
- Estilos personalizados
- Gráficos de datos

#### 3. Dashboard de Datos ✅
- KPIs en tiempo real
- Tendencias de ventas
- Top vehículos vendidos
- Estadísticas de período

---

## 📊 ENDPOINTS DE REPORTES

### Dashboard
```bash
GET /api/reports/dashboard?period=30

Response:
{
  "success": true,
  "data": {
    "summary": {
      "totalSales": 15000000,
      "salesCount": 25,
      "averageTicket": 600000,
      "availableVehicles": 45,
      "totalClients": 150
    },
    "salesTrend": [...],
    "topVehicles": [...]
  }
}
```

### Reporte de Ventas
```bash
# PDF
GET /api/reports/sales?format=pdf&startDate=2025-01-01&endDate=2025-01-31

# Excel
GET /api/reports/sales?format=excel&startDate=2025-01-01&endDate=2025-01-31
```

### Reporte de Inventario
```bash
GET /api/reports/inventory?format=pdf&status=Disponible
GET /api/reports/inventory?format=excel
```

### Reporte de Clientes
```bash
GET /api/reports/clients?format=excel
```

### Reporte Financiero
```bash
GET /api/reports/financial?format=excel&startDate=2025-01-01&endDate=2025-12-31
```

### Generar Factura
```bash
POST /api/reports/invoice
{
  "saleId": "64abc123..."
}
```

---

## 📝 Ejemplo de Uso - Reportes

### Desde Frontend
```javascript
// Descargar reporte de ventas en PDF
const downloadSalesReport = async () => {
  const response = await fetch(
    '/api/reports/sales?format=pdf&startDate=2025-01-01&endDate=2025-01-31',
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'reporte_ventas.pdf';
  a.click();
};

// Obtener datos para dashboard
const getDashboard = async () => {
  const response = await fetch('/api/reports/dashboard?period=30', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log(data.data.summary);
};
```

---

## 🎯 PARTE 2: SISTEMA DE PAGOS

### Pasarelas Integradas

#### 1. Stripe (Internacional) ✅
- Pagos con tarjeta
- Payment Intents
- Webhooks
- Reembolsos automáticos

#### 2. MercadoPago (Latam) ✅
- Preferencias de pago
- Múltiples métodos
- Webhooks
- Notificaciones

#### 3. PSE (Colombia) ✅
- Pagos bancarios
- Transferencias en línea
- Confirmación automática

#### 4. Wompi (Colombia) ✅
- Pagos con tarjeta
- PSE integrado
- Webhooks
- Cuotas

#### 5. Métodos Tradicionales ✅
- Efectivo
- Transferencia bancaria
- Confirmación manual

---

## 💳 ENDPOINTS DE PAGOS

### Crear Pago
```bash
POST /api/payments/create
{
  "saleId": "64abc123...",
  "paymentMethod": "stripe",
  "amount": 50000000,
  "currency": "cop"
}

Response:
{
  "success": true,
  "data": {
    "payment": {...},
    "clientSecret": "pi_xxx" // Para Stripe
  }
}
```

### Métodos de Pago Soportados
- `stripe` - Stripe (tarjetas internacionales)
- `mercadopago` - MercadoPago
- `pse` - PSE Colombia
- `wompi` - Wompi Colombia
- `cash` - Efectivo
- `transfer` - Transferencia bancaria

### Obtener Pagos
```bash
GET /api/payments?page=1&limit=10&status=completed&paymentMethod=stripe
```

### Obtener Pago Específico
```bash
GET /api/payments/64abc123...
```

### Confirmar Pago Manual
```bash
POST /api/payments/64abc123.../confirm
```

### Procesar Reembolso
```bash
POST /api/payments/64abc123.../refund
{
  "amount": 50000000,
  "reason": "Cliente solicitó cancelación"
}
```

### Pagos de un Cliente
```bash
GET /api/payments/client/64def456...?page=1&limit=10
```

### Estadísticas de Pagos
```bash
GET /api/payments/stats?startDate=2025-01-01&endDate=2025-12-31
```

---

## 💻 Ejemplo de Uso - Pagos

### Pago con Stripe
```javascript
// 1. Crear payment intent
const createPayment = async (saleId, amount) => {
  const response = await fetch('/api/payments/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      saleId,
      paymentMethod: 'stripe',
      amount,
      currency: 'usd'
    })
  });
  
  const data = await response.json();
  return data.data.clientSecret;
};

// 2. Confirmar con Stripe Elements (frontend)
const stripe = Stripe('pk_xxx');
const elements = stripe.elements();
const cardElement = elements.create('card');

const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement
  }
});

if (!error) {
  console.log('Pago exitoso!');
}
```

### Pago con MercadoPago
```javascript
const createMercadoPagoPayment = async (saleId, amount) => {
  const response = await fetch('/api/payments/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      saleId,
      paymentMethod: 'mercadopago',
      amount
    })
  });
  
  const data = await response.json();
  // Redirigir al checkout de MercadoPago
  window.location.href = data.data.initPoint;
};
```

### Pago en Efectivo
```javascript
const createCashPayment = async (saleId, amount) => {
  const response = await fetch('/api/payments/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      saleId,
      paymentMethod: 'cash',
      amount
    })
  });
  
  const data = await response.json();
  console.log('Pago en efectivo registrado', data.data.payment);
};
```

---

## ⚙️ CONFIGURACIÓN

### Variables de Entorno

Agregar a `.env`:

```bash
# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8001

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=TEST-xxx
MERCADOPAGO_PUBLIC_KEY=TEST-xxx

# Wompi
WOMPI_PUBLIC_KEY=pub_test_xxx
WOMPI_PRIVATE_KEY=prv_test_xxx
WOMPI_EVENT_SECRET=xxx

# PSE
PSE_API_KEY=xxx
PSE_SECRET_KEY=xxx
```

### Instalar Dependencias

```bash
cd backend
npm install pdfkit exceljs stripe
```

---

## 🔧 WEBHOOKS

### Configurar Webhooks en las Pasarelas

#### Stripe
1. Ve a Dashboard → Developers → Webhooks
2. Agrega endpoint: `https://tu-dominio.com/api/payments/webhooks/stripe`
3. Selecciona eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copia el webhook secret a `STRIPE_WEBHOOK_SECRET`

#### MercadoPago
1. Ve a Tu integración → Webhooks
2. Agrega URL: `https://tu-dominio.com/api/payments/webhooks/mercadopago`
3. Eventos: payment

#### Wompi
1. Configuración → Webhooks
2. URL: `https://tu-dominio.com/api/payments/webhooks/wompi`
3. Eventos: transaction.updated

---

## 📊 MODELO DE DATOS - Payment

```javascript
{
  sale: ObjectId,
  client: ObjectId,
  amount: Number,
  currency: String, // 'COP', 'USD', 'EUR', 'MXN'
  paymentMethod: String, // 'stripe', 'mercadopago', 'pse', 'wompi', 'cash', 'transfer'
  status: String, // 'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
  externalId: String, // ID de la pasarela
  cardLast4: String,
  cardBrand: String,
  fee: Number,
  netAmount: Number,
  installments: Number,
  processedAt: Date,
  completedAt: Date,
  refundedAt: Date,
  refundAmount: Number,
  refundReason: String,
  failureReason: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 💰 COSTOS DE PASARELAS

### Stripe
- **Internacional**: 2.9% + $0.30 USD por transacción
- **Latam**: 3.6% + $0.30 USD
- **Sin mensualidad**

### MercadoPago
- **México**: 3.99% + $3 MXN
- **Colombia**: 3.99% + $900 COP
- **Sin mensualidad**

### Wompi (Colombia)
- **Tarjetas**: 3.49% + $700 COP
- **PSE**: 2.99% + $500 COP
- **Sin mensualidad**

### PSE Directo
- **Transacción**: $1,500 - $3,000 COP
- **Depende del banco**

---

## 🧪 TESTING

### Tarjetas de Prueba

#### Stripe
```
Éxito: 4242 4242 4242 4242
Fallo: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
CVV: cualquier 3 dígitos
Fecha: cualquier fecha futura
```

#### MercadoPago
```
Éxito: 5031 7557 3453 0604
Rechazada: 5031 4332 1540 6351
CVV: 123
Fecha: 11/25
```

### Test de Webhooks Localmente

```bash
# Usar ngrok para exponer localhost
npx ngrok http 8001

# Configurar webhook URL:
# https://xxxx.ngrok.io/api/payments/webhooks/stripe
```

---

## 📈 ESTADÍSTICAS Y REPORTES DE PAGOS

### Obtener Estadísticas
```javascript
const stats = await fetch('/api/payments/stats?startDate=2025-01-01&endDate=2025-12-31');

// Response
{
  "summary": {
    "totalPayments": 150,
    "completedPayments": 145,
    "completionRate": "96.67",
    "totalAmount": 750000000,
    "totalFees": 22500000,
    "netAmount": 727500000
  },
  "byMethod": [
    {
      "_id": "stripe",
      "totalAmount": 300000000,
      "totalFees": 10800000,
      "count": 50,
      "avgAmount": 6000000
    },
    {
      "_id": "cash",
      "totalAmount": 250000000,
      "totalFees": 0,
      "count": 60,
      "avgAmount": 4166667
    }
  ]
}
```

---

## 🔐 SEGURIDAD

### Best Practices Implementadas

✅ **Webhooks validados** con signatures
✅ **Rate limiting** en endpoints de pago
✅ **Audit logging** de todas las transacciones
✅ **Encriptación** de datos sensibles
✅ **No almacenamos** números de tarjeta completos
✅ **PCI compliance** usando Stripe/MercadoPago
✅ **Validación** de montos y monedas
✅ **Idempotencia** en creación de pagos

---

## 🐛 TROUBLESHOOTING

### Webhooks no llegan

**Problema**: Los webhooks de Stripe/MercadoPago no se procesan

**Solución**:
```bash
# 1. Verificar URL configurada
# 2. Verificar que el endpoint sea accesible públicamente
# 3. Revisar logs del webhook en el dashboard de la pasarela
# 4. Verificar signature validation
```

### Pagos quedan en pending

**Problema**: Pagos no se completan automáticamente

**Solución**:
```javascript
// Confirmar manualmente desde admin
POST /api/payments/{id}/confirm

// O investigar en logs
grep "payment.*{id}" backend/logs/combined-*.log
```

### Reembolsos fallan

**Problema**: No se puede procesar reembolso

**Solución**:
```javascript
// Verificar que el pago esté completed
// Verificar que el monto no exceda el original
// Verificar credenciales de la pasarela
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Reportes
- [x] PDF Generator implementado
- [x] Excel Generator implementado
- [x] Controller de reportes creado
- [x] Rutas configuradas
- [x] Dashboard endpoint
- [ ] Probar generación de PDFs
- [ ] Probar generación de Excel
- [ ] Probar dashboard

### Pagos
- [x] Modelo Payment creado
- [x] PaymentService implementado
- [x] Controller de pagos creado
- [x] Rutas configuradas
- [x] Webhooks endpoints
- [ ] Configurar credenciales de pasarelas
- [ ] Probar Stripe
- [ ] Probar MercadoPago
- [ ] Configurar webhooks en producción

---

## 🚀 PRÓXIMOS PASOS

### Inmediato
1. Instalar dependencias: `npm install`
2. Configurar variables de entorno
3. Probar endpoints de reportes
4. Probar creación de pagos

### Corto Plazo
1. Configurar webhooks en producción
2. Implementar más tipos de reportes
3. Agregar gráficos interactivos
4. Implementar reportes programados

### Futuro
1. Export a más formatos (CSV, XML)
2. Reportes personalizables
3. Dashboard visual con charts
4. Apple Pay / Google Pay
5. Criptomonedas

---

**¡Sistemas de Reportes y Pagos implementados exitosamente!** 📊💳

Tu ERP ahora puede generar reportes profesionales y procesar pagos con múltiples pasarelas.
