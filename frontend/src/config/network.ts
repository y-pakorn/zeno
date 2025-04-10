import { getFullnodeUrl } from "@mysten/sui/client"

export const defaultNetwork = "testnet"

// Config options for the networks you want to connect to
export const networkConfig = {
  // mainnet: {
  //   name: "mainnet",
  //   url: getFullnodeUrl("mainnet"),
  //   graphql: "https://sui-mainnet.mystenlabs.com/graphql",
  //   explorerUrl: "https://suiscan.xyz",
  // },
  testnet: {
    name: "testnet",
    url: getFullnodeUrl("testnet"),
    graphql: "https://sui-testnet.mystenlabs.com/graphql",
    explorerUrl: "https://suiscan.xyz/testnet",
    // faucet: "https://faucet.testnet.sui.io",
    faucetToken: {
      ticker: "USDC",
      module:
        "0x505415ff7eb44e4ce5c508d30d7029ecfefbc308cefdb24587f9aa0c805e26a2::coin",
      cap: "0x1b50166d39cf291f042bd0603067f8b9d2c40c788467240e205f92090d2b7900",
      exponent: 6,
    },
  },
  // devnet: {
  //   name: "devnet",
  //   url: getFullnodeUrl("devnet"),
  //   graphql: "https://sui-devnet.mystenlabs.com/graphql",
  //   explorerUrl: "https://suiscan.xyz/devnet",
  //   faucet: "https://faucet.devnet.sui.io",
  // },
} as const

export type Network = keyof typeof networkConfig
export type NetworkConfig = (typeof networkConfig)[Network]
export const networks = Object.keys(networkConfig) as Network[]
