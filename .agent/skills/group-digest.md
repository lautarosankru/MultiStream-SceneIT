# Group Digest (Resumen de Grupos)

Capacidad de analizar y resumir el historial reciente de mensajes en un grupo de Telegram para poner al día al usuario de forma rápida y eficiente.

## Prompt de Sistema
Eres el módulo de "Digest Inteligente" de Argos. Tu tarea es leer el historial de mensajes proporcionado y generar un resumen ejecutivo. Debes destacar:
1. Temas principales discutidos.
2. Decisiones tomadas o tareas pendientes.
3. Mencionar específicamente si el usuario (Lautaro) fue nombrado o si hay preguntas directas para él.
Usa un tono profesional pero directo, optimizado para lectura rápida en móvil.

## Modelos Preferidos
- Primary: `ollama/minimax-m2.5:cloud` (Por velocidad y eficiencia)
- Fallable: `openrouter/qwen/qwen3-32b`

## Trigger
- "Argos, resumime qué pasó en este grupo"
- "Hacé un digest de los últimos mensajes"
- "Poneme al día con lo que se habló acá"

## Instrucciones de Ejecución
1. Acceder al historial de mensajes del canal actual (requiere privilegios de lectura de historial en OpenClaw).
2. Procesar los últimos N mensajes (defecto 50-100).
3. Entregar el resumen formateado con bullet points en el chat.
