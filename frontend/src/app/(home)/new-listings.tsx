"use client"

import { useMemo } from "react"
import Link from "next/link"
import _ from "lodash"

import { Market } from "@/types/market"
import { markets } from "@/config/market"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useNetwork } from "@/components/wallet-provider"

export function NewListings() {
  const { network } = useNetwork()

  const availableMarkets = useMemo(
    () => markets.filter((market) => market.network === network),
    [network]
  )
  return (
    <>
      <h2 className="font-heading text-2xl font-bold">
        New And Upcoming Listings
      </h2>
      <div className="flex w-full gap-4 overflow-x-auto">
        {availableMarkets.map((item) => (
          <NewListingCard key={item.id} {...item} />
        ))}
      </div>
    </>
  )
}

function NewListingCard(market: Market) {
  return (
    <Link
      href={`/markets/${market.id}`}
      className={cn(market.status !== "live" && "pointer-events-none")}
    >
      <div className="w-[260px]">
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
            <Badge variant={market.status === "live" ? "success" : "error"}>
              {_.startCase(market.status)}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  )
}
