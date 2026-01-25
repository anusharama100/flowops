'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { store } from '@/lib/data/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { RequestType } from '@/types'
import {
  ArrowLeft,
  Search,
  Key,
  Laptop,
  Bug,
  FileText,
  Building,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Key: Key,
  Laptop: Laptop,
  Bug: Bug,
  FileText: FileText,
  Building: Building,
}

export default function NewRequestPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      const types = store.getRequestTypes()
      setRequestTypes(types)
      setIsLoading(false)
    }
  }, [user])

  const categories = Array.from(new Set(requestTypes.map(rt => rt.category)))

  const filteredTypes = requestTypes.filter(rt => {
    const matchesSearch = rt.name.toLowerCase().includes(search.toLowerCase()) ||
      rt.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !selectedCategory || rt.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (authLoading || isLoading) {
    return <NewRequestSkeleton />
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/requests">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Create New Request</h1>
          <p className="text-slate-500 mt-1">Select a request type to get started</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search request types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Request Type Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredTypes.map((type) => {
          const Icon = iconMap[type.icon] || FileText
          return (
            <Card
              key={type.id}
              className="group cursor-pointer hover:shadow-md hover:border-slate-300 transition-all"
              onClick={() => router.push(`/requests/new/${type.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
                    <Icon className="h-6 w-6 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{type.name}</CardTitle>
                      {type.approvalRequired && (
                        <Badge variant="outline" className="text-xs">
                          Approval Required
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1 line-clamp-2">
                      {type.description}
                    </CardDescription>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{type.category}</span>
                  <span>•</span>
                  <span>{type.fields.length} fields</span>
                  {type.defaultSlaPolicyId && (
                    <>
                      <span>•</span>
                      <span>SLA tracked</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTypes.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="font-medium text-slate-900">No request types found</h3>
          <p className="text-sm text-slate-500 mt-1">
            Try adjusting your search or category filter
          </p>
        </div>
      )}

      {/* Quick tip */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex gap-3">
          <Sparkles className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Quick Tip</p>
            <p className="text-sm text-blue-700 mt-1">
              Not sure which request type to use? Start with a general description and our team will help route it to the right place.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function NewRequestSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
      </div>
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  )
}
