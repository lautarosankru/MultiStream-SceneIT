# SPEC: Sistema de Layouts de Grilla - MultiStream SceneIt

## 1. Overview

Este documento especifica el diseño e implementación de un nuevo sistema de layouts para MultiStream SceneIt, permitiendo dos modos:
- **Auto Grid** (actual): Organización automática en grilla uniforme
- **Spotlight**: Un stream principal ocupa 60-70% de la pantalla, los demás se distribuyen en un grid secundario

---

## 2. Estado Actual del Código

### 2.1 Componentes Clave

| Archivo | Propósito |
|---------|-----------|
| `components/grid/SceneGrid.tsx` | Grid principal con react-grid-layout (12 cols, 24 rows) |
| `store/useSceneStore.ts` | Zustand store con estado de items y funciones |
| `types/scene.ts` | Tipos `StreamItem`, `StreamLayout`, `ItemType` |
| `app/page.tsx` | Página principal con botones de control |

### 2.2 Estado Actual del Store

```typescript
interface SceneState {
    items: StreamItem[];
    isLocked: boolean;
    isDragging: boolean;
    // ... chat state
    autoLayout: () => void;  // ← Solo existe esta función
}
```

### 2.3 Función autoLayout Actual

Localizada en `useSceneStore.ts:133-175`:
- Calcula w/h basado en cantidad de items
- Organiza en grid uniforme (ej: 2 items → 6 cols cada uno)
- No considera "stream principal"

---

## 3. Nuevo Sistema de Layouts

### 3.1 Estados del Store (Nuevos Campos)

```typescript
type LayoutMode = 'auto' | 'spotlight';

interface SceneState {
    // ... campos existentes
    
    // NUEVOS CAMPOS
    layoutMode: LayoutMode;        // 'auto' | 'spotlight'
    mainStreamId: string | null;   // ID del stream destacado
    
    // ACCIONES NUEVAS
    setLayoutMode: (mode: LayoutMode) => void;
    setMainStream: (id: string | null) => void;
    spotlightLayout: () => void;    // Calcula posiciones para spotlight
}
```

### 3.2 Modo Auto Grid (Actual Mejorado)

Mantiene el comportamiento actual con posibles mejoras opcionales:
- **Grid uniforme**: Todos los streams del mismo tamaño
- **Distribución**: Basada en cantidad de items (ver tabla)

| Items | Columns | Rows |
|-------|---------|------|
| 1 | 12 | 24 |
| 2 | 6 | 24 |
| 3-4 | 6 | 12 |
| 5-6 | 4 | 12 |
| 7-9 | 4 | 8 |
| 10+ | 3 | 8 |

### 3.3 Modo Spotlight (Nuevo)

**Distribución visual:**
```
┌─────────────────────────────────────────────┐
│                                             │
│              STREAM PRINCIPAL               │
│            (60-70% del espacio)              │
│                                             │
├──────────────────┬──────────────────────────┤
│    Stream 2      │       Stream 3           │
│   (mini grid)    │       (mini grid)       │
├──────────────────┼──────────────────────────┤
│    Stream 4      │       Stream 5 (+)       │
│   (mini grid)    │       (mini grid)       │
└──────────────────┴──────────────────────────┘
```

**Cálculo de posiciones (grid 12x24):**

```
MAIN STREAM:
- x: 0
- y: 0  
- w: 8 (66%)
- h: 24 (full height)

SECONDARY GRID (4 columnas, 2 rows):
- Total space: x=8, w=4, h=24
- Secondary items distributed in 2-row grid:
  - 2 items: 4x12 each
  - 3+ items: 2x8 each (wrapped)
```

**Lógica de fallback:**
- Si no hay mainStreamId → usar primer item como principal
- Si mainStreamId no existe en items → resetear a null
- Si solo 1 item → modo spotlight = mismo que auto (12x24)

---

## 4. UI/UX Specification

### 4.1 Toggle Button (Header)

Ubicación: Near "Auto Layout" button in header

```tsx
// Componente: LayoutModeToggle
<ButtonGroup>
  <Tooltip>
    <Button 
      variant={layoutMode === 'auto' ? 'default' : 'ghost'}
      onClick={() => setLayoutMode('auto')}
    >
      <LayoutGrid className="h-4 w-4" />
      <span className="hidden sm:inline">Auto Grid</span>
    </Button>
  </Tooltip>
  <Tooltip>
    <Button 
      variant={layoutMode === 'spotlight' ? 'default' : 'ghost'}
      onClick={() => setLayoutMode('spotlight')}
    >
      <Spotlight className="h-4 w-4" />
      <span className="hidden sm:inline">Spotlight</span>
    </Button>
  </Tooltip>
</ButtonGroup>
```

### 4.2 Selector de Stream Principal (Modo Spotlight)

