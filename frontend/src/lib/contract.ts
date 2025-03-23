import BigNumber from "bignumber.js"

import { Collateral } from "@/types/market"
import { FilledOrder, OpenOrder, SettledOrder } from "@/types/order"

export function parseOpenOrder(
  object: any,
  collaterals: Collateral[]
): OpenOrder {
  const data = object.data?.content as any
  const orderData = data.fields.value.fields
  const collateralType = data.fields.value.type.match(/<(.+)>/)[1]
  const collateral = collaterals.find((c) => c.coinType === collateralType)

  if (!collateral) {
    throw new Error(`Collateral not found: ${collateralType}`)
  }

  const rate = new BigNumber(orderData.rate).shiftedBy(-9)
  const collateralAmount = new BigNumber(orderData.collateral).shiftedBy(
    -collateral.exponent
  )
  const filledAmount = new BigNumber(orderData.filled_collateral).shiftedBy(
    -collateral.exponent
  )

  return {
    id: orderData.id.id,
    createdAt: new Date(parseInt(orderData.created_at)),
    collateral: {
      coinType: collateralType,
      icon: collateral.icon,
      ticker: collateral.ticker,
      exponent: collateral.exponent,
      amount: collateralAmount,
      filledAmount,
    },
    fillType: orderData.can_partially_fill ? "partial" : "full",
    type: orderData.is_buy ? "buy" : "sell",
    rate,
    by: orderData.by,
  } satisfies OpenOrder
}

export function parseFilledOrder(
  object: any,
  collaterals: Collateral[]
): FilledOrder {
  const data = object.data?.content as any
  const filledOrderData = data.fields.value.fields
  const collateralType = data.fields.value.type.match(/<(.+)>/)[1]
  const collateral = collaterals.find((c) => c.coinType === collateralType)

  if (!collateral) {
    throw new Error(`Collateral not found: ${collateralType}`)
  }

  const rate = new BigNumber(filledOrderData.rate).shiftedBy(-9)
  const collateralAmount = new BigNumber(
    filledOrderData.maker_collateral
  ).shiftedBy(-collateral.exponent)

  return {
    id: filledOrderData.id.id,
    maker: filledOrderData.maker,
    taker: filledOrderData.taker,
    type: filledOrderData.is_buy ? "buy" : "sell",
    collateral: {
      icon: collateral.icon,
      ticker: collateral.ticker,
      exponent: collateral.exponent,
      coinType: collateralType,
      amount: collateralAmount,
    },
    rate,
    createdAt: new Date(parseInt(filledOrderData.created_at)),
    filledAt: new Date(parseInt(filledOrderData.filled_at)),
  } satisfies FilledOrder
}

export function parseSettledOrder(
  object: any,
  token: {
    icon: string
    ticker: string
    exponent: number
  }
): SettledOrder {
  const data = object.data?.content as any
  const settledOrderData = data.fields.value.fields

  return {
    id: settledOrderData.id.id,
    claimer: settledOrderData.claimer,
    balance: {
      ticker: token.ticker,
      icon: token.icon,
      exponent: token.exponent,
      amount: new BigNumber(settledOrderData.balance).shiftedBy(
        -token.exponent
      ),
    },
    settledAt: new Date(parseInt(settledOrderData.settled_at)),
  } satisfies SettledOrder
}
