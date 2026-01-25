'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Timer,
  Workflow,
  MessageSquare,
  Users,
  Shield,
  Settings,
  ChevronRight,
  Activity,
} from 'lucide-react'

const adminSections = [
  {
    title: 'Request Types',
    description: 'Configure request forms, fields, and validation rules',
    href: '/admin/request-types',
    icon: FileText,
    badge: '5 types',
  },
  {
    title: 'SLA Policies',
    description: 'Define service level agreements and response targets',
    href: '/admin/sla-policies',
    icon: Timer,
    badge: '3 policies',
  },
  {
    title: 'Workflows',
    description: 'Manage status transitions and approval rules',
    href: '/admin/workflows',
    icon: Workflow,
    badge: '2 templates',
  },
  {
    title: 'Canned Responses',
    description: 'Create reusable response templates for agents',
    href: '/admin/canned-responses',
    icon: MessageSquare,
    badge: '4 responses',
  },
  {
    title: 'Users & Teams',
    description: 'Manage user accounts, roles, and team assignments',
    href: '/admin/users',
    icon: Users,
    badge: '8 users',
    disabled: true,
  },
  {
    title: 'Permissions',
    description: 'Configure role-based access controls',
    href: '/admin/permissions',
    icon: Shield,
    disabled: true,
  },
]

const recentChanges = [
  {
    action: 'Updated',
    target: 'Software Access Request type',
    user: 'Rachel Green',
    time: '2 hours ago',
  },
  {
    action: 'Created',
    target: 'Priority SLA Policy',
    user: 'Rachel Green',
    time: '1 day ago',
  },
  {
    action: 'Modified',
    target: 'Standard workflow transitions',
    user: 'Rachel Green',
    time: '3 days ago',
  },
]

export default function AdminPage() {
  const { currentRole, isLoading } = useAuth()

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (currentRole !== 'admin') {
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
        <h1 className="text-2xl font-semibold text-slate-900">Admin Settings</h1>
        <p className="text-slate-500 mt-1">Configure system settings and manage workflows</p>
      </div>

      {/* Config Sections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section) => {
          const Icon = section.icon
          return (
            <Card
              key={section.href}
              className={`group ${section.disabled ? 'opacity-60' : 'hover:shadow-md hover:border-slate-300 cursor-pointer'} transition-all`}
            >
              {section.disabled ? (
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-slate-100">
                      <Icon className="h-6 w-6 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{section.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                      </div>
                      <CardDescription className="mt-1">{section.description}</CardDescription>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href={section.href}>
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
                        <Icon className="h-6 w-6 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{section.title}</CardTitle>
                          {section.badge && (
                            <Badge variant="secondary" className="text-xs">{section.badge}</Badge>
                          )}
                        </div>
                        <CardDescription className="mt-1">{section.description}</CardDescription>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                    </div>
                  </div>
                </Link>
              )}
            </Card>
          )
        })}
      </div>

      {/* Recent Changes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Configuration Changes
          </CardTitle>
          <CardDescription>Track changes made to system configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentChanges.map((change, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{change.action}</span>{' '}
                    <span className="text-slate-600">{change.target}</span>
                  </p>
                  <p className="text-xs text-slate-500">by {change.user}</p>
                </div>
                <span className="text-xs text-slate-400">{change.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">99.9%</p>
              <p className="text-sm text-green-600">Uptime</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-700">142ms</p>
              <p className="text-sm text-blue-600">Avg Response</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-700">8.3%</p>
              <p className="text-sm text-amber-600">SLA Breach Rate</p>
            </div>
            <div className="text-center p-4 bg-violet-50 rounded-lg">
              <p className="text-2xl font-bold text-violet-700">1,247</p>
              <p className="text-sm text-violet-600">Total Requests</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
