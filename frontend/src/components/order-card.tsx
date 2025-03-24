import { ComponentProps, memo, useMemo, useState } from "react"
import dayjs from "dayjs"
import _ from "lodash"
import { Loader2 } from "lucide-react"
import { match, P } from "ts-pattern"

import { FilledOrder, OpenOrder, SettledOrder } from "@/types/order"
import { useCancelOrder } from "@/hooks/use-cancel-order"
import { useMarket } from "@/app/(pre-market)/market-provider"

import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Separator } from "./ui/separator"

export type OrderCardProps =
  | {
      type: "open"
      order: OpenOrder
    }
  | {
      type: "filled"
      order: FilledOrder
    }
  | {
      type: "settled"
      order: SettledOrder
    }

export const OrderCard = memo(function OrderCard(order: OrderCardProps) {
  const { market, collateralPrices } = useMarket()

  const { amount, collateral, price } = useMemo(() => {
    return match(order)
      .with({ type: "open" }, ({ order }) => {
        return {
          amount: order.collateral.amount.div(order.rate),
          collateral: order.collateral,
          price: order.rate.multipliedBy(
            collateralPrices.data?.[order.collateral.coinType] || 0
          ),
        }
      })
      .with({ type: "filled" }, ({ order }) => ({
        amount: order.collateral.amount.div(order.rate),
        collateral: order.collateral,
        price: order.rate.multipliedBy(
          collateralPrices.data?.[order.collateral.coinType] || 0
        ),
      }))
      .with({ type: "settled" }, ({ order }) => ({
        amount: order.balance.amount,
        collateral: undefined,
        price: undefined,
      }))
      .exhaustive()
  }, [order, collateralPrices.data])

  return (
    <div className="bg-secondary space-y-2 rounded-xl px-4 py-3 text-xs font-medium">
      <div className="flex items-center gap-2">
        <img src={market.icon} className="size-4 shrink-0" />
        <div className="text-sm font-bold">{market.ticker}</div>
        <Badge
          {...(match(order)
            .with(
              {
                type: "open",
              },
              ({ order }) => ({
                variant: order.type === "buy" ? "success" : "error",
                children: _.startCase(order.type),
              })
            )
            .with(
              {
                type: "filled",
              },
              ({ order }) => ({
                variant: order.type === "buy" ? "error" : "success",
                children: _.startCase(order.type === "buy" ? "sell" : "buy"),
              })
            )
            .otherwise(() => ({
              variant: "success",
              children: "Buy",
            })) as ComponentProps<typeof Badge>)}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="text-quaternary text-xs">
          {dayjs(
            match(order)
              .with(
                {
                  type: "open",
                },
                ({ order }) => order.createdAt
              )
              .with(
                {
                  type: "filled",
                },
                ({ order }) => order.filledAt
              )
              .with(
                {
                  type: "settled",
                },
                ({ order }) => order.settledAt
              )
              .exhaustive()
          ).format("HH:mm DD/MM/YY")}
        </div>
        <div className="text-muted-foreground">{_.startCase(order.type)}</div>
      </div>

      <Separator className="mt-2" />
      <div className="*:odd:text-muted-foreground grid grid-cols-2 gap-1 *:even:flex *:even:items-center *:even:justify-end *:even:gap-2 *:even:text-end *:even:font-semibold">
        {amount && (
          <>
            <div>Amount</div>
            <div>
              {amount.toFormat(4)}{" "}
              <img src={market.icon} className="size-4 shrink-0" />
            </div>
          </>
        )}
        {collateral && (
          <>
            <div>Collateral</div>
            <div>
              {collateral.amount.toFormat(4)}{" "}
              <img src={collateral.icon} className="size-4 shrink-0" />
            </div>
          </>
        )}
        {price && (
          <>
            <div>Price</div>
            <div>${price.toFormat(4)}</div>
          </>
        )}
      </div>
      {match(order)
        .with({ type: "open" }, ({ order }) => (
          <OpenOrderButton order={order} />
        ))
        .with({ type: "filled" }, ({ order }) => (
          <FilledOrderButton order={order} />
        ))
        .with({ type: "settled" }, ({ order }) => (
          <SettledOrderButton order={order} />
        ))
        .exhaustive()}
    </div>
  )
})

export const OpenOrderButton = memo(function OpenOrderButton({
  order,
  ...props
}: {
  order: OpenOrder
} & ComponentProps<typeof Button>) {
  const { market } = useMarket()
  const { mutateAsync: cancelOrder, isPending: isCancelling } = useCancelOrder()

  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" rounded="full" {...props}>
          Cancel
        </Button>
      </DialogTrigger>
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
              ? order.collateral.amount
                  .multipliedBy(market.fee.cancel)
                  .toFormat(4)
              : "-"}
          </div>
          <img src={order.collateral.icon} className="size-4 shrink-0" />
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
                orderId: order.id,
                coinType: order.collateral.coinType,
              })
              setOpen(false)
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
    </Dialog>
  )
})

export const FilledOrderButton = memo(function FilledOrderButton({
  order,
  ...props
}: {
  order: FilledOrder
} & ComponentProps<typeof Button>) {
  return (
    <Button variant="outline" className="w-full" rounded="full" {...props}>
      View
    </Button>
  )
})

export const SettledOrderButton = memo(function SettledOrderButton({
  order,
  ...props
}: {
  order: SettledOrder
}) {
  return (
    <Button variant="outline" className="w-full" rounded="full" {...props}>
      Claim
    </Button>
  )
})
