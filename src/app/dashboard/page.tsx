'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { store } from '@/lib/data/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge, PriorityBadge, SlaBadge } from '@/components/shared/status-badge'
import { formatRelativeTime } from '@/lib/utils'
import type { Request, DashboardMetrics } from '@/types'
import {
  Plus,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Inbox,
  Timer,
  BarChart3,
  Lightbulb,
  HelpCircle,
  Settings,
  X,
} from 'lucide-react'

export default function DashboardPage() {
  const { user, currentRole, isLoading: authLoading } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDemoScenarios, setShowDemoScenarios] = useState(true)

  useEffect(() => {
    if (user) {
      const allRequests = store.getRequests()
      setRequests(allRequests)
      setMetrics(store.getDashboardMetrics())
      setIsLoading(false)
    }
    // Check if demo was dismissed
    const dismissed = localStorage.getItem('flowops_demo_dismissed')
    if (dismissed) {
      setShowDemoScenarios(false)
    }
  }, [user])

  const dismissDemoScenarios = () => {
    setShowDemoScenarios(false)
    localStorage.setItem('flowops_demo_dismissed', 'true')
  }

  if (authLoading || isLoading) {
    return <DashboardSkeleton />
  }

  // Filter requests based on role
  const myRequests = requests.filter(r => r.createdBy === user?.id)
  const assignedRequests = requests.filter(r => r.assigneeId === user?.id)
  const pendingApprovals = requests.filter(r => r.approverId === user?.id && r.approvalState === 'pending')
  const atRiskRequests = requests.filter(r => r.slaStatus === 'at-risk' || r.slaStatus === 'breached')
  const unassignedRequests = requests.filter(r => !r.assigneeId && r.status === 'submitted')

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, {user?.name}</p>
        </div>
        <Button asChild>
          <Link href="/requests/new">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Link>
        </Button>
      </div>

      {/* Role-specific content */}
      {currentRole === 'requester' && (
        <RequesterDashboard
          myRequests={myRequests}
          metrics={metrics}
        />
      )}
      {currentRole === 'approver' && (
        <ApproverDashboard
          pendingApprovals={pendingApprovals}
          atRiskRequests={atRiskRequests.filter(r => r.createdBy === user?.id || r.approverId === user?.id)}
          metrics={metrics}
        />
      )}
      {currentRole === 'agent' && (
        <AgentDashboard
          assignedRequests={assignedRequests}
          unassignedRequests={unassignedRequests}
          atRiskRequests={atRiskRequests}
          metrics={metrics}
        />
      )}
      {currentRole === 'admin' && (
        <AdminDashboard
          requests={requests}
          metrics={metrics}
        />
      )}

      {/* Demo Scenarios - Dismissible */}
      {showDemoScenarios && <DemoScenarios onDismiss={dismissDemoScenarios} />}
    </div>
  )
}

