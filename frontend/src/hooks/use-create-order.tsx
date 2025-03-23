import { SUI_COIN_TYPE } from "@/constants"
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import { ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { CreateOrder } from "@/types/order"
import { useNetwork } from "@/components/wallet-provider"

import { triggerUpdateMyOpenOrders } from "./use-my-orders"
import { triggerUpdateOpenOrders } from "./use-open-orders"
import { useSignAndExecute } from "./use-sign-and-execute"

export const useCreateOrder = () => {
  const client = useSuiClient()
  const account = useCurrentAccount()

  const signAndExecute = useSignAndExecute()

  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (createOrderParams: CreateOrder) => {
      if (!account) return
      const txb = new Transaction()

      const isBuy = createOrderParams.type === "buy"
      const canPartialFill = createOrderParams.fillType
        ? createOrderParams.fillType === "partial"
        : false
      const amount = createOrderParams.collateral.amount
        .shiftedBy(createOrderParams.collateral.exponent || 0)
        .integerValue(BigNumber.ROUND_CEIL)
        .toString()
      const rate = createOrderParams.rate
        .shiftedBy(9)
        .integerValue(BigNumber.ROUND_CEIL)
        .toString()

      const collateral =
        createOrderParams.collateral.coinType === SUI_COIN_TYPE
          ? txb.splitCoins(txb.gas, [txb.pure.u64(amount)])
          : await (async () => {
              const coins = await client.getCoins({
                owner: account.address,
                coinType: createOrderParams.collateral.coinType,
              })
              const found = coins.data.find(
                (c) => BigInt(c.balance) >= BigInt(amount)
              )
              if (found) return txb.object(found.coinObjectId)
              txb.mergeCoins(
                coins.data[0].coinObjectId,
                coins.data.slice(1).map((c) => c.coinObjectId)
              )
              return txb.object(coins.data[0].coinObjectId)
            })()

      txb.moveCall({
        target: `${createOrderParams.market.packageId}::zeno::create_order`,
        arguments: [
          txb.object(createOrderParams.market.marketId),
          txb.object(createOrderParams.market.orderOwnerTableId),
          txb.pure.bool(isBuy),
          collateral,
          txb.pure.u64(rate),
          txb.pure.bool(canPartialFill),
          txb.object("0x6"),
        ],
        typeArguments: [createOrderParams.collateral.coinType],
      })

      const tx = await signAndExecute.mutateAsync({
        transaction: txb,
      })

      await triggerUpdateOpenOrders(queryClient, createOrderParams.market.id)
      await triggerUpdateMyOpenOrders(queryClient, createOrderParams.market.id)

      return tx
    },
  })
}
