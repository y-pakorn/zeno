"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import _ from "lodash"
import { ArrowRight, ArrowUpRight, ChevronsUpDown, Search } from "lucide-react"

import { markets } from "@/config/market"
import { cn } from "@/lib/utils"

import { Badge } from "./ui/badge"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command"
import { Input } from "./ui/input"
import { useNetwork } from "./wallet-provider"

export function MarketSearchBar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [open, setOpen] = useState(false)

  const { network } = useNetwork()
  const availableMarkets = useMemo(
    () => markets.filter((market) => market.network === network),
    [network]
  )

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <div
        className={cn("relative w-full max-w-[250px]", className)}
        onClick={() => setOpen(true)}
        {...props}
      >
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          className="bg-background cursor-pointer rounded-full pr-8 pl-8"
          placeholder="Search for a market"
          readOnly
        />
        <kbd className="bg-muted text-muted-foreground pointer-events-none absolute top-1/2 right-3 inline-flex h-5 -translate-y-1/2 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Search for a market" />
          <CommandList>
            <CommandEmpty>No markets found.</CommandEmpty>
            <CommandGroup heading="Markets">
              {availableMarkets.map((market) => (
                <Link
                  href={`/markets/${market.id}`}
                  key={market.id}
                  onClick={() => setOpen(false)}
                >
                  <CommandItem>
                    <img
                      src={market.icon}
                      alt={market.name}
                      className="size-5 rounded-full"
                    />
                    <span className="truncate font-semibold">
                      {market.name}
                    </span>
                    <Badge
                      className="ml-auto"
                      variant={market.status === "live" ? "success" : "error"}
                    >
                      {_.startCase(market.status)}
                    </Badge>
                    <ArrowUpRight className="size-4" />
                  </CommandItem>
                </Link>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <Link href="/markets" onClick={() => setOpen(false)}>
                <CommandItem>
                  <span className="font-semibold">View all markets</span>
                  <ArrowRight className="ml-auto size-4" />
                </CommandItem>
              </Link>
              <Link href="/portfolio" onClick={() => setOpen(false)}>
                <CommandItem>
                  <span className="font-semibold">Portfolio</span>
                  <ArrowRight className="ml-auto size-4" />
                </CommandItem>
              </Link>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
