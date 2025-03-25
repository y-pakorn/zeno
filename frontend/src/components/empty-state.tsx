import React, {
  ComponentProps,
  ElementType,
  isValidElement,
  memo,
  ReactElement,
  ReactNode,
} from "react"
import { isElement } from "lodash"
import { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export const EmptyState = memo(function EmptyState({
  icon: Icon,
  header,
  description,
  className,
  opaque,
  children,
  ...props
}: {
  icon?: LucideIcon | ElementType<any> | ReactElement
  header?: ReactNode
  description?: ReactNode
  opaque?: boolean
} & ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-2 text-center",
        opaque ? "opacity-20" : "opacity-100",
        className
      )}
      {...props}
    >
      {!Icon || isValidElement(Icon) ? (
        Icon
      ) : (
        <Icon className="text-brand size-14" />
      )}
      <div className="text-2xl font-bold">{header}</div>
      <div className="text-secondary-foreground text-sm font-medium">
        {description}
      </div>
      {children}
    </div>
  )
})
