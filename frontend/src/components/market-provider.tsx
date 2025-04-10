"use client"

import { createContext, useContext, useMemo, useState } from "react"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import _, { filter } from "lodash"

import { OnchainMarket, PreMarket } from "@/types/market"
import { Offer, OpenOrder } from "@/types/order"
import { useCollateralPrices } from "@/hooks/use-collateral-prices"
import { MyOrders, useMyOrders } from "@/hooks/use-my-orders"
import { useOnchainMarket } from "@/hooks/use-onchain-market"
import { useOpenOrders } from "@/hooks/use-open-orders"
import { useFilledOrderEvents } from "@/hooks/use-order-events"
import { useNetwork } from "@/components/wallet-provider"

export type MarketProviderContextType = {
  market: PreMarket
  onchainMarket: UseQueryResult<OnchainMarket>
  collateralPrices: UseQueryResult<Record<string, BigNumber>>
  myOrders: MyOrders
  stats: {
    lastPrice: BigNumber | null
    isLoadingLastPrice: boolean
    pctChange: BigNumber | null
    isLoadingPctChange: boolean
    totalVolume: BigNumber
    isLoadingVolume: boolean
  }
}

const MarketProviderContext = createContext<MarketProviderContextType>(
  {} as any
)

export const useMarket = () => {
  const data = useContext(MarketProviderContext)

  if (!data) {
    throw new Error("useMarket must be used within a MarketProvider")
  }

  return data
}

export const MarketProvider = ({
  market,
  children,
  queryMyOrders = true,
}: {
  market: PreMarket
  children: React.ReactNode
  queryMyOrders?: boolean
}) => {
  const onchainMarket = useOnchainMarket({
    market,
  })

  const myOrders = useMyOrders({
    market,
    onchainMarket: onchainMarket.data,
    enabled: queryMyOrders,
  })

  const collateralPrices = useCollateralPrices({
    market,
  })

  const filledOrders = useFilledOrderEvents({
    market,
  })

  const stats = useMemo(() => {
    const lastFilledOrder = filledOrders.data?.[0]
    const firstFilledOrder = filledOrders.data?.[filledOrders.data.length - 1]
    const lastPrice = lastFilledOrder
      ? lastFilledOrder.rate.multipliedBy(
          collateralPrices.data?.[lastFilledOrder.collateral.coinType] || 0
        )
      : null
    const firstPrice = firstFilledOrder
      ? firstFilledOrder.rate.multipliedBy(
          collateralPrices.data?.[firstFilledOrder.collateral.coinType] || 0
        )
      : null
    const totalVolume = _.chain(onchainMarket.data?.collateral)
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

    return {
      lastPrice,
      isLoadingLastPrice: filledOrders.isPending || collateralPrices.isPending,
      pctChange:
        lastPrice
          ?.div(firstPrice || 1)
          .minus(1)
          .multipliedBy(100) || null,
      isLoadingPctChange: filledOrders.isPending || collateralPrices.isPending,
      totalVolume,
      isLoadingVolume: onchainMarket.isPending || collateralPrices.isPending,
    }
  }, [filledOrders.data, collateralPrices.data, onchainMarket.data])

  return (
    <MarketProviderContext.Provider
      value={{
        market,
        onchainMarket,
        collateralPrices,
        myOrders,
        stats,
      }}
    >
      {children}
    </MarketProviderContext.Provider>
  )
}
