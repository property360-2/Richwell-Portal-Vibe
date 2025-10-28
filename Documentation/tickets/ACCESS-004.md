# ACCESS-004: Provide textual alternatives for dashboard charts

## Summary
Charts rendered via the shared `Chart` component expose only canvas output without an accessible name or textual summary, so screen-reader users cannot interpret dashboard metrics.

## Affected Code
- `frontend/src/components/common/Chart.jsx`
- Pages embedding `Chart` (student, professor, registrar, admission, dean dashboards).

## Requirements
- Accept props for `aria-label`, `aria-describedby`, and optional `figcaption`/summary text in `Chart`.
- Render charts inside a `<figure>` with a visible or visually hidden description of the data.
- Provide a fallback data table or downloadable CSV when feasible.

## Acceptance Criteria
- Axe-core no longer flags canvas elements without accessible names on dashboard pages.
- Screen readers can access a textual description of each chart.
- Documentation includes guidance for supplying descriptions when using the component.

## Testing
- Axe-core run on each dashboard view.
- Manual verification with a screen reader (e.g., NVDA, VoiceOver) to confirm descriptions are announced.
