# YouTube Embed Player Documentation

## URL Base
`https://www.youtube-nocookie.com/embed/`

## Parámetros de Calidad
- `vq`: (Sugerencia) `hd1080`, `hd720`, `large` (480p), `medium` (360p), `small` (240p).
*Nota: YouTube ignora este parámetro si el player es pequeño.*

## Parámetros de Seguridad y API
- `origin`: Dominio base para seguridad de la API.
- `enablejsapi`: `1` para habilitar control externo.

## Requerimientos de Grilla
- Aspect Ratio: **16:9**.
- Para 1080p, YouTube requiere un ancho de iFrame significativo (aprox >1280px para HD).

## Implementación
Ver `components/stream/embeds/YouTubeEmbed.tsx`.
Uso recomendado:
```ts
const src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&vq=hd1080&origin=${window.location.origin}`;
```
