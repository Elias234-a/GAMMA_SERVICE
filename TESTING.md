# GAMMA Service ERP - Guía de Pruebas

## 🧪 Pruebas Manuales

### 1. Autenticación

#### Login
1. Abrir `http://localhost:5173`
2. Probar credenciales válidas:
   - Email: `admin@gammaservice.com`
   - Password: `admin123`
   - Rol: `Administrador`
3. Verificar que se muestre el mensaje de bienvenida
4. Verificar redirección al dashboard

#### Login con Credenciales Inválidas
1. Intentar login con email incorrecto
2. Verificar mensaje de error
3. Intentar login con password incorrecta
4. Verificar mensaje de error
5. Intentar login sin seleccionar rol
6. Verificar mensaje de error

#### Registro
1. Hacer clic en "Crear cuenta nueva"
2. Llenar todos los campos requeridos:
   - Nombre: `Usuario Test`
   - Teléfono: `+57 300 123 4567`
   - Dirección: `Calle 123 #45-67`
   - Email: `test@example.com`
   - Password: `Test123!`
   - Confirmar Password: `Test123!`
   - Rol: `Cliente`
3. Verificar mensaje de registro exitoso
4. Verificar que se pueda hacer login con las nuevas credenciales

#### Recuperación de Contraseña
1. Hacer clic en "¿Olvidó su contraseña?"
2. Ingresar email válido
3. Verificar mensaje de confirmación

#### Persistencia de Sesión
1. Hacer login
2. Recargar la página (F5)
3. Verificar que la sesión persista
4. Cerrar el navegador
5. Abrir nuevamente
6. Verificar que la sesión persista

#### Logout
1. Hacer clic en el menú de usuario (esquina superior derecha)
2. Hacer clic en "Cerrar Sesión"
3. Confirmar en el diálogo
4. Verificar redirección al login
5. Verificar mensaje de sesión cerrada

### 2. Sistema de Notificaciones

#### Visualización de Notificaciones
1. Hacer login
2. Observar el ícono de campana en la barra superior
3. Verificar contador de notificaciones no leídas (si hay)
4. Hacer clic en el ícono de campana
5. Verificar que se abra el panel de notificaciones

#### Marcar como Leída
1. Abrir panel de notificaciones
2. Hacer clic en una notificación no leída
3. Verificar que cambie de color/estado
4. Verificar que el contador disminuya

#### Marcar Todas como Leídas
1. Abrir panel de notificaciones con varias no leídas
2. Hacer clic en "Marcar todo como leído"
3. Verificar que todas cambien de estado
4. Verificar que el contador llegue a 0

#### Eliminar Notificación
1. Abrir panel de notificaciones
2. Hacer clic en la X de una notificación
3. Verificar que desaparezca
4. Verificar que el contador se actualice

#### Limpiar Todas las Notificaciones
1. Abrir panel de notificaciones
2. Hacer clic en "Limpiar todas las notificaciones"
3. Verificar que el panel quede vacío
4. Verificar mensaje "No hay notificaciones"

### 3. Estados de Carga

#### Login
1. Ingresar credenciales válidas
2. Hacer clic en "Iniciar Sesión"
3. Verificar que aparezca spinner de carga
4. Verificar que el botón se deshabilite
5. Verificar texto "Iniciando sesión..."

#### Registro
1. Llenar formulario de registro
2. Hacer clic en "Crear Cuenta"
3. Verificar spinner de carga
4. Verificar texto "Creando cuenta..."

#### Recuperación de Contraseña
1. Ingresar email
2. Hacer clic en "Enviar Enlace"
3. Verificar spinner de carga
4. Verificar texto "Enviando..."

#### Carga Inicial de la Aplicación
1. Abrir la aplicación con sesión guardada
2. Verificar spinner de carga inicial
3. Verificar texto "Cargando aplicación..."
4. Verificar transición suave al dashboard

### 4. Navegación y Permisos

#### Navegación por Módulos (Administrador)
1. Login como Administrador
2. Verificar acceso a todos los módulos:
   - Dashboard
   - Ventas
   - Clientes
   - Vehículos
   - CRM
   - Taller
   - Facturación
   - Financiamiento
   - Placas
   - Inventario
   - Compras
   - Recursos Humanos
   - Reportes
   - DIAN
   - Portal del Cliente
   - Gestión de Usuarios

#### Navegación por Módulos (Vendedor)
1. Login como Vendedor
2. Verificar acceso limitado:
   - Dashboard ✓
   - Ventas ✓
   - Clientes ✓
   - Vehículos ✓
   - CRM ✓
   - Otros módulos ✗

#### Navegación por Módulos (Cliente)
1. Login como Cliente
2. Verificar acceso limitado:
   - Dashboard ✓
   - Portal del Cliente ✓
   - Otros módulos ✗

#### Navegación por Módulos (Mecánico)
1. Login como Mecánico
2. Verificar acceso limitado:
   - Dashboard ✓
   - Taller ✓
   - Otros módulos ✗

