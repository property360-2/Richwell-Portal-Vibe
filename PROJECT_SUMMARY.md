# Richwell Portal – System Summary

## Current Snapshot
- The Richwell College Portal is a full-stack school management system that supports enrollment, grade management, academic data maintenance, and role-specific analytics through a Node.js/Express backend with a React + Tailwind frontend.【F:richwell-portal/README.md†L1-L28】
- Core user roles (student, professor, registrar, admission, dean) each have dedicated workflows surfaced in the dashboard layer, anchored by shared authentication and catalog services.【F:richwell-portal/README.md†L7-L28】【F:richwell-portal/frontend/src/pages/dashboards/ProfessorDashboard.jsx†L1-L200】

## Latest Milestone Highlights
- **Role-aware analytics endpoints** now power dashboards for every persona, combining Prisma aggregation with authorization checks and per-term caching for registrar, dean, and admission audiences to minimize load on enrollment and grade tables.【F:richwell-portal/backend/src/routes/analyticsRoutes.js†L4-L22】【F:richwell-portal/backend/src/controllers/analyticsController.js†L239-L465】
- **Admissions intelligence** tracks daily confirmation rates, program distribution, and the newest enrollment activity, automatically invalidated whenever students confirm or cancel their seats so widgets remain live without manual refreshes.【F:richwell-portal/backend/src/controllers/analyticsController.js†L467-L640】【F:richwell-portal/backend/src/controllers/enrollmentController.js†L399-L559】
- **Professor and student insights** include GPA calculations, grade distributions, section rosters, and INC monitoring, feeding directly into the dashboards rendered by shared chart and KPI components on the frontend.【F:richwell-portal/backend/src/controllers/analyticsController.js†L9-L238】【F:richwell-portal/frontend/src/pages/dashboards/ProfessorDashboard.jsx†L1-L200】

## Enrollment Workflow Status
- Students can submit enrollments against active term offerings with automatic slot deduction, unit counting, prerequisite validation, and analytics logging for each submission.【F:richwell-portal/backend/src/controllers/enrollmentController.js†L352-L432】
- Staff users update or cancel enrollments through guarded endpoints that emit analytics logs and invalidate caches, ensuring admission dashboards receive near-real-time totals and trends.【F:richwell-portal/backend/src/controllers/enrollmentController.js†L495-L658】

## Quality Gates & Tooling
- A dedicated smoke script (`npm run analytics:smoke`) authenticates as every role and verifies the schema of each analytics response; it currently runs after deployments and can be wired into CI for automated regression detection.【F:richwell-portal/backend/package.json†L10-L18】【F:richwell-portal/backend/scripts/analyticsSmoke.js†L1-L220】
- Playwright fixtures stub analytics traffic across dashboards, keeping frontend expectations aligned with backend payloads during end-to-end testing.【F:richwell-portal/frontend/tests/e2e/dashboard.spec.ts†L1-L332】

## Known Follow-ups
- Extend cache coverage to student and professor analytics to prevent repeated GPA calculations under heavy load.【F:richwell-portal/backend/src/controllers/analyticsController.js†L9-L238】
- Automate post-deployment probes for analytics routes instead of relying on a manual smoke invocation.【F:richwell-portal/backend/package.json†L10-L18】
- Expand production observability around analytics queries and enrollment logging as outlined in the shared TODO list.【F:Documentation/todo.md†L14-L24】【F:Documentation/todo.md†L33-L34】
