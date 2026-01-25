'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { store } from '@/lib/data/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { WorkflowTemplate } from '@/types'
import {
  ArrowLeft,
  Plus,
  Edit,
  Workflow,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'

export default function WorkflowsPage() {
  const { currentRole, isLoading: authLoading } = useAuth()
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const templates = store.getWorkflowTemplates()
    setWorkflows(templates)
    setIsLoading(false)
  }, [])

  if (authLoading || isLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (currentRole !== 'admin') {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold">Access Denied</h1>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900">Workflow Templates</h1>
          <p className="text-slate-500 mt-1">Configure status transitions and approval rules</p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          New Workflow
        </Button>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100">
                    <Workflow className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <CardDescription>{workflow.description}</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* States */}
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-700 mb-2">States</p>
                <div className="flex flex-wrap gap-2">
                  {workflow.states.map((state) => (
                    <Badge key={state} variant={state as any} className="capitalize">
                      {state.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Transitions */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Transitions</p>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {workflow.transitions.slice(0, 6).map((transition, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs p-2 bg-slate-50 rounded">
                      <Badge variant={transition.from as any} className="text-[10px]">
                        {transition.from.replace('-', ' ')}
                      </Badge>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <Badge variant={transition.to as any} className="text-[10px]">
                        {transition.to.replace('-', ' ')}
                      </Badge>
                      <span className="text-slate-400 ml-auto">
                        {transition.allowedRoles.join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
                {workflow.transitions.length > 6 && (
                  <p className="text-xs text-slate-500 mt-2">
                    +{workflow.transitions.length - 6} more transitions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
