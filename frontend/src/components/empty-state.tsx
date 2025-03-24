import { ComponentProps, memo, ReactNode } from "react"
import { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export const EmptyState = memo(function EmptyState({
  icon: Icon,
  header,
  className,
  ...props
}: {
  icon: LucideIcon
  header: ReactNode
} & ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-2 opacity-20",
        className
      )}
      {...props}
    >
      <Icon className="text-brand size-12" />
      <div className="text-sm font-medium">{header}</div>
    </div>
  )
})
