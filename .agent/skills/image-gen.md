---
name: image-gen
description: Genera imágenes artísticas y fotorrealistas utilizando el modelo Flux Klein de Pollinations.
---

# SKILL: Generación de Imágenes (Flux Klein)

Esta habilidad permite a Argos generar imágenes de alta calidad mediante la API de Pollinations utilizando el modelo `klein-large`.

## Trigger
Usar cuando el usuario pida:
- "Generá una imagen de..."
- "Dibujá..."
- "Imaginá..."
- "Haceme un diseño de..."

## Parámetros del Modelo
- **Model**: `klein-large`
- **Resolution**: 1024x1024 (default)
- **Features**: `nologo=true`, `enhance=true`

## Instrucciones de Ejecución

Para generar la imagen, se debe ejecutar un comando `curl` que descargue la imagen a la carpeta de medios de OpenClaw y luego presentar el resultado.

### Comandos de Ejecución

1. **Generar':** Descargar la imagen a la carpeta temporal.
```bash
OUTPUT_FILE="/home/lautarosanchez/.openclaw/media/outbound/generated_$(date +%s).jpg" && \
curl -s -L -H "Authorization: Bearer sk_k5h6ugMCSCekEYBbNF4QEeNRPZWSZn9m" \
-o "$OUTPUT_FILE" \
"https://gen.pollinations.ai/image/{prompt_escaneado}?model=klein-large&width=1024&height=1024&nologo=true&enhance=true"
```

2. **Enviar':** Usar el CLI de OpenClaw para mandar la imagen al chat.
```bash
openclaw message send --channel telegram --target "@ArgosSKU_Bot" --media "$OUTPUT_FILE" --message "¡Acá tenés la imagen que me pediste!"
```

### Consideraciones
1.  **Escapado**: El prompt debe estar codificado para URL.
2.  **Destinatario**: El `--target` debe ser el ID o username del chat actual (Argos suele detectarlo, pero se puede usar `@ArgosSKU_Bot` como referencia o el ID dinámico si está disponible).
3.  **Ruta**: Guardar siempre en `/home/lautarosanchez/.openclaw/media/outbound/`.

## Ejemplo de uso
Usuario: "Argos, dibujame un robot tomando mate"
Acción: Ejecutar curl, luego ejecutar `openclaw message send` con el archivo resultante.
