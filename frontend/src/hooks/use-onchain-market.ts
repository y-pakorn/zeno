import { useSuiClient, useSuiClientQuery } from "@mysten/dapp-kit"
import { QueryOptions, useQuery, UseQueryOptions } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import _ from "lodash"

import { OnchainMarket, PreMarket } from "@/types/market"

export function useOnchainMarket({
  market,
  ...options
}: { market: PreMarket } & Partial<UseQueryOptions<OnchainMarket>>) {
  const client = useSuiClient()

  return useQuery<OnchainMarket>({
    queryKey: ["onchain-market", market.id],
    queryFn: async () => {
      const m = await client.getObject({
        id: market.marketId,
        options: {
          showContent: true,
        },
      })
      const data = m.data?.content as any
      if (!data || data.dataType !== "moveObject") {
        throw new Error("Market not found")
      }
      return {
        id: market.id,
        openOrdersBagId: data.fields.orders.fields.id.id,
        totalOpenOrders: parseInt(data.fields.orders.fields.size),
        filledOrdersBagId: data.fields.filled_orders.fields.id.id,
        totalFilledOrders: parseInt(data.fields.filled_orders.fields.size),
        settledOrdersBagId: data.fields.settled_orders.fields.id.id,
        totalSettledOrders: parseInt(data.fields.settled_orders.fields.size),
        orderOwnerTableId: data.fields.order_owner_table.fields.id.id,
        stats: {
          cancelled: parseInt(data.fields.stats.fields.order_cancelled),
          filled: parseInt(data.fields.stats.fields.order_filled),
          settled: parseInt(data.fields.stats.fields.order_settled),
          opened: parseInt(data.fields.stats.fields.order_opened),
          claimed: parseInt(data.fields.stats.fields.order_claimed),
          closed: parseInt(data.fields.stats.fields.order_closed),
        },
        collateral: _.fromPairs(
          data.fields.collateral_types.fields.contents.map((c: any) => {
            const coinType = "0x" + c.fields.key.fields.name.replace(/^0+/, "")
            const exponent = market.collaterals.find(
              (c) => c.coinType === coinType
            )!.exponent
            return [
              coinType,
              {
                volumeCancelled: new BigNumber(
                  c.fields.value.fields.volume_cancelled
                ).shiftedBy(-exponent),
                volumeFilled: new BigNumber(
                  c.fields.value.fields.volume_filled
                ).shiftedBy(-exponent),
                volumeOpened: new BigNumber(
                  c.fields.value.fields.volume_opened
                ).shiftedBy(-exponent),
              },
            ]
          })
        ),
      } satisfies OnchainMarket
    },
    ...options,
  })
}
