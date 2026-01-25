'use client'

import { Sidebar } from './sidebar'
import { Header } from './header'
import { useAuth } from '@/contexts/auth-context'
import { Skeleton } from '@/components/ui/skeleton'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen bg-white">
        {/* Sidebar skeleton */}
        <div className="w-64 border-r bg-slate-50/50 p-4">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        {/* Main content skeleton */}
        <div className="flex-1">
          <div className="h-16 border-b p-4">
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  )
}
