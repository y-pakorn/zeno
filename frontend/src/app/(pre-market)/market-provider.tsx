import { createContext, useContext, useMemo, useState } from "react"
import {
  useCurrentAccount,
  useSuiClient,
  useSuiClientQuery,
} from "@mysten/dapp-kit"
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
  price: number
  change24h: number
  volume24h: number
  volumeTotal: number
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

export const MarketProvider = ({ children }: { children: React.ReactNode }) => {
  const { network } = useNetwork()

  const market = useMemo(() => {
    return preMarkets[network]
  }, [network])

  const price = 0.96
  const change24h = 240.5
  const volume24h = 12300
  const volumeTotal = 109420

  const onchainMarket = useOnchainMarket({
    market,
  })

  const myOrders = useMyOrders({
    market,
    onchainMarket: onchainMarket.data,
  })

  const collateralPrices = useCollateralPrices({
    market,
  })

  return (
    <MarketProviderContext.Provider
      value={{
        market,
        price,
        change24h,
        volume24h,
        volumeTotal,
        onchainMarket,
        collateralPrices,
        myOrders,
      }}
    >
      {children}
    </MarketProviderContext.Provider>
  )
}
