# AuthContext

## Descripción
`AuthContext` es un contexto de React que maneja la autenticación en la aplicación. Proporciona funciones para iniciar y cerrar sesión, y mantiene el estado de autenticación del usuario en toda la aplicación.

## Características
- Manejo del estado de autenticación
- Persistencia de sesión usando `localStorage`
- Normalización de roles de usuario
- Proveedor de contexto para toda la aplicación

## Uso Básico

### Importación
```typescript
import { AuthProvider, useAuth } from '@/context/AuthContext';
```

### Proveedor
Envuelve tu aplicación con `AuthProvider` en el punto de entrada principal:

```tsx
function App() {
  return (
    <AuthProvider>
      {/* El resto de tu aplicación */}
    </AuthProvider>
  );
}
```

### Hook useAuth
Usa el hook `useAuth` en cualquier componente hijo para acceder al contexto:

```tsx
function MiComponente() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Usar los valores y métodos del contexto
}
```

## API

### AuthProvider Props
| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| children | ReactNode | Sí | Componentes hijos que tendrán acceso al contexto |

### useAuth()
Retorna un objeto con las siguientes propiedades y métodos:

#### Propiedades
| Nombre | Tipo | Descripción |
|--------|------|-------------|
| user | UserData \| null | Datos del usuario autenticado o null si no hay sesión |
| isAuthenticated | boolean | Indica si hay un usuario autenticado |

#### Métodos
| Nombre | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| login | userData: UserData | void | Inicia sesión con los datos del usuario |
| logout | - | void | Cierra la sesión actual |

## Tipos

### UserData
```typescript
interface UserData {
  email: string;
  role: UserRole;
  name?: string;
}
```

## Ejemplo Completo

```tsx
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const { login } = useAuth();
  
  const handleSubmit = (email: string, password: string) => {
    // Validar credenciales...
    
    // Si la autenticación es exitosa
    login({
      email,
      role: 'admin', // Este rol será normalizado a 'Administrador'
      name: 'Nombre Usuario'
    });
  };
  
  return (
    // Formulario de login
  );
}

function UserProfile() {
  const { user, logout } = useAuth();
  
  if (!user) return <div>No hay sesión activa</div>;
  
  return (
    <div>
      <h2>Perfil de Usuario</h2>
      <p>Nombre: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Rol: {user.role}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

## Notas de Implementación
- Los datos del usuario se persisten en `localStorage` para mantener la sesión entre recargas
- Los roles se normalizan para mantener consistencia en la aplicación
- El contexto se inicializa verificando si hay una sesión guardada en `localStorage`

## Manejo de Errores
- Si hay un error al analizar los datos del usuario guardados, se limpia el `localStorage`
- Se lanza un error si `useAuth` se usa fuera de un `AuthProvider`

## Mejoras Futuras
- Añadir manejo de tokens JWT
- Implementar refresh tokens
- Añadir más validaciones de seguridad
- Integrar con un backend real para autenticación
