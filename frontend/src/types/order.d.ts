import BigNumber from "bignumber.js"

export type Order = {
  id: string
  createdAt: string
  fillType: "partial" | "full"
  type: "buy" | "sell"
  collateral: string
  price: number
}

export type OpenOrder = {
  id: string
  by: string
  createdAt: Date
  fillType: "partial" | "full"
  type: "buy" | "sell"
  collateral: {
    icon: string
    exponent: number
    coinType: string
    amount: BigNumber
    filledAmount: BigNumber
  }
  rate: BigNumber
}

export type Offer = OpenOrder & {
  price: BigNumber
  amount: BigNumber
}

export type CreateOrder = {
  market: Market
  type: "buy" | "sell"
  fillType?: "partial" | "full"
  rate: BigNumber
  collateral: {
    coinType: string
    amount: BigNumber
    exponent?: number
  }
}

export type FillOrder = {
  market: Market
  orders: {
    orderId: string
    collateral: {
      coinType: string
      amount: BigNumber
      exponent?: number
    }
  }[]
}

export type OpenOrderEvent = {
  can_partially_fill: boolean
  collateral_amount: string
  collateral_type: {
    name: string
  }
  is_buy: boolean
  market_id: string
  order_id: string
  rate: string
}

export type OrderFilledEvent = {
  market_id: string
  order_id: string
  filled_order_id: string
  rate: string
  maker_collateral_amount_left: string
  collateral_amount: string
  collateral_type: {
    name: string
  }
}
