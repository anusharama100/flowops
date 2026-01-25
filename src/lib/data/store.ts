'use client'

import type {
  User,
  Request,
  RequestType,
  SlaPolicy,
  Category,
  CannedResponse,
  WorkflowTemplate,
  Notification,
  RequestStatus,
  ApprovalState,
  Priority,
  TimelineEvent,
  Comment,
  InternalNote,
  SlaStatus,
} from '@/types'
import {
  seedUsers,
  seedRequests,
  seedRequestTypes,
  seedSlaPolicies,
  seedCategories,
  seedCannedResponses,
  seedWorkflowTemplates,
  seedNotifications,
} from './seed'
import { generateId, generateTicketId } from '@/lib/utils'

// Storage keys
const STORAGE_KEYS = {
  USERS: 'flowops_users',
  REQUESTS: 'flowops_requests',
  REQUEST_TYPES: 'flowops_request_types',
  SLA_POLICIES: 'flowops_sla_policies',
  CATEGORIES: 'flowops_categories',
  CANNED_RESPONSES: 'flowops_canned_responses',
  WORKFLOW_TEMPLATES: 'flowops_workflow_templates',
  NOTIFICATIONS: 'flowops_notifications',
  INITIALIZED: 'flowops_initialized',
}

// Initialize store from localStorage or seed data
function getFromStorage<T>(key: string, seedData: T[]): T[] {
  if (typeof window === 'undefined') return seedData
  
  const stored = localStorage.getItem(key)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return seedData
    }
  }
  return seedData
}

function setToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

