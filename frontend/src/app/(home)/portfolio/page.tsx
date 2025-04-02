"use client"

import { memo, useMemo, useState } from "react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { WalletAccount } from "@mysten/wallet-standard"
import _ from "lodash"
import { ChevronDown } from "lucide-react"
import { match } from "ts-pattern"

import { PreMarket } from "@/types/market"
import { markets } from "@/config/market"
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
import { useNetwork } from "@/components/wallet-provider"

import { MarketProvider, useMarket } from "../../../components/market-provider"
import { CollateralDisplay } from "../markets/[id]/offer-section"
import { OrdersSection } from "./orders-section"

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

  return <ConnectedPortfolio account={account} />
}

export function ConnectedPortfolio({ account }: { account: WalletAccount }) {
  const { network } = useNetwork()
  const availableMarkets = useMemo(
    () =>
      markets.filter(
        (market) => market.network === network && market.status === "live"
      ) as PreMarket[],
    [network]
  )

  return (
    <div className="space-y-2 py-4">
      <h1 className="text-2xl font-bold">Activity</h1>
      {availableMarkets.map((market) => (
        <MarketProvider key={market.id} market={market}>
          <OrdersSection />
        </MarketProvider>
      ))}
    </div>
  )
}
