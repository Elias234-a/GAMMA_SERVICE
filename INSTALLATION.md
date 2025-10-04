# Guía de Instalación Completa

## 🎯 Paso a Paso para Instalar y Ejecutar el Sistema

### 1. Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** versión 18 o superior
  - Verificar: `node --version`
  - Descargar de: https://nodejs.org/

- **npm** (viene con Node.js)
  - Verificar: `npm --version`

### 2. Clonar o Descargar el Proyecto

Si tienes el proyecto en un repositorio Git:
```bash
git clone <url-del-repositorio>
cd sistema-gestion-vehicular
```

Si tienes el proyecto descargado, navega al directorio:
```bash
cd ruta/al/proyecto
```

### 3. Instalación

#### Opción A: Instalación Completa (Frontend + Backend)

```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd server
npm install
cd ..
```

#### Opción B: Solo Frontend (usa datos mock)

```bash
# Instalar solo dependencias del frontend
npm install
```

### 4. Configuración

#### Frontend

Crear archivo de configuración (opcional, ya existe uno por defecto):
```bash
cp .env.example .env
```

El archivo `.env` debe contener:
```
VITE_API_URL=http://localhost:5000/api
```

#### Backend (si lo instalaste)

```bash
cd server
cp .env.example .env
```

El archivo `server/.env` debe contener:
```
PORT=5000
JWT_SECRET=sistema_gestion_vehicular_secret_key_2024
NODE_ENV=development
```

### 5. Ejecutar el Sistema

#### Opción A: Frontend + Backend (Recomendado)

**En Linux/Mac (usando el script):**
```bash
./start-all.sh
```

**Manualmente (dos terminales):**

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

#### Opción B: Solo Frontend (con datos mock)

```bash
npm run dev
```

### 6. Acceder al Sistema

Una vez iniciado, abre tu navegador en:
```
http://localhost:3000
```

### 7. Iniciar Sesión

Usa uno de estos usuarios de prueba:

**Administrador (acceso completo):**
- Email: `admin@sistema.com`
- Password: `admin123`

**Vendedor:**
- Email: `ventas@sistema.com`
- Password: `ventas123`

**Mecánico:**
- Email: `mecanico@sistema.com`
- Password: `mecanico123`

**Cliente:**
- Email: `cliente@sistema.com`
- Password: `cliente123`

## 🔧 Solución de Problemas

### Error: "Puerto ya en uso"

Si el puerto 3000 o 5000 ya está en uso:

**Frontend:**
```bash
# El sistema te preguntará si quieres usar otro puerto
# O puedes especificar uno manualmente:
PORT=3001 npm run dev
```

**Backend:**
```bash
# Edita server/.env y cambia:
PORT=5001
```

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Si es del backend:
cd server
rm -rf node_modules package-lock.json
npm install
```

### Error: "EACCES: permission denied"

En Linux/Mac, si tienes problemas de permisos:
```bash
sudo chown -R $USER:$USER .
```

### El backend no conecta

1. Verifica que el backend esté corriendo en `http://localhost:5000`
2. Verifica que el archivo `.env` tenga la URL correcta
3. El sistema funcionará con datos mock si el backend no está disponible

## 📦 Compilación para Producción

### Frontend

```bash
npm run build
```

Los archivos compilados estarán en `dist/`. Puedes servirlos con cualquier servidor web estático.

### Backend

```bash
cd server
NODE_ENV=production npm start
```

## 🧪 Verificación de la Instalación

Verifica que todo funciona correctamente:

1. ✅ El frontend carga en http://localhost:3000
2. ✅ Puedes iniciar sesión con cualquier usuario de prueba
3. ✅ El dashboard se muestra correctamente
4. ✅ Puedes navegar entre diferentes módulos
5. ✅ Si el backend está corriendo, verifica http://localhost:5000/api/health

## 🆘 Soporte

Si encuentras problemas:

1. Verifica que Node.js esté instalado correctamente
2. Asegúrate de estar en el directorio correcto
3. Revisa los logs en la consola para mensajes de error específicos
4. Verifica que los puertos 3000 y 5000 estén disponibles

## 📚 Documentación Adicional

- Ver `README.md` para más información sobre el proyecto
- Ver `server/README.md` para documentación específica del backend
- Ver los comentarios en el código para detalles de implementación
