# ThemedLiquidEther - Fondo Animado Adaptativo

## Descripción
`ThemedLiquidEther` es un componente que proporciona un fondo animado fluido que se adapta automáticamente al tema actual (claro/oscuro) del sistema. Está diseñado para funcionar como fondo en cualquier módulo sin interferir con la interacción del usuario.

## Características Principales

### ✅ Adaptación Automática al Tema
- **Modo Claro**: Colores vibrantes (`#5227FF`, `#FF9FFC`, `#B19EEF`)
- **Modo Oscuro**: Colores más sutiles (`#1E40AF`, `#7C3AED`, `#DB2777`)

### ✅ No Interfiere con Inputs
- `pointerEvents: 'none'` permite que los clicks pasen a través
- Animación continua sin pausas al interactuar con formularios
- Delay de reanudación muy corto (100ms)

### ✅ Optimizado para Rendimiento
- Se pausa automáticamente cuando no es visible
- Manejo inteligente de redimensionado
- Limpieza automática de recursos

## Uso

### Implementación Básica
```tsx
import ThemedLiquidEther from './ThemedLiquidEther';

function MiModulo() {
  return (
    <div className="min-h-screen relative">
      {/* Fondo animado */}
      <div className="absolute inset-0 z-0">
        <ThemedLiquidEther />
      </div>
      
      {/* Contenido del módulo */}
      <div className="relative z-10">
        {/* Tu contenido aquí */}
      </div>
    </div>
  );
}
```

### Personalización Avanzada
```tsx
<ThemedLiquidEther
  mouseForce={30}           // Fuerza de interacción del mouse
  cursorSize={150}          // Tamaño del cursor de interacción
  autoSpeed={0.8}           // Velocidad de la animación automática
  autoIntensity={3.0}       // Intensidad del movimiento automático
  lightColors={['#FF6B6B', '#4ECDC4', '#45B7D1']}  // Colores personalizados para tema claro
  darkColors={['#2C3E50', '#8E44AD', '#E74C3C']}   // Colores personalizados para tema oscuro
/>
```

## Integración en el Sistema

### Ya Implementado en:
- ✅ **LoginScreen**: Fondo completo durante autenticación
- ✅ **App.tsx**: Fondo global para toda la aplicación
- ✅ **LoadingSpinner**: Fondo durante carga inicial

### ModuleBase Actualizado
El componente `ModuleBase` ahora está optimizado para trabajar con el fondo animado:
- Usa `relative z-10` para contenido
- Colores adaptativos al tema
- Fondos con `backdrop-blur-sm` para efecto glass

## Configuración de Z-Index

```
z-0   : ThemedLiquidEther (fondo)
z-10  : Contenido principal de módulos
z-20  : Overlays móviles
z-30  : Sidebar
```

## Propiedades Disponibles

| Prop | Tipo | Defecto | Descripción |
|------|------|---------|-------------|
| `mouseForce` | number | 20 | Fuerza de interacción del mouse |
| `cursorSize` | number | 100 | Tamaño del área de interacción |
| `autoSpeed` | number | 0.5 | Velocidad del movimiento automático |
| `autoIntensity` | number | 2.2 | Intensidad de la animación |
| `lightColors` | string[] | `['#5227FF', '#FF9FFC', '#B19EEF']` | Colores para tema claro |
| `darkColors` | string[] | `['#1E40AF', '#7C3AED', '#DB2777']` | Colores para tema oscuro |
| `className` | string | '' | Clases CSS adicionales |
| `style` | CSSProperties | {} | Estilos CSS adicionales |

## Mejores Prácticas

1. **Siempre usar como fondo**: Colocar en `z-0` con `absolute inset-0`
2. **Contenido en z-10+**: Asegurar que el contenido esté por encima
3. **No modificar pointerEvents**: Mantener `'none'` para evitar interferencias
4. **Usar colores coherentes**: Los colores por defecto están optimizados para cada tema

## Solución de Problemas

### El efecto se detiene al interactuar
- ✅ **Solucionado**: `pointerEvents: 'none'` evita la detección de eventos
- ✅ **Solucionado**: Delay de reanudación reducido a 100ms

### No se ve el contenido
- Verificar que el contenido tenga `relative z-10` o superior
- Asegurar que no hay conflictos de z-index

### Rendimiento lento
- El componente se optimiza automáticamente
- Se pausa cuando no es visible
- Usa IntersectionObserver para eficiencia
