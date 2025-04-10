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
    network: "testnet",
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
    network: "testnet",
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
    network: "testnet",
    links: {
      twitter: "https://x.com/Magma_Finance",
      website: "https://magmafinance.io/",
    },
  },
  {
    id: "haedal-testnet",
    featured: true,
    totalSupply: 1_000_000_000, // 1 billion
    packageId:
      "0x5571cd3150cc11b365bc53fd90ec4be90f5149eb263447f2b60537cbc75a0ccf",
    adminCap:
      "0x46fabcddfdf96bd0f486bc0eadf5ecad93be2c42161617f449c6d583cbc51804",
    marketId:
      "0xf3b6045d29cb70275bf346ee24ab2494fe49eea4754b3e3c36573e1b491bf7ea",
    upgradeCap:
      "0xb41384c3eacdc9ada2afaa741b2c1519a7a0e99628ea85e5a40b6c7482deae3c",
    network: "testnet",
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
        minimumAmount: 1, // 1 sui
        pythId:
          "0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744",
        exponent: 9,
      },
      {
        coinType:
          "0xf24164f150d742384b1e4141daabba56139ba7156a47a629e75e1c776470c640::coin::COIN",
        ticker: "USDC",
        icon: "https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/vectors/usdc-fpxuadmgafrjjy85bgie5.png/usdc-kksfxcrdl3f9pjx0v6jxxp.png?_a=DAJFJtWIZAAC",
        minimumAmount: 10, // 10 usdc
        pythId:
          "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
        exponent: 6, // testnet usdc has 6 decimals
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
    id: "ika-testnet",
    featured: true,
    network: "testnet",
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
      "0xb03ea3893adabf9124b0df57bb0fc2b4633d384ef436ea42a2906d87ac0e7c5f",
    packageId:
      "0x18c6b054c60a909e01f37aeeb2c414924594f09ffb4c948fe57b70902fcaaa91",
    adminCap:
      "0x1c7eec519b10f54f3fa8297f8049dc20f0122cfa8a5b47ef129f75ab21a807ca",
    upgradeCap:
      "0xb0cf8d324928ccbb8e14bef98fb97a63274fc4e670c82431b57485ac77038526",
    collaterals: [
      {
        coinType: "0x2::sui::SUI",
        ticker: "SUI",
        icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png",
        minimumAmount: 1, // 1 sui
        pythId:
          "0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744",
        exponent: 9,
      },
      {
        coinType:
          "0xf24164f150d742384b1e4141daabba56139ba7156a47a629e75e1c776470c640::coin::COIN",
        ticker: "USDC",
        icon: "https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/vectors/usdc-fpxuadmgafrjjy85bgie5.png/usdc-kksfxcrdl3f9pjx0v6jxxp.png?_a=DAJFJtWIZAAC",
        minimumAmount: 10, // 10 usdc
        pythId:
          "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
        exponent: 6, // testnet usdc has 6 decimals
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
