---
name: refactor-component
description: Refactor a component to follow the Gentleman Programming standards.
trigger: /refactor
license: MIT
metadata:
  author: Gentleman Programmer
  version: 1.0.0
  scope: UI, Stream
autoinvoke: false
tools: [read_file, write_to_file, move_file]
---

# Refactor Component Skill

## Context
Refactoring is an art. We want small, focused components, co-located styles (if using modules/CSS-in-JS, but here we use Tailwind), and clear types.

## Workflow
1.  **Analyze**: Read the component file. Identify:
    - Huge `render` methods.
    - Inline types that should be exported.
    - `useEffect` spaghetti.
    - Hardcoded values.
2.  **Extract Types**: Move interfaces/types to a separate file if > 20 lines, or keep at top if small.
3.  **Extract Sub-components**:
    - If a part of the JSX is conditional or looped, it might need to be its own component.
    - Create a new file in the same directory (or a `parts/` subdirectory if multiple).
4.  **Extract Logic**:
    - Move complex state/effects to a custom hook `use[Feature]`.
5.  **Verify**: Ensure the original component imports the new parts and works exactly as before.

## Checklist
- [ ] Is the file under 150 lines?
- [ ] Are all props typed?
- [ ] Are `useCallback` and `useMemo` used for heavy props/computations?
- [ ] Is the naming PascalCase?
- [ ] Are imports sorted?
