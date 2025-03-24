import { useCurrentAccount } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"
import { useMutation } from "@tanstack/react-query"

import { ClaimOrder } from "@/types/order"

import { useSignAndExecute } from "./use-sign-and-execute"

export const useClaimOrder = () => {
  const account = useCurrentAccount()

  const signAndExecute = useSignAndExecute()

  return useMutation({
    mutationFn: async (claimOrderParams: ClaimOrder) => {
      if (!account) return
      const txb = new Transaction()

      const coin = txb.moveCall({
        target: `${claimOrderParams.market.packageId}::zeno::claim_order`,
        arguments: [
          txb.object(claimOrderParams.market.marketId),
          txb.pure.id(claimOrderParams.settledOrderId),
          txb.object("0x6"),
        ],
        typeArguments: [claimOrderParams.market.resolution!.finalCoinType!],
      })

      txb.transferObjects([coin], account.address)

      const tx = await signAndExecute.mutateAsync({
        transaction: txb,
      })

      return tx
    },
  })
}
