import { useMemo } from "react"
import Link from "next/link"
import BigNumber from "bignumber.js"
import _ from "lodash"
import numbro from "numbro"
import { FaDiscord, FaGlobe, FaXTwitter } from "react-icons/fa6"

import { cn } from "@/lib/utils"
import { useFilledOrderEvents } from "@/hooks/use-order-events"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { useBook } from "./book-provider"
import { useMarket } from "./market-provider"

export function MarketHeader() {
  const { market, collateralPrices, onchainMarket } = useMarket()
  const { openOrders } = useBook()

  const filledOrders = useFilledOrderEvents({
    market,
  })

  const isLatestPriceLoading =
    filledOrders.isPending || collateralPrices.isPending
  const latestPrice = useMemo(() => {
    if (!filledOrders.data?.length) return null
    const lastFilledOrder = filledOrders.data[0]
    const price = lastFilledOrder.rate.multipliedBy(
      collateralPrices.data?.[lastFilledOrder.collateral.coinType] || 0
    )
    return price
  }, [filledOrders.data, collateralPrices.data])

  const isTotalVolumeLoading =
    onchainMarket.isPending || collateralPrices.isPending
  const totalVolume = useMemo(() => {
    if (!onchainMarket.data) return null
    return _.chain(onchainMarket.data.collateral)
      .entries()
      .reduce(
        (acc, [coinType, collateral]) =>
          acc.plus(
            collateral.volumeFilled.multipliedBy(
              collateralPrices.data?.[coinType] || 0
            )
          ),
        new BigNumber(0)
      )
      .value()
  }, [onchainMarket, collateralPrices.data])

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
    <div className="flex items-center gap-4 rounded-2xl border px-4 py-3 text-sm font-medium">
      <img
        className="size-12 shrink-0 rounded-full"
        src={market.icon}
        alt="logo"
      />
      <div className="-ml-2">
        <div className="text-lg font-bold">{market.name}</div>
        <Badge variant={market.isLive ? "success" : "error"}>
          {market.isLive ? "LIVE" : "UPCOMING"}
        </Badge>
      </div>
      <div className="ml-12">
        <div className="text-lg font-bold">
          {isLatestPriceLoading ? (
            <Skeleton key="loading" className="h-8 w-12" />
          ) : latestPrice ? (
            <span key="price">${latestPrice.toFormat(2)}</span>
          ) : (
            <span key="empty">-</span>
          )}
        </div>
      </div>
      <div className="ml-4">
        <div className="text-muted-foreground font-semibold">Total Vol</div>
        <div className="text-base">
          {isTotalVolumeLoading ? (
            <Skeleton key="loading" className="h-6 w-12" />
          ) : totalVolume ? (
            <span key="volume">${totalVolume.toFormat(2)}</span>
          ) : (
            <span key="empty">-</span>
          )}
        </div>
      </div>
      <div className="ml-4">
        <div className="text-muted-foreground font-semibold">Open Interest</div>
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
