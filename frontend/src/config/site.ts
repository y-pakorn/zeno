import { env } from "@/env.mjs"

export const siteConfig = {
  name: "Zeno",
  author: "Zeno",
  description:
    "Zeno is a decentralized OTC trading platform that makes it easy and secure to trade pre-launch assets directly on the blockchain. Smart contracts manage the process to eliminate trust issues. The result is a transparent, smooth, and safe way to trade peer-to-peer. ",
  keywords: ["Zeno", "Marketplace", "NFTs", "Crypto", "Pre-market", "Token"],
  logo: "/assets/logo.svg",
  logoText: "/assets/logo-text.svg",
  url: {
    base: env.NEXT_PUBLIC_APP_URL,
    author: "@zeno_market",
  },
  links: {
    twitter: "https://x.com/zeno_market",
    docs: "https://zeno-10.gitbook.io/zeno-1",
  },
  ogImage: `https://i.imgur.com/Fpq9AxV.png`,
  twitter: "@zeno_market",
}
