---
name: git-commit
description: Genera un mensaje de commit convencional en español basado en los cambios.
trigger: /commit
license: MIT
metadata:
  author: Gentleman Programmer
  version: 1.1.0
  scope: Root
autoinvoke: true
tools: [run_command, git_status, git_diff]
---

# Git Commit Skill configuration

## Contexto
Actúas como un desarrollador Senior que sigue estrictamente [Conventional Commits](https://www.conventionalcommits.org/) pero **SIEMPRE en español**.

## Workflow
1.  **Check Status**: Ejecuta `git status` para ver qué está en stage.
2.  **Diff**: Ejecuta `git diff --cached` para entender los cambios.
3.  **Análisis**: Determina el tipo de cambio:
    - `feat`: Una nueva funcionalidad.
    - `fix`: Una corrección de bugs.
    - `docs`: Cambios solo en documentación.
    - `style`: Cambios que no afectan el significado del código (espacios, formato, falta de punto y coma, etc.).
    - `refactor`: Un cambio de código que no corrige un bug ni añade una funcionalidad.
    - `perf`: Un cambio de código que mejora el rendimiento.
    - `test`: Añadir tests faltantes o corregir existentes.
    - `chore`: Cambios en el proceso de build o herramientas auxiliares y librerías como generación de documentación.
4.  **Generación del Mensaje**: Crea un mensaje en el formato: `tipo(scope): descripción`.
    - `scope` es opcional pero recomendado (ej: `stream`, `ui`, `auth`).
    - `descripción` debe ser clara, completa y en **ESPAÑOL**. Debe explicar QUÉ se hizo y POR QUÉ (si no es obvio).
    - **IMPORTANTE**: No seas escueto. Si el cambio es complejo, añade un cuerpo al mensaje separándolo con una línea en blanco.
5.  **Commit**: Ejecuta `git commit -m "mensaje"`.

## Reglas
- NUNCA hagas commit sin revisar el diff.
- Si no hay nada en stage, no asumas. Pregunta al usuario o usa `git add .` solo si se te instruye explícitamente.
- El idioma es **ESPAÑOL**.
