import { cn } from "@/lib/utils"

import { NetworkButton } from "./network-button"
import { WalletButton } from "./wallet-button"

export const NAVBAR_HEIGHT = "80px"

export function AppNavbar({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      className={cn(
        "sticky top-0 z-50 flex items-center justify-end gap-2 bg-transparent",
        className
      )}
      style={{ height: NAVBAR_HEIGHT }}
      {...props}
    >
      <NetworkButton />
      <WalletButton />
    </nav>
  )
}
