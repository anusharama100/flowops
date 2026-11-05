# FlowOps

An internal-request prototype that follows a request from submission through approval and resolution. I used four roles—requester, approver, agent, and admin—to explore where ownership and handoffs become unclear.

The focus is product and workflow design. Authentication is simulated, and request data lives in a browser-side store rather than a shared backend.

## Explore the workflow

1. Use the header role switcher to become a requester and create a request at `/requests/new`.
2. Switch to approver and review the approval queue at `/approvals`.
3. Switch to agent to assign and resolve work at `/queue`.
4. Open the admin views to inspect request types, workflows, SLA policies, and canned responses.

Request details bring together status, ownership, comments, internal notes, and an activity timeline. The form system uses configurable fields, and the queue makes priority and SLA risk visible.

## Run locally

Install Node.js and npm, then:

```sh
git clone https://github.com/anusharama100/flowops.git
cd flowops
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). The header includes a reset control for returning to the seeded demo data.

```sh
npm run build
npm run lint
```

## How it is built

Next.js 14 and TypeScript provide the application structure. Tailwind CSS and Radix-based components handle the UI; React Hook Form and Zod support the forms.

| Location | Responsibility |
| --- | --- |
| `src/app/requests/` | Request creation, list, and detail views |
| `src/app/approvals/` and `src/app/queue/` | Approval and agent workflows |
| `src/app/admin/` | Configuration screens |
| `src/lib/data/` | Seed records and demo store |
| `src/contexts/auth-context.tsx` | Demo identity and role switching |
| `src/types/` | Request and workflow types |

The `/design-system` and `/docs` routes collect UI patterns and project documentation.

## Scope

Role switching demonstrates interface permissions; it is not server-enforced access control. Local demo state does not provide shared persistence, durable audit records, or real notifications. A production version would need those services before handling employee requests.

## Latest local check

See [local verification](docs/LOCAL_VERIFICATION.md) for the November 5, 2026 setup, runtime checks, and remaining test boundaries.
