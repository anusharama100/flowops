'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from '@tanstack/react-table'
import { useAuth } from '@/contexts/auth-context'
import { store } from '@/lib/data/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge, PriorityBadge, SlaBadge } from '@/components/shared/status-badge'
import { formatRelativeTime, formatDate } from '@/lib/utils'
import type { Request, RequestStatus, Priority, SlaStatus } from '@/types'
import {
  Plus,
  Search,
  Filter,
  Columns3,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  MoreHorizontal,
  ArrowUpDown,
  Download,
  Tag,
  UserPlus,
} from 'lucide-react'

const statusOptions: RequestStatus[] = ['draft', 'submitted', 'needs-info', 'triaged', 'in-progress', 'blocked', 'resolved', 'closed']
const priorityOptions: Priority[] = ['low', 'medium', 'high', 'critical']
const slaOptions: SlaStatus[] = ['on-track', 'at-risk', 'breached']

export default function RequestsPage() {
  const router = useRouter()
  const { user, currentRole, isLoading: authLoading } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  
  // Table state
  const [sorting, setSorting] = useState<SortingState>([{ id: 'updatedAt', desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [slaFilter, setSlaFilter] = useState<string>('all')

  useEffect(() => {
    if (user) {
      const allRequests = store.getRequests()
      setRequests(allRequests)
      setIsLoading(false)
    }
  }, [user])

  // Filter requests based on tab
  const filteredByTab = useMemo(() => {
    switch (activeTab) {
      case 'mine':
        return requests.filter(r => r.createdBy === user?.id)
      case 'watching':
        return requests.filter(r => r.watchers.includes(user?.id || ''))
      case 'recent':
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        return requests.filter(r => new Date(r.updatedAt).getTime() > oneWeekAgo)
      default:
        return requests
    }
  }, [requests, activeTab, user])

  // Apply additional filters
  const filteredData = useMemo(() => {
    let filtered = filteredByTab

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(r => r.priority === priorityFilter)
    }
    if (slaFilter !== 'all') {
      filtered = filtered.filter(r => r.slaStatus === slaFilter)
    }

    return filtered
  }, [filteredByTab, statusFilter, priorityFilter, slaFilter])

  const columns: ColumnDef<Request>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: 'ticketId',
        header: 'ID',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-500 whitespace-nowrap">{row.getValue('ticketId')}</span>
        ),
        size: 110,
      },
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="max-w-md">
            <Link 
              href={`/requests/${row.original.id}`}
              className="font-medium truncate text-slate-900 hover:text-blue-600 hover:underline transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {row.getValue('title')}
            </Link>
            <p className="text-xs text-slate-500 truncate mt-0.5">{row.original.category}</p>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => <PriorityBadge priority={row.getValue('priority')} />,
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
      },
      {
        accessorKey: 'slaStatus',
        header: 'SLA',
        cell: ({ row }) => {
          const sla = row.getValue('slaStatus') as SlaStatus | undefined
          return sla ? <SlaBadge status={sla} /> : <span className="text-slate-400">—</span>
        },
      },
      {
        accessorKey: 'creator',
        header: 'Requester',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium">
              {row.original.creator?.name?.charAt(0) || '?'}
            </div>
            <span className="text-sm">{row.original.creator?.name || 'Unknown'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'assignee',
        header: 'Assignee',
        cell: ({ row }) => {
          const assignee = row.original.assignee
          if (!assignee) {
            return <span className="text-slate-400 text-sm">Unassigned</span>
          }
          return (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                {assignee.name?.charAt(0)}
              </div>
              <span className="text-sm">{assignee.name}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'updatedAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Updated
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-slate-500">
            {formatRelativeTime(row.getValue('updatedAt'))}
          </span>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/requests/${row.original.id}`)}>
                View Details
              </DropdownMenuItem>
              {currentRole === 'agent' || currentRole === 'admin' ? (
                <>
                  <DropdownMenuItem>Assign to me</DropdownMenuItem>
                  <DropdownMenuItem>Change Priority</DropdownMenuItem>
                </>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem>Copy Link</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 50,
      },
    ],
    [router, currentRole]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows

  if (authLoading || isLoading) {
    return <RequestsPageSkeleton />
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Requests</h1>
          <p className="text-slate-500 mt-1">Manage and track all requests</p>
        </div>
        <Button asChild>
          <Link href="/requests/new">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="mine">My Requests</TabsTrigger>
          <TabsTrigger value="watching">Watching</TabsTrigger>
          <TabsTrigger value="recent">Recently Updated</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Quick Filter Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-slate-500">Quick filters:</span>
        <Button
          variant={statusFilter === 'all' && priorityFilter === 'all' && slaFilter === 'all' ? 'secondary' : 'outline'}
          size="sm"
          className="h-7 text-xs"
          onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setSlaFilter('all'); }}
        >
          All
        </Button>
        {currentRole === 'agent' || currentRole === 'admin' ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => router.push('/requests?assignee=unassigned')}
          >
            Unassigned
          </Button>
        ) : null}
        <Button
          variant={priorityFilter === 'high' || priorityFilter === 'critical' ? 'secondary' : 'outline'}
          size="sm"
          className="h-7 text-xs"
          onClick={() => setPriorityFilter(priorityFilter === 'high' ? 'all' : 'high')}
        >
          High Priority
        </Button>
        <Button
          variant={slaFilter === 'at-risk' ? 'secondary' : 'outline'}
          size="sm"
          className="h-7 text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
          onClick={() => setSlaFilter(slaFilter === 'at-risk' ? 'all' : 'at-risk')}
        >
          At Risk
        </Button>
        <Button
          variant={slaFilter === 'breached' ? 'secondary' : 'outline'}
          size="sm"
          className="h-7 text-xs text-red-700 border-red-200 hover:bg-red-50"
          onClick={() => setSlaFilter(slaFilter === 'breached' ? 'all' : 'breached')}
        >
          Breached
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search requests..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status} className="capitalize">
                  {status.replace('-', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {priorityOptions.map((priority) => (
                <SelectItem key={priority} value={priority} className="capitalize">
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={slaFilter} onValueChange={setSlaFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="SLA" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All SLA</SelectItem>
              {slaOptions.map((sla) => (
                <SelectItem key={sla} value={sla} className="capitalize">
                  {sla.replace('-', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3 className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export */}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm font-medium text-blue-900">
            {selectedRows.length} selected
          </span>
          <div className="flex-1" />
          {(currentRole === 'agent' || currentRole === 'admin') && (
            <>
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Assign
              </Button>
              <Button variant="outline" size="sm">
                <Tag className="h-4 w-4 mr-2" />
                Add Tags
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRowSelection({})}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-slate-50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-slate-600"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/requests/${row.original.id}`)}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-slate-500">No requests found</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          of {table.getFilteredRowModel().rows.length} requests
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

function RequestsPageSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-10 w-96" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="rounded-lg border">
        <div className="p-4 border-b bg-slate-50">
          <Skeleton className="h-4 w-full" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border-b">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
