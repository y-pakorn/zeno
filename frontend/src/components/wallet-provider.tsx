"use client"

import { createContext, useContext, useMemo, useState } from "react"
import {
  createNetworkConfig,
  WalletProvider as DappKitWalletProvider,
  SuiClientProvider,
} from "@mysten/dapp-kit"
import { getFullnodeUrl } from "@mysten/sui/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import "@mysten/dapp-kit/dist/index.css"

const defaultNetwork = "devnet"

// Config options for the networks you want to connect to
export const { networkConfig } = createNetworkConfig({
  mainnet: {
    url: getFullnodeUrl("mainnet"),
    explorerUrl: "https://suiscan.xyz",
  },
  devnet: {
    url: getFullnodeUrl("devnet"),
    explorerUrl: "https://suiscan.xyz/devnet",
  },
})

export type Network = keyof typeof networkConfig
export const networks = Object.keys(networkConfig) as Network[]

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
    },
  },
})

const NetworkContext = createContext<{
  network: Network
  networkConfig: (typeof networkConfig)[keyof typeof networkConfig]
  setNetwork: (network: Network) => void
}>({
  network: defaultNetwork,
  networkConfig: networkConfig[defaultNetwork],
  setNetwork: () => {},
})

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [network, setNetwork] = useState<Network>(defaultNetwork)
  const config = useMemo(() => networkConfig[network], [network])

  return (
    <NetworkContext.Provider
      value={{ network, setNetwork, networkConfig: config }}
    >
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} network={network}>
          <DappKitWalletProvider
            autoConnect
            stashedWallet={{
              name: "Zeno Marketplace",
            }}
          >
            {children}
          </DappKitWalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </NetworkContext.Provider>
  )
}

export function useNetwork() {
  const data = useContext(NetworkContext)
  return data
}
