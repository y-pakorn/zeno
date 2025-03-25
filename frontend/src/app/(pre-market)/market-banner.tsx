import { NAVBAR_HEIGHT } from "@/components/app-navbar"

import { useMarket } from "./market-provider"

export const BANNER_HEIGHT = "260px"

export function MarketBanner() {
  const { market } = useMarket()

  if (!market.banner) return null

  return (
    <img
      className="absolute top-0 left-0 -z-10 -my-8 w-full rounded-b-2xl object-cover object-right"
      style={{ height: BANNER_HEIGHT }}
      src={market.banner}
      alt="banner"
    />
  )
}
