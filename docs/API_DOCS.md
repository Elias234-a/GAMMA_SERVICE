# Documentación de la API

## Autenticación

### Iniciar Sesión
- **Endpoint**: `/api/auth/login`
- **Método**: `POST`
- **Cuerpo de la Solicitud**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "token": "token_jwt_aquí",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```

## Clientes

### Obtener Todos los Clientes
- **Endpoint**: `/api/clients`
- **Método**: `GET`
- **Cabeceras**:
  - `Authorization: Bearer <token>`
- **Parámetros de Consulta**:
  - `page` (número)
  - `limit` (número)
  - `search` (texto)
  - `sortBy` (texto)
  - `sortOrder` ('asc' | 'desc')

### Crear Cliente
- **Endpoint**: `/api/clients`
- **Método**: `POST`
- **Cabeceras**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Cuerpo de la Solicitud**:
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "address": "string"
  }
  ```

## Vehículos

### Obtener Vehículo por ID
- **Endpoint**: `/api/vehicles/:id`
- **Método**: `GET`
- **Cabeceras**:
  - `Authorization: Bearer <token>`

### Actualizar Vehículo
- **Endpoint**: `/api/vehicles/:id`
- **Método**: `PUT`
- **Cabeceras**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Cuerpo de la Solicitud**:
  ```json
  {
    "make": "string",
    "model": "string",
    "year": "number",
    "vin": "string",
    "licensePlate": "string",
    "clientId": "string"
  }
  ```

## Ventas

### Crear Venta
- **Endpoint**: `/api/sales`
- **Método**: `POST`
- **Cabeceras**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Cuerpo de la Solicitud**:
  ```json
  {
    "clientId": "string",
    "vehicleId": "string",
    "saleDate": "FECHA_ISO",
    "price": "number",
    "paymentMethod": "string",
    "items": [
      {
        "productId": "string",
        "quantity": "number",
        "unitPrice": "number"
      }
    ]
  }
  ```

## Reportes

### Generar Reporte
- **Endpoint**: `/api/reports/generate`
- **Método**: `POST`
- **Cabeceras**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Cuerpo de la Solicitud**:
  ```json
  {
    "type": "sales|inventory|clients",
    "startDate": "FECHA_ISO",
    "endDate": "FECHA_ISO",
    "format": "pdf|csv"
  }
  ```
  
## Respuestas de Error

### 400 Solicitud Incorrecta
```json
{
  "error": "Error de Validación",
  "message": "Descripción del error",
  "details": [
    {
      "field": "nombreCampo",
      "message": "Mensaje de error"
    }
  ]
}
```

### 401 No Autorizado
```json
{
  "error": "No Autorizado",
  "message": "Se requiere autenticación"
}
```

### 403 Prohibido
```json
{
  "error": "Prohibido",
  "message": "Permisos insuficientes"
}
```

### 404 No Encontrado
```json
{
  "error": "No Encontrado",
  "message": "Recurso no encontrado"
}
```

### 500 Error Interno del Servidor
```json
{
  "error": "Error Interno del Servidor",
  "message": "Ocurrió un error inesperado"
}
```

## Límites de Tasa
- 1000 solicitudes por hora por dirección IP
- 100 solicitudes por minuto por usuario autenticado
- Cabeceras incluidas en la respuesta:
  - `X-RateLimit-Limit`: Límite de solicitudes
  - `X-RateLimit-Remaining`: Solicitudes restantes
  - `X-RateLimit-Reset`: Tiempo de reinicio del límite (marca de tiempo UNIX)

## Control de Versiones
- La versión de la API se incluye en la URL (ej. `/api/v1/...`)
- Versión actual: v1
- Los cambios importantes se introducirán en nuevas versiones
