# FlowOps

A Next.js prototype for submitting, approving, and resolving internal requests. I designed the same request from four viewpoints: requester, approver, agent, and admin.

**Next.js 14 · React · TypeScript · Tailwind CSS · React Hook Form · Zod**

## Try the workflow

1. Create a request at `/requests/new`.
2. Switch to approver in the header and open `/approvals`.
3. Switch to agent to assign and resolve it at `/queue`.
4. Open the admin screens to explore request types, workflows, and SLA policies.

The request detail page brings status, ownership, comments, and activity into one view. Use the header's reset control to return to the seeded records.

## Run locally

Install Node.js and npm.

```sh
git clone https://github.com/anusharama100/flowops.git
cd flowops
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000).

```sh
npm run build
npm run lint
```

## Code to start with

- `src/app/requests/` — forms, list, and request details.
- `src/app/approvals/` and `src/app/queue/` — approval and agent flows.
- `src/lib/data/` — seeded records and the browser-side store.
- `src/contexts/auth-context.tsx` — demo identity and role switching.

## Project status

This is a frontend prototype. Role switching is simulated, and the data store runs in the browser. It does not provide server-enforced permissions, shared persistence, real notifications, or a durable audit log.

See [local verification](docs/LOCAL_VERIFICATION.md) for the recorded setup checks and what remains untested.
