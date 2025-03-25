"use client"

import { createContext, useContext, useMemo, useState } from "react"
import {
  WalletProvider as DappKitWalletProvider,
  SuiClientProvider,
} from "@mysten/dapp-kit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import "@mysten/dapp-kit/dist/index.css"

import {
  defaultNetwork,
  Network,
  NetworkConfig,
  networkConfig,
} from "@/config/network"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      experimental_prefetchInRender: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
    },
  },
})

const NetworkContext = createContext<{
  network: Network
  networkConfig: NetworkConfig
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
