"use client"

import {
  createNetworkConfig,
  WalletProvider as DappKitWalletProvider,
  SuiClientProvider,
} from "@mysten/dapp-kit"
import { getFullnodeUrl } from "@mysten/sui/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import "@mysten/dapp-kit/dist/index.css"

// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl("mainnet") },
  testnet: { url: getFullnodeUrl("testnet") },
})
const queryClient = new QueryClient()

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <DappKitWalletProvider autoConnect>{children}</DappKitWalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}
