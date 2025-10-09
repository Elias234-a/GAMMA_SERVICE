# ⚙️ CI/CD - GAMMA Service ERP

## 📋 Descripción

Pipeline completo de CI/CD usando GitHub Actions para testing, building, y deployment automático.

---

## 🎯 Workflows Implementados

### 1. **CI/CD Pipeline** (`ci.yml`)
Pipeline principal que se ejecuta en cada push y PR.

**Triggers**:
- Push a `main`, `develop`, `gamma-recuperado`
- Pull requests a `main`, `develop`

**Jobs**:
1. **Backend Tests** - Tests con MongoDB en servicio
2. **Frontend Build** - Build y análisis de bundle
3. **Code Quality** - Linting del código
4. **Docker Build** - Construcción de imágenes Docker
5. **Security Scan** - Escaneo de vulnerabilidades con Trivy
6. **Deploy Staging** - Deploy automático a staging (develop branch)
7. **Deploy Production** - Deploy manual a producción (main branch)

---

### 2. **PR Checks** (`pr-check.yml`)
Validación rápida para Pull Requests.

**Triggers**:
- Pull requests a `main`, `develop`

**Features**:
- Tests rápidos
- Build validation
- Comentario automático en PR
- Resumen en PR

---

### 3. **CodeQL Security** (`codeql.yml`)
Análisis de seguridad automático del código.

**Triggers**:
- Push a `main`, `develop`
- Pull requests
- Scheduled (lunes 6 AM UTC)

**Features**:
- Análisis estático de código
- Detección de vulnerabilidades
- Security alerts en GitHub

---

### 4. **Dependabot** (`dependabot.yml`)
Actualización automática de dependencias.

**Features**:
- Actualización semanal (lunes)
- Frontend y Backend separados
- GitHub Actions updates
- PRs automáticos

---

## 🔧 Configuración Inicial

### 1. Configurar Secrets en GitHub

Ve a **Settings → Secrets and variables → Actions** y agrega:

#### Secrets Requeridos:
```
DOCKER_USERNAME        # Tu usuario de Docker Hub
DOCKER_PASSWORD        # Token de Docker Hub
```

#### Secrets Opcionales (para deploy):
```
SSH_PRIVATE_KEY        # Para deploy por SSH
SERVER_HOST            # IP/dominio del servidor
SERVER_USER            # Usuario SSH
MONGODB_URI_PROD       # URI de MongoDB en producción
JWT_SECRET_PROD        # JWT secret de producción
```

---

### 2. Habilitar GitHub Actions

1. Ve a tu repositorio en GitHub
2. Click en **Actions**
3. Habilita workflows si están deshabilitados
4. Los workflows se ejecutarán automáticamente

---

### 3. Configurar Ambientes (Opcional)

Para deploys protegidos:

1. Ve a **Settings → Environments**
2. Crea ambientes: `staging` y `production`
3. Agrega reglas de protección:
   - Required reviewers
   - Wait timer
   - Branch restrictions

---

## 📊 Badges para README

Agrega estos badges a tu `README.md`:

```markdown
![CI/CD](https://github.com/tu-usuario/tu-repo/workflows/CI%2FCD%20Pipeline/badge.svg)
![Tests](https://github.com/tu-usuario/tu-repo/workflows/PR%20Checks/badge.svg)
![Security](https://github.com/tu-usuario/tu-repo/workflows/CodeQL/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
```

---

## 🚀 Uso

### Ejecutar CI en un Push

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin develop
```

El pipeline se ejecutará automáticamente.

---

### Crear un Pull Request

```bash
# Crear rama feature
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y commit
git add .
git commit -m "feat: agregar nueva funcionalidad"

# Push y crear PR
git push origin feature/nueva-funcionalidad
```

GitHub Actions ejecutará:
- ✅ PR Checks (rápido)
- ✅ CI/CD Pipeline (completo)

---

### Deploy a Staging

```bash
# Merge a develop
git checkout develop
git merge feature/nueva-funcionalidad
git push origin develop
```

Se deployará automáticamente a staging.

---

### Deploy a Production

```bash
# Merge a main (después de aprobar PR)
git checkout main
git merge develop
git push origin main
```

Se deployará a producción (requiere aprobación manual si configuraste environments).

---

## 📋 Jobs Detallados

### Backend Tests

```yaml
- Checkout código
- Setup Node.js 18
- Install dependencies (npm ci)
- Run tests con MongoDB
- Upload coverage a Codecov
- Upload test artifacts
```

**Variables de entorno**:
- `NODE_ENV=test`
- `MONGODB_URI=mongodb://localhost:27017/gamma_test`
- `JWT_SECRET=test_jwt_secret_for_ci_only`

---

### Frontend Build

```yaml
- Checkout código
- Setup Node.js 18
- Install dependencies
- Build producción
- Upload dist artifacts
- Analizar bundle size
```

