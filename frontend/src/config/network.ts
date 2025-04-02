import { getFullnodeUrl } from "@mysten/sui/client"

export const defaultNetwork = "devnet"

// Config options for the networks you want to connect to
export const networkConfig = {
  // mainnet: {
  //   name: "mainnet",
  //   url: getFullnodeUrl("mainnet"),
  //   graphql: "https://sui-mainnet.mystenlabs.com/graphql",
  //   explorerUrl: "https://suiscan.xyz",
  // },
  devnet: {
    name: "devnet",
    url: getFullnodeUrl("devnet"),
    graphql: "https://sui-devnet.mystenlabs.com/graphql",
    explorerUrl: "https://suiscan.xyz/devnet",
    faucet: "https://faucet.devnet.sui.io",
  },
} as const

export type Network = keyof typeof networkConfig
export type NetworkConfig = (typeof networkConfig)[Network]
export const networks = Object.keys(networkConfig) as Network[]
