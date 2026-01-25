// ============================================================================
// Core Types for FlowOps Enterprise Request & Workflow Platform
// ============================================================================

// User Roles
export type UserRole = 'requester' | 'approver' | 'agent' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  team: string
  avatar?: string
  createdAt: string
}

// Request Status & Approval
export type RequestStatus = 
  | 'draft'
  | 'submitted'
  | 'needs-info'
  | 'triaged'
  | 'in-progress'
  | 'blocked'
  | 'resolved'
  | 'closed'

export type ApprovalState = 'pending' | 'approved' | 'rejected' | 'needs-info' | 'not-required'

export type Priority = 'low' | 'medium' | 'high' | 'critical'

export type Impact = 'low' | 'medium' | 'high' | 'critical'

export type Urgency = 'low' | 'medium' | 'high' | 'critical'

// SLA
export type SlaStatus = 'on-track' | 'at-risk' | 'breached'

export interface SlaPolicy {
  id: string
  name: string
  firstResponseHours: number
  resolutionHours: number
  businessHoursOnly: boolean
  priorities: {
    [key in Priority]: {
      firstResponseHours: number
      resolutionHours: number
    }
  }
}

// Attachments
export interface Attachment {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedBy: string
  uploadedAt: string
}

// Comments & Notes
export interface Comment {
  id: string
  content: string
  authorId: string
  author?: User
  createdAt: string
  updatedAt?: string
  isEdited?: boolean
  attachments?: Attachment[]
}

export interface InternalNote {
  id: string
  content: string
  authorId: string
  author?: User
  createdAt: string
}

// Timeline Events (Audit Log)
export type TimelineEventType =
  | 'created'
  | 'submitted'
  | 'status_changed'
  | 'assigned'
  | 'unassigned'
  | 'approval_requested'
  | 'approved'
  | 'rejected'
  | 'info_requested'
  | 'info_provided'
  | 'comment_added'
  | 'internal_note_added'
  | 'attachment_added'
  | 'attachment_removed'
  | 'priority_changed'
  | 'field_changed'
  | 'watcher_added'
  | 'watcher_removed'
  | 'sla_breached'
  | 'resolved'
  | 'closed'
  | 'reopened'
  | 'blocked'
  | 'unblocked'

export interface TimelineEvent {
  id: string
  type: TimelineEventType
  actorId: string
  actor?: User
  timestamp: string
  details: {
    previousValue?: string
    newValue?: string
    fieldName?: string
    reason?: string
    [key: string]: unknown
  }
}

// Request/Ticket
export interface Request {
  id: string
  ticketId: string
  title: string
  description: string
  category: string
  requestTypeId: string
  requestType?: RequestType
  priority: Priority
  impact?: Impact
  urgency?: Urgency
  status: RequestStatus
  createdBy: string
  creator?: User
  assigneeId?: string
  assignee?: User
  approverId?: string
  approver?: User
  watchers: string[]
  watcherUsers?: User[]
  createdAt: string
  updatedAt: string
  submittedAt?: string
  dueAt?: string
  resolvedAt?: string
  closedAt?: string
  slaPolicyId?: string
  slaPolicy?: SlaPolicy
  slaStatus?: SlaStatus
  firstResponseAt?: string
  tags: string[]
  approvalState: ApprovalState
  approvalRequired: boolean
  blockedReason?: string
  blockedUntil?: string
  resolutionCode?: string
  resolutionSummary?: string
  formData: Record<string, unknown>
  timelineEvents: TimelineEvent[]
  comments: Comment[]
  internalNotes: InternalNote[]
  attachments: Attachment[]
}

// Request Type Configuration
export type FieldType = 
  | 'text'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'checkbox'
  | 'file'
  | 'user-picker'
  | 'number'
  | 'email'
  | 'url'

export interface FieldOption {
  value: string
  label: string
}

export interface ConditionalVisibility {
  fieldId: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_empty'
  value: string
}

export interface FieldSchema {
  id: string
  name: string
  label: string
  type: FieldType
  required: boolean
  placeholder?: string
  helperText?: string
  options?: FieldOption[]
  defaultValue?: unknown
  validation?: {
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: string
    patternMessage?: string
  }
  conditionalVisibility?: ConditionalVisibility
  order: number
}

export interface RequestType {
  id: string
  name: string
  description: string
  category: string
  icon: string
  fields: FieldSchema[]
  workflowTemplateId?: string
  defaultPriority: Priority
  defaultSlaPolicyId?: string
  approvalRequired: boolean
  enabled: boolean
  createdAt: string
  updatedAt: string
}

// Workflow
export interface WorkflowTransition {
  from: RequestStatus
  to: RequestStatus
  allowedRoles: UserRole[]
  requiresReason?: boolean
  requiresApproval?: boolean
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  states: RequestStatus[]
  transitions: WorkflowTransition[]
  autoAssignRules?: {
    category?: string
    assignToTeam?: string
    assignToUser?: string
  }[]
}

// Notifications
export type NotificationType =
  | 'request_assigned'
  | 'request_submitted'
  | 'approval_required'
  | 'approval_decision'
  | 'comment_added'
  | 'status_changed'
  | 'sla_at_risk'
  | 'sla_breached'
  | 'info_requested'
  | 'request_resolved'
  | 'request_closed'
  | 'mention'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
  requestId?: string
}

// Canned Responses
export interface CannedResponse {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Categories
export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
}

// Filter & Sort Options
export interface FilterOptions {
  status?: RequestStatus[]
  priority?: Priority[]
  category?: string[]
  requestType?: string[]
  assignee?: string[]
  approver?: string[]
  slaStatus?: SlaStatus[]
  tags?: string[]
  createdBy?: string[]
  dateRange?: {
    from: string
    to: string
  }
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

// Dashboard Metrics
export interface DashboardMetrics {
  totalRequests: number
  openRequests: number
  resolvedToday: number
  avgFirstResponseHours: number
  avgResolutionHours: number
  slaBreachRate: number
  requestsByStatus: Record<RequestStatus, number>
  requestsByPriority: Record<Priority, number>
  requestsByCategory: Record<string, number>
}

// Permission Check
export interface Permission {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canAssign: boolean
  canApprove: boolean
  canResolve: boolean
  canClose: boolean
  canReopen: boolean
  canViewInternalNotes: boolean
  canAddInternalNotes: boolean
  canManageConfig: boolean
}
