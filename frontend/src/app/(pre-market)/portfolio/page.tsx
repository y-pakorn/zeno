"use client"

import { memo, useMemo } from "react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { WalletAccount } from "@mysten/wallet-standard"
import _ from "lodash"
import { Wallet } from "lucide-react"
import { match } from "ts-pattern"

import { EmptyState } from "@/components/empty-state"
import { OrderCard, OrderCardProps } from "@/components/order-card"

import { useMarket } from "../market-provider"

export default function PortfolioPage() {
  const account = useCurrentAccount()

  if (!account) {
    return <EmptyState icon={Wallet} header="Please connect your wallet" />
  }

  return <Portfolio account={account} />
}

const Portfolio = memo(function Portfolio({
  account,
}: {
  account: WalletAccount
}) {
  const { myOrders } = useMarket()
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

  return (
    <div className="space-y-2 py-4">
      <h1 className="text-2xl font-bold">Activity</h1>
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-4">
        {orders.map((order) => (
          <OrderCard key={order.order.id} {...order} />
        ))}
      </div>
    </div>
  )
})
