import { useCurrentAccount } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { CloseOrder } from "@/types/order"

import {
  triggerUpdateMyFilledOrders,
  triggerUpdateMyOpenOrders,
} from "./use-my-orders"
import { triggerUpdateFilledOrdersEvents } from "./use-order-events"
import { useSignAndExecute } from "./use-sign-and-execute"

export const useCloseOrder = () => {
  const account = useCurrentAccount()

  const queryClient = useQueryClient()
  const signAndExecute = useSignAndExecute()

  return useMutation({
    mutationFn: async (closeOrderParams: CloseOrder) => {
      if (!account) return
      const txb = new Transaction()

      const coin = txb.moveCall({
        target: `${closeOrderParams.market.packageId}::zeno::close_order`,
        arguments: [
          txb.object(closeOrderParams.market.marketId),
          txb.pure.id(closeOrderParams.filledOrderId),
          txb.object("0x6"),
        ],
        typeArguments: [closeOrderParams.collateralCoinType],
      })

      txb.transferObjects([coin], account.address)

      const tx = await signAndExecute.mutateAsync({
        transaction: txb,
      })

      await triggerUpdateMyFilledOrders(queryClient, closeOrderParams.market.id)

      return tx
    },
  })
}
