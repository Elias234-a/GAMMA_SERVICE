# 🔧 Solución: Problema de Pantalla Azul

**Fecha**: 2025-10-09  
**Problema**: Al navegar entre módulos, después de un tiempo la pantalla se vuelve azul y no muestra nada  
**Estado**: ✅ SOLUCIONADO

---

## 🔍 Diagnóstico del Problema

### Causa Raíz
La **pantalla azul** ocurría por una combinación de factores:

1. **Token JWT expirado**: Después de cierto tiempo, el token de autenticación expira
2. **Peticiones fallidas**: Al navegar a un módulo, se hacen peticiones a la API que fallan con `401 Unauthorized`
3. **Recarga abrupta**: El interceptor de Axios hacía `window.location.href = '/'` inmediatamente
4. **Sin Error Boundary**: Si había un error de React durante la recarga, no había nada que lo capturara
5. **Estado inválido**: La aplicación quedaba en un estado inconsistente mostrando solo fondo azul

###  Flujo del Error
```
Usuario navega → Token expirado → API devuelve 401 → 
Interceptor recarga página → Error de React durante recarga → 
No hay Error Boundary → Pantalla azul (crash)
```

---

## ✅ Solución Implementada

### 1. Error Boundary (Crítico)

**Archivo creado**: `src/components/ErrorBoundary.tsx`

**Qué hace**:
- Captura **cualquier error de React** antes de que crashee la aplicación
- Muestra una UI amigable en lugar de pantalla azul
- En desarrollo, muestra detalles técnicos del error
- Permite recargar o volver al inicio
- Integra con Sentry para tracking de errores

**Características**:
```typescript
✅ Captura errores no manejados
✅ UI de fallback profesional
✅ Botones de recuperación (Recargar / Ir al Inicio)
✅ Logging automático a consola
✅ Integración con Sentry (si está configurado)
✅ Detalles técnicos en modo desarrollo
```

**Integración**:
```tsx
// src/main.tsx
<ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
</ErrorBoundary>
```

---

### 2. Manejo Suave de Sesión Expirada

**Archivo modificado**: `src/services/api.ts`

**Mejoras implementadas**:

#### Antes ❌
```typescript
if (error.response?.status === 401) {
  localStorage.removeItem('authToken');
  window.location.href = '/';  // Recarga abrupta
}
```

#### Después ✅
```typescript
if (error.response?.status === 401 && !error.config?.url?.includes('/login')) {
  // 1. Limpiar datos
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  
  // 2. Notificar a la aplicación con evento personalizado
  window.dispatchEvent(new CustomEvent('session-expired', {
    detail: { message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' }
  }));
  
  // 3. Redirigir después de un pequeño delay
  setTimeout(() => {
    window.location.href = '/';
  }, 100);
}
```

**Ventajas**:
- ✅ Evento personalizado permite manejo controlado
- ✅ Delay pequeño evita race conditions
- ✅ No crashea componentes React
- ✅ Notificación visual al usuario

---

### 3. Listener de Eventos en App.tsx

**Archivo modificado**: `src/App.tsx`

**Nuevo useEffect**:
```typescript
useEffect(() => {
  const handleSessionExpired = (event: any) => {
    setIsAuthenticated(false);
    setCurrentModule('login');
    showAlert('warning', 'Sesión expirada', 
      'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
  };
  
  const handleNetworkError = (event: any) => {
    showAlert('error', 'Error de conexión', 
      'No se pudo conectar con el servidor.');
  };
  
  window.addEventListener('session-expired', handleSessionExpired);
  window.addEventListener('network-error', handleNetworkError);
  
  return () => {
    window.removeEventListener('session-expired', handleSessionExpired);
    window.removeEventListener('network-error', handleNetworkError);
  };
}, [showAlert]);
```

**Qué hace**:
- ✅ Escucha eventos del interceptor de Axios
- ✅ Actualiza estado de la aplicación de forma controlada
- ✅ Muestra alertas visuales al usuario
- ✅ Limpia listeners al desmontar

---

### 4. Manejo de Errores de Red

**Bonus**: Ahora también manejamos errores de red (servidor caído, sin internet)

```typescript
// En api.ts
if (!error.response && error.request) {
  window.dispatchEvent(new CustomEvent('network-error', {
    detail: { message: 'No se pudo conectar con el servidor.' }
  }));
}
```

---

## 🎯 Resultados

### Antes ❌
```
Síntomas:
- Pantalla azul sin mensaje
- No se puede recuperar sin recargar manualmente
- Usuario no sabe qué pasó
- Pérdida de datos en formularios
- Experiencia frustrante
```

