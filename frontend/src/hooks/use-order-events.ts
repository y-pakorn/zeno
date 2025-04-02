import { useSuiClient } from "@mysten/dapp-kit"
import { SuiGraphQLClient } from "@mysten/sui/graphql"
import { graphql } from "@mysten/sui/graphql/schemas/latest"
import { QueryClient, useQuery, UseQueryOptions } from "@tanstack/react-query"
import _ from "lodash"

import { PreMarket } from "@/types/market"
import {
  FilledOrder,
  OpenOrder,
  OrderCancelledEvent,
  OrderFilledEvent,
  WithTransaction,
} from "@/types/order"
import { parseFilledOrderEvent, parseOpenOrderEvent } from "@/lib/contract"
import { useNetwork } from "@/components/wallet-provider"

export function useOpenOrderEvents({
  market,
  ...props
}: { market: PreMarket } & Partial<
  UseQueryOptions<WithTransaction<OpenOrder>[]>
>) {
  const client = useSuiClient()
  return useQuery({
    queryKey: ["open-orders-events", market.id],
    queryFn: async () => {
      const events = await client.queryEvents({
        query: {
          MoveEventType: `${market.packageId}::zeno::OrderCreated`,
        },
        order: "descending",
      })
      return events.data.map((event) => ({
        ...parseOpenOrderEvent(event, market),
        transaction: {
          hash: event.id.txDigest,
          createdAt: new Date(Number(event.timestampMs)),
        },
      }))
    },
    ...props,
  })
}

export function useFilledOrderEvents({
  market,
  ...props
}: { market: PreMarket } & Partial<
  UseQueryOptions<WithTransaction<FilledOrder>[]>
>) {
  const client = useSuiClient()
  return useQuery({
    queryKey: ["filled-orders-events", market.id],
    queryFn: async () => {
      const events = await client.queryEvents({
        query: {
          MoveEventType: `${market.packageId}::zeno::OrderFilled`,
        },
        order: "descending",
      })
      return events.data.map((event) => ({
        ...parseFilledOrderEvent(event, market),
        transaction: {
          hash: event.id.txDigest,
          createdAt: new Date(Number(event.timestampMs)),
        },
      }))
    },
    ...props,
  })
}

export function useCancelledOrderEvents({
  market,
  ...props
}: { market: PreMarket } & Partial<
  UseQueryOptions<WithTransaction<OrderCancelledEvent>[]>
>) {
  const client = useSuiClient()
  return useQuery({
    queryKey: ["cancelled-orders-events", market.id],
    queryFn: async () => {
      const events = await client.queryEvents({
        query: {
          MoveEventType: `${market.packageId}::zeno::OrderCancelled`,
        },
        order: "descending",
      })
      return events.data
        .map((event) => ({
          ...(event.parsedJson as OrderCancelledEvent),
          transaction: {
            hash: event.id.txDigest,
            createdAt: new Date(Number(event.timestampMs)),
          },
        }))
        .filter((event) => event.market_id === market.marketId)
    },
    ...props,
  })
}

export function triggerUpdateOpenOrdersEvents(
  queryClient: QueryClient,
  marketId: string
) {
  return queryClient.invalidateQueries({
    queryKey: ["open-orders-events", marketId],
  })
}

export function triggerUpdateCancelledOrdersEvents(
  queryClient: QueryClient,
  marketId: string
) {
  return queryClient.invalidateQueries({
    queryKey: ["cancelled-orders-events", marketId],
  })
}

export function triggerUpdateFilledOrdersEvents(
  queryClient: QueryClient,
  marketId: string
) {
  return queryClient.invalidateQueries({
    queryKey: ["filled-orders-events", marketId],
  })
}
