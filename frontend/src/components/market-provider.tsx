"use client"

import { createContext, useContext, useMemo, useState } from "react"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import _, { filter } from "lodash"

import { OnchainMarket, PreMarket } from "@/types/market"
import { Offer, OpenOrder } from "@/types/order"
import { preMarkets } from "@/config/market"
import { useCollateralPrices } from "@/hooks/use-collateral-prices"
import { MyOrders, useMyOrders } from "@/hooks/use-my-orders"
import { useOnchainMarket } from "@/hooks/use-onchain-market"
import { useOpenOrders } from "@/hooks/use-open-orders"
import { useNetwork } from "@/components/wallet-provider"

export type MarketProviderContextType = {
  market: PreMarket
  onchainMarket: UseQueryResult<OnchainMarket>
  collateralPrices: UseQueryResult<Record<string, BigNumber>>
  myOrders: MyOrders
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

  return (
    <MarketProviderContext.Provider
      value={{
        market,
        onchainMarket,
        collateralPrices,
        myOrders,
      }}
    >
      {children}
    </MarketProviderContext.Provider>
  )
}
