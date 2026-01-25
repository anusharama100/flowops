'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { store } from '@/lib/data/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import type { CannedResponse } from '@/types'
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  Copy,
} from 'lucide-react'

export default function CannedResponsesPage() {
  const { user, currentRole, isLoading: authLoading } = useAuth()
  const [responses, setResponses] = useState<CannedResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState('')

  useEffect(() => {
    loadResponses()
  }, [])

  const loadResponses = () => {
    const cannedResponses = store.getCannedResponses()
    setResponses(cannedResponses)
    setIsLoading(false)
  }

  const handleCreate = () => {
    if (!user || !newTitle.trim() || !newContent.trim()) return
    
    store.createCannedResponse({
      title: newTitle,
      content: newContent,
      category: newCategory || 'General',
      tags: [],
    }, user.id)

    setNewTitle('')
    setNewContent('')
    setNewCategory('')
    setShowCreateDialog(false)
    loadResponses()
    toast({ title: 'Canned response created' })
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({ title: 'Copied to clipboard' })
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

  const categories = Array.from(new Set(responses.map(r => r.category)))

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
          <h1 className="text-2xl font-semibold text-slate-900">Canned Responses</h1>
          <p className="text-slate-500 mt-1">Create reusable response templates for agents</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Response
        </Button>
      </div>

      {/* Responses by Category */}
      {categories.map((category) => (
        <div key={category}>
          <h2 className="text-lg font-medium text-slate-700 mb-3">{category}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {responses.filter(r => r.category === category).map((response) => (
              <Card key={response.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-slate-400" />
                      {response.title}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleCopy(response.content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" disabled>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-4">
                    {response.content}
                  </p>
                  {response.tags.length > 0 && (
                    <div className="flex gap-1 mt-3">
                      {response.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Canned Response</DialogTitle>
            <DialogDescription>Create a reusable response template</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                placeholder="e.g., Request Received"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                placeholder="e.g., General, Approval, Resolution"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                placeholder="Write your response template..."
                rows={6}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newTitle.trim() || !newContent.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
