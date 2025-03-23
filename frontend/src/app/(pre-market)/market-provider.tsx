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
  openOrders: UseQueryResult<OpenOrder[]>
  offers: Offer[]
  collateralPrices: UseQueryResult<Record<string, BigNumber>>
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
    marketId: market.marketId,
  })

  const openOrders = useOpenOrders({
    market,
    openOrderBagId: onchainMarket.data?.openOrdersBagId!,
    enabled: !!onchainMarket.data?.openOrdersBagId,
  })

  const collateralPrices = useCollateralPrices({
    market,
  })

  const offers = useMemo(() => {
    const allOffers = _.chain(openOrders.data || [])
      .map((order) => {
        const price = order.rate.multipliedBy(
          collateralPrices.data?.[order.collateral.coinType] || new BigNumber(0)
        )
        const amount = order.collateral.amount.dividedBy(order.rate)
        const offer = {
          ...order,
          price,
          amount,
        }
        return offer
      })
      .value()
    return allOffers
  }, [openOrders.data, collateralPrices.data])

  return (
    <MarketProviderContext.Provider
      value={{
        market,
        price,
        change24h,
        volume24h,
        volumeTotal,
        onchainMarket,
        openOrders,
        offers,
        collateralPrices,
      }}
    >
      {children}
    </MarketProviderContext.Provider>
  )
}
