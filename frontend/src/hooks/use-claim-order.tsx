import { useCurrentAccount } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { ClaimOrder } from "@/types/order"

import { triggerUpdateMySettledOrders } from "./use-my-orders"
import { useSignAndExecute } from "./use-sign-and-execute"

export const useClaimOrder = () => {
  const account = useCurrentAccount()

  const signAndExecute = useSignAndExecute()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (claimOrderParams: ClaimOrder) => {
      if (!account) return
      const txb = new Transaction()

      const coin = txb.moveCall({
        target: `${claimOrderParams.market.packageId}::zeno::claim_order`,
        arguments: [
          txb.object(claimOrderParams.market.marketId),
          txb.pure.id(claimOrderParams.settledOrderId),
        ],
        typeArguments: [claimOrderParams.market.resolution!.finalCoinType!],
      })

      txb.transferObjects([coin], account.address)

      const tx = await signAndExecute.mutateAsync({
        transaction: txb,
      })

      await triggerUpdateMySettledOrders(
        queryClient,
        claimOrderParams.market.id
      )

      return tx
    },
  })
}
