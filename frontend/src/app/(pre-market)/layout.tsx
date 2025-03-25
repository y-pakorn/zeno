"use client"

import { headers } from "next/headers"

import { useIsMobile } from "@/hooks/use-mobile"
import { EmptyState } from "@/components/empty-state"
import { Icons } from "@/components/icons"

import { MarketProvider } from "./market-provider"

export default function PreMarketLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <EmptyState
        icon={Icons.logo}
        header="Mobile Not Supported"
        description="Please use a desktop browser to access this page."
      />
    )
  }

  return <MarketProvider>{children}</MarketProvider>
}
