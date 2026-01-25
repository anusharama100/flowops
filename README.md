# FlowOps - Enterprise Request & Workflow Platform

A portfolio-ready enterprise internal tool for managing requests/tickets with approvals, assignments, SLAs, comments, attachments, audit logs, notifications, dashboards, and admin configuration.

![FlowOps](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## 🎭 Role Switching (Demo Feature)

The application includes a role switcher in the header for demonstration purposes. Switch between roles to see different perspectives:

| Role | Description | Key Features |
|------|-------------|--------------|
| **Requester** | Employee creating requests | Create requests, view own requests, comment |
| **Approver** | Manager approving requests | Approve/reject, request more info, view team requests |
| **Agent** | IT/Operations processing requests | Triage queue, assign, change status, resolve |
| **Admin** | System administrator | Configure request types, workflows, SLA policies |

## 📂 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Role-specific dashboards
│   ├── requests/           # Request list, detail, create
│   ├── approvals/          # Approval queue (Approvers)
│   ├── queue/              # Agent triage queue
│   ├── admin/              # Admin configuration
│   ├── design-system/      # Component showcase
│   └── docs/               # Documentation
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Shell, Sidebar, Header
│   └── shared/             # Domain components (badges, etc.)
├── contexts/               # React contexts (auth)
├── hooks/                  # Custom hooks (toast)
├── lib/
│   ├── data/               # Mock data store & seed data
│   └── utils.ts            # Utility functions
└── types/                  # TypeScript type definitions
```

## ✨ Key UX Moments

### 1. **Dynamic Form Generation** (`/requests/new/[typeId]`)
- Forms are generated from configurable field schemas
- Support for conditional visibility (show field if X equals Y)
- Real-time validation with Zod
- Auto-save draft to localStorage

### 2. **Request Detail Page** (`/requests/[id]`)
- Complete timeline with audit log
- Role-based action bar
- Public comments + internal notes (agent-only)
- Side panel with metadata

### 3. **Smart Triage Queue** (`/queue`)
- Automatic scoring based on priority + SLA risk + age
- Quick assign and start work actions
- At-risk/breached SLA highlighting

### 4. **Command Palette** (⌘K)
- Quick navigation across the app
- Search requests by title or ID
- Quick actions

### 5. **Role-Based UI**
- Navigation items change based on role
- Action buttons show/hide appropriately
- Dashboard widgets customized per role

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Variables
- **Components**: shadcn/ui (Radix UI primitives)
- **Tables**: TanStack Table
- **Forms**: React Hook Form + Zod
- **State**: React Context + localStorage
- **Icons**: Lucide React

## 📋 Features Implemented

### Core
- [x] Role-based authentication (mock)
- [x] Permission system
- [x] Request CRUD with full workflow
- [x] Dynamic form generation
- [x] Timeline/audit log
- [x] Comments and internal notes
- [x] Status transitions
- [x] SLA calculation and badges

### UI/UX
- [x] Responsive layout
- [x] Loading skeletons
- [x] Empty states
- [x] Toast notifications
- [x] Command palette
- [x] Keyboard navigation
- [x] Accessible components

### Tables
- [x] Sorting
- [x] Filtering
- [x] Pagination
- [x] Column visibility
- [x] Row selection
- [x] Bulk actions

### Admin
- [x] Request type management
- [x] SLA policy configuration
- [x] Workflow visualization
- [x] Canned responses

## 🎨 Design System

Visit `/design-system` to explore:
- Color tokens
- Typography scale
- Button variants
- Form patterns
- Status badges
- Card layouts
- Feedback components

## 📖 Documentation

Visit `/docs` for:
- Problem statement
- Information architecture
- Data model
- Workflow diagrams
- Permission matrix
- Accessibility checklist
- Analytics instrumentation plan

## 🧪 Demo Scenarios

1. **Submit a Software Access Request** (as Requester)
   - Go to `/requests/new`
   - Select "Software Access Request"
   - Fill form and submit

2. **Approve a Pending Request** (as Approver)
   - Switch to Approver role
   - Go to `/approvals`
   - Review and approve/reject

3. **Triage and Resolve a Bug** (as Agent)
   - Switch to Agent role
   - Go to `/queue`
   - Assign to self and resolve

4. **Configure a Request Type** (as Admin)
   - Switch to Admin role
   - Go to `/admin/request-types`
   - View/edit form schemas

## 🔄 Reset Demo Data

Click the refresh icon in the header to reset all data to the initial seed state.

## 📝 License

MIT License - feel free to use for your portfolio or as a starting point for enterprise applications.
