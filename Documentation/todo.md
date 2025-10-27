# Richwell Portal – Next Steps To-Do List

This checklist outlines the remaining work needed to progress through the upcoming development phases. It references existing modules so each task can be assigned quickly and validated against the current routes.

## Phase 3 – Academic Data Management
- [ ] Audit CRUD flows for programs, subjects, sections, and academic terms to confirm all operations are wired to their routes (`programRoutes.js`, `subjectRoutes.js`, `sectionRoutes.js`, `academicTermRoutes.js`).
- [ ] Backfill automated tests or Postman collections that cover the above routes to ensure regression coverage.
- [ ] Document data seeding expectations for each catalog table so testers can prepare baseline data.

## Phase 4 – Enrollment System
- [ ] Implement student-facing enrollment endpoints (e.g., `/api/enrollments`) that validate prerequisites, INC blocks, and section slot limits before committing records in `enrollmentController.js`.
- [ ] Connect the frontend enrollment workflow to those endpoints and confirm ProtectedRoute access rules allow students and admission staff to reach the views.
- [ ] Add server-side and client-side handling for auto-generating student IDs and onboarding credentials for new admits.
- [ ] Record analytics hooks so successful enrollments update the admission dashboard metrics.

## Phase 5 – Grades Management
- [ ] Verify professor grade submission routes (`gradeRoutes.js`) handle dropdown-restricted values and enforce approval requirements in `gradeController.js`.
- [ ] Build registrar approval endpoints and UI screens that let registrars finalize or reject submitted grades.
- [ ] Surface student grade history and GPA summaries on the frontend, ensuring the route permissions align with `authRoutes.js` protections.

## Phase 6 – Analytics & Dashboards
- [ ] Extend analytics coverage beyond admission by adding registrar, dean, professor, and student dashboards, each with corresponding backend aggregations in `analyticsController.js` and protected routes in `analyticsRoutes.js`.
- [ ] Introduce a shared analytics caching strategy or batching layer to prevent redundant heavy queries across roles.
- [ ] Implement automated smoke checks that call each analytics route to verify responses after deployments.

## Phase 7 – Frontend UI/UX Polish
- [ ] Standardize usage of shared components (buttons, tables, cards) across dashboard pages for visual consistency.
- [ ] Add responsive layout regressions tests or visual snapshots for primary dashboards.
- [ ] Conduct an accessibility review (keyboard navigation, ARIA roles, contrast) and document remediation tasks.

## Cross-Cutting Tasks
- [ ] Ensure role-based middleware is exercised by integration tests covering `authRoutes.js` and downstream protected routes.
- [ ] Expand logging/monitoring around enrollment, grade submissions, and analytics queries to aid debugging in production-like environments.
- [ ] Update `Documentation/phases.md` and `PROJECT_SUMMARY.md` after each milestone to keep stakeholder communication current.
