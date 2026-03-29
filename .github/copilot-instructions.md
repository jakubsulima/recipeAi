# Project Guidelines

## Architecture & Stack
- **Monorepo**: Spring Boot backend (`backendApi/`) and React frontend (`frontend/recipeai/`).
- For full stack details, setup instructions, and database schemas, see `README.md`.
- Keep changes scoped to the requested layer unless explicitly asked to touch both frontend and backend.
- If API contract changes, update both sides only for directly impacted paths.

## Build and Test
See `README.md` for standard commands.
- **Frontend Override**: Use `yarn` instead of `npm` for all frontend commands (e.g. `yarn install`, `yarn dev`, `yarn test`, `yarn build`), adhering to user preferences.
- **Backend Preferences**: Start with the smallest relevant tests (`./gradlew test`) first. Expand validation if needed, but do not fix unrelated failing tests.

## Conventions

### Default Working Style
- Prefer **small, surgical edits** over refactors.
- Fix root cause; avoid workaround-only patches.
- Do not modify unrelated files.
- Keep naming and patterns consistent with nearby code.
- Ask before introducing new dependencies.

### Frontend (`frontend/recipeai/`)
- TypeScript-first; avoid `any` unless unavoidable.
- Reuse existing components/hooks/constants before adding new ones.
- Keep component props and state explicit and readable.
- Follow current Tailwind and component structure.

### Backend (`backendApi/`)
- Follow existing package structure (`controllers`, `services`, `repositories`, `dto`).
- Keep controller thin and service logic centralized.
- Reuse existing mappers/DTO patterns.
- Keep Flyway migrations additive and safe.

### When to Ask Questions
Ask before implementing if:
- Requirement is ambiguous or UI/UX behavior is not explicitly defined.
- Database schema change may affect existing data.
- Security/auth behavior could change.
- New dependency/library is required.

*When asking, always include a recommended default option.*
