"use client"

import { MarketProvider } from "./market-provider"

export default function PreMarketLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MarketProvider>{children}</MarketProvider>
}
