"use client"

import { useMemo } from "react"
import Link from "next/link"
import BigNumber from "bignumber.js"
import _ from "lodash"
import numbro from "numbro"
import { FaDiscord, FaGlobe, FaXTwitter } from "react-icons/fa6"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useBook } from "@/components/book-provider"
import { useMarket } from "@/components/market-provider"

export function MarketHeader() {
  const { market, collateralPrices, stats } = useMarket()
  const { openOrders } = useBook()

  const isOpenInterestLoading = openOrders.isPending || openOrders.isPending
  const openInterest = useMemo(() => {
    if (!openOrders.data) return null
    return _.chain(openOrders.data)
      .map((order) =>
        order.collateral.amount.multipliedBy(
          collateralPrices.data?.[order.collateral.coinType] || 0
        )
      )
      .reduce((acc, curr) => acc.plus(curr), new BigNumber(0))
      .value()
  }, [openOrders.data, collateralPrices.data])

  return (
    <div className="flex items-center gap-6 rounded-2xl border px-4 py-3 text-sm font-medium">
      <img
        className="size-12 shrink-0 rounded-full"
        src={market.icon}
        alt="logo"
      />
      <div className="-ml-2">
        <div className="text-lg font-bold">{market.ticker}</div>
        <Badge variant={market.status === "live" ? "success" : "error"}>
          {_.startCase(market.status)}
        </Badge>
      </div>
      <div className="ml-8">
        <div>
          <div className="text-lg font-bold">
            {stats.isLoadingLastPrice ? (
              <Skeleton key="loading" className="h-8 w-12" />
            ) : stats.lastPrice ? (
              <span key="price">${stats.lastPrice.toFormat(2)}</span>
            ) : (
              <span key="empty">-</span>
            )}
          </div>
          <div
            className={cn(
              "text-muted-foreground font-semibold",
              !stats.pctChange || stats.pctChange.eq(0)
                ? "text-muted-foreground"
                : stats.pctChange.gt(0)
                  ? "text-success"
                  : "text-error"
            )}
          >
            {stats.pctChange?.gt(0) ? "+" : ""}
            {stats.pctChange?.toFixed(2)}%
          </div>
        </div>
      </div>
      <div>
        <div className="text-muted-foreground font-semibold">Total Vol</div>
        <div className="text-base">
          {stats.isLoadingVolume ? (
            <Skeleton key="loading" className="h-6 w-12" />
          ) : stats.totalVolume ? (
            <span key="volume">${stats.totalVolume.toFormat(2)}</span>
          ) : (
            <span key="empty">-</span>
          )}
        </div>
      </div>
      {(!market.resolution ||
        new Date() <= market.resolution.settlementStart) && (
        <div>
          <div className="text-muted-foreground font-semibold">
            Open Interest
          </div>
          <div className="text-base">
            {isOpenInterestLoading ? (
              <Skeleton key="loading" className="h-6 w-12" />
            ) : openInterest ? (
              <span key="interest">${openInterest.toFormat(2)}</span>
            ) : (
              <span key="empty">-</span>
            )}
          </div>
        </div>
      )}
      <div>
        <div className="text-muted-foreground font-semibold">Total Supply</div>
        <div className="text-base">
          {numbro(market.totalSupply)
            .format({
              average: true,
            })
            .toUpperCase()}
        </div>
      </div>
      <div>
        <div className="text-muted-foreground font-semibold">Settle Start</div>
        <div className="text-base">
          {market.resolution?.settlementStart
            ? new Date(market.resolution.settlementStart).toLocaleString()
            : "TBA"}
        </div>
      </div>
      <div>
        <div className="text-muted-foreground font-semibold">
          Delivery Before
        </div>
        <div className="text-base">
          {market.resolution?.deliveryBefore
            ? new Date(market.resolution.deliveryBefore).toLocaleString()
            : "TBA"}
        </div>
      </div>
      <div className="flex-1" />
      {(
        [
          [FaXTwitter, market.links?.twitter],
          [FaDiscord, market.links?.discord],
          [FaGlobe, market.links?.website],
        ] as const
      ).map(([Icon, link]) => {
        if (!link) return null
        return (
          <Link
            key={link}
            href={link}
            target="_blank"
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
            })}
          >
            <Icon />
          </Link>
        )
      })}
    </div>
  )
}
