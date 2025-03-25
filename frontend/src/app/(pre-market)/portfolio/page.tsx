"use client"

import { memo, useMemo, useState } from "react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { WalletAccount } from "@mysten/wallet-standard"
import _ from "lodash"
import { ChevronDown } from "lucide-react"
import { match } from "ts-pattern"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/empty-state"
import { Icons } from "@/components/icons"
import { OrderCard, OrderCardProps } from "@/components/order-card"
import { WalletButton } from "@/components/wallet-button"

import { useMarket } from "../market-provider"
import { CollateralDisplay } from "../offer-section"

type Filter = {
  status?: "open" | "filled" | "settled"
  collateral?: string
  fillType?: "full" | "partial"
}

export default function PortfolioPage() {
  const account = useCurrentAccount()

  if (!account) {
    return (
      <EmptyState
        icon={Icons.walletMissing}
        header="Wallet Not Connected"
        description="You need to connect your wallet to view your portfolio"
      >
        <WalletButton className="mt-2" />
      </EmptyState>
    )
  }

  return <Portfolio account={account} />
}

const Portfolio = memo(function Portfolio({}: { account: WalletAccount }) {
  const { myOrders, market } = useMarket()

  const orders = useMemo(() => {
    return _.chain(
      (myOrders.filledOrders.data?.map((order) => ({
        order,
        type: "filled",
      })) || []) as OrderCardProps[]
    )
      .concat(
        myOrders.openOrders.data?.map((order) => ({
          order,
          type: "open",
        })) || []
      )
      .concat(
        myOrders.settledOrders.data?.map((order) => ({
          order,
          type: "settled",
        })) || []
      )
      .orderBy((o) =>
        match(o)
          .with({ type: "open" }, ({ order }) => -order.createdAt)
          .with({ type: "filled" }, ({ order }) => -order.filledAt)
          .with({ type: "settled" }, ({ order }) => -order.settledAt)
          .exhaustive()
      )
      .value()
  }, [
    myOrders.filledOrders.data,
    myOrders.openOrders.data,
    myOrders.settledOrders.data,
  ])

  const [filters, setFilters] = useState<Filter>({
    status: undefined,
    collateral: undefined,
    fillType: undefined,
  })

  const shownOrders = useMemo(() => {
    return _.chain(orders)
      .filter((order) =>
        filters.status ? order.type === filters.status : true
      )
      .filter((order) =>
        filters.collateral && order.type !== "settled"
          ? order.order.collateral.coinType === filters.collateral
          : true
      )
      .value()
  }, [orders, filters])

  return (
    <div className="space-y-2 py-4">
      <h1 className="text-2xl font-bold">Activity</h1>
      <div className="flex items-center gap-4">
        <img
          src={market.icon}
          alt={market.name}
          className="size-6 shrink-0 rounded-full"
        />
        <h2 className="-ml-2 text-xl font-bold">{market.name}</h2>
        <div className="flex-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="lg" rounded="full">
              {_.startCase(filters.status || "All Status")}
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[undefined, "open", "filled", "settled"].map((status) => (
              <DropdownMenuItem
                key={status || "all"}
                onClick={() =>
                  setFilters({ ...filters, status: status as any })
                }
              >
                {_.startCase(status || "All Status")}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="lg" rounded="full">
              <CollateralDisplay
                collateral={market.collaterals.find(
                  (collateral) => collateral?.coinType === filters.collateral
                )}
              />
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[undefined, ...market.collaterals].map((collateral) => (
              <DropdownMenuItem
                key={collateral?.coinType || "all"}
                onClick={() =>
                  setFilters({ ...filters, collateral: collateral?.coinType })
                }
              >
                <CollateralDisplay collateral={collateral} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="lg" rounded="full">
              {filters.fillType || "All Fill Types"}
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[
              {
                label: "All Fill Types",
                value: undefined,
              },
              {
                label: "Partial Fill",
                value: "Partial",
              },
              {
                label: "Full Fill",
                value: "Full",
              },
            ].map((fillType) => (
              <DropdownMenuItem
                key={fillType.label}
                onClick={() =>
                  setFilters({
                    ...filters,
                    fillType: fillType.value as "full" | "partial" | undefined,
                  })
                }
              >
                {fillType.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-4">
        {shownOrders.map((order) => (
          <OrderCard key={order.order.id} {...order} />
        ))}
      </div>
    </div>
  )
})
