import { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export function AmountInput({
  label,
  value,
  isEstimated,
  token,
  balance,
  prefix,
  suffix,
  placeholder = "-",
  inputProps,
}: {
  label: ReactNode
  value?: string
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  isEstimated?: boolean
  token?: {
    icon: string
    exponent?: number
    ticker: string
  }
  balance?: ReactNode
  prefix?: ReactNode
  suffix?: ReactNode
  placeholder?: string
}) {
  return (
    <div className="space-y-2 rounded-xl border p-3">
      <div className="flex items-center justify-between text-xs font-medium">
        <div className="text-muted-foreground">{label}</div>
        {balance && (
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Balance</span> {balance}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 text-lg! font-bold!">
        {prefix}
        <Input
          {...inputProps}
          className={cn(
            "border-none! p-0 text-lg! font-bold! ring-0!",
            !inputProps?.onChange && "pointer-events-none",
            inputProps?.className
          )}
          value={value ? (isEstimated ? `≈${value}` : value) : undefined}
          placeholder={placeholder}
          readOnly={!inputProps?.onChange}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
        />
        {suffix}
        {token && (
          <img
            src={token.icon}
            alt={token.ticker}
            className="size-6 shrink-0 rounded-full"
          />
        )}
      </div>
    </div>
  )
}
