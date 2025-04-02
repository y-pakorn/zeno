import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import _ from "lodash"

import { HistoricalPrices } from "@/types/price"

export function usePrices({
  marketId,
  ...props
}: { marketId: string } & Partial<
  UseQueryOptions<{ data: HistoricalPrices; timestamp: string }>
>) {
  return useQuery({
    queryKey: ["prices", marketId],
    queryFn: async () => {
      const response = await fetch(`/api/historical-prices?id=${marketId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch prices", {
          cause: await response.text(),
        })
      }
      return response.json().then((data) => ({
        timestamp: data.timestamp,
        data: _.chain(data.data)
          .mapValues((ps) =>
            ps.map(([period, avg, min, max, volume, count]: any) => ({
              period: new Date(period),
              avg: avg,
              min: min,
              max: max,
              volume: volume,
              count: count,
            }))
          )
          .value(),
      })) as Promise<{ data: HistoricalPrices; timestamp: string }>
    },
    ...props,
  })
}