// In-memory store (synced with localStorage)
class DataStore {
  private users: User[] = []
  private requests: Request[] = []
  private requestTypes: RequestType[] = []
  private slaPolicies: SlaPolicy[] = []
  private categories: Category[] = []
  private cannedResponses: CannedResponse[] = []
  private workflowTemplates: WorkflowTemplate[] = []
  private notifications: Notification[] = []
  private initialized = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize()
    }
  }

  initialize() {
    if (this.initialized) return

    const wasInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED)
    
    if (!wasInitialized) {
      // First time - use seed data
      this.users = [...seedUsers]
      this.requests = [...seedRequests]
      this.requestTypes = [...seedRequestTypes]
      this.slaPolicies = [...seedSlaPolicies]
      this.categories = [...seedCategories]
      this.cannedResponses = [...seedCannedResponses]
      this.workflowTemplates = [...seedWorkflowTemplates]
      this.notifications = [...seedNotifications]
      
      this.saveAll()
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true')
    } else {
      // Load from localStorage
      this.users = getFromStorage(STORAGE_KEYS.USERS, seedUsers)
      this.requests = getFromStorage(STORAGE_KEYS.REQUESTS, seedRequests)
      this.requestTypes = getFromStorage(STORAGE_KEYS.REQUEST_TYPES, seedRequestTypes)
      this.slaPolicies = getFromStorage(STORAGE_KEYS.SLA_POLICIES, seedSlaPolicies)
      this.categories = getFromStorage(STORAGE_KEYS.CATEGORIES, seedCategories)
      this.cannedResponses = getFromStorage(STORAGE_KEYS.CANNED_RESPONSES, seedCannedResponses)
      this.workflowTemplates = getFromStorage(STORAGE_KEYS.WORKFLOW_TEMPLATES, seedWorkflowTemplates)
      this.notifications = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, seedNotifications)
    }
    
    this.initialized = true
  }

  private saveAll() {
    setToStorage(STORAGE_KEYS.USERS, this.users)
    setToStorage(STORAGE_KEYS.REQUESTS, this.requests)
    setToStorage(STORAGE_KEYS.REQUEST_TYPES, this.requestTypes)
    setToStorage(STORAGE_KEYS.SLA_POLICIES, this.slaPolicies)
    setToStorage(STORAGE_KEYS.CATEGORIES, this.categories)
    setToStorage(STORAGE_KEYS.CANNED_RESPONSES, this.cannedResponses)
    setToStorage(STORAGE_KEYS.WORKFLOW_TEMPLATES, this.workflowTemplates)
    setToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications)
  }

  reset() {
    this.users = [...seedUsers]
    this.requests = [...seedRequests]
    this.requestTypes = [...seedRequestTypes]
    this.slaPolicies = [...seedSlaPolicies]
    this.categories = [...seedCategories]
    this.cannedResponses = [...seedCannedResponses]
    this.workflowTemplates = [...seedWorkflowTemplates]
    this.notifications = [...seedNotifications]
    this.saveAll()
  }

  // ============================================================================
  // Users
  // ============================================================================
  getUsers(): User[] {
    return this.users
  }

  getUser(id: string): User | undefined {
    return this.users.find(u => u.id === id)
  }

  getUsersByRole(role: string): User[] {
    return this.users.filter(u => u.role === role)
  }

  getAllUsers(): User[] {
    return this.users
  }

  // ============================================================================
  // Requests
  // ============================================================================
  getRequests(): Request[] {
    return this.requests.map(r => this.enrichRequest(r))
  }

  getRequest(id: string): Request | undefined {
    const request = this.requests.find(r => r.id === id)
    return request ? this.enrichRequest(request) : undefined
  }

  getRequestsByUser(userId: string): Request[] {
    return this.requests
      .filter(r => r.createdBy === userId)
      .map(r => this.enrichRequest(r))
  }

  getRequestsByAssignee(userId: string): Request[] {
    return this.requests
      .filter(r => r.assigneeId === userId)
      .map(r => this.enrichRequest(r))
  }

  getRequestsByApprover(userId: string): Request[] {
    return this.requests
      .filter(r => r.approverId === userId && r.approvalState === 'pending')
      .map(r => this.enrichRequest(r))
  }

  getRequestsWatching(userId: string): Request[] {
    return this.requests
      .filter(r => r.watchers.includes(userId))
      .map(r => this.enrichRequest(r))
  }

  private enrichRequest(request: Request): Request {
    return {
      ...request,
      creator: this.getUser(request.createdBy),
      assignee: request.assigneeId ? this.getUser(request.assigneeId) : undefined,
      approver: request.approverId ? this.getUser(request.approverId) : undefined,
      requestType: this.getRequestType(request.requestTypeId),
      slaPolicy: request.slaPolicyId ? this.getSlaPolicy(request.slaPolicyId) : undefined,
      slaStatus: this.calculateSlaStatus(request),
      watcherUsers: request.watchers.map(w => this.getUser(w)).filter(Boolean) as User[],
      timelineEvents: request.timelineEvents.map(e => ({
        ...e,
        actor: this.getUser(e.actorId),
      })),
      comments: request.comments.map(c => ({
        ...c,
        author: this.getUser(c.authorId),
      })),
      internalNotes: request.internalNotes.map(n => ({
        ...n,
        author: this.getUser(n.authorId),
      })),
    }
  }

  private calculateSlaStatus(request: Request): SlaStatus {
    if (!request.dueAt) return 'on-track'
    
    const now = new Date()
    const due = new Date(request.dueAt)
    const created = new Date(request.createdAt)
    
    if (now > due) return 'breached'
    
    const totalTime = due.getTime() - created.getTime()
    const elapsed = now.getTime() - created.getTime()
    const percentElapsed = elapsed / totalTime
    
    if (percentElapsed > 0.8) return 'at-risk'
    
    return 'on-track'
  }

  createRequest(data: Partial<Request>, userId: string): Request {
    const requestType = data.requestTypeId ? this.getRequestType(data.requestTypeId) : undefined
    const now = new Date().toISOString()
    
    const newRequest: Request = {
      id: generateId(),
      ticketId: generateTicketId(),
      title: data.title || '',
      description: data.description || '',
      category: data.category || requestType?.category || '',
      requestTypeId: data.requestTypeId || '',
      priority: data.priority || requestType?.defaultPriority || 'medium',
      status: 'draft',
      createdBy: userId,
      watchers: [],
      createdAt: now,
      updatedAt: now,
      slaPolicyId: requestType?.defaultSlaPolicyId,
      tags: data.tags || [],
      approvalState: requestType?.approvalRequired ? 'pending' : 'not-required',
      approvalRequired: requestType?.approvalRequired || false,
      formData: data.formData || {},
      timelineEvents: [
        {
          id: generateId(),
          type: 'created',
          actorId: userId,
          timestamp: now,
          details: {},
        },
      ],
      comments: [],
      internalNotes: [],
      attachments: [],
    }

    this.requests.push(newRequest)
    setToStorage(STORAGE_KEYS.REQUESTS, this.requests)
    
    return this.enrichRequest(newRequest)
  }

  updateRequest(id: string, data: Partial<Request>, userId: string): Request | undefined {
    const index = this.requests.findIndex(r => r.id === id)
    if (index === -1) return undefined

    const now = new Date().toISOString()
    const events: TimelineEvent[] = []

    // Track field changes
    const current = this.requests[index]
    
    if (data.status && data.status !== current.status) {
      events.push({
        id: generateId(),
        type: 'status_changed',
        actorId: userId,
        timestamp: now,
        details: {
          previousValue: current.status,
          newValue: data.status,
        },
      })
    }

    if (data.priority && data.priority !== current.priority) {
      events.push({
        id: generateId(),
        type: 'priority_changed',
        actorId: userId,
        timestamp: now,
        details: {
          previousValue: current.priority,
          newValue: data.priority,
        },
      })
    }

    if (data.assigneeId && data.assigneeId !== current.assigneeId) {
      events.push({
        id: generateId(),
        type: 'assigned',
        actorId: userId,
        timestamp: now,
        details: {
          assigneeId: data.assigneeId,
        },
      })
    }

    this.requests[index] = {
      ...current,
      ...data,
      updatedAt: now,
      timelineEvents: [...current.timelineEvents, ...events],
    }

    setToStorage(STORAGE_KEYS.REQUESTS, this.requests)
    return this.enrichRequest(this.requests[index])
  }

  submitRequest(id: string, userId: string): Request | undefined {
    const index = this.requests.findIndex(r => r.id === id)
    if (index === -1) return undefined

    const now = new Date().toISOString()
    const request = this.requests[index]
    const requestType = this.getRequestType(request.requestTypeId)
    const slaPolicy = requestType?.defaultSlaPolicyId 
      ? this.getSlaPolicy(requestType.defaultSlaPolicyId)
      : undefined

    // Calculate due date based on SLA
    let dueAt: string | undefined
    if (slaPolicy) {
      const priority = request.priority as Priority
      const hours = slaPolicy.priorities[priority]?.resolutionHours || slaPolicy.resolutionHours
      dueAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
    }

    // Find default approver if approval required
    let approverId = request.approverId
    if (requestType?.approvalRequired && !approverId) {
      // Auto-assign to first available approver
      const approvers = this.getUsersByRole('approver')
      if (approvers.length > 0) {
        approverId = approvers[0].id
      }
    }

    this.requests[index] = {
      ...request,
      status: 'submitted',
      submittedAt: now,
      updatedAt: now,
      dueAt,
      approverId,
      timelineEvents: [
        ...request.timelineEvents,
        {
          id: generateId(),
          type: 'submitted',
          actorId: userId,
          timestamp: now,
          details: {},
        },
        ...(approverId ? [{
          id: generateId(),
          type: 'approval_requested' as const,
          actorId: userId,
          timestamp: now,
          details: { approverId },
        }] : []),
      ],
    }

    setToStorage(STORAGE_KEYS.REQUESTS, this.requests)

    // Create notification for approver
    if (approverId && requestType?.approvalRequired) {
      this.createNotification({
        userId: approverId,
        type: 'approval_required',
        title: 'Approval Required',
        message: `${this.getUser(userId)?.name} submitted: ${request.title}`,
        link: `/requests/${id}`,
        requestId: id,
      })
    }

    return this.enrichRequest(this.requests[index])
  }

  approveRequest(id: string, userId: string, reason?: string): Request | undefined {
    const index = this.requests.findIndex(r => r.id === id)
    if (index === -1) return undefined

    const now = new Date().toISOString()
    const request = this.requests[index]

    this.requests[index] = {
      ...request,
      approvalState: 'approved',
      status: 'triaged',
      updatedAt: now,
      timelineEvents: [
        ...request.timelineEvents,
        {
          id: generateId(),
          type: 'approved',
          actorId: userId,
          timestamp: now,
          details: { reason },
        },
      ],
    }

    setToStorage(STORAGE_KEYS.REQUESTS, this.requests)

    // Notify requester
    this.createNotification({
      userId: request.createdBy,
      type: 'approval_decision',
      title: 'Request Approved',
      message: `Your request "${request.title}" has been approved`,
      link: `/requests/${id}`,
      requestId: id,
    })

    return this.enrichRequest(this.requests[index])
  }

  rejectRequest(id: string, userId: string, reason: string): Request | undefined {
    const index = this.requests.findIndex(r => r.id === id)
    if (index === -1) return undefined

    const now = new Date().toISOString()
    const request = this.requests[index]

    this.requests[index] = {
      ...request,
      approvalState: 'rejected',
      status: 'closed',
      closedAt: now,
      updatedAt: now,
      timelineEvents: [
        ...request.timelineEvents,
        {
          id: generateId(),
          type: 'rejected',
          actorId: userId,
          timestamp: now,
          details: { reason },
        },
      ],
    }

    setToStorage(STORAGE_KEYS.REQUESTS, this.requests)

    // Notify requester
    this.createNotification({
      userId: request.createdBy,
      type: 'approval_decision',
      title: 'Request Rejected',
      message: `Your request "${request.title}" has been rejected: ${reason}`,
      link: `/requests/${id}`,
      requestId: id,
    })

    return this.enrichRequest(this.requests[index])
  }

  requestInfo(id: string, userId: string, reason: string): Request | undefined {
    const index = this.requests.findIndex(r => r.id === id)
    if (index === -1) return undefined

    const now = new Date().toISOString()
    const request = this.requests[index]

    this.requests[index] = {
      ...request,
      approvalState: 'needs-info',
      status: 'needs-info',
      updatedAt: now,
      timelineEvents: [
        ...request.timelineEvents,
        {
          id: generateId(),
          type: 'info_requested',
          actorId: userId,
          timestamp: now,
          details: { reason },
        },
      ],
    }

    setToStorage(STORAGE_KEYS.REQUESTS, this.requests)

    // Notify requester
    this.createNotification({
      userId: request.createdBy,
      type: 'info_requested',
      title: 'Information Requested',
      message: `More information needed for "${request.title}": ${reason}`,
      link: `/requests/${id}`,
      requestId: id,
    })

    return this.enrichRequest(this.requests[index])
  }

  assignRequest(id: string, assigneeId: string, userId: string): Request | undefined {
    const index = this.requests.findIndex(r => r.id === id)
    if (index === -1) return undefined

    const now = new Date().toISOString()
    const request = this.requests[index]

    this.requests[index] = {
      ...request,
      assigneeId,
      updatedAt: now,
      timelineEvents: [
        ...request.timelineEvents,
        {
          id: generateId(),
          type: 'assigned',
          actorId: userId,
          timestamp: now,
          details: { assigneeId },
        },
      ],
    }

    setToStorage(STORAGE_KEYS.REQUESTS, this.requests)

    // Notify assignee
    if (assigneeId !== userId) {
      this.createNotification({
        userId: assigneeId,
        type: 'request_assigned',
        title: 'Request Assigned',
        message: `You have been assigned to: ${request.title}`,
        link: `/requests/${id}`,
        requestId: id,
      })
    }

    return this.enrichRequest(this.requests[index])
  }

  changeStatus(id: string, status: RequestStatus, userId: string, details?: { reason?: string; resolutionCode?: string; resolutionSummary?: string }): Request | undefined {
    const index = this.requests.findIndex(r => r.id === id)
    if (index === -1) return undefined

    const now = new Date().toISOString()
    const request = this.requests[index]

    const updates: Partial<Request> = {
      status,
      updatedAt: now,
    }

    let eventType: TimelineEvent['type'] = 'status_changed'

    if (status === 'resolved') {
      updates.resolvedAt = now
      updates.resolutionCode = details?.resolutionCode
      updates.resolutionSummary = details?.resolutionSummary
      eventType = 'resolved'
    } else if (status === 'closed') {
      updates.closedAt = now
      eventType = 'closed'
    } else if (status === 'blocked') {
      updates.blockedReason = details?.reason
      eventType = 'blocked'
    }

    this.requests[index] = {
      ...request,
      ...updates,
      timelineEvents: [
        ...request.timelineEvents,
        {
          id: generateId(),
          type: eventType,
          actorId: userId,
          timestamp: now,
          details: {
            previousValue: request.status,
            newValue: status,
            ...details,
          },
        },
      ],
    }

    setToStorage(STORAGE_KEYS.REQUESTS, this.requests)

    // Notify requester of status change
    if (request.createdBy !== userId) {
      this.createNotification({
        userId: request.createdBy,
        type: 'status_changed',
        title: 'Status Changed',
        message: `"${request.title}" status changed to ${status}`,
        link: `/requests/${id}`,
        requestId: id,
      })
    }

    return this.enrichRequest(this.requests[index])
  }

  addComment(id: string, content: string, userId: string): Request | undefined {
    const index = this.requests.findIndex(r => r.id === id)
    if (index === -1) return undefined

    const now = new Date().toISOString()
    const request = this.requests[index]

    const newComment: Comment = {
      id: generateId(),
      content,
      authorId: userId,
      createdAt: now,
    }

    this.requests[index] = {
      ...request,
      updatedAt: now,
      comments: [...request.comments, newComment],
      timelineEvents: [
        ...request.timelineEvents,
        {
          id: generateId(),
          type: 'comment_added',
          actorId: userId,
          timestamp: now,
          details: {},
        },
      ],
    }

    setToStorage(STORAGE_KEYS.REQUESTS, this.requests)

    // Notify relevant parties
    const notifyUsers = new Set([request.createdBy, request.assigneeId, ...request.watchers])
    notifyUsers.delete(userId)
    
    notifyUsers.forEach(notifyUserId => {
      if (notifyUserId) {
        this.createNotification({
          userId: notifyUserId,
          type: 'comment_added',
          title: 'New Comment',
          message: `${this.getUser(userId)?.name} commented on "${request.title}"`,
          link: `/requests/${id}`,
          requestId: id,
        })
      }
    })

    return this.enrichRequest(this.requests[index])
  }

  addInternalNote(id: string, content: string, userId: string): Request | undefined {
    const index = this.requests.findIndex(r => r.id === id)
    if (index === -1) return undefined

    const now = new Date().toISOString()
    const request = this.requests[index]

    const newNote: InternalNote = {
      id: generateId(),
      content,
      authorId: userId,
      createdAt: now,
    }

    this.requests[index] = {
      ...request,
      updatedAt: now,
      internalNotes: [...request.internalNotes, newNote],
      timelineEvents: [
        ...request.timelineEvents,
        {
          id: generateId(),
          type: 'internal_note_added',
          actorId: userId,
          timestamp: now,
          details: {},
        },
      ],
    }

    setToStorage(STORAGE_KEYS.REQUESTS, this.requests)
    return this.enrichRequest(this.requests[index])
  }

  // ============================================================================
  // Request Types
  // ============================================================================
  getRequestTypes(): RequestType[] {
    return this.requestTypes.filter(rt => rt.enabled)
  }

  getAllRequestTypes(): RequestType[] {
    return this.requestTypes
  }

  getRequestType(id: string): RequestType | undefined {
    return this.requestTypes.find(rt => rt.id === id)
  }

  createRequestType(data: Partial<RequestType>): RequestType {
    const now = new Date().toISOString()
    const newType: RequestType = {
      id: generateId(),
      name: data.name || '',
      description: data.description || '',
      category: data.category || '',
      icon: data.icon || 'FileText',
      fields: data.fields || [],
      defaultPriority: data.defaultPriority || 'medium',
      defaultSlaPolicyId: data.defaultSlaPolicyId,
      approvalRequired: data.approvalRequired || false,
      enabled: true,
      createdAt: now,
      updatedAt: now,
    }

    this.requestTypes.push(newType)
    setToStorage(STORAGE_KEYS.REQUEST_TYPES, this.requestTypes)
    return newType
  }

  updateRequestType(id: string, data: Partial<RequestType>): RequestType | undefined {
    const index = this.requestTypes.findIndex(rt => rt.id === id)
    if (index === -1) return undefined

    this.requestTypes[index] = {
      ...this.requestTypes[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    setToStorage(STORAGE_KEYS.REQUEST_TYPES, this.requestTypes)
    return this.requestTypes[index]
  }

  deleteRequestType(id: string): boolean {
    const index = this.requestTypes.findIndex(rt => rt.id === id)
    if (index === -1) return false

    this.requestTypes.splice(index, 1)
    setToStorage(STORAGE_KEYS.REQUEST_TYPES, this.requestTypes)
    return true
  }

  // ============================================================================
  // SLA Policies
  // ============================================================================
  getSlaPolicies(): SlaPolicy[] {
    return this.slaPolicies
  }

  getSlaPolicy(id: string): SlaPolicy | undefined {
    return this.slaPolicies.find(p => p.id === id)
  }

  createSlaPolicy(data: Partial<SlaPolicy>): SlaPolicy {
    const newPolicy: SlaPolicy = {
      id: generateId(),
      name: data.name || '',
      firstResponseHours: data.firstResponseHours || 24,
      resolutionHours: data.resolutionHours || 72,
      businessHoursOnly: data.businessHoursOnly ?? true,
      priorities: data.priorities || {
        low: { firstResponseHours: 48, resolutionHours: 120 },
        medium: { firstResponseHours: 24, resolutionHours: 72 },
        high: { firstResponseHours: 8, resolutionHours: 48 },
        critical: { firstResponseHours: 2, resolutionHours: 24 },
      },
    }

    this.slaPolicies.push(newPolicy)
    setToStorage(STORAGE_KEYS.SLA_POLICIES, this.slaPolicies)
    return newPolicy
  }

  updateSlaPolicy(id: string, data: Partial<SlaPolicy>): SlaPolicy | undefined {
    const index = this.slaPolicies.findIndex(p => p.id === id)
    if (index === -1) return undefined

    this.slaPolicies[index] = {
      ...this.slaPolicies[index],
      ...data,
    }

    setToStorage(STORAGE_KEYS.SLA_POLICIES, this.slaPolicies)
    return this.slaPolicies[index]
  }

  // ============================================================================
  // Categories
  // ============================================================================
  getCategories(): Category[] {
    return this.categories
  }

  // ============================================================================
  // Canned Responses
  // ============================================================================
  getCannedResponses(): CannedResponse[] {
    return this.cannedResponses
  }

  createCannedResponse(data: Partial<CannedResponse>, userId: string): CannedResponse {
    const now = new Date().toISOString()
    const newResponse: CannedResponse = {
      id: generateId(),
      title: data.title || '',
      content: data.content || '',
      category: data.category || 'General',
      tags: data.tags || [],
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    }

    this.cannedResponses.push(newResponse)
    setToStorage(STORAGE_KEYS.CANNED_RESPONSES, this.cannedResponses)
    return newResponse
  }

  // ============================================================================
  // Workflow Templates
  // ============================================================================
  getWorkflowTemplates(): WorkflowTemplate[] {
    return this.workflowTemplates
  }

  getWorkflowTemplate(id: string): WorkflowTemplate | undefined {
    return this.workflowTemplates.find(w => w.id === id)
  }

  // ============================================================================
  // Notifications
  // ============================================================================
  getNotifications(userId: string): Notification[] {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  getUnreadNotificationCount(userId: string): number {
    return this.notifications.filter(n => n.userId === userId && !n.read).length
  }

  createNotification(data: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
    const newNotif: Notification = {
      ...data,
      id: generateId(),
      read: false,
      createdAt: new Date().toISOString(),
    }

    this.notifications.push(newNotif)
    setToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications)
    return newNotif
  }

  markNotificationRead(id: string): void {
    const index = this.notifications.findIndex(n => n.id === id)
    if (index !== -1) {
      this.notifications[index].read = true
      setToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications)
    }
  }

  markAllNotificationsRead(userId: string): void {
    this.notifications.forEach((n, index) => {
      if (n.userId === userId) {
        this.notifications[index].read = true
      }
    })
    setToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications)
  }

  // ============================================================================
  // Dashboard Metrics
  // ============================================================================
  getDashboardMetrics() {
    const requests = this.requests
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const openStatuses: RequestStatus[] = ['submitted', 'needs-info', 'triaged', 'in-progress', 'blocked']
    const openRequests = requests.filter(r => openStatuses.includes(r.status))
    
    const resolvedToday = requests.filter(r => 
      r.resolvedAt && new Date(r.resolvedAt) >= today
    )

    const statusCounts = requests.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1
      return acc
    }, {} as Record<RequestStatus, number>)

    const priorityCounts = requests.reduce((acc, r) => {
      acc[r.priority] = (acc[r.priority] || 0) + 1
      return acc
    }, {} as Record<Priority, number>)

    const categoryCounts = requests.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Mock metrics for demo
    return {
      totalRequests: requests.length,
      openRequests: openRequests.length,
      resolvedToday: resolvedToday.length,
      avgFirstResponseHours: 4.2,
      avgResolutionHours: 18.5,
      slaBreachRate: 8.3,
      requestsByStatus: statusCounts,
      requestsByPriority: priorityCounts,
      requestsByCategory: categoryCounts,
    }
  }
}

// Singleton instance
export const store = new DataStore()
