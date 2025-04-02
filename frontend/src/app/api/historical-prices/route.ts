import { NextRequest, NextResponse } from "next/server"
import { EventId, SuiClient } from "@mysten/sui/client"
import BigNumber from "bignumber.js"
import _ from "lodash"

import { markets } from "@/config/market"
import { Network, networkConfig } from "@/config/network"

export const revalidate = 900 // 15 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const market = markets.find((market) => market.id === searchParams.get("id"))
  if (!market)
    return NextResponse.json({ error: "Invalid market" }, { status: 400 })
  if (market.status !== "live")
    return NextResponse.json({ error: "Market is not live" }, { status: 400 })

  const network = networkConfig[market.network]
  const collateralMap = _.keyBy(market.collaterals, "coinType")
  const client = new SuiClient({ url: network.url })

  const timePeriod = 1000 * 60 * 15 // 15 minutes
  // Use Map for O(1) lookups and better memory efficiency
  const priceMap = new Map<
    string,
    Map<
      number,
      {
        sum: number
        count: number
        minPrice: number
        maxPrice: number
        volume: number
      }
    >
  >()

  // Initialize maps for each collateral type
  for (const coinType of Object.keys(collateralMap)) {
    priceMap.set(coinType, new Map())
  }

  let cursor: EventId | null = null
  const batchSize = 1000 // Maximum events per request

  while (true) {
    const events = await client.queryEvents({
      query: {
        MoveEventType: `${market.packageId}::zeno::OrderFilled`,
      },
      order: "descending",
      limit: batchSize,
      cursor,
    })

    for (const event of events.data) {
      const eventData = event.parsedJson as any
      const coinType = "0x" + eventData.collateral_type.name.replace(/^0+/, "")
      const collateralPrice = new BigNumber(eventData.rate)
        .shiftedBy(-9)
        .toNumber()
      const volume = new BigNumber(eventData.collateral_amount)
        .shiftedBy(-collateralMap[coinType].exponent)
        .toNumber()

      const timestamp = Number(event.timestampMs || 0)
      const period = Math.floor(timestamp / timePeriod) * timePeriod

      const coinTypeMap = priceMap.get(coinType)!
      const periodData = coinTypeMap.get(period) || {
        sum: 0,
        count: 0,
        minPrice: Infinity,
        maxPrice: -Infinity,
        volume: 0,
      }

      periodData.sum += collateralPrice
      periodData.count++
      periodData.minPrice = Math.min(periodData.minPrice, collateralPrice)
      periodData.maxPrice = Math.max(periodData.maxPrice, collateralPrice)
      periodData.volume += volume

      coinTypeMap.set(period, periodData)
    }

    if (!events.hasNextPage) break
    cursor = events.nextCursor || null
  }

  // Convert to final format efficiently
  const result: { [key: string]: [number, number, number, number, number][] } =
    {}

  for (const [coinType, periodMap] of priceMap.entries()) {
    const periods = Array.from(periodMap.entries()).sort(([a], [b]) => b - a) // Sort by period in descending order

    result[coinType] = periods.map(([period, data]) => [
      period,
      data.sum / data.count,
      data.minPrice,
      data.maxPrice,
      data.volume,
    ])
  }

  return NextResponse.json({
    data: result,
    timestamp: new Date().toISOString(),
  })
}
