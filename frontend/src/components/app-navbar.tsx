import { cn } from "@/lib/utils"

import { MarketSearchBar } from "./market-search-bar"
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
        "sticky top-0 z-50 flex items-center gap-2 bg-transparent",
        className
      )}
      style={{ height: NAVBAR_HEIGHT }}
      {...props}
    >
      <MarketSearchBar className="hidden md:flex" />
      <div className="flex-1" />
      <NetworkButton />
      <WalletButton />
    </nav>
  )
}
