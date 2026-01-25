'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { store } from '@/lib/data/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  Bell,
  RefreshCw,
  User,
  Shield,
  Users,
  Settings,
  Command,
  Check,
  HelpCircle,
  Lightbulb,
  Book,
  Palette,
} from 'lucide-react'
import type { UserRole, Notification } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

const roleConfig: Record<UserRole, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  requester: { label: 'Requester', color: 'bg-blue-100 text-blue-700', icon: User },
  approver: { label: 'Approver', color: 'bg-amber-100 text-amber-700', icon: Shield },
  agent: { label: 'Agent', color: 'bg-green-100 text-green-700', icon: Users },
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700', icon: Settings },
}

export function Header() {
  const router = useRouter()
  const { user, currentRole, switchRole } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)

  useEffect(() => {
    if (user) {
      const notifs = store.getNotifications(user.id)
      setNotifications(notifs)
      setUnreadCount(store.getUnreadNotificationCount(user.id))
    }
  }, [user])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleReset = () => {
    store.reset()
    setShowResetDialog(false)
    toast({
      title: 'Demo data reset',
      description: 'All data has been restored to initial state.',
    })
    router.refresh()
    window.location.reload()
  }

  const handleNotificationClick = (notif: Notification) => {
    store.markNotificationRead(notif.id)
    setUnreadCount(prev => Math.max(0, prev - 1))
    if (notif.link) {
      router.push(notif.link)
    }
  }

  const roleInfo = roleConfig[currentRole]
  const RoleIcon = roleInfo.icon

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search requests... (⌘K)"
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white"
            onFocus={() => setCommandOpen(true)}
            readOnly
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Role Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Badge variant="secondary" className={roleInfo.color}>
                  <RoleIcon className="mr-1 h-3 w-3" />
                  {roleInfo.label}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>View as Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(roleConfig) as UserRole[]).map((role) => {
                const config = roleConfig[role]
                const Icon = config.icon
                return (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => switchRole(role)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {config.label}
                    {currentRole === role && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Help Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" title="Help & Demo Info">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Demo & Help</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/requests/req-1')}>
                <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Try: Approve a Request</p>
                  <p className="text-xs text-slate-500">Switch to Approver role first</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/queue')}>
                <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Try: Triage Queue</p>
                  <p className="text-xs text-slate-500">Switch to Agent role first</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/design-system')}>
                <Palette className="h-4 w-4 mr-2" />
                Design System
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/docs')}>
                <Book className="h-4 w-4 mr-2" />
                Documentation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowResetDialog(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Demo Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700"
                    onClick={() => {
                      if (user) {
                        store.markAllNotificationsRead(user.id)
                        setUnreadCount(0)
                      }
                    }}
                  >
                    Mark all read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  No notifications
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {notifications.slice(0, 10).map((notif) => (
                    <DropdownMenuItem
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`flex flex-col items-start gap-1 p-3 ${!notif.read ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex w-full items-start justify-between gap-2">
                        <span className="font-medium text-sm">{notif.title}</span>
                        {!notif.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-slate-500 line-clamp-2">
                        {notif.message}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-slate-200 text-slate-600 text-sm">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-500">{user?.team || 'Team'}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-slate-500 font-normal">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem disabled>Preferences</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Demo Data?</DialogTitle>
            <DialogDescription>
              This will restore all requests, configurations, and notifications to their initial demo state. Any changes you have made will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              Reset Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  )
}

// Command Palette Component
function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const { currentRole } = useAuth()
  const [search, setSearch] = useState('')
  const [requests, setRequests] = useState<Array<{ id: string; ticketId: string; title: string; status: string }>>([])
  const [users, setUsers] = useState<Array<{ id: string; name: string; role: string; team: string }>>([])

  useEffect(() => {
    if (open) {
      const allRequests = store.getRequests()
      setRequests(allRequests.map(r => ({ id: r.id, ticketId: r.ticketId, title: r.title, status: r.status })))
      // Get all users
      const allUsers = store.getAllUsers()
      setUsers(allUsers.map(u => ({ id: u.id, name: u.name, role: u.role, team: u.team })))
    }
  }, [open])

  const searchLower = search.toLowerCase()
  
  const filteredRequests = requests.filter(r => 
    r.title.toLowerCase().includes(searchLower) ||
    r.ticketId.toLowerCase().includes(searchLower)
  )

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchLower) ||
    u.team.toLowerCase().includes(searchLower)
  )

  const quickActions = [
    { label: 'Create new request', href: '/requests/new', icon: '+', color: 'bg-blue-100 text-blue-600' },
    { label: 'Go to Dashboard', href: '/dashboard', icon: '⌂', color: 'bg-slate-100 text-slate-600' },
    { label: 'View all requests', href: '/requests', icon: '☰', color: 'bg-slate-100 text-slate-600' },
    ...(currentRole === 'agent' || currentRole === 'admin' ? [
      { label: 'Open triage queue', href: '/queue', icon: '⎔', color: 'bg-green-100 text-green-600' },
    ] : []),
    ...(currentRole === 'approver' ? [
      { label: 'View pending approvals', href: '/approvals', icon: '✓', color: 'bg-amber-100 text-amber-600' },
    ] : []),
    ...(currentRole === 'admin' ? [
      { label: 'Admin settings', href: '/admin', icon: '⚙', color: 'bg-purple-100 text-purple-600' },
    ] : []),
  ]

  const filteredActions = search
    ? quickActions.filter(a => a.label.toLowerCase().includes(searchLower))
    : quickActions

  const handleSelect = (href: string) => {
    router.push(href)
    onOpenChange(false)
    setSearch('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-lg">
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search requests, people, or type a command..."
            className="flex-1 h-12 px-3 text-sm outline-none bg-transparent"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs text-slate-500">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <>
              <div className="text-xs font-medium text-slate-500 px-2 py-1.5 uppercase tracking-wide">Actions</div>
              {filteredActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(action.href)}
                  className="w-full flex items-center gap-3 px-2 py-2 text-sm rounded-md hover:bg-slate-100 text-left"
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded text-xs ${action.color}`}>
                    {action.icon}
                  </span>
                  {action.label}
                </button>
              ))}
            </>
          )}
          
          {/* Requests */}
          {filteredRequests.length > 0 && (
            <>
              <div className="text-xs font-medium text-slate-500 px-2 py-1.5 mt-2 uppercase tracking-wide">
                Requests {search && `(${filteredRequests.length})`}
              </div>
              {filteredRequests.slice(0, 6).map(request => (
                <button
                  key={request.id}
                  onClick={() => handleSelect(`/requests/${request.id}`)}
                  className="w-full flex items-center gap-3 px-2 py-2 text-sm rounded-md hover:bg-slate-100 text-left group"
                >
                  <span className="text-xs text-slate-400 font-mono w-20 shrink-0">{request.ticketId}</span>
                  <span className="truncate flex-1">{request.title}</span>
                  <span className="text-xs text-slate-400 capitalize shrink-0">{request.status.replace('-', ' ')}</span>
                </button>
              ))}
              {filteredRequests.length > 6 && (
                <button
                  onClick={() => handleSelect(`/requests?search=${encodeURIComponent(search)}`)}
                  className="w-full px-2 py-2 text-xs text-blue-600 hover:text-blue-700 text-center"
                >
                  View all {filteredRequests.length} results →
                </button>
              )}
            </>
          )}

          {/* People */}
          {search && filteredUsers.length > 0 && (
            <>
              <div className="text-xs font-medium text-slate-500 px-2 py-1.5 mt-2 uppercase tracking-wide">
                People ({filteredUsers.length})
              </div>
              {filteredUsers.slice(0, 4).map(person => (
                <button
                  key={person.id}
                  onClick={() => handleSelect(`/requests?assignee=${person.id}`)}
                  className="w-full flex items-center gap-3 px-2 py-2 text-sm rounded-md hover:bg-slate-100 text-left"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-xs font-medium">
                    {person.name.charAt(0)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="truncate block">{person.name}</span>
                    <span className="text-xs text-slate-400">{person.team} • {person.role}</span>
                  </div>
                </button>
              ))}
            </>
          )}
          
          {search && filteredRequests.length === 0 && filteredActions.length === 0 && filteredUsers.length === 0 && (
            <div className="text-sm text-slate-500 px-2 py-8 text-center">
              <p>No results found for &ldquo;{search}&rdquo;</p>
              <p className="text-xs mt-1">Try searching for request IDs, titles, or people</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
