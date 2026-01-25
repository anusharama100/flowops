import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Status variants
        draft: "border-transparent bg-slate-100 text-slate-700",
        submitted: "border-transparent bg-sky-100 text-sky-700",
        "needs-info": "border-transparent bg-amber-100 text-amber-700",
        approved: "border-transparent bg-emerald-100 text-emerald-700",
        rejected: "border-transparent bg-rose-100 text-rose-700",
        triaged: "border-transparent bg-violet-100 text-violet-700",
        "in-progress": "border-transparent bg-blue-100 text-blue-700",
        blocked: "border-transparent bg-red-100 text-red-700",
        resolved: "border-transparent bg-green-100 text-green-700",
        closed: "border-transparent bg-gray-100 text-gray-700",
        // Priority variants
        low: "border-transparent bg-slate-100 text-slate-600",
        medium: "border-transparent bg-amber-100 text-amber-700",
        high: "border-transparent bg-orange-100 text-orange-700",
        critical: "border-transparent bg-red-100 text-red-700",
        // SLA variants
        "on-track": "border-transparent bg-emerald-100 text-emerald-700",
        "at-risk": "border-transparent bg-amber-100 text-amber-700",
        breached: "border-transparent bg-red-100 text-red-700",
        // Approval variants
        pending: "border-transparent bg-amber-100 text-amber-700",
        "not-required": "border-transparent bg-gray-100 text-gray-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
