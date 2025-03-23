import { useMarket } from "./market-provider"

export const BANNER_HEIGHT = "260px"

export function MarketBanner() {
  const { market } = useMarket()

  if (!market.banner) return null

  return (
    <img
      className="absolute -z-10 -m-8 w-full object-cover object-right"
      style={{ height: BANNER_HEIGHT }}
      src={market.banner}
      alt="banner"
    />
  )
}
