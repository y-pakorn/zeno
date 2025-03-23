import {
  useCurrentAccount,
  useSuiClient,
  useSuiClientQuery,
} from "@mysten/dapp-kit"
import {
  QueryClient,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"

import { PreMarket } from "@/types/market"
import { FilledOrder, OpenOrder, SettledOrder } from "@/types/order"
import {
  parseFilledOrder,
  parseOpenOrder,
  parseSettledOrder,
} from "@/lib/contract"

export function triggerUpdateMyOpenOrders(
  queryClient: QueryClient,
  marketId: string
) {
  return queryClient.invalidateQueries({
    queryKey: ["my-open-orders", marketId],
  })
}

export function triggerUpdateMyFilledOrders(
  queryClient: QueryClient,
  marketId: string
) {
  return queryClient.invalidateQueries({
    queryKey: ["my-filled-orders", marketId],
  })
}

export function triggerUpdateMySettledOrders(
  queryClient: QueryClient,
  marketId: string
) {
  return queryClient.invalidateQueries({
    queryKey: ["my-settled-orders", marketId],
  })
}

export type MyOrders = {
  openOrders: UseQueryResult<OpenOrder[]>
  filledOrders: UseQueryResult<FilledOrder[]>
  settledOrders: UseQueryResult<SettledOrder[]>
}

export const useMyOrders = ({
  market,
  ordersBagId,
  filledOrdersBagId,
  settledOrdersBagId,
}: {
  market: PreMarket
  ordersBagId: string
  filledOrdersBagId: string
  settledOrdersBagId: string
}): MyOrders => {
  const account = useCurrentAccount()

  const tableHandle = useSuiClientQuery(
    "getObject",
    {
      id: market.orderOwnerTableId,
      options: {
        showContent: true,
      },
    },
    {
      select: (data) => {
        const content = data.data?.content as any
        return content.fields.owners.fields.id.id as string
      },
    }
  )
  const orderOwnerTableHandle = useSuiClientQuery(
    "getDynamicFieldObject",
    {
      parentId: tableHandle.data!,
      name: {
        type: "address",
        value: account?.address,
      },
    },
    {
      enabled: !!tableHandle.data && !!account,
      select: (data) => {
        const content = data.data?.content as any
        const orderHandle = content.fields.value.fields.order_ids.fields.id
          .id as string
        const filledOrderHandle = content.fields.value.fields.filled_order_ids
          .fields.id.id as string
        const settledOrderHandle = content.fields.value.fields.settled_order_ids
          .fields.id.id as string
        return {
          orderHandle,
          filledOrderHandle,
          settledOrderHandle,
        }
      },
    }
  )

  const client = useSuiClient()

  const orders = useQuery({
    queryKey: ["my-open-orders", market.id],
    enabled: !!orderOwnerTableHandle.data?.orderHandle && !!ordersBagId,
    queryFn: async () => {
      const orderIds = await client.getDynamicFields({
        parentId: orderOwnerTableHandle.data!.orderHandle,
        limit: 1000,
      })
      const orders = await Promise.all(
        orderIds.data.map(async (o) => {
          const orderId = o.name.value as string
          const order = await client.getDynamicFieldObject({
            parentId: ordersBagId,
            name: {
              type: "0x2::object::ID",
              value: orderId,
            },
          })
          return parseOpenOrder(order, market.collaterals)
        })
      )
      return orders
    },
  })

  const filledOrders = useQuery({
    queryKey: ["my-filled-orders", market.id],
    enabled:
      !!orderOwnerTableHandle.data?.filledOrderHandle && !!filledOrdersBagId,
    queryFn: async () => {
      const filledOrderIds = await client.getDynamicFields({
        parentId: orderOwnerTableHandle.data!.filledOrderHandle,
        limit: 1000,
      })
      const filledOrders = await Promise.all(
        filledOrderIds.data.map(async (o) => {
          const filledOrderId = o.name.value as string
          const filledOrder = await client.getDynamicFieldObject({
            parentId: filledOrdersBagId,
            name: {
              type: "0x2::object::ID",
              value: filledOrderId,
            },
          })
          return parseFilledOrder(filledOrder, market.collaterals)
        })
      )
      return filledOrders
    },
  })

  const settledOrders = useQuery({
    queryKey: ["my-settled-orders", market.id],
    enabled:
      !!orderOwnerTableHandle.data?.settledOrderHandle && !!settledOrdersBagId,
    queryFn: async () => {
      const settledOrderIds = await client.getDynamicFields({
        parentId: orderOwnerTableHandle.data!.settledOrderHandle,
        limit: 1000,
      })
      const settledOrders = await Promise.all(
        settledOrderIds.data.map(async (o) => {
          const settledOrderId = o.name.value as string
          const settledOrder = await client.getDynamicFieldObject({
            parentId: settledOrdersBagId,
            name: {
              type: "0x2::object::ID",
              value: settledOrderId,
            },
          })
          return parseSettledOrder(settledOrder, {
            icon: market.icon,
            ticker: market.ticker,
            exponent: market.resolution?.exponent || 9,
          })
        })
      )
      return settledOrders
    },
  })

  return {
    openOrders: orders,
    filledOrders,
    settledOrders,
  }
}
