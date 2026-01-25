'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { store } from '@/lib/data/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { StatusBadge, PriorityBadge, SlaBadge, ApprovalBadge } from '@/components/shared/status-badge'
import { formatDateTime, formatRelativeTime } from '@/lib/utils'
import type { Request, RequestStatus, User, TimelineEvent } from '@/types'
import {
  ArrowLeft,
  Clock,
  User as UserIcon,
  Users,
  Calendar,
  Tag,
  FileText,
  MessageSquare,
  Lock,
  Send,
  CheckCircle,
  XCircle,
  HelpCircle,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  ChevronRight,
  Paperclip,
  ExternalLink,
} from 'lucide-react'

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, currentRole, permissions, isLoading: authLoading } = useAuth()
  const [request, setRequest] = useState<Request | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [internalNote, setInternalNote] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  
  // Modal states
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showNeedsInfoDialog, setShowNeedsInfoDialog] = useState(false)
  const [showResolveDialog, setShowResolveDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)

  const [reason, setReason] = useState('')
  const [resolutionCode, setResolutionCode] = useState('')
  const [resolutionSummary, setResolutionSummary] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus>('triaged')

  const requestId = params.id as string

  const loadRequest = () => {
    const req = store.getRequest(requestId)
    if (req) {
      setRequest(req)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (user && requestId) {
      loadRequest()
    }
  }, [user, requestId])

  const handleAddComment = async () => {
    if (!user || !request || !comment.trim()) return

    setIsSubmittingComment(true)
    try {
      store.addComment(request.id, comment, user.id)
      setComment('')
      loadRequest()
      toast({ title: 'Comment added' })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleAddInternalNote = async () => {
    if (!user || !request || !internalNote.trim()) return

    store.addInternalNote(request.id, internalNote, user.id)
    setInternalNote('')
    loadRequest()
    toast({ title: 'Internal note added' })
  }

  const handleApprove = () => {
    if (!user || !request) return
    store.approveRequest(request.id, user.id, reason)
    setShowApproveDialog(false)
    setReason('')
    loadRequest()
    toast({ title: 'Request approved', variant: 'success' })
  }

  const handleReject = () => {
    if (!user || !request || !reason.trim()) return
    store.rejectRequest(request.id, user.id, reason)
    setShowRejectDialog(false)
    setReason('')
    loadRequest()
    toast({ title: 'Request rejected' })
  }

  const handleNeedsInfo = () => {
    if (!user || !request || !reason.trim()) return
    store.requestInfo(request.id, user.id, reason)
    setShowNeedsInfoDialog(false)
    setReason('')
    loadRequest()
    toast({ title: 'Information requested' })
  }

  const handleAssign = () => {
    if (!user || !request || !selectedAssignee) return
    store.assignRequest(request.id, selectedAssignee, user.id)
    setShowAssignDialog(false)
    setSelectedAssignee('')
    loadRequest()
    toast({ title: 'Request assigned' })
  }

  const handleStatusChange = () => {
    if (!user || !request) return
    store.changeStatus(request.id, selectedStatus, user.id, { reason })
    setShowStatusDialog(false)
    setReason('')
    loadRequest()
    toast({ title: 'Status updated' })
  }

  const handleResolve = () => {
    if (!user || !request || !resolutionSummary.trim()) return
    store.changeStatus(request.id, 'resolved', user.id, {
      resolutionCode,
      resolutionSummary,
    })
    setShowResolveDialog(false)
    setResolutionCode('')
    setResolutionSummary('')
    loadRequest()
    toast({ title: 'Request resolved', variant: 'success' })
  }

  const handleClose = () => {
    if (!user || !request) return
    store.changeStatus(request.id, 'closed', user.id)
    loadRequest()
    toast({ title: 'Request closed' })
  }

  const handleAssignToMe = () => {
    if (!user || !request) return
    store.assignRequest(request.id, user.id, user.id)
    loadRequest()
    toast({ title: 'Assigned to you' })
  }

  if (authLoading || isLoading) {
    return <RequestDetailSkeleton />
  }

  if (!request) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold">Request not found</h1>
        <p className="text-slate-500 mt-2">The request you are looking for does not exist.</p>
        <Button className="mt-4" asChild>
          <Link href="/requests">Back to Requests</Link>
        </Button>
      </div>
    )
  }

  const isOwner = request.createdBy === user?.id
  const isAssignee = request.assigneeId === user?.id
  const isApprover = request.approverId === user?.id
  const canApprove = isApprover && request.approvalState === 'pending' && request.status === 'submitted'
  const canResolve = (permissions.canResolve || isAssignee) && ['triaged', 'in-progress'].includes(request.status)
  const canAssign = permissions.canAssign
  const canChangeStatus = permissions.canEdit || isAssignee
  const agents = store.getUsersByRole('agent')

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/requests">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-mono text-slate-500">{request.ticketId}</span>
            <StatusBadge status={request.status} />
            {request.approvalRequired && <ApprovalBadge state={request.approvalState} />}
            {request.slaStatus && <SlaBadge status={request.slaStatus} />}
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mt-2">{request.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
            <span>Created by {request.creator?.name}</span>
            <span>•</span>
            <span>{formatRelativeTime(request.createdAt)}</span>
            {request.category && (
              <>
                <span>•</span>
                <span>{request.category}</span>
              </>
            )}
          </div>
        </div>
        <PriorityBadge priority={request.priority} />
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-2 mb-6 p-3 bg-slate-50 rounded-lg">
        {canApprove && (
          <>
            <Button size="sm" variant="success" onClick={() => setShowApproveDialog(true)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setShowRejectDialog(true)}>
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowNeedsInfoDialog(true)}>
              <HelpCircle className="h-4 w-4 mr-2" />
              Needs Info
            </Button>
            <Separator orientation="vertical" className="h-6" />
          </>
        )}

        {canAssign && (
          <>
            <Button size="sm" variant="outline" onClick={handleAssignToMe}>
              <UserIcon className="h-4 w-4 mr-2" />
              Assign to Me
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAssignDialog(true)}>
              <Users className="h-4 w-4 mr-2" />
              Assign
            </Button>
          </>
        )}

        {canChangeStatus && request.status === 'triaged' && (
          <Button size="sm" variant="outline" onClick={() => {
            store.changeStatus(request.id, 'in-progress', user!.id)
            loadRequest()
          }}>
            <Play className="h-4 w-4 mr-2" />
            Start Work
          </Button>
        )}

        {canResolve && (
          <Button size="sm" variant="success" onClick={() => setShowResolveDialog(true)}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Resolve
          </Button>
        )}

        {request.status === 'resolved' && (isOwner || permissions.canClose) && (
          <Button size="sm" variant="outline" onClick={handleClose}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Close
          </Button>
        )}

        {canChangeStatus && (
          <Button size="sm" variant="ghost" onClick={() => setShowStatusDialog(true)}>
            Change Status
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 whitespace-pre-wrap">{request.description}</p>
            </CardContent>
          </Card>

          {/* Form Data */}
          {request.formData && Object.keys(request.formData).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Request Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  {Object.entries(request.formData).map(([key, value]) => (
                    <div key={key} className="flex gap-4">
                      <dt className="text-sm font-medium text-slate-500 capitalize w-40 shrink-0">
                        {key.replace(/_/g, ' ')}
                      </dt>
                      <dd className="text-sm text-slate-900">
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          )}

          {/* Tabs for Activity */}
          <Card>
            <Tabs defaultValue="comments">
              <CardHeader className="pb-0">
                <TabsList>
                  <TabsTrigger value="comments" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Comments ({request.comments.length})
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="gap-2">
                    <Clock className="h-4 w-4" />
                    Timeline ({request.timelineEvents.length})
                  </TabsTrigger>
                  {permissions.canViewInternalNotes && (
                    <TabsTrigger value="internal" className="gap-2">
                      <Lock className="h-4 w-4" />
                      Internal ({request.internalNotes.length})
                    </TabsTrigger>
                  )}
                </TabsList>
              </CardHeader>
              
              <TabsContent value="comments" className="px-6 pb-6">
                {/* Comment List */}
                <div className="space-y-4 mt-4">
                  {request.comments.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No comments yet</p>
                  ) : (
                    request.comments.map((cmt) => (
                      <div key={cmt.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {cmt.author?.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{cmt.author?.name}</span>
                            <span className="text-xs text-slate-400">{formatRelativeTime(cmt.createdAt)}</span>
                          </div>
                          <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{cmt.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Add Comment */}
                <div className="mt-4 pt-4 border-t">
                  <Textarea
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <Button size="sm" onClick={handleAddComment} disabled={!comment.trim() || isSubmittingComment}>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="px-6 pb-6">
                <div className="space-y-4 mt-4">
                  {request.timelineEvents
                    .slice()
                    .reverse()
                    .map((event) => (
                      <TimelineEventItem key={event.id} event={event} />
                    ))}
                </div>
              </TabsContent>

              {permissions.canViewInternalNotes && (
                <TabsContent value="internal" className="px-6 pb-6">
                  <div className="space-y-4 mt-4">
                    {request.internalNotes.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">No internal notes</p>
                    ) : (
                      request.internalNotes.map((note) => (
                        <div key={note.id} className="flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-amber-100">
                              {note.author?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{note.author?.name}</span>
                              <Badge variant="outline" className="text-xs">Internal</Badge>
                              <span className="text-xs text-slate-400">{formatRelativeTime(note.createdAt)}</span>
                            </div>
                            <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{note.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {permissions.canAddInternalNotes && (
                    <div className="mt-4 pt-4 border-t">
                      <Textarea
                        placeholder="Add an internal note (not visible to requester)..."
                        value={internalNote}
                        onChange={(e) => setInternalNote(e.target.value)}
                        rows={3}
                        className="border-amber-200 focus:border-amber-300"
                      />
                      <div className="flex justify-end mt-2">
                        <Button size="sm" variant="outline" onClick={handleAddInternalNote} disabled={!internalNote.trim()}>
                          <Lock className="h-4 w-4 mr-2" />
                          Add Internal Note
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Assignee</span>
                <div className="flex items-center gap-2">
                  {request.assignee ? (
                    <>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {request.assignee.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{request.assignee.name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400">Unassigned</span>
                  )}
                </div>
              </div>

              {request.approvalRequired && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Approver</span>
                  <div className="flex items-center gap-2">
                    {request.approver ? (
                      <>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {request.approver.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{request.approver.name}</span>
                      </>
                    ) : (
                      <span className="text-sm text-slate-400">Pending</span>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Request Type</span>
                <span className="text-sm font-medium">{request.requestType?.name || 'Unknown'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Category</span>
                <span className="text-sm font-medium">{request.category}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Priority</span>
                <PriorityBadge priority={request.priority} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Created</span>
                <span className="text-sm">{formatDateTime(request.createdAt)}</span>
              </div>

              {request.submittedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Submitted</span>
                  <span className="text-sm">{formatDateTime(request.submittedAt)}</span>
                </div>
              )}

              {request.dueAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Due</span>
                  <span className="text-sm">{formatDateTime(request.dueAt)}</span>
                </div>
              )}

              {request.resolvedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Resolved</span>
                  <span className="text-sm">{formatDateTime(request.resolvedAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {request.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {request.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resolution */}
          {request.resolutionSummary && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-base text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Resolution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700">{request.resolutionSummary}</p>
              </CardContent>
            </Card>
          )}

          {/* Blocked */}
          {request.status === 'blocked' && request.blockedReason && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-base text-red-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Blocked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">{request.blockedReason}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this request?
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Add a comment (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancel</Button>
            <Button variant="success" onClick={handleApprove}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection (required)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!reason.trim()}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNeedsInfoDialog} onOpenChange={setShowNeedsInfoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request More Information</DialogTitle>
            <DialogDescription>
              What information do you need from the requester?
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Describe what information is needed (required)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNeedsInfoDialog(false)}>Cancel</Button>
            <Button onClick={handleNeedsInfo} disabled={!reason.trim()}>Request Info</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Request</DialogTitle>
            <DialogDescription>
              Provide resolution details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Resolution Code</label>
              <Select value={resolutionCode} onValueChange={setResolutionCode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cannot_reproduce">Cannot Reproduce</SelectItem>
                  <SelectItem value="duplicate">Duplicate</SelectItem>
                  <SelectItem value="wont_fix">Won&apos;t Fix</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Resolution Summary</label>
              <Textarea
                placeholder="Describe how this was resolved (required)"
                value={resolutionSummary}
                onChange={(e) => setResolutionSummary(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>Cancel</Button>
            <Button variant="success" onClick={handleResolve} disabled={!resolutionSummary.trim()}>Resolve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Request</DialogTitle>
            <DialogDescription>
              Select an agent to assign this request to.
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
            <SelectTrigger>
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!selectedAssignee}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Status</label>
              <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as RequestStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="triaged">Triaged</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Reason (optional)</label>
              <Textarea
                placeholder="Why is the status changing?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>Cancel</Button>
            <Button onClick={handleStatusChange}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TimelineEventItem({ event }: { event: TimelineEvent }) {
  const getEventIcon = () => {
    switch (event.type) {
      case 'created': return <FileText className="h-4 w-4" />
      case 'submitted': return <Send className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />
      case 'assigned': return <UserIcon className="h-4 w-4" />
      case 'status_changed': return <ChevronRight className="h-4 w-4" />
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'closed': return <CheckCircle className="h-4 w-4" />
      case 'comment_added': return <MessageSquare className="h-4 w-4" />
      case 'info_requested': return <HelpCircle className="h-4 w-4 text-amber-600" />
      case 'blocked': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getEventDescription = () => {
    switch (event.type) {
      case 'created': return 'created this request'
      case 'submitted': return 'submitted this request'
      case 'approved': return 'approved this request'
      case 'rejected': return 'rejected this request'
      case 'assigned': return `assigned to ${store.getUser(event.details.assigneeId as string)?.name || 'someone'}`
      case 'status_changed': return `changed status from ${event.details.previousValue} to ${event.details.newValue}`
      case 'resolved': return 'resolved this request'
      case 'closed': return 'closed this request'
      case 'comment_added': return 'added a comment'
      case 'internal_note_added': return 'added an internal note'
      case 'info_requested': return 'requested more information'
      case 'blocked': return 'marked as blocked'
      case 'priority_changed': return `changed priority from ${event.details.previousValue} to ${event.details.newValue}`
      default: return event.type.replace(/_/g, ' ')
    }
  }

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-1.5 rounded-full bg-slate-100">
        {getEventIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{event.actor?.name}</span>{' '}
          <span className="text-slate-600">{getEventDescription()}</span>
        </p>
        {event.details.reason && (
          <p className="text-sm text-slate-500 mt-1">&ldquo;{event.details.reason}&rdquo;</p>
        )}
        <p className="text-xs text-slate-400 mt-1">{formatRelativeTime(event.timestamp)}</p>
      </div>
    </div>
  )
}

function RequestDetailSkeleton() {
  return (
    <div className="p-6">
      <div className="flex items-start gap-4 mb-6">
        <Skeleton className="h-10 w-10" />
        <div className="flex-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-96 mt-2" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
      </div>
      <Skeleton className="h-12 w-full mb-6" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-96" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  )
}
