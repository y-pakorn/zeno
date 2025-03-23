import { SuiEvent } from "@mysten/sui/client"
import BigNumber from "bignumber.js"

import { Collateral, PreMarket } from "@/types/market"
import {
  FilledOrder,
  OpenOrder,
  OpenOrderEvent,
  OrderFilledEvent,
  SettledOrder,
} from "@/types/order"

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

// export function parseOpenOrderEvent(
//   event: SuiEvent,
//   market: PreMarket
// ): OpenOrder {
//   const eventData = event.parsedJson as OpenOrderEvent
//   const coinType = eventData.collateral_type.name.replace(/^0+/, "0x")
//   const collateral = market.collaterals.find((c) => c.coinType === coinType)!
//   return {
//     id: eventData.order_id,
//     by: event.sender,
//     createdAt: new Date(parseInt(event.timestampMs!)),
//     fillType: eventData.can_partially_fill ? "partial" : "full",
//     type: eventData.is_buy ? "buy" : "sell",
//     collateral: {
//       coinType,
//       icon: collateral.icon,
//       ticker: collateral.ticker,
//       exponent: collateral.exponent,
//       amount: new BigNumber(eventData.collateral_amount).shiftedBy(
//         -collateral.exponent
//       ),
//       filledAmount: new BigNumber(0),
//     },
//     rate: new BigNumber(eventData.rate).shiftedBy(-9),
//   }
// }

// export function parseFilledOrderEvent(
//   event: SuiEvent,
//   market: PreMarket
// ): FilledOrder {
//   const eventData = event.parsedJson as OrderFilledEvent
//   const coinType = eventData.collateral_type.name.replace(/^0+/, "0x")
//   const collateral = market.collaterals.find((c) => c.coinType === coinType)!
//   return {
//     id: eventData.order_id,
//     maker: eventData.,
//     taker: eventData.taker,
//     type: eventData.is_buy ? "buy" : "sell",
//     collateral: {
//       coinType,
//       icon: collateral.icon,
//       ticker: collateral.ticker,
//   }
// }
