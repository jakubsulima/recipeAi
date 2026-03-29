# Project Guidelines

## Architecture
- Monorepo with Spring Boot backend in `backendApi/` and React frontend in `frontend/recipeai/`.
- Keep changes scoped to the requested layer unless explicitly asked to touch both layers.
- If API contracts change, update only directly impacted frontend/backend paths together.
- For full setup, architecture, and API endpoints, see `README.md`.

## Build and Test
- Frontend uses `yarn` (not npm): `yarn install`, `yarn dev`, `yarn test`, `yarn build`.
- Backend uses Gradle wrapper: `./gradlew test` for the smallest useful validation first.
- Expand validation only as needed for the task; do not fix unrelated failing tests.
- Quick local validation defaults:
	- Frontend: `yarn build`
	- Backend: `./gradlew test`
- For environment setup and Docker flows, see `README.md`.

## Conventions

### Default Working Style
- Prefer small, surgical edits over broad refactors.
- Fix root cause; avoid workaround-only patches.
- Do not modify unrelated files.
- Keep naming and patterns consistent with nearby code.
- Ask before introducing new dependencies.

### Frontend
- TypeScript-first; avoid `any` unless unavoidable.
- Reuse existing components, hooks, and constants before adding new ones.
- Keep props and state explicit and readable.
- Follow existing Tailwind patterns and shared theme usage.
- For color tokens and usage, see `frontend/recipeai/COLOR_SCHEME_GUIDE.md`.

### Backend
- Follow existing package boundaries: controllers, services, repositories, dto, mappers, entities, config.
- Keep controllers thin; centralize business logic in services.
- Reuse existing MapStruct mapper and DTO patterns.
- Keep Flyway migrations additive and safe.

## Project-Specific Pitfalls
- JWT secret must be configured and at least 32 characters for backend startup.
- Be profile-aware: dev defaults differ from prod (database and Flyway behavior).
- Local backend compile issues on newer JDKs can be Lombok/JDK mismatch rather than app logic errors.

## When to Ask Questions
Ask before implementing if:
- Requirements are ambiguous or UI behavior is not explicitly defined.
- A database schema change could affect existing data.
- Security or auth behavior may change.
- A new dependency or library is required.

When asking, include a recommended default option.
