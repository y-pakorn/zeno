"use client"

import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit"
import BigNumber from "bignumber.js"
import _ from "lodash"
import { match, P } from "ts-pattern"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMarket } from "@/components/market-provider"
import { useOrder } from "@/components/order-provider"
import { useNetwork } from "@/components/wallet-provider"

import { AmountInput } from "./amount-input"

export function TakerOrder() {
  const { network } = useNetwork()

  const { market } = useMarket()
  const { selectedOrderIds, unselectAllOrders, selected, fillOrder } =
    useOrder()
  const address = useCurrentAccount()
  const balance = useSuiClientQuery(
    "getBalance",
    {
      owner: address?.address || "",
      coinType: selected?.coinType || "",
    },
    {
      enabled: !!address?.address && !!selected?.coinType,
    }
  )

  return (
    <>
      <Tabs
        value={selectedOrderIds.size > 1 ? "sweep" : "select"}
        onValueChange={(v) => {
          if (v === "sweep") return
          unselectAllOrders()
        }}
        className="gap-0"
      >
        <TabsList variant="bottomOutline" className="mr-auto ml-auto">
          <TabsTrigger value="select">Selected Order</TabsTrigger>
          <TabsTrigger value="sweep">
            Sweep Orders
            {selectedOrderIds.size > 1 && (
              <Badge variant="brand" className="rounded-full">
                {selectedOrderIds.size}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <AmountInput
          label={
            selected?.type === "buy" ? (
              <span className="text-error">Selling</span>
            ) : (
              <span className="text-success">Buying</span>
            )
          }
          value={selected?.totalAmount.toFormat(4) || "-"}
          token={market}
          isEstimated={!!selected}
        />
        <AmountInput
          label="Collateral"
          value={selected?.totalCollateralAmount.toString() || "-"}
          token={selected}
          balance={
            balance.isFetching ? (
              <Skeleton className="h-4 w-10" />
            ) : balance.data?.totalBalance && selected?.exponent ? (
              new BigNumber(balance.data.totalBalance)
                .shiftedBy(-selected.exponent)
                .toString()
            ) : undefined
          }
        />
      </Tabs>
      <Button
        size="lg"
        rounded="full"
        className="w-full"
        {...(!address
          ? {
              disabled: true,
              variant: "active",
              children: "Please Connect Wallet",
            }
          : network !== market.network
            ? {
                disabled: true,
                variant: "active",
                children: `Wrong Network, Switch to ${_.startCase(market.network)}`,
              }
            : market.resolution &&
                new Date() > market.resolution.settlementStart
              ? {
                  disabled: true,
                  variant: "active",
                  children: "Market Closed",
                }
              : !selected
                ? {
                    disabled: true,
                    variant: "active",
                    children: "Select Order First",
                  }
                : balance.data?.totalBalance &&
                    selected.exponent &&
                    new BigNumber(balance.data.totalBalance)
                      .shiftedBy(-selected.exponent)
                      .lt(selected.totalCollateralAmount)
                  ? {
                      disabled: true,
                      variant: "destructive",
                      children: "Insufficient Balance",
                    }
                  : {
                      variant: "brand",
                      disabled: fillOrder.isPending,
                      onClick: async () => {
                        await fillOrder.mutateAsync()
                        balance.refetch()
                        unselectAllOrders()
                      },
                      children: selected.type === "buy" ? "Sell" : "Buy",
                    })}
      />
      {selected && (
        <>
          <div className="text-muted-foreground text-sm font-medium">
            You are about to {selected.type === "buy" ? "sell" : "buy"}{" "}
            {selected.totalAmount.toFormat(4)} {market.ticker} by providing{" "}
            {selected.totalCollateralAmount.toString()} {selected.ticker} as
            collateral.
          </div>
          <div className="*:odd:text-muted-foreground grid w-full grid-cols-2 gap-y-1 text-xs font-medium *:even:text-end">
            <div>Avg Token Per Collateral</div>
            <div className="inline-flex items-center justify-end gap-1">
              {selected.averagePrice.toFormat(4)}{" "}
              <img
                src={market.icon}
                alt={market.ticker}
                className="size-4 rounded-full"
              />
            </div>
            <div>Avg Price Per Token ($)</div>
            <div>${selected.averagePriceUsd.toFormat(4)}</div>
            <div>Fee</div>
            <div className="inline-flex items-center justify-end gap-1">
              {selected.type === "sell"
                ? selected.feeBuy.toFormat(4)
                : selected.feeSell.toFormat(4)}{" "}
              <img
                src={selected.type === "sell" ? market.icon : selected.icon}
                alt={selected.type === "sell" ? "buyer" : "seller"}
                className="size-4 rounded-full"
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}
