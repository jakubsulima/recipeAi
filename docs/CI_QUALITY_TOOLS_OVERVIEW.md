# CI Quality and Security Overview

This document describes the quality and security tools used in GitHub Actions and why each one is enabled.

## Policy

- Blocking checks are required to pass before container image security scan and publish stages.
- Advisory checks run in CI but do not block merges while the codebase baseline is being improved.

## Tools

### ESLint (Frontend Linter)

- Job: `frontend-lint`
- Scope: TypeScript/React frontend code
- Why it is a solid choice:
  - Fast feedback on correctness and code quality issues
  - Prevents common React and TypeScript mistakes early
- Status: Blocking

### Prettier (Frontend Formatting)

- Job: `frontend-prettier`
- Scope: Frontend source, tests, JSON and Markdown files
- Why it is a solid choice:
  - Keeps formatting consistent and reduces review noise
  - Improves merge conflict readability
- Current caveat:
  - It is advisory first to avoid blocking while baseline formatting is aligned
- Status: Advisory

### Vitest (Frontend Tests)

- Job: `frontend-test`
- Scope: Frontend unit/component tests
- Why it is a solid choice:
  - Protects behavior during refactoring
  - Catches regressions before deployment
- Status: Blocking

### Checkstyle (Backend Style and Hygiene)

- Job: `backend-checkstyle`
- Scope: Backend main Java sources
- Why it is a solid choice:
  - Enforces consistent Java hygiene rules
  - Catches import issues and formatting basics early
- Status: Blocking

### SpotBugs (Backend Static Bug Detection)

- Job: `backend-spotbugs`
- Scope: Backend main Java bytecode analysis
- Why it is a solid choice:
  - Detects likely runtime bugs beyond style checks
  - Finds nullness and correctness risks that compile passes do not catch
- Current caveat:
  - It can be noisy initially on legacy code
- Status: Advisory

### Testcontainers Integration Validation

- Job: `backend-testcontainers`
- Scope: Integration tests named `*IT.java`
- Why it is a solid choice:
  - Verifies realistic integration behavior against containerized dependencies
  - Reduces local-vs-CI environment drift
- Current caveat:
  - Runs only when integration tests exist
- Status: Advisory

### Gitleaks (Secret Scanning)

- Job: `secret-scan`
- Scope: Full repository history available in workflow checkout
- Why it is a solid choice:
  - Detects accidental credentials and keys before merge/release
  - High security impact with low runtime cost
- Status: Blocking

### Hadolint (Dockerfile Linter)

- Job: `dockerfile-lint`
- Scope: Backend, frontend and database Dockerfiles
- Why it is a solid choice:
  - Catches Dockerfile anti-patterns early
  - Improves image maintainability and security posture
- Status: Blocking

### Trivy (Container Image Vulnerability Scan)

- Job: `image-security-scan`
- Scope: Built backend/frontend/db images
- Why it is a solid choice:
  - Detects OS and library vulnerabilities in final images
  - CRITICAL gate enforces minimum security standard
- Status: Blocking

## Recommended Progression

1. Keep advisory checks visible until noise is reduced.
2. Promote advisory checks to blocking when failure rate is stable and actionable.
3. Add Testcontainers-backed integration tests progressively, then make that gate blocking.
