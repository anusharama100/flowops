'use client'

import { Badge } from '@/components/ui/badge'
import type { RequestStatus, ApprovalState, Priority, SlaStatus } from '@/types'
import { cn } from '@/lib/utils'

const statusLabels: Record<RequestStatus, string> = {
  'draft': 'Draft',
  'submitted': 'Submitted',
  'needs-info': 'Needs Info',
  'triaged': 'Triaged',
  'in-progress': 'In Progress',
  'blocked': 'Blocked',
  'resolved': 'Resolved',
  'closed': 'Closed',
}

export function StatusBadge({ status, className }: { status: RequestStatus; className?: string }) {
  return (
    <Badge variant={status} className={cn('capitalize', className)}>
      {statusLabels[status]}
    </Badge>
  )
}

const priorityLabels: Record<Priority, string> = {
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High',
  'critical': 'Critical',
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <Badge variant={priority} className={cn('capitalize', className)}>
      {priorityLabels[priority]}
    </Badge>
  )
}

const approvalLabels: Record<ApprovalState, string> = {
  'pending': 'Pending Approval',
  'approved': 'Approved',
  'rejected': 'Rejected',
  'needs-info': 'Needs Info',
  'not-required': 'No Approval Needed',
}

export function ApprovalBadge({ state, className }: { state: ApprovalState; className?: string }) {
  return (
    <Badge variant={state} className={cn('capitalize', className)}>
      {approvalLabels[state]}
    </Badge>
  )
}

const slaLabels: Record<SlaStatus, string> = {
  'on-track': 'On Track',
  'at-risk': 'At Risk',
  'breached': 'Breached',
}

const slaIcons: Record<SlaStatus, string> = {
  'on-track': '●',
  'at-risk': '◐',
  'breached': '○',
}

export function SlaBadge({ status, className }: { status: SlaStatus; className?: string }) {
  return (
    <Badge variant={status} className={cn('gap-1', className)}>
      <span className="text-xs">{slaIcons[status]}</span>
      {slaLabels[status]}
    </Badge>
  )
}
