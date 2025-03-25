import { NAVBAR_HEIGHT } from "@/components/app-navbar"

import { useMarket } from "./market-provider"

export const BANNER_HEIGHT = "260px"

export function MarketBanner() {
  const { market } = useMarket()

  if (!market.banner) return null

  return (
    <div className="relative pb-8">
      <img
        className="absolute top-0 -z-10 w-full object-cover object-right"
        style={{ height: BANNER_HEIGHT, marginTop: `-${NAVBAR_HEIGHT}` }}
        src={market.banner}
        alt="banner"
      />
    </div>
  )
}
