import { cn } from "@/lib/utils"

import { WalletButton } from "./wallet-button"

const NAVBAR_HEIGHT = "80px"

export function AppNavbar({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      className={cn(
        "bg-background sticky top-0 z-50 flex items-center",
        className
      )}
      style={{ height: NAVBAR_HEIGHT }}
      {...props}
    >
      <WalletButton className="ml-auto" />
    </nav>
  )
}