**En cada StreamWrapper:**
- Click en el stream lo establece como principal
- Indicador visual de "MAIN" (badge/overlay)
- Solo funciona cuando `layoutMode === 'spotlight'`

```tsx
// En StreamWrapper.tsx (modificado)
{layoutMode === 'spotlight' && (
    <div 
        className={cn(
            "absolute top-2 left-2 z-50 px-2 py-1 rounded-md text-xs font-bold",
            isMain 
                ? "bg-amber-500 text-white shadow-lg" 
                : "bg-black/50 text-white/70 opacity-0 group-hover:opacity-100 cursor-pointer"
        )}
        onClick={(e) => {
            e.stopPropagation();
            setMainStream(item.id);
        }}
    >
        {isMain ? "★ MAIN" : "Click to set as main"}
    </div>
)}
```

### 4.3 Transiciones

- **Cambio de modo**: Animación suave de 300ms
- **Cambio de main stream**: Reposicionamiento con transición CSS

---

## 5. Plan de Implementación

### Fase 1: Store y Tipos

1. **Agregar tipos** en `types/scene.ts`:
   ```typescript
   export type LayoutMode = 'auto' | 'spotlight';
   ```

2. **Actualizar store** en `store/useSceneStore.ts`:
   - Agregar `layoutMode: 'auto'` (default)
   - Agregar `mainStreamId: null`
   - Agregar `setLayoutMode`
   - Agregar `setMainStream`
   - Crear `spotlightLayout()` function
   - Modificar `autoLayout()` para respetar `layoutMode`

### Fase 2: Componente SceneGrid

1. **Detectar cambio de modo**:
   ```tsx
   const { layoutMode, mainStreamId, items } = useSceneStore()
   
   const layouts = useMemo(() => {
       if (layoutMode === 'spotlight') {
           return calculateSpotlightLayout(items, mainStreamId)
       }
       return calculateAutoLayout(items)
   }, [layoutMode, mainStreamId, items])
   ```

2. **Crear funciones de cálculo** (nuevo archivo `utils/layoutCalculator.ts`):
   - `calculateSpotlightLayout(items, mainStreamId)`
   - `calculateAutoLayout(items)` (refactor del actual)

### Fase 3: UI de Controles

1. **Crear** `components/grid/LayoutModeToggle.tsx`
2. **Modificar** `app/page.tsx` para incluir el toggle
3. **Modificar** `StreamWrapper.tsx` para mostrar indicador de "MAIN"

### Fase 4: Persistencia

- El nuevo estado debe persistir en localStorage
- Ya existe persist middleware en Zustand, solo agregar los campos

---

## 6. Archivos a Modificar

| Archivo | Acción |
|---------|--------|
| `types/scene.ts` | Agregar `LayoutMode` type |
| `store/useSceneStore.ts` | Agregar estado y acciones |
| `components/grid/SceneGrid.tsx` | Adaptar layouts según modo |
| `components/grid/LayoutModeToggle.tsx` | **NUEVO** |
| `components/stream/StreamWrapper.tsx` | Agregar indicador visual |
| `app/page.tsx` | Incluir LayoutModeToggle |
| `lib/layoutCalculator.ts` | **NUEVO** (helper functions) |

---

## 7. Consideraciones Técnicas

### 7.1 React Grid Layout

- El componente `Responsive` acepta layouts dinámicos
- Cuando cambia `layoutMode`, regenerar el layout completo
- Mantener `isLocked` funcionando en ambos modos

### 7.2 Performance

- Usar `useMemo` para evitar recálculos excesivos
- Solo recalcular cuando cambie: `layoutMode`, `mainStreamId`, o `items.length`

### 7.3 Persistencia

```typescript
// En useSceneStore persist config
{
    name: 'scene-storage',
    partialize: (state) => ({ 
        items: state.items, 
        layoutMode: state.layoutMode,      // NUEVO
        mainStreamId: state.mainStreamId,  // NUEVO
        // ... otros campos
    }), 
}
```

---

## 8. Future Enhancements (Out of Scope)

- [ ] Personalización de proporción spotlight (70/30, 60/40)
- [ ] Posición del main stream (izquierda/derecha/arriba)
- [ ] Animaciones más elaboradas
- [ ] Presets de layout (custom named layouts)
- [ ] Guardar/cargar layouts

---

## 9. Testing Checklist

- [ ] Toggle entre Auto y Spotlight funciona
- [ ] Click en stream lo establece como principal
- [ ] Cambio de main stream reposiciona correctamente
- [ ] Persistencia en refresh de página
- [ ] Modo locked deshabilita interactividad
- [ ] Funciona con 1, 2, 3, 5, 10+ streams
- [ ] Responsive en diferentes breakpoints

---

*Documento generado: 2026-02-15*
*Proyecto: MultiStream SceneIt*
