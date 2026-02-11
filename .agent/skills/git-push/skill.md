---
name: git-push
description: Sube los cambios al repositorio remoto de manera segura.
trigger: /push
license: MIT
metadata:
  author: Gentleman Programmer
  version: 1.0.0
  scope: Root
autoinvoke: false
tools: [run_command]
---

# Git Push Skill Configuration

## Contexto
Subir cambios requiere verificar que estamos en la rama correcta y que tenemos los últimos cambios del remoto para evitar conflictos.

## Workflow
1.  **Verificar Rama**: Ejecuta `git branch --show-current` para saber dónde estás.
2.  **Pull (Opcional)**: Si es un equipo compartido, considera hacer `git pull --rebase` antes (o pregunta). Para este entorno personal, direct push suele ser seguro.
3.  **Push**: Ejecuta `git push`.
    - Si la rama no tiene upstream, usa `git push --set-upstream origin <rama>`.

## Reglas
- Confirma siempre la rama antes de pushear.
- Si hay error de "rejected", NO fuerces (`--force`) a menos que el usuario lo pida explícitamente.
