import { useSuiClient, useSuiClientQuery } from "@mysten/dapp-kit"
import { QueryOptions, useQuery, UseQueryOptions } from "@tanstack/react-query"

import { OnchainMarket } from "@/types/market"

export function useOnchainMarket({
  marketId,
  ...options
}: { marketId: string } & Partial<UseQueryOptions<OnchainMarket>>) {
  const client = useSuiClient()

  return useQuery<OnchainMarket>({
    queryKey: ["onchain-market", marketId],
    queryFn: async () => {
      const market = await client.getObject({
        id: marketId,
        options: {
          showContent: true,
        },
      })
      const data = market.data?.content as any
      if (!data || data.dataType !== "moveObject") {
        throw new Error("Market not found")
      }
      return {
        id: marketId,
        openOrdersBagId: data.fields.orders.fields.id.id,
        totalOpenOrders: parseInt(data.fields.orders.fields.size),
        filledOrdersBagId: data.fields.filled_orders.fields.id.id,
        totalFilledOrders: parseInt(data.fields.filled_orders.fields.size),
        settledOrdersBagId: data.fields.settled_orders.fields.id.id,
        totalSettledOrders: parseInt(data.fields.settled_orders.fields.size),
      } satisfies OnchainMarket
    },
    ...options,
  })
}
