import { Market } from "@/types/market"

export const markets: Market[] = [
  // {
  //   network: "mainnet",
  //   id: "mainnet",
  //   packageId:
  //     // "0xdfc9db75d42dfb4980016d1c623a5f325881d647d96fb9ce962830aaf41a6dbf",
  //     "",
  //   marketId:
  //     // "0x00a44a9bf8ed5196f47c462cfe3edd03d6b55646c29101da9507328225ac3ae8",
  //     "",
  //   name: "Walrus",
  //   ticker: "WAL",
  //   icon: "https://cdn.prod.website-files.com/66a8b39f3ac043de2548ab05/67a0d056287d0398a93668ee_logo_icon_w%20(1).svg",
  //   banner: "https://i.imgur.com/RMyEnky.png",
  //   isLive: true,
  //   totalSupply: 5_000_000_000, // 5 billion
  //   links: {
  //     twitter: "https://x.com/walrusprotocol",
  //     discord: "http://discord.gg/walrusprotocol",
  //     website: "https://walrus.xyz",
  //   },
  //   collaterals: [
  //     {
  //       coinType: "0x2::sui::SUI",
  //       ticker: "SUI",
  //       icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png",
  //       minimumAmount: 5, // 5 sui
  //       pythId:
  //         "0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744",
  //       exponent: 9,
  //     },
  //     {
  //       coinType:
  //         "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
  //       ticker: "USDC",
  //       icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  //       minimumAmount: 10, // 10 usdc
  //       pythId:
  //         "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
  //       exponent: 9,
  //     },
  //   ],
  //   fee: {
  //     buyer: 0.015, // 1.5%
  //     seller: 0.015, // 1.5%
  //     cancel: 0.005, // 0.5%
  //     penalty: 0.015, // 1.5%
  //   },
  // },
  {
    id: "momentum-devnet",
    status: "upcoming",
    icon: "https://strapi-dev.scand.app/uploads/Momentum_logo_2f4bd6f8e9.jpg",
    name: "Momentum",
    ticker: "MMT",
    network: "devnet",
    links: {
      twitter: "https://x.com/MMTFinance",
    },
  },
  {
    id: "7k-devnet",
    status: "upcoming",
    icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFcAAABgCAMAAABfaR5LAAAAAXNSR0IArs4c6QAAACdQTFRFR3BM////////////////////////////////////////////////DaKZigAAAAx0Uk5TABAlQFp7m6+/z9/vYCk7bgAAAhhJREFUeNrVllGO6jAQBHvs2Intuf953w/SW9xZWnjHK7Y+UShCBbnBMlZGNwhWrO5+bLG65y1WH9HWB1e09UFBEKkO/0KKsvoTPUg7/JkTIRw+cSCE0yeC8g7fk9cnKkIom/Jev5S3IYT81/MaIjCfuD47b/WJvCkvPjMvn5E8QVbqTAKAlF+RVF5rTlx0UBHDALT5RdKyt/prMvijz9fanuhemNsJEto5g/hKdEam5kxL/KiZAqB/M0GpO9MMWMxblZbuhRi3eZVW5z1vF15oF/M2rcUpvOk+7732NJ7De/rtBJGWz+S2kNe0Ful4pvKTH9Rca5k+581ODKllOufVaG2iq68ILQ7K664pUJwqr9bqvI3yCm1o3gJNmfNagJbyGpBDtBg0QSHaTHmbXr+382bAYjJcc97DFWUxb4Q40xuaR4iL/gPVV8SXXvi0InaZ12BNizmvXvgFcdELDyFezJuxIDa98MCCONME9e9OAzvfEFeZt4Av1uJLLnyGEOu8FZx3AAviQ/6BOrEirnLhD6yIm8ybMFG0GCYXvgMsZqrKK94gxMt5tZjzNpFXNX4nbwO0mC/t062ZzvugtD7xVCz/x6DyrsMThBAanZEBqLzr8ARtyouPzssTtClv2pO3I4Y+1U078o4CbMjbE0KYFr4agPC8PYMIyHsaAin0wELztoRYBp2MIWR6YDEc9OuKwfr46Uj+A/+tmr+xsprpAAAAAElFTkSuQmCC",
    name: "7K",
    ticker: "7K",
    network: "devnet",
    links: {
      twitter: "https://x.com/7k_ag_",
      website: "https://7k.ag/",
    },
  },
  {
    id: "magma-devnet",
    status: "upcoming",
    icon: "https://strapi-dev.scand.app/uploads/Magma_Finance_logo_7cd45acadb.jpg",
    name: "Magma Finance",
    ticker: "MAGMA",
    network: "devnet",
    links: {
      twitter: "https://x.com/Magma_Finance",
      website: "https://magmafinance.io/",
    },
  },
  {
    id: "haedal-devnet",
    featured: true,
    totalSupply: 1_000_000_000, // 1 billion
    packageId:
      "0xa1612ce0e2e94a8bbe40d3feeead4d6299a17472d112fe693cb89e203e0064de",
    adminCap:
      "0xb440686fff3fbf717f80979e02ee87774ffb570c334ca5466f697133d3896690",
    marketId:
      "0xd74e6b03c7178faca0855a9c90f6e393c04808f649b7550c83f14dfa7f1aa78f",
    upgradeCap:
      "0xb755fbfbe2742b49dddbd09da10a65b7d57704ac499026e1fc12290875f7d095",
    network: "devnet",
    name: "Haedal",
    ticker: "HAE",
    icon: "https://img.cryptorank.io/coins/haedal1705486502241.png",
    status: "live",
    links: {
      website: "https://haedal.xyz/",
      discord: "https://discord.gg/haedalprotocol",
      twitter: "https://x.com/HaedalProtocol",
    },
    collaterals: [
      {
        coinType: "0x2::sui::SUI",
        ticker: "SUI",
        icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png",
        minimumAmount: 1, // 5 sui
        pythId:
          "0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744",
        exponent: 9,
      },
    ],
    fee: {
      buyer: 0.015, // 1.5%
      seller: 0.015, // 1.5%
      cancel: 0.005, // 0.5%
      penalty: 0.015, // 1.5%
    },
  },
  {
    id: "ika-devnet",
    featured: true,
    network: "devnet",
    name: "Ika",
    ticker: "IKA",
    icon: "https://public.rootdata.com/images/b6/1730353656504.png",
    status: "live",
    links: {
      website: "https://ika.xyz/",
      discord: "https://discord.com/invite/ikadotxyz",
      twitter: "https://x.com/ikadotxyz",
    },
    totalSupply: 1_000_000_000, // 1 billion
    marketId:
      "0x45d755df4e1a908a89386b3885de0b3fe9952bb3d857a5f40b3cecbe795a35e8",
    packageId:
      "0x527b646c46055c8749af810b38d813f1fdc6d5378eb3e1b732f094e325af0ef3",
    adminCap:
      "0xbbae3fbd8af937ea2d8eb14bb07e5d9a3af77858b9f2ee2ac9f554f0a5445b06",
    upgradeCap:
      "0x4e1ae5cafc7afb8d30b826a58e13436110e2363655b83ba0b84416f5d4e41c85",
    collaterals: [
      {
        coinType: "0x2::sui::SUI",
        ticker: "SUI",
        icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png",
        minimumAmount: 1, // 5 sui
        pythId:
          "0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744",
        exponent: 9,
      },
    ],
    fee: {
      buyer: 0.015, // 1.5%
      seller: 0.015, // 1.5%
      cancel: 0.005, // 0.5%
      penalty: 0.015, // 1.5%
    },
  },
]
