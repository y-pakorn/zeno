import { createContext, useContext, useMemo, useState } from "react"
import { useSuiClient, useSuiClientQuery } from "@mysten/dapp-kit"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import _ from "lodash"

import { OnchainMarket, PreMarket } from "@/types/market"
import { Offer, OpenOrder } from "@/types/order"
import { preMarkets } from "@/config/market"
import { useCollateralPrices } from "@/hooks/use-collateral-prices"
import { useOnchainMarket } from "@/hooks/use-onchain-market"
import { useOpenOrders } from "@/hooks/use-open-orders"
import { useNetwork } from "@/components/wallet-provider"

export type MarketProviderContextType = {
  market: PreMarket
  filters: {
    type: "buy" | "sell" | "all"
    collateral?: string
    fillType?: "full" | "partial"
  }
  setFilters: (filters: MarketProviderContextType["filters"]) => void
  price: number
  change24h: number
  volume24h: number
  volumeTotal: number
  onchainMarket: UseQueryResult<OnchainMarket>
  openOrders: UseQueryResult<OpenOrder[]>
  offers: {
    buy: Offer[]
    shownBuy: Offer[]
    sell: Offer[]
    shownSell: Offer[]
  }
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

  const [filters, setFilters] = useState<MarketProviderContextType["filters"]>({
    type: "all",
    collateral: undefined,
    fillType: undefined,
  })

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

  const { buyOffers, sellOffers } = useMemo(() => {
    const buyOffers: Offer[] = []
    const sellOffers: Offer[] = []

    for (const order of openOrders.data || []) {
      const shiftedRate = order.rate.shiftedBy(-9)
      const collateral = market.collaterals.find(
        (c) => c.coinType === order.collateral.coinType
      )
      if (!collateral) continue
      const price =
        collateralPrices.data?.[collateral.coinType]?.multipliedBy(
          shiftedRate
        ) || new BigNumber(0)
      const collateralAmount = order.collateral.amount.shiftedBy(
        -collateral.exponent
      )
      const amount = collateralAmount.dividedBy(shiftedRate)
      const offer = {
        id: order.id,
        price: price,
        amount: amount,
        fillType: order.fillType,
        collateral: {
          icon: collateral.icon,
          coinType: collateral.coinType,
          amount: collateralAmount,
        },
        type: order.type,
      }
      if (order.type === "buy") {
        buyOffers.push(offer)
      } else {
        sellOffers.push(offer)
      }
    }

    buyOffers.sort((a, b) => (b.price.gt(a.price) ? 1 : -1))
    sellOffers.sort((a, b) => (a.price.gt(b.price) ? 1 : -1))

    return {
      buyOffers,
      sellOffers,
    }
  }, [openOrders.data, market.collaterals, collateralPrices.data, filters])

  const shownBuy = useMemo(() => {
    return _.chain(buyOffers)
      .filter((offer) => {
        return filters.fillType ? offer.fillType === filters.fillType : true
      })
      .filter((offer) => {
        return filters.collateral
          ? offer.collateral.coinType === filters.collateral
          : true
      })
      .value()
  }, [buyOffers, filters.fillType, filters.collateral])

  const shownSell = useMemo(() => {
    return _.chain(sellOffers)
      .filter((offer) => {
        return filters.fillType ? offer.fillType === filters.fillType : true
      })
      .filter((offer) => {
        return filters.collateral
          ? offer.collateral.coinType === filters.collateral
          : true
      })
      .value()
  }, [sellOffers, filters.fillType, filters.collateral])

  return (
    <MarketProviderContext.Provider
      value={{
        market,
        filters,
        setFilters,
        price,
        change24h,
        volume24h,
        volumeTotal,
        onchainMarket,
        openOrders,
        offers: {
          buy: buyOffers,
          shownBuy,
          sell: sellOffers,
          shownSell,
        },
        collateralPrices,
      }}
    >
      {children}
    </MarketProviderContext.Provider>
  )
}
