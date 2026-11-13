# Website Security Scanning Dashboard

A React frontend for security analysts to manage authorized targets, launch mock scans, review findings, and generate reports.

## Run locally

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run format:check
npm run build
```

Run `npm run format` to format the source.

Demo login:

- Email: `analyst@example.com`
- Password: `SecureScan123!`

## Stack

- React 18, TypeScript, and Vite for the application and development workflow.
- React Router for protected, URL-addressable screens.
- Tailwind CSS and shared CSS tokens for responsive styling.
- A typed in-memory mock API; data mutations are session-only, while profile and theme preferences are stored locally.
- Lucide React for consistent interface icons; hand-rolled SVG is used for the dashboard charts.

## Screens and workflows

- Dashboard: target, scan, and finding totals; severity and timeline charts; recent scans.
- Targets: add, edit, and remove targets; validate URLs and optional authenticated-scan credentials.
- Scans: launch scans, follow timed progress, and open findings for completed scans.
- Findings: combined text search, severity/category/status filters, sorting, pagination, and keyboard-accessible finding-title links.
- Finding detail: evidence, remediation guidance, and an in-session status control.
- Reports: generate a report for a completed scan and download a generated PDF.
- Settings: edit the local demo profile, persist a light/dark theme preference, and view the API-key placeholder.
- Unknown authenticated routes: show a not-found page with a dashboard return link.

`public/robots.txt` allows all crawlers by default. Update it for the production domain and indexing policy before deployment; robots directives are not access control.

All screens other than login are protected by a demo session token. Mock data contains six targets, ten initial scans, and 48 findings using OWASP Top 10 categories and CWE identifiers.

The shared interface uses readable table text, high-contrast color tokens, visible keyboard focus, a skip-to-content link, and browser-locale date formatting. System font fallbacks cover common CJK and Devanagari scripts; UI translations are not included.

## Assumptions and known gaps

- Scan, target, finding, and report data live in the browser-side mock service; there is no real scanner or backend. Scan progress is simulated. Profile and theme preferences persist in local storage.
- The API-key field is a nonfunctional placeholder; no credentials or API keys are sent to a service.
- Deployment is not configured in this workspace.
