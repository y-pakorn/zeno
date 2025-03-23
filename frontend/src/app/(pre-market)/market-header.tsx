import Link from "next/link"
import numbro from "numbro"
import { FaDiscord, FaGlobe, FaXTwitter } from "react-icons/fa6"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"

import { useMarket } from "./market-provider"

export function MarketHeader() {
  const { market, price, change24h, volume24h, volumeTotal } = useMarket()

  return (
    <div className="flex items-center gap-4 rounded-2xl border px-4 py-3 text-sm font-medium">
      <img
        className="size-12 shrink-0 rounded-full"
        src={market.icon}
        alt="logo"
      />
      <div className="-ml-2">
        <div className="text-lg font-bold">{market.name}</div>
        <Badge variant={market.isLive ? "success" : "error"}>
          {market.isLive ? "LIVE" : "UPCOMING"}
        </Badge>
      </div>
      <div className="ml-12">
        <div className="text-lg font-bold">{price.toLocaleString()}</div>
        <div className={cn(change24h > 0 ? "text-green-500" : "text-red-500")}>
          {change24h > 0 ? "+" : ""}
          {change24h.toLocaleString()}%
        </div>
      </div>
      <div className="ml-4">
        <div className="text-muted-foreground font-semibold">24h Vol</div>
        <div className="text-base">
          {numbro(volume24h)
            .format({
              average: true,
              prefix: "$",
            })
            .toUpperCase()}
        </div>
      </div>
      <div>
        <div className="text-muted-foreground font-semibold">Total Vol</div>
        <div className="text-base">
          {numbro(volumeTotal)
            .format({
              average: true,
              prefix: "$",
            })
            .toUpperCase()}
        </div>
      </div>
      <div>
        <div className="text-muted-foreground font-semibold">Total Supply</div>
        <div className="text-base">
          {numbro(market.totalSupply)
            .format({
              average: true,
            })
            .toUpperCase()}
        </div>
      </div>
      <div>
        <div className="text-muted-foreground font-semibold">Settle Start</div>
        <div className="text-base">
          {market.resolution?.settlementStart
            ? new Date(market.resolution.settlementStart).toLocaleString()
            : "TBA"}
        </div>
      </div>
      <div>
        <div className="text-muted-foreground font-semibold">
          Delivery Before
        </div>
        <div className="text-base">
          {market.resolution?.deliveryBefore
            ? new Date(market.resolution.deliveryBefore).toLocaleString()
            : "TBA"}
        </div>
      </div>
      <div className="flex-1" />
      {(
        [
          [FaXTwitter, market.links?.twitter],
          [FaDiscord, market.links?.discord],
          [FaGlobe, market.links?.website],
        ] as const
      ).map(([Icon, link]) => {
        if (!link) return null
        return (
          <Link
            key={link}
            href={link}
            target="_blank"
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
            })}
          >
            <Icon />
          </Link>
        )
      })}
    </div>
  )
}
