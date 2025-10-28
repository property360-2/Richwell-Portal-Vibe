# ACCESS-001: Improve DashboardLayout navigation toggle accessibility

## Summary
DashboardLayout's sidebar toggle button lacks an accessible name/state, preventing screen readers from understanding the control and leaving keyboard users without clear navigation flow.

## Affected Code
- `frontend/src/components/layout/DashboardLayout.jsx`

## Requirements
- Add a descriptive `aria-label` to the toggle button.
- Reflect the open/closed state via `aria-expanded` tied to the sidebar visibility state.
- Ensure focus management: when opening the sidebar, send focus to the first focusable element inside; when closing, return focus to the toggle.
- Provide a skip link or equivalent method to move focus directly to the main content.

## Acceptance Criteria
- Axe-core scan of any dashboard page reports no violations related to unlabeled buttons or missing landmark navigation.
- Keyboard-only users can toggle the sidebar, reach links inside, and return to the main content without losing focus context.

## Testing
- Manual keyboard traversal of dashboard pages.
- Axe-core regression test for `DashboardLayout` consumers.
