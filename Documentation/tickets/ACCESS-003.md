# ACCESS-003: Add dialog semantics and focus trapping to Modal

## Summary
The shared Modal component renders without `role="dialog"`, `aria-modal`, or focus management. Screen readers do not announce modal context and keyboard users can tab to background content while the modal is open.

## Affected Code
- `frontend/src/components/common/Modal.jsx`

## Requirements
- Wrap modal content in an element with `role="dialog"` and `aria-modal="true"`.
- Associate the title/content via `aria-labelledby` and `aria-describedby`.
- Trap focus within the modal while open and restore focus to the triggering control on close.
- Ensure backdrop dismissal is keyboard accessible (e.g., Escape key) and/or provide an explicit close button with an accessible name.

## Acceptance Criteria
- Axe-core shows no dialog-related violations for any modal usage.
- Keyboard users cannot move focus to background elements while the modal is open.
- Screen readers announce the modal title when it appears.

## Testing
- Manual keyboard + screen-reader smoke tests on enrollment summary/oath modals.
- Axe-core regression covering modal usage pages.
