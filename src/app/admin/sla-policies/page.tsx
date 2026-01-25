'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { store } from '@/lib/data/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import type { SlaPolicy } from '@/types'
import {
  ArrowLeft,
  Plus,
  Edit,
  Timer,
  Clock,
  AlertTriangle,
} from 'lucide-react'

export default function SlaPoliciesPage() {
  const { currentRole, isLoading: authLoading } = useAuth()
  const [policies, setPolicies] = useState<SlaPolicy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editPolicy, setEditPolicy] = useState<SlaPolicy | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    loadPolicies()
  }, [])

  const loadPolicies = () => {
    const slaPolicies = store.getSlaPolicies()
    setPolicies(slaPolicies)
    setIsLoading(false)
  }

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
          <h1 className="text-2xl font-semibold text-slate-900">SLA Policies</h1>
          <p className="text-slate-500 mt-1">Configure service level agreements and response targets</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Policy
        </Button>
      </div>

      {/* Policies List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {policies.map((policy) => (
          <Card key={policy.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Timer className="h-5 w-5 text-slate-400" />
                  {policy.name}
                </CardTitle>
                <Button variant="ghost" size="icon-sm" onClick={() => setEditPolicy(policy)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {policy.businessHoursOnly ? 'Business hours only' : '24/7 coverage'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">First Response</span>
                  <span className="font-medium">{policy.firstResponseHours}h</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Resolution</span>
                  <span className="font-medium">{policy.resolutionHours}h</span>
                </div>
                
                <div className="pt-3 border-t space-y-2">
                  <p className="text-xs font-medium text-slate-500">By Priority</p>
                  {Object.entries(policy.priorities).map(([priority, targets]) => (
                    <div key={priority} className="flex items-center justify-between text-xs">
                      <Badge variant={priority as any} className="capitalize">{priority}</Badge>
                      <span className="text-slate-600">
                        {targets.firstResponseHours}h / {targets.resolutionHours}h
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create SLA Policy</DialogTitle>
            <DialogDescription>Define response and resolution time targets</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Policy Name</Label>
              <Input placeholder="e.g., Premium Support" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Response (hours)</Label>
                <Input type="number" placeholder="4" />
              </div>
              <div>
                <Label>Resolution (hours)</Label>
                <Input type="number" placeholder="24" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Business Hours Only</Label>
              <Switch />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast({ title: 'SLA policy created' })
              setShowCreateDialog(false)
            }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
