"use client"

import _ from "lodash"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

import { Icons } from "./icons"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { networks, useNetwork } from "./wallet-provider"

export function NetworkButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { network, setNetwork } = useNetwork()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="active"
          rounded="full"
          {...props}
          className={cn(className)}
        >
          <Icons.sui />
          {_.startCase(network)}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {networks.map((network) => (
          <DropdownMenuItem key={network} onClick={() => setNetwork(network)}>
            {_.startCase(network)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
