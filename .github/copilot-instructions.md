# Copilot Working Guide for RecipeAI

## Goal
Help Copilot make fast, minimal, and correct changes in this repository with fewer clarification rounds.

## Project Snapshot
- Monorepo with:
  - `backendApi/`: Spring Boot (Java 17, Gradle, Flyway, PostgreSQL)
  - `frontend/recipeai/`: React + TypeScript + Vite + Tailwind
  - root `docker-compose.yml` for local full-stack run
- Keep changes scoped to the requested layer unless explicitly asked to touch both frontend and backend.

## Default Working Style
- Prefer **small, surgical edits** over refactors.
- Fix root cause; avoid workaround-only patches.
- Do not modify unrelated files.
- Keep naming and patterns consistent with nearby code.
- Ask before introducing new dependencies.

## What to Do First (per task)
1. Confirm target area (`backendApi` / `frontend/recipeai` / infra).
2. Read nearest related files and existing patterns before editing.
3. Implement minimal change.
4. Run focused validation for changed area.
5. Summarize exactly what changed and where.

## Validation Commands
### Backend (`backendApi/`)
- Run tests: `./gradlew test`
- Run app: `./gradlew bootRun`
- Build: `./gradlew build`

### Frontend (`frontend/recipeai/`)
- Install: `npm install`
- Dev server: `npm run dev`
- Tests: `npm test`
- Build: `npm run build`

## Change Boundaries
- Frontend-only request: do not edit backend unless blocked and explained.
- Backend-only request: do not edit frontend unless contract changes require it.
- If API contract changes, update both sides only for directly impacted paths.

## Code Preferences
### Frontend
- TypeScript-first; avoid `any` unless unavoidable.
- Reuse existing components/hooks/constants before adding new ones.
- Keep component props and state explicit and readable.
- Follow current Tailwind and component structure.

### Backend
- Follow existing package structure (`controllers`, `services`, `repositories`, `dto`, etc.).
- Keep controller thin and service logic centralized.
- Reuse existing mappers/DTO patterns.
- Keep Flyway migrations additive and safe.

## Testing Preference
- Start with the smallest relevant tests first.
- Expand to broader tests only if needed.
- Do not attempt to fix unrelated failing tests in the same run.

## When Copilot Should Ask Questions
Ask before implementing if any of these are true:
- Requirement is ambiguous and has multiple valid outcomes.
- UI/UX behavior is not explicitly defined.
- Database schema change may affect existing data.
- Security/auth behavior could change.
- New dependency/library is required.

When asking, include a recommended default option.

## Response Preference
For each completed task, provide:
- files changed
- short rationale
- validation run and result
- any assumptions or follow-up choices

## Nice-to-Have Task Template (user can paste)
```
Task:
Scope: frontend | backend | full-stack
Constraints:
Acceptance criteria:
Out of scope:
Validation to run:
```
