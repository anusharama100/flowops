'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Shield, Users, Settings, Zap, Clock, CheckCircle, BarChart3 } from 'lucide-react'

export default function DocsPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto py-8">
        <Badge variant="secondary" className="mb-4">Documentation</Badge>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          How FlowOps Works
        </h1>
        <p className="text-slate-500 mt-3 text-lg">
          Technical overview and design decisions behind the platform
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <Tabs defaultValue="overview">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-5 w-full max-w-2xl">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="architecture">Architecture</TabsTrigger>
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-8">
            {/* Problem + Solution */}
            <div className="text-center max-w-2xl mx-auto space-y-6">
              <div>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-3">The Problem</p>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                  Internal requests shouldn&apos;t feel like sending messages into a black hole
                </h2>
              </div>
              <p className="text-slate-500 text-lg leading-relaxed">
                Employees submit requests via email, Slack, spreadsheets—then wait. 
                Managers lose track of approvals. IT scrambles to meet SLAs nobody can see.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Scattered tools', 'No visibility', 'Slow approvals', 'Zero accountability'].map((pain) => (
                  <span key={pain} className="px-3 py-1.5 bg-red-50 rounded-full text-sm text-red-600 border border-red-100">
                    {pain}
                  </span>
                ))}
              </div>
              <div className="pt-4">
                <p className="text-sm font-medium text-emerald-600 uppercase tracking-wide mb-2">The Solution</p>
                <p className="text-slate-600 font-medium">
                  <span className="text-slate-900">FlowOps</span> — One platform for requests, approvals, and resolution with full visibility.
                </p>
              </div>
            </div>

            {/* Key Features Grid */}
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { icon: Zap, title: 'Dynamic Forms', desc: 'Configure once, scale everywhere' },
                { icon: CheckCircle, title: 'Smart Workflows', desc: 'Auto-routing and approvals' },
                { icon: Clock, title: 'SLA Tracking', desc: 'Never miss a deadline' },
                { icon: BarChart3, title: 'Full Audit Trail', desc: 'Every action logged' },
              ].map((feature) => (
                <div key={feature.title} className="text-center p-6 rounded-xl border bg-white hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 text-slate-700 mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-slate-900">{feature.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Target Users - Card Grid */}
            <div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-slate-900">Built for Every Role</h3>
                <p className="text-slate-500 mt-1">Each user sees exactly what they need</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    role: 'Requester',
                    title: 'Employees',
                    desc: 'Submit requests, track status, respond to questions',
                    icon: User,
                    color: 'bg-blue-500',
                  },
                  {
                    role: 'Approver',
                    title: 'Managers',
                    desc: 'Review, approve, or reject team requests quickly',
                    icon: Shield,
                    color: 'bg-amber-500',
                  },
                  {
                    role: 'Agent',
                    title: 'IT / Operations',
                    desc: 'Triage queue, manage SLAs, resolve and close tickets',
                    icon: Users,
                    color: 'bg-emerald-500',
                  },
                  {
                    role: 'Admin',
                    title: 'System Admins',
                    desc: 'Configure forms, workflows, policies, and permissions',
                    icon: Settings,
                    color: 'bg-purple-500',
                  },
                ].map((user) => (
                  <div key={user.role} className="flex items-start gap-4 p-5 rounded-xl border bg-white hover:shadow-md transition-shadow">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${user.color} text-white shrink-0`}>
                      <user.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900">{user.title}</span>
                        <Badge variant="secondary" className="text-xs">{user.role}</Badge>
                      </div>
                      <p className="text-sm text-slate-500">{user.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Information Architecture */}
            <Card className="border-0 bg-slate-50">
              <CardHeader className="text-center pb-2">
                <CardTitle>Information Architecture</CardTitle>
                <CardDescription>How the app is organized</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-white p-6 rounded-xl overflow-x-auto border font-mono text-slate-600">
{`FlowOps
├── Dashboard (role-specific views)
│   ├── Requester: My requests, recent activity
│   ├── Approver: Pending approvals, team requests
│   ├── Agent: Queue stats, SLA alerts
│   └── Admin: System health, config changes
│
├── Requests
│   ├── List view (filterable, sortable)
│   ├── Detail view (actions, timeline, comments)
│   └── Create flow (type picker → dynamic form)
│
├── Approvals (Approvers only)
├── Queue (Agents only)
├── Admin (Admins only)
├── Design System
└── Docs`}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

        {/* Architecture */}
        <TabsContent value="architecture" className="space-y-8">
          {/* Tech Stack */}
          <div>
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-slate-900">Tech Stack</h3>
              <p className="text-slate-500 mt-1">Modern, type-safe, and scalable</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">F</span>
                  </div>
                  <h4 className="font-semibold text-slate-900">Frontend</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Next.js 14', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'TanStack Table', 'React Query', 'React Hook Form', 'Zod'].map((tech) => (
                    <Badge key={tech} variant="secondary" className="font-normal">{tech}</Badge>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-xl border bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-lg">D</span>
                  </div>
                  <h4 className="font-semibold text-slate-900">State & Data</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['In-memory store', 'localStorage', 'Context API', 'Seed data'].map((tech) => (
                    <Badge key={tech} variant="secondary" className="font-normal">{tech}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Component Inventory */}
          <Card className="border-0 bg-slate-50">
            <CardHeader className="text-center pb-2">
              <CardTitle>Component Inventory</CardTitle>
              <CardDescription>30+ reusable components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-white border">
                  <h4 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Layout</h4>
                  <div className="space-y-2 text-sm text-slate-600">
                    {['AppShell', 'Sidebar', 'Header', 'CommandPalette'].map((c) => (
                      <div key={c} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white border">
                  <h4 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">UI Primitives</h4>
                  <div className="space-y-2 text-sm text-slate-600">
                    {['Button', 'Input / Textarea', 'Select / Checkbox', 'Card / Badge', 'Dialog / Popover', 'Table / Tabs'].map((c) => (
                      <div key={c} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white border">
                  <h4 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Domain</h4>
                  <div className="space-y-2 text-sm text-slate-600">
                    {['StatusBadge', 'PriorityBadge', 'SlaBadge', 'TimelineEvent', 'DynamicField'].map((c) => (
                      <div key={c} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Model */}
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle>Data Model</CardTitle>
              <CardDescription>Core entities and relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-slate-50 p-6 rounded-xl overflow-x-auto font-mono text-slate-600 border">
{`Request {
  id, ticketId, title, description, category
  status: draft | submitted | needs-info | triaged | in-progress | blocked | resolved | closed
  approvalState: pending | approved | rejected | needs-info | not-required
  createdBy, assigneeId, approverId, watchers[]
  timelineEvents[], comments[], internalNotes[], attachments[]
}

RequestType {
  id, name, description, category
  fields: FieldSchema[]  // Dynamic form definition
  approvalRequired, defaultPriority, defaultSlaPolicyId
}

User { id, name, email, role, team }`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflows */}
        <TabsContent value="workflows" className="space-y-8">
          {/* Request Lifecycle Visual */}
          <div className="text-center mb-2">
            <h3 className="text-xl font-semibold text-slate-900">Request Lifecycle</h3>
            <p className="text-slate-500 mt-1">From submission to resolution</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { status: 'Draft', color: 'bg-slate-200 text-slate-700' },
              { status: 'Submitted', color: 'bg-blue-100 text-blue-700' },
              { status: 'Pending Approval', color: 'bg-amber-100 text-amber-700' },
              { status: 'Triaged', color: 'bg-purple-100 text-purple-700' },
              { status: 'In Progress', color: 'bg-cyan-100 text-cyan-700' },
              { status: 'Resolved', color: 'bg-emerald-100 text-emerald-700' },
              { status: 'Closed', color: 'bg-slate-200 text-slate-600' },
            ].map((s, i) => (
              <div key={s.status} className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${s.color}`}>
                  {s.status}
                </span>
                {i < 6 && <span className="text-slate-300">→</span>}
              </div>
            ))}
          </div>

          <Card className="border-0 bg-slate-50">
            <CardContent className="p-6">
              <pre className="text-sm bg-white p-6 rounded-xl overflow-x-auto font-mono text-slate-600 border">
{`┌──────────────────────────────────────────────────────────────────────┐
│                         REQUEST LIFECYCLE                            │
└──────────────────────────────────────────────────────────────────────┘

  DRAFT → SUBMITTED → [APPROVAL?] → TRIAGED → IN PROGRESS → RESOLVED → CLOSED
              │            │            │           │
              │            ▼            │           ▼
              │       NEEDS INFO ◄─────┘       BLOCKED
              │            │
              │            ▼
              └───────► REJECTED → CLOSED

Key transitions:
  • Requester: Draft → Submitted, respond to Needs Info
  • Approver: Approve / Reject / Request Info
  • Agent: Triage → In Progress → Resolve → Close`}
              </pre>
            </CardContent>
          </Card>

          {/* Permission Matrix */}
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>Who can do what</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left py-3 px-4 font-semibold">Action</th>
                      <th className="text-center py-3 px-4 font-semibold">
                        <Badge variant="secondary" className="font-normal">Requester</Badge>
                      </th>
                      <th className="text-center py-3 px-4 font-semibold">
                        <Badge variant="outline" className="font-normal">Approver</Badge>
                      </th>
                      <th className="text-center py-3 px-4 font-semibold">
                        <Badge variant="secondary" className="font-normal bg-emerald-100 text-emerald-700">Agent</Badge>
                      </th>
                      <th className="text-center py-3 px-4 font-semibold">
                        <Badge variant="destructive" className="font-normal">Admin</Badge>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { action: 'Create Request', perms: [true, true, true, true] },
                      { action: 'Edit Own (Draft)', perms: [true, true, true, true] },
                      { action: 'Approve / Reject', perms: [false, true, false, true] },
                      { action: 'Assign Tickets', perms: [false, false, true, true] },
                      { action: 'Change Status', perms: [false, false, true, true] },
                      { action: 'View Internal Notes', perms: [false, false, true, true] },
                      { action: 'Manage Configuration', perms: [false, false, false, true] },
                    ].map((row) => (
                      <tr key={row.action} className="border-b hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-slate-700">{row.action}</td>
                        {row.perms.map((p, i) => (
                          <td key={i} className="text-center py-3 px-4">
                            {p ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600">✓</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accessibility */}
        <TabsContent value="accessibility" className="space-y-8">
          <div className="text-center mb-2">
            <h3 className="text-xl font-semibold text-slate-900">Accessibility Checklist</h3>
            <p className="text-slate-500 mt-1">Built for everyone</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: 'Keyboard Navigation',
                items: ['All elements focusable', 'Logical tab order', 'Visible focus indicators', 'Escape closes modals', '⌘K command palette'],
                icon: '⌨️',
              },
              {
                title: 'Screen Readers',
                items: ['Semantic HTML', 'ARIA labels', 'Role attributes', 'Meaningful descriptions'],
                icon: '🔊',
              },
              {
                title: 'Visual Design',
                items: ['WCAG AA contrast (4.5:1)', 'Color + text indicators', 'Resizable up to 200%', 'Text labels on badges'],
                icon: '👁️',
              },
              {
                title: 'Forms',
                items: ['Labels linked to inputs', 'Announced errors', 'Clear required markers', 'Helper text provided'],
                icon: '📝',
              },
            ].map((section) => (
              <div key={section.title} className="p-6 rounded-xl border bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{section.icon}</span>
                  <div>
                    <h4 className="font-semibold text-slate-900">{section.title}</h4>
                    <span className="text-xs text-emerald-600 font-medium">✓ Implemented</span>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-slate-600">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-8">
          <div className="text-center mb-2">
            <h3 className="text-xl font-semibold text-slate-900">Analytics & Instrumentation</h3>
            <p className="text-slate-500 mt-1">Key events and metrics for product insights</p>
          </div>

          {/* Core Events */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tracked Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { event: 'request_created', desc: 'Track volume by type' },
                  { event: 'request_submitted', desc: 'Measure submission funnel' },
                  { event: 'approval_decision', desc: 'Find approval bottlenecks' },
                  { event: 'status_changed', desc: 'Identify workflow issues' },
                  { event: 'sla_breached', desc: 'Monitor SLA compliance' },
                  { event: 'request_resolved', desc: 'Track resolution metrics' },
                ].map((e) => (
                  <div key={e.event} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <code className="text-xs font-mono text-slate-600 bg-white px-2 py-1 rounded border">{e.event}</code>
                    <span className="text-sm text-slate-500">{e.desc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-6 rounded-xl border bg-white">
              <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">📊</span>
                Operational Metrics
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                {['Average first response time', 'Average resolution time', 'SLA breach rate', 'Requests per category', 'Agent workload'].map((m) => (
                  <li key={m} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-xl border bg-white">
              <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">💜</span>
                User Experience
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                {['Form completion rate', 'Time to submit', 'Reopen rate', 'User satisfaction (CSAT)', 'Feature adoption'].map((m) => (
                  <li key={m} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tradeoffs */}
          <Card className="border-0 bg-slate-50">
            <CardHeader className="text-center pb-2">
              <CardTitle>Scope & Tradeoffs</CardTitle>
              <CardDescription>What&apos;s in vs. out for this demo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white border">
                  <h4 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> Fully Built
                  </h4>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    {['CRUD for requests', 'Role-based permissions', 'Dynamic forms', 'SLA tracking', 'Audit timeline', 'Comments & notes'].map((i) => (
                      <li key={i}>• {i}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-white border">
                  <h4 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
                    <span className="text-amber-500">~</span> Simulated
                  </h4>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    {['Backend API', 'Authentication', 'File uploads', 'Email notifications', 'Real-time updates'].map((i) => (
                      <li key={i}>• {i}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-white border">
                  <h4 className="font-semibold text-slate-500 mb-3 flex items-center gap-2">
                    <span className="text-slate-400">○</span> Out of Scope
                  </h4>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    {['Real database', 'OAuth/SSO', 'Bulk import/export', 'Report builder', 'Mobile app'].map((i) => (
                      <li key={i}>• {i}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