---

### Docker Build

```yaml
- Checkout código
- Setup Docker Buildx
- Login a Docker Hub (solo en main)
- Build backend image
- Build frontend image
- Push a registry (solo en main)
```

**Tags generados**:
- `latest` (branch main)
- `develop` (branch develop)
- `<branch>-<sha>` (todas las branches)

---

## 🔍 Monitoreo

### Ver estado de workflows

```bash
# En GitHub
Repository → Actions → Workflows
```

### Ver logs

```bash
# Click en cualquier workflow run
# Click en cualquier job
# Ver logs en tiempo real
```

### Notificaciones

GitHub enviará notificaciones por:
- ✅ Workflow exitoso
- ❌ Workflow fallido
- 🔒 Security alerts

---

## 🐛 Troubleshooting

### Tests fallan en CI pero no localmente

**Causas comunes**:
1. Diferente versión de Node.js
2. Diferente versión de MongoDB
3. Variables de entorno faltantes

**Solución**:
```bash
# Usar misma versión de Node
nvm use 18

# Verificar que tests pasen con MongoDB en memoria
NODE_ENV=test npm test
```

---

### Docker build falla

**Causas comunes**:
1. Dockerfile con errores
2. Dependencies faltantes
3. Secrets mal configurados

**Solución**:
```bash
# Test Docker build localmente
docker build -t test-backend ./backend
docker build -t test-frontend .
```

---

### Deploy falla

**Causas comunes**:
1. Secrets faltantes
2. SSH key incorrecto
3. Permisos insuficientes

**Solución**:
```bash
# Verificar secrets en GitHub
# Verificar SSH access al servidor
ssh -i ~/.ssh/id_rsa user@server
```

---

## 📈 Optimizaciones

### Acelerar CI

```yaml
# Usar cache de dependencies
- uses: actions/setup-node@v4
  with:
    cache: 'npm'

# Usar cache de Docker layers
cache-from: type=gha
cache-to: type=gha,mode=max
```

### Paralelizar jobs

```yaml
jobs:
  test:
    # ...
  
  lint:
    # Corre en paralelo con test
    # No espera a test
```

### Skip CI

```bash
git commit -m "docs: update README [skip ci]"
```

---

## 🔐 Seguridad

### Best Practices

✅ **Nunca commitear secrets**
✅ **Usar GitHub Secrets**
✅ **Limitar permisos de tokens**
✅ **Usar environments con approvals**
✅ **Escanear dependencias regularmente**
✅ **Usar Dependabot**

### Verificar secrets

```bash
# Buscar accidentalmente commiteados
git log -p | grep -i 'password\|secret\|key' --color
```

---

## 📊 Métricas

### Coverage

El pipeline automáticamente:
- ✅ Genera coverage reports
- ✅ Sube a Codecov
- ✅ Muestra en PR comments

### Build Time

Optimizaciones aplicadas:
- ✅ Cache de npm dependencies
- ✅ Cache de Docker layers
- ✅ Parallel jobs

**Tiempo típico**: 5-8 minutos

---

## 🎯 Roadmap

### Próximas mejoras

- [ ] E2E tests con Playwright
- [ ] Performance testing
- [ ] Smoke tests post-deploy
- [ ] Rollback automático si tests fallan
- [ ] Slack/Discord notifications
- [ ] Deploy previews para PRs
- [ ] Kubernetes deployment
- [ ] Multi-region deployment

---

## 📚 Recursos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [CodeQL](https://codeql.github.com/)
- [Dependabot](https://docs.github.com/en/code-security/dependabot)

---

## ✅ Checklist de Configuración

Antes de usar CI/CD:

- [x] Workflows creados (.github/workflows/)
- [ ] GitHub Actions habilitado
- [ ] Secrets configurados en GitHub
- [ ] Docker Hub account (opcional)
- [ ] Tests pasando localmente
- [ ] Dockerfile funcional
- [ ] Environments configurados (opcional)
- [ ] Branch protection rules (recomendado)

---

## 💬 Preguntas Frecuentes

### ¿Los workflows consumen recursos?

Sí, pero GitHub ofrece:
- **2,000 minutos/mes gratis** (public repos)
- **Ilimitado para repos públicos**

### ¿Puedo ejecutar workflows localmente?

Sí, usa [act](https://github.com/nektos/act):
```bash
brew install act
act -j backend-tests
```

### ¿Cómo cancelo un workflow?

```bash
# En GitHub UI
Actions → Running workflow → Cancel workflow
```

### ¿Cómo reejemto un workflow fallido?

```bash
# En GitHub UI
Actions → Failed workflow → Re-run jobs
```

---

**¡CI/CD configurado y listo para usar!** 🎉

Para empezar:
```bash
git add .github/
git commit -m "ci: setup CI/CD pipeline"
git push
```

Los workflows se ejecutarán automáticamente en el próximo push.
