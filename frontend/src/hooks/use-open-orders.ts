import { useEffect } from "react"
import { useSuiClient } from "@mysten/dapp-kit"
import { SuiClient } from "@mysten/sui/client"
import {
  QueryClient,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query"
import BigNumber from "bignumber.js"

import { PreMarket } from "@/types/market"
import { OpenOrder, OpenOrderEvent, OrderFilledEvent } from "@/types/order"

export function triggerUpdateOpenOrders(
  queryClient: QueryClient,
  marketId: string
) {
  return queryClient.invalidateQueries({
    queryKey: ["open-orders", marketId],
  })
}

export function triggerUpdateFilledOrders(
  queryClient: QueryClient,
  marketId: string
) {
  return queryClient.invalidateQueries({
    queryKey: ["filled-orders", marketId],
  })
}
export function useOpenOrders({
  market,
  openOrderBagId,
  update = true,
  ...options
}: {
  market: PreMarket
  openOrderBagId: string
  update?: boolean
} & Partial<UseQueryOptions<OpenOrder[]>>) {
  const client = useSuiClient()
  const queryClient = useQueryClient()

  const query = useQuery<OpenOrder[]>({
    queryKey: ["open-orders", market.id],
    queryFn: async () => {
      // Fetch all dynamic fields with pagination
      const orders = await fetchAllDynamicFields(client, openOrderBagId)
      return orders
    },
    ...options,
  })

  const _updateDataOpen = useQuery({
    queryKey: ["open-order-events", openOrderBagId],
    enabled: !!query.data,
    refetchInterval: 10 * 1000, // 10 seconds
    queryFn: async () => {
      const events = await client.queryEvents({
        query: {
          MoveEventType: `${market.packageId}::zeno::OrderCreated`,
        },
        order: "descending",
      })
      const prevOrders = queryClient.getQueryData<OpenOrder[]>([
        "open-orders",
        openOrderBagId,
      ])
      if (!prevOrders) return false
      const ids = new Set(prevOrders?.map((o) => o.id))
      const insertedOrders: OpenOrder[] = []
      for (const event of events.data) {
        const eventData = event.parsedJson as OpenOrderEvent
        if (ids.has(eventData.order_id)) continue
        const coinType = eventData.collateral_type.name.replace(/^0x0+/, "0x")
        const order: OpenOrder = {
          id: eventData.order_id,
          createdAt: new Date(parseInt(event.timestampMs!)),
          fillType: eventData.can_partially_fill ? "partial" : "full",
          type: eventData.is_buy ? "buy" : "sell",
          collateral: {
            coinType,
            amount: new BigNumber(eventData.collateral_amount),
            filledAmount: new BigNumber(0),
          },
          rate: new BigNumber(eventData.rate),
        }
        insertedOrders.push(order)
      }
      queryClient.setQueryData<OpenOrder[]>(
        ["open-orders", openOrderBagId],
        (old) => {
          return [...(old || []), ...insertedOrders]
        }
      )
      return insertedOrders
    },
  })

  const _updateDataFilled = useQuery({
    queryKey: ["filled-orders", openOrderBagId],
    enabled: !!query.data,
    refetchInterval: 10 * 1000, // 10 seconds
    queryFn: async () => {
      const events = await client.queryEvents({
        query: {
          MoveEventType: `${market.packageId}::zeno::OrderFilled`,
        },
        order: "descending",
      })
      const toRemoveIds: Set<string> = new Set()
      for (const event of events.data) {
        const eventData = event.parsedJson as OrderFilledEvent
        toRemoveIds.add(eventData.order_id)
      }
      queryClient.setQueryData<OpenOrder[]>(
        ["open-orders", openOrderBagId],
        (old) => {
          return old?.filter((o) => !toRemoveIds.has(o.id))
        }
      )
      return true
    },
  })

  // queryClient.setQueryData<OpenOrder[]>(["open-orders", openOrderBagId], (old) => {
  //   return old
  // })

  return query
}

async function fetchAllDynamicFields(client: SuiClient, parentId: string) {
  let hasNextPage = true
  let cursor: string | null = null
  const orders: OpenOrder[] = []

  // Loop until all pages are fetched
  while (hasNextPage) {
    const result = await client.getDynamicFields({
      parentId,
      cursor,
      limit: 1000, // Use a larger limit for efficiency
    })

    const data = await client.multiGetObjects({
      ids: result.data.map((field) => field.objectId),
      options: { showContent: true },
    })

    orders.push(...data.map(parseOpenOrder))

    // Update pagination state
    hasNextPage = result.hasNextPage
    cursor = result.nextCursor

    if (!hasNextPage || !cursor) {
      break
    }
  }

  return orders
}

function parseOpenOrder(object: any): OpenOrder {
  const data = object.data?.content as any
  const orderData = data.fields.value.fields
  const collateralType = data.fields.value.type.match(/<(.+)>/)[1]

  return {
    id: orderData.id.id,
    createdAt: new Date(parseInt(orderData.created_at)),
    collateral: {
      coinType: collateralType,
      amount: new BigNumber(orderData.collateral),
      filledAmount: new BigNumber(orderData.filled_collateral),
    },
    fillType: orderData.can_partially_fill ? "partial" : "full",
    type: orderData.is_buy ? "buy" : "sell",
    rate: new BigNumber(orderData.rate),
  } satisfies OpenOrder
}
