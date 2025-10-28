# ACCESS-002: Make enrollment subject selectors keyboard accessible

## Summary
Enrollment subject and section cards are `<div>` containers with click handlers, so they are invisible to keyboard and assistive tech users, blocking enrollment submission.

## Affected Code
- `frontend/src/pages/student/EnrollmentPage.jsx`
- Shared `Card` component styles if they enforce pointer-only interactions.

## Requirements
- Replace clickable `<div>` wrappers with semantic `<button>` elements or add keyboard semantics (`role="button"`, `tabIndex`, Enter/Space handlers`).
- Convey selection via `aria-pressed` or `aria-selected` attributes synchronized with the `selectedSubjects` state.
- Ensure focus indicators are visible when navigating between sections.

## Acceptance Criteria
- Keyboard users can select/deselect recommended and available sections without using a mouse.
- Axe-core reports no `aria-required-children` or `interactive role` violations on the enrollment page.
- Screen-reader announcement of the selected state is accurate for each section.

## Testing
- Manual keyboard testing on `/student/enrollment`.
- Axe-core regression focused on the enrollment workflow.
