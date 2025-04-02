"use client"

import { useMemo } from "react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { WalletAccount } from "@mysten/wallet-standard"

import { PreMarket } from "@/types/market"
import { markets } from "@/config/market"
import { EmptyState } from "@/components/empty-state"
import { Icons } from "@/components/icons"
import { MarketProvider } from "@/components/market-provider"
import { WalletButton } from "@/components/wallet-button"
import { useNetwork } from "@/components/wallet-provider"

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

function ConnectedPortfolio({}: { account: WalletAccount }) {
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
