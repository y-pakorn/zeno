"use client"

import { useEffect, useMemo, useState } from "react"
import _ from "lodash"
import { Bookmark, ChevronLeft, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { EmptyState } from "@/components/empty-state"
import { useMarket } from "@/components/market-provider"
import { OrderCard } from "@/components/order-card"
import { useOrder } from "@/components/order-provider"

import { MakerOrder } from "./maker-order"
import { TakerOrder } from "./taker-order"

export const ORDER_SECTION_WIDTH = "330px"

export function OrderSection() {
  const { selectedOrderIds } = useOrder()
  const [isTaker, setIsTaker] = useState(true)

  useEffect(() => {
    if (selectedOrderIds.size) {
      setIsTaker(true)
    }
  }, [selectedOrderIds.size])

  return (
    <div
      className="flex h-full shrink-0 flex-col rounded-2xl border"
      style={{ width: ORDER_SECTION_WIDTH }}
    >
      <div className="space-y-2 p-4">
        {!isTaker ? (
          <>
            <Button
              variant="ghostSubtle"
              size="sm"
              onClick={() => setIsTaker(true)}
            >
              <ChevronLeft /> Back
            </Button>
            <MakerOrder />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Review Order</h2>
              <Button
                variant="brand"
                rounded="full"
                size="sm"
                onClick={() => setIsTaker(false)}
              >
                New Offer <Plus />
              </Button>
            </div>
            <TakerOrder />
          </>
        )}
      </div>
      <Separator className="p-0" />
      <div className="flex min-h-0 flex-1 flex-col space-y-2 p-4">
        <h2 className="text-sm font-bold">My Open Orders</h2>
        <MyOpenOrder />
      </div>
    </div>
  )
}

export function MyOpenOrder() {
  const {
    myOrders: { openOrders },
    collateralPrices,
  } = useMarket()

  const orders = useMemo(() => {
    return _.chain(openOrders.data)
      .map((order) => {
        const amount = order.collateral.amount.div(order.rate)
        const price = order.rate.multipliedBy(
          collateralPrices.data?.[order.collateral.coinType] || 0
        )
        return {
          ...order,
          amount,
          price,
        }
      })
      .orderBy(["createdAt"], ["desc"])
      .value()
  }, [openOrders.data, collateralPrices.data])

  if (!openOrders.data?.length) {
    return <EmptyState icon={Bookmark} description="No Order Placed" opaque />
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="h-full space-y-2">
        {orders.map((order) => {
          return <OrderCard key={order.id} type="open" order={order} />
        })}
      </div>
    </ScrollArea>
  )
}
