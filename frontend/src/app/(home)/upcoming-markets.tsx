"use client"

import { useMemo } from "react"

import { PreMarket, UpcomingMarket } from "@/types/market"
import { markets } from "@/config/market"
import { MarketProvider } from "@/components/market-provider"
import { useNetwork } from "@/components/wallet-provider"

export function UpcomingMarkets() {
  const { network } = useNetwork()

  const availableMarkets = useMemo(
    () =>
      markets.filter(
        (market) => market.network === network && market.status === "upcoming"
      ) as UpcomingMarket[],
    [network]
  )

  if (availableMarkets.length === 0) return null

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-bold">Upcoming</h2>
      <div className="flex w-full gap-4 overflow-x-auto">
        {availableMarkets.map((item) => (
          <div
            key={item.id}
            className="bg-secondary flex w-[330px] items-center gap-2 rounded-2xl border px-4 py-3"
          >
            <img
              src={item.icon}
              alt={item.name}
              className="size-8 shrink-0 rounded-full"
            />
            <div className="truncate font-bold">{item.name}</div>
            <div className="ml-auto text-end">
              <div className="text-secondary-foreground text-sm font-bold">
                Upcoming
              </div>
              <div className="text-muted-foreground text-sm font-medium">
                TBA
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
