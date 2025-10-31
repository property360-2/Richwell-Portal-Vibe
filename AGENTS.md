# Repository Guidelines

## Project Structure & Module Organization
- Keep `Documentation/` (concept, schema, roadmap) current and store screenshots or exports under `Documentation/assets/`.
- Backend lives in `apps/api/` (NestJS or Express + Prisma): schema at `prisma/schema.prisma`, migrations in `prisma/migrations/`, and feature modules in `apps/api/src/modules/<feature>`.
- Frontend resides in `apps/web/` (React + Tailwind); group role areas under `apps/web/src/modules/{dean,registrar,admission,professor,student}` with shared UI in `apps/web/src/components/common/`.
- Colocate tests with code: API specs in `apps/api/test/`, UI specs in `apps/web/src/__tests__/`, and shared fixtures inside `tests/fixtures/`.

## Build, Test, and Development Commands
- Install dependencies once via `npm install`.
- Run local servers with `npm run dev --workspace api` and `npm run dev --workspace web`.
- Manage the database using `npx prisma migrate dev --name <label>` and `npm run seed --workspace api`.
- Validate work with `npm run test --workspace api`, `npm run test --workspace web`, `npm run lint`, and `npm run format`.

## Coding Style & Naming Conventions
- Use TypeScript throughout with 2-space indentation, trailing commas, and Prettier + ESLint enforcing the ruleset.
- Maintain NestJS naming (`*.module.ts`, `*.controller.ts`, `*.service.ts`) and PascalCase React components; hooks start with `use`.
- Prisma models stay singular PascalCase, SQL columns remain snake_case, and archive fields (`archived`, `archived_at`, `archived_by`) plus audit helpers replace deletes.

## Testing Guidelines
- Use Jest + Supertest for the API and React Testing Library for the web UI.
- Name backend specs `<module>.spec.ts`; UI suites follow `<Component>.test.tsx`. Keep snapshots for stable layouts only.
- Seed via Prisma factories to cover RBAC paths, archive filters (`WHERE archived = FALSE`), and audit logging. Schema changes must pass `npm run test:e2e --workspace api` with matching updates in `Documentation/schema.md`.

## Commit & Pull Request Guidelines
- Adopt conventional commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`) and scope when useful (e.g., `feat(admission): kiosk flow`).
- Branch off `dev`; use `feature/<area>-<slug>` or `fix/<issue-id>`.
- PRs include a summary, linked ticket, relevant screenshots, migration or seeding notes, and confirmation that lint/tests passed before merge approval.

## Data & Security Notes
- Store secrets in `.env.local`, mirror keys in `.env.example`, and never commit live credentials.
- Apply Zod/Joi validation ahead of Prisma access and guard every read with archive-aware filters.
- Admission flows stay LAN/localhost only per the concept plan—assert network bounds in new endpoints.
