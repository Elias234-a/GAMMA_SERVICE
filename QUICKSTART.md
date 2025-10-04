# 🚀 Inicio Rápido - 5 Minutos

## Para Desarrolladores Impacientes

### 1️⃣ Instalar (2 minutos)

```bash
# Instalar frontend
npm install

# Instalar backend (opcional)
cd server && npm install && cd ..
```

### 2️⃣ Ejecutar (30 segundos)

**Opción A - Solo Frontend (Más Rápido):**
```bash
npm run dev
```

**Opción B - Frontend + Backend (Completo):**
```bash
# Linux/Mac
./start-all.sh

# Windows - Abrir 2 terminales:
# Terminal 1:
cd server && npm run dev

# Terminal 2:
npm run dev
```

### 3️⃣ Usar (1 minuto)

1. Abrir: http://localhost:3000
2. Login: `admin@sistema.com` / `admin123`
3. ¡Listo! 🎉

## 🔑 Usuarios Rápidos

| Rol | Email | Password |
|-----|-------|----------|
| **Admin** | admin@sistema.com | admin123 |
| Vendedor | ventas@sistema.com | ventas123 |
| Mecánico | mecanico@sistema.com | mecanico123 |
| Cliente | cliente@sistema.com | cliente123 |

## 🎯 Puertos

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

## ⚡ Características Principales

- ✅ Sistema listo para usar
- ✅ Datos de prueba incluidos
- ✅ Funciona sin backend
- ✅ 10+ módulos de negocio
- ✅ UI moderna y responsiva

## 📚 Más Información

- Ver `README.md` - Documentación completa
- Ver `INSTALLATION.md` - Guía detallada de instalación
- Ver `CHANGES.md` - Lista de cambios realizados

## 🆘 Problemas?

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Puerto ocupado? Usar otro:
PORT=3001 npm run dev
```

---

**¡Disfruta construyendo!** 🎉
