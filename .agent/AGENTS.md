# MultiStream-SceneIT - Root Agent Context

## Project Overview
MultiStream-SceneIT is a specialized Next.js application designed for managing and viewing multiple video streams (Kick, Twitch, etc.) in a customizable grid layout. It features real-time interactivity, chat integration, and a "Cinema Mode" for immersive viewing.

### Architecture
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion
- **State Management**: Zustand (persisted)
- **Real-time**: Pusher JS
- **Grid System**: React Grid Layout
- **Authentication**: Kick.com Integration (via Cookie/API)

## Project Culture (Non-negotiable)
1.  **Strict Typing**: No `any`. Define interfaces for all props and state.
2.  **Clean Imports**: Use `@/` aliases. Group imports by: External -> Internal Components -> Utils/Types -> Styles.
3.  **Component Structure**: PascalCase filenames. Named exports. Co-location of sub-components if tightly coupled.
4.  **State Management**: Complex global state goes to `store/` (Zustand). Local UI state stays in `useState`.
5.  **Performance**: Memoize heavy components (`React.memo`). Use `useCallback` for functions passed as props to grid items.
6.  **Aesthetics**: Premium feel. Smooth transitions (Framer Motion). Dark mode first.

## Agents & Sub-agents Registry
| Role | Context File | Responsibility |
|------|--------------|----------------|
| **Stream Expert** | `.agent/stream-expert.md` | Video players, stream controls, grid layout logic, and persistence. |
| **UI Designer** | `.agent/ui-designer.md` | Shared UI components (`components/ui`), animations, theming, and layout aesthetics. |
| **Backend Architect** | `.agent/backend-architect.md` | API routes (`app/api`), Auth integration (Kick), and external data fetching. |

## Autoinvoke Skills Section
- **Refactoring**: When keeping code clean or restructuring, invoking `refactor-component` skill is mandatory.
- **Committing**: All git commits must be generated using the `git-commit` skill to ensure conventional commits standard.
- **Testing**: (Future) `test-runner` skill for critical paths.
