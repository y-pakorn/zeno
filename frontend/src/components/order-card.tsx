import { ComponentProps, memo, useMemo, useState } from "react"
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit"
import BigNumber from "bignumber.js"
import _ from "lodash"
import { Loader2 } from "lucide-react"
import { match } from "ts-pattern"

import { FilledOrder, OpenOrder, SettledOrder } from "@/types/order"
import { dayjs } from "@/lib/dayjs"
import { useCancelOrder } from "@/hooks/use-cancel-order"
import { useClaimOrder } from "@/hooks/use-claim-order"
import { useCloseOrder } from "@/hooks/use-close-order"
import { useSettleOrder } from "@/hooks/use-settle-order"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { useMarket } from "@/components/market-provider"

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
import { Skeleton } from "./ui/skeleton"

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
        <img src={market.icon} className="size-4 shrink-0 rounded-full" />
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
        <div className="text-muted-foreground">
          {order.type === "filled" &&
          market.resolution &&
          new Date() > market.resolution.deliveryBefore
            ? "Seller Defaulted"
            : _.startCase(order.type)}
        </div>
      </div>

      <Separator className="mt-2" />
      <div className="*:odd:text-muted-foreground grid grid-cols-2 gap-1 *:even:flex *:even:items-center *:even:justify-end *:even:gap-2 *:even:text-end *:even:font-semibold">
        {amount && (
          <>
            <div>Amount</div>
            <div>
              {amount.toFormat(4)}{" "}
              <img src={market.icon} className="size-4 shrink-0 rounded-full" />
            </div>
          </>
        )}
        {collateral && (
          <>
            <div>Collateral</div>
            <div>
              {collateral.amount.toFormat(4)}{" "}
              <img
                src={collateral.icon}
                className="size-4 shrink-0 rounded-full"
              />
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
            {(market.resolution
              ? market.resolution.settlementStart < new Date()
              : true) && market.fee.cancel
              ? order.collateral.amount
                  .multipliedBy(market.fee.cancel)
                  .toFormat(4)
              : "-"}
          </div>
          <img
            src={order.collateral.icon}
            className="size-4 shrink-0 rounded-full"
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
  const account = useCurrentAccount()
  const { market } = useMarket()

  const [open, setOpen] = useState(false)

  const { mutateAsync: settleOrder, isPending: isSettling } = useSettleOrder()
  const { mutateAsync: closeOrder, isPending: isClosing } = useCloseOrder()

  const isSeller = useMemo(
    () =>
      (account!.address === order.maker && order.type === "sell") ||
      (account!.address === order.taker && order.type === "buy"),
    [account, order]
  )
  const balance = useTokenBalance({
    coinType: market.resolution?.finalCoinType || "",
    enabled: !!market.resolution?.finalCoinType && isSeller,
  })

  if (!market.resolution)
    return (
      <Button
        variant="active"
        className="w-full"
        rounded="full"
        disabled
        {...props}
      >
        Settle in TBA
      </Button>
    )

  if (new Date() < market.resolution.settlementStart)
    return (
      <Button
        variant="active"
        className="w-full"
        rounded="full"
        disabled
        {...props}
      >
        Settle in {dayjs(market.resolution.settlementStart).fromNow(true)}
      </Button>
    )

  if (isSeller) {
    if (new Date() < market.resolution.deliveryBefore) {
      const finalCoinBalance = new BigNumber(
        balance.data?.totalBalance || 0
      ).shiftedBy(-(market.resolution.exponent || 9))
      const isInsufficientBalance = finalCoinBalance.lt(
        order.collateral.amount.div(order.rate)
      )

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="brand"
              className="w-full"
              rounded="full"
              {...props}
            >
              Settle before{" "}
              {dayjs(market.resolution.deliveryBefore).fromNow(true)}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Are you sure to settle and claim this order?
              </DialogTitle>
              <DialogDescription>
                Settling and claiming the order might have associated fee to
                proceed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1 text-xs font-medium">
              <div className="flex items-center gap-2">
                <div>Your {market.ticker} Balance</div>
                <div className="ml-auto">
                  {balance.isPending ? (
                    <Skeleton className="h-5 w-12" />
                  ) : (
                    finalCoinBalance.toFormat(4)
                  )}
                </div>
                <img
                  src={market.icon}
                  className="size-4 shrink-0 rounded-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <div>Settled {market.ticker} Amount</div>
                <div className="text-error ml-auto">
                  {order.collateral.amount.div(order.rate).toFormat(4)}
                </div>
                <img
                  src={market.icon}
                  className="size-4 shrink-0 rounded-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <div>Returned Collateral</div>
                <div className="text-success ml-auto">
                  {order.collateral.amount.toFormat(4)}
                </div>
                <img
                  src={order.collateral.icon}
                  className="size-4 shrink-0 rounded-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <div>Proceeds</div>
                <div className="text-success ml-auto">
                  {order.collateral.amount.toFormat(4)}
                </div>
                <img
                  src={order.collateral.icon}
                  className="size-4 shrink-0 rounded-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <div>Fee</div>
                <div className="text-error ml-auto">
                  {market.fee.seller
                    ? order.collateral.amount
                        .multipliedBy(market.fee.seller)
                        .toFormat(4)
                    : "-"}
                </div>
                <img
                  src={order.collateral.icon}
                  className="size-4 shrink-0 rounded-full"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                variant="brand"
                disabled={isSettling || isClosing || isInsufficientBalance}
                onClick={async () => {
                  await settleOrder({
                    market,
                    filledOrderId: order.id,
                    collateralCoinType: order.collateral.coinType,
                    finalCoin: {
                      coinType: market.resolution!.finalCoinType!,
                      amount: order.collateral.amount.div(order.rate),
                      exponent: market.resolution!.exponent || 9,
                    },
                  })
                  setOpen(false)
                }}
              >
                {isInsufficientBalance ? (
                  <>Insufficient Balance</>
                ) : isSettling || isClosing ? (
                  <>
                    Settling <Loader2 className="animate-spin" />
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    } else {
      return (
        <Button
          variant="active"
          className="w-full"
          rounded="full"
          {...props}
          disabled
        >
          Past Delivery Date
        </Button>
      )
    }
  }

  if (new Date() > market.resolution.deliveryBefore) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="brand" className="w-full" rounded="full" {...props}>
            Close and Claim
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure to close and claim this order?
            </DialogTitle>
            <DialogDescription>
              Closing and claiming the order might have associated fee to
              proceed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1 text-xs font-medium">
            <div className="flex items-center gap-2">
              <div>Returned Collateral</div>
              <div className="text-success ml-auto">
                {order.collateral.amount.toFormat(4)}
              </div>
              <img
                src={order.collateral.icon}
                className="size-4 shrink-0 rounded-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <div>Penalty</div>
              <div className="text-success ml-auto">
                {order.collateral.amount.toFormat(4)}
              </div>
              <img
                src={order.collateral.icon}
                className="size-4 shrink-0 rounded-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <div>Fee</div>
              <div className="text-error ml-auto">
                {order.collateral.amount
                  .multipliedBy(market.fee.penalty)
                  .toFormat(4)}
              </div>
              <img
                src={order.collateral.icon}
                className="size-4 shrink-0 rounded-full"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="brand"
              disabled={isClosing}
              onClick={async () => {
                await closeOrder({
                  market,
                  filledOrderId: order.id,
                  collateralCoinType: order.collateral.coinType,
                })
                setOpen(false)
              }}
            >
              {isClosing ? (
                <>
                  Closing <Loader2 className="animate-spin" />
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Button
      variant="active"
      className="w-full"
      rounded="full"
      disabled
      {...props}
    >
      Settlement in {dayjs(market.resolution.deliveryBefore).fromNow()}
    </Button>
  )
})

export const SettledOrderButton = memo(function SettledOrderButton({
  order,
  ...props
}: {
  order: SettledOrder
}) {
  const { market } = useMarket()
  const { mutateAsync: claimOrder, isPending: isClaiming } = useClaimOrder()
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full"
          rounded="full"
          {...props}
          disabled={isClaiming}
          onClick={async () => {
            await claimOrder({
              market,
              settledOrderId: order.id,
            })
          }}
        >
          Claim {order.balance.amount.toFormat(4)}{" "}
          <img
            src={order.balance.icon}
            className="size-4 shrink-0 rounded-full"
          />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure to claim this order?</DialogTitle>
          <DialogDescription>
            Claiming the order might have associated fee to proceed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1 text-xs font-medium">
          <div className="flex items-center gap-2">
            <div>Proceeds</div>
            <div className="text-success ml-auto">
              {order.balance.amount.toFormat(4)}
            </div>
            <img
              src={order.balance.icon}
              className="size-4 shrink-0 rounded-full"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="active" disabled={isClaiming}>
            {isClaiming ? (
              <>
                Claiming <Loader2 className="animate-spin" />
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
