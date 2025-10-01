# Guía de Estilo y Patrones de Diseño

## Sistema de Diseño

### Colores
- **Primario**: #2563eb (Azul 600)
- **Secundario**: #4f46e5 (Índigo 600)
- **Éxito**: #10b981 (Esmeralda 500)
- **Advertencia**: #f59e0b (Ámbar 500)
- **Peligro**: #ef4444 (Rojo 500)
- **Texto**:
  - Principal: #1f2937 (Gris 900)
  - Secundario: #6b7280 (Gris 500)
  - Deshabilitado: #9ca3af (Gris 400)

### Tipografía
- **Familia Tipográfica**: Inter, system-ui, sans-serif
- **Tamaño Base**: 16px
- **Escala**: 1.125 (Tercera Mayor)
- **Encabezados**:
  - h1: 2.488rem
  - h2: 2.074rem
  - h3: 1.728rem
  - h4: 1.44rem
  - h5: 1.2rem
  - h6: 1rem

### Espaciado
- Unidad base: 0.25rem (4px)
- Escala: 0.25rem → 0.5rem → 0.75rem → 1rem → 1.5rem → 2rem → 2.5rem → 3rem → 4rem

## Patrones de Componentes

### Botones
- Primario: Botón sólido de alto contraste para acciones principales
- Secundario: Botón con borde para acciones secundarias
- Fantasma: Botón de bajo énfasis para acciones menos importantes
- Peligro: Botón rojo para acciones destructivas
- Tamaños: sm, md (predeterminado), lg

### Formularios
- Usar etiquetas apropiadas
- Agrupar campos relacionados
- Mostrar mensajes de validación claramente
- Usar tipos de entrada apropiados
- Deshabilitar botones de envío durante el envío

### Visualización de Datos
- Usar estilos de tabla consistentes
- Implementar estados de carga adecuados
- Mostrar estados vacíos cuando no hay datos disponibles
- Usar componentes de visualización de datos apropiados

### Navegación
- Mantener la navegación consistente
- Usar migas de pan para navegación profunda
- Resaltar la página/selección actual
- Usar etiquetas claras y descriptivas

## Estilo de Código

### Convenciones de Nombrado
- Componentes: PascalCase (ej. `PerfilUsuario`)
- Archivos: kebab-case (ej. `perfil-usuario.tsx`)
- Clases CSS: kebab-case (ej. `.perfil-usuario`)
- Variables/Funciones: camelCase
- Constantes: MAYÚSCULAS_CON_GUION_BAJO

### Estructura de Archivos
```
src/
  components/
    ui/              # Componentes UI reutilizables
    modules/         # Módulos de características
    layout/          # Componentes de diseño
  hooks/             # Hooks personalizados
  utils/             # Funciones de utilidad
  types/             # Tipos de TypeScript
  assets/            # Recursos estáticos
  styles/            # Estilos globales
```

### Estructura de Componentes
1. Importaciones (externas primero, luego internas)
2. Tipos/Interfaces
3. Definición del Componente
4. Subcomponentes (si los hay)
5. Estilos (o styled-components)
6. Exportaciones

## Mejores Prácticas
- Usar TypeScript para seguridad de tipos
- Mantener los componentes pequeños y enfocados
- Preferir composición sobre herencia
- Implementar límites de error adecuados
- Documentar los componentes de manera significativa
- Seguir el Principio de Responsabilidad Única
- Usar React.memo para optimización de rendimiento
- Implementar estados de carga adecuados
- Manejar errores de manera elegante
- Usar React.lazy para la división de código
- Implementar características de accesibilidad (a11y)
- Escribir pruebas unitarias para componentes críticos
