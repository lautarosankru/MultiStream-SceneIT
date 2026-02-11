---
name: test-runner
description: Run tests for specific components or modules.
trigger: /test
license: MIT
metadata:
  author: Gentleman Programmer
  version: 1.0.0
  scope: Root
autoinvoke: false
tools: [run_command]
---

# Test Runner Skill

## Context
We need to ensure reliability. While we don't have a full CI/CD yet, we can run local tests.

## Workflow
1.  **Identify Scope**: Are we testing a specific file or the whole project?
2.  **Run Command**:
    - Project: `npm test` (or `npm run test`)
    - File: `npm test -- <filename>`
3.  **Analyze Output**:
    - If pass: Great!
    - If fail: Read the error, identify the regression, fix it.

## Future
- Integrate Playwright for E2E.
- Integrate Vitest for Unit.
