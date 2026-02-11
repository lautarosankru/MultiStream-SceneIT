# Layout and Aspect Ratio Logic

## Aspect Ratio 16:9 (Matemática de Grilla)
Para evitar barras negras, el contenedor del iFrame debe ser exactamente 16:9. Dado que usamos `react-grid-layout`, las dimensiones son celdas (`w`, `h`).

### Constantes del Sistema
- `margin`: 10px
- `rowHeight`: 30px
- `cols`: 12

### Fórmulas de Conversión
1. **Ancho Real (px)**: `realW = w * colWidth + (w - 1) * margin`
2. **Altura Real deseada (px)**: `idealH_px = realW * (9 / 16)`
3. **Altura en Grilla (h)**: `h = (idealH_px + margin) / (rowHeight + margin)`

### Implementación de Snapping
En `onResize`, se debe interceptar el cambio y forzar `newItem.h` usando esta fórmula.

## Ordenado Automático (Auto-Layout)
Algoritmo para organizar los streams de forma óptima:
1. **1 Stream**: Ocupar `w: 12`, calcular `h` para 16:9.
2. **2 Streams**: `w: 6` cada uno, calcular `h`.
3. **3-4 Streams**: `w: 6` cada uno (grilla 2x2).
4. **5-6 Streams**: `w: 4` cada uno.

Se debe implementar una función `autoLayout()` en el store que recalcule `x`, `y`, `w`, `h` para todos los items basado en el conteo total.

## Resolución 1080p
Para forzar 1080p:
- El iFrame debe tener un ancho real en píxeles de al menos 1280px (mejor 1920px).
- Inyectar parámetros de URL según la plataforma (ver docs de cada una).