### Después ✅
```
Beneficios:
- Error Boundary captura todos los errores
- UI amigable con opciones de recuperación
- Alertas informativas al usuario
- Transición suave al login
- Manejo de errores de red
- Logs automáticos para debugging
```

---

## 🧪 Cómo Probar la Solución

### 1. Probar Error Boundary
```javascript
// En cualquier componente, lanza un error intencional
throw new Error('Test error boundary');
```

**Resultado esperado**: Verás la UI del Error Boundary en lugar de pantalla azul

### 2. Probar Sesión Expirada
```javascript
// En la consola del navegador
localStorage.setItem('authToken', 'token-invalido');
// Luego navega a otro módulo que haga peticiones a la API
```

**Resultado esperado**: 
- Alerta "Sesión expirada"
- Redirección suave al login
- Sin pantalla azul

### 3. Probar Error de Red
```bash
# Apaga el backend
# Luego intenta navegar en el frontend
```

**Resultado esperado**:
- Alerta "Error de conexión"
- Aplicación sigue funcionando
- Sin pantalla azul

---

## 📊 Arquitectura de la Solución

```
┌─────────────────────────────────────────────────┐
│          Error Boundary (Capa Superior)         │
│   Captura TODOS los errores de React            │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│              App Component                       │
│   • Maneja eventos de sesión                    │
│   • Muestra alertas al usuario                  │
│   • Controla estado de autenticación            │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│          API Interceptor (axios)                 │
│   • Detecta errores 401, 5xx, red               │
│   • Emite eventos personalizados                │
│   • Limpia localStorage                         │
└─────────────────────────────────────────────────┘
```

---

## 🔐 Mejoras de Seguridad Adicionales

### Token Refresh (Opcional - Próxima Implementación)
```typescript
// Idea: Renovar token antes de que expire
const checkTokenExpiration = () => {
  const token = getToken();
  const decoded = jwtDecode(token);
  const timeUntilExpiry = decoded.exp * 1000 - Date.now();
  
  // Si expira en menos de 5 minutos, renovar
  if (timeUntilExpiry < 5 * 60 * 1000) {
    refreshToken();
  }
};
```

### Advertencia de Sesión Próxima a Expirar
```typescript
// Idea: Mostrar advertencia 2 minutos antes
if (timeUntilExpiry < 2 * 60 * 1000) {
  showAlert('warning', 'Sesión próxima a expirar', 
    'Tu sesión expirará pronto. Guarda tu trabajo.');
}
```

---

## 📝 Archivos Modificados

### Archivos Creados
- ✅ `src/components/ErrorBoundary.tsx` (140 líneas)

### Archivos Modificados
- ✅ `src/main.tsx` (Integración de ErrorBoundary)
- ✅ `src/services/api.ts` (Manejo de errores mejorado)
- ✅ `src/App.tsx` (Listener de eventos)

---

## 🎓 Conceptos Técnicos Aplicados

### 1. Error Boundaries (React)
- Patrón de componente clase para capturar errores
- Método `componentDidCatch`
- Estado derivado de errores

### 2. Custom Events (JavaScript)
- `window.dispatchEvent(new CustomEvent(...))`
- Comunicación entre módulos desacoplados
- Patrón pub/sub

### 3. Axios Interceptors
- Request interceptor (agregar token)
- Response interceptor (manejar errores)
- Centralización de lógica

### 4. React Hooks
- `useEffect` con cleanup
- `useCallback` para memoización
- Manejo de eventos del DOM

---

## ✅ Checklist de Verificación

- [x] Error Boundary implementado y probado
- [x] Manejo de sesión expirada mejorado
- [x] Eventos personalizados funcionando
- [x] Alertas visuales al usuario
- [x] Manejo de errores de red
- [x] Código limpio y documentado
- [x] Sin warnings de lint
- [x] Integración con el resto del sistema

---

## 🚀 Próximos Pasos

1. **Probar en producción** con usuarios reales
2. **Monitorear errores** con Sentry
3. **Implementar token refresh** (opcional)
4. **Agregar advertencias** antes de expiración (opcional)
5. **Mejorar offline support** con Service Workers (opcional)

---

## 📞 Soporte

Si el problema persiste o encuentras un nuevo caso:

1. **Revisar consola del navegador** (F12 → Console)
2. **Revisar logs del backend** (`backend/logs/`)
3. **Verificar Sentry** (si está configurado)
4. **Comprobar estado del token** en localStorage

---

**Estado Final**: ✅ **PROBLEMA RESUELTO**

*Fecha de solución: 2025-10-09*  
*Documentado por: Sistema de IA - Cascade*
