# Estilo Estándar de Formularios - GAMMA Service ERP

## 🎨 Estructura del Modal

### Contenedor Principal
```tsx
<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
  <div className="glass-card-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    <div className="p-6">
      {/* Contenido del formulario */}
    </div>
  </div>
</div>
```

### Características del Estilo:
- **Fondo**: `bg-black/70 backdrop-blur-sm` (fondo negro con 70% opacidad + blur)
- **Contenedor**: `glass-card-strong` (efecto glass morphism fuerte)
- **Ancho máximo**: `max-w-2xl` (adaptable según contenido)
- **Altura máxima**: `max-h-[90vh]` con scroll automático
- **Padding**: `p-6` en el contenido interno
- **Z-index**: `z-50` para estar sobre todo

## 📝 Componentes del Formulario

### 1. Título
```tsx
<h3 className="text-white mb-4">
  {editing ? 'Editar [Entidad]' : 'Nuevo [Entidad]'}
</h3>
```

### 2. Campos de Formulario
Usar los componentes estandarizados:
- `FormInput` para campos de texto/número
- `FormSelect` para selectores
- `FormTextarea` para áreas de texto

### 3. Botones de Acción

#### Contenedor de Botones
```tsx
<div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
  <div className="flex space-x-3">
    {/* Botones izquierda (Cancelar, Anterior) */}
  </div>
  {/* Botones derecha (Siguiente, Guardar) */}
</div>
```

#### Botón Cancelar
```tsx
<button
  onClick={handleCancel}
  className="px-6 py-3 text-gray-200 bg-white/10 hover:bg-white/20 rounded-lg transition-all glass-hover border border-white/20"
>
  Cancelar
</button>
```

#### Botón Anterior (si aplica)
```tsx
<button
  onClick={handlePrev}
  className="px-6 py-3 text-orange-300 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg transition-all glass-hover border border-orange-500/30"
>
  Anterior
</button>
```

#### Botón Siguiente (si aplica)
```tsx
<button
  onClick={handleNext}
  className="px-6 py-3 btn-electric text-white rounded-lg transition-all glass-hover"
>
  Siguiente
</button>
```

#### Botón Guardar/Registrar
```tsx
<button
  onClick={handleSave}
  className="px-6 py-3 btn-emerald text-white rounded-lg transition-all glass-hover"
>
  {editing ? 'Actualizar' : 'Registrar'}
</button>
```

## 🎯 Clases CSS Utilizadas

### Efectos Glass Morphism
- `glass-card-strong`: Efecto glass fuerte para modales
- `glass-hover`: Efecto hover con transición suave
- `glass-content`: Contenido con efecto glass ligero

### Botones
- `btn-electric`: Botón naranja con gradiente (acción principal)
- `btn-emerald`: Botón verde con gradiente (guardar/confirmar)
- `btn-primary`: Botón primario estándar

### Efectos Visuales
- `backdrop-blur-sm`: Blur suave en el fondo
- `transition-all`: Transiciones suaves en todos los cambios
- `glow-orange`: Efecto de brillo naranja

## 📋 Patrón de Implementación

### Paso 1: Estructura del Modal
```tsx
{showModal && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="glass-card-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        {/* Contenido */}
      </div>
    </div>
  </div>
)}
```

### Paso 2: Título y Contenido
```tsx
<h3 className="text-white mb-4">
  {editing ? 'Editar' : 'Nuevo'} [Entidad]
</h3>

<div className="space-y-4">
  {/* Campos del formulario usando FormInput, FormSelect, FormTextarea */}
</div>
```

### Paso 3: Botones de Acción
```tsx
<div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
  <button className="px-6 py-3 text-gray-200 bg-white/10 hover:bg-white/20 rounded-lg transition-all glass-hover border border-white/20">
    Cancelar
  </button>
  <button className="px-6 py-3 btn-emerald text-white rounded-lg transition-all glass-hover">
    Guardar
  </button>
</div>
```

## 🔄 Módulos a Actualizar

- [x] SalesModule (referencia)
- [ ] ClientsModule
- [ ] VehiclesModule
- [ ] BillingModule
- [ ] HRModule
- [ ] WorkshopModule
- [ ] FinancingModule
- [ ] PlatesModule
- [ ] InventoryModule
- [ ] PurchasesModule
- [ ] CRMModule
- [ ] DIANModule
- [ ] UserRolesModule

## 💡 Notas Importantes

1. **Mantener campos requeridos**: No eliminar campos necesarios de cada módulo
2. **Validaciones**: Conservar todas las validaciones existentes
3. **Responsive**: El diseño debe funcionar en móvil y desktop
4. **Accesibilidad**: Mantener labels y aria-labels
5. **Consistencia**: Todos los modales deben verse iguales
