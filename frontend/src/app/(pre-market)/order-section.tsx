import { useState } from "react"
import dayjs from "dayjs"
import _ from "lodash"
import { Bookmark, ChevronLeft, Loader2, Plus, Receipt } from "lucide-react"

import { OpenOrder } from "@/types/order"
import { useCancelOrder } from "@/hooks/use-cancel-order"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
    market,
    collateralPrices,
  } = useMarket()

  const [selectedOrder, setSelectedOrder] = useState<OpenOrder | null>(null)

  const { mutateAsync: cancelOrder, isPending: isCancelling } = useCancelOrder()

  if (!openOrders.data?.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 opacity-20">
        <Bookmark className="text-brand size-12" />
        <div className="text-sm font-medium">No Order Placed</div>
      </div>
    )
  }

  return (
    <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
      <ScrollArea className="min-h-0 flex-1">
        <div className="h-full space-y-2">
          {openOrders.data?.map((order) => {
            const amount = order.collateral.amount.div(order.rate)
            const price = order.rate.multipliedBy(
              collateralPrices.data?.[order.collateral.coinType] || 0
            )
            return (
              <div
                key={order.id}
                className="bg-secondary space-y-2 rounded-xl px-4 py-3 text-xs font-medium"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={order.collateral.icon}
                    className="size-4 shrink-0"
                  />
                  <div className="text-sm font-bold">
                    {order.collateral.ticker}
                  </div>
                  <Badge variant={order.type === "buy" ? "success" : "error"}>
                    {_.startCase(order.type)}
                  </Badge>
                  <div className="text-quaternary ml-auto text-xs">
                    {dayjs(order.createdAt).format("HH:mm DD/MM/YY")}
                  </div>
                </div>
                <Separator className="mt-2" />
                <div className="*:odd:text-muted-foreground grid grid-cols-2 gap-1 *:even:flex *:even:items-center *:even:justify-end *:even:gap-2 *:even:text-end *:even:font-semibold">
                  <div>Amount</div>
                  <div>
                    {amount.toFormat(4)}{" "}
                    <img src={market.icon} className="size-4 shrink-0" />
                  </div>
                  <div>Collateral</div>
                  <div>
                    {order.collateral.amount.toFormat(4)}{" "}
                    <img
                      src={order.collateral.icon}
                      className="size-4 shrink-0"
                    />
                  </div>
                  <div>Price</div>
                  <div>${price.toFormat(4)}</div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedOrder(order)}
                >
                  Cancel
                </Button>
              </div>
            )
          })}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure to cancel this order?</DialogTitle>
              <DialogDescription>
                Canceling the order might have associated fee to proceed.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 text-xs font-medium">
              <div>Fee</div>
              <div className="ml-auto">
                {market.fee.cancel
                  ? selectedOrder?.collateral.amount
                      .multipliedBy(market.fee.cancel)
                      .toFormat(4)
                  : "-"}
              </div>
              <img
                src={selectedOrder?.collateral.icon}
                className="size-4 shrink-0"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isCancelling}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                disabled={isCancelling}
                onClick={async () => {
                  await cancelOrder({
                    market,
                    orderId: selectedOrder!.id,
                    coinType: selectedOrder!.collateral.coinType,
                  })
                  setSelectedOrder(null)
                }}
              >
                {isCancelling ? (
                  <>
                    Cancelling <Loader2 className="animate-spin" />
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </div>
      </ScrollArea>
    </Dialog>
  )
}
