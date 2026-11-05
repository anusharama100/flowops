# Local verification

Checked November 5, 2026 with Node 24 and npm on macOS.

- `npm ci` completed from the committed lockfile.
- `npm run lint` and `npm run build` passed after correcting the ESLint configuration for Next.js 14 and ESLint 8.
- Started the production build with `npm start` on a separate local port.
- Browser walkthrough: created a software-access request, submitted its required fields, switched to the approver role, and approved it. The request moved to Triaged / Approved and its timeline grew.
- No console errors were observed in the walkthrough.

The role switcher is a demo control. This project uses local seeded state, not production authentication or a shared request database.
