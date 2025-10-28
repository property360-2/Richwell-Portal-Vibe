# Documentation Maintenance Guide

## Milestone PR Checklist
Use this checklist before merging any milestone pull request to ensure the project knowledge base stays aligned with delivered work.

- [ ] **Phase Progress** – Confirm `Documentation/phases.md` reflects the latest achievements and explicitly tracks remaining tasks for the active phase.【F:Documentation/phases.md†L125-L153】
- [ ] **Project Summary** – Review `PROJECT_SUMMARY.md` for accuracy and update highlights to cover newly shipped functionality or integrations.【F:PROJECT_SUMMARY.md†L1-L33】
- [ ] **Backlog Visibility** – Verify outstanding analytics/enrollment follow-ups are captured in the summary or todo list so future phases inherit clear action items.【F:PROJECT_SUMMARY.md†L35-L47】【F:Documentation/todo.md†L14-L34】
- [ ] **Testing Notes** – Document any new smoke tests, automated suites, or manual validation steps that gate the milestone so other contributors can reproduce them.【F:richwell-portal/backend/scripts/analyticsSmoke.js†L1-L220】【F:richwell-portal/frontend/tests/e2e/dashboard.spec.ts†L1-L332】
- [ ] **Cross-Link Updates** – Ensure references between documentation files remain valid (e.g., summaries, deployment notes, or readmes pointing to the correct scripts and dashboards).

> Tip: Add a short changelog snippet to the PR description summarizing documentation updates so reviewers can focus on content accuracy.
