# SPEC.md - URLs Amigables para Multistreams

## Objetivo
Crear links tipo `sceneit.online/coscu/coker/goncho/duendepablo` que permitan compartir y acceder a multistreams de forma simple y memorable.

---

## 1. Estructura de URL

### Formato
```
/[streamer1]/[streamer2]/[streamer3]
```

### Reglas
- **Orden flexible**: `/coscu/coker` = `/coker/coscu`
- **Separador**: `/` (slash)
- **Case insensitive**: `CosCu` = `coscu` = `COSCU`
- **Plataformas**: Soporte para múltiples plataformas en la misma URL
  - Formato extendido opcional: `/kick/coscu/twitch/xQc`
  - Notación: `[plataforma]/[username]`

### Propuesta de Formato Final
```
# Simple (same platform - infer platform from first streamer)
sceneit.online/coscu/coker/goncho

# Extended (explicit platform)
sceneit.online/kick/coscu/twitch/xQc/youtube/livecodinger
```

**Decisión**: Usar formato extendido por defecto para evitar ambigüedades entre plataformas.

---

## 2. Backend

### 2.1 Nueva Ruta: `[...slugs]`
**Ubicación**: `app/[...slugs]/page.tsx`

```typescript
// app/[...slugs]/page.tsx
// Captura: ['kick/coscu', 'twitch/xQc', 'goncho']
// Parsea y valida cada streamer
```

### 2.2 API: Validación de Streamers
**Endpoint existente**: `/api/kick/[slug]` ✅

**Nuevos endpoints necesarios**:

```typescript
// GET /api/streamers/validate?platform=kick&username=coscu
// Valida que un streamer existe y está activo
// Response: { valid: true, platform: 'kick', username: 'coscu', isLive: boolean }
```

```typescript
// GET /api/streamers/batch
// Valida múltiples streamers en una llamada
// Body: { streamers: ['kick/coscu', 'twitch/xQc'] }
// Response: { results: [{ platform, username, valid, isLive, avatar, displayName }] }
```

### 2.3 API: Guardar/Recuperar Multistreams
**Opcional - Fase 2**

```typescript
// POST /api/multistreams
// Guardar un multistream creado
// Body: { name: string, streamers: [{ platform, username }], layout?:压缩 }
```

```typescript
// GET /api/multistreams/popular
// Obtener multistreams más usados
// Response: { multistreams: [{ id, name, streamerCount, usageCount }] }
```

---

## 3. Frontend

### 3.1 Router Dinámico

**Archivo**: `app/[...slugs]/page.tsx`

```typescript
// Server Component que:
// 1. Extrae los slugs de la URL
// 2. Valida cada streamer con la API
// 3. Genera el layout inicial
// 4. Renderiza el SceneGrid con los items

// Si todos válidos → Muestra multistream
// Si algunos inválidos → Muestra error parcial con los válidos
// Si todos inválidos → Redirecciona a página principal
```

### 3.2 Loading State
- **Skeleton UI**: Mostrar placeholders mientras carga la validación de streamers
- **Progreso**: Indicador de streamers validados (e.g., "2/4 streamers validados")
- **Timeout**: 10s máximo por streamer

### 3.3 Share Button
**Mejorar componente existente**: `components/grid/ShareButton.tsx`

- **Para multistreams de URL**: Mostrar la URL amigable si está disponible
- **Fallback**: Mantener el método actual con `?layout=compressed`
- **Botón copiar**: Un solo click para copiar al clipboard
- **QR Code**: Opcional - generar QR para compartir en móvil

---

## 4. Features

### 4.1 Guardar Multistreams (Fase 2)
- Botón "Guardar Multistream" en el header
- Modal para nombrar el multistream
- Persistencia en base de datos (supabase/postgres)
- Lista de "Mis Multistreams" en sidebar

### 4.2 Multistreams Populares (Fase 2)
- Endpoint `/api/multistreams/popular`
- Mostrar en EmptyState o página de inicio
- Cache con revalidación cada hora

