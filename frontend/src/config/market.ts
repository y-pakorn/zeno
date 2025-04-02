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
    id: "haedal-devnet",
    network: "devnet",
    name: "Haedal",
    ticker: "HAE",
    icon: "https://img.cryptorank.io/coins/haedal1705486502241.png",
    status: "upcoming",
    links: {
      website: "https://haedal.xyz/",
      discord: "https://discord.gg/haedalprotocol",
      twitter: "https://x.com/HaedalProtocol",
    },
  },
  {
    id: "ika-devnet",
    network: "devnet",
    name: "Ika",
    ticker: "IKA",
    icon: "https://public.rootdata.com/images/b6/1730353656504.png",
    status: "upcoming",
    links: {
      website: "https://ika.xyz/",
      discord: "https://discord.com/invite/ikadotxyz",
      twitter: "https://x.com/ikadotxyz",
    },
  },
  {
    id: "walrus-devnet",
    network: "devnet",
    packageId:
      "0x1307b9af92bba561acb73780d9b4efa80255c7ba7f1d60c8373261e84afd7e3e",
    marketId:
      "0x0f21634b863903e29c66a1aeefd42dfb747e46f6805699d3cfa69db538f05d96",
    name: "Walrus",
    ticker: "WAL",
    icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/36119.png",
    status: "live",
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
      // {
      //   coinType:
      //     "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC",
      //   ticker: "USDC",
      //   icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
      //   minimumAmount: 10, // 10 usdc
      //   pythId:
      //     "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
      //   exponent: 9,
      // },
    ],
    // resolution: {
    //   finalCoinType: "0x2::sui::SUI",
    //   exponent: 9,
    //   settlementStart: new Date(1742917296575),
    //   deliveryBefore: new Date(1742917896575),
    // },
    fee: {
      buyer: 0.02, // 2%
      seller: 0.02, // 2%
      cancel: 0, // 0%
      penalty: 0.02, // 2%
    },
  },
]
