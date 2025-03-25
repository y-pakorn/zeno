import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { useMutation, UseMutationResult } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import _ from "lodash"

import { useFillOrder } from "@/hooks/use-fill-order"

import { useBook } from "./book-provider"
import { useMarket } from "./market-provider"

type OrderContextType = {
  selectedOrderIds: Set<string>
  selectOrder: (orderId: string) => void
  unselectOrder: (orderId: string) => void
  unselectAllOrders: () => void
  selected?: {
    type: "buy" | "sell"
    coinType: string
    ticker: string
    icon: string
    exponent: number
    averagePrice: BigNumber
    averagePriceUsd: BigNumber
    totalAmount: BigNumber
    totalCollateralAmount: BigNumber
    feeBuy: BigNumber
    feeSell: BigNumber
  }
  fillOrder: UseMutationResult<void, Error, void>
}

const OrderContext = createContext<OrderContextType>({} as any)

export function useOrder() {
  const data = useContext(OrderContext)

  if (!data) {
    throw new Error("useOrder must be used within a OrderProvider")
  }

  return data
}

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const { market, collateralPrices } = useMarket()
  const { openOrders } = useBook()

  const account = useCurrentAccount()

  const [selectedOrderIds, setSelectedOrderIds] = useState<
    OrderContextType["selectedOrderIds"]
  >(new Set())

  useEffect(() => {
    setSelectedOrderIds(new Set())
  }, [account])

  useEffect(() => {
    if (!openOrders.data) return
    setSelectedOrderIds((oldIds) => {
      const newIds = new Set(oldIds)
      const openOrderIds = new Set(openOrders.data.map((order) => order.id))
      // remove ids that are not in the open orders
      newIds.forEach((id) => {
        if (!openOrderIds.has(id)) {
          newIds.delete(id)
        }
      })
      return newIds
    })
  }, [openOrders.data])

  const selected = useMemo(() => {
    if (!openOrders.data) return
    if (selectedOrderIds.size === 0) return
    const orderMap = _.keyBy(openOrders.data, "id")
    const orderIds = Array.from(selectedOrderIds)
    const order = orderMap[orderIds[0]]
    const collateral = market.collaterals.find(
      (c) => c.coinType === order?.collateral.coinType
    )
    if (!order || !collateral) return
    const totalCollateralAmount = orderIds.reduce((acc, orderId) => {
      const order = orderMap[orderId]
      return acc.plus(order.collateral.amount)
    }, new BigNumber(0))
    const totalAmount = orderIds.reduce((acc, orderId) => {
      const order = orderMap[orderId]
      return acc.plus(order.collateral.amount.dividedBy(order.rate))
    }, new BigNumber(0))
    const averagePrice = totalAmount.dividedBy(totalCollateralAmount)
    const averagePriceUsd = averagePrice
      .dividedBy(
        collateralPrices.data?.[collateral.coinType] || new BigNumber(0)
      )
      .pow(-1)
    const feeBuy = totalAmount.multipliedBy(market.fee.buyer)
    const feeSell = totalCollateralAmount.multipliedBy(market.fee.seller)

    return {
      type: order.type,
      coinType: order.collateral.coinType,
      ticker: collateral.ticker,
      icon: collateral.icon,
      exponent: collateral.exponent,
      averagePrice: averagePrice,
      averagePriceUsd: averagePriceUsd,
      totalCollateralAmount: totalCollateralAmount,
      totalAmount: totalAmount,
      feeBuy: feeBuy,
      feeSell: feeSell,
    }
  }, [selectedOrderIds, openOrders.data, collateralPrices.data])

  const selectOrder = useCallback(
    (orderId: string) => {
      const order = openOrders.data?.find((order) => order.id === orderId)
      if (!order) return
      if (
        selected &&
        (selected.type !== order.type ||
          selected.coinType !== order.collateral.coinType)
      ) {
        // different type or coin type -> select new order
        setSelectedOrderIds(new Set([orderId]))
        return
      }
      setSelectedOrderIds((prev) => {
        const next = new Set(prev)
        next.add(orderId)
        return next
      })
    },
    [openOrders, selected]
  )

  const unselectOrder = useCallback((orderId: string) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev)
      next.delete(orderId)
      return next
    })
  }, [])

  const unselectAllOrders = useCallback(() => {
    setSelectedOrderIds(new Set())
  }, [])

  const _fillOrder = useFillOrder()
  const fillOrder = useMutation({
    mutationFn: async () => {
      await _fillOrder.mutateAsync({
        market,
        orders: Array.from(selectedOrderIds).map((orderId) => {
          const order = openOrders.data?.find((order) => order.id === orderId)
          if (!order) throw new Error("Order not found")
          return {
            orderId,
            collateral: {
              coinType: order.collateral.coinType,
              amount: order.collateral.amount,
              exponent: order.collateral.exponent,
            },
          }
        }),
      })
    },
  })

  // const myOpenOrders = useMemo(() => {
  //   if (!openOrders.data) return []
  // }, [openOrders.data])

  return (
    <OrderContext.Provider
      value={{
        selectedOrderIds,
        selectOrder,
        unselectOrder,
        unselectAllOrders,
        selected,
        fillOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}
