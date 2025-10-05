# ⚡ Guía de Inicio Rápido - GAMMA Service ERP

## 🎯 Objetivo
Poner en marcha el sistema en **menos de 5 minutos**.

---

## 📋 Pre-requisitos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Node.js** v16+ ([Descargar](https://nodejs.org/))
- ✅ **MongoDB** ([Descargar](https://www.mongodb.com/try/download/community))
- ✅ **Git** (opcional)

---

## 🚀 Opción 1: Inicio Automático (Recomendado)

### Windows

```bash
# 1. Navegar al directorio del proyecto
cd HOLA_XD

# 2. Ejecutar el script de inicio
start.bat
```

**¡Eso es todo!** El script:
- ✅ Instala dependencias automáticamente
- ✅ Inicia backend (puerto 5000)
- ✅ Inicia frontend (puerto 5173)
- ✅ Abre ambos en terminales separadas

---

## 🔧 Opción 2: Inicio Manual

### Paso 1: Instalar Dependencias

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### Paso 2: Verificar MongoDB

```bash
# Verificar que MongoDB esté corriendo
# Windows: Buscar "MongoDB" en Servicios
# Linux/Mac: sudo systemctl status mongod
```

### Paso 3: Iniciar Servidores

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

## 🌐 Acceder al Sistema

Una vez iniciado, abre tu navegador en:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Documentación API**: http://localhost:5000/api-docs

---

## 🔑 Credenciales de Prueba

Usa estas credenciales para probar el sistema:

### Administrador (Acceso Total)
```
Email: admin@gammaservice.com
Password: admin123
Rol: Administrador
```

### Vendedor
```
Email: vendedor@gammaservice.com
Password: vendedor123
Rol: Vendedor
```

### Cliente
```
Email: cliente@gammaservice.com
Password: cliente123
Rol: Cliente
```

### Mecánico
```
Email: mecanico@gammaservice.com
Password: mecanico123
Rol: Mecánico
```

---

## ✅ Verificación Rápida

### 1. Login
- [ ] Abrir http://localhost:5173
- [ ] Ingresar credenciales de administrador
- [ ] Verificar que aparezca el dashboard

### 2. Notificaciones
- [ ] Hacer clic en el ícono de campana (arriba a la derecha)
- [ ] Verificar que se abra el panel de notificaciones

### 3. Navegación
- [ ] Hacer clic en el menú lateral
- [ ] Navegar entre diferentes módulos
- [ ] Verificar que todo cargue correctamente

---

## 🐛 Solución Rápida de Problemas

### Error: "Cannot connect to MongoDB"

**Solución:**
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### Error: "Port 5000 already in use"

**Solución:**
```bash
# Cambiar puerto en backend/.env
PORT=5001

# Actualizar frontend/.env.local
VITE_API_URL=http://localhost:5001/api
```

### Error: "Module not found"

**Solución:**
```bash
# Reinstalar dependencias
npm install
cd backend && npm install && cd ..
```

### El frontend no carga

**Solución:**
```bash
# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📚 Próximos Pasos

Una vez que el sistema esté funcionando:

1. **Explorar Módulos**: Navega por todos los módulos disponibles
2. **Crear Usuario**: Registra un nuevo usuario desde el login
3. **Probar Notificaciones**: Interactúa con el centro de notificaciones
4. **Revisar API**: Explora la documentación en `/api-docs`
5. **Leer Documentación**: Consulta `SETUP.md` para más detalles

---

## 🎓 Recursos Útiles

- **[SETUP.md](./SETUP.md)** - Guía detallada de configuración
- **[TESTING.md](./TESTING.md)** - Guía completa de pruebas
- **[README.md](./README.md)** - Documentación general
- **[CHANGELOG.md](./CHANGELOG.md)** - Historial de cambios

---

## 💡 Consejos

### Para Desarrollo
- Usa las **DevTools** del navegador (F12) para ver logs
- Revisa la consola del backend para errores
- Usa **Postman** o **cURL** para probar la API directamente

### Para Producción
- Cambia `NODE_ENV=production` en `.env`
- Configura una base de datos MongoDB remota (Atlas)
- Usa variables de entorno seguras
- Implementa HTTPS

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras problemas:

1. **Revisa los logs**: Consola del navegador y terminal del backend
2. **Consulta SETUP.md**: Soluciones detalladas de problemas comunes
3. **Verifica requisitos**: Node.js v16+, MongoDB corriendo
4. **Reinstala dependencias**: `npm install` en ambos directorios

---

## ✨ ¡Listo!

Ahora tienes GAMMA Service ERP funcionando localmente.

**Disfruta explorando el sistema** 🚀

---

**Tiempo estimado de setup:** 3-5 minutos  
**Última actualización:** 2025-10-04
