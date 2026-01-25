'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { StatusBadge, PriorityBadge, SlaBadge, ApprovalBadge } from '@/components/shared/status-badge'
import { toast } from '@/hooks/use-toast'
import {
  AlertCircle,
  CheckCircle,
  Info,
  Plus,
  Search,
  Settings,
  User,
  FileText,
  Mail,
  Lock,
  Bell,
  Loader2,
} from 'lucide-react'

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState('tokens')

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Design System</h1>
        <p className="text-slate-500 mt-1">FlowOps component library and design tokens</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        {/* Tokens */}
        <TabsContent value="tokens" className="space-y-8">
          <Section title="Color Palette" description="Core brand and semantic colors">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <ColorSwatch name="Primary" color="bg-primary" text="text-primary-foreground" />
              <ColorSwatch name="Secondary" color="bg-secondary" text="text-secondary-foreground" />
              <ColorSwatch name="Muted" color="bg-muted" text="text-muted-foreground" />
              <ColorSwatch name="Accent" color="bg-accent" text="text-accent-foreground" />
              <ColorSwatch name="Destructive" color="bg-destructive" text="text-destructive-foreground" />
              <ColorSwatch name="Success" color="bg-emerald-600" text="text-white" />
            </div>
          </Section>

          <Section title="Spacing Scale" description="Consistent spacing tokens">
            <div className="flex items-end gap-4">
              {[1, 2, 3, 4, 6, 8, 12, 16].map((size) => (
                <div key={size} className="text-center">
                  <div
                    className="bg-blue-500 rounded"
                    style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
                  />
                  <p className="text-xs text-slate-500 mt-2">{size * 4}px</p>
                  <p className="text-xs text-slate-400">space-{size}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Border Radius" description="Consistent corner rounding">
            <div className="flex items-center gap-6">
              {[
                { name: 'none', class: 'rounded-none' },
                { name: 'sm', class: 'rounded-sm' },
                { name: 'md', class: 'rounded-md' },
                { name: 'lg', class: 'rounded-lg' },
                { name: 'xl', class: 'rounded-xl' },
                { name: 'full', class: 'rounded-full' },
              ].map((radius) => (
                <div key={radius.name} className="text-center">
                  <div className={`w-16 h-16 bg-slate-200 ${radius.class}`} />
                  <p className="text-xs text-slate-500 mt-2">{radius.name}</p>
                </div>
              ))}
            </div>
          </Section>
        </TabsContent>

        {/* Typography */}
        <TabsContent value="typography" className="space-y-8">
          <Section title="Type Scale" description="Hierarchical text styles">
            <div className="space-y-6">
              <div>
                <p className="text-xs text-slate-400 mb-1">text-display (36px / bold)</p>
                <p className="text-display">Dashboard Overview</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">text-headline (24px / semibold)</p>
                <p className="text-headline">Request Details</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">text-title (18px / semibold)</p>
                <p className="text-title">Card Title</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">text-body (16px / normal)</p>
                <p className="text-body">Body text for longer content and descriptions.</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">text-caption (14px / muted)</p>
                <p className="text-caption">Caption text for secondary information</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">text-overline (12px / uppercase)</p>
                <p className="text-overline">Overline Label</p>
              </div>
            </div>
          </Section>
        </TabsContent>

        {/* Buttons */}
        <TabsContent value="buttons" className="space-y-8">
          <Section title="Button Variants" description="Different button styles for different contexts">
            <div className="flex flex-wrap gap-4">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
            </div>
          </Section>

          <Section title="Button Sizes" description="Different sizes for different contexts">
            <div className="flex items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon"><Settings className="h-4 w-4" /></Button>
              <Button size="icon-sm"><Settings className="h-4 w-4" /></Button>
            </div>
          </Section>

          <Section title="Button States" description="Interactive states">
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button disabled>Disabled</Button>
              <Button disabled><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading</Button>
            </div>
          </Section>

          <Section title="Buttons with Icons" description="Icon placement patterns">
            <div className="flex flex-wrap gap-4">
              <Button><Plus className="h-4 w-4 mr-2" />Create</Button>
              <Button variant="outline"><Search className="h-4 w-4 mr-2" />Search</Button>
              <Button variant="secondary">Settings<Settings className="h-4 w-4 ml-2" /></Button>
            </div>
          </Section>
        </TabsContent>

        {/* Forms */}
        <TabsContent value="forms" className="space-y-8">
          <Section title="Input Fields" description="Text input variations">
            <div className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default">Default Input</Label>
                <Input id="default" placeholder="Enter text..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="with-icon">Input with Icon</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input id="with-icon" placeholder="Search..." className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="disabled">Disabled Input</Label>
                <Input id="disabled" placeholder="Disabled" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="error">Input with Error</Label>
                <Input id="error" placeholder="Invalid input" className="border-red-500" />
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  This field is required
                </p>
              </div>
            </div>
          </Section>

          <Section title="Textarea" description="Multi-line text input">
            <div className="max-w-md space-y-2">
              <Label htmlFor="textarea">Description</Label>
              <Textarea id="textarea" placeholder="Enter a longer description..." rows={4} />
              <p className="text-sm text-slate-500">Provide detailed information</p>
            </div>
          </Section>

          <Section title="Select" description="Dropdown selection">
            <div className="max-w-md space-y-2">
              <Label>Priority</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Section>

          <Section title="Checkbox & Switch" description="Binary input controls">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Accept terms and conditions</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="notifications" />
                <Label htmlFor="notifications">Enable notifications</Label>
              </div>
            </div>
          </Section>
        </TabsContent>

        {/* Badges */}
        <TabsContent value="badges" className="space-y-8">
          <Section title="Status Badges" description="Request status indicators">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="draft" />
              <StatusBadge status="submitted" />
              <StatusBadge status="needs-info" />
              <StatusBadge status="triaged" />
              <StatusBadge status="in-progress" />
              <StatusBadge status="blocked" />
              <StatusBadge status="resolved" />
              <StatusBadge status="closed" />
            </div>
          </Section>

          <Section title="Priority Badges" description="Request priority levels">
            <div className="flex flex-wrap gap-2">
              <PriorityBadge priority="low" />
              <PriorityBadge priority="medium" />
              <PriorityBadge priority="high" />
              <PriorityBadge priority="critical" />
            </div>
          </Section>

          <Section title="SLA Badges" description="Service level status">
            <div className="flex flex-wrap gap-2">
              <SlaBadge status="on-track" />
              <SlaBadge status="at-risk" />
              <SlaBadge status="breached" />
            </div>
          </Section>

          <Section title="Approval Badges" description="Approval workflow status">
            <div className="flex flex-wrap gap-2">
              <ApprovalBadge state="pending" />
              <ApprovalBadge state="approved" />
              <ApprovalBadge state="rejected" />
              <ApprovalBadge state="needs-info" />
              <ApprovalBadge state="not-required" />
            </div>
          </Section>

          <Section title="Generic Badges" description="General purpose badges">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </Section>
        </TabsContent>

        {/* Cards */}
        <TabsContent value="cards" className="space-y-8">
          <Section title="Card Variants" description="Container patterns">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Card</CardTitle>
                  <CardDescription>A simple card with header and content</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">Card body content goes here.</p>
                </CardContent>
              </Card>

              <Card className="card-interactive">
                <CardHeader>
                  <CardTitle>Interactive Card</CardTitle>
                  <CardDescription>Hover to see interaction</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">Click to navigate somewhere.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Card with Footer</CardTitle>
                  <CardDescription>Includes action buttons</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">Main content area.</p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button variant="outline" size="sm">Cancel</Button>
                  <Button size="sm">Save</Button>
                </CardFooter>
              </Card>
            </div>
          </Section>
        </TabsContent>

        {/* Feedback */}
        <TabsContent value="feedback" className="space-y-8">
          <Section title="Toasts" description="Notification messages">
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => toast({ title: 'Default toast', description: 'This is a notification message' })}>
                Default Toast
              </Button>
              <Button variant="success" onClick={() => toast({ title: 'Success!', description: 'Operation completed successfully', variant: 'success' })}>
                Success Toast
              </Button>
              <Button variant="destructive" onClick={() => toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })}>
                Error Toast
              </Button>
            </div>
          </Section>

          <Section title="Loading States" description="Skeleton placeholders">
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Progress" description="Progress indicators">
            <div className="max-w-md space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>65%</span>
                </div>
                <Progress value={65} />
              </div>
            </div>
          </Section>

          <Section title="Dialogs" description="Modal dialogs">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Action</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to proceed with this action?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Section>
        </TabsContent>

        {/* Patterns */}
        <TabsContent value="patterns" className="space-y-8">
          <Section title="Empty States" description="When there's no data to show">
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="font-medium text-slate-900">No requests found</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">
                  Get started by creating your first request
                </p>
                <Button><Plus className="h-4 w-4 mr-2" />Create Request</Button>
              </CardContent>
            </Card>
          </Section>

          <Section title="User Avatars" description="User identity display">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback className="bg-blue-100 text-blue-700">SK</AvatarFallback>
              </Avatar>
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-emerald-100 text-emerald-700">MT</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">ED</AvatarFallback>
              </Avatar>
            </div>
          </Section>

          <Section title="Form Validation" description="Error and helper text patterns">
            <div className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="you@example.com" />
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  We&apos;ll never share your email with anyone
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" className="border-red-500" />
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Password must be at least 8 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" className="border-green-500" defaultValue="johndoe" />
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Username is available
                </p>
              </div>
            </div>
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description && <p className="text-sm text-slate-500 mt-1 mb-4">{description}</p>}
      <div className="mt-4">{children}</div>
    </div>
  )
}

function ColorSwatch({ name, color, text }: { name: string; color: string; text: string }) {
  return (
    <div>
      <div className={`h-16 rounded-lg ${color} flex items-center justify-center`}>
        <span className={`text-sm font-medium ${text}`}>{name}</span>
      </div>
      <p className="text-xs text-slate-500 mt-2 text-center">{name}</p>
    </div>
  )
}
