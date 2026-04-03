# Project Guidelines

## Code Style
- Match existing style in touched files; keep edits small and local.
- Frontend is TypeScript-first and should avoid `any` unless unavoidable.
- Backend should keep business logic in services and keep controllers thin.
- Reuse existing patterns before adding new abstractions.

## Architecture
- Monorepo with Spring Boot backend in `backendApi/` and React frontend in `frontend/recipeai/`.
- Keep changes scoped to the requested layer unless explicitly asked to touch both layers.
- If API contracts change, update only directly impacted frontend/backend paths together.
- For full setup, architecture details, Docker flows, and API endpoints, see `README.md`.

## Build and Test
- Frontend uses `npm` (not yarn): `npm install`, `npm run dev`, `npm run test`, `npm run build`.
- Note: `npm run dev` opens Google Chrome on macOS; for Docker/non-macOS/CI contexts use `npm run dev:docker`.
- Run frontend commands from `frontend/recipeai/`.
- Backend uses Gradle wrapper commands from `backendApi/`: `./gradlew test`, `./gradlew bootRun`, `./gradlew build`.
- Backend commands should run on Java 17; if local tooling points to a newer JDK, set `JAVA_HOME` to JDK 17 before running Gradle.
- If Gradle fails with `Unsupported class file major version 69`, switch the active JDK to 17.
- Current repository state: backend test sources are out of sync with production code and `./gradlew test` may fail at `compileTestJava`; use `./gradlew compileJava` for quick feature-level backend validation unless your task includes fixing tests.
- If backend compile errors include Lombok/JDK issues such as `NoSuchFieldException TypeTag::UNKNOWN`, treat this as a local toolchain mismatch first.
- Prefer the smallest useful validation first; do not fix unrelated failing tests.
- Quick local validation defaults:
	- Frontend: `npm run build`
	- Backend: `./gradlew compileJava`
- For environment setup and Docker orchestration, see `README.md`.

## Conventions

### Default Working Style
- Prefer small, surgical edits over broad refactors.
- Fix root cause; avoid workaround-only patches.
- Do not modify unrelated files.
- Keep naming and patterns consistent with nearby code.
- Ask before introducing new dependencies.

### Frontend
- TypeScript-first; avoid `any` unless unavoidable.
- Reuse existing components, context providers, hooks, and constants before adding new ones.
- Keep props and state explicit and readable.
- Follow existing Tailwind v4 patterns and shared theme usage.
- Use existing theme tokens from `frontend/recipeai/src/App.css` and related UI guidance in `frontend/recipeai/COLOR_SCHEME_GUIDE.md`.
- Frontend `README.md` is Vite boilerplate; prefer root `README.md` and in-repo source patterns for project behavior.

### Backend
- Follow existing package boundaries: controllers, services, repositories, dto, mappers, entities, config.
- Keep controllers thin; centralize business logic in services.
- Reuse existing MapStruct mapper and DTO patterns.
- Keep Flyway migrations additive and safe; never modify applied migrations in place.

## Project-Specific Pitfalls
- JWT secret must be configured and at least 32 characters for backend startup.
- In `docker-compose.dev.yml`, backend has a dev fallback JWT secret; local non-Docker runs still require `JWT_SECRET_KEY` to be set.
- Be profile-aware: dev defaults differ from prod (dev uses H2 with Flyway disabled; prod uses PostgreSQL with Flyway enabled and `ddl-auto: validate`).
- Profiles are selected via `SPRING_PROFILES_ACTIVE`; `docker-compose.dev.yml` sets `SPRING_PROFILES_ACTIVE=docker`, and because there is no `application-docker.yml`, Spring uses defaults from `application.yml` (H2 with Flyway disabled), which is the intended local dev behavior.
- Recipe generation depends on external AI configuration; ensure `GEMINI_API_KEY` is present when exercising generation flows.
- Local backend compile issues on newer JDKs can be Lombok/JDK mismatch rather than app logic errors.
- Frontend Docker builds rely on `frontend/recipeai/.dockerignore` excluding `node_modules` to avoid host/container binary mismatches (for example, esbuild).
- Dependency changes in `frontend/recipeai/` should use npm to avoid package-manager lockfile churn.

## Key References
- Root setup and endpoint docs: `README.md`
- Dokploy deployment runbook: `docs/DOKPLOY_DEPLOYMENT.md`
- Dokploy env presets: `docs/DOKPLOY_ENV_PRESETS.md`
- Frontend design tokens and color system: `frontend/recipeai/COLOR_SCHEME_GUIDE.md`
- Frontend theme implementation: `frontend/recipeai/src/App.css`
- Frontend migration note (historical context only): `frontend/recipeai/MIGRATION_COMPLETE.md`
- Frontend scripts and command behavior: `frontend/recipeai/package.json`
- Backend runtime/profile behavior: `backendApi/src/main/resources/application.yml` and `backendApi/src/main/resources/application-prod.yml`

## When to Ask Questions
Ask before implementing if:
- Requirements are ambiguous or UI behavior is not explicitly defined.
- A database schema change could affect existing data.
- Security or auth behavior may change.
- A new dependency or library is required.

When asking, include a recommended default option.
