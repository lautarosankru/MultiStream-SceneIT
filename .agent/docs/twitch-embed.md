# Twitch Embed Player Documentation

## URL Base
`https://player.twitch.tv/`

## Parámetros Requeridos
- `parent`: (Requerido) Dominio donde se aloja el embed. Ejemplo: `localhost` o `scene-it.com`.
- `channel`: Nombre del canal a mostrar.

## Parámetros Opcionales
- `autoplay`: `true` (default) o `false`.
- `muted`: `true` o `false`.
- `quality`: Sugerencia de calidad. Valores: `chunked` (Source), `high` (720p60), `medium`, `low`, `mobile`.
- `time`: Timestamp (ej: `1h2m3s`).

## Requerimientos de Grilla
- Para 1080p nativo, el iFrame debe tener un ancho de al menos 1920px (o escalar adecuadamente).
- Aspect Ratio: **16:9**.

## Implementación en el Proyecto
Ver `components/stream/embeds/TwitchEmbed.tsx`.
Se debe asegurar que el parámetro `parent` se detecte dinámicamente:
```ts
const parent = window.location.hostname;
const src = `https://player.twitch.tv/?channel=${id}&parent=${parent}&quality=chunked&autoplay=true`;
```
