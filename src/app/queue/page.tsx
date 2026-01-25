'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { store } from '@/lib/data/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { StatusBadge, PriorityBadge, SlaBadge } from '@/components/shared/status-badge'
import { formatRelativeTime } from '@/lib/utils'
import type { Request, Priority } from '@/types'
import {
  Inbox,
  UserPlus,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  Play,
  Zap,
} from 'lucide-react'

// Smart triage scoring
function calculateTriageScore(request: Request): number {
  let score = 0
  
  // Priority scoring
  const priorityScores: Record<Priority, number> = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25,
  }
  score += priorityScores[request.priority]
  
  // SLA scoring
  if (request.slaStatus === 'breached') score += 100
  else if (request.slaStatus === 'at-risk') score += 50
  
  // Age scoring (older = higher priority)
  const ageHours = (Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60)
  score += Math.min(ageHours * 2, 50)
  
  return score
}

export default function QueuePage() {
  const router = useRouter()
  const { user, currentRole, isLoading: authLoading } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('unassigned')

  useEffect(() => {
    if (user) {
      loadRequests()
    }
  }, [user])

  const loadRequests = () => {
    const allRequests = store.getRequests()
    setRequests(allRequests)
    setIsLoading(false)
  }

  // Filter requests by tab
  const unassigned = useMemo(() => 
    requests
      .filter(r => !r.assigneeId && ['submitted', 'triaged'].includes(r.status) && r.approvalState !== 'pending')
      .sort((a, b) => calculateTriageScore(b) - calculateTriageScore(a)),
    [requests]
  )

  const myQueue = useMemo(() =>
    requests
      .filter(r => r.assigneeId === user?.id && !['resolved', 'closed'].includes(r.status))
      .sort((a, b) => calculateTriageScore(b) - calculateTriageScore(a)),
    [requests, user]
  )

  const blocked = useMemo(() =>
    requests.filter(r => r.status === 'blocked'),
    [requests]
  )

  const atRisk = useMemo(() =>
    requests.filter(r => 
      (r.slaStatus === 'at-risk' || r.slaStatus === 'breached') && 
      !['resolved', 'closed'].includes(r.status)
    ).sort((a, b) => {
      if (a.slaStatus === 'breached' && b.slaStatus !== 'breached') return -1
      if (b.slaStatus === 'breached' && a.slaStatus !== 'breached') return 1
      return calculateTriageScore(b) - calculateTriageScore(a)
    }),
    [requests]
  )

  const handleAssignToMe = (request: Request) => {
    if (!user) return
    store.assignRequest(request.id, user.id, user.id)
    loadRequests()
    toast({ title: 'Assigned to you' })
  }

  const handleStartWork = (request: Request) => {
    if (!user) return
    if (!request.assigneeId) {
      store.assignRequest(request.id, user.id, user.id)
    }
    store.changeStatus(request.id, 'in-progress', user.id)
    loadRequests()
    toast({ title: 'Started work on request' })
  }

  if (authLoading || isLoading) {
    return <QueuePageSkeleton />
  }

  if (currentRole !== 'agent' && currentRole !== 'admin') {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold">Access Denied</h1>
        <p className="text-slate-500 mt-2">You do not have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Agent Queue</h1>
        <p className="text-slate-500 mt-1">Triage and manage incoming requests</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Inbox className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unassigned.length}</p>
                <p className="text-sm text-slate-500">Unassigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-violet-100">
                <UserPlus className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myQueue.length}</p>
                <p className="text-sm text-slate-500">My Queue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{atRisk.length}</p>
                <p className="text-sm text-slate-500">At Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{blocked.length}</p>
                <p className="text-sm text-slate-500">Blocked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="unassigned" className="gap-2">
            <Inbox className="h-4 w-4" />
            Unassigned
            {unassigned.length > 0 && (
              <Badge variant="secondary" className="ml-1">{unassigned.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="my-queue" className="gap-2">
            <UserPlus className="h-4 w-4" />
            My Queue
            {myQueue.length > 0 && (
              <Badge variant="secondary" className="ml-1">{myQueue.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="at-risk" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            At Risk
            {atRisk.length > 0 && (
              <Badge variant="destructive" className="ml-1">{atRisk.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="blocked" className="gap-2">
            <Clock className="h-4 w-4" />
            Blocked
            {blocked.length > 0 && (
              <Badge variant="secondary" className="ml-1">{blocked.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unassigned" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Triage Queue</CardTitle>
                  <CardDescription>
                    Sorted by smart triage score (priority + SLA risk + age)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Zap className="h-4 w-4" />
                  Smart Triage Active
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <QueueList
                requests={unassigned}
                emptyMessage="All requests are assigned"
                showAssign
                onAssignToMe={handleAssignToMe}
                onStartWork={handleStartWork}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-queue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Assigned Requests</CardTitle>
              <CardDescription>Requests currently assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <QueueList
                requests={myQueue}
                emptyMessage="No requests assigned to you"
                showStartWork
                onStartWork={handleStartWork}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="at-risk" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                SLA At Risk
              </CardTitle>
              <CardDescription>
                Requests approaching or past their SLA deadlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QueueList
                requests={atRisk}
                emptyMessage="No requests at risk"
                showAssign
                onAssignToMe={handleAssignToMe}
                onStartWork={handleStartWork}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocked" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Blocked Requests</CardTitle>
              <CardDescription>
                Requests waiting on external dependencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QueueList
                requests={blocked}
                emptyMessage="No blocked requests"
                showBlockedReason
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface QueueListProps {
  requests: Request[]
  emptyMessage: string
  showAssign?: boolean
  showStartWork?: boolean
  showBlockedReason?: boolean
  onAssignToMe?: (request: Request) => void
  onStartWork?: (request: Request) => void
}

function QueueList({
  requests,
  emptyMessage,
  showAssign,
  showStartWork,
  showBlockedReason,
  onAssignToMe,
  onStartWork,
}: QueueListProps) {
  const router = useRouter()

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="font-medium text-slate-900">{emptyMessage}</h3>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-slate-400">{request.ticketId}</span>
              <StatusBadge status={request.status} />
              <PriorityBadge priority={request.priority} />
              {request.slaStatus && request.slaStatus !== 'on-track' && (
                <SlaBadge status={request.slaStatus} />
              )}
            </div>
            <Link
              href={`/requests/${request.id}`}
              className="font-medium text-slate-900 hover:text-blue-600 mt-1 block truncate"
            >
              {request.title}
            </Link>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-[8px]">
                    {request.creator?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>{request.creator?.name}</span>
              </div>
              <span>•</span>
              <span>{request.category}</span>
              <span>•</span>
              <span>{formatRelativeTime(request.createdAt)}</span>
              {request.assignee && (
                <>
                  <span>•</span>
                  <span className="text-blue-600">→ {request.assignee.name}</span>
                </>
              )}
            </div>
            {showBlockedReason && request.blockedReason && (
              <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                <strong>Blocked:</strong> {request.blockedReason}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-4">
            {showAssign && !request.assigneeId && onAssignToMe && (
              <Button size="sm" variant="outline" onClick={() => onAssignToMe(request)}>
                <UserPlus className="h-4 w-4 mr-1" />
                Take
              </Button>
            )}
            {showStartWork && request.status !== 'in-progress' && onStartWork && (
              <Button size="sm" variant="outline" onClick={() => onStartWork(request)}>
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => router.push(`/requests/${request.id}`)}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

function QueuePageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48 mt-2" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-10 w-96" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full mb-3" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
