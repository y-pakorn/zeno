import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import _ from "lodash"

import { CancelOrder } from "@/types/order"

import { triggerUpdateMyOpenOrders } from "./use-my-orders"
import {
  triggerUpdateCancelledOrders,
  triggerUpdateOpenOrders,
} from "./use-open-orders"
import { useSignAndExecute } from "./use-sign-and-execute"

export const useCancelOrder = () => {
  const account = useCurrentAccount()

  const signAndExecute = useSignAndExecute()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (cancelOrderParams: CancelOrder) => {
      if (!account) return
      const txb = new Transaction()

      const coin = txb.moveCall({
        target: `${cancelOrderParams.market.packageId}::zeno::cancel_order`,
        arguments: [
          txb.object(cancelOrderParams.market.marketId),
          txb.object(cancelOrderParams.market.orderOwnerTableId),
          txb.pure.id(cancelOrderParams.orderId),
          txb.object("0x6"),
        ],
        typeArguments: [cancelOrderParams.coinType],
      })

      txb.transferObjects([coin], account.address)

      const tx = await signAndExecute.mutateAsync({
        transaction: txb,
      })

      await triggerUpdateCancelledOrders(
        queryClient,
        cancelOrderParams.market.id
      )
      await triggerUpdateMyOpenOrders(queryClient, cancelOrderParams.market.id)

      return tx
    },
  })
}
