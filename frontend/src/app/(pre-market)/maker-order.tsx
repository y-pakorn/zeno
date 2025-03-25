import { useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit"
import BigNumber from "bignumber.js"
import _ from "lodash"
import { ChevronDown, Loader2 } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { useCreateOrder } from "@/hooks/use-create-order"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AmountInput } from "./amount-input"
import { useBook } from "./book-provider"
import { useMarket } from "./market-provider"

export function MakerOrder() {
  const { market, collateralPrices } = useMarket()
  const { offers } = useBook()
  const { mutateAsync: createOrder, isPending: isCreatingOrder } =
    useCreateOrder()

  const formSchema = useMemo(
    () =>
      z
        .object({
          type: z.enum(["buy", "sell"]),
          pricePerToken: z
            .string()
            .min(1, "Price is required")
            .transform((v, ctx) => {
              const pricePerToken = new BigNumber(v)
              if (pricePerToken.lte(0)) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Invalid price",
                })
                return z.NEVER
              }
              return pricePerToken
            }),
          tokenAmount: z
            .string()
            .min(1, "Amount is required")
            .transform((v, ctx) => {
              const tokenAmount = new BigNumber(v)
              if (tokenAmount.lte(0)) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Invalid amount",
                })
                return z.NEVER
              }
              return tokenAmount
            }),
          collateralCoinType: z
            .string()
            .refine((v) => market.collaterals.some((c) => c.coinType === v), {
              message: "Invalid collateral",
            }),
        })
        .refine(
          (data) => {
            // check if the order price is better than the best offer
            if (data.type === "buy") {
              const buyOffers = _.chain(offers)
                .filter((o) => o.type === "sell")
                .value()
              return buyOffers.length > 0
                ? buyOffers.some((o) => o.price.gte(data.pricePerToken))
                : true
            }
            const sellOffers = _.chain(offers)
              .filter((o) => o.type === "buy")
              .value()
            return sellOffers.length > 0
              ? sellOffers.some((o) => o.price.lte(data.pricePerToken))
              : true
          },
          {
            path: ["pricePerToken"],
            message: "Price is worse than the best offer",
          }
        ),
    [market.collaterals, offers]
  )

  const {
    formState: { errors, isValid },
    setValue,
    register,
    setError,
    clearErrors,
    control,
    reset,
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "buy",
      collateralCoinType: market.collaterals[0].coinType,
      pricePerToken: "",
      tokenAmount: "",
    },
  })

  // Watch for values to trigger validation
  const {
    type,
    collateralCoinType,
    pricePerToken: _pricePerToken,
    tokenAmount: _tokenAmount,
  } = useWatch({
    control: control,
  })
  const tokenAmount = useMemo(
    () => (_tokenAmount ? new BigNumber(_tokenAmount as any) : undefined),
    [_tokenAmount]
  )
  const pricePerTokenUsd = useMemo(
    () => (_pricePerToken ? new BigNumber(_pricePerToken as any) : undefined),
    [_pricePerToken]
  )

  const address = useCurrentAccount()
  const balance = useSuiClientQuery(
    "getBalance",
    {
      owner: address?.address || "",
      coinType: collateralCoinType,
    },
    {
      enabled: !!address && !!collateralCoinType,
    }
  )

  const collateral = useMemo(() => {
    return market.collaterals.find((c) => c.coinType === collateralCoinType)
  }, [market.collaterals, collateralCoinType])
  const result = useMemo(() => {
    try {
      if (
        !pricePerTokenUsd ||
        !tokenAmount ||
        !collateralCoinType ||
        !collateralPrices.data?.[collateralCoinType]
      )
        throw new Error("Invalid input")
      const collateralPrice = collateralPrices.data[collateralCoinType]
      const collateralAmount = pricePerTokenUsd
        .multipliedBy(tokenAmount)
        .dividedBy(collateralPrice)
      if (collateralAmount.isNaN()) throw new Error("NaN output")
      if (collateralAmount.lt(collateral!.minimumAmount)) {
        setError("root", {
          message: `Minimum collateral amount is ${collateral!.minimumAmount} ${collateral!.ticker}`,
        })
      } else {
        clearErrors("root")
      }

      return {
        collateralAmount,
        pricePerToken: tokenAmount.dividedBy(collateralAmount),
        feeBuy: tokenAmount.multipliedBy(market.fee.buyer),
        feeSell: collateralAmount.multipliedBy(market.fee.seller),
      }
    } catch (_) {
      return null
    }
  }, [
    pricePerTokenUsd,
    tokenAmount,
    collateralCoinType,
    collateralPrices,
    market.fee,
  ])

  const floorPrice = useMemo(() => {
    const bestOffer = _.chain(offers)
      .filter((o) => o.type === type)
      .sortBy((o) => (o.type === "buy" ? o.price : -o.price))
      .first()
      .value()
    if (!bestOffer) return null
    return bestOffer.price
  }, [type, offers])

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Review Order</h2>
        <Tabs
          value={type}
          onValueChange={(v) => setValue("type", v as "buy" | "sell")}
        >
          <TabsList variant="bottomOutline">
            <TabsTrigger
              value="buy"
              className={cn(
                "data-[state=active]:border-success data-[state=active]:text-success!"
              )}
            >
              Buy
            </TabsTrigger>
            <TabsTrigger
              value="sell"
              className={cn(
                "data-[state=active]:border-error data-[state=active]:text-error!"
              )}
            >
              Sell
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <AmountInput
        label="Price Per Token"
        prefix="$"
        placeholder="Enter your price"
        inputProps={register("pricePerToken")}
        suffix={
          <Button
            variant="outline"
            size="xs"
            disabled={!floorPrice}
            onClick={() => {
              if (!floorPrice) return
              setValue("pricePerToken", floorPrice.precision(4))
            }}
            className="rounded-none border-x-0 border-t-0"
          >
            Floor
          </Button>
        }
      />
      <div>
        <AmountInput
          label={<span className="text-brand">Token Amount</span>}
          placeholder="Enter token amount"
          inputProps={register("tokenAmount")}
          token={market}
        />
        <AmountInput
          label="Collateral"
          value={result?.collateralAmount.toFormat(9)}
          balance={
            balance.isFetching ? (
              <Skeleton className="h-4 w-10" />
            ) : balance.data?.totalBalance && collateral?.exponent ? (
              new BigNumber(balance.data.totalBalance)
                .shiftedBy(-collateral.exponent)
                .toString()
            ) : undefined
          }
          suffix={
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    <img
                      src={
                        market.collaterals.find(
                          (c) => c.coinType === collateralCoinType
                        )?.icon
                      }
                      className="size-5 shrink-0"
                    />
                    <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {market.collaterals.map((c) => (
                    <DropdownMenuItem
                      key={c.coinType}
                      onSelect={() => {
                        setValue("collateralCoinType", c.coinType)
                      }}
                    >
                      <img src={c.icon} className="size-4 shrink-0" />
                      <span>{c.ticker}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          }
        />
      </div>
      <Button
        size="lg"
        rounded="full"
        className="w-full"
        {...(_.size(errors) > 0
          ? {
              disabled: true,
              variant: "destructive",
              children: _.chain(errors).values().last().value().message,
            }
          : result &&
              collateral &&
              new BigNumber(balance?.data?.totalBalance || "0")
                .shiftedBy(-collateral.exponent)
                .lt(result.collateralAmount)
            ? {
                disabled: true,
                variant: "destructive",
                children: "Insufficient Balance",
              }
            : !address
              ? {
                  disabled: true,
                  variant: "active",
                  children: "Please Connect Wallet",
                }
              : {
                  disabled: !isValid || isCreatingOrder,
                  variant: "brand",
                  onClick: async () => {
                    await createOrder({
                      market,
                      type: type as "buy" | "sell",
                      rate: result!.pricePerToken!.pow(-1),
                      collateral: {
                        amount: result!.collateralAmount,
                        coinType: collateralCoinType!,
                        exponent: collateral!.exponent,
                      },
                    })
                    balance.refetch()
                    reset()
                  },
                  children: isCreatingOrder ? (
                    <>
                      Creating...
                      <Loader2 className="size-4 animate-spin" />
                    </>
                  ) : (
                    `Create ${_.startCase(type)} Offer`
                  ),
                })}
      />
      {result && tokenAmount && collateral && pricePerTokenUsd && (
        <>
          <div className="text-muted-foreground text-sm font-medium">
            You are about to place a order to {type} {tokenAmount.toString()}{" "}
            {market.ticker} by providing {result.collateralAmount.toFormat(4)}{" "}
            {collateral.ticker} as collateral.
          </div>
          <div className="*:odd:text-muted-foreground grid w-full grid-cols-2 gap-y-1 text-xs font-medium *:even:text-end">
            <div>Price Per Token</div>
            <div className="inline-flex items-center justify-end gap-1">
              {result.pricePerToken.toFormat(4)}{" "}
              <img
                src={market.icon}
                alt={market.ticker}
                className="size-4 rounded-full"
              />
            </div>
            <div>Price Per Token ($)</div>
            <div>${pricePerTokenUsd.toFormat(4)}</div>
            <div>Fee</div>
            <div className="inline-flex items-center justify-end gap-1">
              {type === "buy"
                ? result.feeBuy.toFormat(4)
                : result.feeSell.toFormat(4)}{" "}
              <img
                src={type === "buy" ? market.icon : market.icon}
                alt={type === "buy" ? "buyer" : "seller"}
                className="size-4 rounded-full"
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}
