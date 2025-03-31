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

import { OnchainMarket, PreMarket } from "@/types/market"
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
  onchainMarket,
  enabled = true,
}: {
  market: PreMarket
  onchainMarket?: OnchainMarket
  enabled?: boolean
}): MyOrders => {
  const account = useCurrentAccount()

  const orderOwnerTableHandle = useSuiClientQuery(
    "getDynamicFieldObject",
    {
      parentId: onchainMarket?.orderOwnerTableId!,
      name: {
        type: "address",
        value: account?.address,
      },
    },
    {
      queryKey: ["order-owner-table-handle", market.id, account?.address],
      enabled: !!onchainMarket?.orderOwnerTableId && !!account && enabled,
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
    queryKey: ["my-open-orders", market.id, account?.address],
    enabled:
      !!orderOwnerTableHandle.data?.orderHandle &&
      !!onchainMarket?.openOrdersBagId &&
      !!account,
    queryFn: async () => {
      const orderIds = await client.getDynamicFields({
        parentId: orderOwnerTableHandle.data!.orderHandle,
        limit: 1000,
      })
      const orders = await Promise.all(
        orderIds.data.map(async (o) => {
          const orderId = o.name.value as string
          const order = await client.getDynamicFieldObject({
            parentId: onchainMarket!.openOrdersBagId,
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
    queryKey: ["my-filled-orders", market.id, account?.address],
    enabled:
      !!orderOwnerTableHandle.data?.filledOrderHandle &&
      !!onchainMarket?.filledOrdersBagId &&
      !!account,
    queryFn: async () => {
      const filledOrderIds = await client.getDynamicFields({
        parentId: orderOwnerTableHandle.data!.filledOrderHandle,
        limit: 1000,
      })
      const filledOrders = await Promise.all(
        filledOrderIds.data.map(async (o) => {
          const filledOrderId = o.name.value as string
          const filledOrder = await client.getDynamicFieldObject({
            parentId: onchainMarket!.filledOrdersBagId,
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
    queryKey: ["my-settled-orders", market.id, account?.address],
    enabled:
      !!orderOwnerTableHandle.data?.settledOrderHandle &&
      !!onchainMarket?.settledOrdersBagId &&
      !!account,
    queryFn: async () => {
      const settledOrderIds = await client.getDynamicFields({
        parentId: orderOwnerTableHandle.data!.settledOrderHandle,
        limit: 1000,
      })
      const settledOrders = await Promise.all(
        settledOrderIds.data.map(async (o) => {
          const settledOrderId = o.name.value as string
          const settledOrder = await client.getDynamicFieldObject({
            parentId: onchainMarket!.settledOrdersBagId,
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
