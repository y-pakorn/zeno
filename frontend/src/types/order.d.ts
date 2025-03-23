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
    ticker: string
    exponent: number
    coinType: string
    amount: BigNumber
    filledAmount: BigNumber
  }
  rate: BigNumber
}

export type FilledOrder = {
  id: string
  maker: string
  taker: string
  type: "buy" | "sell"
  collateral: {
    ticker: string
    icon: string
    exponent: number
    coinType: string
    amount: BigNumber
  }
  rate: BigNumber
  // createdAt: Date
  filledAt: Date
}

export type SettledOrder = {
  id: string
  claimer: string
  balance: {
    ticker: string
    icon: string
    exponent: number
    amount: BigNumber
  }
  settledAt: Date
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

export type CancelOrder = {
  market: Market
  orderId: string
  coinType: string
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
  is_buy: boolean
  maker: string
  taker: string
}

export type OrderCancelledEvent = {
  market_id: string
  order_id: string
}
