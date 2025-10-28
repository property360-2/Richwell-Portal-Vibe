# Accessibility Audit – Richwell Portal

## Audit Overview
- **Audit date:** 2024-08-29
- **Tools:** axe-core (via Playwright script)
- **Scope:** `/login`, `/setup-password`, `/student/dashboard`, `/student/enrollment`, `/student/grades`, `/professor/dashboard`, `/professor/grades`, `/registrar/dashboard`, `/registrar/grades`, `/admission/dashboard`, `/admission/onboarding`, `/dean/dashboard`
- **Assistive technology focus:** Keyboard navigation, screen reader semantics, color contrast heuristics.
- **Environment notes:** The Playwright run used a temporary `frontend/node_modules/axios/index.js` stub to satisfy imports. Replace with a maintained mock before adding automated regression checks.

## Summary of Findings
| Severity | Count | Notes |
| --- | --- | --- |
| High | 4 | Blocks keyboard/screen-reader users from completing workflows. |
| Medium | 3 | Reduces clarity but has workarounds. |
| Low | 4 | Cosmetic/contrast concerns. |

Remediations below prioritize the high-severity findings that require code changes.

## High-Severity Issues & Remediation

### 1. Sidebar toggle lacks accessible name and state
- **Pages affected:** All dashboard routes using `DashboardLayout`.
- **Barrier:** The hamburger button only exposes an icon. Screen readers do not announce its purpose or whether the sidebar is expanded/collapsed.
- **Source:** [`frontend/src/components/layout/DashboardLayout.jsx`](../richwell-portal/frontend/src/components/layout/DashboardLayout.jsx)
- **Remediation:**
  - Provide an `aria-label` describing the action (e.g., “Toggle navigation menu”).
  - Reflect the open state via `aria-expanded` and ensure focus moves into the sidebar when opened.
  - Consider adding a skip link that moves focus directly to the main content area.

### 2. Subject cards act as buttons without semantics
- **Pages affected:** `/student/enrollment` (and admission staff view).
- **Barrier:** Subject/section containers are `<div>` elements with `onClick` handlers, so keyboard users cannot select sections and screen readers do not identify them as actionable.
- **Source:** [`frontend/src/pages/student/EnrollmentPage.jsx`](../richwell-portal/frontend/src/pages/student/EnrollmentPage.jsx)
- **Remediation:**
  - Convert the clickable containers into `<button>` elements or add `role="button"`, `tabIndex="0"`, and keyboard handlers (`onKeyDown` for Enter/Space`).
  - Ensure the selected state is conveyed through `aria-pressed` or a similar attribute.

### 3. Modal lacks dialog semantics or focus management
- **Pages affected:** All workflows relying on `Modal` (enrollment summary, oath confirmation, etc.).
- **Barrier:** The modal does not announce itself as a dialog, lacks `aria-modal`, and does not trap focus, so keyboard users can tab to background controls.
- **Source:** [`frontend/src/components/common/Modal.jsx`](../richwell-portal/frontend/src/components/common/Modal.jsx)
- **Remediation:**
  - Add `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`/`aria-describedby` attributes.
  - Move initial focus to the modal container and trap focus until dismissal.
  - Ensure the backdrop close affordance is reachable via keyboard or provide an explicit close button.

### 4. Charts missing textual descriptions
- **Pages affected:** All dashboards embedding the shared `Chart` component.
- **Barrier:** Chart.js canvases lack programmatic descriptions, preventing screen-reader users from understanding the data.
- **Source:** [`frontend/src/components/common/Chart.jsx`](../richwell-portal/frontend/src/components/common/Chart.jsx)
- **Remediation:**
  - Accept props for `aria-label`/`aria-describedby` and pass them to the rendered canvas.
  - Provide a `<figcaption>` or visible summary describing the chart data.
  - Offer data tables or downloadable CSVs as textual alternatives when feasible.

## Medium-Severity Observations
- Repeated heading levels (`h1` followed by multiple `h1`s) across dashboards should be downgraded to reflect hierarchy.
- Some cards rely solely on color to show status (e.g., success/error alerts); include icons or text labels.
- Long dashboard pages lack secondary navigation or skip links to jump to key sections.

## Low-Severity Observations
- Contrast ratios on light-gray text (`text-gray-500`/`text-gray-600`) may fall below 4.5:1 on white backgrounds.
- Ensure focus outlines remain visible when Tailwind utility classes such as `focus:outline-none` are introduced in custom components.
- Confirm icon-only buttons (settings, logout) have `aria-label`s across the app header.
- Validate toast/alert announcements fire `role="status"` for asynchronous updates.

## Next Steps
1. Implement the high-severity remediations and re-run axe on all affected dashboards.
2. Address medium/low items as part of UX polish iterations.
3. Automate accessibility smoke checks once the axios dependency mock is formalized.
