import { useEffect, useMemo, useState } from "react"
import { useAccounts, useCurrentAccount } from "@mysten/dapp-kit"
import _ from "lodash"
import { ChevronLeft, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

import { MakerOrder } from "./maker-order"
import { useMarket } from "./market-provider"
import { TakerOrder } from "./taker-order"

export const ORDER_SECTION_WIDTH = "330px"

export function OrderSection() {
  const [isTaker, setIsTaker] = useState(true)

  return (
    <div
      className="shrink-0 rounded-2xl border *:space-y-2 *:p-4"
      style={{ width: ORDER_SECTION_WIDTH }}
    >
      <div>
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
      <Separator className="p-0!" />
      <div>
        <h2 className="text-lg font-bold">My Orders</h2>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2 overflow-y-auto">{/* <MyOrder /> */}</div>
        </ScrollArea>
      </div>
    </div>
  )
}

export function MyOrder() {
  const { offers } = useMarket()

  const account = useCurrentAccount()
  const myOrders = useMemo(() => {
    if (!account) return []
    return _.chain(offers)
      .filter((o) => o.by === account.address)
      .value()
  }, [account, offers])

  return (
    <>
      {myOrders.map((o) => (
        <div key={o.id} className="bg-secondary rounded-2xl p-2">
          <div>{o.id}</div>
        </div>
      ))}
    </>
  )
}
