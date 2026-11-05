'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { store } from '@/lib/data/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { StatusBadge, PriorityBadge, SlaBadge } from '@/components/shared/status-badge'
import { formatRelativeTime, formatDateTime } from '@/lib/utils'
import type { Request } from '@/types'
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  FileText,
  ExternalLink,
} from 'lucide-react'

export default function ApprovalsPage() {
  const router = useRouter()
  const { user, currentRole, isLoading: authLoading } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'needs-info' | null>(null)
  const [reason, setReason] = useState('')

  const loadRequests = useCallback(() => {
    if (!user) return
    setRequests(store.getRequestsByApprover(user.id))
    setIsLoading(false)
  }, [user])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const handleAction = () => {
    if (!user || !selectedRequest || !actionType) return

    switch (actionType) {
      case 'approve':
        store.approveRequest(selectedRequest.id, user.id, reason)
        toast({ title: 'Request approved', variant: 'success' })
        break
      case 'reject':
        if (!reason.trim()) return
        store.rejectRequest(selectedRequest.id, user.id, reason)
        toast({ title: 'Request rejected' })
        break
      case 'needs-info':
        if (!reason.trim()) return
        store.requestInfo(selectedRequest.id, user.id, reason)
        toast({ title: 'Information requested' })
        break
    }

    setSelectedRequest(null)
    setActionType(null)
    setReason('')
    loadRequests()
  }

  const openActionDialog = (request: Request, action: 'approve' | 'reject' | 'needs-info') => {
    setSelectedRequest(request)
    setActionType(action)
    setReason('')
  }

  if (authLoading || isLoading) {
    return <ApprovalsPageSkeleton />
  }

  if (currentRole !== 'approver' && currentRole !== 'admin') {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold">Access Denied</h1>
        <p className="text-slate-500 mt-2">You do not have permission to view this page.</p>
      </div>
    )
  }

  const atRisk = requests.filter(r => r.slaStatus === 'at-risk' || r.slaStatus === 'breached')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Approvals</h1>
        <p className="text-slate-500 mt-1">Review and approve pending requests</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{requests.length}</p>
                <p className="text-sm text-slate-500">Pending Approvals</p>
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
                <p className="text-sm text-slate-500">At Risk / Breached</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">4.2h</p>
                <p className="text-sm text-slate-500">Avg Response Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Requests awaiting your decision</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-slate-900">All caught up!</h3>
              <p className="text-sm text-slate-500 mt-1">
                No pending approvals at the moment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-slate-400">{request.ticketId}</span>
                        <PriorityBadge priority={request.priority} />
                        {request.slaStatus && request.slaStatus !== 'on-track' && (
                          <SlaBadge status={request.slaStatus} />
                        )}
                      </div>
                      <Link 
                        href={`/requests/${request.id}`}
                        className="font-medium text-slate-900 hover:text-blue-600 mt-1 block"
                      >
                        {request.title}
                      </Link>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {request.description}
                      </p>
                      
                      {/* Request details */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[10px]">
                              {request.creator?.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{request.creator?.name}</span>
                        </div>
                        <span>•</span>
                        <span>{request.requestType?.name}</span>
                        <span>•</span>
                        <span>Submitted {formatRelativeTime(request.submittedAt || request.createdAt)}</span>
                      </div>

                      {/* Form data preview */}
                      {request.formData && Object.keys(request.formData).length > 0 && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-md">
                          <p className="text-xs font-medium text-slate-600 mb-2">Request Details</p>
                          <dl className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(request.formData).slice(0, 4).map(([key, value]) => (
                              <div key={key}>
                                <dt className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</dt>
                                <dd className="font-medium text-slate-700 truncate">
                                  {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => openActionDialog(request, 'approve')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openActionDialog(request, 'reject')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openActionDialog(request, 'needs-info')}
                      >
                        <HelpCircle className="h-4 w-4 mr-1" />
                        Need Info
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                      >
                        <Link href={`/requests/${request.id}`}>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!selectedRequest && !!actionType} onOpenChange={() => {
        setSelectedRequest(null)
        setActionType(null)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Request'}
              {actionType === 'reject' && 'Reject Request'}
              {actionType === 'needs-info' && 'Request More Information'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' && 'This will approve the request and move it to the processing queue.'}
              {actionType === 'reject' && 'Please provide a reason for rejecting this request.'}
              {actionType === 'needs-info' && 'What information do you need from the requester?'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="p-3 bg-slate-50 rounded-md">
              <p className="font-medium text-sm">{selectedRequest.title}</p>
              <p className="text-xs text-slate-500 mt-1">
                {selectedRequest.ticketId} • {selectedRequest.creator?.name}
              </p>
            </div>
          )}

          <Textarea
            placeholder={
              actionType === 'approve' 
                ? 'Add a comment (optional)'
                : actionType === 'reject'
                ? 'Reason for rejection (required)'
                : 'What information is needed? (required)'
            }
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedRequest(null)
              setActionType(null)
            }}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'approve' ? 'success' : actionType === 'reject' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={(actionType === 'reject' || actionType === 'needs-info') && !reason.trim()}
            >
              {actionType === 'approve' && 'Approve'}
              {actionType === 'reject' && 'Reject'}
              {actionType === 'needs-info' && 'Request Info'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ApprovalsPageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48 mt-2" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full mb-4" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
