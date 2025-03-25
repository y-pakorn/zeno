import { useEffect, useState } from "react"
import { useSuiClient } from "@mysten/dapp-kit"
import { SuiClient } from "@mysten/sui/client"
import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query"

import { Collateral, PreMarket } from "@/types/market"
import { OpenOrder } from "@/types/order"
import { parseOpenOrder } from "@/lib/contract"

import {
  useCancelledOrderEvents,
  useFilledOrderEvents,
  useOpenOrderEvents,
} from "./use-order-events"

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

  const [lastUpdated, setLastUpdated] = useState<number>(Date.now())
  const openOrderEvents = useOpenOrderEvents({
    market,
    enabled: !!query.data,
    refetchInterval: 11 * 1000, // 11 seconds
  })

  console.log(openOrderEvents.data, openOrderEvents.error)

  useEffect(() => {
    if (!openOrderEvents.data) return

    const prevOrders = queryClient.getQueryData<OpenOrder[]>([
      "open-orders",
      market.id,
    ])

    if (!prevOrders?.length) return

    const ids = new Set(prevOrders?.map((o) => o.id))
    const insertedOrders: OpenOrder[] = []

    for (const event of openOrderEvents.data) {
      if (ids.has(event.id)) continue
      if (event.createdAt.getTime() < lastUpdated) continue
      insertedOrders.push(event)
    }

    if (insertedOrders.length > 0) {
      queryClient.setQueryData<OpenOrder[]>(
        ["open-orders", market.id],
        (old) => {
          return [...(old || []), ...insertedOrders]
        }
      )
      setLastUpdated(Date.now())
    }
  }, [openOrderEvents.data, lastUpdated, market.id])

  const cancelledOrderEvents = useCancelledOrderEvents({
    market,
    enabled: !!query.data,
    refetchInterval: 11 * 1000, // 11 seconds
  })

  useEffect(() => {
    if (!cancelledOrderEvents.data) return

    const toRemoveIds: Set<string> = new Set()
    for (const event of cancelledOrderEvents.data) {
      toRemoveIds.add(event.order_id)
    }

    queryClient.setQueryData<OpenOrder[]>(["open-orders", market.id], (old) => {
      return old?.filter((o) => !toRemoveIds.has(o.id))
    })
  }, [cancelledOrderEvents.data, market.id])

  const filledOrderEvents = useFilledOrderEvents({
    market,
    enabled: !!query.data,
    refetchInterval: 11 * 1000, // 11 seconds
  })

  useEffect(() => {
    if (!filledOrderEvents.data) return

    const toRemoveIds: Set<string> = new Set()
    for (const event of filledOrderEvents.data) {
      toRemoveIds.add(event.id)
    }

    queryClient.setQueryData<OpenOrder[]>(["open-orders", market.id], (old) => {
      return old?.filter((o) => !toRemoveIds.has(o.id))
    })
  }, [filledOrderEvents.data, market.id])

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
