import { NextRequest, NextResponse } from "next/server"
import { SuiClient } from "@mysten/sui/client"
import _ from "lodash"

import { PreMarket } from "@/types/market"
import { markets } from "@/config/market"
import { Network, networkConfig } from "@/config/network"
import { parseFilledOrderEvent } from "@/lib/contract"

export const revalidate = 900 // 15 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const network = searchParams.get("network")
  const config = networkConfig[network as Network]
  if (!config)
    return NextResponse.json({ error: "Invalid network" }, { status: 400 })

  const availableMarkets = markets.filter(
    (market) => market.network === network && market.status === "live"
  ) as PreMarket[]

  const client = new SuiClient({ url: config.url })

  const events = await Promise.all(
    availableMarkets.map(async (market) => {
      const events = await client.queryEvents({
        order: "descending",
        limit: 100,
        query: {
          MoveEventType: `${market.packageId}::zeno::OrderFilled`,
        },
      })
      return events.data.map((event) => ({
        ..._.pick(parseFilledOrderEvent(event, market), [
          "collateral.icon",
          "collateral.amount",
          "rate",
          "type",
        ]),
        market: {
          icon: market.icon,
          ticker: market.ticker,
          id: market.id,
        },
        transaction: {
          hash: event.id.txDigest,
          createdAt: new Date(Number(event.timestampMs)),
        },
      }))
    })
  ).then((d) =>
    _.chain(d)
      .flatten()
      .sortBy((v) => -v.transaction.createdAt)
      .take(100)
      .value()
  )

  return NextResponse.json({
    data: events,
    timestamp: new Date().toISOString(),
  })
}
