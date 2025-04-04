import { useMemo } from "react"
import BigNumber from "bignumber.js"
import dayjs from "dayjs"
import _ from "lodash"
import { Loader2 } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

import { HistoricalPrice, HistoricalPrices } from "@/types/price"
import { usePrices } from "@/hooks/use-prices"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useMarket } from "@/components/market-provider"

const chartConfig = {
  period: {
    label: "Period",
    color: "hsl(var(--quaternary))",
  },
  price: {
    label: "Price",
    color: "hsl(var(--brand))",
  },
  volume: {
    label: "Volume",
    color: "hsl(var(--foreground))",
  },
  count: {
    label: "Count",
    color: "hsl(var(--secondary))",
  },
} satisfies ChartConfig

const additionalFormatter = {
  price: {
    prefix: "$",
  },
  volume: {
    prefix: "$",
  },
}

export function PriceChart() {
  const { market, collateralPrices } = useMarket()
  const prices = usePrices({
    marketId: market.id,
  })

  const aggregatedPrices = useMemo(() => {
    if (!prices.data || !collateralPrices.data) return []
    const aggregatedPrices: Map<
      number,
      {
        period: Date
        price: number
        count: number
        volume: number
      }
    > = new Map()
    for (const [coinType, ps] of Object.entries(prices.data.data)) {
      const collateralPrice =
        collateralPrices.data[coinType] || new BigNumber(0)
      for (const p of ps) {
        const time = p.period.getTime()
        if (!aggregatedPrices.has(time)) {
          aggregatedPrices.set(time, {
            period: p.period,
            price: collateralPrice.multipliedBy(p.avg).toNumber(),
            count: p.count,
            volume: collateralPrice.multipliedBy(p.volume).toNumber(),
          })
        } else {
          const existing = aggregatedPrices.get(time)
          aggregatedPrices.set(time, {
            period: p.period,
            price:
              existing!.price + collateralPrice.multipliedBy(p.avg).toNumber(),
            count: existing!.count + p.count,
            volume:
              existing!.volume +
              collateralPrice.multipliedBy(p.volume).toNumber(),
          })
        }
      }
    }
    return _.chain([...aggregatedPrices.values()])
      .sortBy((p) => p.period)
      .value()
  }, [prices.data, collateralPrices.data])

  if (prices.isPending) {
    return (
      <div className="bg-secondary flex h-[200px] w-full items-center justify-center rounded-2xl">
        <Loader2 className="size-5 animate-spin" />
      </div>
    )
  }

  if (aggregatedPrices.length === 0) {
    return null
  }

  return (
    <div className="bg-secondary h-[200px] w-full rounded-2xl p-4">
      <div className="text-quaternary flex h-6 items-center gap-2 text-sm font-semibold">
        <h3>Price</h3>
        <div className="underline">15m</div>
        <p className="text-secondary-foreground ml-auto">
          Updated at {dayjs(prices.data?.timestamp).format("MMM D, HH:mm")}
        </p>
      </div>
      <ChartContainer
        config={chartConfig}
        className="h-[calc(100%-1.5rem)] w-full"
      >
        <AreaChart
          accessibilityLayer
          data={aggregatedPrices}
          margin={{
            left: 0,
            right: 0,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="period"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => dayjs(value).format("MMM D, HH:mm")}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            yAxisId="price"
            hide={true}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            yAxisId="volume"
            hide={true}
            domain={["auto", (m: number) => 3 * m]}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelKey="period"
                additionalFormatter={additionalFormatter}
                labelFormatter={(_, payload) => {
                  const date = payload?.[0].payload?.period
                  return dayjs(date).format("MMM D, HH:mm")
                }}
              />
            }
          />
          <defs>
            <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="10%"
                stopColor="var(--color-price)"
                stopOpacity={0.5}
              />
              <stop
                offset="90%"
                stopColor="var(--color-price)"
                stopOpacity={0.0}
              />
            </linearGradient>
            <linearGradient id="fillVolume" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="10%"
                stopColor="var(--color-volume)"
                stopOpacity={0.5}
              />
              <stop
                offset="90%"
                stopColor="var(--color-volume)"
                stopOpacity={0.0}
              />
            </linearGradient>
          </defs>
          <Area
            dataKey="price"
            type="natural"
            fill="url(#fillPrice)"
            fillOpacity={0.4}
            stroke="var(--color-price)"
            stackId="a"
            yAxisId="price"
          />
          <Area
            dataKey="volume"
            type="natural"
            fill="url(#fillVolume)"
            stroke="var(--color-volume)"
            fillOpacity={0.4}
            yAxisId="volume"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
