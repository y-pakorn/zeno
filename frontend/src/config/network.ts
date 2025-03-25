import { getFullnodeUrl } from "@mysten/sui/client"

export const defaultNetwork = "mainnet"

// Config options for the networks you want to connect to
export const networkConfig = {
  mainnet: {
    name: "mainnet",
    url: getFullnodeUrl("mainnet"),
    explorerUrl: "https://suiscan.xyz",
  },
  devnet: {
    name: "devnet",
    url: getFullnodeUrl("devnet"),
    explorerUrl: "https://suiscan.xyz/devnet",
  },
} as const

export type Network = keyof typeof networkConfig
export type NetworkConfig = (typeof networkConfig)[Network]
export const networks = Object.keys(networkConfig) as Network[]
