import { env } from "@/env.mjs"

export const siteConfig = {
  name: "Zeno",
  author: "Zeno",
  description: "Zeno Market",
  keywords: ["Zeno", "Marketplace", "NFTs", "Crypto", "Pre-market", "Token"],
  logo: "/assets/logo.svg",
  logoText: "/assets/logo-text.svg",
  url: {
    base: env.NEXT_PUBLIC_APP_URL,
    author: "",
  },
  links: {
    github: "",
  },
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.jpg`,
  twitter: "@zeno_market",
}
