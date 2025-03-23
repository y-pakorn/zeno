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

import { Collateral, PreMarket } from "@/types/market"
import { OpenOrder, OpenOrderEvent, OrderFilledEvent } from "@/types/order"

export function triggerUpdateOpenOrders(
  queryClient: QueryClient,
  marketId: string
) {
  return queryClient.invalidateQueries({
    queryKey: ["open-order-events", marketId],
  })
}

export function triggerUpdateFilledOrders(
  queryClient: QueryClient,
  marketId: string
) {
  return queryClient.invalidateQueries({
    queryKey: ["filled-orders-events", marketId],
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
      const orders = await fetchAllDynamicFields(
        client,
        openOrderBagId,
        market.collaterals
      )
      return orders
    },
    ...options,
  })

  const _updateDataOpen = useQuery({
    queryKey: ["open-order-events", market.id],
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
        market.id,
      ])
      if (!prevOrders) return false
      const ids = new Set(prevOrders?.map((o) => o.id))
      const insertedOrders: OpenOrder[] = []
      for (const event of events.data) {
        const eventData = event.parsedJson as OpenOrderEvent
        if (eventData.market_id !== market.marketId) continue
        if (ids.has(eventData.order_id)) continue
        const coinType = eventData.collateral_type.name.replace(/^0x0+/, "0x")
        const collateral = market.collaterals.find(
          (c) => c.coinType === coinType
        )
        if (!collateral) continue
        const order: OpenOrder = {
          id: eventData.order_id,
          by: event.sender,
          createdAt: new Date(parseInt(event.timestampMs!)),
          fillType: eventData.can_partially_fill ? "partial" : "full",
          type: eventData.is_buy ? "buy" : "sell",
          collateral: {
            coinType,
            icon: collateral.icon,
            exponent: collateral.exponent,
            amount: new BigNumber(eventData.collateral_amount).shiftedBy(
              -collateral.exponent
            ),
            filledAmount: new BigNumber(0),
          },
          rate: new BigNumber(eventData.rate).shiftedBy(-9),
        }
        insertedOrders.push(order)
      }
      queryClient.setQueryData<OpenOrder[]>(
        ["open-orders", market.id],
        (old) => {
          return [...(old || []), ...insertedOrders]
        }
      )
      return insertedOrders
    },
  })

  const _updateDataFilled = useQuery({
    queryKey: ["filled-orders-events", market.id],
    enabled: !!query.data,
    refetchInterval: 11 * 1000, // 11 seconds
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
        if (eventData.market_id !== market.marketId) continue
        toRemoveIds.add(eventData.order_id)
      }
      queryClient.setQueryData<OpenOrder[]>(
        ["open-orders", market.id],
        (old) => {
          return old?.filter((o) => !toRemoveIds.has(o.id))
        }
      )
      return true
    },
  })

  return query
}

async function fetchAllDynamicFields(
  client: SuiClient,
  parentId: string,
  collaterals: Collateral[]
) {
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

    orders.push(...data.map((o) => parseOpenOrder(o, collaterals)))

    // Update pagination state
    hasNextPage = result.hasNextPage
    cursor = result.nextCursor

    if (!hasNextPage || !cursor) {
      break
    }
  }

  return orders
}

function parseOpenOrder(object: any, collaterals: Collateral[]): OpenOrder {
  const data = object.data?.content as any
  const orderData = data.fields.value.fields
  const collateralType = data.fields.value.type.match(/<(.+)>/)[1]
  const collateral = collaterals.find((c) => c.coinType === collateralType)

  if (!collateral) {
    throw new Error(`Collateral not found: ${collateralType}`)
  }

  const rate = new BigNumber(orderData.rate).shiftedBy(-9)
  const collateralAmount = new BigNumber(orderData.collateral).shiftedBy(
    -collateral.exponent
  )
  const filledAmount = new BigNumber(orderData.filled_collateral).shiftedBy(
    -collateral.exponent
  )

  return {
    id: orderData.id.id,
    createdAt: new Date(parseInt(orderData.created_at)),
    collateral: {
      coinType: collateralType,
      icon: collateral.icon,
      exponent: collateral.exponent,
      amount: collateralAmount,
      filledAmount,
    },
    fillType: orderData.can_partially_fill ? "partial" : "full",
    type: orderData.is_buy ? "buy" : "sell",
    rate,
    by: orderData.by,
  } satisfies OpenOrder
}
