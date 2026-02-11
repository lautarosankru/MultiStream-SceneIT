# Kick Embed Player Documentation

## URL Base
`https://player.kick.com/`

## Parámetros Soportados
- `autoplay`: `true` o `false`.
- `muted`: `true` o `false`.

## Calidad y Resolución
No existe un parámetro oficial de URL para forzar 1080p. El player de Kick utiliza un algoritmo de bitrate adaptativo (ABR) que depende del:
1. Ancho de banda del usuario.
2. Tamaño del contenedor iFrame.
3. Decodificación de hardware disponible.

Para maximizar la probabilidad de 1080p:
- El contenedor DEBE tener una relación de aspecto **16:9**.
- Se recomienda que el iFrame ocupe el 100% de su contenedor sin padding interno.

## Aspect Ratio 16:9
El player de Kick añade barras negras internas si el contenedor no es exactamente 16:9.
Fórmula de ajuste en grilla: `h = (realW * 0.5625 + margin) / (rowHeight + margin)`.

## Implementación
Ver `components/stream/embeds/KickEmbed.tsx`.
