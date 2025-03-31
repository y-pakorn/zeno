"use client"

import { createContext, useContext, useMemo } from "react"
import { UseQueryResult } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import _ from "lodash"

import { Offer, OpenOrder } from "@/types/order"
import { useOpenOrders } from "@/hooks/use-open-orders"

import { useMarket } from "./market-provider"

type BookContextType = {
  openOrders: UseQueryResult<OpenOrder[]>
  offers: Offer[]
}

const BookContext = createContext<BookContextType>({} as any)

export const useBook = () => {
  const data = useContext(BookContext)
  if (!data) {
    throw new Error("useBook must be used within a BookProvider")
  }
  return data
}

export function BookProvider({ children }: { children: React.ReactNode }) {
  const { market, onchainMarket, collateralPrices } = useMarket()

  const openOrders = useOpenOrders({
    market,
    openOrderBagId: onchainMarket.data?.openOrdersBagId!,
    enabled: !!onchainMarket.data?.openOrdersBagId,
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
    <BookContext.Provider value={{ openOrders, offers }}>
      {children}
    </BookContext.Provider>
  )
}
