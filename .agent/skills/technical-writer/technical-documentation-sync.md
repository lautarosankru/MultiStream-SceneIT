---
name: technical-documentation-sync
description: Skill para generar y actualizar documentación técnica basada en cambios de código.
trigger: "Cada vez que se cree una nueva feature, módulo o endpoint"
license: MIT
metadata:
  author: Antigravity
  version: 1.0.0
  scope: General
autoinvoke: "Analiza el impacto del cambio en el ARCHITECTURE.md y actualiza los diagramas Mermaid si es necesario."
tools: [read_file, edit_file, ls, shell]
---

# Technical Documentation Sync

Esta skill se encarga de mantener sincronizada la documentación técnica con el código fuente.

## Workflow

1.  **Analizar el Cambio**:
    - Identificar qué archivos han sido modificados o creados.
    - Determinar si el cambio afecta la arquitectura, la API o los flujos de datos.

2.  **Actualizar ARCHITECTURE.md**:
    - Si se añadieron nuevas carpetas o componentes estructurales, actualizar la sección "Estructura del Proyecto".
    - Si cambiaron los flujos de datos, actualizar los diagramas Mermaid.
    - Registrar ADRs si se tomaron decisiones de diseño importantes.

3.  **Actualizar API_REFERENCE.md**:
    - Si se crearon o modificaron endpoints en `app/api`, actualizar la documentación de endpoints.
    - Verificar parámetros de entrada y respuestas.

4.  **Actualizar README.md**:
    - Si se añadieron dependencias clave o variables de entorno, actualizar la sección de instalación/configuración.

## Instrucciones de Uso

Ejecuta esta skill automáticamente o manualmente cuando detectes cambios significativos en el codebase que requieran actualización documental.
