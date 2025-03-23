import { PreMarket } from "@/types/market"
import { Network } from "@/components/wallet-provider"

export const preMarkets: { [key in Network]: PreMarket } = {
  mainnet: {
    id: "mainnet",
    marketId: "",
    packageId:
      "0x3f8ebc08a80d8582382bc5dacd9c572b69ea6962bca4720c8cff808543388cf9",
    name: "Walrus",
    ticker: "WAL",
    icon: "https://img.cryptorank.io/coins/walrus1727864479768.png",
    banner: "https://i.imgur.com/RMyEnky.png",
    isLive: true,
    totalSupply: 5_000_000_000, // 5 billion
    links: {
      twitter: "https://x.com/walrusprotocol",
      discord: "http://discord.gg/walrusprotocol",
      website: "https://walrus.xyz",
    },
    collaterals: [
      {
        coinType: "0x2::sui::SUI",
        ticker: "SUI",
        icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png",
        minimumAmount: 5, // 5 sui
        pythId:
          "0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744",
        exponent: 9,
      },
      {
        coinType:
          "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
        ticker: "USDC",
        icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
        minimumAmount: 10, // 10 usdc
        pythId:
          "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
        exponent: 9,
      },
    ],
    fee: {
      buyer: 0.02, // 2%
      seller: 0.02, // 2%
      cancel: 0, // 0%
      penalty: 0.02, // 2%
    },
  },
  devnet: {
    id: "devnet",
    packageId:
      "0xa2ac3ad631f63c99a21f7f818648d67e864e74c7abe9ea5a04b2240950fb816d",
    marketId:
      "0x6092b7e6440378b9c3717a446ea91efa27d4729bb88ab21fce245bced31fc005",
    name: "Walrus",
    ticker: "WAL",
    icon: "https://img.cryptorank.io/coins/walrus1727864479768.png",
    banner: "https://i.imgur.com/RMyEnky.png",
    isLive: true,
    totalSupply: 5_000_000_000, // 5 billion
    links: {
      twitter: "https://x.com/walrusprotocol",
      discord: "http://discord.gg/walrusprotocol",
      website: "https://walrus.xyz",
    },
    collaterals: [
      {
        coinType: "0x2::sui::SUI",
        ticker: "SUI",
        icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png",
        minimumAmount: 5, // 5 sui
        pythId:
          "0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744",
        exponent: 9,
      },
      {
        coinType:
          "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC",
        ticker: "USDC",
        icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
        minimumAmount: 10, // 10 usdc
        pythId:
          "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
        exponent: 9,
      },
    ],
    fee: {
      buyer: 0.02, // 2%
      seller: 0.02, // 2%
      cancel: 0, // 0%
      penalty: 0.02, // 2%
    },
  },
}
