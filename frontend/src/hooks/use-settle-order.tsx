import { SUI_COIN_TYPE } from "@/constants"
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import BigNumber from "bignumber.js"

import { SettleOrder } from "@/types/order"

import {
  triggerUpdateMyFilledOrders,
  triggerUpdateMySettledOrders,
} from "./use-my-orders"
import { triggerUpdateFilledOrdersEvents } from "./use-order-events"
import { useSignAndExecute } from "./use-sign-and-execute"

export const useSettleOrder = () => {
  const client = useSuiClient()
  const account = useCurrentAccount()

  const signAndExecute = useSignAndExecute()

  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settleOrderParams: SettleOrder) => {
      if (!account) return
      const txb = new Transaction()

      const amount = settleOrderParams.finalCoin.amount
        .shiftedBy(settleOrderParams.finalCoin.exponent || 0)
        .integerValue(BigNumber.ROUND_CEIL)
        .toString()

      const coin =
        settleOrderParams.finalCoin.coinType === SUI_COIN_TYPE
          ? txb.splitCoins(txb.gas, [amount])
          : await (async () => {
              const coins = await client.getCoins({
                owner: account.address,
                coinType: settleOrderParams.finalCoin.coinType,
              })
              const found = coins.data.find(
                (c) => BigInt(c.balance) >= BigInt(amount)
              )
              if (found)
                return txb.splitCoins(txb.object(found.coinObjectId), [amount])
              txb.mergeCoins(
                coins.data[0].coinObjectId,
                coins.data.slice(1).map((c) => c.coinObjectId)
              )
              return txb.splitCoins(txb.object(coins.data[0].coinObjectId), [
                amount,
              ])
            })()

      const finalCoin = txb.moveCall({
        target: `${settleOrderParams.market.packageId}::zeno::settle_order`,
        arguments: [
          txb.object(settleOrderParams.market.marketId),
          txb.pure.id(settleOrderParams.filledOrderId),
          coin,
          txb.object("0x6"),
        ],
        typeArguments: [
          settleOrderParams.collateralCoinType,
          settleOrderParams.finalCoin.coinType,
        ],
      })

      txb.transferObjects([finalCoin], account.address)

      const tx = await signAndExecute.mutateAsync({
        transaction: txb,
      })

      await triggerUpdateMyFilledOrders(
        queryClient,
        settleOrderParams.market.id
      )

      return tx
    },
  })
}
