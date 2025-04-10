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
        "0xf24164f150d742384b1e4141daabba56139ba7156a47a629e75e1c776470c640::coin",
      cap: "0x29d38e4e17cefe62209c6a3e6a5dc5194ce2cd3a5379bee97f24a700efbce586",
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