### 4.3 Metadatos Open Graph
**Archivo**: `app/[...slugs]/layout.tsx` o `page.tsx`

```typescript
export async function generateMetadata({ params }) {
  const streamers = await parseSlugs(params.slugs)
  
  return {
    title: `${streamers.map(s => s.displayName).join(' + ')} | SceneIt`,
    description: `Watch ${streamers.length} streamers at once`,
    openGraph: {
      title: `Multistream | ${streamers.map(s => s.displayName).join(' + ')}`,
      images: ['/og-multistream.png'], // Dynamic OG image
    },
    twitter: {
      card: 'summary_large_image',
    }
  }
}
```

**OG Image dinámica**: Usar `@vercel/og` para generar imagen con los avatares de los streamers.

---

## 5. Flujo de Usuario

```
1. Usuario visita sceneit.online/coscu/coker/goncho
   
2. Server Component [slug] captura los slugs
   
3. API /api/streamers/batch valida todos:
   - kick/coscu → { valid: true, isLive: true, avatar, displayName }
   - twitch/coker → { valid: true, isLive: true, avatar, displayName }
   - kick/goncho → { valid: false, error: 'Channel not found' }
   
4. Si hay errores parciales:
   - Mostrar toast: "El streamer goncho no existe"
   - Renderizar solo los válidos
   
5. SceneGrid se carga con los items válidos

6. Usuario puede:
   - Agregar/remove streamers
   - Reordenar el layout
   - Click "Share" → Copia la URL actual
```

---

## 6. Implementación - Fases

### Fase 1: MVP (Core)
- [ ] Crear `app/[...slugs]/page.tsx`
- [ ] Crear API `/api/streamers/validate`
- [ ] Crear API `/api/streamers/batch`
- [ ] Integrar con SceneGrid existente
- [ ] Loading state con skeletons
- [ ] Mejorar ShareButton

### Fase 2: Social
- [ ] Open Graph metadata
- [ ] OG Image dinámica con avatares
- [ ] Botón "Guardar Multistream"
- [ ] Endpoint `/api/multistreams` (POST/GET)

### Fase 3: Extras
- [ ] Multistreams populares
- [ ] Búsqueda de streamers
- [ ] Historial de multistreams visitados

---

## 7. Consideraciones Técnicas

### 7.1 Manejo de Errores
- **Streamer no existe**: Mostrar en UI, permitir continuar con los válidos
- **Rate limiting**: Cachear validaciones por 5 min
- **Timeout**: 10s por request de validación

### 7.2 SEO
- URLs amigables son indexables
- Meta tags dinámicos para compartir
- Server Components para mejor SSR

### 7.3 Performance
- Validación en paralelo (Promise.all)
- Cache en Redis o memoria para validaciones frecuentes
- Lazy load de iframes (intersection observer)

---

## 8. Archivos a Modificar/Crear

```
app/
├── [..slugs]/                    # NUEVO
│   ├── page.tsx                  # Server Component
│   └── layout.tsx                # OG Metadata
├── api/
│   └── streamers/
│       ├── validate/route.ts     # GET - valida 1 streamer
│       └── batch/route.ts        # POST - valida múltiples
│
components/
├── grid/
│   └── ShareButton.tsx           # MEJORAR - URL amigable
│
lib/
├── streamers.ts                  # NUEVO - lógica de parseo
│
types/
└── streamer.ts                   # NUEVO - tipos para streamer
```

---

## 9. Ejemplos de Uso

| URL | Resultado |
|-----|-----------|
| `/coscu` | 1 streamer (Kick por defecto) |
| `/coscu/coker` | 2 streamers (misma plataforma) |
| `/kick/coscu/twitch/coker` | 2 plataformas diferentes |
| `/kick/coscu/twitch/xQc/youtube/livecodinger` | 4 streamers, 3 plataformas |

---

## 10. Backward Compatibility

- Mantener `?layout=compressed` funcionando
- ShareButton: Preferir URL amigable si aplica, sino usar compresión
- Si URL amigable no se puede generar (e.g., custom layouts), usar método actual