### 5. Responsive Design

#### Desktop (1920x1080)
1. Abrir en pantalla completa
2. Verificar diseño de 2 columnas (sidebar + contenido)
3. Verificar que todos los elementos sean visibles
4. Verificar que no haya scroll horizontal

#### Tablet (768x1024)
1. Redimensionar ventana
2. Verificar que el sidebar se adapte
3. Verificar que el contenido sea legible
4. Verificar funcionamiento del menú hamburguesa

#### Mobile (375x667)
1. Abrir en modo responsive móvil
2. Verificar que el sidebar esté oculto por defecto
3. Verificar funcionamiento del menú hamburguesa
4. Verificar que los formularios sean usables
5. Verificar que las tablas sean scrolleables

### 6. Manejo de Errores

#### Error de Conexión al Backend
1. Detener el servidor backend
2. Intentar hacer login
3. Verificar mensaje de error apropiado
4. Verificar que no se rompa la aplicación

#### Error de Validación
1. Intentar registrar con email inválido
2. Verificar mensaje de error específico
3. Intentar registrar con contraseña corta
4. Verificar mensaje de error específico

#### Error 401 - No Autorizado
1. Manipular el token en localStorage
2. Intentar acceder a una ruta protegida
3. Verificar redirección al login
4. Verificar limpieza de datos de sesión

### 7. Búsqueda Global

1. Hacer clic en la barra de búsqueda (centro del TopBar)
2. Escribir un término de búsqueda
3. Presionar Enter
4. Verificar que aparezca notificación con el término buscado

## 🔧 Pruebas de API (Backend)

### Usando Swagger UI

1. Abrir `http://localhost:5000/api-docs`
2. Explorar todos los endpoints disponibles
3. Probar cada endpoint con datos de prueba

### Usando cURL o Postman

#### Registro de Usuario
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!@#",
    "phone": "+57 300 123 4567",
    "address": "Calle 123",
    "role": "Cliente"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

#### Obtener Perfil (requiere token)
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Obtener Notificaciones
```bash
curl -X GET http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Marcar Notificación como Leída
```bash
curl -X PATCH http://localhost:5000/api/notifications/NOTIFICATION_ID/read \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📊 Checklist de Pruebas

### Funcionalidad
- [ ] Login funciona correctamente
- [ ] Registro funciona correctamente
- [ ] Recuperación de contraseña funciona
- [ ] Logout funciona correctamente
- [ ] Persistencia de sesión funciona
- [ ] Notificaciones se cargan desde backend
- [ ] Notificaciones se pueden marcar como leídas
- [ ] Notificaciones se pueden eliminar
- [ ] Estados de carga aparecen en todos los formularios
- [ ] Navegación entre módulos funciona
- [ ] Permisos por rol funcionan correctamente

### UI/UX
- [ ] Diseño responsive en desktop
- [ ] Diseño responsive en tablet
- [ ] Diseño responsive en móvil
- [ ] Animaciones suaves
- [ ] Feedback visual en interacciones
- [ ] Mensajes de error claros
- [ ] Mensajes de éxito claros
- [ ] Loading spinners visibles

### Performance
- [ ] Carga inicial < 3 segundos
- [ ] Login < 2 segundos
- [ ] Navegación entre módulos instantánea
- [ ] Notificaciones cargan < 1 segundo
- [ ] Sin memory leaks visibles

### Seguridad
- [ ] Contraseñas no visibles en formularios
- [ ] Tokens guardados de forma segura
- [ ] Redirección automática en 401
- [ ] Limpieza de datos al logout
- [ ] Validación de inputs en frontend
- [ ] Validación de inputs en backend

## 🐛 Reporte de Bugs

Si encuentras un bug, documenta:

1. **Descripción**: ¿Qué pasó?
2. **Pasos para reproducir**: ¿Cómo llegaste ahí?
3. **Comportamiento esperado**: ¿Qué debería pasar?
4. **Comportamiento actual**: ¿Qué está pasando?
5. **Screenshots**: Si es posible
6. **Consola del navegador**: Errores de JavaScript
7. **Logs del backend**: Errores del servidor
8. **Entorno**: Navegador, OS, versión

## ✅ Criterios de Aceptación

Para considerar el sistema listo para producción:

1. ✅ Todas las pruebas de funcionalidad pasan
2. ✅ Todas las pruebas de UI/UX pasan
3. ✅ No hay errores en consola del navegador
4. ✅ No hay errores en logs del backend
5. ✅ Performance aceptable en todas las pantallas
6. ✅ Funciona en Chrome, Firefox, Edge
7. ✅ Funciona en dispositivos móviles
8. ✅ Backend responde correctamente a todos los endpoints
9. ✅ Documentación completa y actualizada
10. ✅ Variables de entorno configuradas correctamente

---

**Última actualización:** 2025-10-04
