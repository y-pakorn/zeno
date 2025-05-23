"use client"

import { useMemo } from "react"
import Link from "next/link"
import _ from "lodash"

import { Market, PreMarket } from "@/types/market"
import { markets } from "@/config/market"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { MarketProvider, useMarket } from "@/components/market-provider"
import { useNetwork } from "@/components/wallet-provider"

export function NewListings() {
  const { network } = useNetwork()

  const availableMarkets = useMemo(
    () =>
      markets.filter(
        (market) =>
          market.network === network &&
          market.status === "live" &&
          market.featured
      ) as PreMarket[],
    [network]
  )
  if (availableMarkets.length === 0) return null
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-bold">Featured</h2>
      <div className="flex w-full gap-4 overflow-x-auto">
        {availableMarkets.map((item) => (
          <MarketProvider key={item.id} market={item} queryMyOrders={false}>
            <NewListingCard {...item} />
          </MarketProvider>
        ))}
      </div>
    </div>
  )
}

function NewListingCard(market: Market) {
  const { stats } = useMarket()

  return (
    <Link
      href={`/markets/${market.id}`}
      className={cn(market.status !== "live" && "pointer-events-none")}
    >
      <div className="w-[260px] rounded-2xl border">
        <div className="relative aspect-[1.25] flex-1 overflow-hidden rounded-t-2xl">
          <div
            className="size-full scale-200 bg-cover bg-center opacity-30 blur-md"
            style={{
              backgroundImage: `url(${market.icon})`,
            }}
          />
          <img
            src={market.icon}
            alt={market.name}
            className="absolute top-1/2 left-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full object-cover object-center"
          />
        </div>
        <div className="bg-secondary rounded-b-2xl px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-primary! text-lg font-bold">{market.name}</h3>
            <div className="text-muted-foreground text-sm">Price</div>
          </div>
          <div className="flex items-center justify-between">
            {stats.isLoadingPctChange ? (
              <Skeleton className="h-5 w-12" />
            ) : (
              <div
                className={cn(
                  "text-sm font-medium",
                  !stats.pctChange || stats.pctChange.eq(0)
                    ? "text-muted-foreground"
                    : stats.pctChange.gt(0)
                      ? "text-success"
                      : "text-error"
                )}
              >
                {stats.pctChange ? `${stats.pctChange.toFixed(2)}%` : "-"}
              </div>
            )}
            {stats.isLoadingLastPrice ? (
              <Skeleton className="h-5 w-12" />
            ) : (
              <div className="text-sm font-bold">
                {stats.lastPrice ? `$${stats.lastPrice.toFormat(2)}` : "-"}
              </div>
            )}
          </div>
          <Separator className="my-2" />
          <div className="flex items-center justify-between text-sm font-medium">
            <div className="text-muted-foreground">Total Volume</div>
            {stats.isLoadingVolume ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <div className="text-sm">
                {stats.totalVolume ? `$${stats.totalVolume.toFormat(2)}` : "-"}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
