'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import {
  LayoutDashboard,
  FileText,
  Inbox,
  CheckSquare,
  Settings,
  Palette,
  BookOpen,
  ChevronRight,
  Workflow,
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: string[]
  badge?: number
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Requests', href: '/requests', icon: FileText },
  { name: 'Queue', href: '/queue', icon: Inbox, roles: ['agent', 'admin'] },
  { name: 'Approvals', href: '/approvals', icon: CheckSquare, roles: ['approver', 'admin'] },
  { name: 'Admin', href: '/admin', icon: Settings, roles: ['admin'] },
]

const secondaryNav: NavItem[] = [
  { name: 'Design System', href: '/design-system', icon: Palette },
  { name: 'Documentation', href: '/docs', icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()
  const { currentRole } = useAuth()

  const filteredNav = navigation.filter(
    item => !item.roles || item.roles.includes(currentRole)
  )

  return (
    <div className="flex h-full w-64 flex-col border-r bg-slate-50/50">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
          <Workflow className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-semibold tracking-tight text-slate-900">FlowOps</span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <div className="space-y-1">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-colors',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                />
                {item.name}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={cn(
                    'ml-auto rounded-full px-2 py-0.5 text-xs font-medium',
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  )}>
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="ml-auto h-4 w-4 text-white/70" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-slate-200" />

        {/* Secondary Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-medium uppercase tracking-wider text-slate-400">
            Resources
          </p>
          {secondaryNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 shrink-0',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="rounded-lg bg-slate-100 p-3">
          <p className="text-xs font-medium text-slate-600">Demo Mode</p>
          <p className="mt-1 text-xs text-slate-500">
            Switch roles in the header to explore different user perspectives.
          </p>
        </div>
      </div>
    </div>
  )
}
