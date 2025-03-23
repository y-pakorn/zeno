import { SUI_COIN_TYPE } from "@/constants"
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import _ from "lodash"

import { FillOrder } from "@/types/order"

import { triggerUpdateMyFilledOrders } from "./use-my-orders"
import { triggerUpdateFilledOrders } from "./use-open-orders"
import { useSignAndExecute } from "./use-sign-and-execute"

export const useFillOrder = () => {
  const client = useSuiClient()
  const account = useCurrentAccount()

  const signAndExecute = useSignAndExecute()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (fillOrderParams: FillOrder) => {
      if (!account) return
      const txb = new Transaction()

      // check if all orders have the same collateral type
      const collateralType = fillOrderParams.orders[0].collateral.coinType
      if (
        !fillOrderParams.orders.every(
          (o) => o.collateral.coinType === collateralType
        )
      ) {
        throw new Error("All orders must have the same collateral type")
      }
      const coin =
        collateralType === SUI_COIN_TYPE
          ? txb.gas
          : await (async () => {
              const coins = await client.getCoins({
                owner: account.address,
                coinType: collateralType,
              })
              txb.mergeCoins(
                coins.data[0].coinObjectId,
                coins.data.slice(1).map((c) => c.coinObjectId)
              )
              return txb.object(coins.data[0].coinObjectId)
            })()

      for (const order of fillOrderParams.orders) {
        const amount = order.collateral.amount
          .shiftedBy(order.collateral.exponent || 0)
          .integerValue(BigNumber.ROUND_CEIL)
          .toString()
        const collateral = txb.splitCoins(coin, [txb.pure.u64(amount)])
        txb.moveCall({
          target: `${fillOrderParams.market.packageId}::zeno::fill_order`,
          arguments: [
            txb.object(fillOrderParams.market.marketId),
            txb.object(fillOrderParams.market.orderOwnerTableId),
            txb.pure.id(order.orderId),
            collateral,
            txb.object("0x6"),
          ],
          typeArguments: [collateralType],
        })
      }

      const tx = await signAndExecute.mutateAsync({
        transaction: txb,
      })

      await triggerUpdateFilledOrders(queryClient, fillOrderParams.market.id)
      await triggerUpdateMyFilledOrders(queryClient, fillOrderParams.market.id)

      return tx
    },
  })
}
