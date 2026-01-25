'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { store } from '@/lib/data/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
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
import type { RequestType } from '@/types'
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Key,
  Laptop,
  Bug,
  FileText,
  Building,
  ChevronRight,
  GripVertical,
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Key,
  Laptop,
  Bug,
  FileText,
  Building,
}

export default function RequestTypesPage() {
  const router = useRouter()
  const { currentRole, isLoading: authLoading } = useAuth()
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    loadRequestTypes()
  }, [])

  const loadRequestTypes = () => {
    const types = store.getAllRequestTypes()
    setRequestTypes(types)
    setIsLoading(false)
  }

  const handleToggleEnabled = (id: string, enabled: boolean) => {
    store.updateRequestType(id, { enabled })
    loadRequestTypes()
    toast({ title: enabled ? 'Request type enabled' : 'Request type disabled' })
  }

  const handleDelete = () => {
    if (!deleteId) return
    store.deleteRequestType(deleteId)
    setDeleteId(null)
    loadRequestTypes()
    toast({ title: 'Request type deleted' })
  }

  const filteredTypes = requestTypes.filter(rt =>
    rt.name.toLowerCase().includes(search.toLowerCase()) ||
    rt.category.toLowerCase().includes(search.toLowerCase())
  )

  if (authLoading || isLoading) {
    return <RequestTypesPageSkeleton />
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900">Request Types</h1>
          <p className="text-slate-500 mt-1">Configure request forms and field schemas</p>
        </div>
        <Button asChild>
          <Link href="/admin/request-types/new">
            <Plus className="h-4 w-4 mr-2" />
            New Request Type
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search request types..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Request Types List */}
      <div className="space-y-3">
        {filteredTypes.map((type) => {
          const Icon = iconMap[type.icon] || FileText
          return (
            <Card key={type.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="cursor-move text-slate-300 hover:text-slate-400">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{type.name}</h3>
                      {type.approvalRequired && (
                        <Badge variant="outline" className="text-xs">Approval Required</Badge>
                      )}
                      {!type.enabled && (
                        <Badge variant="secondary" className="text-xs">Disabled</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{type.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span>{type.category}</span>
                      <span>•</span>
                      <span>{type.fields.length} fields</span>
                      <span>•</span>
                      <span>Default: {type.defaultPriority}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">
                        {type.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </span>
                      <Switch
                        checked={type.enabled}
                        onCheckedChange={(checked) => handleToggleEnabled(type.id, checked)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => router.push(`/admin/request-types/${type.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteId(type.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTypes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-medium text-slate-900">No request types found</h3>
          <p className="text-sm text-slate-500 mt-1">
            {search ? 'Try adjusting your search' : 'Create your first request type to get started'}
          </p>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Request Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this request type? This action cannot be undone.
              Existing requests of this type will not be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RequestTypesPageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="flex-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-10 w-80" />
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  )
}