function RequesterDashboard({ myRequests, metrics }: { myRequests: Request[]; metrics: DashboardMetrics | null }) {
  const openRequests = myRequests.filter(r => !['closed', 'resolved'].includes(r.status))
  const recentRequests = myRequests.slice(0, 5)

  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="My Open Requests"
          value={openRequests.length}
          icon={FileText}
          trend="+2 this week"
          href="/requests?tab=mine&status=open"
        />
        <StatCard
          title="Pending Approval"
          value={myRequests.filter(r => r.approvalState === 'pending').length}
          icon={Clock}
          variant="warning"
          href="/requests?tab=mine&approval=pending"
        />
        <StatCard
          title="Resolved"
          value={myRequests.filter(r => r.status === 'resolved').length}
          icon={CheckCircle}
          variant="success"
          href="/requests?tab=mine&status=resolved"
        />
        <StatCard
          title="Total Requests"
          value={myRequests.length}
          icon={TrendingUp}
          href="/requests?tab=mine"
        />
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">My Recent Requests</CardTitle>
            <CardDescription>Your latest submitted requests</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/requests">
              View All <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <EmptyState
              title="No requests yet"
              description="Create your first request to get started"
              action={{ label: 'New Request', href: '/requests/new' }}
            />
          ) : (
            <div className="space-y-3">
              {recentRequests.map(request => (
                <RequestRow key={request.id} request={request} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function ApproverDashboard({
  pendingApprovals,
  atRiskRequests,
  metrics,
}: {
  pendingApprovals: Request[]
  atRiskRequests: Request[]
  metrics: DashboardMetrics | null
}) {
  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Pending Approvals"
          value={pendingApprovals.length}
          icon={Clock}
          variant="warning"
          href="/approvals"
        />
        <StatCard
          title="At Risk"
          value={atRiskRequests.length}
          icon={AlertTriangle}
          variant="danger"
          href="/requests?sla=at-risk"
        />
        <StatCard
          title="Approved Today"
          value={3}
          icon={CheckCircle}
          variant="success"
          href="/requests?status=resolved"
        />
        <StatCard
          title="Avg Response Time"
          value="4.2h"
          icon={Timer}
        />
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Pending Approvals</CardTitle>
            <CardDescription>Requests awaiting your decision</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/approvals">
              View All <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <EmptyState
              title="No pending approvals"
              description="All caught up! Check back later for new approval requests."
            />
          ) : (
            <div className="space-y-3">
              {pendingApprovals.slice(0, 5).map(request => (
                <RequestRow key={request.id} request={request} showApprovalActions />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function AgentDashboard({
  assignedRequests,
  unassignedRequests,
  atRiskRequests,
  metrics,
}: {
  assignedRequests: Request[]
  unassignedRequests: Request[]
  atRiskRequests: Request[]
  metrics: DashboardMetrics | null
}) {
  const activeAssigned = assignedRequests.filter(r => !['closed', 'resolved'].includes(r.status))

  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="My Active Tickets"
          value={activeAssigned.length}
          icon={FileText}
          href="/queue?tab=my-queue"
        />
        <StatCard
          title="Unassigned Queue"
          value={unassignedRequests.length}
          icon={Inbox}
          variant="warning"
          href="/queue?tab=unassigned"
        />
        <StatCard
          title="At Risk / Breached"
          value={atRiskRequests.length}
          icon={AlertTriangle}
          variant="danger"
          href="/queue?tab=at-risk"
        />
        <StatCard
          title="Resolved Today"
          value={metrics?.resolvedToday || 0}
          icon={CheckCircle}
          variant="success"
          href="/requests?status=resolved"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Unassigned Queue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Triage Queue</CardTitle>
              <CardDescription>Unassigned requests needing attention</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/queue">
                View Queue <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {unassignedRequests.length === 0 ? (
              <EmptyState
                title="Queue is clear"
                description="All requests have been assigned"
              />
            ) : (
              <div className="space-y-3">
                {unassignedRequests.slice(0, 4).map(request => (
                  <RequestRow key={request.id} request={request} showAssign />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* At Risk */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              SLA At Risk
            </CardTitle>
            <CardDescription>Requests approaching or past SLA</CardDescription>
          </CardHeader>
          <CardContent>
            {atRiskRequests.length === 0 ? (
              <EmptyState
                title="All on track"
                description="No requests at risk of SLA breach"
              />
            ) : (
              <div className="space-y-3">
                {atRiskRequests.slice(0, 4).map(request => (
                  <RequestRow key={request.id} request={request} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function AdminDashboard({
  requests,
  metrics,
}: {
  requests: Request[]
  metrics: DashboardMetrics | null
}) {
  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Requests"
          value={metrics?.totalRequests || 0}
          icon={FileText}
          href="/requests"
        />
        <StatCard
          title="Open Requests"
          value={metrics?.openRequests || 0}
          icon={Inbox}
          href="/requests?status=open"
        />
        <StatCard
          title="SLA Breach Rate"
          value={`${metrics?.slaBreachRate || 0}%`}
          icon={AlertTriangle}
          variant={metrics?.slaBreachRate && metrics.slaBreachRate > 10 ? 'danger' : 'default'}
          href="/requests?sla=breached"
        />
        <StatCard
          title="Avg Resolution"
          value={`${metrics?.avgResolutionHours || 0}h`}
          icon={Timer}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Requests by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Requests by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.requestsByStatus && Object.entries(metrics.requestsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status as any} />
                  </div>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Requests by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Requests by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.requestsByCategory && Object.entries(metrics.requestsByCategory).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{category}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration</CardTitle>
          <CardDescription>Manage system settings and configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Link href="/admin/request-types" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
              <FileText className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-sm">Request Types</p>
                <p className="text-xs text-slate-500">Manage form schemas</p>
              </div>
            </Link>
            <Link href="/admin/sla-policies" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
              <Timer className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-sm">SLA Policies</p>
                <p className="text-xs text-slate-500">Configure SLA targets</p>
              </div>
            </Link>
            <Link href="/admin/workflows" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
              <TrendingUp className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-sm">Workflows</p>
                <p className="text-xs text-slate-500">Status transitions</p>
              </div>
            </Link>
            <Link href="/admin/canned-responses" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
              <FileText className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-sm">Canned Responses</p>
                <p className="text-xs text-slate-500">Manage templates</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  href,
}: {
  title: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  trend?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
  href?: string
}) {
  const iconColors = {
    default: 'bg-slate-100 text-slate-600',
    success: 'bg-emerald-100 text-emerald-600',
    warning: 'bg-amber-100 text-amber-600',
    danger: 'bg-red-100 text-red-600',
  }

  const content = (
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {trend && (
            <p className="text-sm text-slate-500 mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconColors[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        <Card className="hover:shadow-md hover:border-slate-300 transition-all cursor-pointer">
          {content}
        </Card>
      </Link>
    )
  }

  return <Card>{content}</Card>
}

function RequestRow({
  request,
  showApprovalActions,
  showAssign,
}: {
  request: Request
  showApprovalActions?: boolean
  showAssign?: boolean
}) {
  return (
    <Link
      href={`/requests/${request.id}`}
      className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">{request.ticketId}</span>
            <StatusBadge status={request.status} />
            {request.slaStatus && request.slaStatus !== 'on-track' && (
              <SlaBadge status={request.slaStatus} />
            )}
          </div>
          <p className="font-medium text-sm truncate mt-1">{request.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {request.creator?.name} • {formatRelativeTime(request.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <PriorityBadge priority={request.priority} />
        <ArrowRight className="h-4 w-4 text-slate-400" />
      </div>
    </Link>
  )
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: { label: string; href: string }
}) {
  return (
    <div className="text-center py-8">
      <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <FileText className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="font-medium text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
      {action && (
        <Button className="mt-4" asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  )
}

function DemoScenarios({ onDismiss }: { onDismiss: () => void }) {
  const scenarios = [
    {
      title: 'Approve a Software Access Request',
      description: 'Switch to Approver role, review request FO-10001 and approve/reject it',
      href: '/requests/req-1',
      role: 'approver',
      icon: CheckCircle,
    },
    {
      title: 'Agent Triages Unassigned Bug',
      description: 'Switch to Agent role, assign yourself to the critical bug FO-10003',
      href: '/requests/req-3',
      role: 'agent',
      icon: Inbox,
    },
    {
      title: 'Requester Responds to Needs Info',
      description: 'Switch to Requester, check request FO-10002 that needs additional info',
      href: '/requests/req-2',
      role: 'requester',
      icon: HelpCircle,
    },
    {
      title: 'Configure a New Request Type',
      description: 'Switch to Admin, customize form fields for a request type',
      href: '/admin/request-types',
      role: 'admin',
      icon: Settings,
    },
  ]

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Try These Workflows
            </CardTitle>
            <CardDescription>
              Click a scenario to jump to the exact record. Switch roles using the header dropdown.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onDismiss} className="text-slate-400 hover:text-slate-600 -mt-1 -mr-2">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {scenarios.map((scenario, i) => {
            const Icon = scenario.icon
            return (
              <Link
                key={i}
                href={scenario.href}
                className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-white hover:bg-amber-50 hover:border-amber-300 transition-colors group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm group-hover:text-amber-700 transition-colors">
                    {scenario.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{scenario.description}</p>
                  <Badge variant="outline" className="mt-2 text-xs border-amber-300 text-amber-700 bg-amber-50">
                    {scenario.role}
                  </Badge>
                </div>
                <ArrowRight className="h-4 w-4 text-amber-400 group-hover:text-amber-600 transition-colors shrink-0 mt-1" />
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
